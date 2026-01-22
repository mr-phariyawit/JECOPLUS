-- Chat Schema
-- Version: 1.0.0
-- Last Updated: 2026-01-22

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE ai_provider AS ENUM ('claude', 'gemini', 'openai');

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conversation Details
    title VARCHAR(255),
    provider ai_provider DEFAULT 'gemini',
    system_prompt TEXT,
    
    -- Metadata
    message_count INT DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message Content
    role message_role NOT NULL,
    content TEXT NOT NULL,
    
    -- AI Metadata
    provider ai_provider,
    model VARCHAR(100), -- e.g., 'claude-3-sonnet', 'gemini-1.5-pro'
    tokens_used INT,
    response_time_ms INT,
    
    -- Context & RAG (for future)
    context_used JSONB, -- Array of retrieved context chunks
    metadata JSONB, -- Additional metadata
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_role ON messages(role);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update conversation updated_at and last_message_at
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        updated_at = NOW(),
        message_count = (
            SELECT COUNT(*) FROM messages 
            WHERE conversation_id = NEW.conversation_id
        )
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Update conversation updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE conversations IS 'AI chat conversations';
COMMENT ON TABLE messages IS 'Chat messages (user and AI responses)';
