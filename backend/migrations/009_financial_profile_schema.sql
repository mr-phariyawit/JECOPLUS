-- Financial Profile Schema
-- Version: 1.0.0
-- Description: User financial profiles for money coach AI

-- =====================================================
-- FINANCIAL PROFILES TABLE
-- =====================================================

CREATE TABLE financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Income & Expenses
    monthly_income DECIMAL(15, 2),
    monthly_expenses DECIMAL(15, 2),
    savings_goal DECIMAL(15, 2),
    savings_deadline DATE,
    
    -- Financial Goals
    goals JSONB DEFAULT '[]', -- Array of goal objects: {name, amount, deadline, priority}
    risk_tolerance VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
    
    -- Spending Analysis
    spending_categories JSONB DEFAULT '{}', -- Category breakdown: {food: 8000, transport: 5000, ...}
    average_monthly_savings DECIMAL(15, 2),
    
    -- AI Recommendations
    recommended_products JSONB DEFAULT '[]', -- Array of product IDs and reasons
    recommended_loans JSONB DEFAULT '[]', -- Array of loan IDs and reasons
    
    -- Metadata
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

CREATE INDEX idx_financial_profiles_user ON financial_profiles(user_id);
CREATE INDEX idx_financial_profiles_updated ON financial_profiles(updated_at);

COMMENT ON TABLE financial_profiles IS 'User financial profiles for money coach AI - stores income, expenses, goals, and recommendations';
COMMENT ON COLUMN financial_profiles.goals IS 'Array of financial goals: [{name: "Emergency fund", amount: 100000, deadline: "2026-12-31", priority: "high"}]';
COMMENT ON COLUMN financial_profiles.spending_categories IS 'Monthly spending by category: {food: 8000, transport: 5000, shopping: 12000}';
COMMENT ON COLUMN financial_profiles.recommended_products IS 'AI-recommended products with reasoning: [{product_id: "uuid", reason: "Matches spending pattern", score: 0.85}]';

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_financial_profiles_updated_at
    BEFORE UPDATE ON financial_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
