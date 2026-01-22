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

```http
GET /api/v1/money-coach/analyze
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "monthly_income": 45000,
      "monthly_expenses": 30000,
      "savings_goal": 100000
    },
    "walletBalance": 5000,
    "spendingAnalysis": {
      "categories": {
        "food": 8000,
        "transport": 5000,
        "shopping": 12000
      },
      "totalSpent": 30000,
      "averageDaily": 1000
    },
    "recommendations": {
      "products": [...],
      "loans": [...]
    },
    "insights": [...]
  }
}
```

### Get Financial Profile

```http
GET /api/v1/money-coach/profile
```

### Update Financial Profile

```http
PUT /api/v1/money-coach/profile
Content-Type: application/json

{
  "monthly_income": 45000,
  "monthly_expenses": 30000,
  "savings_goal": 100000,
  "risk_tolerance": "moderate",
  "spending_categories": {
    "food": 8000,
    "transport": 5000
  }
}
```

### Chat with Money Coach

```http
POST /api/v1/money-coach/chat
Content-Type: application/json

{
  "message": "ช่วยวิเคราะห์การเงินของฉัน"
}
```

---

## 💳 Loan Assistant API

### Get User's Loans

```http
GET /api/v1/loan-assistant/my-loans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount_requested": 50000,
      "term_months": 12,
      "status": "APPROVED",
      "name": "KB Personal Loan"
    }
  ]
}
```

### Get Loan Recommendations

```http
GET /api/v1/loan-assistant/recommend?amount=50000&termMonths=12
```

**Response:**
```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "id": "uuid",
        "name": "KB Personal Loan",
        "monthlyInstallment": 4200,
        "totalInterest": 5400,
        "recommendedAmount": 50000,
        "recommendedTerm": 12
      }
    ],
    "creditScore": {
      "score": 750,
      "grade": "Good"
    }
  }
}
```

### Calculate Installment

```http
POST /api/v1/loan-assistant/calculate
Content-Type: application/json

{
  "amount": 50000,
  "annualRate": 18,
  "months": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyInstallment": 4200,
    "totalAmount": 50400,
    "totalInterest": 5400,
    "principal": 50000,
    "termMonths": 12,
    "annualRate": 18
  }
}
```

### Compare Loans

```http
POST /api/v1/loan-assistant/compare
Content-Type: application/json

{
  "loanIds": ["uuid1", "uuid2"],
  "amount": 50000,
  "termMonths": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid1",
      "name": "KB Personal Loan",
      "monthlyInstallment": 4200,
      "totalInterest": 5400,
      "annualRate": 15
    },
    {
      "id": "uuid2",
      "name": "Personal Loan",
      "monthlyInstallment": 4500,
      "totalInterest": 7000,
      "annualRate": 20
    }
  ]
}
```

### Chat with Loan Assistant

```http
POST /api/v1/loan-assistant/chat
Content-Type: application/json

{
  "message": "แนะนำสินเชื่อที่เหมาะกับฉัน"
}
```

### Get Loan Product Details

```http
GET /api/v1/loan-assistant/products/:id
```

---

## 💬 Enhanced Chat API

### Send Message (with RAG)

```http
POST /api/v1/chat/messages
Content-Type: application/json

{
  "message": "ยอดหนี้คงเหลือเท่าไหร่?",
  "provider": "vertex-ai",
  "conversationId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "ตามข้อมูลของคุณ...",
    "conversationId": "uuid",
    "provider": "vertex-ai",
    "metadata": {
      "model": "gemini-1.5-pro",
      "inputTokens": 150,
      "outputTokens": 200,
      "context": {
        "contextsCount": 3
      }
    }
  }
}
```

---

## 🔧 Admin API (Future)

### Trigger Manual Sync

```http
POST /api/v1/admin/rag/sync/:entityType
```

**Entity Types:** `product`, `loan`, `user_profile`, `transaction`

### Get Pipeline Jobs

```http
GET /api/v1/admin/rag/jobs?limit=10&entityType=product
```

### Get Pipeline Statistics

```http
GET /api/v1/admin/rag/stats
```

---

## 📝 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Example cURL Commands

### Money Coach Analysis

```bash
curl -X GET http://localhost:3000/api/v1/money-coach/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Loan Calculator

```bash
curl -X POST http://localhost:3000/api/v1/loan-assistant/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "annualRate": 18,
    "months": 12
  }'
```

### Chat with Money Coach

```bash
curl -X POST http://localhost:3000/api/v1/money-coach/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ช่วยวิเคราะห์การเงินของฉัน"
  }'
```

---

**All endpoints are ready to use! 🚀**
