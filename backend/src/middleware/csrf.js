import crypto from 'crypto';
import { ApiError } from '../utils/errors.js';

/**
 * CSRF Protection Middleware
 * Uses double-submit cookie pattern for SPA compatibility
 *
 * How it works:
 * 1. Server generates a random token and sets it as a cookie
 * 2. Client reads token from cookie and sends it in X-CSRF-Token header
 * 3. Server validates that cookie token matches header token
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
const generateToken = () => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
};

/**
 * Middleware to generate and set CSRF token cookie
 * Call this on login or session creation
 */
export const setCSRFToken = (req, res, next) => {
  const token = generateToken();

  // Set secure cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Also send in response body for convenience
  req.csrfToken = token;

  next();
};

/**
 * Middleware to validate CSRF token
 * Use this on all state-changing operations (POST, PUT, PATCH, DELETE)
 */
export const validateCSRFToken = (req, res, next) => {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // Get token from header
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // Both tokens must exist
  if (!cookieToken || !headerToken) {
    throw new ApiError(403, 'CSRF token missing');
  }

  // Tokens must match (constant-time comparison to prevent timing attacks)
  if (!constantTimeCompare(cookieToken, headerToken)) {
    throw new ApiError(403, 'Invalid CSRF token');
  }

  next();
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
const constantTimeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Middleware to provide CSRF token to client
 * Use this on routes that need to retrieve the token
 */
export const getCSRFToken = (req, res) => {
  // Generate new token if doesn't exist
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ csrfToken: token });
  }

  // Return existing token
  res.json({ csrfToken: req.cookies[CSRF_COOKIE_NAME] });
};

/**
 * Development/Testing: Skip CSRF validation
 * ONLY use in development mode
 */
export const skipCSRFValidation = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && process.env.SKIP_CSRF === 'true') {
    console.warn('⚠️  CSRF validation skipped (development mode)');
    return next();
  }
  return validateCSRFToken(req, res, next);
};
