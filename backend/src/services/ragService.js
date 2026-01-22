import embeddingService from './embeddingService.js';
import logger from '../utils/logger.js';

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Retrieves relevant context from vector database for AI responses
 */
class RAGService {
  /**
   * Retrieve relevant context for user query
   * @param {string} userQuery - User's query/question
   * @param {string} userId - User ID (for user-specific filtering)
   * @param {object} options - Options (entityTypes, maxResults, similarityThreshold)
   * @returns {Promise<object>} Context with formatted text
   */
  async retrieveContext(userQuery, userId = null, options = {}) {
    const {
      entityTypes = ['product', 'loan', 'user_profile', 'transaction'],
      maxResults = 5,
      similarityThreshold = 0.7,
    } = options;

    try {
      const allResults = [];

      // Search across all entity types
      for (const entityType of entityTypes) {
        try {
          const results = await embeddingService.searchSimilar(userQuery, {
            entityType,
            limit: maxResults,
            threshold: similarityThreshold,
            userId, // Filter user-specific data
          });

          allResults.push(...results);
        } catch (error) {
          logger.warn(`Error searching ${entityType} embeddings:`, error);
          // Continue with other entity types
        }
      }

      // Sort by similarity and take top results
      allResults.sort((a, b) => b.similarity - a.similarity);
      const topResults = allResults.slice(0, maxResults);

      // Format context for AI prompt
      const context = this.formatContext(topResults);

      logger.info(`RAG retrieved ${topResults.length} relevant contexts for query`, {
        queryLength: userQuery.length,
        entityTypes: entityTypes.length,
      });

      return {
        contexts: topResults,
        formattedContext: context,
        count: topResults.length,
      };
    } catch (error) {
      logger.error('RAG context retrieval error:', error);
      // Return empty context on error (graceful degradation)
      return {
        contexts: [],
        formattedContext: '',
        count: 0,
      };
    }
  }

  /**
   * Format context for AI prompt
   * @param {Array} results - Search results from vector DB
   * @returns {string} Formatted context string
   */
  formatContext(results) {
    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map((result, index) => {
      const metadata = result.metadata || {};
      let context = `[Context ${index + 1}]\n`;
      context += `Type: ${result.entityType}\n`;
      context += `Content: ${result.text}\n`;

      if (Object.keys(metadata).length > 0) {
        // Format metadata nicely
        const metadataStr = Object.entries(metadata)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        context += `Details: ${metadataStr}\n`;
      }

      context += `Relevance: ${(result.similarity * 100).toFixed(1)}%\n`;

      return context;
    });

    return contextParts.join('\n\n');
  }

  /**
   * Build enhanced system prompt with RAG context
   * @param {string} basePrompt - Base system prompt
   * @param {string} context - RAG context
   * @returns {string} Enhanced prompt
   */
  buildEnhancedPrompt(basePrompt, context) {
    if (!context || context.trim() === '') {
      return basePrompt;
    }

    return `${basePrompt}

IMPORTANT: Use the following context to answer the user's question accurately:

${context}

When answering:
- Reference specific data from the context when available
- If context doesn't contain relevant information, say so
- Always prioritize accuracy from the provided context
- Use the context to provide personalized, data-driven responses`;
  }

  /**
   * Retrieve context for specific entity type
   * @param {string} userQuery - User query
   * @param {string} entityType - Entity type to search
   * @param {string} userId - User ID (optional)
   * @param {object} options - Additional options
   * @returns {Promise<object>} Context results
   */
  async retrieveContextForEntity(userQuery, entityType, userId = null, options = {}) {
    return this.retrieveContext(userQuery, userId, {
      entityTypes: [entityType],
      ...options,
    });
  }

  /**
   * Check if RAG is available (embeddings exist)
   * @param {string} entityType - Entity type to check
   * @returns {Promise<boolean>} True if embeddings exist
   */
  async isRAGAvailable(entityType = null) {
    try {
      const { query } = await import('../config/database.js');
      let checkQuery = 'SELECT COUNT(*) as count FROM embeddings';
      const params = [];

      if (entityType) {
        checkQuery += ' WHERE entity_type = $1';
        params.push(entityType);
      }

      const result = await query(checkQuery, params);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      logger.error('Error checking RAG availability:', error);
      return false;
    }
  }
}

export default new RAGService();
