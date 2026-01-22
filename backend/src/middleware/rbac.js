import { Forbidden } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * RBAC Middleware
 * Role-Based Access Control for admin routes
 */

// Permission definitions by role
const PERMISSIONS = {
  SUPER_ADMIN: [
    // Users
    'users:read',
    'users:update',
    'users:delete',
    'users:ban',

    // KYC
    'kyc:read',
    'kyc:approve',
    'kyc:reject',

    // Loans
    'loans:read',
    'loans:approve',
    'loans:reject',

    // Wallet
    'wallet:read',
    'wallet:adjust',

    // Admin Management
    'admins:create',
    'admins:update',
    'admins:delete',

    // System
    'system:read',
    'system:configure',
    'logs:read',
  ],

  ADMIN: [
    // Users (limited)
    'users:read',
    'users:update',

    // KYC
    'kyc:read',
    'kyc:approve',
    'kyc:reject',

    // Loans
    'loans:read',
    'loans:approve',
    'loans:reject',

    // Wallet (read-only)
    'wallet:read',

    // Logs (read-only)
    'logs:read',
  ],

  USER: [],
};

/**
 * Check if user has required role(s)
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @returns {Function} Express middleware
 */
export const requireRole = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user) {
      logger.warn('RBAC: No user in request');
      return next(Forbidden('Authentication required'));
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      logger.warn(`RBAC: User ${req.user.id} with role ${userRole} attempted to access route requiring ${roles.join(' or ')}`);
      return next(Forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @returns {Function} Express middleware
 */
export const requirePermission = (requiredPermissions) => {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (req, res, next) => {
    if (!req.user) {
      logger.warn('RBAC: No user in request');
      return next(Forbidden('Authentication required'));
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Check if user has ALL required permissions
    const hasAllPermissions = permissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn(`RBAC: User ${req.user.id} with role ${userRole} lacks permissions: ${permissions.join(', ')}`);
      return next(Forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has ANY of the required permissions
 * @param {string[]} requiredPermissions - Array of permissions
 * @returns {Function} Express middleware
 */
export const requireAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('RBAC: No user in request');
      return next(Forbidden('Authentication required'));
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Check if user has ANY of the required permissions
    const hasAnyPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAnyPermission) {
      logger.warn(`RBAC: User ${req.user.id} with role ${userRole} lacks any of permissions: ${requiredPermissions.join(', ')}`);
      return next(Forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Get user permissions
 * @param {string} role - User role
 * @returns {string[]} Array of permissions
 */
export const getUserPermissions = (role) => {
  return PERMISSIONS[role] || [];
};

/**
 * Check if role has permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
export const hasPermission = (role, permission) => {
  const permissions = PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Middleware to attach permissions to request
 */
export const attachPermissions = (req, res, next) => {
  if (req.user && req.user.role) {
    req.permissions = getUserPermissions(req.user.role);
  }
  next();
};

export default {
  requireRole,
  requirePermission,
  requireAnyPermission,
  getUserPermissions,
  hasPermission,
  attachPermissions,
  PERMISSIONS,
};
