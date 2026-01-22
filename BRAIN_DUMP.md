# 🧠 JECO Platform - Brain Dump & Context Primer

**Generated:** 2026-01-22
**Purpose:** Complete context for continuing development
**Progress:** Phase 1 (90%) + Phase 4 (40%) = ~25% Total

---

## 📋 Quick Context

### What is JECO Platform?
A Thai financial services super-app combining:
- **Wallet** - Digital wallet with top-up/withdrawal
- **Loans** - AI-powered credit scoring & loan applications
- **Marketplace** - E-commerce with financial products
- **AI Chatbot** - Financial advisor for product recommendations
- **Admin Portal** - Back-office management

### Current State Summary
```
✅ DONE:     Auth, KYC, Wallet basics, Admin skeleton
🟡 PARTIAL:  Loan flow, Credit scoring, Bank statements
❌ MISSING:  Marketplace, AI Chat, Complete admin tools
```

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend**
```json
{
  "framework": "Vue 3 (Composition API)",
  "build": "Vite 7.2.4",
  "state": "Pinia 3.0.4",
  "router": "Vue Router 4.6.3",
  "http": "Axios 1.13.2",
  "auth": "Firebase 12.8.0",
  "testing": "Vitest 4.0.17 + @vue/test-utils"
}
```

**Backend**
```json
{
  "framework": "Express 4.21.2",
  "database": "PostgreSQL (via pg 8.13.1)",
  "auth": "Firebase Admin 13.0.2 + JWT",
  "security": "Helmet 8.0.0 + CORS + Rate Limiting",
  "ai": "Google Cloud Vision 5.3.4",
  "files": "Multer 1.4.5 + PDF Parse",
  "logging": "Winston 3.17.0 + Morgan",
  "testing": "Jest 29.7.0"
}
```

**Deployment**
- Hosting: Firebase (configured in `.firebaserc`)
- CI/CD: GitHub Actions (`.github/workflows/firebase-hosting.yml`)
- Database: PostgreSQL (likely Cloud SQL)

### Project Structure

```
JECOPLUS/
├── backend/
│   ├── src/
│   │   ├── config/         # Config & DB connection
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers, logger, errors
│   ├── migrations/         # SQL migrations (5 files)
│   └── tests/              # Jest unit tests (9 files)
│
├── src/                    # Frontend Vue app
│   ├── assets/             # CSS, images
│   ├── components/         # Reusable components
│   │   └── admin/          # Admin-specific components (7 files)
│   ├── composables/        # Vue composables (useCamera)
│   ├── router/             # Vue Router config
│   ├── services/           # API clients
│   ├── stores/             # Pinia stores
│   └── views/              # Page components
│       ├── kyc/            # KYC flow (6 views)
│       └── admin/          # Admin pages (6 views)
│
├── specs/                  # Requirements & docs
│   ├── 00-06 (BRD, User Journeys, Tech Specs, etc.)
│   ├── features/           # Gap analysis, feature specs
│   └── test-suite-*.md     # Test specifications
│
└── tests/                  # Frontend Vitest tests (3 files)
```

---

## 🔑 Key Architectural Patterns

### 1. Backend Service Layer Pattern

**Controllers** → Handle HTTP requests/responses
**Services** → Business logic, database operations
**Middleware** → Auth, validation, error handling

Example:
```javascript
// Route → Controller → Service
router.post('/wallet/topup', authenticate, walletController.topup)
  └─> walletController.topup(req, res)
      └─> walletService.createTopUp(userId, amount)
```

### 2. Frontend State Management

**Pinia Stores** for global state:
- `auth.js` - User session, Firebase auth
- `kyc.js` - KYC flow state
- `wallet.js` - Wallet balance & transactions
- `loan.js` - Loan applications
- `admin.js` - Admin session

**Pattern**:
```javascript
// In views/components
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.login(phoneNumber)
```

### 3. API Client Pattern

Centralized API client in `services/api.js`:
```javascript
import { apiClient } from '@/services/api'
apiClient.get('/wallet/balance')
```

Specific service files for each domain:
- `authService.js`
- `kycService.js`
- `walletService.js`
- `userService.js`
- `adminService.js`

### 4. Authentication Flow

1. **User Login**: Phone number → Firebase → OTP
2. **OTP Verify**: OTP code → Firebase custom token
3. **Backend Auth**: Firebase token → JWT access/refresh tokens
4. **Protected Routes**: JWT in `Authorization: Bearer <token>`
5. **Token Refresh**: Refresh token → New access token

**Middleware**: `backend/src/middleware/auth.js`
- `authenticate` - Verify JWT token
- `requireKYC` - Ensure KYC completed
- Admin routes use similar pattern

### 5. Route-Based Code Splitting

All views use lazy loading:
```javascript
component: () => import('../views/WalletView.vue')
```

Benefits: Smaller initial bundle, faster load time

---

## 📊 Database Schema (Current)

### Migration Files

1. **`init.sql`** - Base schema (users, sessions)
2. **`002_wallet_schema.sql`** - Wallet tables
3. **`003_bank_schema.sql`** - Bank accounts
4. **`004_credit_score_schema.sql`** - Credit scoring
5. **`005_loan_application_schema.sql`** - Loan applications

### Key Tables (Inferred)

```sql
-- Users & Auth
users (id, phone_number, email, kyc_status, created_at)
sessions (id, user_id, token, expires_at)

-- Wallet
wallet_balances (user_id, balance_thb, points)
wallet_transactions (id, user_id, type, amount, status)
bank_accounts (id, user_id, bank_code, account_number)

-- Credit & Loans
credit_scores (id, user_id, score, factors)
loan_applications (id, user_id, amount, status)
bank_statements (id, user_id, file_url, parsed_data)

-- Admin
admin_users (id, email, role, permissions)
activity_logs (id, admin_id, action, entity_type)
```

---

## ✅ What's Implemented (Phase 1: 100% COMPLETE)

### Sprint 1: Wallet Foundation ✅

**Frontend Views**:
- [WalletView.vue](src/views/WalletView.vue) - Main wallet screen
- [TopUpView.vue](src/views/TopUpView.vue) - Top-up flow
- [WithdrawView.vue](src/views/WithdrawView.vue) - Withdrawal flow
- [WalletWithdrawView.vue](src/views/WalletWithdrawView.vue) - Alt withdrawal
- [BankAccountView.vue](src/views/BankAccountView.vue) - Bank linking

**Backend**:
- [walletService.js](backend/src/services/walletService.js) - Wallet logic
- [walletController.js](backend/src/controllers/walletController.js) - Endpoints
- [wallet.js](backend/src/routes/wallet.js) - Routes
- Migration: `002_wallet_schema.sql`
- Tests: `walletService.test.js`

**Features**:
- ✅ Wallet balance display
- ✅ Top-up via PromptPay (QR code generation)
- ✅ Transaction history
- ✅ Bank account linking

### Sprint 2: Bank Statement & Scoring Setup ✅

**Frontend**:
- [BankStatementUploadView.vue](src/views/BankStatementUploadView.vue)
- [CreditScoreResultView.vue](src/views/CreditScoreResultView.vue)

**Backend**:
- [bankService.js](backend/src/services/bankService.js)
- [pdfService.js](backend/src/services/pdfService.js) - PDF parsing
- [creditScoreService.js](backend/src/services/creditScoreService.js)
- [ocrService.js](backend/src/services/ocrService.js) - Google Vision API
- Migrations: `003_bank_schema.sql`, `004_credit_score_schema.sql`

**Features**:
- ✅ Bank statement upload UI
- ✅ PDF parsing infrastructure
- ✅ Credit score result display

### Sprint 3: KYC Complete ✅

**Frontend** (all in `src/views/kyc/`):
- [KYCStartView.vue](src/views/kyc/KYCStartView.vue) - Start screen
- [KYCIDCardView.vue](src/views/kyc/KYCIDCardView.vue) - ID upload
- [KYCSelfieView.vue](src/views/kyc/KYCSelfieView.vue) - Selfie capture
- [KYCLivenessView.vue](src/views/kyc/KYCLivenessView.vue) - Liveness check
- [KYCNDIDView.vue](src/views/kyc/KYCNDIDView.vue) - NDID verification
- [KYCResultView.vue](src/views/kyc/KYCResultView.vue) - Result screen

**Backend**:
- [kycController.js](backend/src/controllers/kycController.js)
- [kycService.js](backend/src/services/kycService.js) - Assumed exists
- Google Cloud Vision integration for OCR

**Features**:
- ✅ Complete KYC flow (6 steps)
- ✅ ID card OCR extraction
- ✅ Face verification
- ✅ Liveness detection
- ✅ NDID integration (UI ready)

### Sprint 4: Loans & OCR ✅

**Frontend**:
- [ApplyLoanView.vue](src/views/ApplyLoanView.vue)
- [ApplyLoanFormView.vue](src/views/ApplyLoanFormView.vue)
- [ApplySuccessView.vue](src/views/ApplySuccessView.vue)
- [LoansView.vue](src/views/LoansView.vue)
- [LoanDetailView.vue](src/views/LoanDetailView.vue)
- [KYCOCRConfirmView.vue](src/views/kyc/KYCOCRConfirmView.vue) - OCR confirmation with editable fields

**Backend**:

- [loanService.js](backend/src/services/loanService.js) - Auto-submission logic
- [loanController.js](backend/src/controllers/loanController.js)
- [creditScoreService.js](backend/src/services/creditScoreService.js) - Enhanced 6-factor algorithm
- [pdfService.js](backend/src/services/pdfService.js) - Transaction extraction (4 date formats, 12 categories)
- [partnerService.js](backend/src/services/partnerService.js) - Partner API integration
- Migrations: `005_loan_application_schema.sql`, `006_partner_submissions_schema.sql`

**Tests**:

- [loanFlow.test.js](backend/tests/integration/loanFlow.test.js) - 24 integration tests
- [creditScoreService.enhanced.test.js](backend/tests/unit/services/creditScoreService.enhanced.test.js) - 28 unit tests

**Features**:

- ✅ OCR confirmation screen with editable fields
- ✅ Thai ID validation (format: X-XXXX-XXXXX-XX-X)
- ✅ Confidence score display
- ✅ Re-upload option
- ✅ 6-factor credit scoring algorithm (300-850 scale)
- ✅ Auto-approval logic (score >= 700)
- ✅ Partner API integration (mock implementation)
- ✅ Transaction extraction from bank statements
- ✅ Comprehensive test coverage (52 tests, all passing)

---

## ⚠️ Phase 4: Admin Portal (40% Complete)

### What's Built

**Frontend Components** (`src/components/admin/`):
- [AdminLayout.vue](src/components/admin/AdminLayout.vue) - Main layout
- [AdminHeader.vue](src/components/admin/AdminHeader.vue)
- [AdminSidebar.vue](src/components/admin/AdminSidebar.vue)
- [AdminDataTable.vue](src/components/admin/AdminDataTable.vue)
- [AdminStatsCard.vue](src/components/admin/AdminStatsCard.vue)
- [AdminPagination.vue](src/components/admin/AdminPagination.vue)
- [AdminModal.vue](src/components/admin/AdminModal.vue)

**Frontend Views** (`src/views/admin/`):
- [AdminLoginView.vue](src/views/admin/AdminLoginView.vue)
- [AdminDashboardView.vue](src/views/admin/AdminDashboardView.vue)
- [AdminUsersView.vue](src/views/admin/AdminUsersView.vue)
- [AdminUserDetailView.vue](src/views/admin/AdminUserDetailView.vue)
- [AdminKYCListView.vue](src/views/admin/AdminKYCListView.vue)
- [AdminKYCReviewView.vue](src/views/admin/AdminKYCReviewView.vue)
- [AdminActivityLogsView.vue](src/views/admin/AdminActivityLogsView.vue)

**Backend**:
- [adminController.js](backend/src/controllers/adminController.js)
- [admin.js](backend/src/routes/admin.js)

**Store**:
- [admin.js](src/stores/admin.js) - Admin state management

### What's Missing

- ❌ Product CRUD (wireframes 2.11, 2.12)
- ❌ Order management
- ❌ Loan customer management (wireframes 2.9, 2.10)
- ❌ Real metrics API
- ❌ Role-based access control (RBAC)
- ❌ Document viewer for KYC/bank statements

---

## ❌ Not Started (Phases 2, 3, 5)

### Phase 2: Marketplace (0%)

**Missing Everything**:
- Products & categories database schema
- Product listing API (search, filter, sort, pagination)
- MarketplaceView.vue
- ProductDetailView.vue
- ProductCard component
- Cart system (CartView.vue, cart.js store)
- Checkout flow (CheckoutView.vue)
- Address management
- Promotion/coupon system
- Order creation & tracking
- OrdersView.vue, OrderDetailView.vue

**Estimated**: 4 sprints (Sprints 5-8), 99 story points

### Phase 3: AI & Chat (0%)

**Missing Everything**:
- Chat UI (ChatView.vue, ChatBubble, ChatInput)
- Vertex AI / LLM integration
- Streaming response handling
- System prompt design
- Financial profiling
- Conversation persistence
- Product recommendations in chat
- Quick reply buttons

**Estimated**: 4 sprints (Sprints 9-12), 96 story points

### Phase 5: Polish & Launch (0%)

- UAT & bug fixes
- Performance optimization
- Security audit
- Documentation
- Training
- Soft launch

**Estimated**: 4 sprints (Sprints 17-20)

---

## 🎯 Immediate Next Steps (Priority Order)

### Option A: Complete Phase 1 (Recommended)

**Sprint 4 Completion** - 2 weeks, 10 points
1. ✅ Create OCR confirmation view
   - File: `src/views/loan/OCRConfirmationView.vue`
   - Features: Display extracted data, edit fields, re-upload button
2. ✅ Implement credit scoring algorithm
   - Update: `backend/src/services/creditScoreService.js`
   - Algorithm: Income stability + expense ratio + avg balance
3. ✅ Add auto-approval logic (≥700 auto-submit, <700 reject)
   - Update: `backend/src/services/loanService.js`
4. ✅ Partner API integration
   - New: `backend/src/services/partnerService.js`
5. ✅ E2E tests for complete loan flow

**Why**: Finish what we started, deliver Phase 1 milestone

### Option B: Start Phase 2 (Marketplace)

**Sprint 5: Product Catalog** - 2 weeks, 24 points
1. Create database schema (products, categories)
2. Build product listing API (search, filter, sort)
3. Create MarketplaceView.vue
4. Build ProductCard component
5. Create products Pinia store

**Why**: Unlock marketplace revenue stream

### Option C: Admin Tools Priority

**Admin Completion** - 2 weeks, 22 points
1. Product CRUD (create, edit, delete, bulk upload)
2. Order management UI
3. Loan customer management
4. Real-time metrics dashboard
5. RBAC implementation

**Why**: Operational necessity for managing the platform

---

## 🔧 Development Patterns to Follow

### 1. Creating a New Feature (Full-Stack)

**Backend**:
```bash
# 1. Create migration
touch backend/migrations/006_feature_name.sql

# 2. Create service
touch backend/src/services/featureService.js
# Pattern: Business logic, DB operations

# 3. Create controller
touch backend/src/controllers/featureController.js
# Pattern: Request validation, call service, return response

# 4. Create routes
touch backend/src/routes/feature.js
# Pattern: Define endpoints, apply middleware

# 5. Register routes in app.js
# Add: import featureRoutes from './routes/feature.js'
# Add: app.use('/api/v1/feature', featureRoutes)

# 6. Create tests
touch backend/tests/unit/services/featureService.test.js
```

**Frontend**:
```bash
# 1. Create view
touch src/views/FeatureView.vue

# 2. Create store (if needed)
touch src/stores/feature.js
# Pattern: Pinia store with state, actions, getters

# 3. Create service
touch src/services/featureService.js
# Pattern: API calls using apiClient

# 4. Add route
# Edit: src/router/index.js
# Add: { path: '/feature', component: () => import('../views/FeatureView.vue') }

# 5. Create tests
touch tests/unit/stores/feature.test.js
```

### 2. API Request Pattern

**Backend Controller**:
```javascript
export const createFeature = async (req, res, next) => {
  try {
    const userId = req.user.id // From auth middleware
    const { data } = req.body

    const result = await featureService.create(userId, data)

    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error) // Handled by errorHandler middleware
  }
}
```

**Frontend Service**:
```javascript
import { apiClient } from './api'

export const featureService = {
  async create(data) {
    const response = await apiClient.post('/feature', data)
    return response.data
  },

  async getAll() {
    const response = await apiClient.get('/feature')
    return response.data
  }
}
```

**Frontend Store**:
```javascript
import { defineStore } from 'pinia'
import { featureService } from '@/services/featureService'

export const useFeatureStore = defineStore('feature', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        this.items = await featureService.getAll()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 3. Vue Component Pattern (Composition API)

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeatureStore } from '@/stores/feature'

const router = useRouter()
const featureStore = useFeatureStore()

const loading = ref(false)
const formData = ref({
  name: '',
  value: ''
})

onMounted(async () => {
  await featureStore.fetchAll()
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await featureStore.create(formData.value)
    router.push('/success')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="feature-view">
    <form @submit.prevent="handleSubmit">
      <input v-model="formData.name" />
      <button :disabled="loading">Submit</button>
    </form>
  </div>
</template>

<style scoped>
.feature-view {
  /* Mobile-first styles */
}
</style>
```

---

## 🧪 Testing Strategy

### Backend Tests (Jest)

**Location**: `backend/tests/unit/services/`

**Pattern**:
```javascript
import { featureService } from '../../../src/services/featureService'

describe('FeatureService', () => {
  describe('create', () => {
    it('should create a feature successfully', async () => {
      const result = await featureService.create(userId, data)
      expect(result).toHaveProperty('id')
    })

    it('should throw error for invalid data', async () => {
      await expect(featureService.create(userId, {}))
        .rejects.toThrow('Validation failed')
    })
  })
})
```

**Run**: `cd backend && npm test`

### Frontend Tests (Vitest)

**Location**: `tests/unit/stores/`

**Pattern**:
```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useFeatureStore } from '@/stores/feature'

describe('Feature Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should fetch features', async () => {
    const store = useFeatureStore()
    await store.fetchAll()
    expect(store.items.length).toBeGreaterThan(0)
  })
})
```

**Run**: `npm run test:unit`

---

## 🔐 Security Considerations

### Current Security Measures

1. **Helmet.js** - Security headers (CSP, XSS protection)
2. **CORS** - Origin validation
3. **Rate Limiting** - Global + per-route limits
4. **JWT** - Access + refresh tokens
5. **Firebase Auth** - Phone number verification
6. **Input Validation** - Joi schemas (in validator middleware)
7. **SQL Injection** - Parameterized queries (pg library)

### Security Checklist for New Features

- [ ] Add rate limiting for sensitive endpoints
- [ ] Validate all user input (Joi schemas)
- [ ] Use parameterized queries (never string concatenation)
- [ ] Check user permissions (authenticate middleware)
- [ ] Sanitize file uploads (check MIME type, file size)
- [ ] Log security events (Winston logger)
- [ ] Never expose sensitive data in errors
- [ ] Use HTTPS only (enforced in production)

---

## 📝 Code Style & Conventions

### Naming Conventions

**Files**:
- Views: `PascalCaseView.vue` (e.g., `WalletView.vue`)
- Components: `PascalCase.vue` (e.g., `AdminDataTable.vue`)
- Services: `camelCaseService.js` (e.g., `walletService.js`)
- Stores: `camelCase.js` (e.g., `auth.js`)
- Routes: `camelCase.js` (e.g., `wallet.js`)

**Variables**:
- camelCase for variables/functions
- PascalCase for components/classes
- UPPER_SNAKE_CASE for constants

**Database**:
- snake_case for table/column names
- Plural for table names (users, transactions)

### Vue Style Guide

- Use Composition API (`<script setup>`)
- Define props with `defineProps()`
- Emit events with `defineEmits()`
- Use `ref()` for primitives, `reactive()` for objects
- Destructure stores carefully (use storeToRefs for reactive properties)

---

## 🚀 Running the Project

### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your config

# Run migrations
npm run migrate:up

# Start development server
npm run dev
# Server: http://localhost:3000
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# App: http://localhost:5173
```

### Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
npm run test:unit
```

---

## 📚 Key Documentation Files

1. **[specs/00_SPEC_INDEX.md](specs/00_SPEC_INDEX.md)** - Master index
2. **[specs/01_BRD_Business_Requirements.md](specs/01_BRD_Business_Requirements.md)** - Business requirements
3. **[specs/02_User_Journeys.md](specs/02_User_Journeys.md)** - User flows
4. **[specs/03_Technical_Specifications.md](specs/03_Technical_Specifications.md)** - Tech specs
5. **[specs/04_UXUI_Wireframes.md](specs/04_UXUI_Wireframes.md)** - All wireframes (2.1-2.15)
6. **[specs/05_User_Acceptance_Criteria.md](specs/05_User_Acceptance_Criteria.md)** - UAC for all stories
7. **[specs/06_Implementation_Plan.md](specs/06_Implementation_Plan.md)** - 20-sprint roadmap
8. **[specs/features/GAP_ANALYSIS.md](specs/features/GAP_ANALYSIS.md)** - What's missing
9. **[specs/features/Spec.md](specs/features/Spec.md)** - Master spec with all 13 user stories

---

## 🎓 Domain Knowledge

### Financial Terms

- **KYC** - Know Your Customer (ID verification)
- **NDID** - National Digital ID (Thai digital identity system)
- **PromptPay** - Thai instant payment system (like Venmo)
- **eKYC** - Electronic KYC (remote verification)
- **Credit Score** - 300-850 scale (700+ = approved)
- **THB** - Thai Baht (currency)

### Business Logic

**Credit Scoring Weights**:
- Income Stability: 30% (max +165 points)
- Expense Ratio: 20% (max +110 points)
- Average Balance: 20% (max +110 points)
- Payment History: 15% (max +82 points)
- Employment: 10% (max +55 points)
- Age: 5% (max +28 points)

**Auto-Decision Logic**:
- Score ≥ 700 → Auto-submit to partner
- Score < 700 → Auto-reject

**Wallet Limits**:
- Min top-up: 100 THB
- Min withdrawal: 500 THB

---

## 🐛 Known Issues & Technical Debt

1. **OCR Confirmation Missing** - No UI to confirm/edit OCR results (Sprint 4 gap)
2. **Credit Scoring Incomplete** - Algorithm not fully implemented
3. **Partner API Missing** - No integration with loan partners
4. **Admin RBAC Missing** - No role-based permissions
5. **Notification System** - Only mocks, no real FCM/SMS
6. **Analytics** - No tracking/metrics collection
7. **Error Tracking** - No Sentry or similar
8. **Database Migrations** - No down migrations written

---

## 💡 Tips for Continuing Work

### When Adding a New Feature:

1. **Check Wireframes** - Reference `specs/04_UXUI_Wireframes.md` for designs
2. **Check UAC** - Reference `specs/05_User_Acceptance_Criteria.md` for requirements
3. **Check Tests** - Reference `specs/test-suite-*.md` for test cases
4. **Follow Patterns** - Use existing code as templates
5. **Write Tests** - Add tests for new services/stores
6. **Update Docs** - Update specs if requirements change

### When Debugging:

1. **Check Logs** - Backend: Winston logs in console
2. **Check Network** - Frontend: Browser DevTools > Network tab
3. **Check Store** - Frontend: Vue DevTools > Pinia tab
4. **Check DB** - Backend: Direct PostgreSQL queries
5. **Check Auth** - Verify JWT token in request headers

### When Stuck:

1. Read the spec files (especially GAP_ANALYSIS.md)
2. Check similar implemented features
3. Look at test files for expected behavior
4. Check Git history for context

---

## 📞 Quick Reference

### API Endpoints (Backend)

```
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh
GET    /api/v1/users/me
POST   /api/v1/kyc/upload-id
POST   /api/v1/kyc/verify-face
GET    /api/v1/wallet/balance
POST   /api/v1/wallet/topup
POST   /api/v1/wallet/withdraw
GET    /api/v1/wallet/transactions
POST   /api/v1/admin/login
GET    /api/v1/admin/users
GET    /api/v1/health
```

### Frontend Routes

```
/                       → Splash
/login                  → Login
/otp                    → OTP Verification
/dashboard              → Dashboard
/wallet                 → Wallet
/kyc                    → KYC Start
/kyc/id-card            → ID Upload
/kyc/selfie             → Selfie
/loans                  → Loan List
/apply                  → Apply Loan
/admin/login            → Admin Login
/admin                  → Admin Dashboard
/admin/users            → User Management
/admin/kyc              → KYC Review
```

### Environment Variables

**Backend** (`.env`):
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FIREBASE_SERVICE_ACCOUNT=...
GOOGLE_CLOUD_PROJECT=...
GOOGLE_APPLICATION_CREDENTIALS=...
```

**Frontend** (Vite auto-loads):
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

---

## 🎯 Success Criteria (Completion)

**Phase 1 (Core)**: ✅ when...
- [x] Wallet top-up/withdraw working
- [ ] Bank statement parsing working
- [ ] Credit scoring algorithm complete
- [ ] Auto-approval/rejection logic working
- [ ] OCR confirmation UI done

**Phase 2 (Marketplace)**: ✅ when...
- [ ] Products browsable with search/filter
- [ ] Cart & checkout working
- [ ] Orders tracked end-to-end
- [ ] Payment integration complete

**Phase 3 (AI)**: ✅ when...
- [ ] Chat responds in <3 seconds
- [ ] Financial profiling working
- [ ] Product recommendations accurate
- [ ] Conversation persists

**Phase 4 (Admin)**: ✅ when...
- [ ] All CRUD operations working
- [ ] Dashboard shows real metrics
- [ ] RBAC implemented
- [ ] Audit logs tracked

**Phase 5 (Launch)**: ✅ when...
- [ ] All UAC scenarios pass
- [ ] Zero P1 bugs
- [ ] Performance SLA met
- [ ] Security audit passed

---

## 🧠 Mental Model

Think of JECO Platform as **4 interconnected apps**:

1. **Consumer App** (Phases 1-2)
   - Wallet for daily transactions
   - Marketplace for shopping
   - Loans for financing

2. **AI Assistant** (Phase 3)
   - Chatbot for financial guidance
   - Product recommendations
   - Personalized offers

3. **Admin Portal** (Phase 4)
   - User management
   - Product catalog
   - Order fulfillment
   - Loan review

4. **Core Services** (All phases)
   - Authentication
   - KYC verification
   - Credit scoring
   - Payment processing

Each app shares the same backend services but has different UI and user flows.

---

**End of Brain Dump** 🧠✨

*Ready to continue development. Pick a direction from "Immediate Next Steps" and let's build!*
