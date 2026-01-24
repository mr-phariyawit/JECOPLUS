# 🔒 Security Documentation & Protocols

**Priority:** Critical (P0)
**Status:** Hardening in Progress

---

## 🚨 CRITICAL WARNING: Security Configuration

> [!CAUTION]
> **DO NOT DEPLOY TO PRODUCTION WITH SECURITY DISABLED.**
>
> If you see `router.use(authenticate)` commented out in `routes/chat.js` or dummy user IDs in controllers, **RE-ENABLE THEM IMMEDIATELY**.
> Refer to `RE-ENABLE_SECURITY.md` (archived) for restoration steps if needed.

---

## 🛡️ Security Implementation Status

### ✅ Integrated Features
1. **CSRF Protection**:
   - Double-submit cookie pattern implemented.
   - Endpoint: `GET /api/v1/csrf-token`.
   - Middleware: `validateCSRFToken`.
2. **Cookie Parsing**: `cookie-parser` configured securely.
3. **Helmet**: Security headers (HSTS, CSP) configured.
4. **CORS**: Restricted to allowed origins.

---

## 📋 Security Fixes Checklist (Phase 5)

### P0: Critical Actions
- [ ] **Secure File Uploads**: Validate magic numbers, implement ClamAV scanning.
- [ ] **Credentials**: Remove ANY hardcoded passwords/OTPs from source code.
- [ ] **SQL Injection**: Ensure dynamic sorting uses whitelist validation.
- [ ] **JWT Secrets**: Enforce minimum 64-char random secrets.
- [ ] **Dependencies**: Run `npm audit` and fix high-severity issues.

### P1: High Priority
- [ ] **Rate Limiting**: Apply tiered limits to Admin and Upload routes.
- [ ] **Input Validation**: Verify Joi schemas cover all inputs.

---

## 🧪 Verification Guide

### Testing CSRF
1. Login to get `csrf_token` cookie.
2. Send modifying request (POST/PUT/DELETE) *without* header -> **Expect 403**.
3. Send request *with* `X-CSRF-Token` header -> **Expect 200**.

### Testing Auth
1. Attempt login with "admin123" (hardcoded fallback) -> **Expect Failure** (if fixed).
2. Attempt API access without Bearer token -> **Expect 401**.

---

## 📦 Deployment Security Checklist

Before `production` deployment:
- [ ] `NODE_ENV` set to `production`.
- [ ] Database SSL enabled.
- [ ] Production secrets loaded (not default dev keys).
- [ ] Admin "super-user" created with strong password (via CLI/Seed).
