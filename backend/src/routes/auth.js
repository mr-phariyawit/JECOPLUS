import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter.js';
import { validate, authSchemas } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/otp/request
 * @desc    Request OTP for login
 * @access  Public
 */
router.post(
  '/otp/request',
  otpRateLimiter,
  validate(authSchemas.requestOtp),
  authController.requestOtp
);

/**
 * @route   POST /api/v1/auth/otp/verify
 * @desc    Verify OTP and get tokens
 * @access  Public
 */
router.post(
  '/otp/verify',
  authRateLimiter,
  validate(authSchemas.verifyOtp),
  authController.verifyOtp
);

/**
 * @route   POST /api/v1/auth/token/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/token/refresh',
  authRateLimiter,
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout and revoke tokens
 * @access  Protected
 */
router.post(
  '/logout',
  authenticate,
  validate(authSchemas.logout),
  authController.logout
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get active sessions/devices
 * @access  Protected
 */
router.get(
  '/sessions',
  authenticate,
  authController.getSessions
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Protected
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  authController.revokeSession
);

/**
 * @route   POST /api/v1/auth/demo/login
 * @desc    Demo login (bypasses all security - ONLY for presentations)
 * @access  Public
 * WARNING: This should NEVER be enabled in production!
 */
router.post(
  '/demo/login',
  authController.demoLogin
);

export default router;
