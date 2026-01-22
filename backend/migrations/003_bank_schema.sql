-- Bank Schema
-- Version: 1.2.0

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE bank_account_status AS ENUM ('VERIFIED', 'PENDING', 'REJECTED', 'DELETED');
CREATE TYPE statement_status AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- =====================================================
-- BANK ACCOUNTS TABLE
-- =====================================================

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Account Details
    bank_code VARCHAR(10) NOT NULL, -- e.g., SCB, KBANK, BBL
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    
    -- Status
    status bank_account_status DEFAULT 'VERIFIED', -- Auto-verify for mock
    is_primary BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_account UNIQUE (user_id, bank_code, account_number)
);

CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);

-- =====================================================
-- BANK STATEMENTS TABLE
-- =====================================================

CREATE TABLE bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File Info
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- GCS path or local path
    mime_type VARCHAR(50) DEFAULT 'application/pdf',
    
    -- Processing
    status statement_status DEFAULT 'PROCESSING',
    processed_at TIMESTAMPTZ,
    transaction_count INT DEFAULT 0,
    error_message TEXT,
    
    -- Extracted Data (JSON)
    raw_data JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_statements_user ON bank_statements(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_statements_updated_at
    BEFORE UPDATE ON bank_statements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE bank_accounts IS 'User linked bank accounts';
COMMENT ON TABLE bank_statements IS 'Uploaded bank statements for credit scoring';
