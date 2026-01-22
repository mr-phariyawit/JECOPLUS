# 🤖 Remaining Tasks for Gemini Code

**Project:** JECOPLUS Platform - Phase 5 Security Hardening
**Date:** 2026-01-22
**Context:** Sprint 8 (Checkout) complete, now implementing security fixes from audit

---

## 📋 Task Overview

Complete the critical security fixes identified in the security audit. CSRF protection has been partially implemented. The following tasks remain:

**Priority:**
- P0 = Critical - Must fix before production
- P1 = High - Fix in current sprint
- P2 = Medium - Fix in next sprint

---

## ✅ Already Completed

1. ✅ Security audit completed (15 issues identified)
2. ✅ CSRF middleware created (`backend/src/middleware/csrf.js`)
3. ✅ CSRF endpoint added (`GET /api/v1/csrf-token`)
4. ✅ Cookie parser integrated into app.js
5. ✅ CORS updated to allow X-CSRF-Token header
6. ✅ Documentation created (SECURITY_FIXES.md, PROJECT_STATUS.md)

---

## 🔥 Task 1: Complete CSRF Protection Integration (P0)

**Status:** 60% complete
**Estimated Time:** 2 hours
**Priority:** Critical

### Subtasks:

#### 1.1: Update Auth Controller to Set CSRF Token on Login
**File:** `backend/src/controllers/authController.js`

Add CSRF token generation after successful OTP verification:

```javascript
// Import at top
import { setCSRFToken } from '../middleware/csrf.js';

// In verifyOtp function, around line 206, BEFORE res.json():
export const verifyOtp = async (req, res, next) => {
  try {
    // ... existing token generation code ...

    const tokens = await tokenService.generateTokenPair(user, {
      deviceId,
      deviceName,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // ADD THIS: Set CSRF token cookie
    setCSRFToken(req, res, () => {});

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokenService.getExpirySeconds(config.jwt.accessExpiry),
        csrfToken: req.csrfToken, // ADD THIS: Include CSRF token in response
        user: {
          // ... existing user data ...
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

#### 1.2: Apply CSRF Validation to Critical Routes

**Files to modify:**
- `backend/src/routes/wallet.js`
- `backend/src/routes/orders.js`
- `backend/src/routes/admin.js`

**Pattern to follow:**

```javascript
// At top of each file
import { validateCSRFToken } from '../middleware/csrf.js';

// Apply to POST, PUT, PATCH, DELETE routes
// Example for wallet.js:
router.post('/topup', authenticate, validateCSRFToken, walletController.topUp);
router.post('/withdraw', authenticate, validateCSRFToken, walletController.withdraw);

// Example for orders.js:
router.post('/', authenticate, validateCSRFToken, orderController.createOrder);
router.post('/:orderId/cancel', authenticate, validateCSRFToken, orderController.cancelOrder);

// Example for admin.js (critical operations only):
router.post('/users/:userId/ban', adminAuth, validateCSRFToken, adminController.banUser);
router.patch('/kyc/:kycId/approve', adminAuth, validateCSRFToken, adminController.approveKYC);
router.patch('/kyc/:kycId/reject', adminAuth, validateCSRFToken, adminController.rejectKYC);
```

**Routes to protect:**
- Wallet: topup, withdraw
- Orders: create, cancel
- Admin: ban user, approve/reject KYC, approve/reject loans
- Loans: create, submit
- KYC: submit documents

#### 1.3: Frontend CSRF Integration

**File:** `src/services/api.js`

Update API client to include CSRF token:

```javascript
// Add after login, store CSRF token
const csrfToken = response.data.csrfToken;
if (csrfToken) {
  localStorage.setItem('csrf_token', csrfToken);
}

// Update request interceptor
apiClient.interceptors.request.use((config) => {
  // Add CSRF token for state-changing requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // ... existing auth token code ...
  return config;
});
```

**File:** `src/services/authService.js`

Store CSRF token after login:

```javascript
export const verifyOTP = async (sessionId, otp, deviceId) => {
  const response = await api.post('/auth/otp/verify', {
    sessionId,
    otp,
    deviceId,
  });

  // Store CSRF token
  if (response.data.csrfToken) {
    localStorage.setItem('csrf_token', response.data.csrfToken);
  }

  return response.data;
};
```

---

## 🔒 Task 2: Remove Hardcoded Credentials (P0)

**Status:** Not started
**Estimated Time:** 1 hour
**Priority:** Critical

### Subtasks:

#### 2.1: Remove Hardcoded Admin Password

**File:** `backend/src/controllers/adminController.js`

Find and remove the hardcoded password fallback (around line 48-54):

```javascript
// REMOVE THIS ENTIRE BLOCK:
// if (config.env === 'development') {
//   isValid = password === 'admin123';
// }

// REPLACE WITH:
if (!admin.password_hash) {
  throw new ApiError('Account not properly configured. Contact administrator.', 500);
}

const isValid = await bcrypt.compare(password, admin.password_hash);
```

#### 2.2: Remove Hardcoded OTP

**File:** `backend/src/controllers/authController.js`

Find and remove the hardcoded OTP fallback (around line 53-64):

```javascript
// REMOVE THIS ENTIRE BLOCK:
// if (config.env === 'development') {
//   const mockOtp = '123456';
//   // ... rest of mock OTP code
// }

// REPLACE WITH: Always generate real OTP
const otp = generateOTP(); // This function should already exist

// For development, log OTP to console (not in response)
if (config.env === 'development') {
  console.log(`[DEV] OTP for ${phone}: ${otp}`);
}

// Always send via SMS service (or mock SMS service in dev)
await sendOTP(phone, otp);
```

#### 2.3: Add Environment Validation

**Create new file:** `backend/src/config/validate.js`

```javascript
import config from './index.js';

/**
 * Validate production environment configuration
 */
export const validateProductionConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    return; // Skip validation in development
  }

  const required = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'FIREBASE_PROJECT_ID',
    'CLOUD_STORAGE_BUCKET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_ACCESS_SECRET.length < 64) {
    throw new Error('JWT_ACCESS_SECRET must be at least 64 characters in production');
  }

  if (process.env.JWT_REFRESH_SECRET.length < 64) {
    throw new Error('JWT_REFRESH_SECRET must be at least 64 characters in production');
  }

  console.log('✅ Production configuration validated');
};

/**
 * Validate JWT secrets strength
 */
export const validateJWTSecrets = () => {
  const { accessSecret, refreshSecret } = config.jwt;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are required');
  }

  // Check minimum length
  if (accessSecret.length < 64 || refreshSecret.length < 64) {
    throw new Error('JWT secrets must be at least 64 characters');
  }

  // Check for weak patterns
  const weakPatterns = [
    /^[a-z]+$/i,  // All letters only
    /^\d+$/,      // All numbers only
    /^(.)\1+$/,   // Repeated character
  ];

  weakPatterns.forEach(pattern => {
    if (pattern.test(accessSecret) || pattern.test(refreshSecret)) {
      throw new Error('JWT secrets are too weak. Use a strong random string.');
    }
  });

  // Warn if identical
  if (accessSecret === refreshSecret) {
    console.warn('⚠️  WARNING: Access and refresh secrets should be different');
  }
};
```

**Update file:** `backend/src/server.js`

Add validation at startup:

```javascript
// Add at top
import { validateProductionConfig, validateJWTSecrets } from './config/validate.js';

// Add BEFORE server.listen():
try {
  validateProductionConfig();
  validateJWTSecrets();
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  // ... existing code
});
```

---

## 🛡️ Task 3: Fix SQL Injection in Dynamic Sorting (P1)

**Status:** Not started
**Estimated Time:** 2 hours
**Priority:** High

### Files to update:

#### 3.1: Admin Users Controller

**File:** `backend/src/controllers/adminController.js`

Find the `getUsers` function (around line 177-258) and update:

```javascript
export const getUsers = async (req, res, next) => {
  try {
    const { sort = 'createdAt', order = 'desc' } = req.query;

    // ADD: Strict whitelist validation
    const ALLOWED_SORT_COLUMNS = {
      createdAt: 'created_at',
      phone: 'phone',
      firstName: 'first_name',
      lastName: 'last_name',
      kycStatus: 'kyc_status',
    };

    const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

    // Validate sort column
    if (!ALLOWED_SORT_COLUMNS[sort]) {
      throw new ApiError('Invalid sort column', 400);
    }

    // Validate sort order
    const normalizedOrder = order.toLowerCase();
    if (!ALLOWED_SORT_ORDERS.includes(normalizedOrder)) {
      throw new ApiError('Invalid sort order', 400);
    }

    const sortColumn = ALLOWED_SORT_COLUMNS[sort];
    const sortOrder = normalizedOrder.toUpperCase();

    // Now safe to use in SQL query
    const usersResult = await query(
      `SELECT ... FROM users
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // ... rest of code
  }
};
```

#### 3.2: Admin Loan Applications

**File:** `backend/src/controllers/adminController.js`

Find `getLoanApplications` function (around line 684-712) and apply same pattern:

```javascript
export const getLoanApplications = async (req, res, next) => {
  try {
    const { sort = 'createdAt', order = 'desc' } = req.query;

    // ADD: Whitelist validation
    const ALLOWED_SORT_COLUMNS = {
      createdAt: 'created_at',
      amount: 'amount',
      status: 'status',
      userId: 'user_id',
    };

    const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

    if (!ALLOWED_SORT_COLUMNS[sort]) {
      throw new ApiError('Invalid sort column', 400);
    }

    const normalizedOrder = order.toLowerCase();
    if (!ALLOWED_SORT_ORDERS.includes(normalizedOrder)) {
      throw new ApiError('Invalid sort order', 400);
    }

    const sortColumn = ALLOWED_SORT_COLUMNS[sort];
    const sortOrder = normalizedOrder.toUpperCase();

    // Safe to use
    const query = `SELECT ... ORDER BY ${sortColumn} ${sortOrder} ...`;

    // ... rest of code
  }
};
```

#### 3.3: Product Service

**File:** `backend/src/services/productService.js`

Find `getProducts` function (around line 117-118) and update:

```javascript
export const getProducts = async (filters = {}) => {
  const { sortBy = 'latest' } = filters;

  // ADD: Whitelist validation
  const ALLOWED_SORT_OPTIONS = {
    latest: 'created_at DESC',
    oldest: 'created_at ASC',
    price_low: 'price ASC',
    price_high: 'price DESC',
    name_az: 'name ASC',
    name_za: 'name DESC',
  };

  if (!ALLOWED_SORT_OPTIONS[sortBy]) {
    throw new Error('Invalid sort option');
  }

  const orderClause = ALLOWED_SORT_OPTIONS[sortBy];

  const query = `
    SELECT * FROM products
    WHERE status = 'ACTIVE'
    ORDER BY ${orderClause}
  `;

  // ... rest of code
};
```

---

## 🔐 Task 4: Add Security Headers (P1)

**Status:** Not started
**Estimated Time:** 1 hour
**Priority:** High

### 4.1: Update Helmet Configuration

**File:** `backend/src/app.js`

Find the Helmet configuration (around line 42-52) and replace with:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"], // REMOVED: unsafe-inline
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'https://storage.googleapis.com', // Specific domain only
      ],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true, // CHANGED: Enable
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));
```

---

## ⚡ Task 5: Add Tiered Rate Limiting (P1)

**Status:** Not started
**Estimated Time:** 2 hours
**Priority:** High

### 5.1: Create Specialized Rate Limiters

**File:** `backend/src/middleware/rateLimiter.js`

Add at the end of the file:

```javascript
// Critical admin operations - very strict
export const criticalAdminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many critical operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for critical admin operation: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many critical operations. Please slow down.',
    });
  },
});

// File uploads - moderate
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 uploads per minute
  message: 'Too many file uploads. Please wait.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Write operations - moderate
export const writeOperationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 writes per minute
  message: 'Too many write operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 5.2: Apply to Admin Routes

**File:** `backend/src/routes/admin.js`

```javascript
// Add imports at top
import {
  criticalAdminLimiter,
  writeOperationLimiter
} from '../middleware/rateLimiter.js';

// Apply to critical operations
router.post('/users/:userId/ban', adminAuth, criticalAdminLimiter, adminController.banUser);
router.post('/users/:userId/unban', adminAuth, criticalAdminLimiter, adminController.unbanUser);
router.patch('/kyc/:kycId/approve', adminAuth, criticalAdminLimiter, adminController.approveKYC);
router.patch('/kyc/:kycId/reject', adminAuth, criticalAdminLimiter, adminController.rejectKYC);

// Apply to write operations
router.post('/products', adminAuth, writeOperationLimiter, adminController.createProduct);
router.put('/products/:id', adminAuth, writeOperationLimiter, adminController.updateProduct);
router.delete('/products/:id', adminAuth, writeOperationLimiter, adminController.deleteProduct);
```

### 5.3: Apply to File Upload Routes

**File:** `backend/src/routes/kyc.js`

```javascript
// Add import at top
import { fileUploadLimiter } from '../middleware/rateLimiter.js';

// Apply to all upload endpoints
router.post('/id-card', authenticate, fileUploadLimiter, upload.single('file'), kycController.uploadIDCard);
router.post('/selfie', authenticate, fileUploadLimiter, upload.single('file'), kycController.uploadSelfie);
router.post('/liveness', authenticate, fileUploadLimiter, upload.single('file'), kycController.uploadLiveness);
```

---

## 🔍 Task 6: Fix Dependency Vulnerabilities (P0)

**Status:** Not started
**Estimated Time:** 15 minutes
**Priority:** Critical

### 6.1: Run NPM Audit Fix

```bash
cd backend
npm audit fix
npm audit
```

### 6.2: If Automatic Fix Doesn't Work

Manually update `backend/package.json`:

```json
{
  "dependencies": {
    "tar": "^7.6.0",
    "@mapbox/node-pre-gyp": "^1.0.11"
  }
}
```

Then run:
```bash
npm install
npm audit
```

### 6.3: Verify Zero Vulnerabilities

Expected output:
```
found 0 vulnerabilities
```

---

## 📝 Task 7: Reduce Request Body Size Limits (P2)

**Status:** Not started
**Estimated Time:** 30 minutes
**Priority:** Medium

**File:** `backend/src/app.js`

Update body parser configuration (around line 77-78):

```javascript
// CHANGE FROM:
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CHANGE TO:
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

Note: File uploads use multer limits (already set to 10MB), which is separate and correct.

---

## 🧪 Task 8: Testing & Verification

**Status:** Not started
**Estimated Time:** 2 hours
**Priority:** High

### 8.1: Manual Testing Checklist

Create a test script to verify all fixes:

**Create file:** `backend/tests/security/security-fixes.test.md`

```markdown
# Security Fixes Verification

## CSRF Protection
- [ ] Login via POST /api/v1/auth/otp/verify
- [ ] Receive csrfToken in response
- [ ] Make POST request to /api/v1/orders with CSRF token → Success
- [ ] Make POST request to /api/v1/orders without CSRF token → 403 Error
- [ ] Make POST request with wrong CSRF token → 403 Error

## No Hardcoded Credentials
- [ ] Try admin login with password='admin123' → Should FAIL
- [ ] Try OTP with code='123456' in production → Should FAIL
- [ ] Check logs: No hardcoded passwords visible

## SQL Injection Prevention
- [ ] GET /api/v1/admin/users?sort=invalid_column → 400 Error
- [ ] GET /api/v1/admin/users?sort=createdAt&order=invalid → 400 Error
- [ ] GET /api/v1/admin/users?sort=createdAt; DROP TABLE users-- → 400 Error

## Rate Limiting
- [ ] Make 6 file uploads in 1 minute → 6th request gets 429
- [ ] Make 6 admin ban requests in 1 minute → 6th request gets 429
- [ ] Wait 1 minute → Rate limit resets

## Security Headers
- [ ] Check response headers include:
  - Strict-Transport-Security
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy

## Dependencies
- [ ] Run `npm audit` → 0 vulnerabilities
```

### 8.2: Automated Testing

**Create file:** `backend/tests/security/csrf.test.js`

```javascript
import request from 'supertest';
import app from '../../src/app.js';

describe('CSRF Protection', () => {
  let accessToken;
  let csrfToken;

  beforeAll(async () => {
    // Login to get tokens
    const loginRes = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({
        sessionId: 'test-session',
        otp: '123456',
        deviceId: 'test-device',
      });

    accessToken = loginRes.body.data.accessToken;
    csrfToken = loginRes.body.data.csrfToken;
  });

  test('should reject request without CSRF token', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 1000, method: 'promptpay' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('CSRF');
  });

  test('should accept request with valid CSRF token', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ amount: 1000, method: 'promptpay' });

    expect(res.status).toBe(200);
  });
});
```

---

## 📦 Task 9: Create Deployment Checklist

**Status:** Not started
**Estimated Time:** 30 minutes

**Create file:** `DEPLOYMENT_CHECKLIST.md`

```markdown
# Production Deployment Checklist

## Pre-Deployment Security Verification

### Critical (P0) - Must Complete
- [ ] All P0 security fixes implemented
- [ ] CSRF protection tested end-to-end
- [ ] No hardcoded credentials in code
- [ ] Dependencies: 0 vulnerabilities (`npm audit`)
- [ ] Environment variables validated
- [ ] JWT secrets are 64+ characters
- [ ] Database SSL enforced

### High Priority (P1) - Should Complete
- [ ] SQL injection fixes verified
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] Input validation comprehensive

### Configuration
- [ ] NODE_ENV=production
- [ ] CORS origins set to production domain only
- [ ] Rate limits appropriate for production traffic
- [ ] File upload limits configured
- [ ] Logging configured (no sensitive data)

### Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Security tests passing
- [ ] Load testing completed
- [ ] Penetration testing (if available)

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Log aggregation configured
- [ ] Uptime monitoring configured
- [ ] Security monitoring configured
- [ ] Alerts configured for critical errors

### Documentation
- [ ] API documentation updated
- [ ] Security incident response plan documented
- [ ] Backup and recovery procedures documented
- [ ] Rollback plan prepared

### Post-Deployment
- [ ] Smoke tests passing
- [ ] Monitor error logs for 24 hours
- [ ] Security scan of production environment
- [ ] Verify all security headers present
- [ ] Test CSRF protection in production
```

---

## 📊 Success Criteria

All tasks complete when:

1. ✅ All P0 and P1 security fixes implemented
2. ✅ All automated tests passing
3. ✅ Manual security checklist verified
4. ✅ NPM audit shows 0 vulnerabilities
5. ✅ Code review completed (if applicable)
6. ✅ Documentation updated
7. ✅ Deployment checklist prepared

---

## 🚨 Known Blockers

**File Upload Security (Task 2 - not included above):**
- Requires ClamAV for virus scanning
- Requires file-type package for magic number validation
- More complex, estimate 4-6 hours
- Can be deferred to post-launch if needed

**Recommendation:** Complete Tasks 1-9, deploy, then implement file upload security in next sprint.

---

## 📚 Reference Documents

- Security Audit Report: (completed, 15 issues found)
- SECURITY_FIXES.md: Detailed implementation guide
- PROJECT_STATUS.md: Overall project status

---

**Priority Order for Gemini:**
1. Task 1 (CSRF) - Most critical, partially done
2. Task 2 (Remove hardcoded creds) - Fast and critical
3. Task 6 (Dependencies) - Fast and critical
4. Task 3 (SQL injection) - Important for data security
5. Task 4 (Security headers) - Easy win
6. Task 5 (Rate limiting) - Moderate complexity
7. Task 7 (Body limits) - Easy
8. Task 8 (Testing) - Verify everything works
9. Task 9 (Deployment checklist) - Final prep

**Estimated Total Time:** 10-12 hours

Good luck! 🚀
