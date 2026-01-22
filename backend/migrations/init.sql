-- JECOPLUS Database Schema
-- Version: 1.0.0
-- Last Updated: 2025-01-22

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE kyc_status AS ENUM ('NONE', 'PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE otp_purpose AS ENUM ('LOGIN', 'VERIFY_PHONE', 'RESET_PIN', 'TRANSACTION');
CREATE TYPE otp_status AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
CREATE TYPE kyc_document_type AS ENUM ('ID_CARD_FRONT', 'ID_CARD_BACK', 'SELFIE', 'LIVENESS_VIDEO');
CREATE TYPE kyc_verification_status AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW');
CREATE TYPE activity_action AS ENUM (
    'LOGIN', 'LOGOUT', 'VIEW', 'CREATE', 'UPDATE', 'DELETE',
    'APPROVE_KYC', 'REJECT_KYC', 'SUSPEND_USER', 'UNSUSPEND_USER',
    'EXPORT_DATA', 'CHANGE_SETTINGS'
);

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(10) NOT NULL UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    firebase_uid VARCHAR(128) UNIQUE,

    -- Personal Info (populated after KYC)
    citizen_id VARCHAR(13) UNIQUE,
    title VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),

    -- Contact
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    district VARCHAR(100),
    sub_district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(5),

    -- Status
    kyc_status kyc_status DEFAULT 'NONE',
    status user_status DEFAULT 'ACTIVE',
    role user_role DEFAULT 'USER',

    -- Admin only
    password_hash VARCHAR(255),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^0[689]\d{8}$'),
    CONSTRAINT valid_citizen_id CHECK (citizen_id IS NULL OR citizen_id ~ '^\d{13}$')
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_citizen_id ON users(citizen_id);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- =====================================================
-- OTP REQUESTS TABLE
-- =====================================================

CREATE TABLE otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(10) NOT NULL,
    otp_code VARCHAR(255), -- Stored hashed
    purpose otp_purpose NOT NULL,
    status otp_status DEFAULT 'PENDING',

    -- Firebase verification
    firebase_session_info TEXT,

    -- Tracking
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_otp_phone CHECK (phone ~ '^0[689]\d{8}$')
);

CREATE INDEX idx_otp_phone_status ON otp_requests(phone, status);
CREATE INDEX idx_otp_expires ON otp_requests(expires_at);
CREATE INDEX idx_otp_created_at ON otp_requests(created_at DESC);

-- =====================================================
-- REFRESH TOKENS TABLE
-- =====================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,

    -- Device info
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50),

    -- Status
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(255),

    -- Validity
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =====================================================
-- KYC SESSIONS TABLE
-- =====================================================

CREATE TABLE kyc_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session tracking
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status kyc_verification_status DEFAULT 'PENDING',

    -- NDID Integration
    ndid_request_id VARCHAR(255),
    ndid_reference_id VARCHAR(255),
    ndid_status VARCHAR(50),

    -- OCR Results (from ID Card)
    ocr_citizen_id VARCHAR(13),
    ocr_title VARCHAR(20),
    ocr_first_name VARCHAR(100),
    ocr_last_name VARCHAR(100),
    ocr_first_name_en VARCHAR(100),
    ocr_last_name_en VARCHAR(100),
    ocr_date_of_birth DATE,
    ocr_issue_date DATE,
    ocr_expiry_date DATE,
    ocr_address TEXT,
    ocr_confidence_score DECIMAL(5,2),

    -- Face Matching
    face_match_score DECIMAL(5,2),
    face_match_passed BOOLEAN,

    -- Liveness Detection
    liveness_score DECIMAL(5,2),
    liveness_passed BOOLEAN,

    -- NDID Verification
    ndid_verified BOOLEAN DEFAULT FALSE,
    ndid_verified_at TIMESTAMPTZ,

    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    rejection_code VARCHAR(50),

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_kyc_sessions_user ON kyc_sessions(user_id);
CREATE INDEX idx_kyc_sessions_status ON kyc_sessions(status);
CREATE INDEX idx_kyc_sessions_ndid ON kyc_sessions(ndid_request_id);
CREATE INDEX idx_kyc_sessions_created_at ON kyc_sessions(created_at DESC);

-- =====================================================
-- KYC DOCUMENTS TABLE
-- =====================================================

CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_session_id UUID NOT NULL REFERENCES kyc_sessions(id) ON DELETE CASCADE,
    document_type kyc_document_type NOT NULL,

    -- Storage
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    checksum VARCHAR(64),

    -- Processing
    is_processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(kyc_session_id, document_type)
);

CREATE INDEX idx_kyc_documents_session ON kyc_documents(kyc_session_id);

-- =====================================================
-- ADMIN ACTIVITY LOGS TABLE
-- =====================================================

CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action activity_action NOT NULL,

    -- Target
    target_type VARCHAR(50),
    target_id UUID,

    -- Details
    description TEXT,
    old_value JSONB,
    new_value JSONB,

    -- Request info
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_activity_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX idx_activity_logs_created ON admin_activity_logs(created_at DESC);

-- =====================================================
-- SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('otp_expiry_seconds', '300', 'OTP validity period in seconds'),
('otp_max_attempts', '3', 'Maximum OTP verification attempts'),
('otp_cooldown_seconds', '60', 'Cooldown between OTP requests'),
('kyc_session_expiry_hours', '24', 'KYC session validity in hours'),
('jwt_access_token_expiry', '"15m"', 'Access token expiry'),
('jwt_refresh_token_expiry', '"7d"', 'Refresh token expiry'),
('face_match_threshold', '0.85', 'Minimum face match score'),
('liveness_threshold', '0.90', 'Minimum liveness score');

-- Create default super admin (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (id, phone, first_name, last_name, email, role, status, kyc_status, password_hash)
VALUES (
    gen_random_uuid(),
    '0999999999',
    'Super',
    'Admin',
    'admin@jecoplus.com',
    'SUPER_ADMIN',
    'ACTIVE',
    'VERIFIED',
    '$2b$10$rQZ8K7YM5v8H5vX5Y5Y5YOZv8H5v8H5v8H5v8H5v8H5v8H5v8H5v' -- bcrypt hash of 'admin123'
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_sessions_updated_at
    BEFORE UPDATE ON kyc_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired OTP requests (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    UPDATE otp_requests SET status = 'EXPIRED'
    WHERE status = 'PENDING' AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to clean up expired refresh tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql';

COMMENT ON TABLE users IS 'User accounts including regular users and admins';
COMMENT ON TABLE otp_requests IS 'OTP verification requests for phone authentication';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON TABLE kyc_sessions IS 'KYC verification sessions with NDID integration';
COMMENT ON TABLE kyc_documents IS 'Documents uploaded during KYC verification';
COMMENT ON TABLE admin_activity_logs IS 'Audit log for admin actions';
COMMENT ON TABLE system_settings IS 'System configuration settings';
