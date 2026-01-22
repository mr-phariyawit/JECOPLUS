import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Configuration Validation
 * Validates required configuration for production
 */

/**
 * Validate production configuration
 * Only validates in production mode - skips in development
 */
export const validateProductionConfig = () => {
  if (config.env === 'production') {
    const required = [
      'jwt.accessSecret',
      'jwt.refreshSecret',
      'firebase.projectId',
      'firebase.privateKey',
      'firebase.clientEmail',
    ];

    const missing = [];

    for (const key of required) {
      const value = key.split('.').reduce((obj, k) => obj?.[k], config);
      if (!value) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
    }

    logger.info('Production configuration validated');
  } else {
    // In development, just log a warning if critical configs are missing
    if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
      logger.warn('JWT secrets not configured - authentication may not work');
    }
    logger.debug('Skipping production validation (development mode)');
  }
};

/**
 * Validate JWT secrets
 * Only validates in production - warns in development
 */
export const validateJWTSecrets = () => {
  if (config.env === 'production') {
    if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
      throw new Error('JWT secrets are required in production');
    }

    // Check if secrets are strong enough (at least 32 characters)
    if (config.jwt.accessSecret.length < 32) {
      logger.warn('JWT access secret is too short (recommended: 32+ characters)');
    }

    if (config.jwt.refreshSecret.length < 32) {
      logger.warn('JWT refresh secret is too short (recommended: 32+ characters)');
    }

    logger.info('JWT secrets validated');
  } else {
    // In development, just warn
    if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
      logger.warn('JWT secrets not configured - authentication may not work');
    } else {
      logger.debug('JWT secrets present (development mode)');
    }
  }
};

/**
 * Validate AI configuration
 */
export const validateAIConfig = () => {
  const hasVertexAI = !!config.ai?.vertexAI?.projectId;
  const hasClaude = !!config.ai?.claude?.apiKey;
  const hasGemini = !!config.ai?.gemini?.apiKey;

  if (!hasVertexAI && !hasClaude && !hasGemini) {
    logger.warn('No AI providers configured. AI features will not work.');
    return false;
  }

  logger.info('AI configuration validated', {
    vertexAI: hasVertexAI,
    claude: hasClaude,
    gemini: hasGemini,
  });

  return true;
};

/**
 * Validate database configuration
 */
export const validateDatabaseConfig = () => {
  if (!config.db.host || !config.db.name || !config.db.user) {
    throw new Error('Database configuration is incomplete');
  }

  logger.info('Database configuration validated');
};

/**
 * Validate all configuration
 */
export const validateAll = () => {
  try {
    validateProductionConfig();
    validateJWTSecrets();
    validateAIConfig();
    validateDatabaseConfig();
    logger.info('All configuration validated successfully');
    return true;
  } catch (error) {
    logger.error('Configuration validation failed:', error);
    return false;
  }
};

export default {
  validateProductionConfig,
  validateJWTSecrets,
  validateAIConfig,
  validateDatabaseConfig,
  validateAll,
};
