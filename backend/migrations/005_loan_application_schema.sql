-- Loan Application Schema
-- Version: 1.4.0

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE loan_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED');

-- =====================================================
-- LOAN APPLICATIONS TABLE
-- =====================================================

CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application Details
    amount_requested DECIMAL(15, 2),
    term_months INT,
    purpose VARCHAR(255),
    
    -- Status Tracking
    status loan_status DEFAULT 'DRAFT',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Snapshots (Foreign Keys to specific versions of data used for decision)
    credit_score_id UUID REFERENCES credit_scores(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loan_applications_user ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);

-- Trigger for updated_at
CREATE TRIGGER update_loan_applications_updated_at
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE loan_applications IS 'User loan applications';
