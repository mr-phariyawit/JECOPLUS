-- Credit Score Schema
-- Version: 1.3.0

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE credit_score_status AS ENUM ('APPROVED', 'REJECTED', 'REVIEW', 'PENDING');

-- =====================================================
-- CREDIT SCORES TABLE
-- =====================================================

CREATE TABLE credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Score data
    score INT NOT NULL,
    status credit_score_status NOT NULL,
    
    -- Factors (snapshot of calculation)
    monthly_income DECIMAL(15, 2),
    monthly_expenses DECIMAL(15, 2),
    expense_ratio DECIMAL(5, 2),
    avg_balance DECIMAL(15, 2),
    
    -- Detailed breakdown (JSON)
    factors_breakdown JSONB, -- e.g., { "incomeScore": 150, "expenseScore": 100 }

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT score_range CHECK (score >= 300 AND score <= 850)
);

CREATE INDEX idx_credit_scores_user ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_created ON credit_scores(created_at DESC);

COMMENT ON TABLE credit_scores IS 'History of user credit calculations';
