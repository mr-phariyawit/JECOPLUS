-- Migration: Partner Submissions Schema
-- Purpose: Store loan application submissions to external partners
-- Created: 2026-01-22

CREATE TABLE IF NOT EXISTS partner_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id VARCHAR(100), -- Partner reference ID
    application_id VARCHAR(100), -- Partner's application ID
    status VARCHAR(50) NOT NULL, -- PENDING_REVIEW, APPROVED, REJECTED, FAILED
    payload JSONB NOT NULL DEFAULT '{}', -- Request payload sent to partner
    response JSONB NOT NULL DEFAULT '{}', -- Response from partner API
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    CONSTRAINT partner_submissions_status_check CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'FAILED'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_submissions_user_id ON partner_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_application_id ON partner_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_status ON partner_submissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_submitted_at ON partner_submissions(submitted_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_partner_submissions_user_status ON partner_submissions(user_id, status);

COMMENT ON TABLE partner_submissions IS 'Tracks loan application submissions to external lending partners';
COMMENT ON COLUMN partner_submissions.partner_id IS 'External partner reference ID';
COMMENT ON COLUMN partner_submissions.application_id IS 'Unique application ID from partner system';
COMMENT ON COLUMN partner_submissions.status IS 'Current status of the submission';
COMMENT ON COLUMN partner_submissions.payload IS 'JSON payload sent to partner API';
COMMENT ON COLUMN partner_submissions.response IS 'JSON response received from partner API';
