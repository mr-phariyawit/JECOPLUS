import { Router } from 'express';
import multer from 'multer';
import * as kycController from '../controllers/kycController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { validate, kycSchemas } from '../middleware/validator.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and MP4, WebM videos are allowed.'));
    }
  },
});

// All KYC routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/kyc/sessions
 * @desc    Start new KYC session
 * @access  Protected
 */
router.post(
  '/sessions',
  validate(kycSchemas.createSession),
  kycController.createSession
);

/**
 * @route   GET /api/v1/kyc/sessions/:sessionId
 * @desc    Get KYC session status
 * @access  Protected
 */
router.get(
  '/sessions/:sessionId',
  kycController.getSession
);

/**
 * @route   POST /api/v1/kyc/sessions/:sessionId/documents
 * @desc    Upload KYC document
 * @access  Protected
 */
router.post(
  '/sessions/:sessionId/documents',
  uploadRateLimiter,
  upload.single('file'),
  validate(kycSchemas.uploadDocument),
  kycController.uploadDocument
);

/**
 * @route   POST /api/v1/kyc/sessions/:sessionId/liveness
 * @desc    Submit liveness check
 * @access  Protected
 */
router.post(
  '/sessions/:sessionId/liveness',
  uploadRateLimiter,
  upload.single('video'),
  kycController.submitLiveness
);

/**
 * @route   POST /api/v1/kyc/sessions/:sessionId/ndid/initiate
 * @desc    Initiate NDID verification
 * @access  Protected
 */
router.post(
  '/sessions/:sessionId/ndid/initiate',
  validate(kycSchemas.ndidInitiate),
  kycController.initiateNdid
);

/**
 * @route   GET /api/v1/kyc/sessions/:sessionId/ndid/status
 * @desc    Check NDID verification status
 * @access  Protected
 */
router.get(
  '/sessions/:sessionId/ndid/status',
  kycController.getNdidStatus
);

/**
 * @route   POST /api/v1/kyc/sessions/:sessionId/submit
 * @desc    Submit KYC for final review
 * @access  Protected
 */
router.post(
  '/sessions/:sessionId/submit',
  kycController.submitKyc
);

export default router;
