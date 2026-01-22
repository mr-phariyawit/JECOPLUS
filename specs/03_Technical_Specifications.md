# JECO Platform - Technical Specifications

**Version:** 1.0
**Last Updated:** January 2026
**Author:** JECO Engineering Team

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Database Design](#3-database-design)
4. [API Specifications](#4-api-specifications)
5. [Security Specifications](#5-security-specifications)
6. [Integration Specifications](#6-integration-specifications)
7. [Performance Requirements](#7-performance-requirements)
8. [DevOps & Infrastructure](#8-devops--infrastructure)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              JECO PLATFORM ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │   Users     │
                                    │ (Mobile/Web)│
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │  CloudFlare │
                                    │    CDN      │
                                    └──────┬──────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
                  │   Frontend  │   │  Admin UI   │   │  API Docs   │
                  │   (Vue.js)  │   │  (Vue.js)   │   │  (Swagger)  │
                  └──────┬──────┘   └──────┬──────┘   └─────────────┘
                         │                 │
                         └────────┬────────┘
                                  │
                           ┌──────▼──────┐
                           │   Nginx     │
                           │Load Balancer│
                           └──────┬──────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
       ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
       │  API Server │     │  API Server │     │  API Server │
       │  (Node.js)  │     │  (Node.js)  │     │  (Node.js)  │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
┌──────▼──────┐           ┌──────▼──────┐           ┌──────▼──────┐
│  PostgreSQL │           │    Redis    │           │     GCS     │
│  (Primary)  │           │   (Cache)   │           │  (Storage)  │
└──────┬──────┘           └─────────────┘           └─────────────┘
       │
┌──────▼──────┐
│  PostgreSQL │
│  (Replica)  │
└─────────────┘

                    External Services
       ┌─────────────────────────────────────────┐
       │                                         │
┌──────▼──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Firebase   │  │  Vision  │  │  Vertex  │  │ Partner  │
│    Auth     │  │   API    │  │    AI    │  │   APIs   │
└─────────────┘  └──────────┘  └──────────┘  └──────────┘
```

### 1.2 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND (Vue.js)                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │     Views     │  │  Components   │  │    Stores     │  │   Services    │   │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤  ├───────────────┤   │
│  │ - ChatView    │  │ - JButton     │  │ - auth.js     │  │ - api.js      │   │
│  │ - ShopView    │  │ - JInput      │  │ - loans.js    │  │ - authService │   │
│  │ - WalletView  │  │ - JCard       │  │ - kyc.js      │  │ - kycService  │   │
│  │ - LoanView    │  │ - JNavBar     │  │ - payment.js  │  │ - loanService │   │
│  │ - ProfileView │  │ - ProductCard │  │ - cart.js     │  │ - chatService │   │
│  │ - KYCViews    │  │ - ChatBubble  │  │ - chat.js     │  │ - productSvc  │   │
│  │ - CartView    │  │ - FilterPanel │  │ - products.js │  │ - walletSvc   │   │
│  │ - CheckoutView│  │ - SearchBar   │  │ - orders.js   │  │ - orderSvc    │   │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND (Node.js/Express)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │    Routes     │  │  Controllers  │  │   Services    │  │    Models     │   │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤  ├───────────────┤   │
│  │ /auth         │  │ authCtrl      │  │ authService   │  │ User          │   │
│  │ /users        │  │ userCtrl      │  │ userService   │  │ Session       │   │
│  │ /kyc          │  │ kycCtrl       │  │ kycService    │  │ KYCSession    │   │
│  │ /loans        │  │ loanCtrl      │  │ loanService   │  │ LoanApp       │   │
│  │ /products     │  │ productCtrl   │  │ productSvc    │  │ Product       │   │
│  │ /cart         │  │ cartCtrl      │  │ cartService   │  │ Cart          │   │
│  │ /orders       │  │ orderCtrl     │  │ orderService  │  │ Order         │   │
│  │ /wallet       │  │ walletCtrl    │  │ walletSvc     │  │ Wallet        │   │
│  │ /chat         │  │ chatCtrl      │  │ chatService   │  │ Conversation  │   │
│  │ /admin        │  │ adminCtrl     │  │ adminService  │  │ AdminUser     │   │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                       │
│  │  Middleware   │  │    Utils      │  │   Config      │                       │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤                       │
│  │ - auth.js     │  │ - validators  │  │ - database    │                       │
│  │ - validator   │  │ - encryption  │  │ - redis       │                       │
│  │ - rateLimiter │  │ - pdf-parser  │  │ - gcs         │
│  │ - errorHandler│  │ - credit-score│  │ - firebase    │
│  │ - logger      │  │ - ocr-client  │  │ - vertex-ai   │                       │
│  └───────────────┘  └───────────────┘  └───────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Vue.js | 3.4+ | SPA Framework |
| Build Tool | Vite | 5.0+ | Fast bundling |
| State Management | Pinia | 2.1+ | Centralized state |
| Routing | Vue Router | 4.2+ | Client-side routing |
| HTTP Client | Axios | 1.6+ | API communication |
| UI Components | Custom + Headless UI | - | Component library |
| CSS | TailwindCSS | 3.4+ | Utility-first CSS |
| Form Validation | VeeValidate | 4.x | Form handling |
| Charts | Chart.js | 4.x | Data visualization |
| Icons | Heroicons | 2.x | Icon library |

### 2.2 Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 20 LTS | Server runtime |
| Framework | Express.js | 4.18+ | Web framework |
| ORM | Prisma | 5.x | Database ORM |
| Validation | Joi | 17.x | Request validation |
| Auth | Firebase Admin | 12.x | Authentication |
| JWT | jsonwebtoken | 9.x | Token management |
| File Upload | Multer | 1.4+ | Multipart handling |
| Rate Limiting | express-rate-limit | 7.x | API protection |
| Logging | Winston | 3.x | Application logging |
| Testing | Jest | 29.x | Unit/Integration tests |

### 2.3 Database & Storage

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Primary DB | PostgreSQL | 15+ | Main data store |
| Cache | Redis | 7.x | Session & cache |
| Object Storage | Google Cloud Storage | - | File storage |
| Search | PostgreSQL FTS | - | Full-text search |

### 2.4 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Authentication | Firebase Auth | Phone/OTP auth |
| OCR | Google Cloud Vision API | ID card extraction |
| LLM | Vertex AI (Gemini 1.5 Pro) | Financial advisor chat |
| SMS | ThaiBulkSMS / Twilio | OTP delivery |
| Email | AWS SES | Transactional email |
| Push Notifications | Firebase Cloud Messaging | Mobile push |
| Payment Gateway | 2C2P / Omise | Card payments |

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA (ERD)                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │    users     │       │   sessions   │       │   wallets    │
  ├──────────────┤       ├──────────────┤       ├──────────────┤
  │ id (PK)      │──────<│ user_id (FK) │       │ user_id (FK) │>──────┐
  │ phone        │       │ device_id    │       │ balance      │       │
  │ first_name   │       │ token        │       │ points       │       │
  │ last_name    │       │ expires_at   │       │ created_at   │       │
  │ email        │       │ created_at   │       └──────────────┘       │
  │ kyc_status   │       └──────────────┘                              │
  │ created_at   │                                                     │
  └──────┬───────┘       ┌──────────────┐       ┌──────────────┐       │
         │               │ kyc_sessions │       │wallet_txns   │       │
         │               ├──────────────┤       ├──────────────┤       │
         └──────────────>│ user_id (FK) │       │ wallet_id(FK)│<──────┘
                         │ status       │       │ type         │
                         │ ocr_result   │       │ amount       │
                         │ documents    │       │ reference    │
                         │ created_at   │       │ created_at   │
                         └──────────────┘       └──────────────┘

  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │   products   │       │  categories  │       │  promotions  │
  ├──────────────┤       ├──────────────┤       ├──────────────┤
  │ id (PK)      │       │ id (PK)      │       │ id (PK)      │
  │ name         │──────<│ product_id   │       │ code         │
  │ description  │       │ category_id  │       │ discount_pct │
  │ price        │       └──────────────┘       │ valid_from   │
  │ type         │                              │ valid_to     │
  │ stock        │       ┌──────────────┐       │ max_uses     │
  │ status       │       │product_images│       └──────────────┘
  │ created_at   │       ├──────────────┤
  └──────┬───────┘       │ product_id   │
         │               │ url          │
         │               │ order        │
         │               └──────────────┘

  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │    carts     │       │  cart_items  │       │   orders     │
  ├──────────────┤       ├──────────────┤       ├──────────────┤
  │ id (PK)      │──────<│ cart_id (FK) │       │ id (PK)      │
  │ user_id (FK) │       │ product_id   │       │ user_id (FK) │
  │ created_at   │       │ quantity     │       │ status       │
  │ updated_at   │       │ price        │       │ total        │
  └──────────────┘       └──────────────┘       │ address_id   │
                                                │ payment_method│
                                                │ created_at   │
  ┌──────────────┐       ┌──────────────┐       └──────┬───────┘
  │ order_items  │       │  addresses   │              │
  ├──────────────┤       ├──────────────┤              │
  │ order_id(FK) │<──────│ user_id (FK) │<─────────────┘
  │ product_id   │       │ name         │
  │ quantity     │       │ phone        │
  │ price        │       │ address      │
  │ subtotal     │       │ is_default   │
  └──────────────┘       └──────────────┘

  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │loan_products │       │ loan_apps    │       │credit_scores │
  ├──────────────┤       ├──────────────┤       ├──────────────┤
  │ id (PK)      │──────<│ product_id   │       │ loan_app_id  │
  │ name         │       │ user_id (FK) │──────>│ score        │
  │ provider     │       │ status       │       │ income       │
  │ min_amount   │       │ amount       │       │ expense      │
  │ max_amount   │       │ score        │       │ avg_balance  │
  │ min_apr      │       │ created_at   │       │ factors      │
  │ max_apr      │       └──────────────┘       │ created_at   │
  └──────────────┘                              └──────────────┘

  ┌──────────────┐       ┌──────────────┐
  │conversations │       │   messages   │
  ├──────────────┤       ├──────────────┤
  │ id (PK)      │──────<│ conv_id (FK) │
  │ user_id (FK) │       │ role         │
  │ fin_profile  │       │ content      │
  │ created_at   │       │ metadata     │
  │ updated_at   │       │ created_at   │
  └──────────────┘       └──────────────┘
```

### 3.2 Table Definitions

#### Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) UNIQUE NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(255),
    thai_id         VARCHAR(13),
    date_of_birth   DATE,
    address         JSONB,
    kyc_status      VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    kyc_verified_at TIMESTAMP,
    firebase_uid    VARCHAR(128) UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
```

#### Products Table

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(12,2) NOT NULL,
    compare_price   DECIMAL(12,2),
    type            VARCHAR(20) NOT NULL, -- physical, digital, service
    category_id     UUID REFERENCES categories(id),
    stock           INTEGER DEFAULT 0,
    sku             VARCHAR(50) UNIQUE,
    status          VARCHAR(20) DEFAULT 'draft', -- draft, active, inactive
    tags            TEXT[],
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('thai', name));
```

#### Orders Table

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,
    user_id         UUID REFERENCES users(id),
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, confirmed, processing, shipped, delivered, cancelled
    subtotal        DECIMAL(12,2) NOT NULL,
    discount        DECIMAL(12,2) DEFAULT 0,
    shipping_fee    DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(20), -- wallet, card, bank, installment
    payment_status  VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    shipping_address JSONB,
    tracking_number VARCHAR(50),
    carrier         VARCHAR(50),
    promo_code      VARCHAR(20),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
```

#### Loan Applications Table

```sql
CREATE TABLE loan_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(20) UNIQUE NOT NULL,
    user_id         UUID REFERENCES users(id),
    product_id      UUID REFERENCES loan_products(id),
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, processing, approved, rejected, submitted_to_partner
    requested_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    interest_rate   DECIMAL(5,2),
    term_months     INTEGER,
    credit_score    INTEGER,
    ocr_data        JSONB,
    bank_analysis   JSONB,
    rejection_reasons TEXT[],
    partner_reference VARCHAR(50),
    submitted_at    TIMESTAMP,
    decided_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loan_apps_user ON loan_applications(user_id);
CREATE INDEX idx_loan_apps_status ON loan_applications(status);
```

#### Conversations Table (Chat)

```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    financial_profile JSONB,
    -- { income, expenses, goals, savings_rate, recommendations }
    status          VARCHAR(20) DEFAULT 'active', -- active, archived
    last_message_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    role            VARCHAR(20) NOT NULL, -- user, assistant, system
    content         TEXT NOT NULL,
    metadata        JSONB,
    -- { product_recommendations: [], intent: '', entities: {} }
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

---

## 4. API Specifications

### 4.1 API Standards

| Standard | Specification |
|----------|---------------|
| Protocol | HTTPS only |
| Format | JSON |
| Versioning | URL prefix (/api/v1) |
| Authentication | Bearer Token (JWT) |
| Rate Limiting | 100 req/min (general), 10 req/min (auth) |
| Pagination | Cursor-based |
| Error Format | RFC 7807 (Problem Details) |

### 4.2 Authentication APIs

#### POST /api/v1/auth/otp/request

Request OTP for phone login.

**Request:**
```json
{
  "phone": "0812345678"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "otp_abc123",
    "expiresIn": 60,
    "phone": "081****678"
  }
}
```

**Rate Limit:** 3 requests per phone per 5 minutes

---

#### POST /api/v1/auth/otp/verify

Verify OTP and get tokens.

**Request:**
```json
{
  "sessionId": "otp_abc123",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "phone": "0812345678",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "kycStatus": "verified"
    }
  }
}
```

---

### 4.3 Product APIs

#### GET /api/v1/products

List products with search, filter, sort.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search keyword |
| category | uuid | Category filter |
| type | string | physical/digital/service |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| sort | string | price_asc, price_desc, popular, newest |
| cursor | string | Pagination cursor |
| limit | number | Items per page (max 50) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod_123",
        "name": "iPhone 15 Pro",
        "description": "Latest Apple smartphone",
        "price": 38900,
        "comparePrice": 45900,
        "type": "physical",
        "category": {
          "id": "cat_1",
          "name": "อิเล็กทรอนิกส์"
        },
        "images": [
          { "url": "https://...", "order": 1 }
        ],
        "stock": 45,
        "rating": 4.8,
        "reviewCount": 234,
        "promotion": {
          "discount": 15,
          "badge": "ลด 15%"
        }
      }
    ],
    "pagination": {
      "nextCursor": "cursor_xyz",
      "hasMore": true,
      "total": 128
    }
  }
}
```

---

### 4.4 Cart & Order APIs

#### POST /api/v1/cart/items

Add item to cart.

**Request:**
```json
{
  "productId": "prod_123",
  "quantity": 1,
  "variants": {
    "color": "black",
    "storage": "256GB"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "cartId": "cart_abc",
    "items": [
      {
        "id": "item_1",
        "product": { "id": "prod_123", "name": "iPhone 15 Pro" },
        "quantity": 1,
        "price": 38900,
        "subtotal": 38900
      }
    ],
    "summary": {
      "subtotal": 38900,
      "discount": 0,
      "shipping": 0,
      "total": 38900
    }
  }
}
```

---

#### POST /api/v1/orders

Create order from cart.

**Request:**
```json
{
  "addressId": "addr_123",
  "paymentMethod": "card",
  "promoCode": "JECO2026",
  "cardId": "card_456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xyz",
    "orderNumber": "ORD-2026012201",
    "status": "pending",
    "paymentUrl": "https://payment.2c2p.com/...",
    "total": 32565
  }
}
```

---

### 4.5 Loan APIs

#### POST /api/v1/loans/applications

Create loan application.

**Request (multipart/form-data):**
```
productId: prod_loan_123
requestedAmount: 50000
idCardFront: [file]
idCardBack: [file]
bankStatements: [file1, file2, file3]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "applicationId": "loan_app_abc",
    "applicationNumber": "LN-2026012201",
    "status": "processing",
    "ocrResult": {
      "name": "นายสมชาย ใจดี",
      "idNumber": "1-1234-56789-01-2",
      "dateOfBirth": "1990-01-15",
      "address": "123/45 ถ.สุขุมวิท...",
      "confidence": 0.98
    }
  }
}
```

---

#### GET /api/v1/loans/applications/:id/result

Get loan decision result.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "loan_app_abc",
    "status": "approved",
    "creditScore": {
      "score": 750,
      "maxScore": 850,
      "grade": "GOOD",
      "factors": {
        "incomeStability": 85,
        "expenseRatio": 70,
        "averageBalance": 75,
        "paymentHistory": 90
      }
    },
    "bankAnalysis": {
      "monthlyIncome": 45000,
      "monthlyExpense": 30000,
      "averageBalance": 15000,
      "savingsRate": 33.3
    },
    "decision": {
      "approved": true,
      "approvedAmount": 50000,
      "interestRate": 18,
      "termOptions": [12, 24, 36],
      "monthlyPayment": {
        "12": 4583,
        "24": 2500,
        "36": 1806
      }
    },
    "nextSteps": "ข้อมูลถูกส่งไปยังพาร์ทเนอร์แล้ว รอติดต่อกลับภายใน 1-2 วันทำการ"
  }
}
```

---

### 4.6 Chat APIs

#### POST /api/v1/chat/messages

Send message to financial advisor.

**Request:**
```json
{
  "conversationId": "conv_123",
  "message": "รายได้ผมประมาณ 45,000 บาทครับ"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_456",
    "response": {
      "content": "ดีค่ะ! แล้วค่าใช้จ่ายต่อเดือนประมาณเท่าไหร่คะ?",
      "intent": "collect_expense",
      "financialProfile": {
        "income": 45000,
        "expenses": null,
        "goals": null,
        "completeness": 33
      },
      "productRecommendations": []
    }
  }
}
```

---

### 4.7 Wallet APIs

#### POST /api/v1/wallet/topup

Initiate wallet top-up.

**Request:**
```json
{
  "amount": 2000,
  "method": "promptpay"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_abc",
    "amount": 2000,
    "fee": 0,
    "method": "promptpay",
    "qrCode": "data:image/png;base64,...",
    "reference": "JECO2026012201",
    "expiresAt": "2026-01-22T15:30:00Z"
  }
}
```

---

### 4.8 Error Response Format

All errors follow RFC 7807:

```json
{
  "success": false,
  "error": {
    "type": "https://api.jeco.co.th/errors/validation",
    "title": "Validation Error",
    "status": 400,
    "detail": "Phone number must be 10 digits",
    "instance": "/api/v1/auth/otp/request",
    "errors": [
      {
        "field": "phone",
        "message": "Phone number must be 10 digits",
        "code": "INVALID_FORMAT"
      }
    ]
  }
}
```

---

## 5. Security Specifications

### 5.1 Authentication & Authorization

| Aspect | Implementation |
|--------|----------------|
| User Auth | Firebase Auth (Phone/OTP) |
| Token Type | JWT (RS256) |
| Access Token TTL | 1 hour |
| Refresh Token TTL | 30 days |
| Session | Single device (configurable) |
| Admin Auth | Email/Password + 2FA |

### 5.2 Data Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| PII | AES-256 | TLS 1.3 |
| Passwords | bcrypt (cost 12) | TLS 1.3 |
| Thai ID | AES-256 + masking | TLS 1.3 |
| Card Data | Tokenized (PCI) | TLS 1.3 |
| Documents | AES-256 (S3 SSE) | TLS 1.3 |

### 5.3 API Security

```
Rate Limiting:
- General: 100 req/min per IP
- Auth: 10 req/min per phone
- OTP: 3 req/5min per phone
- Search: 30 req/min per user

Headers Required:
- Authorization: Bearer <token>
- X-Device-ID: <device_fingerprint>
- X-Request-ID: <uuid>

CORS:
- Allowed Origins: https://jeco.co.th, https://admin.jeco.co.th
- Allowed Methods: GET, POST, PUT, PATCH, DELETE
- Max Age: 86400
```

### 5.4 Input Validation

| Input | Validation |
|-------|------------|
| Phone | 10 digits, starts with 0 |
| Thai ID | 13 digits, checksum valid |
| Email | RFC 5322 format |
| Amount | Positive, max 2 decimals |
| File Upload | Type whitelist, size limit, virus scan |

---

## 6. Integration Specifications

### 6.1 OCR Service Integration

```yaml
Provider: Google Cloud Vision API
Endpoint: https://vision.googleapis.com/v1/images:annotate
Features:
  - TEXT_DETECTION
  - DOCUMENT_TEXT_DETECTION

Thai ID Card Extraction:
  Fields:
    - name_th: Thai name
    - name_en: English name (if available)
    - id_number: 13-digit ID
    - date_of_birth: DD/MM/YYYY (Buddhist Era)
    - address: Full address
    - issue_date: Card issue date
    - expiry_date: Card expiry date

Confidence Threshold: 0.90
Retry Policy: 3 attempts with exponential backoff
```

### 6.2 LLM Integration (Financial Advisor)

```yaml
Provider: OpenAI GPT-4 / Anthropic Claude
Model: gpt-4-turbo / claude-3-sonnet

System Prompt: |
  You are JECO Financial Advisor, a helpful assistant for Thai users.
  Your role is to:
  1. Collect financial information (income, expenses, goals)
  2. Provide non-advisory financial guidance
  3. Recommend relevant JECO products

  Rules:
  - Always respond in Thai
  - Never provide investment advice
  - Focus on budgeting and savings
  - Recommend products only when relevant

  Available Products:
  - Savings insurance
  - Personal loans
  - Credit cards
  - Investment funds (info only)

Temperature: 0.7
Max Tokens: 500
Timeout: 30 seconds
```

### 6.3 Payment Gateway Integration

```yaml
Provider: 2C2P
Environment: Production
Supported Methods:
  - Credit/Debit Card (Visa, Mastercard, JCB)
  - PromptPay QR
  - Installment Plans

Webhook URL: https://api.jeco.co.th/webhooks/2c2p
Signature: HMAC-SHA256

Card Tokenization: Yes
3D Secure: Required for > 3,000 THB
Recurring: Supported
```

### 6.4 Partner API Integration (Loans)

```yaml
Partners:
  - J Fintech:
      API: https://api.jfintech.co.th/v1
      Auth: API Key + Secret
      Endpoints:
        - POST /applications (submit)
        - GET /applications/{id}/status
        - POST /applications/{id}/documents

  - KB J Capital:
      API: https://api.kbjcapital.co.th/v1
      Auth: OAuth 2.0 Client Credentials
      Endpoints:
        - POST /loan-requests
        - GET /loan-requests/{id}

Webhook Events:
  - application.approved
  - application.rejected
  - application.requires_documents
  - disbursement.completed
```

---

## 7. Performance Requirements

### 7.1 Response Time SLAs

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Page Load | < 1s | < 2s | < 3s |
| API Response | < 200ms | < 500ms | < 1s |
| Search | < 500ms | < 1s | < 2s |
| Chat Response | < 2s | < 3s | < 5s |
| File Upload | < 3s | < 5s | < 10s |
| OCR Processing | < 5s | < 10s | < 15s |

### 7.2 Throughput Requirements

| Metric | Target |
|--------|--------|
| Concurrent Users | 10,000 |
| Requests/Second | 1,000 |
| Database Connections | 100 (pooled) |
| WebSocket Connections | 5,000 |

### 7.3 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| RTO (Recovery Time) | < 1 hour |
| RPO (Recovery Point) | < 5 minutes |
| Maintenance Window | 2 AM - 4 AM (Sunday) |

---

## 8. DevOps & Infrastructure

### 8.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AWS INFRASTRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                 VPC                                         │
  │  ┌────────────────────────────────┐  ┌────────────────────────────────┐    │
  │  │       Public Subnet            │  │       Private Subnet           │    │
  │  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────┐  │    │
  │  │  │    Application Load      │  │  │  │      ECS Cluster         │  │    │
  │  │  │       Balancer           │  │──│──│  ┌─────┐ ┌─────┐ ┌─────┐ │  │    │
  │  │  └──────────────────────────┘  │  │  │  │ API │ │ API │ │ API │ │  │    │
  │  │                                │  │  │  └─────┘ └─────┘ └─────┘ │  │    │
  │  │  ┌──────────────────────────┐  │  │  └──────────────────────────┘  │    │
  │  │  │       NAT Gateway        │  │  │                                │    │
  │  │  └──────────────────────────┘  │  │  ┌──────────────────────────┐  │    │
  │  └────────────────────────────────┘  │  │    RDS (PostgreSQL)      │  │    │
  │                                      │  │    Multi-AZ              │  │    │
  │                                      │  └──────────────────────────┘  │    │
  │                                      │                                │    │
  │                                      │  ┌──────────────────────────┐  │    │
  │                                      │  │    ElastiCache (Redis)   │  │    │
  │                                      │  └──────────────────────────┘  │    │
  │                                      └────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────────────────────┘

  External Services:
  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │   S3    │  │CloudFront  │Firebase │  │  SES    │
  │(Storage)│  │  (CDN)  │  │  Auth   │  │ (Email) │
  └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### 8.2 CI/CD Pipeline

```yaml
Pipeline: GitHub Actions

Stages:
  1. Build:
     - Install dependencies
     - Run linting
     - Run unit tests
     - Build Docker image

  2. Test:
     - Run integration tests
     - Run E2E tests (Playwright)
     - Security scan (Snyk)
     - Code coverage check (> 80%)

  3. Deploy (Staging):
     - Push to ECR
     - Deploy to ECS (staging)
     - Run smoke tests
     - Manual approval gate

  4. Deploy (Production):
     - Blue-green deployment
     - Health check validation
     - Rollback on failure
     - Notify team (Slack)

Environments:
  - Development: auto-deploy on PR merge
  - Staging: auto-deploy on main branch
  - Production: manual trigger with approval
```

### 8.3 Monitoring & Observability

```yaml
Logging:
  - Application: CloudWatch Logs
  - Format: JSON structured
  - Retention: 30 days
  - Alerts: Error rate > 1%

Metrics:
  - Infrastructure: CloudWatch
  - Application: Prometheus + Grafana
  - Custom: Response time, Error rate, Throughput

Tracing:
  - Provider: AWS X-Ray
  - Sampling: 5%
  - Retention: 30 days

Alerting:
  - PagerDuty: P1/P2 incidents
  - Slack: P3/P4 alerts
  - Email: Daily reports

Dashboards:
  - System Health
  - API Performance
  - Business Metrics
  - Error Analysis
```

---

## 9. Appendix

### 9.1 Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/jeco
REDIS_URL=redis://host:6379

# Authentication
FIREBASE_PROJECT_ID=jeco-prod
FIREBASE_PRIVATE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=3600

# External Services
OCR_API_KEY=...
OPENAI_API_KEY=...
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...

# AWS
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=jeco-prod-files

# Payment
PAYMENT_GATEWAY_MERCHANT_ID=...
PAYMENT_GATEWAY_SECRET=...
```

### 9.2 Coding Standards

| Language | Standard |
|----------|----------|
| JavaScript/TypeScript | ESLint + Prettier (Airbnb) |
| SQL | PostgreSQL style guide |
| API | OpenAPI 3.0 specification |
| Git | Conventional Commits |
| Documentation | JSDoc / TSDoc |

---

*End of Technical Specifications Document*
