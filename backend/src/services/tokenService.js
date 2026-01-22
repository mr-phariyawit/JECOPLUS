import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { Unauthorized, AuthErrors } from '../utils/errors.js';

/**
 * Parse expiry string to seconds
 */
export const getExpirySeconds = (expiry) => {
  if (typeof expiry === 'number') return expiry;

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const [, value, unit] = match;
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(value) * (multipliers[unit] || 60);
};

/**
 * Get signing key (private key for RS256 or secret for HS256)
 */
const getSigningKey = () => {
  if (config.jwt.privateKey) {
    return config.jwt.privateKey;
  }
  return config.jwt.accessSecret;
};

/**
 * Get verification key (public key for RS256 or secret for HS256)
 */
const getVerificationKey = () => {
  if (config.jwt.publicKey) {
    return config.jwt.publicKey;
  }
  return config.jwt.accessSecret;
};

/**
 * Get algorithm based on available keys
 */
const getAlgorithm = () => {
  if (config.jwt.privateKey && config.jwt.publicKey) {
    return 'RS256';
  }
  return 'HS256';
};

/**
 * Generate access token
 */
export const generateAccessToken = (user, deviceId = null) => {
  const payload = {
    sub: user.id,
    phone: user.phone,
    role: user.role,
    kycStatus: user.kyc_status || user.kycStatus,
    type: 'access',
    deviceId,
  };

  return jwt.sign(payload, getSigningKey(), {
    algorithm: getAlgorithm(),
    expiresIn: config.jwt.accessExpiry,
    issuer: 'jecoplus',
    audience: 'jecoplus-app',
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user, deviceId = null) => {
  const payload = {
    sub: user.id,
    type: 'refresh',
    deviceId,
    jti: uuidv4(), // Unique token ID
  };

  return jwt.sign(payload, config.jwt.refreshSecret || getSigningKey(), {
    algorithm: config.jwt.refreshSecret ? 'HS256' : getAlgorithm(),
    expiresIn: config.jwt.refreshExpiry,
    issuer: 'jecoplus',
    audience: 'jecoplus-app',
  });
};

/**
 * Hash token for storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate token pair and store refresh token
 */
export const generateTokenPair = async (user, deviceInfo = {}) => {
  const deviceId = deviceInfo.deviceId || uuidv4();

  const accessToken = generateAccessToken(user, deviceId);
  const refreshToken = generateRefreshToken(user, deviceId);

  // Calculate expiry
  const expirySeconds = getExpirySeconds(config.jwt.refreshExpiry);
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  // Store refresh token hash
  const tokenHash = hashToken(refreshToken);

  await query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, device_id, device_name, device_type, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      uuidv4(),
      user.id,
      tokenHash,
      deviceId,
      deviceInfo.deviceName,
      deviceInfo.deviceType,
      expiresAt,
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
    ]
  );

  return { accessToken, refreshToken, deviceId };
};

/**
 * Verify refresh token and generate new access token
 */
export const refreshTokens = async (refreshToken, deviceInfo = {}) => {
  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret || getVerificationKey(), {
      algorithms: config.jwt.refreshSecret ? ['HS256'] : [getAlgorithm()],
      issuer: 'jecoplus',
      audience: 'jecoplus-app',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw Unauthorized('Refresh token หมดอายุ กรุณาเข้าสู่ระบบใหม่', AuthErrors.TOKEN_EXPIRED);
    }
    throw Unauthorized('Refresh token ไม่ถูกต้อง', AuthErrors.INVALID_TOKEN);
  }

  if (decoded.type !== 'refresh') {
    throw Unauthorized('Token type ไม่ถูกต้อง', AuthErrors.INVALID_TOKEN);
  }

  // Verify token exists in database and not revoked
  const tokenHash = hashToken(refreshToken);
  const tokenResult = await query(
    `SELECT rt.*, u.id as user_id, u.phone, u.role, u.kyc_status, u.status
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token_hash = $1`,
    [tokenHash]
  );

  if (tokenResult.rows.length === 0) {
    throw Unauthorized('Refresh token ไม่ถูกต้อง', AuthErrors.INVALID_TOKEN);
  }

  const storedToken = tokenResult.rows[0];

  if (storedToken.is_revoked) {
    // Token reuse detected - potential attack
    logger.warn('Refresh token reuse detected!', {
      userId: storedToken.user_id,
      tokenId: storedToken.id,
    });

    // Revoke all tokens for this user as a security measure
    await query(
      `UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW(), revoked_reason = 'SECURITY_REUSE'
       WHERE user_id = $1`,
      [storedToken.user_id]
    );

    throw Unauthorized('Session ถูกยกเลิกเนื่องจากตรวจพบการใช้งานที่ผิดปกติ กรุณาเข้าสู่ระบบใหม่', AuthErrors.TOKEN_REVOKED);
  }

  if (new Date() > new Date(storedToken.expires_at)) {
    throw Unauthorized('Refresh token หมดอายุ กรุณาเข้าสู่ระบบใหม่', AuthErrors.TOKEN_EXPIRED);
  }

  // Check user status
  if (storedToken.status === 'SUSPENDED' || storedToken.status === 'BANNED') {
    throw Unauthorized('บัญชีของคุณถูกระงับ', AuthErrors.USER_SUSPENDED);
  }

  // Update last used time
  await query(
    `UPDATE refresh_tokens SET last_used_at = NOW() WHERE id = $1`,
    [storedToken.id]
  );

  // Generate new access token
  const user = {
    id: storedToken.user_id,
    phone: storedToken.phone,
    role: storedToken.role,
    kycStatus: storedToken.kyc_status,
  };

  const accessToken = generateAccessToken(user, storedToken.device_id);

  return { accessToken };
};

/**
 * Revoke a refresh token
 */
export const revokeRefreshToken = async (refreshToken, reason = 'MANUAL') => {
  const tokenHash = hashToken(refreshToken);

  const result = await query(
    `UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW(), revoked_reason = $2
     WHERE token_hash = $1 AND is_revoked = false
     RETURNING id, user_id`,
    [tokenHash, reason]
  );

  if (result.rows.length > 0) {
    logger.info('Refresh token revoked', {
      tokenId: result.rows[0].id,
      userId: result.rows[0].user_id,
      reason,
    });
  }

  return result.rows.length > 0;
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getVerificationKey(), {
      algorithms: [getAlgorithm()],
      issuer: 'jecoplus',
      audience: 'jecoplus-app',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw Unauthorized('Token หมดอายุ', AuthErrors.TOKEN_EXPIRED);
    }
    throw Unauthorized('Token ไม่ถูกต้อง', AuthErrors.INVALID_TOKEN);
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  refreshTokens,
  revokeRefreshToken,
  verifyAccessToken,
  getExpirySeconds,
};
