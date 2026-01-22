# Cookie Parser & CSRF Integration

**Status:** ✅ Integrated

---

## ✅ What's Done

### Cookie Parser
- ✅ `cookie-parser` package added to `package.json`
- ✅ Integrated in `backend/src/app.js`
- ✅ Configured before body parsing (required for CSRF)

### CSRF Protection
- ✅ Existing custom CSRF middleware (`backend/src/middleware/csrf.js`)
- ✅ CSRF token endpoint: `GET /api/v1/csrf-token`
- ✅ CORS configured to allow `X-CSRF-Token` header

---

## 📝 Current Implementation

### Cookie Parser Setup

```javascript
// backend/src/app.js
import cookieParser from 'cookie-parser';

// Cookie parsing (must be before CSRF middleware)
app.use(cookieParser());
```

### CSRF Token Endpoint

```javascript
// GET /api/v1/csrf-token
app.get('/api/v1/csrf-token', getCSRFToken);
```

### CSRF Middleware

The system uses a custom double-submit cookie pattern:
1. Server generates token and sets cookie
2. Client reads token from cookie
3. Client sends token in `X-CSRF-Token` header
4. Server validates cookie token matches header token

---

## 🔄 Using csurf (Optional)

If you want to use the `csurf` package instead:

### Option 1: Use Enhanced Middleware

The file `backend/src/middleware/csrfEnhanced.js` is ready with csurf integration.

To use it:

```javascript
// backend/src/app.js
import { csrfProtect, getCSRFToken } from './middleware/csrfEnhanced.js';

// Apply to state-changing routes
app.post('/api/v1/some-route', csrfProtect, routeHandler);
```

### Option 2: Keep Current Implementation

The existing custom CSRF implementation works well and is already integrated. No changes needed.

---

## 🧪 Testing CSRF

### Get CSRF Token

```bash
curl -X GET http://localhost:3000/api/v1/csrf-token \
  -c cookies.txt
```

### Use Token in Request

```bash
curl -X POST http://localhost:3000/api/v1/some-endpoint \
  -H "X-CSRF-Token: <token-from-response>" \
  -b cookies.txt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 Security Notes

1. **Cookie Settings:**
   - `httpOnly: false` (needed for JavaScript to read)
   - `secure: true` (production only, HTTPS)
   - `sameSite: 'strict'` (prevents CSRF)

2. **Token Validation:**
   - Only validates state-changing methods (POST, PUT, DELETE, PATCH)
   - GET, HEAD, OPTIONS are safe and don't need validation

3. **Development:**
   - Set `SKIP_CSRF=true` in `.env` to skip validation (development only)

---

## ✅ Integration Complete

Both `cookie-parser` and CSRF protection are integrated and ready to use!
