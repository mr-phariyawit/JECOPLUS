import vertexAIService from './vertexAIService.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Embedding Service
 * Handles generation and storage of vector embeddings for RAG pipeline
 */
class EmbeddingService {
  /**
   * Generate embedding for text using Vertex AI
   * @param {string} text - Text to embed
   * @param {object} options - Options (taskType, embeddingModel)
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(text, options = {}) {
    try {
      const embedding = await vertexAIService.generateEmbedding(text, options);
      return embedding;
    } catch (error) {
      logger.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Store embedding in database
   * @param {string} entityType - Type of entity ('product', 'loan', 'user_profile', 'transaction')
   * @param {string} entityId - Entity ID (UUID)
   * @param {string} chunkText - Text chunk that was embedded
   * @param {Array<number>} embedding - Embedding vector
   * @param {object} metadata - Additional metadata
   * @returns {Promise<string>} Embedding ID
   */
  async storeEmbedding(entityType, entityId, chunkText, embedding, metadata = {}) {
    try {
      const result = await query(
        `INSERT INTO embeddings (entity_type, entity_id, chunk_text, embedding, metadata, source_table, source_column)
         VALUES ($1, $2, $3, $4::vector, $5, $6, $7)
         ON CONFLICT (entity_type, entity_id, chunk_text)
         DO UPDATE SET
           embedding = EXCLUDED.embedding,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()
         RETURNING id`,
        [
          entityType,
          entityId,
          chunkText,
          JSON.stringify(embedding),
          JSON.stringify(metadata),
          metadata.source_table || null,
          metadata.source_column || null,
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      logger.error('Error storing embedding:', error);
      throw error;
    }
  }

  /**
   * Vector similarity search
   * @param {string} queryText - Query text to search for
   * @param {object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchSimilar(queryText, options = {}) {
    const {
      entityType = null,
      limit = 5,
      threshold = 0.7,
      userId = null, // For user-specific searches
    } = options;

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(queryText, options);
      const cached = await this.getCachedResults(cacheKey);
      if (cached) {
        logger.debug('Returning cached search results');
        return cached;
      }

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(queryText, {
        taskType: 'RETRIEVAL_QUERY',
      });

      // Build search query
      let searchQuery = `
        SELECT 
          e.id,
          e.entity_type,
          e.entity_id,
          e.chunk_text,
          e.metadata,
          1 - (e.embedding <=> $1::vector) as similarity
        FROM embeddings e
        WHERE 1 - (e.embedding <=> $1::vector) >= $2
      `;

      const params = [JSON.stringify(queryEmbedding), threshold];
      let paramIndex = 3;

      if (entityType) {
        searchQuery += ` AND e.entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      // Add user-specific filtering if needed
      if (userId && entityType === 'user_profile') {
        searchQuery += ` AND e.entity_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      searchQuery += `
        ORDER BY similarity DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const result = await query(searchQuery, params);

      const results = result.rows.map(row => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        text: row.chunk_text,
        metadata: row.metadata,
        similarity: parseFloat(row.similarity),
      }));

      // Cache results
      await this.cacheResults(cacheKey, queryText, results);

      return results;
    } catch (error) {
      logger.error('Vector search error:', error);
      throw error;
    }
  }

  /**
   * Delete embeddings for an entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {Promise<number>} Number of deleted embeddings
   */
  async deleteEmbeddings(entityType, entityId) {
    try {
      const result = await query(
        `DELETE FROM embeddings WHERE entity_type = $1 AND entity_id = $2`,
        [entityType, entityId]
      );
      return result.rowCount;
    } catch (error) {
      logger.error('Error deleting embeddings:', error);
      throw error;
    }
  }

  /**
   * Get cache key for query
   * @private
   */
  getCacheKey(queryText, options) {
    const keyData = JSON.stringify({ queryText, options });
    return crypto.createHash('sha256').update(keyData).digest('hex');
  }

  /**
   * Get cached search results
   * @private
   */
  async getCachedResults(cacheKey) {
    try {
      const result = await query(
        `SELECT results FROM vector_search_cache 
         WHERE query_hash = $1 AND expires_at > NOW()`,
        [cacheKey]
      );

      if (result.rows.length > 0) {
        return result.rows[0].results;
      }
      return null;
    } catch (error) {
      logger.warn('Error getting cached results:', error);
      return null;
    }
  }

  /**
   * Cache search results
   * @private
   */
  async cacheResults(cacheKey, queryText, results, ttlMinutes = 60) {
    try {
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await query(
        `INSERT INTO vector_search_cache (query_hash, query_text, results, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (query_hash)
         DO UPDATE SET results = EXCLUDED.results, expires_at = EXCLUDED.expires_at`,
        [cacheKey, queryText, JSON.stringify(results), expiresAt]
      );
    } catch (error) {
      logger.warn('Error caching results:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Batch generate embeddings
   * @param {Array<string>} texts - Array of texts to embed
   * @param {object} options - Options
   * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
   */
  async batchGenerateEmbeddings(texts, options = {}) {
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text, options);
        embeddings.push(embedding);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation error:', error);
      throw error;
    }
  }
}

export default new EmbeddingService();
