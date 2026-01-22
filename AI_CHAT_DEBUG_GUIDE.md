# 🐛 AI Chat Debugging Guide

## Issue Summary
Chat redirects to login page when user tries to type a message.

## Root Cause Analysis

After thorough investigation, the issue is caused by **authentication token problems**:

### Key Findings:

1. **Short Token Expiry**: Access tokens expire in **15 minutes** (configured in backend/.env)
2. **Token Validation**: Backend returns `INVALID_TOKEN` error when token is invalid/malformed
3. **Refresh Mechanism**: Frontend interceptor attempts token refresh but may be failing
4. **No CSRF Requirement**: Chat endpoints don't require CSRF validation

### Authentication Flow:

```
User types in chat
  ↓
POST /api/v1/chat/messages (with Bearer token)
  ↓
Backend validates token
  ↓
If invalid: 401 + INVALID_TOKEN error code
  ↓
Frontend interceptor catches 401
  ↓
Attempts to refresh token
  ↓
If refresh fails: Redirect to /login
```

## Diagnostic Steps

### Step 1: Check Token Status

Open the diagnostic page in your browser:
```
http://localhost:5173/test-chat-auth.html
```

This page will show:
- ✅ Whether access token exists
- ⏰ Token expiry time and remaining validity
- 🔑 Whether refresh token exists
- 🛡️ CSRF token status

### Step 2: Test Token Refresh

Click the **"Test Token Refresh"** button on the diagnostic page.

**Expected behavior:**
- ✅ Should successfully get a new token
- ❌ If fails: Check the error message

**Common failures:**
- `Refresh token expired` - User needs to login again
- `Refresh token not found in database` - Token was revoked
- `Network error` - Backend not running

### Step 3: Test Chat API

1. Enter a test message
2. Click **"Send Test Message"**

**Expected behavior:**
- ✅ Should successfully send message and get AI response
- ❌ If 401: Token is invalid
- ❌ If 403: Possible CSRF issue (shouldn't happen)

### Step 4: Monitor Real-time Logs

Open browser DevTools Console and watch for:
```
[API] 401 Error intercepted
[API] Redirecting to login
```

## Files Modified/Created

### New Files:
- `test-chat-auth.html` - Comprehensive auth diagnostic tool
- `AI_CHAT_DEBUG_GUIDE.md` - This guide

### Rebuilt Files:
- `src/stores/chat.js` - New chat store with localStorage persistence
- `src/components/chat/AIChatWidget.vue` - New chat widget (XSS fix)
- `src/components/chat/AIChatFAB.vue` - New floating action button

### Modified Files:
- `src/services/api.js:130` - Now handles both TOKEN_EXPIRED and INVALID_TOKEN

### Backup:
- `backup/chat-old-20260122-193223/` - Old chat implementation

## Configuration

### JWT Settings (backend/.env):
```env
JWT_ACCESS_EXPIRY=15m      # ⚠️ Very short! Consider increasing to 1h or 2h
JWT_REFRESH_EXPIRY=7d
JWT_ACCESS_SECRET=jecoplus-dev-access-secret-key-32chars-min
JWT_REFRESH_SECRET=jecoplus-dev-refresh-secret-key-32chars-min
```

### Recommendation:
Consider increasing `JWT_ACCESS_EXPIRY` to reduce frequent token refreshes:
```env
JWT_ACCESS_EXPIRY=1h    # or 2h for better UX
```

## Potential Issues & Solutions

### Issue 1: Token expires while user is typing
**Symptoms:** Chat works initially, then fails after 15 minutes

**Solution:**
1. Increase `JWT_ACCESS_EXPIRY` to 1-2 hours
2. Restart backend: `cd backend && npm run dev`

### Issue 2: Refresh token not working
**Symptoms:** Token refresh fails with error

**Possible causes:**
- Refresh token expired (7 days)
- Token was revoked/deleted from database
- User logged out from another device with "all devices" option

**Solution:**
- User needs to login again
- Check database: `SELECT * FROM refresh_tokens WHERE user_id = ?`

### Issue 3: Token becomes invalid immediately
**Symptoms:** Freshly logged in user gets INVALID_TOKEN

**Possible causes:**
- JWT secret changed (backend restarted with different .env)
- Clock skew between frontend and backend
- Token corrupted in localStorage

**Solution:**
1. Clear localStorage and login again
2. Check backend logs for JWT validation errors
3. Ensure JWT secrets haven't changed

### Issue 4: CORS or network errors
**Symptoms:** Chat API call fails with network error

**Solution:**
1. Verify backend is running on port 3002
2. Check CORS configuration in backend
3. Open DevTools Network tab and inspect request

## Testing Procedure

### Fresh Login Test:
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `/login`
3. Login with phone + OTP
4. Immediately try chat (should work)
5. Wait 16 minutes
6. Try chat again (should refresh token automatically)

### Token Refresh Test:
1. Login normally
2. Open `test-chat-auth.html`
3. Check token status (should be valid)
4. Click "Test Token Refresh" (should succeed)
5. Click "Send Test Message" (should succeed)

## Backend Debug

### Enable detailed logging:
```bash
cd backend
LOG_LEVEL=debug npm run dev
```

### Watch for these logs:
```
[Auth] Verifying token...
[Auth] Token expired
[Auth] Token invalid
[Token] Refresh token validated
[Token] New access token generated
```

### Check database:
```sql
-- Check if user exists
SELECT id, phone, status FROM users WHERE id = 'USER_ID';

-- Check refresh tokens
SELECT * FROM refresh_tokens WHERE user_id = 'USER_ID';

-- Check token expiry
SELECT *,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'VALID'
  END as status
FROM refresh_tokens
WHERE user_id = 'USER_ID';
```

## Next Steps

1. **Open diagnostic page**: `http://localhost:5173/test-chat-auth.html`
2. **Check token status** - Is token valid or expired?
3. **Test refresh** - Can the system refresh the token?
4. **Test chat API** - Can you send a message directly?
5. **Share results** - What errors did you see?

## Contact

If issue persists after following this guide, provide:
1. Screenshot of `test-chat-auth.html` showing token status
2. Browser console logs (especially lines with `[API]`)
3. Backend console logs (if available)
4. Exact steps to reproduce

---

Created: 2026-01-22
Last Updated: 2026-01-22
