import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { close as closeDB, healthCheck } from './config/database.js';
import jobScheduler from './jobs/scheduler.js';

import { validateProductionConfig, validateJWTSecrets, validateSecurityConfig } from './config/validate.js';

const PORT = config.port;

// Validate configuration
try {
  validateProductionConfig();
  validateJWTSecrets();
  validateSecurityConfig();
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`API URL: ${config.apiUrl}`);

  // Check database connection
  const dbHealth = await healthCheck();
  if (dbHealth.status === 'healthy') {
    logger.info('Database connected successfully');
  } else {
    logger.error('Database connection failed:', dbHealth.error);
  }

  // Start scheduled jobs (only in non-test environments)
  if (process.env.NODE_ENV !== 'test') {
    try {
      jobScheduler.start();
      logger.info('Job scheduler started');
    } catch (error) {
      logger.error('Failed to start job scheduler:', error);
    }
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server close:', err);
      process.exit(1);
    }

    try {
      // Stop scheduled jobs
      if (jobScheduler.isRunning) {
        jobScheduler.stop();
      }

      // Close database connections
      await closeDB();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

export default server;
