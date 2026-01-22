# AI Chat Feature Specification - Comprehensive Analysis

**Document:** `specs/features/ai_chat.md`  
**Analysis Date:** January 2026  
**Status:** Specification Review

---

## Executive Summary

The AI Chat feature specification outlines a **universal AI assistant** powered by Google Gemini (via Vertex AI) with a **RAG (Retrieval-Augmented Generation) pipeline** for data-aware responses. This is a significant upgrade from the current mock chat implementation in `SupportView.vue`.

**Key Goals:**
- Universal chat widget accessible from anywhere in the app
- Integration with Google Gemini via Vertex AI
- RAG pipeline for personalized, data-driven responses
- Migration from page-based to widget-based chat

**Current State:** Mock implementation exists in `SupportView.vue`  
**Target State:** Universal floating widget with real AI integration

---

## 1. Specification Analysis

### 1.1 Feature Scope ✅

**Defined Scope:**
- ✅ Universal floating chat widget/sidebar
- ✅ Dashboard button integration
- ✅ Support page migration
- ✅ Google Gemini via Vertex AI integration
- ✅ RAG pipeline for system data

**Scope Clarity:** Well-defined with clear boundaries

**Potential Gaps:**
- ❓ Mobile responsiveness (FAB positioning)
- ❓ Chat history persistence strategy
- ❓ Multi-language support (currently Thai-only)
- ❓ Error handling and fallback mechanisms
- ❓ Rate limiting for AI requests
- ❓ Cost management (Vertex AI usage)

### 1.2 Technical Architecture

#### Frontend Architecture ✅

**Specified Components:**
- `AIChatWidget.vue` - Universal widget component
- `useAIChatStore` (Pinia) - State management
- `geminiService.js` - API client service

**Architecture Assessment:**
- ✅ Follows existing Vue 3 + Pinia patterns
- ✅ Consistent with current codebase structure
- ✅ Service layer separation (good practice)

**Missing Details:**
- Widget positioning strategy (fixed bottom-right? sidebar?)
- Animation/transition specifications
- Accessibility requirements
- Mobile vs desktop behavior differences

#### Backend Architecture 🟡

**Specified:**
- RAG pipeline architecture (high-level)
- Vector database integration
- ETL process for data extraction

**Architecture Assessment:**
- ✅ RAG pattern is appropriate for data-aware responses
- ✅ Vector DB choice (Vertex AI Vector Search, Pinecone, pgvector) is flexible
- ⚠️ Missing: API endpoint specifications
- ⚠️ Missing: Authentication/authorization for chat API
- ⚠️ Missing: Conversation persistence strategy

**Recommended Backend Structure:**
```
backend/src/
├── routes/
│   └── chat.js              # Chat API endpoints
├── controllers/
│   └── chatController.js    # Request handlers
├── services/
│   ├── geminiService.js     # Vertex AI integration
│   ├── ragService.js        # RAG pipeline logic
│   └── vectorDbService.js   # Vector DB operations
└── jobs/
    └── dataSyncJob.js       # ETL job for vector DB
```

### 1.3 RAG Pipeline Architecture

#### Data Flow Analysis ✅

```mermaid
PostgreSQL → ETL → Embedding → Vector DB → Search → Context → Gemini → Response
```

**Strengths:**
- ✅ Clear separation of concerns
- ✅ Scalable architecture
- ✅ Supports real-time and batch updates

**Data Sources Specified:**
1. User Profiles ✅
2. Active Loans ✅
3. Transaction History ✅
4. Product Catalog ✅

**Pipeline Components:**

1. **Extraction** 🟡
   - Spec mentions: Scheduled jobs (Batch) or CDC (Real-time)
   - **Missing:** Specific scheduling strategy
   - **Missing:** Data change detection mechanism
   - **Missing:** Incremental vs full sync strategy

2. **Embedding** ✅
   - Specified: Vertex AI Embeddings (`text-embedding-gecko`)
   - **Good choice:** Google's embedding model, well-integrated
   - **Consideration:** Cost per embedding operation

3. **Vector Storage** 🟡
   - Options: Vertex AI Vector Search, Pinecone, pgvector
   - **Recommendation:** Start with pgvector (PostgreSQL extension)
     - No additional infrastructure
     - Lower cost
     - Easier to manage
   - **Upgrade path:** Move to Vertex AI Vector Search for scale

4. **Inference** 🟡
   - Specified: Retrieve context → Prompt Gemini
   - **Missing:** Retrieval strategy (top-k, similarity threshold)
   - **Missing:** Context window management
   - **Missing:** Prompt engineering details

#### RAG Implementation Gaps

**Critical Missing Details:**

1. **Embedding Strategy:**
   - How to chunk large documents?
   - What metadata to store with embeddings?
   - How to handle updates/deletes?

2. **Retrieval Strategy:**
   - How many context chunks to retrieve? (top-k)
   - Similarity threshold for relevance?
   - How to rank/rerank results?

3. **Prompt Engineering:**
   - System prompt template?
   - How to format context in prompt?
   - Token limits and truncation strategy?

4. **Data Privacy:**
   - How to ensure user data isolation?
   - What data should NOT be in vector DB?
   - Compliance with PDPA regulations?

---

## 2. Current Implementation Analysis

### 2.1 Existing Chat Implementation

**Location:** `src/views/SupportView.vue`

**Current Features:**
- ✅ Basic chat UI (messages, input, typing indicator)
- ✅ Quick action buttons
- ✅ Mock AI responses (keyword-based)
- ✅ Installment calculation logic
- ✅ Thai language support

**Current Limitations:**
- ❌ Page-based (not universal widget)
- ❌ No real AI integration
- ❌ No data awareness (no RAG)
- ❌ No conversation persistence
- ❌ No product recommendations in chat
- ❌ Static responses (no personalization)

**Code Quality:**
- ✅ Clean Vue 3 Composition API
- ✅ Good UI/UX (typing indicator, scroll behavior)
- ✅ Responsive design
- ⚠️ Logic embedded in component (should be in store/service)

### 2.2 Dashboard Integration

**Location:** `src/views/DashboardView.vue` (line 133-142)

**Current Implementation:**
```vue
<button class="action-item" @click="$router.push('/support')">
  <div class="action-item__icon action-item__icon--support">
    <!-- SVG icon -->
  </div>
  <span>AI Assistant</span>
</button>
```

**Current Behavior:**
- Routes to `/support` page
- Full page navigation

**Target Behavior (per spec):**
- Should open floating widget
- Should remain on current page
- Should be accessible from any page

**Migration Path:**
1. Replace `$router.push('/support')` with widget toggle
2. Add FAB (Floating Action Button) to global layout
3. Make widget accessible from any route

---

## 3. UI/UX Analysis

### 3.1 State A: Idle (Global)

**Specification:**
- FAB (Floating Action Button) on any page
- Dashboard button triggers chat

**Analysis:**
- ✅ Clear trigger mechanism
- ⚠️ **Missing:** FAB positioning specification
- ⚠️ **Missing:** FAB visibility rules (always visible? hide on scroll?)
- ⚠️ **Missing:** FAB styling/design details
- ⚠️ **Missing:** Accessibility (keyboard navigation, screen readers)

**Recommendations:**
- Position: Bottom-right corner (standard pattern)
- Size: 56x56px (Material Design standard)
- Visibility: Always visible except on full-screen modals
- Animation: Scale on hover, pulse for new messages
- Z-index: High (above most content, below modals)

### 3.2 State B: Active Chat Window

**Specification:**
- Overlay chat window
- Personalized greeting (uses auth data)
- RAG-powered responses
- Typing indicator

**Analysis:**
- ✅ Clear state description
- ✅ Personalization requirement
- ⚠️ **Missing:** Window size specifications
- ⚠️ **Missing:** Responsive behavior (mobile vs desktop)
- ⚠️ **Missing:** Animation/transition details
- ⚠️ **Missing:** Loading states (RAG retrieval)

**UI/UX Gaps:**

1. **Window Dimensions:**
   - Desktop: 400px width, 600px max height?
   - Mobile: Full screen? Bottom sheet?
   - Resizable? Draggable?

2. **Loading States:**
   - "Retrieving from Vector DB..." indicator
   - Skeleton loading for context retrieval
   - Error states (API failure, timeout)

3. **Message Formatting:**
   - Rich text support?
   - Product cards inline?
   - Links, buttons, formatting?

4. **Accessibility:**
   - Keyboard shortcuts (ESC to close, Enter to send)
   - Screen reader announcements
   - Focus management

---

## 4. Implementation Phases Analysis

### Phase 1: Frontend & Mock ✅

**Tasks:**
1. Extract logic from `SupportView.vue` → Store
2. Create `AIChatWidget.vue`
3. Create `ChatProductCard.vue`
4. Create `geminiService.js` (mock)

**Assessment:**
- ✅ Clear, actionable tasks
- ✅ Builds on existing code
- ⚠️ **Missing:** Store structure details
- ⚠️ **Missing:** Widget component API/props
- ⚠️ **Missing:** Product card component spec

**Recommended Store Structure:**
```javascript
// stores/chat.js
export const useAIChatStore = defineStore('chat', () => {
  // State
  const isOpen = ref(false)
  const messages = ref([])
  const isLoading = ref(false)
  const conversationId = ref(null)
  
  // Actions
  const openChat = () => { ... }
  const closeChat = () => { ... }
  const sendMessage = async (text) => { ... }
  const loadHistory = async () => { ... }
})
```

**Recommended Widget API:**
```vue
<!-- AIChatWidget.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="ai-chat-widget">
      <!-- Chat UI -->
    </div>
  </Teleport>
</template>

<script setup>
// Props: position, theme, etc.
// Emits: close, message-sent
</script>
```

### Phase 2: Data Pipeline 🟡

**Tasks:**
1. Setup Vector DB
2. ETL Script (Postgres → Embed → Vector DB)
3. API Integration (Vector Search → Gemini)

**Assessment:**
- ✅ High-level tasks defined
- ⚠️ **Missing:** Detailed implementation steps
- ⚠️ **Missing:** Technology choices (which Vector DB?)
- ⚠️ **Missing:** Data schema for embeddings
- ⚠️ **Missing:** Update frequency/scheduling

**Recommended Implementation:**

1. **Vector DB Setup:**
   - **Option A (Recommended for MVP):** pgvector extension
     - No additional infrastructure
     - PostgreSQL extension
     - Good for < 1M vectors
   - **Option B (Scale):** Vertex AI Vector Search
     - Managed service
     - Better for large scale
     - Higher cost

2. **ETL Script Structure:**
```javascript
// backend/jobs/dataSyncJob.js
async function syncToVectorDB() {
  // 1. Extract data from PostgreSQL
  const products = await getProducts()
  const loans = await getActiveLoans()
  
  // 2. Chunk and embed
  for (const item of items) {
    const chunks = chunkText(item)
    const embeddings = await embed(chunks)
    await upsertToVectorDB(embeddings, metadata)
  }
}
```

3. **API Integration:**
```javascript
// backend/services/ragService.js
async function getContext(query, userId) {
  // 1. Embed user query
  const queryEmbedding = await embed(query)
  
  // 2. Search vector DB (with user filter)
  const results = await vectorDb.search({
    embedding: queryEmbedding,
    filter: { userId }, // Ensure data isolation
    topK: 5,
    threshold: 0.7
  })
  
  // 3. Format context for prompt
  return formatContext(results)
}
```

---

## 5. Integration Points

### 5.1 Frontend Integration

**Required Changes:**

1. **Global Layout (`App.vue`):**
   ```vue
   <template>
     <router-view />
     <AIChatWidget /> <!-- Add here -->
     <JNavBar v-if="!hideNavBar" />
   </template>
   ```

2. **Dashboard Button:**
   ```vue
   <!-- Before -->
   <button @click="$router.push('/support')">
   
   <!-- After -->
   <button @click="chatStore.openChat()">
   ```

3. **FAB Component:**
   ```vue
   <!-- components/layout/AIChatFAB.vue -->
   <button 
     class="ai-chat-fab"
     @click="chatStore.toggleChat()"
     aria-label="Open AI Assistant"
   >
     <svg>...</svg>
   </button>
   ```

### 5.2 Backend Integration

**Required Endpoints:**

```javascript
// POST /api/v1/chat/messages
// Request: { conversationId?, message, userId }
// Response: { messageId, response, context }

// GET /api/v1/chat/conversations
// Response: { conversations: [...] }

// GET /api/v1/chat/conversations/:id/messages
// Response: { messages: [...] }
```

**Required Services:**

1. **Gemini Service:**
   ```javascript
   // backend/src/services/geminiService.js
   import { VertexAI } from '@google-cloud/vertexai'
   
   export async function generateResponse(prompt, context) {
     const vertexAI = new VertexAI({
       project: config.gcp.projectId,
       location: config.gcp.location
     })
     
     const model = vertexAI.getGenerativeModel({
       model: 'gemini-1.5-pro'
     })
     
     const systemPrompt = buildSystemPrompt(context)
     const result = await model.generateContent(systemPrompt + prompt)
     return result.response.text()
   }
   ```

2. **RAG Service:**
   ```javascript
   // backend/src/services/ragService.js
   export async function retrieveContext(query, userId) {
     // 1. Embed query
     // 2. Search vector DB
     // 3. Filter by userId (data isolation)
     // 4. Return top-k results
   }
   ```

### 5.3 Database Schema

**Required Tables:**

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20), -- 'user' | 'assistant' | 'system'
  content TEXT,
  metadata JSONB, -- { context_used: [...], tokens: 150 }
  created_at TIMESTAMPTZ
);

-- Vector embeddings table (if using pgvector)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50), -- 'product', 'loan', 'user_profile'
  entity_id UUID,
  chunk_text TEXT,
  embedding vector(768), -- Gecko embedding dimension
  metadata JSONB,
  created_at TIMESTAMPTZ
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## 6. Technical Considerations

### 6.1 Vertex AI Integration

**Required Dependencies:**
```json
{
  "@google-cloud/vertexai": "^1.0.0",
  "@google-cloud/aiplatform": "^3.0.0"
}
```

**Configuration:**
```javascript
// backend/src/config/vertexAI.js
export const vertexAIConfig = {
  projectId: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION || 'us-central1',
  model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  embeddingModel: 'text-embedding-gecko@003'
}
```

**Cost Considerations:**
- Gemini 1.5 Pro: ~$0.00125 per 1K input tokens, $0.005 per 1K output tokens
- Embeddings: ~$0.0001 per 1K tokens
- **Estimate:** ~$0.01-0.05 per conversation (depending on length)

### 6.2 RAG Pipeline Performance

**Latency Targets:**
- Vector search: < 100ms
- Embedding generation: < 200ms
- Gemini response: < 3s
- **Total:** < 3.5s

**Optimization Strategies:**
1. **Caching:**
   - Cache embeddings for common queries
   - Cache Gemini responses for similar questions
   
2. **Async Processing:**
   - Pre-embed new data in background
   - Update vector DB incrementally

3. **Batch Operations:**
   - Batch embedding requests
   - Batch vector DB upserts

### 6.3 Security & Privacy

**Data Isolation:**
- ✅ Filter vector searches by `user_id`
- ✅ Never return other users' data in context
- ✅ Encrypt sensitive data before embedding

**API Security:**
- ✅ Require authentication (JWT)
- ✅ Rate limiting (prevent abuse)
- ✅ Input validation (prevent injection)

**Compliance:**
- ✅ PDPA: User consent for data usage
- ✅ Audit logging for AI interactions
- ✅ Data retention policies

---

## 7. Gaps & Recommendations

### 7.1 Critical Gaps

1. **Missing API Specifications:**
   - Request/response formats
   - Error handling
   - Rate limiting details

2. **Missing Data Schema:**
   - Vector DB schema
   - Embedding metadata structure
   - Conversation storage schema

3. **Missing Prompt Engineering:**
   - System prompt template
   - Context formatting
   - Token management

4. **Missing Error Handling:**
   - API failure scenarios
   - Vector DB unavailability
   - Gemini API errors
   - Timeout handling

### 7.2 Recommendations

#### Immediate (Phase 1)

1. **Create Detailed Component Specs:**
   - `AIChatWidget.vue` props, events, slots
   - `ChatProductCard.vue` design and API
   - Store structure and actions

2. **Define Widget Behavior:**
   - Positioning (fixed bottom-right)
   - Responsive breakpoints
   - Animation specifications
   - Accessibility requirements

3. **Mock Service Structure:**
   ```javascript
   // services/geminiService.js
   export async function sendMessage(message, context) {
     // Mock implementation
     // Should match real API structure
   }
   ```

#### Short-term (Phase 2)

1. **Choose Vector DB:**
   - **Recommendation:** Start with pgvector
   - Easier to manage, lower cost
   - Can migrate to Vertex AI Vector Search later

2. **Design RAG Pipeline:**
   - Chunking strategy
   - Embedding metadata
   - Update frequency
   - Data sync mechanism

3. **Implement Backend API:**
   - Chat endpoints
   - RAG service
   - Gemini integration
   - Error handling

#### Long-term (Future)

1. **Advanced Features:**
   - Multi-turn conversations
   - Context memory management
   - Product recommendations in chat
   - Voice input/output

2. **Analytics:**
   - Conversation analytics
   - User satisfaction tracking
   - Cost monitoring
   - Performance metrics

---

## 8. Implementation Checklist

### Phase 1: Frontend & Mock

- [ ] Create `stores/chat.js` (Pinia store)
- [ ] Extract chat logic from `SupportView.vue`
- [ ] Create `components/chat/AIChatWidget.vue`
- [ ] Create `components/chat/ChatProductCard.vue`
- [ ] Create `components/chat/AIChatFAB.vue` (Floating button)
- [ ] Create `services/geminiService.js` (mock)
- [ ] Integrate widget into `App.vue`
- [ ] Update Dashboard button to use widget
- [ ] Add FAB to global layout
- [ ] Test widget on all pages
- [ ] Add accessibility features
- [ ] Mobile responsive testing

### Phase 2: Backend & RAG

- [ ] Install pgvector extension (or setup Vertex AI Vector Search)
- [ ] Create database schema (conversations, messages, embeddings)
- [ ] Create `backend/src/services/geminiService.js`
- [ ] Create `backend/src/services/ragService.js`
- [ ] Create `backend/src/services/vectorDbService.js`
- [ ] Create `backend/src/controllers/chatController.js`
- [ ] Create `backend/src/routes/chat.js`
- [ ] Create ETL job for data sync
- [ ] Implement vector search
- [ ] Implement RAG context retrieval
- [ ] Integrate Gemini API
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Add logging and monitoring

### Phase 3: Integration & Testing

- [ ] Connect frontend to real API
- [ ] Test RAG pipeline end-to-end
- [ ] Test data isolation (user privacy)
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing
- [ ] User acceptance testing

---

## 9. Risk Assessment

### High Risk

1. **Cost Overruns:**
   - Vertex AI costs can escalate with usage
   - **Mitigation:** Implement usage monitoring, rate limiting, caching

2. **Data Privacy:**
   - Risk of exposing user data in RAG context
   - **Mitigation:** Strict user filtering, data encryption, audit logs

3. **Performance:**
   - RAG pipeline adds latency
   - **Mitigation:** Caching, async processing, optimization

### Medium Risk

1. **Vector DB Choice:**
   - Wrong choice could limit scalability
   - **Mitigation:** Start with pgvector, plan migration path

2. **Prompt Engineering:**
   - Poor prompts = poor responses
   - **Mitigation:** Iterative testing, A/B testing, prompt versioning

### Low Risk

1. **UI/UX:**
   - Widget might interfere with existing UI
   - **Mitigation:** Careful positioning, z-index management, user testing

---

## 10. Success Metrics

### Technical Metrics

- Response time: < 3.5s (P95)
- Uptime: > 99.9%
- Error rate: < 1%
- Vector search latency: < 100ms

### Business Metrics

- User engagement: % of users using chat
- Conversation completion rate
- User satisfaction (NPS)
- Cost per conversation

### Product Metrics

- Questions answered correctly: > 90%
- Product recommendations clicked: > 15%
- User retention improvement

---

## 11. Conclusion

The AI Chat feature specification provides a **solid foundation** for implementing a universal AI assistant with RAG capabilities. The architecture is sound and follows modern best practices.

**Strengths:**
- ✅ Clear scope and goals
- ✅ Appropriate technology choices (Gemini, RAG)
- ✅ Phased implementation approach
- ✅ Builds on existing code

**Areas for Improvement:**
- ⚠️ Need detailed API specifications
- ⚠️ Need component design details
- ⚠️ Need prompt engineering guidelines
- ⚠️ Need error handling strategy
- ⚠️ Need cost management plan

**Recommendation:** Proceed with implementation, but expand the specification with the missing details identified in this analysis before starting Phase 2.

---

*End of Analysis*
