# Chrome Testing Guide - AI-360 System

**Quick guide for testing the complete AI-360 system in Chrome browser**

---

## 🚀 Quick Start

### 1. Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
Server started on port 3000
Database connected successfully
Job scheduler started
```

### 2. Start Frontend

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 3. Open Chrome

Navigate to: **http://localhost:5173**

---

## 🧪 Testing Checklist

### Step 1: Login & Authentication

1. **Login Page**
   - ✅ Enter phone number
   - ✅ Request OTP
   - ✅ Verify OTP
   - ✅ Should redirect to dashboard

2. **Check Authentication**
   - ✅ Open Chrome DevTools (F12)
   - ✅ Go to Application → Local Storage
   - ✅ Verify `jecoplus_access_token` exists
   - ✅ Verify `csrf_token` exists

### Step 2: Dashboard

1. **Quick Access Buttons**
   - ✅ Click "AI Assistant" → Chat widget opens
   - ✅ Click "Money Coach" → Navigate to `/money-coach`
   - ✅ Click "Loan Assistant" → Navigate to `/loan-assistant`

### Step 3: Money Coach Page

**URL:** http://localhost:5173/money-coach

1. **Page Loads**
   - ✅ Financial summary displays
   - ✅ Spending analysis shows
   - ✅ Recommendations appear (if data exists)

2. **Chat Widget**
   - ✅ Click chat button (bottom right)
   - ✅ Type: "ช่วยวิเคราะห์การเงินของฉัน"
   - ✅ Should get response from Money Coach
   - ✅ Response should be in Thai
   - ✅ Response should be context-aware

3. **Check Network Tab**
   - ✅ Open DevTools → Network
   - ✅ Filter: XHR/Fetch
   - ✅ Look for: `/api/v1/money-coach/analyze`
   - ✅ Status: 200 OK
   - ✅ Response contains financial data

### Step 4: Loan Assistant Page

**URL:** http://localhost:5173/loan-assistant

1. **Loan Calculator**
   - ✅ Enter amount: 50000
   - ✅ Enter rate: 18
   - ✅ Enter months: 12
   - ✅ Click "คำนวณ"
   - ✅ Should show monthly installment

2. **My Loans**
   - ✅ Should display user's loans (if any)
   - ✅ Shows loan status

3. **Recommendations**
   - ✅ Should show recommended loans
   - ✅ Each loan shows details

4. **Chat Widget**
   - ✅ Type: "แนะนำสินเชื่อที่เหมาะกับฉัน"
   - ✅ Should get loan-specific response
   - ✅ Response includes loan recommendations

### Step 5: Enhanced Chat (General Mode)

1. **From Dashboard**
   - ✅ Click "AI Assistant"
   - ✅ Type: "ยอดหนี้คงเหลือเท่าไหร่?"
   - ✅ Should get RAG-enhanced response (if embeddings exist)
   - ✅ Response should reference actual data

2. **Check RAG Context**
   - ✅ Open DevTools → Network
   - ✅ Check response metadata
   - ✅ Should show `context.contextsCount` if RAG worked

---

## 🔍 Chrome DevTools Checks

### Network Tab

**Check API Calls:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: XHR
4. Test each feature and verify:

**Expected Calls:**
- ✅ `GET /api/v1/money-coach/analyze` - 200
- ✅ `POST /api/v1/money-coach/chat` - 200
- ✅ `GET /api/v1/loan-assistant/my-loans` - 200
- ✅ `POST /api/v1/loan-assistant/calculate` - 200
- ✅ `POST /api/v1/chat/messages` - 200

**Check Headers:**
- ✅ `Authorization: Bearer <token>` present
- ✅ `X-CSRF-Token` present (for POST/PUT/DELETE)
- ✅ `X-Device-ID` present

### Console Tab

**Check for Errors:**
- ✅ No red errors
- ✅ No CORS errors
- ✅ No 401/403 errors
- ✅ No CSRF errors

**Check Logs:**
- ✅ API calls logged
- ✅ Responses logged
- ✅ Chat messages logged

### Application Tab

**Local Storage:**
- ✅ `jecoplus_access_token` - JWT token
- ✅ `jecoplus_refresh_token` - Refresh token
- ✅ `csrf_token` - CSRF token
- ✅ `jecoplus_device_id` - Device ID

**Cookies:**
- ✅ `csrf_token` cookie (if using cookies)

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
1. Check backend CORS config
2. Verify frontend URL in `CORS_ORIGINS`
3. Check `backend/src/app.js` CORS settings

### Issue: 401 Unauthorized

**Error:** `401 Unauthorized` on API calls

**Fix:**
1. Check if logged in
2. Verify token in Local Storage
3. Try logging in again
4. Check token expiration

### Issue: CSRF Token Missing

**Error:** `403 Forbidden - CSRF token missing`

**Fix:**
1. Check if CSRF token is in Local Storage
2. Verify `GET /api/v1/csrf-token` is called
3. Check request headers include `X-CSRF-Token`

### Issue: RAG Not Working

**Symptom:** Responses are generic, not data-aware

**Fix:**
1. Check if embeddings table has data:
   ```sql
   SELECT COUNT(*) FROM embeddings;
   ```
2. Run initial sync:
   ```bash
   # Via API or code
   POST /api/v1/admin/rag/sync/product
   ```
3. Check RAG service logs

### Issue: Vertex AI Not Working

**Error:** `Vertex AI client not configured`

**Fix:**
1. Check `.env` has `GCP_PROJECT_ID`
2. Verify `GOOGLE_APPLICATION_CREDENTIALS` path
3. Check GCP credentials file exists
4. Verify Vertex AI API is enabled

---

## ✅ Success Criteria

### Money Coach
- ✅ Page loads without errors
- ✅ Financial data displays
- ✅ Chat responds in Thai
- ✅ Recommendations show
- ✅ No console errors

### Loan Assistant
- ✅ Calculator works
- ✅ Installment calculated correctly
- ✅ Recommendations display
- ✅ Chat responds appropriately
- ✅ No console errors

### General Chat
- ✅ Opens from dashboard
- ✅ Sends messages
- ✅ Receives responses
- ✅ RAG context works (if data exists)
- ✅ No errors

---

## 📊 Performance Checks

### Response Times
- ✅ API calls: < 1 second
- ✅ Chat responses: < 3 seconds
- ✅ Page loads: < 2 seconds

### Network
- ✅ No failed requests
- ✅ All 200 status codes
- ✅ Reasonable payload sizes

---

## 🎯 Test Scenarios

### Scenario 1: First-Time User
1. Login
2. Go to Money Coach
3. Should see "ยังไม่ได้ตั้งค่า" for income/expenses
4. Chat: "ช่วยตั้งค่าโปรไฟล์การเงิน"
5. Update profile
6. Refresh page
7. Should see updated data

### Scenario 2: Existing User with Data
1. Login (user with loans/transactions)
2. Go to Money Coach
3. Should see actual spending data
4. Should see recommendations
5. Chat: "แนะนำสินค้าที่เหมาะกับฉัน"
6. Should get product recommendations

### Scenario 3: Loan Calculation
1. Go to Loan Assistant
2. Enter: 100,000 THB, 18%, 24 months
3. Calculate
4. Verify: Monthly ~4,900 THB
5. Chat: "อธิบายการคำนวณให้ฟัง"
6. Should get explanation

---

## 🔧 Debug Commands

### Check Backend Logs
```bash
# Backend terminal should show:
- API requests
- RAG context retrieval
- AI provider used
- Response times
```

### Check Database
```sql
-- Check embeddings
SELECT entity_type, COUNT(*) FROM embeddings GROUP BY entity_type;

-- Check financial profiles
SELECT COUNT(*) FROM financial_profiles;

-- Check pipeline jobs
SELECT * FROM pipeline_jobs ORDER BY created_at DESC LIMIT 5;
```

### Check Frontend Console
```javascript
// In Chrome Console
localStorage.getItem('jecoplus_access_token')
localStorage.getItem('csrf_token')

// Check API service
import api from '@/services/api'
api.get('/money-coach/analyze')
```

---

## 📝 Test Results Template

```
Date: __________
Browser: Chrome __________
Backend: Running on port 3000
Frontend: Running on port 5173

✅ Login: PASS/FAIL
✅ Dashboard: PASS/FAIL
✅ Money Coach: PASS/FAIL
✅ Loan Assistant: PASS/FAIL
✅ Chat (General): PASS/FAIL
✅ Chat (Money Coach): PASS/FAIL
✅ Chat (Loan Assistant): PASS/FAIL
✅ RAG Context: PASS/FAIL
✅ CSRF Protection: PASS/FAIL

Issues Found:
- 

Notes:
- 
```

---

## 🎉 Ready to Test!

**Start both servers and open Chrome!**

1. Backend: `cd backend && npm run dev`
2. Frontend: `npm run dev`
3. Chrome: http://localhost:5173

**Happy Testing! 🚀**
