# AI-360 API Reference

Quick reference guide for all AI-360 endpoints.

---

## 🔐 Authentication

All endpoints require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 💰 Money Coach API

### Analyze Financial Situation
`GET /api/v1/money-coach/analyze`

Returns a comprehensive financial analysis including income, expenses, spending breakdown, and recommendations.

### Chat with Money Coach
`POST /api/v1/money-coach/chat`
```json
{ "message": "Analyze my spending" }
```

### Financial Profile
- `GET /api/v1/money-coach/profile`
- `PUT /api/v1/money-coach/profile`

---

## 💳 Loan Assistant API

### Get Recommendations
`GET /api/v1/loan-assistant/recommend?amount=50000&termMonths=12`

### Calculate Installment
`POST /api/v1/loan-assistant/calculate`
```json
{
  "amount": 50000,
  "annualRate": 18,
  "months": 12
}
```

### Compare Loans
`POST /api/v1/loan-assistant/compare`
```json
{
  "loanIds": ["uuid1", "uuid2"],
  "amount": 50000,
  "termMonths": 12
}
```

---

## 💬 Enhanced Chat API

### Send Message (with RAG)
`POST /api/v1/chat/messages`

```json
{
  "message": "What is my loan balance?",
  "provider": "vertex-ai",
  "conversationId": "optional-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Based on your records...",
    "metadata": {
      "model": "gemini-1.5-pro",
      "context": { "contextsCount": 3 }
    }
  }
}
```
