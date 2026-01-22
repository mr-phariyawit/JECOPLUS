import { query } from '../config/database.js';
import embeddingService from '../services/embeddingService.js';
import logger from '../utils/logger.js';

/**
 * RAG Pipeline Job
 * Handles ETL (Extract, Transform, Load) for vector embeddings
 */
class RAGPipelineJob {
  /**
   * Full sync - Process all entities of a type
   * @param {string} entityType - Entity type ('product', 'loan', 'user_profile', 'transaction')
   * @param {object} options - Options
   */
  async fullSync(entityType, options = {}) {
    const jobId = await this.createJob('full_sync', entityType);

    try {
      await this.updateJobStatus(jobId, 'running');

      let recordsProcessed = 0;
      let errorsCount = 0;

      // Get all entities based on type
      const entities = await this.getEntities(entityType);

      await this.updateJobProgress(jobId, 0, entities.length);

      logger.info(`Starting full sync for ${entityType}: ${entities.length} entities`);

      for (const entity of entities) {
        try {
          await this.processEntity(entityType, entity);
          recordsProcessed++;
        } catch (error) {
          logger.error(`Error processing entity ${entity.id}:`, error);
          errorsCount++;
        }

        // Update progress every 10 records
        if (recordsProcessed % 10 === 0) {
          await this.updateJobProgress(jobId, recordsProcessed, entities.length);
          logger.debug(`Progress: ${recordsProcessed}/${entities.length} processed`);
        }
      }

      await this.updateJobStatus(jobId, 'completed', {
        recordsProcessed,
        recordsTotal: entities.length,
        errorsCount,
      });

      logger.info(`Full sync completed for ${entityType}: ${recordsProcessed}/${entities.length} records`);
    } catch (error) {
      logger.error(`Full sync error for ${entityType}:`, error);
      await this.updateJobStatus(jobId, 'failed', { errorMessage: error.message });
      throw error;
    }
  }

  /**
   * Process single entity - generate and store embeddings
   * @param {string} entityType - Entity type
   * @param {object} entity - Entity data
   */
  async processEntity(entityType, entity) {
    // Delete existing embeddings for this entity
    await embeddingService.deleteEmbeddings(entityType, entity.id);

    // Generate chunks based on entity type
    const chunks = this.generateChunks(entityType, entity);

    // Process each chunk
    for (const chunk of chunks) {
      try {
        const embedding = await embeddingService.generateEmbedding(chunk.text, {
          taskType: 'RETRIEVAL_DOCUMENT',
        });

        await embeddingService.storeEmbedding(
          entityType,
          entity.id,
          chunk.text,
          embedding,
          {
            ...chunk.metadata,
            source_table: this.getSourceTable(entityType),
          }
        );
      } catch (error) {
        logger.error(`Error processing chunk for entity ${entity.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Generate text chunks from entity data
   * @param {string} entityType - Entity type
   * @param {object} entity - Entity data
   * @returns {Array<object>} Array of chunks with text and metadata
   */
  generateChunks(entityType, entity) {
    const chunks = [];

    switch (entityType) {
      case 'product':
        const productText = `Product: ${entity.name || 'Unnamed'}. ${entity.description || ''}. Price: ${entity.price || 0} THB.`;
        chunks.push({
          text: productText,
          metadata: {
            product_id: entity.id,
            category: entity.category_id || null,
            price: entity.price || null,
            status: entity.status || null,
          },
        });
        break;

      case 'loan':
        const loanText = `Loan Product: ${entity.name || 'Unnamed'}. Amount range: ${entity.min_amount || 0}-${entity.max_amount || 0} THB. APR: ${entity.min_apr || 0}-${entity.max_apr || 0}%. Provider: ${entity.provider || 'Unknown'}.`;
        chunks.push({
          text: loanText,
          metadata: {
            loan_id: entity.id,
            provider: entity.provider || null,
            min_amount: entity.min_amount || null,
            max_amount: entity.max_amount || null,
            min_apr: entity.min_apr || null,
            max_apr: entity.max_apr || null,
          },
        });
        break;

      case 'user_profile':
        // Only include non-sensitive data
        const profileText = `User Profile: Monthly income ${entity.income || 'not set'} THB. Monthly expenses: ${entity.expenses || 'not set'} THB.`;
        chunks.push({
          text: profileText,
          metadata: {
            user_id: entity.id,
            has_income: !!entity.income,
            has_expenses: !!entity.expenses,
          },
        });
        break;

      case 'transaction':
        const txText = `Transaction: ${entity.type || 'Unknown'} of ${entity.amount || 0} THB on ${entity.created_at || 'unknown date'}.`;
        chunks.push({
          text: txText,
          metadata: {
            transaction_id: entity.id,
            wallet_id: entity.wallet_id || null,
            type: entity.type || null,
            amount: entity.amount || null,
          },
        });
        break;

      default:
        logger.warn(`Unknown entity type: ${entityType}`);
    }

    return chunks;
  }

  /**
   * Get entities from database
   * @param {string} entityType - Entity type
   * @returns {Promise<Array>} Array of entities
   */
  async getEntities(entityType) {
    let queryText = '';

    switch (entityType) {
      case 'product':
        queryText = `SELECT id, name, description, price, category_id, status FROM products WHERE status = 'active'`;
        break;
      case 'loan':
        queryText = `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider FROM loan_products WHERE status = 'active'`;
        break;
      case 'user_profile':
        queryText = `SELECT id, income, expenses FROM users WHERE kyc_status = 'verified'`;
        break;
      case 'transaction':
        queryText = `SELECT id, type, amount, wallet_id, created_at FROM transactions WHERE status = 'COMPLETED' ORDER BY created_at DESC LIMIT 10000`;
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    const result = await query(queryText);
    return result.rows;
  }

  /**
   * Get source table name for entity type
   * @private
   */
  getSourceTable(entityType) {
    const tableMap = {
      product: 'products',
      loan: 'loan_products',
      user_profile: 'users',
      transaction: 'transactions',
    };
    return tableMap[entityType] || null;
  }

  /**
   * Create pipeline job record
   * @private
   */
  async createJob(jobType, entityType) {
    const result = await query(
      `INSERT INTO pipeline_jobs (job_type, entity_type, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [jobType, entityType]
    );
    return result.rows[0].id;
  }

  /**
   * Update job status
   * @private
   */
  async updateJobStatus(jobId, status, data = {}) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    updates.push(`status = $${paramIndex++}`);
    params.push(status);

    if (status === 'running') {
      updates.push(`started_at = NOW()`);
    }

    if (status === 'completed' || status === 'failed') {
      updates.push(`completed_at = NOW()`);
    }

    if (data.recordsProcessed !== undefined) {
      updates.push(`records_processed = $${paramIndex++}`);
      params.push(data.recordsProcessed);
    }

    if (data.recordsTotal !== undefined) {
      updates.push(`records_total = $${paramIndex++}`);
      params.push(data.recordsTotal);
    }

    if (data.errorsCount !== undefined) {
      updates.push(`errors_count = $${paramIndex++}`);
      params.push(data.errorsCount);
    }

    if (data.errorMessage) {
      updates.push(`error_message = $${paramIndex++}`);
      params.push(data.errorMessage);
    }

    if (data.metadata) {
      updates.push(`metadata = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.metadata));
    }

    updates.push(`id = $${paramIndex++}`);
    params.push(jobId);

    await query(
      `UPDATE pipeline_jobs SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
  }

  /**
   * Update job progress
   * @private
   */
  async updateJobProgress(jobId, processed, total) {
    await query(
      `UPDATE pipeline_jobs
       SET records_processed = $1, records_total = $2
       WHERE id = $3`,
      [processed, total, jobId]
    );
  }

  /**
   * Get job status
   * @param {string} jobId - Job ID
   * @returns {Promise<object>} Job status
   */
  async getJobStatus(jobId) {
    const result = await query(
      `SELECT * FROM pipeline_jobs WHERE id = $1`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get recent jobs
   * @param {object} options - Options (limit, entityType)
   * @returns {Promise<Array>} Recent jobs
   */
  async getRecentJobs(options = {}) {
    const { limit = 10, entityType = null } = options;
    let queryText = `SELECT * FROM pipeline_jobs`;
    const params = [];
    let paramIndex = 1;

    if (entityType) {
      queryText += ` WHERE entity_type = $${paramIndex++}`;
      params.push(entityType);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows;
  }
}

export default new RAGPipelineJob();
