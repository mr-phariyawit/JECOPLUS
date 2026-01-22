# 🔒 JECOPLUS Security Fixes - Phase 5

**Generated:** 2026-01-22
**Based On:** Comprehensive Security Audit
**Priority:** Critical for Production Launch

---

## 📋 Implementation Status

### ✅ Completed
- [x] CSRF protection middleware created (`backend/src/middleware/csrf.js`)
- [x] Cookie parser integrated
- [x] CSRF token endpoint added (`GET /api/v1/csrf-token`)
- [x] CORS updated to allow X-CSRF-Token header

### 🚧 In Progress
- [ ] Apply CSRF validation to state-changing routes
- [ ] Set CSRF token on login/auth
- [ ] Update frontend to use CSRF tokens

### ⏳ Pending (P0 - Critical)
- [ ] Secure file uploads (magic numbers, virus scan)
- [ ] Remove hardcoded credentials
- [ ] Fix SQL injection in sorting
- [ ] Enforce JWT secret strength
- [ ] Add rate limits to critical endpoints
- [ ] Add security headers (HSTS, CSP)
- [ ] Fix dependency vulnerabilities

---

## 🔥 Critical (P0) - Implementation Guide

### 1. CSRF Protection (IN PROGRESS)

**Status:** 60% complete
**Files Created:**
- ✅ `backend/src/middleware/csrf.js` - CSRF middleware
- ✅ `backend/src/app.js` - CSRF endpoint added

**Remaining Work:**

#### A. Apply CSRF to Routes (Selective Application)

**Apply to wallet routes** (highest risk):
```javascript
// backend/src/routes/wallet.js
import { validateCSRFToken } from '../middleware/csrf.js';

// Apply to state-changing operations
router.post('/topup', authenticate, validateCSRFToken, walletController.topUp);
router.post('/withdraw', authenticate, validateCSRFToken, walletController.withdraw);
```

**Apply to order routes**:
```javascript
// backend/src/routes/orders.js
import { validateCSRFToken } from '../middleware/csrf.js';

router.post('/', authenticate, validateCSRFToken, orderController.createOrder);
router.post('/:orderId/cancel', authenticate, validateCSRFToken, orderController.cancelOrder);
```

**Apply to admin routes**:
```javascript
// backend/src/routes/admin.js
import { validateCSRFToken } from '../middleware/csrf.js';

// Critical operations only
router.post('/users/:userId/ban', adminAuth, validateCSRFToken, adminController.banUser);
router.patch('/kyc/:kycId/approve', adminAuth, validateCSRFToken, adminController.approveKYC);
```

#### B. Set CSRF Token on Login

Update `backend/src/controllers/authController.js`:
```javascript
import { setCSRFToken } from '../middleware/csrf.js';

// In verifyOtp function, before res.json():
export const verifyOtp = async (req, res, next) => {
  try {
    // ... existing code ...

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user, { /* ... */ });

    // Set CSRF token cookie
    setCSRFToken(req, res, () => {});

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: req.csrfToken, // Include in response
        // ... rest of response
      },
    });
  } catch (error) {
    next(error);
  }
};
```

#### C. Frontend Integration

**1. Store CSRF token after login:**
```javascript
// src/services/authService.js
export const verifyOTP = async (sessionId, otp) => {
  const response = await api.post('/auth/otp/verify', { sessionId, otp });

  // Store CSRF token
  if (response.data.csrfToken) {
    localStorage.setItem('csrf_token', response.data.csrfToken);
  }

  return response.data;
};
```

**2. Include CSRF token in API requests:**
```javascript
// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add CSRF token
apiClient.interceptors.request.use((config) => {
  // Skip for GET requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});
```

**3. Refresh CSRF token periodically:**
```javascript
// src/services/csrfService.js
export const refreshCSRFToken = async () => {
  const response = await apiClient.get('/csrf-token');
  if (response.data.csrfToken) {
    localStorage.setItem('csrf_token', response.data.csrfToken);
  }
};

// Call on app mount and periodically
setInterval(refreshCSRFToken, 60 * 60 * 1000); // Every hour
```

---

### 2. Secure File Uploads

**Status:** Not started
**Priority:** P0 - Critical
**Estimated:** 4 hours

**Implementation Steps:**

#### A. Install Dependencies
```bash
npm install file-type mmmagic clamscan
```

#### B. Create File Validation Service

Create `backend/src/services/fileSecurityService.js`:
```javascript
import fileType from 'file-type';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFile = promisify(fs.readFile);

/**
 * Validate file using magic numbers (actual file content)
 */
export const validateFileType = async (buffer, allowedTypes) => {
  const type = await fileType.fromBuffer(buffer);

  if (!type) {
    throw new Error('Unable to determine file type');
  }

  if (!allowedTypes.includes(type.mime)) {
    throw new Error(`File type ${type.mime} not allowed`);
  }

  return type;
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename) => {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Scan file for viruses using ClamAV
 * Requires ClamAV daemon running
 */
export const scanForViruses = async (filePath) => {
  try {
    const NodeClam = require('clamscan');
    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
      },
    });

    const { isInfected, viruses } = await clamscan.isInfected(filePath);

    if (isInfected) {
      throw new Error(`Virus detected: ${viruses.join(', ')}`);
    }

    return true;
  } catch (error) {
    console.error('Virus scan error:', error);
    // In production, FAIL CLOSED - reject file if scan fails
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Unable to verify file safety');
    }
    return true; // Allow in development if ClamAV not configured
  }
};
```

#### C. Update KYC Controller

Update `backend/src/controllers/kycController.js`:
```javascript
import { validateFileType, sanitizeFilename, scanForViruses } from '../services/fileSecurityService.js';

export const uploadIDCard = async (req, res, next) => {
  try {
    const file = req.file;

    // 1. Validate file type using magic numbers
    await validateFileType(file.buffer, ['image/jpeg', 'image/png', 'image/webp']);

    // 2. Sanitize filename
    const safeFilename = sanitizeFilename(file.originalname);

    // 3. Save to temp location
    const tempPath = path.join('/tmp', `${Date.now()}_${safeFilename}`);
    await fs.promises.writeFile(tempPath, file.buffer);

    // 4. Scan for viruses
    await scanForViruses(tempPath);

    // 5. Upload to cloud storage (existing code)
    const fileUrl = await cloudStorageService.upload(tempPath, {
      folder: 'kyc/id-cards',
      contentType: file.mimetype,
    });

    // 6. Clean up temp file
    await fs.promises.unlink(tempPath);

    // ... rest of existing code
  } catch (error) {
    next(error);
  }
};
```

#### D. Setup ClamAV (Production)

**Docker Compose Addition:**
```yaml
services:
  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav-data:/var/lib/clamav
    environment:
      - CLAMD_CONF_MaxFileSize=100M
```

---

### 3. Remove Hardcoded Credentials

**Status:** Not started
**Priority:** P0 - Critical
**Estimated:** 1 hour

**Implementation:**

#### A. Update Admin Controller

```javascript
// backend/src/controllers/adminController.js
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // REMOVE THIS BLOCK:
    // if (config.env === 'development') {
    //   isValid = password === 'admin123';
    // }

    // ENFORCE: Admin must have password_hash in database
    if (!admin.password_hash) {
      throw new ApiError('Account not properly configured. Contact administrator.', 500);
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // ... rest of code
  }
};
```

#### B. Update Auth Controller

```javascript
// backend/src/controllers/authController.js
export const requestOtp = async (req, res, next) => {
  try {
    // REMOVE THIS BLOCK:
    // if (config.env === 'development') {
    //   const mockOtp = '123456';
    //   // ...
    // }

    // ALWAYS generate real OTP, even in development
    const otp = generateOTP();

    // For development testing, log OTP to console (not in response)
    if (config.env === 'development') {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    // Send OTP via SMS (real or mock service)
    await sendOTP(phone, otp);

    // ... rest of code
  }
};
```

#### C. Add Environment Validation

Create `backend/src/config/validate.js`:
```javascript
export const validateProductionConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    return; // Skip in development
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
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_ACCESS_SECRET.length < 64) {
    throw new Error('JWT_ACCESS_SECRET must be at least 64 characters in production');
  }
};
```

Call in `backend/src/server.js`:
```javascript
import { validateProductionConfig } from './config/validate.js';

// Validate config before starting server
validateProductionConfig();

const server = app.listen(PORT, () => {
  // ...
});
```

---

### 4. Fix SQL Injection in Dynamic Sorting

**Status:** Not started
**Priority:** P1 - High
**Estimated:** 2 hours

**Implementation:**

Update all controllers with dynamic sorting:

```javascript
// backend/src/controllers/adminController.js
export const getUsers = async (req, res, next) => {
  try {
    const { sort = 'createdAt', order = 'desc' } = req.query;

    // Whitelist for sort columns
    const ALLOWED_SORT_COLUMNS = {
      createdAt: 'created_at',
      phone: 'phone',
      firstName: 'first_name',
      lastName: 'last_name',
      kycStatus: 'kyc_status',
    };

    // Whitelist for sort orders
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

    // Now safe to use in SQL
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

Apply same pattern to:
- `adminController.js` - getUsers, getLoanApplications, getKYCRequests
- `productService.js` - getProducts

---

### 5. Enforce JWT Secret Strength

**Status:** Not started
**Priority:** P1 - High
**Estimated:** 1 hour

**Add to `backend/src/config/validate.js`:**

```javascript
export const validateJWTSecrets = () => {
  const { accessSecret, refreshSecret } = config.jwt;

  // Minimum length
  if (accessSecret.length < 64) {
    throw new Error('JWT_ACCESS_SECRET must be at least 64 characters');
  }

  if (refreshSecret.length < 64) {
    throw new Error('JWT_REFRESH_SECRET must be at least 64 characters');
  }

  // Check for weak secrets
  const weakPatterns = [
    /^[a-z]+$/i,  // All letters
    /^\d+$/,      // All numbers
    /^(.)\1+$/,   // Repeated character
  ];

  weakPatterns.forEach(pattern => {
    if (pattern.test(accessSecret) || pattern.test(refreshSecret)) {
      throw new Error('JWT secrets are too weak. Use a strong random string.');
    }
  });

  // Warn if secrets are identical
  if (accessSecret === refreshSecret) {
    console.warn('⚠️  WARNING: Access and refresh secrets should be different');
  }
};
```

**Update `.env.example`:**
```env
# Generate strong secrets with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<different-64-char-random-hex>
```

---

### 6. Add Rate Limits to Critical Endpoints

**Status:** Not started
**Priority:** P1 - High
**Estimated:** 2 hours

**Create tiered rate limiters:**

```javascript
// backend/src/middleware/rateLimiter.js

// Add specialized rate limiters
export const criticalAdminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for critical operations
  message: 'Too many critical operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 uploads per minute
  message: 'Too many file uploads. Please wait.',
});

export const writeOperationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 writes per minute
  message: 'Too many write operations.',
});
```

**Apply to routes:**

```javascript
// backend/src/routes/admin.js
import { criticalAdminLimiter, writeOperationLimiter } from '../middleware/rateLimiter.js';

// Critical operations - strictest limits
router.post('/users/:userId/ban', adminAuth, criticalAdminLimiter, adminController.banUser);
router.patch('/kyc/:kycId/approve', adminAuth, criticalAdminLimiter, adminController.approveKYC);

// Write operations - moderate limits
router.post('/products', adminAuth, writeOperationLimiter, adminController.createProduct);
router.put('/products/:id', adminAuth, writeOperationLimiter, adminController.updateProduct);
```

```javascript
// backend/src/routes/kyc.js
import { fileUploadLimiter } from '../middleware/rateLimiter.js';

router.post('/id-card', authenticate, fileUploadLimiter, upload.single('file'), kycController.uploadIDCard);
```

---

### 7. Add Security Headers

**Status:** Not started
**Priority:** P1 - High
**Estimated:** 1 hour

**Update `backend/src/app.js`:**

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"], // Remove unsafe-inline
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
  crossOriginEmbedderPolicy: true, // Enable
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

### 8. Fix Dependency Vulnerabilities

**Status:** Not started
**Priority:** P0 - Critical
**Estimated:** 15 minutes

**Commands:**
```bash
cd backend
npm audit fix
npm audit fix --force  # If needed for breaking changes
npm audit  # Verify all fixed
```

**Update package.json** with specific versions:
```json
{
  "dependencies": {
    "tar": "^7.6.0",  // Fix vulnerability
    "@mapbox/node-pre-gyp": "^1.0.11"
  }
}
```

---

## 📝 Testing Checklist

### CSRF Protection
- [ ] Login and receive CSRF token
- [ ] API call with CSRF token succeeds
- [ ] API call without CSRF token fails (403)
- [ ] API call with wrong CSRF token fails (403)
- [ ] CSRF token refreshes after expiry

### File Upload Security
- [ ] Upload valid image - succeeds
- [ ] Upload .exe renamed to .jpg - fails
- [ ] Upload malicious PDF - fails (if ClamAV configured)
- [ ] Filename with `../` path traversal - sanitized

### Authentication
- [ ] Cannot login with hardcoded passwords
- [ ] Production requires strong JWT secrets
- [ ] OTP is real (not hardcoded 123456)

### SQL Injection
- [ ] Invalid sort column returns 400 error
- [ ] SQL injection in sort parameter fails

### Rate Limiting
- [ ] Exceed file upload limit - gets 429 error
- [ ] Exceed critical admin operation limit - gets 429 error

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All P0 fixes implemented
- [ ] All P1 fixes implemented
- [ ] Run `npm audit` - 0 vulnerabilities
- [ ] Environment variables validated
- [ ] JWT secrets are strong (64+ chars)
- [ ] Database SSL enforced
- [ ] ClamAV running for file scanning
- [ ] CORS configured for production domain only
- [ ] Rate limits configured appropriately
- [ ] Security headers verified
- [ ] CSRF protection tested end-to-end
- [ ] All tests passing
- [ ] Security monitoring configured
- [ ] Incident response plan documented

---

## 📚 Additional Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security Best Practices**: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
- **Helmet.js Documentation**: https://helmetjs.github.io/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

**Last Updated:** 2026-01-22
**Next Review:** After all fixes implemented
