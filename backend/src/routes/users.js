import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, userSchemas } from '../middleware/validator.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/me', userController.getProfile);

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Protected
 */
router.patch(
  '/me',
  validate(userSchemas.updateProfile),
  userController.updateProfile
);

/**
 * @route   GET /api/v1/users/me/kyc-status
 * @desc    Get detailed KYC status
 * @access  Protected
 */
router.get('/me/kyc-status', userController.getKycStatus);

export default router;
