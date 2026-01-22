import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { query } from '../config/database.js';
import { Unauthorized, Forbidden, AuthErrors } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Unauthorized('กรุณาเข้าสู่ระบบ', AuthErrors.INVALID_TOKEN);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw Unauthorized('กรุณาเข้าสู่ระบบ', AuthErrors.INVALID_TOKEN);
    }

    // Verify token
    let decoded;
    try {
      // Use public key for RS256 or secret for HS256
      const secret = config.jwt.publicKey || config.jwt.accessSecret;
      const algorithm = config.jwt.publicKey ? 'RS256' : 'HS256';

      decoded = jwt.verify(token, secret, {
        algorithms: [algorithm],
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw Unauthorized('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่', AuthErrors.TOKEN_EXPIRED);
      }
      throw Unauthorized('Token ไม่ถูกต้อง', AuthErrors.INVALID_TOKEN);
    }

    // Get user from database
    const result = await query(
      `SELECT id, phone, first_name, last_name, email, kyc_status, status, role, created_at
       FROM users WHERE id = $1`,
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      throw Unauthorized('ไม่พบผู้ใช้', AuthErrors.INVALID_TOKEN);
    }

    const user = result.rows[0];

    // Check user status
    if (user.status === 'SUSPENDED') {
      throw Forbidden('บัญชีของคุณถูกระงับชั่วคราว', AuthErrors.USER_SUSPENDED);
    }

    if (user.status === 'BANNED') {
      throw Forbidden('บัญชีของคุณถูกระงับถาวร', AuthErrors.USER_BANNED);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      kycStatus: user.kyc_status,
      status: user.status,
      role: user.role,
      createdAt: user.created_at,
    };

    // Store token info
    req.token = {
      type: decoded.type,
      deviceId: decoded.deviceId,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(Unauthorized('กรุณาเข้าสู่ระบบ', AuthErrors.INVALID_TOKEN));
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    logger.warn('Non-admin access attempt', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path,
    });
    return next(Forbidden('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 'NOT_ADMIN'));
  }

  next();
};

/**
 * Require super admin role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return next(Unauthorized('กรุณาเข้าสู่ระบบ', AuthErrors.INVALID_TOKEN));
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    logger.warn('Non-super-admin access attempt', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path,
    });
    return next(Forbidden('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 'NOT_SUPER_ADMIN'));
  }

  next();
};

/**
 * Require verified KYC
 */
export const requireKycVerified = (req, res, next) => {
  if (!req.user) {
    return next(Unauthorized('กรุณาเข้าสู่ระบบ', AuthErrors.INVALID_TOKEN));
  }

  if (req.user.kycStatus !== 'VERIFIED') {
    return next(Forbidden('กรุณายืนยันตัวตนก่อนใช้งาน', 'KYC_REQUIRED'));
  }

  next();
};

/**
 * Optional authentication - attach user if token present, but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Try to authenticate, but don't fail if it doesn't work
  try {
    await authenticate(req, res, () => {});
  } catch (error) {
    // Ignore auth errors for optional auth
    logger.debug('Optional auth failed:', error.message);
  }

  next();
};

export default {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
  requireKycVerified,
  optionalAuth,
};
