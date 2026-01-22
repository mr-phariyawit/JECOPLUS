# 🧪 Chrome Testing - Quick Start

**Ready to test in Chrome browser right now!**

---

## ⚡ 3-Step Start

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

**Wait for:**
```
✅ Server started on port 3000
✅ Database connected successfully
✅ Job scheduler started
```

### Step 2: Start Frontend
```bash
# In new terminal
npm run dev
```

**Wait for:**
```
✅ VITE ready
✅ Local: http://localhost:5173
```

### Step 3: Open Chrome
1. Open Chrome browser
2. Go to: **http://localhost:5173**
3. Login with your account
4. Start testing!

---

## 🎯 Quick Test Path

### Test 1: Dashboard (30 seconds)
1. ✅ Login
2. ✅ See dashboard
3. ✅ Click "Money Coach" button
4. ✅ Should navigate to `/money-coach`

### Test 2: Money Coach (1 minute)
1. ✅ Page loads
2. ✅ See financial summary (or "ยังไม่ได้ตั้งค่า")
3. ✅ Click chat button (bottom right)
4. ✅ Type: "สวัสดี"
5. ✅ Get response in Thai

### Test 3: Loan Assistant (1 minute)
1. ✅ Click "Loan Assistant" from dashboard
2. ✅ See calculator
3. ✅ Enter: 50000, 18, 12
4. ✅ Click "คำนวณ"
5. ✅ See monthly installment

### Test 4: Chat Modes (1 minute)
1. ✅ From dashboard, click "AI Assistant"
2. ✅ Type: "แนะนำสินเชื่อ"
3. ✅ Get general response
4. ✅ Go to Money Coach page
5. ✅ Chat there - should be money-coach mode
6. ✅ Go to Loan Assistant page
7. ✅ Chat there - should be loan-assistant mode

---

## 🔍 Chrome DevTools Quick Checks

### Open DevTools
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

### Network Tab
1. Go to **Network** tab
2. Filter: **XHR**
3. Test features
4. Check:
   - ✅ Status codes: 200
   - ✅ No 401/403 errors
   - ✅ Response times: < 3 seconds

### Console Tab
1. Go to **Console** tab
2. Check:
   - ✅ No red errors
   - ✅ No CORS errors
   - ✅ API calls logged

### Application Tab
1. Go to **Application** → **Local Storage**
2. Check:
   - ✅ `jecoplus_access_token` exists
   - ✅ `csrf_token` exists

---

## ✅ Success Indicators

### Money Coach
- ✅ Page loads without errors
- ✅ Financial data displays (or shows "ยังไม่ได้ตั้งค่า")
- ✅ Chat responds in Thai
- ✅ No console errors

### Loan Assistant
- ✅ Calculator works
- ✅ Shows calculation result
- ✅ Recommendations display (if available)
- ✅ Chat responds
- ✅ No console errors

### General Chat
- ✅ Opens from dashboard
- ✅ Sends/receives messages
- ✅ Responses in Thai
- ✅ No errors

---

## 🐛 If Something Fails

### Backend Not Starting?
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check logs for errors
cd backend
npm run dev
```

### Frontend Not Starting?
```bash
# Check if port 5173 is in use
lsof -i :5173

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Errors?
1. Check backend is running
2. Check `.env` file exists
3. Check database is running
4. Check Chrome console for errors

### CORS Errors?
1. Check `backend/src/app.js` CORS config
2. Verify frontend URL in allowed origins
3. Check backend logs

---

## 📊 Expected Behavior

### Money Coach Page
- Shows financial summary card
- Shows spending analysis (if transactions exist)
- Shows recommendations (if data exists)
- Chat widget works
- All in Thai language

### Loan Assistant Page
- Calculator form visible
- "My Loans" section (if user has loans)
- Recommendations section
- Chat widget works
- All in Thai language

### Chat Widget
- Opens/closes smoothly
- Messages display correctly
- Typing indicator works
- Quick actions work (on first message)
- Responses in Thai

---

## 🎯 Test Scenarios

### Scenario A: New User
1. Login
2. Go to Money Coach
3. Should see "ยังไม่ได้ตั้งค่า"
4. Chat: "ช่วยตั้งค่าโปรไฟล์"
5. Should get guidance

### Scenario B: User with Data
1. Login (existing user)
2. Go to Money Coach
3. Should see actual data
4. Should see recommendations
5. Chat works with context

### Scenario C: Loan Calculation
1. Go to Loan Assistant
2. Calculate: 100,000 @ 18% for 24 months
3. Should show ~4,900 THB/month
4. Chat: "อธิบายการคำนวณ"
5. Should get explanation

---

## 🚀 Ready!

**Everything is set up. Just:**
1. Start backend
2. Start frontend  
3. Open Chrome
4. Test!

**Happy Testing! 🎉**
