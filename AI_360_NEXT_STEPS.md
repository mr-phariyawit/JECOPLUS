# AI-360 Next Steps & Integration Guide

**Status:** Backend Complete ✅ | Frontend Integration Pending

---

## ✅ What's Complete

### Backend Implementation (100%)
- ✅ Vertex AI integration
- ✅ RAG pipeline with vector search
- ✅ Money Coach service
- ✅ Loan Assistant service
- ✅ 15+ API endpoints
- ✅ Cookie parser integrated
- ✅ CSRF protection (existing implementation)

---

## 🔄 Next Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

**New packages added:**
- `cookie-parser` ✅ (integrated)
- `csurf` (available, but existing CSRF middleware is in use)

### 2. Database Migrations

```bash
# Enable pgvector
psql -d jecoplus -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
cd backend
npm run migrate
```

This will create:
- `embeddings` table (vector storage)
- `pipeline_jobs` table (ETL tracking)
- `vector_search_cache` table (caching)
- `financial_profiles` table (money coach data)

### 3. Environment Configuration

Add to `backend/.env`:

```bash
# Vertex AI
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
VERTEX_EMBEDDING_MODEL=text-embedding-004
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json

# AI Provider
AI_DEFAULT_PROVIDER=vertex-ai

# CSRF (optional - for development)
SKIP_CSRF=false
```

### 4. Initial Data Sync

After migrations, trigger initial RAG sync:

```javascript
// Option 1: Via code
import ragPipelineJob from './jobs/ragPipelineJob.js';
await ragPipelineJob.fullSync('product');
await ragPipelineJob.fullSync('loan');

// Option 2: Wait for scheduled job (runs at 2 AM daily)
```

### 5. Frontend Integration

#### Update API Service

**File:** `src/services/api.js`

Add CSRF token support:

```javascript
// Get CSRF token on app init
let csrfToken = null;

export const getCSRFToken = async () => {
  if (!csrfToken) {
    const response = await axios.get(`${API_URL}/csrf-token`);
    csrfToken = response.data.csrfToken;
  }
  return csrfToken;
};

// Update request interceptor
api.interceptors.request.use(async (config) => {
  // ... existing code ...
  
  // Add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
    const token = await getCSRFToken();
    config.headers['X-CSRF-Token'] = token;
  }
  
  return config;
});
```

#### Create Money Coach View

**File:** `src/views/MoneyCoachView.vue` (NEW)

```vue
<template>
  <div class="money-coach-view">
    <h1>Money Coach</h1>
    
    <!-- Financial Summary -->
    <FinancialSummaryCard v-if="analysis" :analysis="analysis" />
    
    <!-- Product Recommendations -->
    <ProductRecommendations 
      v-if="analysis?.recommendations?.products"
      :products="analysis.recommendations.products"
    />
    
    <!-- Chat Widget -->
    <AIChatWidget mode="money-coach" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import FinancialSummaryCard from '@/components/money-coach/FinancialSummaryCard.vue';
import ProductRecommendations from '@/components/money-coach/ProductRecommendations.vue';
import AIChatWidget from '@/components/chat/AIChatWidget.vue';

const analysis = ref(null);

onMounted(async () => {
  try {
    const response = await api.get('/money-coach/analyze');
    analysis.value = response.data.data;
  } catch (error) {
    console.error('Failed to load financial analysis:', error);
  }
});
</script>
```

#### Create Loan Assistant View

**File:** `src/views/LoanAssistantView.vue` (NEW)

```vue
<template>
  <div class="loan-assistant-view">
    <h1>Loan Assistant</h1>
    
    <!-- Loan Calculator -->
    <LoanCalculator @calculate="handleCalculate" />
    
    <!-- Recommendations -->
    <LoanRecommendations v-if="recommendations" :loans="recommendations.loans" />
    
    <!-- Chat Widget -->
    <AIChatWidget mode="loan-assistant" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/services/api';
import LoanCalculator from '@/components/loan/LoanCalculator.vue';
import LoanRecommendations from '@/components/loan/LoanRecommendations.vue';
import AIChatWidget from '@/components/chat/AIChatWidget.vue';

const recommendations = ref(null);

const handleCalculate = async (amount, rate, months) => {
  try {
    const response = await api.post('/loan-assistant/calculate', {
      amount,
      annualRate: rate,
      months,
    });
    // Handle calculation result
  } catch (error) {
    console.error('Calculation failed:', error);
  }
};
</script>
```

#### Update Chat Widget

**File:** `src/components/chat/AIChatWidget.vue` (UPDATE)

Add mode support:

```javascript
const props = defineProps({
  mode: {
    type: String,
    default: 'general', // 'general', 'money-coach', 'loan-assistant'
  },
});

// Update sendMessage to use correct endpoint
const sendMessage = async (text) => {
  let endpoint = '/chat/messages';
  
  if (props.mode === 'money-coach') {
    endpoint = '/money-coach/chat';
  } else if (props.mode === 'loan-assistant') {
    endpoint = '/loan-assistant/chat';
  }
  
  // ... rest of implementation
};
```

### 6. Testing

#### Test Vertex AI

```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test Vertex AI"}'
```

#### Test Money Coach

```bash
curl -X GET http://localhost:3000/api/v1/money-coach/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Loan Assistant

```bash
curl -X POST http://localhost:3000/api/v1/loan-assistant/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "annualRate": 18, "months": 12}'
```

---

## 📋 Component Checklist

### Money Coach Components
- [ ] `FinancialSummaryCard.vue`
- [ ] `ProductRecommendations.vue`
- [ ] `SpendingAnalysisChart.vue`
- [ ] `BudgetInsightsCard.vue`

### Loan Assistant Components
- [ ] `LoanCalculator.vue`
- [ ] `LoanComparisonTable.vue`
- [ ] `LoanRecommendations.vue`
- [ ] `MyLoansCard.vue`

### Enhanced Chat
- [ ] Update `AIChatWidget.vue` with mode support
- [ ] Add product cards in chat
- [ ] Add loan cards in chat

---

## 🔧 Configuration Options

### CSRF Protection

The system uses a custom CSRF implementation. If you want to use `csurf` instead:

1. Update `backend/src/middleware/csrf.js` to use csurf
2. Or use the enhanced version in `backend/src/middleware/csrfEnhanced.js`

### RAG Pipeline

Configure sync schedule in `backend/src/jobs/scheduler.js`:

```javascript
// Daily sync at 2 AM
cron.schedule('0 2 * * *', ...)

// Incremental sync every 6 hours
cron.schedule('0 */6 * * *', ...)
```

### Vector Search

Adjust similarity threshold in `backend/src/services/ragService.js`:

```javascript
similarityThreshold: 0.7 // Default, adjust as needed
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All migrations run
- [ ] Environment variables set
- [ ] GCP credentials configured
- [ ] Initial data sync completed
- [ ] Tests passing

### Production
- [ ] Enable CSRF protection (`SKIP_CSRF=false`)
- [ ] Set secure cookies
- [ ] Configure CORS origins
- [ ] Set up monitoring
- [ ] Configure backup strategy

---

## 📊 Monitoring

### Check Pipeline Jobs

```sql
SELECT * FROM pipeline_jobs 
WHERE status = 'running' 
ORDER BY created_at DESC;
```

### Check Embeddings

```sql
SELECT entity_type, COUNT(*) 
FROM embeddings 
GROUP BY entity_type;
```

### Check Cache Performance

```sql
SELECT COUNT(*) as cached_queries,
       COUNT(*) FILTER (WHERE expires_at > NOW()) as active_cache
FROM vector_search_cache;
```

---

## 🎯 Success Metrics

Track these metrics:
- **Response Time:** < 3 seconds (with RAG)
- **Vector Search:** < 100ms
- **Cache Hit Rate:** > 70%
- **Pipeline Sync:** Daily success rate > 95%
- **User Engagement:** Money Coach usage
- **Conversion:** Loan recommendations → applications

---

## 📚 Documentation

- **API Reference:** `AI_360_API_REFERENCE.md`
- **Implementation Plan:** `AI_360_IMPLEMENTATION_PLAN.md`
- **Progress:** `AI_360_IMPLEMENTATION_PROGRESS.md`
- **Complete Guide:** `AI_360_IMPLEMENTATION_COMPLETE.md`

---

**Backend is ready! Now integrate the frontend components. 🚀**
