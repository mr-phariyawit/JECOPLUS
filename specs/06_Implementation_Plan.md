# JECO Platform - Implementation Plan

**Version:** 1.1
**Created:** January 2026
**Based on:** Gap Analysis & Technical Specs (Google Cloud Stack)
**Estimated Duration:** 20 Sprints (10 Months)

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION ROADMAP                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

   Jan 2026          Mar 2026          May 2026          Jul 2026          Sep 2026
      │                 │                 │                 │                 │
      ▼                 ▼                 ▼                 ▼                 ▼
  ┌───────┐         ┌───────┐         ┌───────┐         ┌───────┐         ┌───────┐
  │Phase 1│────────▶│Phase 2│────────▶│Phase 3│────────▶│Phase 4│────────▶│Phase 5│
  │ Core  │         │ Shop  │         │  AI   │         │ Admin │         │Polish │
  └───────┘         └───────┘         └───────┘         └───────┘         └───────┘
     │                 │                 │                 │                 │
     │                 │                 │                 │                 │
  Sprint 1-4        Sprint 5-8       Sprint 9-12      Sprint 13-16      Sprint 17-20

  ■■■■░░░░░░░░░░░░░░░░  Current: 15% Complete
```

---

## Phase Overview

| Phase | Name | Duration | Sprints | Focus |
|-------|------|----------|---------|-------|
| 1 | Core Completion | 8 weeks | 1-4 | Wallet, Loan Scoring, KYC |
| 2 | Marketplace | 8 weeks | 5-8 | Products, Cart, Checkout, Orders |
| 3 | AI & Chat | 8 weeks | 9-12 | Chatbot, Recommendations |
| 4 | Back-office | 8 weeks | 13-16 | Admin Portal, Management |
| 5 | Polish & Launch | 8 weeks | 17-20 | Testing, Performance, Launch |

---

## Phase 1: Core Completion (Sprint 1-4)

### Objective
Complete the foundation: Wallet, Credit Scoring, and KYC enhancement

### Sprint 1: Wallet Foundation

**Duration:** 2 weeks
**Story Points:** 21

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P1S1-01 | Create WalletView.vue | WL-001 | 3 | Frontend |
| P1S1-02 | Create TopUpView.vue | WL-001 | 3 | Frontend |
| P1S1-03 | Create WithdrawView.vue | WL-001 | 3 | Frontend |
| P1S1-04 | Wallet API endpoints | WL-001 | 5 | Backend |
| P1S1-05 | wallet_transactions table | WL-001 | 2 | Backend |
| P1S1-06 | PromptPay QR generation | WL-001 | 3 | Backend |
| P1S1-07 | Unit tests - Wallet | WL-001 | 2 | QA |

**Deliverables:**
- [ ] Wallet balance display
- [ ] Top-up via PromptPay
- [ ] Transaction history view

```
┌────────────────────────────────────────┐
│ Sprint 1 Wireframe: Wallet Home        │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │     J WALLET                     │  │
│  │     ฿ 12,500.00                 │  │
│  │     🎁 3,450 pts                │  │
│  └──────────────────────────────────┘  │
│  [เติมเงิน]  [ถอนเงิน]  [โอน]          │
│  ─────────────────────────────────     │
│  📜 ประวัติธุรกรรม                     │
│  ┌──────────────────────────────────┐  │
│  │ ➕ เติมเงิน +฿2,000             │  │
│  │ 🛒 ชำระเงิน -฿890               │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

### Sprint 2: Wallet Completion & Bank Statement

**Duration:** 2 weeks
**Story Points:** 23

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P1S2-01 | Withdrawal flow | WL-001 | 3 | Frontend |
| P1S2-02 | Bank account linking | WL-001 | 3 | Frontend |
| P1S2-03 | Withdrawal API | WL-001 | 3 | Backend |
| P1S2-04 | Min/Max validation | WL-001 | 2 | Backend |
| P1S2-05 | Bank statement upload UI | LN-001 | 3 | Frontend |
| P1S2-06 | PDF parsing (Vision API fallback) | LN-003 | 5 | Backend |
| P1S2-07 | Transaction extraction | LN-003 | 3 | Backend |
| P1S2-08 | Integration tests | - | 1 | QA |

**Deliverables:**
- [ ] Complete wallet (top-up, withdraw)
- [ ] Bank statement upload
- [ ] PDF parsing for transactions

---

### Sprint 3: Credit Scoring Engine

**Duration:** 2 weeks
**Story Points:** 26

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P1S3-01 | Income calculation logic | LN-003 | 3 | Backend |
| P1S3-02 | Expense categorization | LN-003 | 5 | Backend |
| P1S3-03 | Average balance calc | LN-003 | 2 | Backend |
| P1S3-04 | Credit scoring algorithm | LN-003 | 8 | Backend |
| P1S3-05 | Score result UI - Approved | LN-001 | 3 | Frontend |
| P1S3-06 | Score result UI - Rejected | LN-001 | 3 | Frontend |
| P1S3-07 | credit_scores table | LN-003 | 2 | Backend |

**Credit Scoring Algorithm:**
```python
def calculate_credit_score(bank_data):
    score = 300  # Base score

    # Income Stability (30% weight, max +165 points)
    income_stability = analyze_income_variance(bank_data)
    score += income_stability * 165

    # Expense Ratio (20% weight, max +110 points)
    expense_ratio = bank_data.total_expense / bank_data.total_income
    if expense_ratio < 0.5:
        score += 110
    elif expense_ratio < 0.7:
        score += 80
    elif expense_ratio < 0.85:
        score += 50

    # Average Balance (20% weight, max +110 points)
    avg_balance_score = min(bank_data.avg_balance / 20000, 1)
    score += avg_balance_score * 110

    # Payment History (15% weight, max +82 points)
    # ... from internal data

    # Employment Factor (10% weight, max +55 points)
    # ... from self-declared data

    # Age Factor (5% weight, max +28 points)
    # ... from KYC data

    return min(850, max(300, score))
```

**Deliverables:**
- [ ] Credit scoring calculation
- [ ] Auto-approval (≥700)
- [ ] Auto-rejection (<700)
- [ ] Result screens

---

### Sprint 4: OCR Enhancement & KYC Polish

**Duration:** 2 weeks
**Story Points:** 21

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P1S4-01 | OCR confirmation view | LN-002 | 5 | Frontend |
| P1S4-02 | Editable OCR fields | LN-002 | 3 | Frontend |
| P1S4-03 | Re-upload option | LN-002 | 2 | Frontend |
| P1S4-04 | Partner submission API | LN-001 | 5 | Backend |
| P1S4-05 | Loan application tracking | LN-001 | 3 | Frontend |
| P1S4-07 | Integrate Google Cloud Vision API | LN-002 | 5 | Backend |
| P1S4-06 | E2E tests - Loan flow | - | 3 | QA |

**Deliverables:**
- [ ] OCR result confirmation screen
- [ ] Editable extracted fields
- [ ] Google Cloud Vision integration
- [ ] Partner API integration
- [ ] Complete loan application flow

---

## Phase 2: Marketplace (Sprint 5-8)

### Objective
Build complete e-commerce: Products, Cart, Checkout, Orders

### Sprint 5: Product Catalog

**Duration:** 2 weeks
**Story Points:** 24

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P2S5-01 | products table schema | MP-001 | 3 | Backend |
| P2S5-02 | categories table | MP-001 | 2 | Backend |
| P2S5-03 | Product listing API | MP-001 | 5 | Backend |
| P2S5-04 | Search with FTS | MP-001 | 3 | Backend |
| P2S5-05 | MarketplaceView.vue | MP-001 | 5 | Frontend |
| P2S5-06 | ProductCard component | MP-001 | 3 | Frontend |
| P2S5-07 | products store (Pinia) | MP-001 | 3 | Frontend |

**Database Schema:**
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    parent_id UUID REFERENCES categories(id),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2),
    type VARCHAR(20) NOT NULL, -- physical, digital, service
    category_id UUID REFERENCES categories(id),
    stock INTEGER DEFAULT 0,
    sku VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    images JSONB,
    tags TEXT[],
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_search ON products
    USING gin(to_tsvector('thai', name || ' ' || COALESCE(description, '')));
```

**Deliverables:**
- [ ] Product database schema
- [ ] Product listing with search
- [ ] Category filtering
- [ ] Product grid UI

---

### Sprint 6: Product Detail & Filter

**Duration:** 2 weeks
**Story Points:** 22

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P2S6-01 | ProductDetailView.vue | MP-001 | 5 | Frontend |
| P2S6-02 | Image carousel | MP-001 | 3 | Frontend |
| P2S6-03 | Variant selection | MP-001 | 3 | Frontend |
| P2S6-04 | FilterPanel component | MP-001 | 3 | Frontend |
| P2S6-05 | Sort functionality | MP-001 | 2 | Frontend |
| P2S6-06 | Pagination/Infinite scroll | MP-001 | 3 | Frontend |
| P2S6-07 | Product detail API | MP-001 | 3 | Backend |

**Deliverables:**
- [ ] Product detail page
- [ ] Filtering (category, price, rating)
- [ ] Sorting (price, popularity, newest)
- [ ] Pagination

---

### Sprint 7: Cart & Promotions

**Duration:** 2 weeks
**Story Points:** 26

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P2S7-01 | carts & cart_items tables | MP-002 | 3 | Backend |
| P2S7-02 | promotions table | MP-002 | 2 | Backend |
| P2S7-03 | Cart API (CRUD) | MP-002 | 5 | Backend |
| P2S7-04 | Promo validation API | MP-002 | 3 | Backend |
| P2S7-05 | cart store (Pinia) | MP-002 | 3 | Frontend |
| P2S7-06 | CartView.vue | MP-002 | 5 | Frontend |
| P2S7-07 | Promo code input | MP-002 | 2 | Frontend |
| P2S7-08 | Cart badge in nav | MP-002 | 1 | Frontend |
| P2S7-09 | Unit tests - Cart | - | 2 | QA |

**Deliverables:**
- [ ] Shopping cart
- [ ] Add/Update/Remove items
- [ ] Promotion code system
- [ ] Cart persistence

---

### Sprint 8: Checkout & Orders

**Duration:** 2 weeks
**Story Points:** 28

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P2S8-01 | orders & order_items tables | MP-002 | 3 | Backend |
| P2S8-02 | addresses table | MP-002 | 2 | Backend |
| P2S8-03 | Order creation API | MP-002 | 5 | Backend |
| P2S8-04 | Payment integration | MP-002 | 5 | Backend |
| P2S8-05 | CheckoutView.vue | MP-002 | 5 | Frontend |
| P2S8-06 | Address management | MP-002 | 3 | Frontend |
| P2S8-07 | OrderConfirmationView.vue | MP-002 | 2 | Frontend |
| P2S8-08 | OrdersView.vue (list) | MP-003 | 2 | Frontend |
| P2S8-09 | E2E tests - Checkout | - | 3 | QA |

**Deliverables:**
- [ ] Checkout flow
- [ ] Address selection
- [ ] Payment processing
- [ ] Order confirmation
- [ ] Order history

---

## Phase 3: AI & Chatbot (Sprint 9-12)

### Objective
Implement AI financial advisor with product recommendations

### Sprint 9: Chat Foundation

**Duration:** 2 weeks
**Story Points:** 24

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P3S9-01 | conversations table | FA-001 | 2 | Backend |
| P3S9-02 | messages table | FA-001 | 2 | Backend |
| P3S9-03 | Chat API endpoints | FA-001 | 5 | Backend |
| P3S9-04 | chat store (Pinia) | FA-001 | 3 | Frontend |
| P3S9-05 | ChatView.vue | FA-001 | 5 | Frontend |
| P3S9-06 | ChatBubble component | FA-001 | 3 | Frontend |
| P3S9-07 | ChatInput component | FA-001 | 2 | Frontend |
| P3S9-08 | Real-time updates | FA-001 | 2 | Backend |

**Chat UI Components:**
```
┌────────────────────────────────────────┐
│ ChatBubble (Bot)                       │
│ ┌────────────────────────────────────┐ │
│ │ 🤖                                 │ │
│ │ Message content here...            │ │
│ │                            14:32   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ChatBubble (User)                      │
│ ┌────────────────────────────────────┐ │
│ │           Message content here... │ │
│ │                            14:33   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ChatInput                              │
│ ┌──────────────────────────────┐ [📎] │
│ │ พิมพ์ข้อความ...              │ [➤] │
│ └──────────────────────────────┘      │
└────────────────────────────────────────┘
```

**Deliverables:**
- [ ] Chat UI with message bubbles
- [ ] Message persistence
- [ ] Real-time messaging

---

### Sprint 10: Vertex AI Integration

**Duration:** 2 weeks
**Story Points:** 26

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P3S10-01 | Vertex AI client setup | FA-001 | 3 | Backend |
| P3S10-02 | System prompt design | FA-001 | 5 | Backend |
| P3S10-03 | Streaming response | FA-001 | 5 | Backend |
| P3S10-04 | Response time optimization | FA-001 | 3 | Backend |
| P3S10-05 | Typing indicator | FA-001 | 2 | Frontend |
| P3S10-06 | Quick reply buttons | FA-001 | 3 | Frontend |
| P3S10-07 | Error handling | FA-001 | 2 | Backend |
| P3S10-08 | Rate limiting for AI | FA-001 | 3 | Backend |

**System Prompt:**
```
You are JECO Financial Advisor (ที่ปรึกษาการเงิน JECO).

ROLE:
- Help Thai users with financial planning
- Collect financial profile (income, expenses, goals)
- Provide non-advisory guidance
- Recommend relevant JECO products

PERSONALITY:
- Friendly, professional, speaks Thai
- Uses polite particles (ค่ะ/ครับ)
- Encouraging but realistic

RULES:
1. Always respond in Thai
2. Never provide investment advice
3. Focus on budgeting and savings
4. Only recommend products when relevant
5. Keep responses concise (<200 words)

CONVERSATION FLOW:
1. Greeting → Ask about income
2. Collect income → Ask about expenses
3. Collect expenses → Ask about goals
4. Analyze → Provide summary
5. Recommend products if appropriate

AVAILABLE PRODUCTS:
- Savings insurance
- Personal loans
- Credit cards
- Installment plans
```

**Deliverables:**
- [ ] Vertex AI integration
- [ ] Streaming responses
- [ ] < 3 second response time
- [ ] Error handling

---

### Sprint 11: Financial Profiling

**Duration:** 2 weeks
**Story Points:** 22

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P3S11-01 | Financial profile schema | FA-001 | 3 | Backend |
| P3S11-02 | Profile extraction from chat | FA-001 | 5 | Backend |
| P3S11-03 | FinancialSummaryCard | FA-001 | 3 | Frontend |
| P3S11-04 | Profile persistence | FA-001 | 3 | Backend |
| P3S11-05 | Chat history persistence | FA-001 | 3 | Backend |
| P3S11-06 | Session management | FA-001 | 3 | Backend |
| P3S11-07 | Unit tests - Chat | - | 2 | QA |

**Financial Profile Structure:**
```json
{
  "userId": "user_123",
  "income": 45000,
  "expenses": 30000,
  "savingsRate": 33.3,
  "goals": ["emergency_fund", "house"],
  "riskProfile": "moderate",
  "recommendations": ["savings_insurance", "personal_loan"],
  "lastUpdated": "2026-01-22T14:30:00Z"
}
```

**Deliverables:**
- [ ] Financial profile collection
- [ ] Profile summary card
- [ ] Chat history persistence

---

### Sprint 12: Product Recommendations

**Duration:** 2 weeks
**Story Points:** 24

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P3S12-01 | Recommendation engine | FA-002 | 8 | Backend |
| P3S12-02 | Product matching logic | FA-002 | 5 | Backend |
| P3S12-03 | ProductRecommendCard | FA-002 | 3 | Frontend |
| P3S12-04 | Navigate to product | FA-002 | 2 | Frontend |
| P3S12-05 | Apply promo from chat | FA-002 | 3 | Backend |
| P3S12-06 | E2E tests - Chat flow | - | 3 | QA |

**Recommendation Logic:**
```javascript
function getRecommendations(profile, products) {
  const recommendations = [];

  // Savings > 30% → Recommend savings insurance
  if (profile.savingsRate > 30) {
    recommendations.push(
      products.filter(p => p.category === 'savings_insurance')
    );
  }

  // Goal: house → Recommend home loans
  if (profile.goals.includes('house')) {
    recommendations.push(
      products.filter(p => p.category === 'home_loan')
    );
  }

  // Low savings → Recommend budgeting tools
  if (profile.savingsRate < 20) {
    recommendations.push(
      products.filter(p => p.category === 'financial_tools')
    );
  }

  return recommendations
    .flat()
    .filter(p => p.status === 'active')
    .slice(0, 3);
}
```

**Deliverables:**
- [ ] Product recommendations in chat
- [ ] Recommendation cards
- [ ] Click to navigate
- [ ] Promo auto-apply

---

## Phase 4: Back-office (Sprint 13-16)

### Objective
Build admin portal for platform management

### Sprint 13: Admin Authentication & Dashboard

**Duration:** 2 weeks
**Story Points:** 21

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P4S13-01 | admin_users table | BO-001 | 2 | Backend |
| P4S13-02 | Admin auth API | BO-001 | 5 | Backend |
| P4S13-03 | Admin routes setup | BO-001 | 2 | Frontend |
| P4S13-04 | AdminLoginView.vue | BO-001 | 3 | Frontend |
| P4S13-05 | AdminDashboard.vue | BO-001 | 5 | Frontend |
| P4S13-06 | Metrics API | BO-001 | 3 | Backend |
| P4S13-07 | Session timeout | BO-001 | 1 | Backend |

**Dashboard Metrics:**
```
┌────────────────────────────────────────────────────────────────┐
│ 📊 Dashboard                                     วันนี้ ▼      │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  12,456  │  │   ฿2.5M  │  │    156   │  │    89    │       │
│  │  Users   │  │  Revenue │  │  Orders  │  │  Loans   │       │
│  │   +5%    │  │   +12%   │  │   +8%    │  │   +15%   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                │
│  📈 Revenue Trend                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                           ___/         │   │
│  │                                    __---‾‾             │   │
│  │                              _--‾‾                     │   │
│  │                        __--‾                           │   │
│  │                  ___--‾                                │   │
│  │           ___--‾‾                                      │   │
│  │     __--‾‾                                             │   │
│  │ __-‾                                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│    Jan   Feb   Mar   Apr   May   Jun   Jul                    │
└────────────────────────────────────────────────────────────────┘
```

**Deliverables:**
- [ ] Admin login
- [ ] Dashboard with metrics
- [ ] 30-min session timeout

---

### Sprint 14: Product Management

**Duration:** 2 weeks
**Story Points:** 26

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P4S14-01 | Product CRUD API | BO-002 | 5 | Backend |
| P4S14-02 | Image upload to GCS | BO-002 | 3 | Backend |
| P4S14-03 | ProductListAdmin.vue | BO-002 | 5 | Frontend |
| P4S14-04 | ProductFormAdmin.vue | BO-002 | 5 | Frontend |
| P4S14-05 | Bulk upload API | BO-002 | 5 | Backend |
| P4S14-06 | CSV import with mapping | BO-002 | 3 | Frontend |

**Deliverables:**
- [ ] Product CRUD
- [ ] Image management
- [ ] Bulk upload via CSV

---

### Sprint 15: Order Management

**Duration:** 2 weeks
**Story Points:** 24

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P4S15-01 | Order list API (admin) | BO-003 | 3 | Backend |
| P4S15-02 | Order status update API | BO-003 | 3 | Backend |
| P4S15-03 | OrderListAdmin.vue | BO-003 | 5 | Frontend |
| P4S15-04 | OrderDetailAdmin.vue | BO-003 | 5 | Frontend |
| P4S15-05 | Tracking info form | BO-003 | 2 | Frontend |
| P4S15-06 | Order cancellation | BO-003 | 3 | Backend |
| P4S15-07 | CSV export | BO-003 | 3 | Backend |

**Deliverables:**
- [ ] Order list with filters
- [ ] Order detail view
- [ ] Status updates
- [ ] Add tracking info
- [ ] Cancel with reason
- [ ] Export to CSV

---

### Sprint 16: Loan Management

**Duration:** 2 weeks
**Story Points:** 22

| Task ID | Task | Story | Points | Assignee |
|---------|------|-------|--------|----------|
| P4S16-01 | Loan customer list API | BO-004 | 3 | Backend |
| P4S16-02 | LoanListAdmin.vue | BO-004 | 5 | Frontend |
| P4S16-03 | LoanDetailAdmin.vue | BO-004 | 5 | Frontend |
| P4S16-04 | Document viewer | BO-004 | 3 | Frontend |
| P4S16-05 | Credit score display | BO-004 | 2 | Frontend |
| P4S16-06 | Data masking (RBAC) | BO-004 | 3 | Backend |
| P4S16-07 | E2E tests - Admin | - | 3 | QA |

**Deliverables:**
- [ ] Loan customer list
- [ ] Customer detail view
- [ ] KYC document viewer
- [ ] Credit score details
- [ ] Role-based masking

---

## Phase 5: Polish & Launch (Sprint 17-20)

### Objective
Testing, performance optimization, and production launch

### Sprint 17: Testing & Bug Fixes

**Duration:** 2 weeks
**Story Points:** 20

| Task ID | Task | Points |
|---------|------|--------|
| P5S17-01 | UAT test execution | 5 |
| P5S17-02 | Bug fixes (High priority) | 5 |
| P5S17-03 | Bug fixes (Medium priority) | 5 |
| P5S17-04 | Regression testing | 3 |
| P5S17-05 | Mobile responsiveness fixes | 2 |

**Deliverables:**
- [ ] All UAC scenarios pass
- [ ] Zero P1 bugs
- [ ] < 5 P2 bugs

---

### Sprint 18: Performance & Security

**Duration:** 2 weeks
**Story Points:** 22

| Task ID | Task | Points |
|---------|------|--------|
| P5S18-01 | Load testing | 3 |
| P5S18-02 | Performance optimization | 5 |
| P5S18-03 | Security audit | 5 |
| P5S18-04 | Penetration testing | 5 |
| P5S18-05 | Security fixes | 4 |

**Performance Targets:**
| Metric | Target | Validation |
|--------|--------|------------|
| Page Load | < 3s | Lighthouse |
| API P95 | < 500ms | Load test |
| Chat Response | < 3s | E2E test |
| Concurrent Users | 10,000 | Load test |

**Deliverables:**
- [ ] Performance meets SLA
- [ ] Security audit passed
- [ ] No critical vulnerabilities

---

### Sprint 19: Documentation & Training

**Duration:** 2 weeks
**Story Points:** 16

| Task ID | Task | Points |
|---------|------|--------|
| P5S19-01 | API documentation | 3 |
| P5S19-02 | User guide | 3 |
| P5S19-03 | Admin guide | 3 |
| P5S19-04 | Operations runbook | 3 |
| P5S19-05 | Team training | 4 |

**Deliverables:**
- [ ] Complete API docs (Swagger)
- [ ] User documentation
- [ ] Admin training completed

---

### Sprint 20: Soft Launch & Go-Live

**Duration:** 2 weeks
**Story Points:** 18

| Task ID | Task | Points |
|---------|------|--------|
| P5S20-01 | Staging deployment | 3 |
| P5S20-02 | Beta testing (100 users) | 3 |
| P5S20-03 | Production setup | 4 |
| P5S20-04 | Data migration | 3 |
| P5S20-05 | Go-live | 3 |
| P5S20-06 | Post-launch monitoring | 2 |

**Launch Checklist:**
- [ ] All features complete
- [ ] Performance validated
- [ ] Security cleared
- [ ] Documentation ready
- [ ] Team trained
- [ ] Monitoring setup
- [ ] Rollback plan ready

---

## Resource Allocation

### Team Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TEAM STRUCTURE                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │  Tech Lead    │
                              │   (1 FTE)     │
                              └───────┬───────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│    Frontend     │          │    Backend      │          │       QA        │
│    (3 FTE)      │          │    (3 FTE)      │          │    (2 FTE)      │
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ - Vue.js        │          │ - Node.js       │          │ - Manual        │
│ - Components    │          │ - API           │          │ - Automation    │
│ - State mgmt    │          │ - Database      │          │ - Performance   │
└─────────────────┘          │ - AI/ML         │          └─────────────────┘
                             └─────────────────┘

Total: 9 FTE + 1 Tech Lead = 10 FTE
```

### Capacity per Sprint

| Role | FTE | Hours/Sprint | Story Points |
|------|-----|--------------|--------------|
| Tech Lead | 1 | 60 | 6 |
| Frontend | 3 | 240 | 24 |
| Backend | 3 | 240 | 24 |
| QA | 2 | 160 | 10 |
| **Total** | **9** | **700** | **64** |

---

## Risk Management

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Vertex AI latency | Medium | High | Caching, fallback responses |
| Partner API delays | Medium | High | Mock services, parallel work |
| PDF parsing accuracy | Medium | Medium | Multiple parsers, manual review |
| Team capacity | Low | High | Buffer in estimates |
| Security issues | Low | Critical | Early security review |

### Contingency Plans

1. **AI Response Slow**: Pre-built responses for common questions
2. **Partner API Down**: Queue submissions, retry mechanism
3. **Team Member Leave**: Cross-training, documentation
4. **Scope Creep**: Strict change control process

---

## Success Criteria

### Phase Gates

| Phase | Exit Criteria |
|-------|---------------|
| Phase 1 | Wallet & Loan scoring 100% complete |
| Phase 2 | E2E purchase flow working |
| Phase 3 | Chat with recommendations working |
| Phase 4 | Admin can manage all entities |
| Phase 5 | All UAC passed, launched |

### Final Acceptance

- [ ] All 13 user stories complete
- [ ] 95% UAC scenarios pass
- [ ] Performance SLA met
- [ ] Security audit passed
- [ ] Zero P1 bugs in production
- [ ] Documentation complete

---

## Appendix: Sprint Calendar

```
2026
┌─────┬─────────────────────────────────────────────────────────────────┐
│     │ Jan     Feb     Mar     Apr     May     Jun     Jul     Aug    │
├─────┼─────────────────────────────────────────────────────────────────┤
│ Wk1 │ S1────────────────                                              │
│ Wk2 │         S2────────────────                                      │
│ Wk3 │                 S3────────────────                              │
│ Wk4 │                         S4────────────────                      │
│ Wk5 │                                 S5────────────────              │
│ Wk6 │                                         S6────────────────      │
│ Wk7 │                                                 S7──────────    │
│ Wk8 │                                                         S8────  │
│     │                                                                 │
│     │ Phase 1: Core      │ Phase 2: Shop        │ Phase 3: AI       │
└─────┴─────────────────────────────────────────────────────────────────┘

┌─────┬─────────────────────────────────────────────────────────────────┐
│     │ Aug     Sep     Oct     Nov                                     │
├─────┼─────────────────────────────────────────────────────────────────┤
│ Wk1 │ S9────────────────                                              │
│ Wk2 │         S10───────────────                                      │
│ Wk3 │                 S11───────────────                              │
│ Wk4 │                         S12───────────────                      │
│ Wk5 │                                 S13───────────────              │
│ Wk6 │                                         S14───────────────      │
│ Wk7 │                                                 S15──────────   │
│ Wk8 │                                                         S16──── │
│     │                                                                 │
│     │ Phase 3 (cont)     │ Phase 4: Admin       │                    │
└─────┴─────────────────────────────────────────────────────────────────┘

┌─────┬─────────────────────────────────────────────────────────────────┐
│     │ Nov     Dec     Jan 2027                                        │
├─────┼─────────────────────────────────────────────────────────────────┤
│ Wk1 │ S17───────────────                                              │
│ Wk2 │         S18───────────────                                      │
│ Wk3 │                 S19───────────────                              │
│ Wk4 │                         S20─────────── 🚀 LAUNCH                │
│     │                                                                 │
│     │ Phase 5: Polish & Launch                                        │
└─────┴─────────────────────────────────────────────────────────────────┘
```

---

*Implementation Plan v1.0 - January 2026*
