import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { query, transaction } from '../config/database.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { BadRequest, Unauthorized, AuthErrors } from '../utils/errors.js';
import * as tokenService from '../services/tokenService.js';
import * as firebaseService from '../services/firebaseService.js';
import { setCSRFToken } from '../middleware/csrf.js';

/**
 * Request OTP for login
 * POST /api/v1/auth/otp/request
 */
export const requestOtp = async (req, res, next) => {
  try {
    const { phone, deviceId } = req.body;

    // Check cooldown (last OTP request time)
    const cooldownResult = await query(
      `SELECT created_at FROM otp_requests
       WHERE phone = $1 AND status = 'PENDING'
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    );

    if (cooldownResult.rows.length > 0) {
      const lastRequest = new Date(cooldownResult.rows[0].created_at);
      const cooldownEnd = new Date(lastRequest.getTime() + config.otp.cooldownSeconds * 1000);

      if (new Date() < cooldownEnd) {
        const waitSeconds = Math.ceil((cooldownEnd - new Date()) / 1000);
        throw BadRequest(
          `กรุณารอ ${waitSeconds} วินาทีก่อนขอ OTP ใหม่`,
          AuthErrors.OTP_COOLDOWN,
          { waitSeconds }
        );
      }
    }

    // Mark old pending OTPs as expired
    await query(
      `UPDATE otp_requests SET status = 'EXPIRED'
       WHERE phone = $1 AND status = 'PENDING'`,
      [phone]
    );

    // Create OTP session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + config.otp.expirySeconds * 1000);

    // For development: generate mock OTP
    // Generate real OTP
    // For development, we still want to log it to console but NOT hardcode '123456'
    
    // In production/staging: use Firebase Phone Auth
    // In development: we can mock the Firebase step or use a local generator
    // For this security fix, we will rely on the service to handle it, but we MUST NOT insert hardcoded '123456' hash
    
    let firebaseSessionInfo = null;
    let devOtp = null;

    if (config.env === 'development') {
       // In development, if not using real Firebase, we might need a way to test.
       // However, the task is to REMOVE hardcoded OTP.
       // We should use a random one if we are mocking.
       
       // BUT, checking the original code, it seems 'mockOtp' was used to bypass firebase.
       // Correct approach:
       // 1. Generate random OTP
       // 2. Hash it
       // 3. Store it
       // 4. Log it (only in dev)
       
       const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
       const hashedOtp = await bcrypt.hash(randomOtp, 10);
       devOtp = randomOtp;

       await query(
        `INSERT INTO otp_requests (id, phone, otp_code, purpose, status, expires_at, ip_address, user_agent, device_id)
         VALUES ($1, $2, $3, 'LOGIN', 'PENDING', $4, $5, $6, $7)`,
        [sessionId, phone, hashedOtp, expiresAt, req.ip, req.headers['user-agent'], deviceId]
      );

       logger.info('Development OTP generated', { phone, sessionId, otp: randomOtp });
    } else {
      // In production: use Firebase Phone Auth
      // Note: Firebase sends OTP directly to user's phone
      // We just store the session info for verification
      firebaseSessionInfo = await firebaseService.sendOtp(phone);

      await query(
        `INSERT INTO otp_requests (id, phone, firebase_session_info, purpose, status, expires_at, ip_address, user_agent, device_id)
         VALUES ($1, $2, $3, 'LOGIN', 'PENDING', $4, $5, $6, $7)`,
        [sessionId, phone, firebaseSessionInfo, expiresAt, req.ip, req.headers['user-agent'], deviceId]
      );
    }

    // Mask phone for response
    const maskedPhone = phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1-XXX-$3');

    res.json({
      success: true,
      data: {
        sessionId,
        expiresIn: config.otp.expirySeconds,
        maskedPhone,
        ...(devOtp && { devOtp }), // Only in dev
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and get tokens
 * POST /api/v1/auth/otp/verify
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { sessionId, otp, deviceId, deviceName } = req.body;

    // Get OTP request
    const otpResult = await query(
      `SELECT * FROM otp_requests WHERE id = $1`,
      [sessionId]
    );

    if (otpResult.rows.length === 0) {
      throw BadRequest('Session ไม่ถูกต้อง', AuthErrors.INVALID_OTP);
    }

    const otpRequest = otpResult.rows[0];

    // Check if expired
    if (new Date() > new Date(otpRequest.expires_at)) {
      await query(`UPDATE otp_requests SET status = 'EXPIRED' WHERE id = $1`, [sessionId]);
      throw BadRequest('รหัส OTP หมดอายุ กรุณาขอรหัสใหม่', AuthErrors.OTP_EXPIRED);
    }

    // Check if already verified
    if (otpRequest.status !== 'PENDING') {
      throw BadRequest('Session นี้ถูกใช้งานแล้ว', AuthErrors.INVALID_OTP);
    }

    // Check max attempts
    if (otpRequest.attempts >= config.otp.maxAttempts) {
      await query(`UPDATE otp_requests SET status = 'FAILED' WHERE id = $1`, [sessionId]);
      throw BadRequest(
        'ลองผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัส OTP ใหม่',
        AuthErrors.OTP_MAX_ATTEMPTS
      );
    }

    // Increment attempts
    await query(
      `UPDATE otp_requests SET attempts = attempts + 1 WHERE id = $1`,
      [sessionId]
    );

    // Verify OTP
    let isValid = false;

    if (config.env === 'development' && otpRequest.otp_code) {
      // Development: verify against stored hash
      isValid = await bcrypt.compare(otp, otpRequest.otp_code);
    } else if (otpRequest.firebase_session_info) {
      // Production: verify with Firebase
      isValid = await firebaseService.verifyOtp(otpRequest.firebase_session_info, otp);
    }

    if (!isValid) {
      const remainingAttempts = config.otp.maxAttempts - otpRequest.attempts - 1;
      throw BadRequest(
        `รหัส OTP ไม่ถูกต้อง เหลือโอกาสอีก ${remainingAttempts} ครั้ง`,
        AuthErrors.INVALID_OTP,
        { remainingAttempts }
      );
    }

    // Mark OTP as verified
    await query(
      `UPDATE otp_requests SET status = 'VERIFIED', verified_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    // Find or create user
    const phone = otpRequest.phone;
    let userResult = await query(`SELECT * FROM users WHERE phone = $1`, [phone]);

    let user;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      // Create new user
      const userId = uuidv4();
      const newUserResult = await query(
        `INSERT INTO users (id, phone, phone_verified, status, role, kyc_status)
         VALUES ($1, $2, true, 'ACTIVE', 'USER', 'NONE')
         RETURNING *`,
        [userId, phone]
      );
      user = newUserResult.rows[0];
      isNewUser = true;

      logger.info('New user created', { userId, phone });
    } else {
      user = userResult.rows[0];

      // Update last login
      await query(
        `UPDATE users SET last_login_at = NOW(), phone_verified = true WHERE id = $1`,
        [user.id]
      );
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user, {
      deviceId,
      deviceName,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Set CSRF token cookie
    setCSRFToken(req, res, () => {});

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokenService.getExpirySeconds(config.jwt.accessExpiry),
        csrfToken: req.csrfToken,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          kycStatus: user.kyc_status,
          isNewUser,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/token/refresh
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const tokens = await tokenService.refreshTokens(token, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokenService.getExpirySeconds(config.jwt.accessExpiry),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout and revoke tokens
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token, allDevices } = req.body;
    const userId = req.user.id;

    if (allDevices) {
      // Revoke all refresh tokens for this user
      await query(
        `UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW(), revoked_reason = 'LOGOUT_ALL'
         WHERE user_id = $1 AND is_revoked = false`,
        [userId]
      );

      logger.info('User logged out from all devices', { userId });
    } else if (token) {
      // Revoke specific token
      await tokenService.revokeRefreshToken(token, 'LOGOUT');
    }

    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sessions/devices
 * GET /api/v1/auth/sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentDeviceId = req.token?.deviceId;

    const result = await query(
      `SELECT id, device_id, device_name, device_type, created_at, last_used_at
       FROM refresh_tokens
       WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [userId]
    );

    const sessions = result.rows.map((session) => ({
      id: session.id,
      deviceName: session.device_name || 'Unknown Device',
      deviceType: session.device_type || 'unknown',
      createdAt: session.created_at,
      lastUsedAt: session.last_used_at,
      isCurrent: session.device_id === currentDeviceId,
    }));

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke specific session
 * DELETE /api/v1/auth/sessions/:sessionId
 */
export const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE refresh_tokens
       SET is_revoked = true, revoked_at = NOW(), revoked_reason = 'USER_REVOKED'
       WHERE id = $1 AND user_id = $2 AND is_revoked = false
       RETURNING id`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw BadRequest('ไม่พบ session นี้');
    }

    res.json({
      success: true,
      message: 'ยกเลิก session สำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  getSessions,
  revokeSession,
};
