# 🧪 Test Now - Quick Commands

## Fastest Way to Test

### 1. Run Database Migration
```bash
cd backend
npm run migrate
```

### 2. Add API Key to `.env`
```bash
# Edit backend/.env and add:
GEMINI_API_KEY=your-key-here
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Test (Choose One)

#### Option A: Automated Test Script
```bash
# In another terminal
cd backend
node test-chat-api.js
```

#### Option B: Browser Test
```bash
# In another terminal
npm run dev
# Then open http://localhost:5173
# Login: 0812345678 / 123456
# Click "AI Assistant"
```

#### Option C: cURL Test
```bash
# 1. Get token (login via browser, check localStorage for token)
# 2. Test API:
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "สวัสดีครับ"}'
```

---

## ✅ What to Look For

**Backend logs should show:**
```
Generating response with gemini for message: สวัสดีครับ...
```

**Browser console (F12) should show:**
- API call to `/api/v1/chat/messages`
- Response with real AI text

**Database should have:**
```sql
SELECT COUNT(*) FROM conversations;  -- Should be > 0
SELECT COUNT(*) FROM messages;        -- Should be > 0
```

---

## ❌ Common Issues

1. **"No AI providers configured"**
   → Add `GEMINI_API_KEY` to `backend/.env`

2. **"Database error"**
   → Run: `cd backend && npm run migrate`

3. **"401 Unauthorized"**
   → Make sure you're logged in

4. **Still mock responses**
   → Check backend is running and API keys are set

---

See `QUICK_TEST.md` for detailed instructions.
