-- Wallet Schema
-- Version: 1.1.0

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE wallet_status AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE transaction_type AS ENUM ('TOPUP', 'WITHDRAW', 'PAYMENT', 'TRANSFER', 'REFUND', 'ADJUSTMENT');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED');

-- =====================================================
-- WALLETS TABLE
-- =====================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balance
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'THB' NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    
    -- Status
    status wallet_status DEFAULT 'ACTIVE',
    
    -- Limits (optional for now, good for future)
    daily_limit DECIMAL(15, 2),
    monthly_limit DECIMAL(15, 2),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT positive_balance CHECK (balance >= 0)
);

CREATE UNIQUE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    
    -- Transaction Details
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Can be negative for deductions? Or always positive with type determining sign? Let's use signed logic in App, positive here usually, but let's allow negative just in case.
    fee DECIMAL(15, 2) DEFAULT 0.00,
    balance_after DECIMAL(15, 2) NOT NULL,
    
    -- State
    status transaction_status DEFAULT 'PENDING',
    
    -- Reference
    reference_id VARCHAR(255), -- External Ref (e.g., Bank Ref, Payment Gateway ID)
    related_transaction_id UUID, -- For refunds linking to original
    
    -- Details
    description TEXT,
    metadata JSONB, -- Store extra details like bank_name, account_number, etc.

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_ref ON transactions(reference_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE wallets IS 'User digital wallets';
COMMENT ON TABLE transactions IS 'Wallet transaction history';
