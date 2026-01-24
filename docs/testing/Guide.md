# 🧪 JECOPLUS Testing Guide

**Status:** Complete Testing Instructions
**Date:** January 2026

---

## 📋 Prerequisites

### 1. Database Setup
```bash
cd backend
npm run migrate
```

### 2. Environment Variables
Ensure `backend/.env` has:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- `GEMINI_API_KEY` or `ANTHROPIC_API_KEY`
- `AI_DEFAULT_PROVIDER`

### 3. Start Servers
- **Backend:** `cd backend && npm run dev` (Port 3000)
- **Frontend:** `npm run dev` (Port 5173)

---

## 🌐 Chrome Testing Checklist

### Step 1: Login & Authentication
- [ ] Enter phone number & Request OTP.
- [ ] Verify OTP & Redirect to dashboard.
- [ ] Check DevTools -> Application -> Local Storage for `jecoplus_access_token`.

### Step 2: Dashboard & Navigation
- [ ] Verify "AI Assistant" opens chat.
- [ ] Verify "Money Coach" navigates correctly.
- [ ] Verify "Loan Assistant" navigates correctly.

### Step 3: Money Coach
- [ ] Page loads financial summary.
- [ ] Chat widget context is set to 'money-coach'.
- [ ] Recommendations appear.

### Step 4: Loan Assistant
- [ ] Calculator works (Calculate installment).
- [ ] "My Loans" list displays correctly.
- [ ] Chat widget context is set to 'loan-assistant'.

---

## 🤖 AI Chat Testing

### Mode A: Frontend-Only Check
*Works even without backend database connection.*
1. Open Chat Widget.
2. Click **Quick Actions** (e.g., "สมัครสินเชื่อ").
3. Verify immediate UI response.

### Mode B: Full Integration Test
*Requires Database & API Keys.*
1. Type a custom message: "สวัสดีครับ".
2. Wait for AI response (real AI generation).
3. Verify response is saved (refresh page to check history).

### Mode C: API Testing (cURL)
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "สวัสดี", "provider": "gemini"}'
```

---

## 🐛 Troubleshooting

### Common Issues
1. **"No AI providers are configured"**
   - **Fix:** Add API key to `.env`.
2. **"Conversation not found"**
   - **Fix:** Ensure you are accessing your own conversation.
3. **"Database error: relation does not exist"**
   - **Fix:** Run database migrations.
4. **"401 Unauthorized"**
   - **Fix:** Re-login to get a fresh token.

---

## 📊 Success Criteria
- ✅ **Frontend:** Chat opens, messages send, UI responsive.
- ✅ **Backend:** API returns 200, saves to DB.
- ✅ **Integration:** End-to-end flow works, data persists.
