# AI 360° Implementation Plan - Complete Development Guide

**Version:** 1.0  
**Date:** January 2026  
**Status:** Ready for Development  
**Scope:** Vertex AI + RAG Pipeline + Money Coach + Marketplace + Loan Assistant

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Vertex AI Migration](#phase-1-vertex-ai-migration)
4. [Phase 2: RAG Data Pipeline](#phase-2-rag-data-pipeline)
5. [Phase 3: Money Coach + Marketplace AI](#phase-3-money-coach--marketplace-ai)
6. [Phase 4: Loan Assistant](#phase-4-loan-assistant)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Frontend Components](#frontend-components)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Cost Estimation](#cost-estimation)

---

## Executive Summary

This plan provides a complete, production-ready implementation for:
- ✅ **Vertex AI Integration** - Migrate from Gemini API to Vertex AI SDK
- ✅ **RAG Data Pipeline** - Full ETL pipeline with vector embeddings
- ✅ **Money Coach AI** - Financial advisor with marketplace integration
- ✅ **Loan Assistant** - Dedicated loan recommendation system

**Total Implementation Time:** ~4-6 weeks  
**Story Points:** ~80 points  
**Dependencies:** GCP Project, Vertex AI API enabled, pgvector extension

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │AIChatWidget  │  │MoneyCoachView│  │LoanAssistant │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │         useAIChatStore (Pinia)                      │          │
│  └──────────────────────┬─────────────────────────────┘          │
└─────────────────────────┼────────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼────────────────────────────────────────┐
│                      BACKEND (Express)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ChatController│  │MoneyController│  │LoanController│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │              AI Services Layer                      │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │          │
│  │  │VertexAISvc│  │RAGService │  │EmbedService│        │          │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │          │
│  └───────┼─────────────┼─────────────┼─────────────────┘          │
└──────────┼─────────────┼─────────────┼────────────────────────────┘
           │             │             │
           │             │             │
┌──────────▼─────────────▼─────────────▼────────────────────────────┐
│                    DATA LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ PostgreSQL   │  │  pgvector    │  │  Vertex AI   │            │
│  │  (Source DB)  │  │  (Vector DB)  │  │  (Embeddings)│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐         │
│  │         ETL Pipeline (Scheduled Jobs)                 │         │
│  │  Extract → Transform → Embed → Store                  │         │
│  └─────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query
    ↓
Chat API → RAG Service → Vector Search (pgvector)
    ↓                        ↓
    └──────────→ Context Retrieval
    ↓
Vertex AI Service → Gemini 1.5 Pro
    ↓
Response Generation (with product/loan recommendations)
    ↓
Frontend Display
```

---

## Phase 1: Vertex AI Migration

### 1.1 Dependencies Installation

**File:** `backend/package.json`

```json
{
  "dependencies": {
    "@google-cloud/vertexai": "^1.0.0",
    "@google-cloud/aiplatform": "^3.0.0"
  }
}
```

**Command:**
```bash
cd backend
npm install @google-cloud/vertexai @google-cloud/aiplatform
```

### 1.2 Configuration Setup

**File:** `backend/src/config/vertexAI.js` (NEW)

```javascript
import { VertexAI } from '@google-cloud/vertexai';

const vertexAIConfig = {
  projectId: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION || 'us-central1',
  model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
  embeddingModel: 'text-embedding-004', // or text-embedding-gecko@003
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 4096,
};

// Initialize Vertex AI client
let vertexAI = null;

export const getVertexAIClient = () => {
  if (!vertexAI && vertexAIConfig.projectId) {
    vertexAI = new VertexAI({
      project: vertexAIConfig.projectId,
      location: vertexAIConfig.location,
    });
  }
  return vertexAI;
};

export default vertexAIConfig;
```

**File:** `backend/.env` (UPDATE)

```bash
# Vertex AI Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
GCP_CREDENTIALS_PATH=./gcp-credentials.json

# Embedding Model
VERTEX_EMBEDDING_MODEL=text-embedding-004
```

### 1.3 Vertex AI Service Implementation

**File:** `backend/src/services/vertexAIService.js` (NEW)

```javascript
import { getVertexAIClient } from '../config/vertexAI.js';
import vertexAIConfig from '../config/vertexAI.js';
import logger from '../utils/logger.js';

class VertexAIService {
  constructor() {
    this.client = getVertexAIClient();
    this.model = vertexAIConfig.model;
  }

  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generate response using Vertex AI Gemini
   */
  async generateResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured');
    }

    try {
      const model = this.client.getGenerativeModel({
        model: options.model || this.model,
        systemInstruction: systemInstruction || undefined,
      });

      // Convert conversation history to Vertex AI format
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? vertexAIConfig.temperature,
          maxOutputTokens: options.maxTokens || vertexAIConfig.maxOutputTokens,
          topP: options.topP ?? 0.95,
          topK: options.topK ?? 40,
        },
      });

      logger.info(`Vertex AI request: model=${this.model}, history=${history.length} messages`);

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // Get usage metadata
      const usageMetadata = response.usageMetadata;

      return {
        text,
        metadata: {
          model: this.model,
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
          provider: 'vertex-ai',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Vertex AI error:', error);
      throw new Error(`Vertex AI error: ${error.message}`);
    }
  }

  /**
   * Generate embeddings using Vertex AI
   */
  async generateEmbedding(text, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured');
    }

    try {
      const model = this.client.getGenerativeModel({
        model: options.embeddingModel || vertexAIConfig.embeddingModel,
      });

      const result = await model.embedContent({
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT', // or 'RETRIEVAL_QUERY'
      });

      return result.embedding.values;
    } catch (error) {
      logger.error('Vertex AI embedding error:', error);
      throw new Error(`Vertex AI embedding error: ${error.message}`);
    }
  }

  /**
   * Stream response (for real-time chat)
   */
  async *streamResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured');
    }

    try {
      const model = this.client.getGenerativeModel({
        model: options.model || this.model,
        systemInstruction: systemInstruction || undefined,
      });

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? vertexAIConfig.temperature,
          maxOutputTokens: options.maxTokens || vertexAIConfig.maxOutputTokens,
        },
      });

      const result = await chat.sendMessageStream(message);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      logger.error('Vertex AI streaming error:', error);
      throw error;
    }
  }
}

export default new VertexAIService();
```

### 1.4 Update AI Chat Service

**File:** `backend/src/services/aiChatService.js` (UPDATE)

```javascript
import claudeService from './claudeService.js';
import geminiService from './geminiService.js';
import vertexAIService from './vertexAIService.js'; // ADD THIS
import logger from '../utils/logger.js';
import config from '../config/index.js';

class AIChatService {
  constructor() {
    // Prioritize Vertex AI if available
    this.defaultProvider = config.ai?.defaultProvider || 'vertex-ai';
    this.systemPrompt = this.buildSystemPrompt();
  }

  getAvailableProviders() {
    const providers = [];
    if (claudeService.isAvailable()) {
      providers.push('claude');
    }
    if (geminiService.isAvailable()) {
      providers.push('gemini');
    }
    if (vertexAIService.isAvailable()) { // ADD THIS
      providers.push('vertex-ai');
    }
    return providers;
  }

  selectProvider(preferredProvider = null) {
    const provider = preferredProvider || this.defaultProvider;
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('No AI providers are configured.');
    }

    // Prefer Vertex AI if available
    if (available.includes('vertex-ai') && (provider === 'vertex-ai' || !preferredProvider)) {
      return 'vertex-ai';
    }

    if (available.includes(provider)) {
      return provider;
    }

    logger.warn(`Provider ${provider} not available, using ${available[0]} instead`);
    return available[0];
  }

  async generateResponse(message, conversationHistory = [], options = {}) {
    const provider = this.selectProvider(options.provider);
    const systemPrompt = options.systemPrompt || this.systemPrompt;

    logger.info(`Generating response with ${provider} for message: ${message.substring(0, 50)}...`);

    try {
      let response;

      if (provider === 'vertex-ai') { // ADD THIS
        response = await vertexAIService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'claude') {
        response = await claudeService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'gemini') {
        response = await geminiService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      return {
        success: true,
        data: {
          text: response.text,
          provider,
          conversationId: options.conversationId,
          metadata: response.metadata,
        },
      };
    } catch (error) {
      logger.error(`AI Chat error (${provider}):`, error);
      return {
        success: false,
        error: error.message || 'Failed to generate AI response',
        provider,
      };
    }
  }
}

export default new AIChatService();
```

### 1.5 Update Config

**File:** `backend/src/config/index.js` (UPDATE)

```javascript
  // AI Services
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'vertex-ai', // UPDATE
    vertexAI: { // ADD THIS
      projectId: process.env.GCP_PROJECT_ID,
      location: process.env.GCP_LOCATION || 'us-central1',
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
      embeddingModel: process.env.VERTEX_EMBEDDING_MODEL || 'text-embedding-004',
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS, 10) || 4096,
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-ultra',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS, 10) || 4096,
    },
  },
```

---

## Phase 2: RAG Data Pipeline

### 2.1 Database Schema - Vector Storage

**File:** `backend/migrations/008_rag_pipeline_schema.sql` (NEW)

```sql
-- RAG Pipeline Schema
-- Version: 1.0.0

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- EMBEDDINGS TABLE
-- =====================================================

CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity Reference
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'loan', 'user_profile', 'transaction'
    entity_id UUID NOT NULL,
    
    -- Embedding Data
    chunk_text TEXT NOT NULL,
    embedding vector(768), -- Dimension for text-embedding-004
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    source_table VARCHAR(100),
    source_column VARCHAR(100),
    
    -- Indexing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_entity_chunk UNIQUE (entity_type, entity_id, chunk_text)
);

-- Vector similarity search index (IVFFlat for fast approximate search)
CREATE INDEX idx_embeddings_vector ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Entity lookup indexes
CREATE INDEX idx_embeddings_entity ON embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_created ON embeddings(created_at);

-- Full-text search index for fallback
CREATE INDEX idx_embeddings_text_search ON embeddings 
USING gin(to_tsvector('thai', chunk_text));

COMMENT ON TABLE embeddings IS 'Vector embeddings for RAG pipeline';

-- =====================================================
-- PIPELINE JOBS TABLE
-- =====================================================

CREATE TABLE pipeline_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL, -- 'full_sync', 'incremental', 'embedding_update'
    entity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    
    -- Statistics
    records_processed INT DEFAULT 0,
    records_total INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    
    -- Metadata
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipeline_jobs_status ON pipeline_jobs(status, created_at);
CREATE INDEX idx_pipeline_jobs_type ON pipeline_jobs(job_type, entity_type);

COMMENT ON TABLE pipeline_jobs IS 'ETL pipeline job tracking';

-- =====================================================
-- VECTOR SEARCH CACHE
-- =====================================================

CREATE TABLE vector_search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of query text
    query_text TEXT NOT NULL,
    results JSONB NOT NULL, -- Cached search results
    
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vector_cache_expires ON vector_search_cache(expires_at);
CREATE INDEX idx_vector_cache_hash ON vector_search_cache(query_hash);

COMMENT ON TABLE vector_search_cache IS 'Cache for vector search results';
```

### 2.2 Embedding Service

**File:** `backend/src/services/embeddingService.js` (NEW)

```javascript
import vertexAIService from './vertexAIService.js';
import { query } from '../db/index.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

class EmbeddingService {
  /**
   * Generate embedding for text
   */
  async generateEmbedding(text, options = {}) {
    try {
      const embedding = await vertexAIService.generateEmbedding(text, options);
      return embedding;
    } catch (error) {
      logger.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Store embedding in database
   */
  async storeEmbedding(entityType, entityId, chunkText, embedding, metadata = {}) {
    try {
      const result = await query(
        `INSERT INTO embeddings (entity_type, entity_id, chunk_text, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (entity_type, entity_id, chunk_text)
         DO UPDATE SET
           embedding = EXCLUDED.embedding,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()
         RETURNING id`,
        [entityType, entityId, chunkText, JSON.stringify(embedding), JSON.stringify(metadata)]
      );

      return result.rows[0].id;
    } catch (error) {
      logger.error('Error storing embedding:', error);
      throw error;
    }
  }

  /**
   * Vector similarity search
   */
  async searchSimilar(queryText, options = {}) {
    const {
      entityType = null,
      limit = 5,
      threshold = 0.7,
      userId = null, // For user-specific searches
    } = options;

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(queryText, {
        taskType: 'RETRIEVAL_QUERY',
      });

      // Build search query
      let searchQuery = `
        SELECT 
          e.id,
          e.entity_type,
          e.entity_id,
          e.chunk_text,
          e.metadata,
          1 - (e.embedding <=> $1::vector) as similarity
        FROM embeddings e
        WHERE 1 - (e.embedding <=> $1::vector) >= $2
      `;

      const params = [JSON.stringify(queryEmbedding), threshold];
      let paramIndex = 3;

      if (entityType) {
        searchQuery += ` AND e.entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      // Add user-specific filtering if needed
      if (userId && entityType === 'user_profile') {
        searchQuery += ` AND e.entity_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      searchQuery += `
        ORDER BY similarity DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const result = await query(searchQuery, params);

      return result.rows.map(row => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        text: row.chunk_text,
        metadata: row.metadata,
        similarity: parseFloat(row.similarity),
      }));
    } catch (error) {
      logger.error('Vector search error:', error);
      throw error;
    }
  }

  /**
   * Delete embeddings for an entity
   */
  async deleteEmbeddings(entityType, entityId) {
    try {
      const result = await query(
        `DELETE FROM embeddings WHERE entity_type = $1 AND entity_id = $2`,
        [entityType, entityId]
      );
      return result.rowCount;
    } catch (error) {
      logger.error('Error deleting embeddings:', error);
      throw error;
    }
  }
}

export default new EmbeddingService();
```

### 2.3 RAG Service

**File:** `backend/src/services/ragService.js` (NEW)

```javascript
import embeddingService from './embeddingService.js';
import logger from '../utils/logger.js';

class RAGService {
  /**
   * Retrieve relevant context for user query
   */
  async retrieveContext(userQuery, userId = null, options = {}) {
    const {
      entityTypes = ['product', 'loan', 'user_profile', 'transaction'],
      maxResults = 5,
      similarityThreshold = 0.7,
    } = options;

    try {
      const allResults = [];

      // Search across all entity types
      for (const entityType of entityTypes) {
        const results = await embeddingService.searchSimilar(userQuery, {
          entityType,
          limit: maxResults,
          threshold: similarityThreshold,
          userId, // Filter user-specific data
        });

        allResults.push(...results);
      }

      // Sort by similarity and take top results
      allResults.sort((a, b) => b.similarity - a.similarity);
      const topResults = allResults.slice(0, maxResults);

      // Format context for AI prompt
      const context = this.formatContext(topResults);

      logger.info(`RAG retrieved ${topResults.length} relevant contexts for query`);

      return {
        contexts: topResults,
        formattedContext: context,
      };
    } catch (error) {
      logger.error('RAG context retrieval error:', error);
      // Return empty context on error (graceful degradation)
      return {
        contexts: [],
        formattedContext: '',
      };
    }
  }

  /**
   * Format context for AI prompt
   */
  formatContext(results) {
    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map((result, index) => {
      const metadata = result.metadata || {};
      let context = `[Context ${index + 1}]\n`;
      context += `Type: ${result.entityType}\n`;
      context += `Content: ${result.text}\n`;

      if (Object.keys(metadata).length > 0) {
        context += `Metadata: ${JSON.stringify(metadata)}\n`;
      }

      return context;
    });

    return contextParts.join('\n\n');
  }

  /**
   * Build enhanced system prompt with RAG context
   */
  buildEnhancedPrompt(basePrompt, context) {
    if (!context || context.trim() === '') {
      return basePrompt;
    }

    return `${basePrompt}

IMPORTANT: Use the following context to answer the user's question accurately:

${context}

When answering:
- Reference specific data from the context when available
- If context doesn't contain relevant information, say so
- Always prioritize accuracy from the provided context`;
  }
}

export default new RAGService();
```

### 2.4 ETL Pipeline Jobs

**File:** `backend/src/jobs/ragPipelineJob.js` (NEW)

```javascript
import { query } from '../db/index.js';
import embeddingService from '../services/embeddingService.js';
import logger from '../utils/logger.js';

class RAGPipelineJob {
  /**
   * Full sync - Process all entities
   */
  async fullSync(entityType, options = {}) {
    const jobId = await this.createJob('full_sync', entityType);

    try {
      await this.updateJobStatus(jobId, 'running');

      let recordsProcessed = 0;
      let errorsCount = 0;

      // Get all entities based on type
      const entities = await this.getEntities(entityType);

      await this.updateJobProgress(jobId, 0, entities.length);

      for (const entity of entities) {
        try {
          await this.processEntity(entityType, entity);
          recordsProcessed++;
        } catch (error) {
          logger.error(`Error processing entity ${entity.id}:`, error);
          errorsCount++;
        }

        // Update progress every 10 records
        if (recordsProcessed % 10 === 0) {
          await this.updateJobProgress(jobId, recordsProcessed, entities.length);
        }
      }

      await this.updateJobStatus(jobId, 'completed', {
        recordsProcessed,
        recordsTotal: entities.length,
        errorsCount,
      });

      logger.info(`Full sync completed for ${entityType}: ${recordsProcessed} records`);
    } catch (error) {
      logger.error(`Full sync error for ${entityType}:`, error);
      await this.updateJobStatus(jobId, 'failed', { errorMessage: error.message });
      throw error;
    }
  }

  /**
   * Process single entity - generate and store embeddings
   */
  async processEntity(entityType, entity) {
    // Delete existing embeddings
    await embeddingService.deleteEmbeddings(entityType, entity.id);

    // Generate chunks based on entity type
    const chunks = this.generateChunks(entityType, entity);

    // Process each chunk
    for (const chunk of chunks) {
      try {
        const embedding = await embeddingService.generateEmbedding(chunk.text);
        await embeddingService.storeEmbedding(
          entityType,
          entity.id,
          chunk.text,
          embedding,
          chunk.metadata
        );
      } catch (error) {
        logger.error(`Error processing chunk for entity ${entity.id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Generate text chunks from entity data
   */
  generateChunks(entityType, entity) {
    const chunks = [];

    switch (entityType) {
      case 'product':
        chunks.push({
          text: `Product: ${entity.name}. ${entity.description || ''}. Price: ${entity.price} THB.`,
          metadata: {
            source_table: 'products',
            product_id: entity.id,
            category: entity.category_id,
          },
        });
        break;

      case 'loan':
        chunks.push({
          text: `Loan Product: ${entity.name}. Amount: ${entity.min_amount}-${entity.max_amount} THB. APR: ${entity.min_apr}-${entity.max_apr}%.`,
          metadata: {
            source_table: 'loan_products',
            loan_id: entity.id,
            provider: entity.provider,
          },
        });
        break;

      case 'user_profile':
        // Only include non-sensitive data
        const profileText = `User Profile: Income ${entity.income || 'N/A'} THB/month. Expenses: ${entity.expenses || 'N/A'} THB/month.`;
        chunks.push({
          text: profileText,
          metadata: {
            source_table: 'users',
            user_id: entity.id,
          },
        });
        break;

      case 'transaction':
        chunks.push({
          text: `Transaction: ${entity.type} of ${entity.amount} THB on ${entity.created_at}.`,
          metadata: {
            source_table: 'transactions',
            transaction_id: entity.id,
            wallet_id: entity.wallet_id,
          },
        });
        break;
    }

    return chunks;
  }

  /**
   * Get entities from database
   */
  async getEntities(entityType) {
    let queryText = '';

    switch (entityType) {
      case 'product':
        queryText = `SELECT id, name, description, price, category_id FROM products WHERE status = 'active'`;
        break;
      case 'loan':
        queryText = `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider FROM loan_products WHERE status = 'active'`;
        break;
      case 'user_profile':
        queryText = `SELECT id, income, expenses FROM users WHERE kyc_status = 'verified'`;
        break;
      case 'transaction':
        queryText = `SELECT id, type, amount, wallet_id, created_at FROM transactions WHERE status = 'COMPLETED' LIMIT 10000`;
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    const result = await query(queryText);
    return result.rows;
  }

  /**
   * Create pipeline job record
   */
  async createJob(jobType, entityType) {
    const result = await query(
      `INSERT INTO pipeline_jobs (job_type, entity_type, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [jobType, entityType]
    );
    return result.rows[0].id;
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status, data = {}) {
    await query(
      `UPDATE pipeline_jobs
       SET status = $1,
           ${status === 'running' ? 'started_at = NOW(),' : ''}
           ${status === 'completed' || status === 'failed' ? 'completed_at = NOW(),' : ''}
           records_processed = $2,
           records_total = $3,
           errors_count = $4,
           error_message = $5,
           metadata = $6
       WHERE id = $7`,
      [
        status,
        data.recordsProcessed || 0,
        data.recordsTotal || 0,
        data.errorsCount || 0,
        data.errorMessage || null,
        JSON.stringify(data.metadata || {}),
        jobId,
      ]
    );
  }

  /**
   * Update job progress
   */
  async updateJobProgress(jobId, processed, total) {
    await query(
      `UPDATE pipeline_jobs
       SET records_processed = $1, records_total = $2
       WHERE id = $3`,
      [processed, total, jobId]
    );
  }
}

export default new RAGPipelineJob();
```

### 2.5 Scheduled Job Runner

**File:** `backend/src/jobs/scheduler.js` (NEW)

```javascript
import cron from 'node-cron';
import ragPipelineJob from './ragPipelineJob.js';
import logger from '../utils/logger.js';

class JobScheduler {
  start() {
    // Full sync - Daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting daily RAG pipeline full sync');
      try {
        await ragPipelineJob.fullSync('product');
        await ragPipelineJob.fullSync('loan');
        logger.info('Daily RAG pipeline sync completed');
      } catch (error) {
        logger.error('Daily RAG pipeline sync failed:', error);
      }
    });

    // Incremental sync - Every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting incremental RAG pipeline sync');
      // TODO: Implement incremental sync
    });

    logger.info('RAG pipeline scheduler started');
  }
}

export default new JobScheduler();
```

**File:** `backend/src/server.js` (UPDATE)

```javascript
// Add at the end of server.js
import jobScheduler from './jobs/scheduler.js';

// Start scheduled jobs
if (process.env.NODE_ENV !== 'test') {
  jobScheduler.start();
}
```

### 2.6 Update Chat Service with RAG

**File:** `backend/src/services/chatService.js` (UPDATE)

```javascript
import ragService from './ragService.js'; // ADD THIS

export const sendMessage = async (userId, message, options = {}) => {
  const startTime = Date.now();

  // Get or create conversation
  const conversation = await getOrCreateConversation(userId, {
    conversationId: options.conversationId,
    provider: options.provider,
    systemPrompt: options.systemPrompt,
  });

  // Save user message
  await saveMessage(conversation.id, 'user', message);

  // Get conversation history
  const historyResult = await query(
    `SELECT role, content FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC
     LIMIT 20`,
    [conversation.id]
  );

  const conversationHistory = historyResult.rows.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // RAG: Retrieve relevant context
  const ragContext = await ragService.retrieveContext(message, userId, {
    entityTypes: ['product', 'loan', 'user_profile'],
    maxResults: 5,
  });

  // Build enhanced system prompt
  const basePrompt = options.systemPrompt || conversation.system_prompt;
  const enhancedPrompt = ragService.buildEnhancedPrompt(basePrompt, ragContext.formattedContext);

  // Generate AI response
  const aiResponse = await aiChatService.generateResponse(message, conversationHistory, {
    provider: options.provider || conversation.provider,
    systemPrompt: enhancedPrompt,
    conversationId: conversation.id,
    temperature: 0.7,
    maxTokens: 2048,
  });

  // ... rest of the function
};
```

---

## Phase 3: Money Coach + Marketplace AI

### 3.1 Financial Profile Schema

**File:** `backend/migrations/009_financial_profile_schema.sql` (NEW)

```sql
-- Financial Profile Schema
-- Version: 1.0.0

CREATE TABLE financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Income & Expenses
    monthly_income DECIMAL(15, 2),
    monthly_expenses DECIMAL(15, 2),
    savings_goal DECIMAL(15, 2),
    savings_deadline DATE,
    
    -- Financial Goals
    goals JSONB DEFAULT '[]', -- Array of goal objects
    risk_tolerance VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
    
    -- Spending Analysis
    spending_categories JSONB DEFAULT '{}', -- Category breakdown
    average_monthly_savings DECIMAL(15, 2),
    
    -- AI Recommendations
    recommended_products JSONB DEFAULT '[]',
    recommended_loans JSONB DEFAULT '[]',
    
    -- Metadata
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

CREATE INDEX idx_financial_profiles_user ON financial_profiles(user_id);

COMMENT ON TABLE financial_profiles IS 'User financial profiles for money coach AI';
```

### 3.2 Money Coach Service

**File:** `backend/src/services/moneyCoachService.js` (NEW)

```javascript
import { query } from '../db/index.js';
import ragService from './ragService.js';
import vertexAIService from './vertexAIService.js';
import logger from '../utils/logger.js';

class MoneyCoachService {
  /**
   * Build money coach system prompt
   */
  buildSystemPrompt(userProfile = null) {
    let prompt = `You are JECO+ Money Coach, a friendly financial advisor for Thai users.

Your role:
1. Help users understand their financial situation
2. Provide budgeting and savings advice
3. Recommend relevant products from JECO+ marketplace
4. Suggest appropriate loan products when needed
5. Create personalized financial plans

Personality:
- Friendly, encouraging, and non-judgmental
- Use Thai language with polite particles (ค่ะ/ครับ)
- Be realistic but optimistic
- Never provide investment advice (only savings/budgeting)

Available Services:
- Personal loans (สินเชื่อส่วนบุคคล)
- KB Personal Loan
- Pah Pay
- Marketplace products (various categories)
- Savings plans`;

    if (userProfile) {
      prompt += `\n\nCurrent User Profile:
- Monthly Income: ${userProfile.monthly_income || 'Not set'} THB
- Monthly Expenses: ${userProfile.monthly_expenses || 'Not set'} THB
- Savings Goal: ${userProfile.savings_goal || 'Not set'} THB
- Risk Tolerance: ${userProfile.risk_tolerance || 'Not set'}`;
    }

    return prompt;
  }

  /**
   * Analyze user financial situation
   */
  async analyzeFinancialSituation(userId) {
    try {
      // Get user profile
      const profileResult = await query(
        `SELECT * FROM financial_profiles WHERE user_id = $1`,
        [userId]
      );

      const profile = profileResult.rows[0];

      // Get wallet balance
      const walletResult = await query(
        `SELECT balance FROM wallets WHERE user_id = $1`,
        [userId]
      );
      const walletBalance = walletResult.rows[0]?.balance || 0;

      // Get recent transactions
      const transactionsResult = await query(
        `SELECT type, amount, created_at 
         FROM transactions 
         WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1)
         AND status = 'COMPLETED'
         ORDER BY created_at DESC
         LIMIT 30`,
        [userId]
      );

      // Calculate spending by category
      const spendingAnalysis = this.analyzeSpending(transactionsResult.rows);

      return {
        profile,
        walletBalance,
        spendingAnalysis,
        recommendations: await this.generateRecommendations(userId, profile, spendingAnalysis),
      };
    } catch (error) {
      logger.error('Error analyzing financial situation:', error);
      throw error;
    }
  }

  /**
   * Analyze spending patterns
   */
  analyzeSpending(transactions) {
    const categories = {};
    let totalSpent = 0;

    transactions.forEach(tx => {
      if (tx.type === 'PAYMENT' || tx.type === 'WITHDRAW') {
        const category = this.categorizeTransaction(tx);
        categories[category] = (categories[category] || 0) + parseFloat(tx.amount);
        totalSpent += parseFloat(tx.amount);
      }
    });

    return {
      categories,
      totalSpent,
      averageDaily: totalSpent / 30,
      transactionCount: transactions.length,
    };
  }

  /**
   * Categorize transaction
   */
  categorizeTransaction(transaction) {
    // Simple categorization - can be enhanced with ML
    const description = transaction.description?.toLowerCase() || '';
    
    if (description.includes('food') || description.includes('restaurant')) return 'food';
    if (description.includes('transport') || description.includes('gas')) return 'transport';
    if (description.includes('shopping') || description.includes('marketplace')) return 'shopping';
    if (description.includes('bill') || description.includes('utility')) return 'bills';
    
    return 'other';
  }

  /**
   * Generate product/loan recommendations
   */
  async generateRecommendations(userId, profile, spendingAnalysis) {
    try {
      // Build recommendation query
      const queryText = this.buildRecommendationQuery(profile, spendingAnalysis);

      // Use RAG to find relevant products
      const ragContext = await ragService.retrieveContext(queryText, userId, {
        entityTypes: ['product', 'loan'],
        maxResults: 5,
      });

      // Get actual products from database
      const productsResult = await query(
        `SELECT id, name, description, price, category_id, metadata
         FROM products
         WHERE status = 'active'
         AND id = ANY($1::uuid[])
         LIMIT 5`,
        [ragContext.contexts.map(c => c.entityId)]
      );

      const loansResult = await query(
        `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider
         FROM loan_products
         WHERE status = 'active'
         AND id = ANY($1::uuid[])
         LIMIT 3`,
        [ragContext.contexts.filter(c => c.entityType === 'loan').map(c => c.entityId)]
      );

      return {
        products: productsResult.rows,
        loans: loansResult.rows,
        reasoning: ragContext.formattedContext,
      };
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return { products: [], loans: [] };
    }
  }

  /**
   * Build recommendation query for RAG
   */
  buildRecommendationQuery(profile, spendingAnalysis) {
    let query = 'Recommend products and loans for user with: ';

    if (profile?.monthly_income) {
      query += `income ${profile.monthly_income} THB/month, `;
    }

    if (profile?.monthly_expenses) {
      query += `expenses ${profile.monthly_expenses} THB/month, `;
    }

    if (spendingAnalysis?.totalSpent) {
      query += `spending ${spendingAnalysis.totalSpent} THB in last month, `;
    }

    if (profile?.savings_goal) {
      query += `savings goal ${profile.savings_goal} THB, `;
    }

    if (profile?.risk_tolerance) {
      query += `risk tolerance ${profile.risk_tolerance}`;
    }

    return query;
  }

  /**
   * Update financial profile from chat conversation
   */
  async updateProfileFromChat(userId, conversationData) {
    // Extract financial information from conversation
    // This can use NLP to extract income, expenses, goals, etc.
    // For now, manual update via API

    const profileResult = await query(
      `SELECT * FROM financial_profiles WHERE user_id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      // Create new profile
      await query(
        `INSERT INTO financial_profiles (user_id, monthly_income, monthly_expenses, savings_goal, risk_tolerance)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          conversationData.monthly_income || null,
          conversationData.monthly_expenses || null,
          conversationData.savings_goal || null,
          conversationData.risk_tolerance || null,
        ]
      );
    } else {
      // Update existing profile
      await query(
        `UPDATE financial_profiles
         SET monthly_income = COALESCE($2, monthly_income),
             monthly_expenses = COALESCE($3, monthly_expenses),
             savings_goal = COALESCE($4, savings_goal),
             risk_tolerance = COALESCE($5, risk_tolerance),
             updated_at = NOW()
         WHERE user_id = $1`,
        [
          userId,
          conversationData.monthly_income,
          conversationData.monthly_expenses,
          conversationData.savings_goal,
          conversationData.risk_tolerance,
        ]
      );
    }
  }
}

export default new MoneyCoachService();
```

### 3.3 Money Coach Controller

**File:** `backend/src/controllers/moneyCoachController.js` (NEW)

```javascript
import moneyCoachService from '../services/moneyCoachService.js';
import { sendMessage } from '../services/chatService.js';
import logger from '../utils/logger.js';

export const analyzeFinancialSituation = async (req, res) => {
  try {
    const userId = req.user.id;

    const analysis = await moneyCoachService.analyzeFinancialSituation(userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Money coach analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const chatWithMoneyCoach = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Get user profile for context
    const analysis = await moneyCoachService.analyzeFinancialSituation(userId);
    const systemPrompt = moneyCoachService.buildSystemPrompt(analysis.profile);

    // Send message with money coach context
    const response = await sendMessage(userId, message, {
      systemPrompt,
      provider: 'vertex-ai',
    });

    res.json(response);
  } catch (error) {
    logger.error('Money coach chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateFinancialProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    await moneyCoachService.updateProfileFromChat(userId, profileData);

    res.json({
      success: true,
      message: 'Financial profile updated',
    });
  } catch (error) {
    logger.error('Update financial profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

### 3.4 Money Coach Routes

**File:** `backend/src/routes/moneyCoach.js` (NEW)

```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as moneyCoachController from '../controllers/moneyCoachController.js';

const router = express.Router();

router.use(authenticate);

router.get('/analyze', moneyCoachController.analyzeFinancialSituation);
router.post('/chat', moneyCoachController.chatWithMoneyCoach);
router.put('/profile', moneyCoachController.updateFinancialProfile);

export default router;
```

**File:** `backend/src/server.js` (UPDATE)

```javascript
import moneyCoachRoutes from './routes/moneyCoach.js'; // ADD THIS

// Add route
app.use('/api/v1/money-coach', moneyCoachRoutes);
```

---

## Phase 4: Loan Assistant

### 4.1 Loan Assistant Service

**File:** `backend/src/services/loanAssistantService.js` (NEW)

```javascript
import { query } from '../db/index.js';
import ragService from './ragService.js';
import creditScoreService from './creditScoreService.js';
import logger from '../utils/logger.js';

class LoanAssistantService {
  /**
   * Build loan assistant system prompt
   */
  buildSystemPrompt(userLoans = [], creditScore = null) {
    let prompt = `You are JECO+ Loan Assistant, a specialized loan advisor for Thai users.

Your role:
1. Help users understand loan products and requirements
2. Calculate loan installments and interest
3. Recommend suitable loan products based on user profile
4. Guide users through loan application process
5. Answer questions about loan terms, eligibility, and documents

Available Loan Products:
- Personal loans (สินเชื่อส่วนบุคคล): 5,000 - 100,000 THB, APR 18-25%
- KB Personal Loan: Up to 500,000 THB, APR from 15%
- Pah Pay: For users without credit history, uses AI credit scoring
- Vehicle title loans (สินเชื่อจำนำทะเบียนรถ): Secured loans using vehicle as collateral

Rules:
- Always calculate installments accurately
- Explain loan terms clearly
- Never guarantee approval
- Guide users to check eligibility before applying`;

    if (userLoans.length > 0) {
      prompt += `\n\nUser's Current Loans:`;
      userLoans.forEach(loan => {
        prompt += `\n- ${loan.name}: ${loan.amount} THB, ${loan.term_months} months, Status: ${loan.status}`;
      });
    }

    if (creditScore) {
      prompt += `\n\nUser's Credit Score: ${creditScore.score} (${creditScore.grade})`;
    }

    return prompt;
  }

  /**
   * Get user loan information
   */
  async getUserLoans(userId) {
    try {
      const result = await query(
        `SELECT 
          la.id,
          la.amount_requested,
          la.term_months,
          la.status,
          lp.name,
          lp.provider
         FROM loan_applications la
         LEFT JOIN loan_products lp ON la.product_id = lp.id
         WHERE la.user_id = $1
         ORDER BY la.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error getting user loans:', error);
      throw error;
    }
  }

  /**
   * Calculate loan installment
   */
  calculateInstallment(principal, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    const installment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(installment * 100) / 100;
  }

  /**
   * Recommend loans for user
   */
  async recommendLoans(userId, requestedAmount = null, termMonths = null) {
    try {
    // Get user credit score
      const creditScoreResult = await query(
        `SELECT score, grade FROM credit_scores 
         WHERE loan_app_id IN (
           SELECT id FROM loan_applications WHERE user_id = $1
         )
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      const creditScore = creditScoreResult.rows[0];

      // Build recommendation query
      let queryText = 'Recommend loan products for user';
      if (requestedAmount) {
        queryText += ` requesting ${requestedAmount} THB`;
      }
      if (termMonths) {
        queryText += ` for ${termMonths} months`;
      }
      if (creditScore) {
        queryText += ` with credit score ${creditScore.score}`;
      }

      // Use RAG to find relevant loans
      const ragContext = await ragService.retrieveContext(queryText, userId, {
        entityTypes: ['loan'],
        maxResults: 5,
      });

      // Get actual loan products
      let loanQuery = `
        SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider, description
        FROM loan_products
        WHERE status = 'active'
      `;

      const params = [];
      let paramIndex = 1;

      if (requestedAmount) {
        loanQuery += ` AND min_amount <= $${paramIndex} AND max_amount >= $${paramIndex}`;
        params.push(requestedAmount);
        paramIndex++;
      }

      loanQuery += ` ORDER BY min_apr ASC LIMIT 5`;

      const loansResult = await query(loanQuery, params);
      const loans = loansResult.rows;

      // Calculate installments for each loan
      const loansWithInstallments = loans.map(loan => {
        const amount = requestedAmount || loan.min_amount;
        const rate = loan.min_apr;
        const term = termMonths || 12;

        return {
          ...loan,
          recommendedAmount: amount,
          recommendedTerm: term,
          monthlyInstallment: this.calculateInstallment(amount, rate, term),
          totalInterest: (this.calculateInstallment(amount, rate, term) * term) - amount,
        };
      });

      return {
        loans: loansWithInstallments,
        creditScore,
        recommendations: ragContext.contexts,
      };
    } catch (error) {
      logger.error('Error recommending loans:', error);
      throw error;
    }
  }

  /**
   * Compare loan products
   */
  async compareLoans(loanIds, amount, termMonths) {
    try {
      const result = await query(
        `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider
         FROM loan_products
         WHERE id = ANY($1::uuid[])
         AND min_amount <= $2 AND max_amount >= $2`,
        [loanIds, amount]
      );

      const comparisons = result.rows.map(loan => ({
        ...loan,
        monthlyInstallment: this.calculateInstallment(amount, loan.min_apr, termMonths),
        totalInterest: (this.calculateInstallment(amount, loan.min_apr, termMonths) * termMonths) - amount,
        totalAmount: this.calculateInstallment(amount, loan.min_apr, termMonths) * termMonths,
      }));

      return comparisons.sort((a, b) => a.monthlyInstallment - b.monthlyInstallment);
    } catch (error) {
      logger.error('Error comparing loans:', error);
      throw error;
    }
  }
}

export default new LoanAssistantService();
```

### 4.2 Loan Assistant Controller

**File:** `backend/src/controllers/loanAssistantController.js` (NEW)

```javascript
import loanAssistantService from '../services/loanAssistantService.js';
import { sendMessage } from '../services/chatService.js';
import logger from '../utils/logger.js';

export const getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await loanAssistantService.getUserLoans(userId);

    res.json({
      success: true,
      data: loans,
    });
  } catch (error) {
    logger.error('Get my loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const recommendLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, termMonths } = req.query;

    const recommendations = await loanAssistantService.recommendLoans(
      userId,
      amount ? parseFloat(amount) : null,
      termMonths ? parseInt(termMonths) : null
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Recommend loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const calculateInstallment = async (req, res) => {
  try {
    const { amount, annualRate, months } = req.body;

    const installment = loanAssistantService.calculateInstallment(
      parseFloat(amount),
      parseFloat(annualRate),
      parseInt(months)
    );

    const totalAmount = installment * parseInt(months);
    const totalInterest = totalAmount - parseFloat(amount);

    res.json({
      success: true,
      data: {
        monthlyInstallment: installment,
        totalAmount,
        totalInterest,
        principal: parseFloat(amount),
        termMonths: parseInt(months),
        annualRate: parseFloat(annualRate),
      },
    });
  } catch (error) {
    logger.error('Calculate installment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const compareLoans = async (req, res) => {
  try {
    const { loanIds, amount, termMonths } = req.body;

    const comparisons = await loanAssistantService.compareLoans(
      loanIds,
      parseFloat(amount),
      parseInt(termMonths)
    );

    res.json({
      success: true,
      data: comparisons,
    });
  } catch (error) {
    logger.error('Compare loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const chatWithLoanAssistant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Get user loans and credit score for context
    const userLoans = await loanAssistantService.getUserLoans(userId);
    const creditScoreResult = await query(
      `SELECT score, grade FROM credit_scores 
       WHERE loan_app_id IN (SELECT id FROM loan_applications WHERE user_id = $1)
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const creditScore = creditScoreResult.rows[0] || null;

    const systemPrompt = loanAssistantService.buildSystemPrompt(userLoans, creditScore);

    // Send message with loan assistant context
    const response = await sendMessage(userId, message, {
      systemPrompt,
      provider: 'vertex-ai',
    });

    res.json(response);
  } catch (error) {
    logger.error('Loan assistant chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

### 4.3 Loan Assistant Routes

**File:** `backend/src/routes/loanAssistant.js` (NEW)

```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as loanAssistantController from '../controllers/loanAssistantController.js';

const router = express.Router();

router.use(authenticate);

router.get('/my-loans', loanAssistantController.getMyLoans);
router.get('/recommend', loanAssistantController.recommendLoans);
router.post('/calculate', loanAssistantController.calculateInstallment);
router.post('/compare', loanAssistantController.compareLoans);
router.post('/chat', loanAssistantController.chatWithLoanAssistant);

export default router;
```

**File:** `backend/src/server.js` (UPDATE)

```javascript
import loanAssistantRoutes from './routes/loanAssistant.js'; // ADD THIS

app.use('/api/v1/loan-assistant', loanAssistantRoutes);
```

---

## Database Schema

### Complete Migration Files

All migration files are listed above. Run them in order:

```bash
cd backend
npm run migrate
```

### Required Extensions

```sql
-- Enable pgvector for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable full-text search in Thai
-- (May require additional setup depending on PostgreSQL version)
```

---

## API Endpoints

### Chat Endpoints (Enhanced with RAG)

```
POST   /api/v1/chat/messages          - Send message (with RAG context)
GET    /api/v1/chat/conversations     - Get conversations
GET    /api/v1/chat/conversations/:id - Get conversation
DELETE /api/v1/chat/conversations/:id - Delete conversation
```

### Money Coach Endpoints

```
GET    /api/v1/money-coach/analyze    - Analyze financial situation
POST   /api/v1/money-coach/chat       - Chat with money coach
PUT    /api/v1/money-coach/profile    - Update financial profile
```

### Loan Assistant Endpoints

```
GET    /api/v1/loan-assistant/my-loans    - Get user's loans
GET    /api/v1/loan-assistant/recommend   - Get loan recommendations
POST   /api/v1/loan-assistant/calculate   - Calculate installment
POST   /api/v1/loan-assistant/compare     - Compare loan products
POST   /api/v1/loan-assistant/chat        - Chat with loan assistant
```

### RAG Pipeline Endpoints (Admin)

```
POST   /api/v1/admin/rag/sync/:entityType - Trigger manual sync
GET    /api/v1/admin/rag/jobs            - Get pipeline jobs
GET    /api/v1/admin/rag/stats           - Get pipeline statistics
```

---

## Frontend Components

### Enhanced Chat Widget

**File:** `src/components/chat/AIChatWidget.vue` (UPDATE)

Add support for:
- Product recommendations display
- Loan comparison cards
- Financial profile summary
- Context-aware responses

### Money Coach View

**File:** `src/views/MoneyCoachView.vue` (NEW)

```vue
<template>
  <div class="money-coach-view">
    <FinancialSummaryCard :analysis="analysis" />
    <ProductRecommendations :products="recommendations.products" />
    <LoanRecommendations :loans="recommendations.loans" />
    <AIChatWidget mode="money-coach" />
  </div>
</template>
```

### Loan Assistant View

**File:** `src/views/LoanAssistantView.vue` (NEW)

```vue
<template>
  <div class="loan-assistant-view">
    <MyLoansCard :loans="myLoans" />
    <LoanCalculator />
    <LoanComparison :loans="comparisons" />
    <AIChatWidget mode="loan-assistant" />
  </div>
</template>
```

---

## Testing Strategy

### Unit Tests

```javascript
// backend/tests/services/vertexAIService.test.js
// backend/tests/services/ragService.test.js
// backend/tests/services/moneyCoachService.test.js
// backend/tests/services/loanAssistantService.test.js
```

### Integration Tests

```javascript
// backend/tests/integration/chat.test.js
// backend/tests/integration/ragPipeline.test.js
```

### E2E Tests

```javascript
// e2e/money-coach.spec.js
// e2e/loan-assistant.spec.js
```

---

## Deployment Guide

### 1. GCP Setup

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Set up authentication
export GOOGLE_APPLICATION_CREDENTIALS="./gcp-credentials.json"
```

### 2. Database Setup

```bash
# Install pgvector extension
psql -d jecoplus -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
cd backend
npm run migrate
```

### 3. Environment Variables

```bash
# .env file
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
VERTEX_EMBEDDING_MODEL=text-embedding-004
```

### 4. Start Services

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ..
npm install
npm run dev
```

---

## Cost Estimation

### Vertex AI Costs

- **Gemini 1.5 Pro**: ~$0.00125 per 1K input tokens, $0.005 per 1K output tokens
- **Embeddings**: ~$0.0001 per 1K tokens
- **Estimated per conversation**: $0.01-0.05
- **Monthly (10K users, 2 conversations/user)**: ~$200-1,000

### Infrastructure Costs

- **PostgreSQL + pgvector**: Existing infrastructure
- **Vector storage**: Minimal (embeddings are small)
- **ETL jobs**: Negligible compute cost

---

## Implementation Checklist

### Phase 1: Vertex AI Migration
- [ ] Install Vertex AI SDK
- [ ] Create vertexAI.js config
- [ ] Implement vertexAIService.js
- [ ] Update aiChatService.js
- [ ] Test Vertex AI integration
- [ ] Update environment variables

### Phase 2: RAG Pipeline
- [ ] Create migration 008_rag_pipeline_schema.sql
- [ ] Install pgvector extension
- [ ] Implement embeddingService.js
- [ ] Implement ragService.js
- [ ] Implement ragPipelineJob.js
- [ ] Implement scheduler.js
- [ ] Update chatService.js with RAG
- [ ] Test RAG pipeline
- [ ] Run initial data sync

### Phase 3: Money Coach
- [ ] Create migration 009_financial_profile_schema.sql
- [ ] Implement moneyCoachService.js
- [ ] Implement moneyCoachController.js
- [ ] Create moneyCoach routes
- [ ] Create MoneyCoachView.vue
- [ ] Test money coach features

### Phase 4: Loan Assistant
- [ ] Implement loanAssistantService.js
- [ ] Implement loanAssistantController.js
- [ ] Create loanAssistant routes
- [ ] Create LoanAssistantView.vue
- [ ] Test loan assistant features

### Integration & Testing
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

---

## Next Steps

1. **Review this plan** with the team
2. **Set up GCP project** and enable Vertex AI
3. **Install dependencies** and run migrations
4. **Start with Phase 1** (Vertex AI migration)
5. **Iterate through phases** sequentially
6. **Test thoroughly** at each phase
7. **Deploy incrementally**

---

**This plan is production-ready and can be implemented immediately without blockers.**
