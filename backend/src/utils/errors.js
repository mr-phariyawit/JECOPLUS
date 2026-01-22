// Custom API Error class
export class ApiError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Error factory functions
export const BadRequest = (message, code = 'BAD_REQUEST', details = null) =>
  new ApiError(400, message, code, details);

export const Unauthorized = (message = 'Unauthorized', code = 'UNAUTHORIZED') =>
  new ApiError(401, message, code);

export const Forbidden = (message = 'Forbidden', code = 'FORBIDDEN') =>
  new ApiError(403, message, code);

export const NotFound = (message = 'Not found', code = 'NOT_FOUND') =>
  new ApiError(404, message, code);

export const Conflict = (message, code = 'CONFLICT') =>
  new ApiError(409, message, code);

export const TooManyRequests = (message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') =>
  new ApiError(429, message, code);

export const InternalError = (message = 'Internal server error', code = 'INTERNAL_ERROR') =>
  new ApiError(500, message, code);

// Error codes for auth
export const AuthErrors = {
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  OTP_COOLDOWN: 'OTP_COOLDOWN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_BANNED: 'USER_BANNED',
  PHONE_INVALID: 'PHONE_INVALID',
  FIREBASE_ERROR: 'FIREBASE_ERROR',
};

// Error codes for KYC
export const KYCErrors = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  DOCUMENT_INVALID: 'DOCUMENT_INVALID',
  FACE_MISMATCH: 'FACE_MISMATCH',
  LIVENESS_FAILED: 'LIVENESS_FAILED',
  NDID_ERROR: 'NDID_ERROR',
  KYC_ALREADY_VERIFIED: 'KYC_ALREADY_VERIFIED',
  KYC_PENDING: 'KYC_PENDING',
};

// Error codes for admin
export const AdminErrors = {
  NOT_ADMIN: 'NOT_ADMIN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_ACTION: 'INVALID_ACTION',
};

export default ApiError;
