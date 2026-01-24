# ✅ Frontend Setup Complete: Real Backend API Mode

> **Status:** Frontend is now configured to use Real Backend API (demo_mode = false)
>
> **Date:** 2026-01-24
>
> **Backend URL:** http://localhost:3002/api/v1

---

## 🎉 What's Been Done

### 1. ✅ Environment Configuration

#### Created Files

- [.env](../../.env) - Default production mode (Real API)
- [.env.development](../../.env.development) - Mock data mode
- [.env.production.local](../../.env.production.local) - Template for local real API testing

#### Current Settings

```env
VITE_MOCKUP_MODE=false          # Real API mode enabled
VITE_API_URL=http://localhost:3002/api/v1
```

---

### 2. ✅ Documentation

#### Quick Start Guide

- [QUICK_START_REAL_API.md](../guides/quick_start_real_api.md) - 3-step quick start guide

#### Comprehensive Guide

- [docs/guides/SWITCHING_MODES.md](../guides/SWITCHING_MODES.md) - Full documentation for switching between Mock and Real API modes

---

### 3. ✅ Testing Tools

#### Test Script:
- [test-real-api.sh](../../test-real-api.sh) - Automated connection test

#### Test Results:
```
✅ Backend is running (http://localhost:3002)
✅ Frontend configured for Real API mode
✅ CORS configured correctly
✅ CSRF endpoint accessible
ℹ️  Demo Mode disabled (requires real OTP)
```

---

## 🚀 How to Use

### Quick Start

```bash
# 1. Backend is already running at port 3002 ✅

# 2. Start frontend
npm run dev

# 3. Check console - should see:
# 🌐 Running in API MODE
#    → Using real API: http://localhost:3002/api/v1
```

---

## 🧪 Verify It's Working

### In Browser Console:
```
🌐 Running in API MODE
   → Using real API: http://localhost:3002/api/v1
```

### In Network Tab:
- You should see API requests to `localhost:3002/api/v1/*`
- Not using mock data anymore

### Test Login:
Since Demo Mode is disabled, you'll need:
- Real phone number
- Real OTP from Firebase/SMS

**To enable Demo Mode for easier testing:**
```bash
# In backend/.env
DEMO_MODE=true
DEMO_PHONE=0999999999
DEMO_PASSWORD=demo123
```

---

## 🔄 Switch Between Modes

### Use Real API (Current Mode ✅)
```bash
# Method 1: Edit .env
VITE_MOCKUP_MODE=false

# Method 2: Use .env.local
echo "VITE_MOCKUP_MODE=false" > .env.local
```

### Use Mock Data
```bash
# Method 1: Edit .env
VITE_MOCKUP_MODE=true

# Method 2: Copy development config
cp .env.development .env.local
```

**Then restart:**
```bash
npm run dev
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│                                                  │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │   Vue App    │────────▶│  dataService.js │  │
│  └──────────────┘         └────────┬────────┘  │
│                                    │            │
│                    ┌───────────────┴─────┐      │
│                    │                     │      │
│                    ▼                     ▼      │
│          ┌──────────────┐    ┌────────────────┐│
│          │ api.js       │    │ mockDataService││
│          │ (Real API)   │    │ (Mock Data)    ││
│          └──────┬───────┘    └────────────────┘│
│                 │                               │
└─────────────────┼───────────────────────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │  Backend API     │
        │  localhost:3002  │
        │                  │
        │  ✅ Running      │
        │  ✅ CORS OK      │
        │  ✅ CSRF OK      │
        └──────────────────┘
```

---

## 📁 Files Modified/Created

### Modified:
- ✏️ [.env](../../.env) - Set VITE_MOCKUP_MODE=false
- ✏️ [.env.development](../../.env.development) - Added clear documentation

### Created:
- 📄 [.env.production.local](../../.env.production.local) - Production config template
- 📄 [QUICK_START_REAL_API.md](../guides/quick_start_real_api.md) - Quick reference
- 📄 [docs/guides/SWITCHING_MODES.md](../guides/SWITCHING_MODES.md) - Full guide
- 📄 [test-real-api.sh](../../test-real-api.sh) - Test script
- 📄 [REAL_API_SETUP_COMPLETE.md](./real_api_setup_complete.md) - This file

---

## 🎯 Key Features

### Automatic Mode Switching
The `dataService.js` automatically detects the mode:
```javascript
const IS_MOCKUP = import.meta.env.VITE_MOCKUP_MODE === 'true'

if (IS_MOCKUP) {
  return mockDataService.getUserLoans()
} else {
  const response = await api.get('/loans')
  return response.data.data
}
```

### Smart API Client
The `api.js` includes:
- ✅ Automatic token refresh
- ✅ CSRF protection
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Device ID tracking

---

## 🔧 Configuration Details

### Environment Variables

| Variable | Current Value | Description |
| :--- | :--- | :--- |
| `VITE_MOCKUP_MODE` | `false` | Use real API (not mock) |
| `VITE_API_URL` | `http://localhost:3002/api/v1` | Backend API endpoint |

### Backend Configuration

| Setting | Value | Status |
| :--- | :--- | :--- |
| PORT | 3002 | ✅ Running |
| CORS_ORIGINS | `localhost:5173` | ✅ Configured |
| DEMO_MODE | false | ℹ️ Disabled |
| NODE_ENV | development | ✅ OK |

---

## 🧩 Integration Points

### 1. Authentication

- Login via `/api/v1/auth/login`
- OTP verification via `/api/v1/auth/verify`
- Token refresh via `/api/v1/auth/token/refresh`

### 2. User Data

- User profile: `/api/v1/user/me`
- Loans: `/api/v1/loans`
- Payments: `/api/v1/payment/*`

### 3. AI Chat

- Chat endpoint: `/api/v1/chat`
- Conversation history: `/api/v1/chat/history`

---

## 🐛 Troubleshooting

### Problem: Still seeing mock data

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Problem: Network errors

**Solution:**
```bash
# Check backend is running
curl http://localhost:3002/api/v1/health

# Check backend logs
cd backend && npm run dev
```

### Problem: CORS errors

**Solution:**
```bash
# Verify CORS in backend/.env
grep CORS_ORIGINS backend/.env

# Should include: http://localhost:5173
```

### Problem: 401 Unauthorized

**Solution:**
```bash
# Clear tokens and login again
localStorage.clear()

# Or enable demo mode in backend
echo "DEMO_MODE=true" >> backend/.env
```

---

## 📚 Related Documentation

- [Frontend Services Architecture](../technical/api_service.md)
- [Mock Data Scenarios](../testing/scenarios.md)
- [Backend API Documentation](../../backend/README.md)
- [Environment Setup Guide](../guides/env_setup.md)

---

## ✨ Next Steps

1. **Test the Connection**
   ```bash
   ./test-real-api.sh
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Monitor Requests**
   - Open Browser DevTools
   - Go to Network tab
   - Filter by `localhost:3002`

4. **Test Features**
   - Login flow
   - Loan data fetching
   - Payment processing
   - AI Chat

---

## 💡 Tips

### Development Workflow

**For UI Development:**
```bash
# Use mock mode for fast iteration
VITE_MOCKUP_MODE=true npm run dev
```

**For Integration Testing:**
```bash
# Use real API mode
VITE_MOCKUP_MODE=false npm run dev
```

**For Demos:**
```bash
# Enable demo mode in backend
echo "DEMO_MODE=true" >> backend/.env

# Use real API mode in frontend
VITE_MOCKUP_MODE=false npm run dev
```

---

## 🎓 Learning Resources

### Understanding the Setup

1. **dataService.js** - See how auto-switching works
   - [src/services/dataService.js](../../src/services/dataService.js#L13)

2. **api.js** - Learn about API client
   - [src/services/api.js](../../src/services/api.js)

3. **Stores** - See how data flows
   - [src/stores/loans.js](../../src/stores/loans.js)
   - [src/stores/payment.js](../../src/stores/payment.js)

---

## 🎉 Success Checklist

- [x] Backend running at port 3002
- [x] Frontend configured with `VITE_MOCKUP_MODE=false`
- [x] CORS configuration correct
- [x] CSRF endpoint working
- [x] Health check passing
- [x] Documentation created
- [x] Test script working
- [ ] Frontend dev server started
- [ ] Login tested
- [ ] API requests verified in Network tab

---

**Setup completed on:** 2026-01-24
**Maintained by:** JECOPLUS Development Team
**For support:** See documentation or run `./test-real-api.sh`

---

## 🚨 Important Notes

1. **Never commit `.env.local`** - It's in .gitignore
2. **Production builds** must have `VITE_MOCKUP_MODE=false`
3. **Demo mode** should NEVER be used in production
4. **Always test** both mock and real modes before deployment

---

**Happy Coding! 🚀**
