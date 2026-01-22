import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { adminRateLimiter } from '../middleware/rateLimiter.js';
import { validate, adminSchemas } from '../middleware/validator.js';
import { requireRole, requirePermission, attachPermissions } from '../middleware/rbac.js';

const router = Router();

/**
 * @route   POST /api/v1/admin/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post(
  '/auth/login',
  adminRateLimiter,
  validate(adminSchemas.login),
  adminController.login
);

// All routes below require admin authentication
router.use(authenticate, requireAdmin, attachPermissions, adminRateLimiter);

// =====================================================
// DASHBOARD
// =====================================================

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

// =====================================================
// USER MANAGEMENT
// =====================================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    List users with filters
 * @access  Admin
 */
router.get(
  '/users',
  validate(adminSchemas.listUsers, 'query'),
  adminController.listUsers
);

/**
 * @route   GET /api/v1/admin/users/:userId
 * @desc    Get user details
 * @access  Admin
 */
router.get('/users/:userId', adminController.getUserDetail);

/**
 * @route   PATCH /api/v1/admin/users/:userId/status
 * @desc    Update user status
 * @access  Admin
 */
router.patch(
  '/users/:userId/status',
  validate(adminSchemas.updateUserStatus),
  adminController.updateUserStatus
);

// =====================================================
// KYC MANAGEMENT
// =====================================================

/**
 * @route   GET /api/v1/admin/kyc/pending
 * @desc    List pending KYC requests
 * @access  Admin
 */
router.get('/kyc/pending', adminController.listPendingKyc);

/**
 * @route   GET /api/v1/admin/kyc/:sessionId
 * @desc    Get KYC session details for review
 * @access  Admin
 */
router.get('/kyc/:sessionId', adminController.getKycDetail);

/**
 * @route   POST /api/v1/admin/kyc/:sessionId/approve
 * @desc    Approve KYC
 * @access  Admin
 */
router.post(
  '/kyc/:sessionId/approve',
  requirePermission('kyc:approve'),
  validate(adminSchemas.kycApprove),
  adminController.approveKyc
);

/**
 * @route   POST /api/v1/admin/kyc/:sessionId/reject
 * @desc    Reject KYC
 * @access  Admin
 */
router.post(
  '/kyc/:sessionId/reject',
  requirePermission('kyc:reject'),
  validate(adminSchemas.kycReject),
  adminController.rejectKyc
);

// =====================================================
// LOAN MANAGEMENT
// =====================================================

/**
 * @route   GET /api/v1/admin/loans
 * @desc    List loan applications with filters
 * @access  Admin
 */
router.get(
  '/loans',
  validate(adminSchemas.listLoans, 'query'),
  adminController.listLoans
);

/**
 * @route   GET /api/v1/admin/loans/:loanId
 * @desc    Get loan application details
 * @access  Admin
 */
router.get('/loans/:loanId', adminController.getLoanDetail);

/**
 * @route   POST /api/v1/admin/loans/:loanId/approve
 * @desc    Approve loan application
 * @access  Admin
 */
router.post(
  '/loans/:loanId/approve',
  requirePermission('loans:approve'),
  validate(adminSchemas.loanApprove),
  adminController.approveLoan
);

/**
 * @route   POST /api/v1/admin/loans/:loanId/reject
 * @desc    Reject loan application
 * @access  Admin
 */
router.post(
  '/loans/:loanId/reject',
  requirePermission('loans:reject'),
  validate(adminSchemas.loanReject),
  adminController.rejectLoan
);

// =====================================================
// ACTIVITY LOGS
// =====================================================

/**
 * @route   GET /api/v1/admin/activity-logs
 * @desc    Get admin activity logs
 * @access  Admin
 */
router.get('/activity-logs', adminController.getActivityLogs);

export default router;
