# ⚡ Quick Start Testing Guide

This guide provides the fastest path to test the JECO+ application, covering both Quick Tests and Chrome-specific workflows.

---

## 🚀 3-Step Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```
*Wait for: "Server started on port 3000"*

### 2. Start Frontend
```bash
# In another terminal
npm run dev
```
*Wait for: "Local: http://localhost:5173"*

### 3. Test!
Open **http://localhost:5173** in your browser.

---

## 🧪 Quick Test Scenarios

### Test 1: Frontend UI (No Database Required)
1. **Open** http://localhost:5173
2. **Click** the Red FAB (Floating Action Button) in bottom-right.
3. **Verify** Chat widget opens.
4. **Click** "สมัครสินเชื่อ" quick action.
5. **Success:** Instant response about loans appears.

### Test 2: Dashboard & Navigation
1. **Login** with test account (e.g., `0812345678`).
2. **Go to Dashboard**.
3. **Click "Money Coach"** -> Should navigate to `/money-coach`.
4. **Click "Loan Assistant"** -> Should navigate to `/loan-assistant`.

---

## 🔧 Automated API Test
To verify the backend API without a browser:

```bash
cd backend
node test-chat-api.js
```
*This script tests authentication, sending messages, and retrieving conversation history.*

---

## ❌ Common Troubleshooting

- **"No AI providers configured"**: Add `GEMINI_API_KEY` to `backend/.env`.
- **"Database error"**: Run `npm run migrate` in `backend/`.
- **"401 Unauthorized"**: Re-login to refresh your token.
