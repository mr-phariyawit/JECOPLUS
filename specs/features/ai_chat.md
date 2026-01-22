# Feature Spec: AI Chat Universal

> **Goal**: Implement a universal AI Chat interface powered by Google Gemini (via Vertex AI) into the JECO+ application, supported by a RAG Data Pipeline for personalized, data-driven responses.

## 1. Context & Scope
The JECO+ application requires an intelligent assistant accessible from anywhere in the app to help users with queries, navigation, or data analysis.

**Scope**:
- **UI**: A floating chat widget/sidebar accessible globally (Universal).
- **Integration**: Dashboard button & Support Page migration.
- **AI**: Integration with Google Gemini via Vertex AI.
- **Data**: **RAG Pipeline** reading from System Data (PostgreSQL) to Vector DB for grounded answers.

## 2. Technical Architecture

### Frontend (Vue 3)
- **Component**: `AIChatWidget.vue` (Universal).
- **Store**: `useAIChatStore` (Pinia).
- **Service**: `geminiService.js` (API Client).

### 2.1 Data Pipeline (RAG Architecture)
To ensure the AI knows about *system data* (Product Catalog, User Profile, Loan Types), we implement a Retrieval-Augmented Generation (RAG) pipeline:

```mermaid
graph LR
    PG[(PostgreSQL)] -->|Extract| ETL[Data Pipeline]
    ETL -->|Embed (Gecko)| VDB[(Vector DB)]
    
    User[User Query] -->|Search| VDB
    VDB -->|Context| Gemini[Vertex AI Gemini]
    Gemini -->|Response| Client[Vue App]
```

1.  **Source**: PostgreSQL (System DB).
    - *Data*: User Profiles, Active Loans, Transaction History, Product Catalog.
2.  **Pipeline**:
    - **Extraction**: Scheduled jobs (Batch) or Change Data Capture (Real-time).
    - **Embedding**: Convert textual data to vectors using **Vertex AI Embeddings** (e.g., `text-embedding-gecko`).
    - **Storage**: Vector Database (e.g., Vertex AI Vector Search, Pinecone, or pgvector).
3.  **Inference**:
    - Chat API retrieves relevant context from Vector DB.
    - Prompts Gemini: *"Using the following context [Loan ID: 123, Balance: 50k], answer the user's question..."*

## 3. UI/UX Journey (Plaintext-UXUI)

### State A: Idle (Global)
```text
[Screen: Any Page]
+--------------------------------------------------+
|  (Regular App Content...)                        |
|                                                  |
|  [Dashboard]                                     |
|  [ (AI Assistant) ] button                       | <-- Existing Button
|          |                                       |
|          v (Click triggers State B)              |
|                                                  |
|                                     [ (✨) ]     |  <-- Floating Action Button (FAB)
+--------------------------------------------------+
```

### State B: Active Chat Window (Data-Aware)
```text
[Screen: Any Page with Overlay]
+--------------------------------------------------+
|           +----------------------------------+   |
|           |  🤖 JECO Advisor           [ _ X ] |   |
|           +----------------------------------+   |
|           | [AI] สวัสดีค่ะ! คุณสมชาย             |   | <-- Personalized (Auth Data)
|           |      ยินดีต้อนรับสู่ JECO             |   |
|           |                                  |   |
|           | [User] ยอดหนี้คงเหลือเท่าไหร่?           |   |
|           |                                  |   |
|           | [AI] (Retrieving from Vector DB...)  |   |
|           |      ปัจจุบันคุณมียอดหนี้รวม ฿45,000   |   | <-- RAG Response
|           |      จากสินเชื่อ KB Personal Loan    |   |
|           |                                  |   |
|           |               (Typing...)        |   |
|           +----------------------------------+   |
|           | [ Type your question...      (>)]|   |   |
|           +----------------------------------+   |
+--------------------------------------------------+
```

## 4. Implementation Steps

### Phase 1: Frontend & Mock (Current)
1.  **Store**: Extract logic from `SupportView.vue`.
2.  **UI**: Create `AIChatWidget.vue` & `ChatProductCard.vue`.
3.  **Service**: `geminiService.js` (Mock Logic extended for FA-002 Product Cards).

### Phase 2: Data Pipeline (Future / Backend)
1.  **Setup Vector DB**: Provision Vertex AI Vector Search or similar.
2.  **ETL Script**: Write script to fetch `products` table from Postgres -> Embed -> Upsert to Vector DB.
3.  **API Integration**: Update `geminiService` (or Backend Proxy) to perform Vector Search before calling Gemini.
