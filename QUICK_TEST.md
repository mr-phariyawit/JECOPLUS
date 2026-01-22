# Quick Test Guide - AI Chat Feature

## 🚀 Quick Start Testing

### Step 1: Setup Database

```bash
cd backend
npm run migrate
```

This will create the `conversations` and `messages` tables.

### Step 2: Configure API Keys

Edit `backend/.env` and add at least one AI provider:

```env
# Option 1: Gemini (Recommended for testing)
GEMINI_API_KEY=your-gemini-api-key-here
AI_DEFAULT_PROVIDER=gemini

# Option 2: Claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_DEFAULT_PROVIDER=claude
```

**Get API Keys:**
- **Gemini:** https://makersuite.google.com/app/apikey
- **Claude:** https://console.anthropic.com/

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server started on port 3000
Database connected successfully
```

### Step 4: Test API (Choose one method)

#### Method A: Automated Test Script

```bash
cd backend
node test-chat-api.js
```

This will:
- ✅ Test authentication
- ✅ Send a test message
- ✅ Get conversations
- ✅ Get conversation details

#### Method B: Manual cURL Test

**1. Get Auth Token:**
```bash
# Request OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "0812345678", "deviceId": "test"}'

# Verify OTP (use sessionId from above, OTP is 123456 in dev)
curl -X POST http://localhost:3000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID", "otp": "123456", "deviceId": "test"}'

# Save the accessToken from response
```

**2. Send Message:**
```bash
export TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "สวัสดีครับ", "provider": "gemini"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "text": "สวัสดีค่ะ! มีอะไรให้ช่วยไหมคะ?",
    "conversationId": "uuid-here",
    "provider": "gemini",
    "metadata": {...}
  }
}
```

#### Method C: Frontend Testing

**1. Start Frontend:**
```bash
# In another terminal
npm run dev
```

**2. Open Browser:**
- Go to: http://localhost:5173
- Login: Phone `0812345678`, OTP `123456`
- Click "AI Assistant" button (or floating button)
- Type: "สวัสดีครับ"
- Press Enter

**3. Verify:**
- ✅ Message appears in chat
- ✅ AI response appears (real AI, not mock)
- ✅ Check browser console (F12) - should see API calls
- ✅ Check backend logs - should see "Generating response with gemini..."

---

## ✅ Success Indicators

### Backend Logs Should Show:
```
Generating response with gemini for message: สวัสดีครับ...
New conversation created
```

### Browser Console Should Show:
- API call to `/api/v1/chat/messages`
- Response with `success: true`
- Real AI text in response

### Database Should Have:
```sql
-- Check conversations
SELECT COUNT(*) FROM conversations;

-- Check messages  
SELECT COUNT(*) FROM messages;

-- View recent
SELECT c.id, c.user_id, c.message_count, m.content 
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
ORDER BY c.last_message_at DESC
LIMIT 5;
```

---

## ❌ Troubleshooting

### "No AI providers are configured"
**Fix:** Add API key to `backend/.env`

### "401 Unauthorized"
**Fix:** Make sure you're logged in and token is valid

### "Database error: relation does not exist"
**Fix:** Run migration: `cd backend && npm run migrate`

### "Connection refused" or "ECONNREFUSED"
**Fix:** Make sure backend is running on port 3000

### Still seeing mock responses
**Fix:** 
- Check backend is running
- Check API keys are set
- Check browser console for errors
- Verify `src/services/geminiService.js` calls real API

---

## 📊 Test Checklist

- [ ] Database migration run successfully
- [ ] API keys configured in `.env`
- [ ] Backend starts without errors
- [ ] Authentication works (can login)
- [ ] Can send message via API
- [ ] AI response received (not mock)
- [ ] Conversation created in database
- [ ] Messages saved to database
- [ ] Frontend chat widget opens
- [ ] Frontend sends messages
- [ ] Frontend displays AI responses

---

## 🎯 Expected Behavior

1. **First Message:**
   - Creates new conversation automatically
   - Returns AI response
   - Saves both messages to database

2. **Follow-up Messages:**
   - Uses same conversation
   - Has context from previous messages
   - More personalized responses

3. **Conversation Persistence:**
   - Messages persist after page refresh
   - Can retrieve conversation history
   - Can list all conversations

---

## 📝 Next Steps

Once basic tests pass:
1. Test with different providers (Claude vs Gemini)
2. Test conversation history
3. Test error handling
4. Test performance (response time)
5. Test with multiple users

See `TESTING_GUIDE.md` for comprehensive testing instructions.
