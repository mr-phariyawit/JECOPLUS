# AI Architecture Overview & Setup

## 🧠 Introduction
JECOPLUS employs a Multi-Model AI approach. Currently, it integrates **Claude (Anthropic)** and **Gemini (Google)** for chat features. The roadmap moves towards an **AI-360** architecture using **Vertex AI**, **RAG (Retrieval-Augmented Generation)**, and specialized services (Money Coach, Loan Assistant).

---

## 🆚 Current System vs. AI-360 Vision

| Feature | Current System | AI-360 Plan | Gap |
|---------|---------------|-------------|-----|
| **AI Providers** | Claude + Gemini API | Vertex AI + Claude + Gemini | ⚠️ Missing Vertex AI |
| **Data Awareness** | ❌ None | ✅ Full RAG | 🔴 Critical Gap |
| **Money Coach** | ❌ None | ✅ Complete Service | 🔴 Critical Gap |
| **Loan Assistant** | ❌ None | ✅ Complete Service | 🔴 Critical Gap |
| **Marketplace AI** | ❌ None | ✅ RAG Recommendations | 🔴 Critical Gap |
| **Vector DB** | ❌ None | ✅ pgvector | 🔴 Critical Gap |

### Key Improvements in AI-360
1.  **Vertex AI Integration**: Moving to enterprise-grade SDKs.
2.  **Data Awareness (RAG)**: AI can access user loans, transaction history, and products via `pgvector`.
3.  **Specialized Agents**: Dedicated "Money Coach" and "Loan Assistant" agents with specific system prompts.

---

## 🚀 Setup Guide

### 1. Prerequisites
- Node.js 20+
- PostgreSQL with `vector` extension
- Google Cloud Project with Vertex AI enabled

### 2. Environment Configuration (`backend/.env`)

**Current System (Direct API Keys):**
```bash
AI_DEFAULT_PROVIDER=gemini
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

**AI-360 System (Vertex AI):**
```bash
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

### 3. Installation
```bash
cd backend
npm install @anthropic-ai/sdk @google/generative-ai @google-cloud/vertexai @google-cloud/aiplatform
```

### 4. Database Setup
```bash
cd backend
# Enable pgvector
psql -d jecoplus -c "CREATE EXTENSION IF NOT EXISTS vector;"
# Run migrations
npm run migrate
```

---

## 🧪 Testing

### Test AI Chat API
```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "gemini"}'
```

### Troubleshooting
- **No AI providers configured**: Check `.env` keys.
- **Extension vector does not exist**: Run `CREATE EXTENSION vector;` in Postgres.
