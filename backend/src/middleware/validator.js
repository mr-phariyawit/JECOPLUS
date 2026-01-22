import Joi from 'joi';
import { BadRequest } from '../utils/errors.js';

// Thai phone validation regex
const thaiPhoneRegex = /^0[689]\d{8}$/;

// Common validation schemas
export const schemas = {
  // Phone number (Thai format)
  phone: Joi.string()
    .pattern(thaiPhoneRegex)
    .required()
    .messages({
      'string.pattern.base': 'เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเบอร์ 10 หลักที่ขึ้นต้นด้วย 06, 08, หรือ 09',
      'string.empty': 'กรุณากรอกเบอร์โทรศัพท์',
      'any.required': 'กรุณากรอกเบอร์โทรศัพท์',
    }),

  // OTP code
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก',
      'string.pattern.base': 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก',
      'string.empty': 'กรุณากรอกรหัส OTP',
      'any.required': 'กรุณากรอกรหัส OTP',
    }),

  // Citizen ID (Thai)
  citizenId: Joi.string()
    .length(13)
    .pattern(/^\d{13}$/)
    .messages({
      'string.length': 'เลขบัตรประชาชนต้องเป็น 13 หลัก',
      'string.pattern.base': 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก',
    }),

  // UUID
  uuid: Joi.string()
    .uuid({ version: 'uuidv4' })
    .messages({
      'string.guid': 'รูปแบบ ID ไม่ถูกต้อง',
    }),

  // Email
  email: Joi.string()
    .email()
    .max(255)
    .messages({
      'string.email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'string.max': 'อีเมลยาวเกินไป',
    }),

  // Name (Thai/English)
  name: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[\u0E00-\u0E7Fa-zA-Z\s]+$/)
    .messages({
      'string.min': 'ชื่อต้องมีอย่างน้อย 1 ตัวอักษร',
      'string.max': 'ชื่อยาวเกินไป',
      'string.pattern.base': 'ชื่อต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น',
    }),

  // Device ID
  deviceId: Joi.string()
    .max(255)
    .messages({
      'string.max': 'Device ID ยาวเกินไป',
    }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().max(50),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Validation schemas for specific endpoints
export const authSchemas = {
  requestOtp: Joi.object({
    phone: schemas.phone,
    deviceId: schemas.deviceId,
  }),

  verifyOtp: Joi.object({
    sessionId: schemas.uuid.required(),
    otp: schemas.otp,
    deviceId: schemas.deviceId,
    deviceName: Joi.string().max(255),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'กรุณาระบุ refresh token',
      'any.required': 'กรุณาระบุ refresh token',
    }),
  }),

  logout: Joi.object({
    refreshToken: Joi.string(),
    allDevices: Joi.boolean().default(false),
  }),
};

export const userSchemas = {
  updateProfile: Joi.object({
    email: schemas.email,
    firstName: schemas.name,
    lastName: schemas.name,
  }).min(1),
};

export const kycSchemas = {
  createSession: Joi.object({}),

  uploadDocument: Joi.object({
    documentType: Joi.string()
      .valid('ID_CARD_FRONT', 'ID_CARD_BACK', 'SELFIE')
      .required()
      .messages({
        'any.only': 'ประเภทเอกสารไม่ถูกต้อง',
        'any.required': 'กรุณาระบุประเภทเอกสาร',
      }),
  }),

  ndidInitiate: Joi.object({
    citizenId: schemas.citizenId.required(),
    idpId: Joi.string().max(100).messages({
      'string.max': 'IDP ID ยาวเกินไป',
    }),
  }),
};

export const adminSchemas = {
  login: Joi.object({
    email: schemas.email.required(),
    password: Joi.string().min(8).required().messages({
      'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
      'any.required': 'กรุณากรอกรหัสผ่าน',
    }),
  }),

  listUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100),
    kycStatus: Joi.string().valid('NONE', 'PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'),
    status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'BANNED'),
    sort: Joi.string().valid('createdAt', 'phone', 'firstName', 'kycStatus'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  updateUserStatus: Joi.object({
    status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'BANNED').required(),
    reason: Joi.string().max(500).when('status', {
      is: Joi.valid('SUSPENDED', 'BANNED'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  kycApprove: Joi.object({
    notes: Joi.string().max(1000),
  }),

  kycReject: Joi.object({
    reason: Joi.string().max(1000).required().messages({
      'any.required': 'กรุณาระบุเหตุผลในการปฏิเสธ',
    }),
    code: Joi.string().max(50),
  }),

  listLoans: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100),
    status: Joi.string().valid('PENDING_PARTNER', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUBMISSION_FAILED'),
    sort: Joi.string().valid('submittedAt', 'amountRequested', 'status', 'createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  loanApprove: Joi.object({
    notes: Joi.string().max(1000),
    approvedAmount: Joi.number().positive().max(10000000),
    approvedTerm: Joi.number().integer().positive().max(360),
  }),

  loanReject: Joi.object({
    reason: Joi.string().max(1000).required().messages({
      'any.required': 'กรุณาระบุเหตุผลในการปฏิเสธสินเชื่อ',
    }),
    code: Joi.string().max(50),
  }),
};

// Middleware factory for validation
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(BadRequest('Validation failed', 'VALIDATION_ERROR', details));
    }

    // Replace with validated/sanitized data
    req[property] = value;
    next();
  };
};

export default {
  schemas,
  authSchemas,
  userSchemas,
  kycSchemas,
  adminSchemas,
  validate,
};
