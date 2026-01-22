import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { TooManyRequests } from '../utils/errors.js';

// Custom key generator - use phone for auth endpoints, IP for others
const keyGenerator = (req) => {
  // Use phone number for auth endpoints
  if (req.body?.phone) {
    return `phone:${req.body.phone}`;
  }
  // Use user ID if authenticated
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  // Fall back to IP
  return req.ip;
};

// Standard message generator
const messageGenerator = (req, res) => {
  return {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
      retryAfter: Math.ceil(res.getHeader('Retry-After') || 60),
    },
  };
};

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 1 minute
  max: config.rateLimit.maxRequests, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json(messageGenerator(req, res));
  },
  skip: (req) => {
    // Skip for health checks
    return req.path === '/health' || req.path === '/api/v1/health';
  },
});

// Auth rate limiter (stricter)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.authMaxRequests, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'คุณส่งคำขอบ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่',
        retryAfter: Math.ceil(res.getHeader('Retry-After') || 60),
      },
    });
  },
});

// OTP rate limiter (even stricter)
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour per phone
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.body?.phone) {
      return `otp:${req.body.phone}`;
    }
    return `otp:${req.ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'OTP_RATE_LIMIT_EXCEEDED',
        message: 'คุณขอ OTP บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
        retryAfter: Math.ceil(res.getHeader('Retry-After') || 3600),
      },
    });
  },
});

// Admin rate limiter
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 requests per minute for admin
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `admin:${req.user?.id || req.ip}`,
  handler: (req, res) => {
    res.status(429).json(messageGenerator(req, res));
  },
});

// Upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 uploads per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `upload:${req.user?.id || req.ip}`,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'คุณอัปโหลดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
        retryAfter: Math.ceil(res.getHeader('Retry-After') || 60),
      },
    });
  },
});

export default {
  globalRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  adminRateLimiter,
  uploadRateLimiter,
};
