import csrf from 'csurf';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Enhanced CSRF Protection Middleware
 * Uses csurf library with cookie-based tokens
 */

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: config.env === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  },
});

/**
 * CSRF protection middleware
 * Apply to routes that modify state (POST, PUT, DELETE, PATCH)
 */
export const csrfProtect = (req, res, next) => {
  // Skip CSRF in development if configured
  if (config.env !== 'production' && process.env.SKIP_CSRF === 'true') {
    logger.warn('CSRF protection skipped (development mode)');
    return next();
  }

  // Skip for health checks and public endpoints
  if (req.path === '/health' || req.path === '/api/v1/health') {
    return next();
  }

  // Apply CSRF protection
  csrfProtection(req, res, (err) => {
    if (err) {
      logger.warn('CSRF validation failed:', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(403).json({
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_ERROR',
      });
    }
    next();
  });
};

/**
 * Get CSRF token endpoint
 * Call this first to get the CSRF token
 */
export const getCSRFToken = (req, res) => {
  res.json({
    success: true,
    data: {
      csrfToken: req.csrfToken(),
    },
  });
};

/**
 * Conditional CSRF - only apply to state-changing methods
 */
export const conditionalCSRF = (req, res, next) => {
  // Only protect state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (stateChangingMethods.includes(req.method)) {
    return csrfProtect(req, res, next);
  }
  
  // For GET, OPTIONS, HEAD - just generate token but don't validate
  return next();
};

export default {
  csrfProtect,
  getCSRFToken,
  conditionalCSRF,
};
