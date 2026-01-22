# AI Chat Feature - Testing Guide

**Date:** January 2026  
**Status:** Complete Testing Instructions

---

## Prerequisites

### 1. Database Setup

**Run the migration:**
```bash
cd backend
npm run migrate
```

Or manually:
```bash
# Make sure PostgreSQL is running
psql -U jecoplus -d jecoplus -f migrations/007_chat_schema.sql
```

**Verify tables created:**
```sql
-- Connect to database
psql -U jecoplus -d jecoplus

-- Check tables
\dt conversations
\dt messages

-- Check structure
\d conversations
\d messages
```

### 2. Environment Variables

Create or update `.env` file in `backend/`:

```env
# AI Provider API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-...        # For Claude (optional)
GEMINI_API_KEY=your-gemini-key       # For Gemini (optional)

# Default provider (if both are set)
AI_DEFAULT_PROVIDER=gemini           # or 'claude'

# Optional: Model selection
CLAUDE_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-1.5-ultra

# Database (if not already set)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jecoplus
DB_USER=jecoplus
DB_PASSWORD=your_password

# JWT (if not already set)
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

**Get API Keys:**
- **Claude (Anthropic):** https://console.anthropic.com/
- **Gemini (Google):** https://makersuite.google.com/app/apikey

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if not already done)
cd ../src
npm install
```

---

## Testing Methods

### Method 1: Manual API Testing (Postman/cURL)

#### Step 1: Get Authentication Token

**Login to get JWT token:**
```bash
# Request OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0812345678",
    "deviceId": "test-device"
  }'

# Response will include sessionId and devOtp (in development)
# Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-id-from-previous-response",
    "otp": "123456",
    "deviceId": "test-device"
  }'

# Response will include accessToken - save this!
```

#### Step 2: Test Chat Endpoints

**Set your token:**
```bash
export TOKEN="your-access-token-here"
```

**1. Send a message (creates conversation automatically):**
```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "สวัสดีครับ",
    "provider": "gemini"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "text": "สวัสดีค่ะ! มีอะไรให้ช่วยไหมคะ?",
    "conversationId": "uuid-here",
    "provider": "gemini",
    "metadata": {
      "model": "gemini-1.5-ultra",
      "tokens": 150,
      "responseTime": 1234
    }
  }
}
```

**2. Get conversations list:**
```bash
curl http://localhost:3000/api/v1/chat/conversations \
  -H "Authorization: Bearer $TOKEN"
```

**3. Get specific conversation with messages:**
```bash
# Use conversationId from previous response
curl http://localhost:3000/api/v1/chat/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

**4. Send follow-up message (using existing conversation):**
```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "แนะนำสินเชื่อให้หน่อย",
    "conversationId": "CONVERSATION_ID",
    "provider": "gemini"
  }'
```

**5. Create new conversation:**
```bash
curl -X POST http://localhost:3000/api/v1/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "สินเชื่อ",
    "provider": "claude"
  }'
```

**6. Delete conversation:**
```bash
curl -X DELETE http://localhost:3000/api/v1/chat/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Method 2: Frontend Testing

#### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should see: "Server started on port 3000"
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should see: "Local: http://localhost:5173"
```

#### Step 2: Test in Browser

1. **Open browser:** http://localhost:5173

2. **Login:**
   - Enter phone number (e.g., `0812345678`)
   - Click "ขอรหัส OTP"
   - In development, OTP is `123456`
   - Enter OTP and login

3. **Open Chat Widget:**
   - Click "AI Assistant" button on Dashboard, OR
   - Click the floating button (bottom-right corner)

4. **Test Chat:**
   - Type a message: "สวัสดีครับ"
   - Press Enter or click send
   - Wait for AI response (should be real AI, not mock)
   - Try quick action buttons
   - Send follow-up messages

5. **Verify:**
   - Check browser console (F12) for API calls
   - Check backend logs for AI service calls
   - Messages should persist (refresh page, chat should still be there)

---

### Method 3: Automated Testing (Jest)

#### Create Test File

Create `backend/tests/integration/chat.test.js`:

```javascript
import request from 'supertest';
import app from '../../src/app.js';
import { query } from '../../src/config/database.js';

describe('Chat API', () => {
  let authToken;
  let userId;
  let conversationId;

  beforeAll(async () => {
    // Create test user and get token
    // (Use your existing auth test setup)
  });

  afterAll(async () => {
    // Cleanup test data
    if (conversationId) {
      await query('DELETE FROM conversations WHERE id = $1', [conversationId]);
    }
  });

  describe('POST /api/v1/chat/messages', () => {
    it('should send message and get AI response', async () => {
      const response = await request(app)
        .post('/api/v1/chat/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'สวัสดี',
          provider: 'gemini',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('text');
      expect(response.body.data).toHaveProperty('conversationId');
      expect(response.body.data).toHaveProperty('provider');
      
      conversationId = response.body.data.conversationId;
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/chat/messages')
        .send({ message: 'test' })
        .expect(401);
    });

    it('should validate message is required', async () => {
      await request(app)
        .post('/api/v1/chat/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/chat/conversations', () => {
    it('should get user conversations', async () => {
      const response = await request(app)
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversations');
      expect(Array.isArray(response.body.data.conversations)).toBe(true);
    });
  });
});
```

**Run tests:**
```bash
cd backend
npm test
```

---

## Testing Checklist

### Backend API Tests

- [ ] **Authentication**
  - [ ] Unauthenticated request returns 401
  - [ ] Authenticated request works

- [ ] **Send Message**
  - [ ] Creates conversation if none exists
  - [ ] Uses existing conversation if provided
  - [ ] Returns AI response
  - [ ] Saves message to database
  - [ ] Tracks metadata (tokens, response time)

- [ ] **Get Conversations**
  - [ ] Returns user's conversations only
  - [ ] Pagination works (limit/offset)
  - [ ] Ordered by last_message_at

- [ ] **Get Conversation**
  - [ ] Returns conversation with messages
  - [ ] Messages ordered by created_at
  - [ ] Cannot access other user's conversation

- [ ] **Create Conversation**
  - [ ] Creates new conversation
  - [ ] Sets provider correctly
  - [ ] Sets system prompt if provided

- [ ] **Delete Conversation**
  - [ ] Deletes conversation and messages
  - [ ] Cannot delete other user's conversation

### Frontend Tests

- [ ] **Chat Widget**
  - [ ] Opens/closes correctly
  - [ ] FAB appears on all pages
  - [ ] Dashboard button opens widget

- [ ] **Message Sending**
  - [ ] Sends message to API
  - [ ] Displays user message
  - [ ] Shows typing indicator
  - [ ] Displays AI response
  - [ ] Handles errors gracefully

- [ ] **Conversation Persistence**
  - [ ] Messages persist after refresh
  - [ ] Conversation history loads
  - [ ] New messages append correctly

- [ ] **UI/UX**
  - [ ] Auto-scroll to bottom
  - [ ] Quick actions work
  - [ ] Mobile responsive
  - [ ] Loading states display

### Integration Tests

- [ ] **End-to-End Flow**
  - [ ] Login → Open chat → Send message → Get response
  - [ ] Multiple messages in same conversation
  - [ ] Create new conversation
  - [ ] Switch between conversations

- [ ] **Error Handling**
  - [ ] API error displays user-friendly message
  - [ ] Network error handled
  - [ ] Invalid token redirects to login

---

## Common Issues & Troubleshooting

### Issue 1: "No AI providers are configured"

**Problem:** Missing API keys

**Solution:**
```bash
# Check .env file has API keys
cat backend/.env | grep API_KEY

# Set API keys
export ANTHROPIC_API_KEY=sk-ant-...
export GEMINI_API_KEY=...
```

### Issue 2: "Conversation not found"

**Problem:** Trying to access conversation that doesn't exist or belongs to another user

**Solution:**
- Check conversationId is correct
- Verify user owns the conversation
- Create new conversation instead

### Issue 3: "Database error: relation does not exist"

**Problem:** Migration not run

**Solution:**
```bash
cd backend
npm run migrate
# Or manually run: psql -U jecoplus -d jecoplus -f migrations/007_chat_schema.sql
```

### Issue 4: "401 Unauthorized"

**Problem:** Invalid or expired token

**Solution:**
- Login again to get new token
- Check token in Authorization header
- Verify JWT_SECRET is set

### Issue 5: AI Response is Slow

**Problem:** API rate limits or network issues

**Solution:**
- Check API key quotas
- Verify network connection
- Check backend logs for errors
- Try different provider (Claude vs Gemini)

### Issue 6: Frontend Shows Mock Responses

**Problem:** Frontend still using mock service

**Solution:**
- Verify `src/services/geminiService.js` calls real API
- Check browser console for API calls
- Verify backend is running
- Check CORS settings

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Install ab (Apache Bench)
# macOS: brew install httpd
# Linux: apt-get install apache2-utils

# Test message endpoint
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -p message.json -T application/json \
  http://localhost:3000/api/v1/chat/messages
```

**Expected:**
- Response time: < 3 seconds (including AI generation)
- Success rate: > 95%

### Database Query Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM messages 
WHERE conversation_id = 'uuid' 
ORDER BY created_at ASC;

-- Should use index
```

---

## Monitoring & Logs

### Backend Logs

**Check logs for:**
```bash
# Watch backend logs
cd backend
npm run dev

# Look for:
# - "Generating response with gemini for message: ..."
# - "New conversation created"
# - Any error messages
```

### Database Monitoring

```sql
-- Check conversation count
SELECT COUNT(*) FROM conversations;

-- Check message count
SELECT COUNT(*) FROM messages;

-- Check recent conversations
SELECT id, user_id, message_count, last_message_at 
FROM conversations 
ORDER BY last_message_at DESC 
LIMIT 10;
```

### API Response Times

Monitor in logs:
- AI generation time
- Database query time
- Total response time

---

## Test Data

### Sample Test Messages

**Thai:**
- "สวัสดีครับ"
- "แนะนำสินเชื่อให้หน่อย"
- "กู้ 50000 ผ่อน 12 เดือน"
- "เช็คยอดหนี้"
- "ติดต่อพนักงาน"

**English (should still work):**
- "Hello"
- "What loans do you have?"
- "Calculate installment for 50000 baht 12 months"

### Expected Behaviors

1. **First Message:**
   - Creates new conversation
   - Returns welcome message
   - Conversation ID in response

2. **Follow-up Messages:**
   - Uses same conversation
   - Has context from previous messages
   - More personalized responses

3. **Provider Selection:**
   - Default: Uses `AI_DEFAULT_PROVIDER`
   - Can specify: `provider: 'claude'` or `'gemini'`
   - Falls back if preferred provider unavailable

---

## Success Criteria

✅ **Backend:**
- All API endpoints return correct responses
- Messages saved to database
- AI responses generated successfully
- Error handling works

✅ **Frontend:**
- Chat widget opens/closes
- Messages send and display
- AI responses appear
- Conversation persists

✅ **Integration:**
- End-to-end flow works
- Real AI responses (not mock)
- Data persists across sessions
- Performance acceptable (< 3s response time)

---

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to staging
   - User acceptance testing
   - Performance optimization

2. **If issues found:**
   - Check error logs
   - Verify configuration
   - Review code for bugs
   - Fix and retest

---

*Happy Testing! 🚀*
