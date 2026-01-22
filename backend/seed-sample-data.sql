-- Sample Data for JECO+ Testing
-- Creates users, credit scores, and loan applications for testing

-- =====================================================
-- SAMPLE USERS
-- =====================================================

-- Regular user 1 (with loan application)
INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role, kyc_status, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '0812345678', 'user1@test.com', '$2b$10$.ZtKGlSF7pJkZXtBP1GncOXsQPJanOXbzGbDYZk8zKK0D2G9fUIzK', 'สมชาย', 'ทดสอบ', 'USER', 'VERIFIED', 'ACTIVE', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (phone) DO NOTHING;

-- Regular user 2
INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role, kyc_status, status, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '0823456789', 'user2@test.com', '$2b$10$.ZtKGlSF7pJkZXtBP1GncOXsQPJanOXbzGbDYZk8zKK0D2G9fUIzK', 'สมหญิง', 'ทดสอบ', 'USER', 'VERIFIED', 'ACTIVE', NOW() - INTERVAL '25 days', NOW())
ON CONFLICT (phone) DO NOTHING;

-- Regular user 3
INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role, kyc_status, status, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '0834567890', 'user3@test.com', '$2b$10$.ZtKGlSF7pJkZXtBP1GncOXsQPJanOXbzGbDYZk8zKK0D2G9fUIzK', 'ประยุทธ์', 'ทดสอบ', 'USER', 'VERIFIED', 'ACTIVE', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (phone) DO NOTHING;

-- Regular user 4
INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role, kyc_status, status, created_at, updated_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', '0845678901', 'user4@test.com', '$2b$10$.ZtKGlSF7pJkZXtBP1GncOXsQPJanOXbzGbDYZk8zKK0D2G9fUIzK', 'วิภา', 'ทดสอบ', 'USER', 'VERIFIED', 'ACTIVE', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (phone) DO NOTHING;

-- =====================================================
-- CREDIT SCORES
-- =====================================================

-- Excellent credit (750)
INSERT INTO credit_scores (id, user_id, score, status, factors_breakdown, created_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 750, 'APPROVED',
   '{"paymentHistory": {"score": 100, "weight": 0.35}, "creditUtilization": {"score": 85, "weight": 0.30}, "creditAge": {"score": 70, "weight": 0.15}, "creditMix": {"score": 60, "weight": 0.10}, "newCredit": {"score": 80, "weight": 0.10}}'::jsonb,
   NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Good credit (680)
INSERT INTO credit_scores (id, user_id, score, status, factors_breakdown, created_at)
VALUES
  ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 680, 'APPROVED',
   '{"paymentHistory": {"score": 90, "weight": 0.35}, "creditUtilization": {"score": 70, "weight": 0.30}, "creditAge": {"score": 65, "weight": 0.15}, "creditMix": {"score": 55, "weight": 0.10}, "newCredit": {"score": 70, "weight": 0.10}}'::jsonb,
   NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Fair credit (620)
INSERT INTO credit_scores (id, user_id, score, status, factors_breakdown, created_at)
VALUES
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 620, 'APPROVED',
   '{"paymentHistory": {"score": 75, "weight": 0.35}, "creditUtilization": {"score": 60, "weight": 0.30}, "creditAge": {"score": 50, "weight": 0.15}, "creditMix": {"score": 45, "weight": 0.10}, "newCredit": {"score": 60, "weight": 0.10}}'::jsonb,
   NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Poor credit (550)
INSERT INTO credit_scores (id, user_id, score, status, factors_breakdown, created_at)
VALUES
  ('c4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 550, 'APPROVED',
   '{"paymentHistory": {"score": 60, "weight": 0.35}, "creditUtilization": {"score": 50, "weight": 0.30}, "creditAge": {"score": 40, "weight": 0.15}, "creditMix": {"score": 35, "weight": 0.10}, "newCredit": {"score": 50, "weight": 0.10}}'::jsonb,
   NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- LOAN APPLICATIONS
-- =====================================================

-- Loan 1: SUBMITTED - High amount, excellent credit
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, created_at, updated_at)
VALUES
  ('loan1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 500000.00, 24, 'เงินทุนหมุนเวียนธุรกิจ', 'SUBMITTED',
   'c1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Loan 2: UNDER_REVIEW - Medium amount, good credit
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, created_at, updated_at)
VALUES
  ('loan2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 200000.00, 12, 'ซื้อรถยนต์', 'UNDER_REVIEW',
   'c2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Loan 3: APPROVED - Small amount, fair credit
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, approved_at, created_at, updated_at)
VALUES
  ('loan3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 100000.00, 6, 'ชำระหนี้บัตรเครดิต', 'APPROVED',
   'c3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Loan 4: REJECTED - Large amount, poor credit
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, rejected_at, rejection_reason, created_at, updated_at)
VALUES
  ('loan4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 800000.00, 36, 'ซื้อบ้าน', 'REJECTED',
   'c4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'คะแนนเครดิตต่ำกว่าเกณฑ์ที่กำหนด', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Loan 5: SUBMITTED - Medium amount for review
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, created_at, updated_at)
VALUES
  ('loan5555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 350000.00, 18, 'ขยายธุรกิจ', 'SUBMITTED',
   'c1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Loan 6: UNDER_REVIEW - Small amount
INSERT INTO loan_applications (id, user_id, amount_requested, term_months, purpose, status, credit_score_id, submitted_at, created_at, updated_at)
VALUES
  ('loan6666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 75000.00, 3, 'เงินฉุกเฉิน', 'UNDER_REVIEW',
   'c2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '6 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- WALLETS (for loan recipients)
-- =====================================================

INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 0.00, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 0.00, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 100000.00, NOW(), NOW()), -- Approved loan disbursed
  ('44444444-4444-4444-4444-444444444444', 0.00, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Sample data inserted successfully!' as message;
SELECT '✅ Users: 4' as stats;
SELECT '✅ Credit Scores: 4' as stats;
SELECT '✅ Loan Applications: 6' as stats;
SELECT '  - SUBMITTED: 2' as breakdown;
SELECT '  - UNDER_REVIEW: 2' as breakdown;
SELECT '  - APPROVED: 1' as breakdown;
SELECT '  - REJECTED: 1' as breakdown;
