# 🔧 Backend & API Technical Documentation

**Generated:** Jan 2026
**Status:** Backend running, Staging deployed (Success)

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client[Frontend (Vue 3)] -->|HTTPS| API[Backend API (Express)]
    API -->|SQL| DB[(PostgreSQL)]
    API -->|Auth| Firebase[Firebase Auth]
    API -->|AI| Vertex[Vertex AI / Gemini]
    API -->|OCR| Vision[Google Cloud Vision]
    
    subgraph GCP [Google Cloud Platform]
        CloudRun[Cloud Run]
        SQL[Cloud SQL]
        Secret[Secret Manager]
    end
```

---

## 🚀 Deployment Status

### Staging Environment
- **Frontend:** https://jecoplus-staging.web.app (Firebase Hosting)
- **Backend:** https://jecoplus-api-rjpmzhdy4a-as.a.run.app (Cloud Run)
- **Region:** asia-southeast1
- **Status:** ✅ Fully Operational (Sprint 13 Verified)

### Infrastructure Components
- **Artifact Registry:** Docker images
- **Cloud Run:** Serverless container execution
- **Secret Manager:** Secure credential storage (`DB_PASSWORD`, `JWT_SECRET`)
- **Cloud SQL:** PostgreSQL 15 (Staging DB created)

---

## 🔌 API Endpoints Inventory

### Authentication
- `POST /api/v1/auth/login` - OTP Login
- `POST /api/v1/auth/refresh` - Refresh Token

### Admin Portal
- `GET /api/v1/admin/dashboard/stats` - Real-time metrics
- `GET /api/v1/admin/loans` - Loan Management
- `POST /api/v1/admin/loans/:id/approve` - Loan Approval Workflow

### AI Chat
- `POST /api/v1/chat/message` - RAG-enabled chat
- `GET /api/v1/chat/history` - Conversation history

---

## 🛠️ Technology Stack

| Component | Technology | Version | Usage |
|---|---|---|---|
| **Runtime** | Node.js | v20+ | Core Server |
| **Framework** | Express.js | 4.21 | API Handling |
| **Database** | PostgreSQL | 15 | Relational Data |
| **ORM** | PG (node-postgres) | 8.13 | DB Driver |
| **Auth** | JWT + Firebase | - | Security |
| **AI** | Vertex AI SDK | - | LLM Integration |

---

## 📝 Configuration & Environment

### Security Headers
Implemented via `helmet`:
- CSP (Content Security Policy)
- HSTS (Strict Transport Security)
- XSS Filter

### Rate Limiting
Tiered limits implemented:
- **Critical Admin:** 5 req/min
- **File Uploads:** 5 req/min
- **General Write:** 10 req/min

---

## 🔍 Database Schema

Key tables available (migrations managed):
1. `users` - Core identity
2. `wallets` - Financial balance
3. `loan_applications` - Loan workflow
4. `credit_scores` - 6-factor scoring
5. `admin_activity_logs` - Audit trail
6. `embeddings` - Vector storage for RAG
