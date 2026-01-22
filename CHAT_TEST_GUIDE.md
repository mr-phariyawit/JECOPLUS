# 🧪 AI Chat Testing Guide

## Test Mode 1: Frontend UI Only (No Database Required) ✅

**What works:**
- ✅ Chat widget UI
- ✅ Floating action button (FAB)
- ✅ Quick action buttons (with pre-built responses)
- ✅ Typing indicators
- ✅ Message bubbles
- ✅ Mobile responsive design

**How to test:**

1. **Open the app**
   ```
   Open browser: http://localhost:5173
   ```

2. **Look for the red floating button** (bottom-right corner)
   - Should see a pulsing red chat button
   - Should have chat icon

3. **Click the button to open chat**
   - Chat window should slide up
   - Should see header with "🤖 JECO Advisor"
   - Should see welcome message
   - Should see 4 quick action buttons

4. **Test quick actions** (These work WITHOUT backend!)
   - Click "สมัครสินเชื่อ" → Get loan info response
   - Click "เช็คค่างวด" → Get installment calculator info
   - Click "วิเคราะห์ Credit" → Get credit scoring info
   - Click "ติดต่อพนักงาน" → Get contact info

5. **Test UI elements**
   - Type in input field (should enable send button)
   - Press ESC → Chat should close
   - Click outside chat → Chat stays open (by design)
   - Click X button → Chat should close
   - Reopen chat → Welcome message should appear

6. **Test mobile view**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select iPhone 12 Pro
   - Open chat → Should be full screen

**Expected behavior:**
- ✅ All UI works perfectly
- ✅ Quick actions show instant responses
- ⚠️ Regular messages will show error (because backend isn't connected)
- ✅ Error handling shows friendly Thai message

---

## Test Mode 2: Full Integration (Requires Database + API Keys) 🔄

**Status:** Waiting for database team

**What you'll need:**
1. ✅ Database setup (waiting for DB team)
2. ⚠️ AI API key (Gemini or Claude)
3. ✅ Backend server running
4. ✅ Frontend server running

**Quick setup when ready:**

### Step 1: Database
```bash
cd backend
./setup-database.sh
```

### Step 2: API Keys
Add to `backend/.env`:
```bash
# Option A: Gemini (Google) - Easier to get
GEMINI_API_KEY=AIza...
AI_DEFAULT_PROVIDER=gemini

# Option B: Claude (Anthropic) - More advanced
ANTHROPIC_API_KEY=sk-ant-...
AI_DEFAULT_PROVIDER=claude

# Option C: Both (automatic fallback)
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
AI_DEFAULT_PROVIDER=gemini
```

### Step 3: Start Backend
```bash
cd backend
npm run dev

# Should see:
# ✅ Server running on port 3000
# ✅ Database connected
# ✅ Chat routes registered
```

### Step 4: Test Full Integration
1. Open http://localhost:5173
2. Click chat button
3. Type: "สวัสดีครับ"
4. Wait for AI response (should take 1-3 seconds)
5. See real AI response! 🤖

### Step 5: Test Advanced Features
- Multiple conversations
- Conversation history
- Provider switching (Claude vs Gemini)
- Token usage tracking
- Response time metrics

---

## Test Mode 3: API Testing (For Backend Team) 🔧

**Test endpoints with curl:**

### 1. Send Message
```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "สวัสดีครับ",
    "provider": "gemini"
  }'
```

### 2. List Conversations
```bash
curl http://localhost:3000/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Conversation
```bash
curl http://localhost:3000/api/v1/chat/conversations/CONV_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Troubleshooting

### Problem: Chat button not appearing
**Solution:**
- Check that App.vue includes `<AIChatWidget />` and `<AIChatFAB />`
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors

### Problem: Quick actions not working
**Solution:**
- This should work even without backend
- Check browser console for errors
- Verify chat store is imported correctly

### Problem: Backend connection failed
**Solution:**
- Confirm backend is running: `curl http://localhost:3000/health`
- Check .env file has correct API keys
- Verify database is running
- Check backend console for errors

### Problem: AI responses are errors
**Solution:**
- This is EXPECTED without database setup
- Quick actions should still work
- Wait for database team to complete setup

---

## ✅ Success Criteria

### Frontend Only Test (Now)
- [ ] Chat button appears
- [ ] Chat opens/closes smoothly
- [ ] Welcome message displays
- [ ] Quick actions work and show responses
- [ ] Typing indicator animates
- [ ] UI is mobile responsive
- [ ] Error handling works gracefully

### Full Integration Test (When DB Ready)
- [ ] Regular messages get AI responses
- [ ] Conversations are saved
- [ ] Can switch between Claude/Gemini
- [ ] Message history persists
- [ ] Multiple conversations work
- [ ] Delete conversation works
- [ ] Token usage is tracked

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend UI | ✅ Ready | Test now! |
| Backend API | ✅ Ready | Waiting for DB |
| Database | 🔄 Pending | DB team working |
| AI API Keys | ⚠️ Optional | For real AI responses |
| Tests | ✅ Complete | 39 tests written |

---

## 🚀 What to Test RIGHT NOW

1. **Open browser:** http://localhost:5173
2. **Click:** Red floating button (bottom-right)
3. **See:** Beautiful chat interface ✨
4. **Click:** "สมัครสินเชื่อ" quick action
5. **See:** Instant response about loans 🎉
6. **Play:** Try all 4 quick actions
7. **Enjoy:** The typing animation and smooth UI 😊

**That's it!** You can fully test the chat UI right now, even without the database! 🎊

---

## 📝 Notes

- Quick actions use **pre-built responses** (no API needed)
- Regular messages need backend API
- Backend needs database + API keys
- Frontend works independently for UI testing
- All 39 tests can run without database (use mocks)

---

**Ready to test?** Just open the app and click that red button! 🚀
