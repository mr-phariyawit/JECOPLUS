# Backend & API Analysis - JECO+

**Generated:** 2026-01-22
**Status:** Backend running locally, database needs setup, staging deployment pending

---

## 1. Backend Server Status

### ✅ Local Development
- **Status:** Running
- **Port:** 3000
- **Process ID:** 71470
- **Health:** http://localhost:3000/health → Healthy
- **Base URL:** http://localhost:3000/api/v1

### ⚠️ Staging Deployment
- **Status:** Failed (needs GCP Artifact Registry API enabled)
- **Error:** Artifact Registry API not enabled in project 271324599260
- **Action Required:** Enable API at https://console.developers.google.com/apis/api/artifactregistry.googleapis.com/overview?project=271324599260
- **Target:** Cloud Run (asia-southeast1)
- **CI/CD:** GitHub Actions workflow configured (.github/workflows/deploy-staging.yml)

### ❌ Production Deployment
- **Status:** Not deployed
- **Target:** Firebase project jeco-plus-offic-v2

---

## 2. Database Status

### PostgreSQL Server
- **Status:** Running
- **Host:** localhost:5432
- **Connection:** ✅ Accepting connections

### JECO+ Database
- **Status:** ❌ NOT SETUP
- **Database:** jecoplus (does not exist)
- **User:** jecoplus (does not exist)
- **Password:** jecoplus_dev_2025

### ⚠️ Action Required: Database Setup
```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

This will:
1. Create database `jecoplus`
2. Create user `jecoplus` with password
3. Run all 7 migrations:
   - init.sql (users, auth, KYC sessions)
   - 002_wallet_schema.sql
   - 003_bank_schema.sql
   - 004_credit_score_schema.sql
   - 005_loan_application_schema.sql
   - 006_partner_submissions_schema.sql
   - 007_chat_schema.sql

---

## 3. API Endpoints Inventory

### Authentication (`/api/v1/auth`)
- POST `/login` - User login with phone + OTP
- POST `/refresh` - Refresh access token
- POST `/logout` - Invalidate refresh token
- POST `/verify-otp` - Verify OTP code

### User Management (`/api/v1/users`)
- GET `/me` - Get current user profile
- PUT `/me` - Update user profile
- GET `/me/kyc-status` - Get KYC verification status

### KYC (`/api/v1/kyc`)
- POST `/start` - Start KYC session
- POST `/upload-id-card` - Upload ID card photo
- POST `/upload-selfie` - Upload selfie photo
- POST `/verify-liveness` - Verify liveness detection
- POST `/confirm-ocr` - Confirm OCR extracted data
- GET `/:sessionId/status` - Get KYC session status

### Wallet (`/api/v1/wallet`)
- GET `/balance` - Get wallet balance
- POST `/topup` - Top up wallet
- POST `/withdraw` - Withdraw from wallet
- GET `/transactions` - Get transaction history

### Admin Portal (`/api/v1/admin`)

#### Dashboard
- GET `/dashboard/stats` - Dashboard statistics

#### User Management
- GET `/users` - List users with filters
- GET `/users/:userId` - Get user details
- PUT `/users/:userId/status` - Update user status

#### KYC Queue
- GET `/kyc` - List KYC sessions
- GET `/kyc/:sessionId` - Get KYC session details
- POST `/kyc/:sessionId/approve` - Approve KYC
- POST `/kyc/:sessionId/reject` - Reject KYC

#### **Loan Management** (Sprint 13 - Just Implemented)
- GET `/loans` - List loan applications with filters, pagination, stats
- GET `/loans/:loanId` - Get loan detail with credit score breakdown
- POST `/loans/:loanId/approve` - Approve loan (with optional overrides)
- POST `/loans/:loanId/reject` - Reject loan with reason

#### Activity Logs
- GET `/activity-logs` - Get admin activity logs

### Chat (AI Support) (`/api/v1/chat`)
- POST `/message` - Send message to AI
- GET `/history` - Get chat history
- POST `/clear` - Clear chat history

### Health Check
- GET `/health` - Health status
- GET `/api/v1/health` - Detailed health check

---

## 4. Backend Implementation Status

### ✅ Completed Features

#### Phase 1 (100% Complete)
- Authentication system (JWT-based)
- KYC verification flow
- Wallet management
- Bank account integration
- Credit scoring system
- Loan application system
- Admin authentication

#### Phase 4 - Sprint 13 (100% Complete)
- Loan listing with pagination
- Loan detail view with credit breakdown
- Loan approval workflow
- Loan rejection workflow
- Admin activity logging
- Validation schemas

### 🔧 Backend Dependencies

```json
{
  "runtime": {
    "@anthropic-ai/sdk": "0.71.2",
    "@google/generative-ai": "0.24.1",
    "express": "4.21.2",
    "pg": "8.13.1",
    "bcrypt": "5.1.1",
    "jsonwebtoken": "9.0.2",
    "joi": "17.13.3"
  },
  "cloud": {
    "@aws-sdk/client-s3": "3.705.0",
    "@google-cloud/vision": "5.3.4",
    "firebase-admin": "13.0.2"
  },
  "security": {
    "helmet": "8.0.0",
    "cors": "2.8.5",
    "express-rate-limit": "7.5.0"
  }
}
```

---

## 5. Environment Configuration

### Development (.env)
```bash
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jecoplus
DB_USER=jecoplus
DB_PASSWORD=jecoplus_dev_2025

# JWT - Using HS256 for development
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3001

# Gemini API (for AI chat)
GEMINI_API_KEY=AIzaSyAcFNornt57c0HlF5URwDQji3VdNJb9AjE
```

### ⚠️ Missing for Production
- JWT secrets (need to generate with `npm run generate:keys`)
- Firebase Admin SDK credentials
- AWS S3 credentials (for KYC document storage)
- NDID configuration (for identity verification)

---

## 6. Database Schema

### Tables to be created by migrations:

1. **users** - User accounts
2. **refresh_tokens** - JWT refresh token storage
3. **kyc_sessions** - KYC verification sessions
4. **kyc_documents** - KYC document metadata
5. **wallets** - User wallet balances
6. **wallet_transactions** - Wallet transaction history
7. **bank_accounts** - User bank accounts
8. **credit_scores** - Credit score calculations
9. **loan_applications** - Loan applications (Sprint 13)
10. **partner_submissions** - Partner API submissions
11. **admin_activity_logs** - Admin action audit trail
12. **chat_sessions** - AI chat sessions
13. **chat_messages** - Chat message history

---

## 7. API Testing Status

### Can Test Now (After DB Setup)
- ✅ Health check endpoints
- ✅ Admin login (if admin user exists)
- ⚠️ User login (needs SMS/OTP integration or mock)
- ⚠️ KYC flow (needs Google Vision API or mock)
- ⚠️ Wallet operations (needs payment gateway or mock)

### Integration Dependencies
- **SMS OTP:** Not configured (can use mock for testing)
- **Google Vision API:** Not configured (OCR for ID cards)
- **AWS S3:** Not configured (local file storage works)
- **Firebase:** Not configured (optional for push notifications)
- **NDID:** Not configured (Thai national ID verification)

---

## 8. Frontend-Backend Connection

### Frontend Configuration
**File:** `src/services/adminService.js`
```javascript
const MOCK_MODE = true; // Currently using mock data
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

### Current Status
- Frontend deployed to staging: https://jecoplus-staging.web.app
- Frontend running in MOCK_MODE (no backend calls)
- Backend running locally on port 3000
- Backend NOT deployed to staging yet

### To Connect Frontend to Backend
1. Deploy backend to Cloud Run (enable Artifact Registry first)
2. Update `VITE_API_URL_STAGING` secret in GitHub
3. Set `MOCK_MODE = false` in frontend service layer
4. Redeploy frontend

---

## 9. CI/CD Pipeline

### Staging Workflow (`.github/workflows/deploy-staging.yml`)

**Trigger:** Push to `develop` branch

**Jobs:**
1. **Build & Test**
   - Build frontend with Vite
   - Upload dist/ artifacts
   - Build backend Docker image
   - Push to Artifact Registry

2. **Deploy Backend**
   - Deploy to Cloud Run
   - Region: asia-southeast1
   - Service: jecoplus-api
   - Environment: staging

3. **Deploy Frontend**
   - Deploy to Firebase Hosting
   - Target: staging
   - Site: jecoplus-staging

4. **Notify**
   - Display deployment URLs
   - Report success/failure

### Current Pipeline Status
- ✅ Frontend deployment: Working
- ❌ Backend deployment: Blocked (Artifact Registry API not enabled)
- ✅ Workflow triggered on develop branch push

---

## 10. Immediate Action Items

### Priority 1: Local Development Setup
```bash
# 1. Setup database
cd backend
./setup-database.sh

# 2. Verify tables created
psql -U jecoplus -d jecoplus -c "\dt"

# 3. Create admin user (manual SQL or seed script)
# 4. Test API endpoints with Postman/curl
```

### Priority 2: Enable Staging Deployment
1. Visit: https://console.developers.google.com/apis/api/artifactregistry.googleapis.com/overview?project=271324599260
2. Click "Enable API"
3. Wait 2-3 minutes
4. Re-run failed workflow: `gh run rerun 21242556413`

### Priority 3: Configure Production Secrets
- Generate JWT keys: `npm run generate:keys`
- Configure Firebase Admin SDK
- Setup AWS S3 bucket for KYC documents
- Add secrets to GitHub Actions

---

## 11. Sprint 13 Implementation Summary

### Backend Changes
**Files Modified:**
- `backend/src/routes/admin.js` (+42 lines) - 4 loan endpoints
- `backend/src/controllers/adminController.js` (+322 lines) - 4 controllers
- `backend/src/middleware/validator.js` (+20 lines) - 3 schemas

**Features:**
- Loan queue with pagination, filtering, sorting
- Real-time stats (pending, approved today, rejected today)
- Loan detail with complete credit score breakdown
- Approval workflow with optional amount/term overrides
- Rejection workflow with reason codes
- Activity logging for audit trail

### Frontend Changes
**Files Created:**
- `src/views/admin/AdminLoansView.vue` - Loan queue list
- `src/views/admin/AdminLoanReviewView.vue` - Loan review page

**Features:**
- Stats dashboard (pending/approved/rejected)
- Search with 300ms debounce
- Status filter dropdown
- Credit score 6-factor breakdown visualization
- Approval/rejection modals
- Currency and phone formatting
- Score color-coding

### Current Mode
- Frontend: MOCK_MODE enabled
- Sample data: 4 mock loan applications
- Can test full UI without backend

---

## 12. Testing Recommendations

### Local API Testing
```bash
# Health check
curl http://localhost:3000/health

# Admin login (after DB setup)
curl -X POST http://localhost:3000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jecoplus.com","password":"admin123"}'

# List loans (requires auth token)
curl http://localhost:3000/api/v1/admin/loans?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Integration Testing
- Use Postman collection (if exists)
- Run backend tests: `cd backend && npm test`
- Test loan approval/rejection workflow
- Verify activity logging

---

## 13. Next Steps (Phase 4 Continuation)

### Sprint 14: KYC Review Enhancements (15%)
- Document viewer component
- Bulk KYC operations
- Fraud detection alerts
- Review history timeline

### Sprint 15: User Management Enhancements (10%)
- Advanced filters
- User activity timeline
- Credit score history
- Password reset

### Sprint 16: Analytics & Reporting (10%)
- Chart.js integration
- Dashboard charts
- Performance metrics
- CSV export

---

## 14. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│  Vue 3 + Vite → Firebase Hosting (Staging)          │
│  https://jecoplus-staging.web.app                   │
└────────────────┬────────────────────────────────────┘
                 │ VITE_API_URL
                 ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND API                        │
│  Express.js → Cloud Run (Not deployed yet)          │
│  Local: http://localhost:3000/api/v1                │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────────┐
    ▼                         ▼                  ▼
┌──────────┐          ┌──────────────┐    ┌──────────┐
│PostgreSQL│          │ Google APIs  │    │ Firebase │
│ (Local)  │          │ - Vision     │    │ - Admin  │
│          │          │ - Gemini     │    │ - Auth   │
└──────────┘          └──────────────┘    └──────────┘
```

---

## Summary

**Working:**
- ✅ Backend running locally on port 3000
- ✅ Frontend deployed to staging (MOCK_MODE)
- ✅ Sprint 13 loan management implemented
- ✅ CI/CD pipeline configured

**Needs Setup:**
- ❌ Database (run setup-database.sh)
- ❌ Artifact Registry API (for staging deployment)
- ❌ Production secrets (JWT, Firebase, AWS)
- ❌ Integration APIs (SMS, Vision, NDID)

**Immediate Next:**
1. Run database setup script
2. Enable Artifact Registry API
3. Test backend endpoints locally
4. Deploy backend to staging
5. Connect frontend to backend (disable MOCK_MODE)
