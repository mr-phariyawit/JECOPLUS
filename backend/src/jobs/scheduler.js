import cron from 'node-cron';
import ragPipelineJob from './ragPipelineJob.js';
import logger from '../utils/logger.js';

/**
 * Job Scheduler
 * Manages scheduled ETL jobs for RAG pipeline
 */
class JobScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    // Full sync - Daily at 2 AM
    const fullSyncJob = cron.schedule('0 2 * * *', async () => {
      logger.info('Starting daily RAG pipeline full sync');
      try {
        await ragPipelineJob.fullSync('product');
        await ragPipelineJob.fullSync('loan');
        logger.info('Daily RAG pipeline sync completed');
      } catch (error) {
        logger.error('Daily RAG pipeline sync failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok',
    });

    // Incremental sync - Every 6 hours
    const incrementalJob = cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting incremental RAG pipeline sync');
      try {
        // TODO: Implement incremental sync logic
        // For now, just sync products and loans
        await ragPipelineJob.fullSync('product');
        await ragPipelineJob.fullSync('loan');
        logger.info('Incremental RAG pipeline sync completed');
      } catch (error) {
        logger.error('Incremental RAG pipeline sync failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok',
    });

    // Cache cleanup - Daily at 3 AM
    const cacheCleanupJob = cron.schedule('0 3 * * *', async () => {
      logger.info('Starting cache cleanup');
      try {
        const { query } = await import('../config/database.js');
        await query('SELECT cleanup_expired_cache()');
        logger.info('Cache cleanup completed');
      } catch (error) {
        logger.error('Cache cleanup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Bangkok',
    });

    // Store job references
    this.jobs = [fullSyncJob, incrementalJob, cacheCleanupJob];

    // Start all jobs
    this.jobs.forEach(job => job.start());
    this.isRunning = true;

    logger.info('RAG pipeline scheduler started', {
      jobs: this.jobs.length,
      timezone: 'Asia/Bangkok',
    });
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;

    logger.info('RAG pipeline scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.length,
    };
  }
}

export default new JobScheduler();
