-- RAG Pipeline Schema
-- Version: 1.0.0
-- Description: Vector embeddings and RAG pipeline infrastructure

-- Enable pgvector extension (if not already enabled)
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
    embedding vector(768), -- Dimension for text-embedding-004 (768 dimensions)
    
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
-- Note: IVFFlat requires at least 1000 rows for optimal performance
CREATE INDEX idx_embeddings_vector ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Entity lookup indexes
CREATE INDEX idx_embeddings_entity ON embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_created ON embeddings(created_at);

-- Full-text search index for fallback
CREATE INDEX idx_embeddings_text_search ON embeddings 
USING gin(to_tsvector('thai', chunk_text));

COMMENT ON TABLE embeddings IS 'Vector embeddings for RAG pipeline - stores embeddings for semantic search';
COMMENT ON COLUMN embeddings.entity_type IS 'Type of entity: product, loan, user_profile, transaction';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding (768 dimensions for text-embedding-004)';

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
CREATE INDEX idx_pipeline_jobs_entity ON pipeline_jobs(entity_type, status);

COMMENT ON TABLE pipeline_jobs IS 'ETL pipeline job tracking and monitoring';

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

COMMENT ON TABLE vector_search_cache IS 'Cache for vector search results to improve performance';

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for embeddings table
CREATE TRIGGER update_embeddings_updated_at
    BEFORE UPDATE ON embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_embeddings_updated_at();

-- =====================================================
-- CLEANUP FUNCTION FOR EXPIRED CACHE
-- =====================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM vector_search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_cache() IS 'Removes expired entries from vector search cache';
