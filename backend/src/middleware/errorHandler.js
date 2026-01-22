import logger from '../utils/logger.js';
import { ApiError, NotFound } from '../utils/errors.js';

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
  next(NotFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Joi validation errors
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details?.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  } else if (err.code === '23505') {
    // PostgreSQL unique violation
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    statusCode = 400;
    code = 'INVALID_REFERENCE';
    message = 'Referenced resource does not exist';
  }

  // Log error
  const logData = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message,
    stack: err.stack,
    userId: req.user?.id,
  };

  if (statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else if (statusCode >= 400) {
    logger.warn('Client Error:', logData);
  }

  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
    details = null;
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    requestId: req.id,
  });
};

export default { notFoundHandler, errorHandler };
