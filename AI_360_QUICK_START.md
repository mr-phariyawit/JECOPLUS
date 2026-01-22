# AI 360° Quick Start Guide

**Quick reference for implementing the complete AI system**

---

## 🚀 Prerequisites Checklist

- [ ] GCP Project created
- [ ] Vertex AI API enabled
- [ ] GCP Service Account with Vertex AI permissions
- [ ] Service account key downloaded (`gcp-credentials.json`)
- [ ] PostgreSQL database running
- [ ] Node.js 20+ installed

---

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd backend
npm install @google-cloud/vertexai @google-cloud/aiplatform node-cron
```

### 2. Set Environment Variables

Add to `backend/.env`:

```bash
# Vertex AI
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
VERTEX_EMBEDDING_MODEL=text-embedding-004
GCP_CREDENTIALS_PATH=./gcp-credentials.json

# AI Default Provider
AI_DEFAULT_PROVIDER=vertex-ai
```

### 3. Set Up GCP Authentication

```bash
# Option 1: Service Account Key File
export GOOGLE_APPLICATION_CREDENTIALS="./gcp-credentials.json"

# Option 2: gcloud CLI
gcloud auth application-default login
```

### 4. Run Database Migrations

```bash
cd backend

# Enable pgvector extension
psql -d jecoplus -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
npm run migrate
```

### 5. Start Development

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd ..
npm run dev
```

---

## 📁 File Structure Created

```
backend/
├── src/
│   ├── config/
│   │   └── vertexAI.js              # NEW
│   ├── services/
│   │   ├── vertexAIService.js       # NEW
│   │   ├── embeddingService.js      # NEW
│   │   ├── ragService.js            # NEW
│   │   ├── moneyCoachService.js     # NEW
│   │   ├── loanAssistantService.js # NEW
│   │   └── aiChatService.js         # UPDATED
│   ├── controllers/
│   │   ├── moneyCoachController.js  # NEW
│   │   └── loanAssistantController.js # NEW
│   ├── routes/
│   │   ├── moneyCoach.js           # NEW
│   │   └── loanAssistant.js        # NEW
│   ├── jobs/
│   │   ├── ragPipelineJob.js       # NEW
│   │   └── scheduler.js             # NEW
│   └── server.js                    # UPDATED
├── migrations/
│   ├── 008_rag_pipeline_schema.sql  # NEW
│   └── 009_financial_profile_schema.sql # NEW
└── package.json                     # UPDATED

src/
├── views/
│   ├── MoneyCoachView.vue          # NEW
│   └── LoanAssistantView.vue       # NEW
└── components/
    └── chat/
        └── AIChatWidget.vue         # UPDATED
```

---

## 🧪 Testing Checklist

### Phase 1: Vertex AI
```bash
# Test Vertex AI connection
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Phase 2: RAG Pipeline
```bash
# Trigger manual sync (via admin API or direct DB)
# Check embeddings table
psql -d jecoplus -c "SELECT COUNT(*) FROM embeddings;"
```

### Phase 3: Money Coach
```bash
# Get financial analysis
curl -X GET http://localhost:3000/api/v1/money-coach/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Phase 4: Loan Assistant
```bash
# Get loan recommendations
curl -X GET "http://localhost:3000/api/v1/loan-assistant/recommend?amount=50000&termMonths=12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Common Issues & Solutions

### Issue: "Vertex AI client not configured"
**Solution:** Check `GCP_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS`

### Issue: "Extension vector does not exist"
**Solution:** Run `CREATE EXTENSION vector;` in PostgreSQL

### Issue: "No AI providers are configured"
**Solution:** Verify at least one provider (Vertex AI, Claude, or Gemini) is configured

### Issue: Slow vector search
**Solution:** Ensure IVFFlat index is created: `CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);`

---

## 📊 Monitoring

### Check Pipeline Jobs
```sql
SELECT * FROM pipeline_jobs ORDER BY created_at DESC LIMIT 10;
```

### Check Embeddings Count
```sql
SELECT entity_type, COUNT(*) FROM embeddings GROUP BY entity_type;
```

### Check Vector Search Performance
```sql
EXPLAIN ANALYZE SELECT * FROM embeddings 
WHERE 1 - (embedding <=> $1::vector) >= 0.7 
ORDER BY similarity DESC LIMIT 5;
```

---

## 🎯 Implementation Order

1. **Day 1-2:** Phase 1 (Vertex AI Migration)
2. **Day 3-5:** Phase 2 (RAG Pipeline)
3. **Day 6-8:** Phase 3 (Money Coach)
4. **Day 9-10:** Phase 4 (Loan Assistant)
5. **Day 11-12:** Integration & Testing
6. **Day 13-14:** Deployment & Documentation

---

## 💡 Pro Tips

1. **Start with small data:** Test RAG with 10-20 products first
2. **Monitor costs:** Set up GCP billing alerts
3. **Cache embeddings:** Reuse embeddings for similar queries
4. **Batch operations:** Process embeddings in batches of 100
5. **Error handling:** Always have fallback to non-RAG responses

---

## 📚 Additional Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Full Implementation Plan](./AI_360_IMPLEMENTATION_PLAN.md)

---

**Ready to code! 🚀**
