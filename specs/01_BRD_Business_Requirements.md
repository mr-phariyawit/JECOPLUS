# JECO Platform - Business Requirements Document (BRD)

**Version:** 1.0
**Status:** Approved
**Last Updated:** January 2026
**Document Owner:** JECO Product Team

---

## 1. Executive Summary

### 1.1 Project Overview

JECO Platform เป็น Super App ด้านการเงินครบวงจรสำหรับ Jaymart Ecosystem ที่รวม:
- **Financial Advisor Chatbot** - AI ที่ปรึกษาการเงินส่วนบุคคล
- **Marketplace** - ตลาดสินค้าและบริการ
- **Digital Wallet** - กระเป๋าเงินดิจิทัล
- **Loan Services** - บริการสินเชื่อออนไลน์
- **Back-office** - ระบบจัดการหลังบ้าน

### 1.2 Business Objectives

| Objective | KPI | Target |
|-----------|-----|--------|
| เพิ่มฐานลูกค้า Jaymart | Monthly Active Users | 100,000 users ใน 12 เดือน |
| เพิ่มยอดขายสินเชื่อ | Loan Applications | 5,000 applications/เดือน |
| เพิ่มยอดขาย Marketplace | GMV | 50M THB/เดือน |
| ลดต้นทุนการให้บริการ | Cost per Acquisition | ลด 30% |
| เพิ่มความพึงพอใจลูกค้า | NPS Score | > 50 |

### 1.3 Project Scope

**In Scope:**
- Mobile-first Web Application (PWA)
- AI Chatbot with Financial Advisory
- E-commerce Marketplace
- Digital Wallet with Top-up/Withdraw
- Loan Application with Auto-scoring
- Admin Back-office Portal

**Out of Scope:**
- Native Mobile Apps (Phase 2)
- Investment Products
- Insurance Underwriting
- International Payments

---

## 2. Stakeholders

### 2.1 Stakeholder Matrix

| Stakeholder | Role | Interest | Influence |
|-------------|------|----------|-----------|
| CEO | Executive Sponsor | High | High |
| CFO | Financial Oversight | High | High |
| CTO | Technical Direction | High | High |
| Product Manager | Product Owner | High | Medium |
| Loan Officers | Operations | Medium | Low |
| Customer Service | Support | Medium | Low |
| End Users | Consumers | High | Medium |
| Partner Banks | Loan Providers | High | Medium |

### 2.2 RACI Matrix

| Activity | CEO | PM | Dev | QA | Ops |
|----------|-----|----|----|----|----|
| Requirements | I | A | C | C | I |
| Design | I | A | R | C | I |
| Development | I | A | R | C | I |
| Testing | I | A | C | R | I |
| Deployment | I | A | R | C | A |
| Operations | I | C | C | I | R |

---

## 3. Business Requirements

### 3.1 Module: Financial Advisor Chatbot

#### BR-FA-001: AI Financial Consultation

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-FA-001 |
| **Priority** | Critical |
| **Business Need** | ลูกค้าต้องการคำปรึกษาด้านการเงินที่เข้าถึงได้ 24/7 |
| **Business Value** | ลดต้นทุน Call Center 40%, เพิ่ม Engagement 3x |
| **Success Criteria** | 80% ของ users ใช้ chatbot อย่างน้อย 1 ครั้ง/สัปดาห์ |

**Functional Requirements:**
1. Bot สามารถสนทนาภาษาไทยได้อย่างเป็นธรรมชาติ
2. Bot เก็บข้อมูล Financial Profile (รายได้, รายจ่าย, เป้าหมาย)
3. Bot สร้าง Non-advisory Financial Plan
4. Bot แนะนำสินค้า/บริการที่เหมาะสม
5. ประวัติสนทนาต้องเก็บรักษาข้ามเซสชัน

**Non-Functional Requirements:**
- Response Time: < 3 วินาที
- Availability: 99.9%
- Concurrent Users: 10,000

#### BR-FA-002: Product Recommendations

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-FA-002 |
| **Priority** | High |
| **Business Need** | เพิ่มยอดขายผ่านการแนะนำที่ตรงใจ |
| **Business Value** | เพิ่ม Conversion Rate 25% |
| **Success Criteria** | 15% ของ recommendations นำไปสู่การซื้อ |

---

### 3.2 Module: Marketplace

#### BR-MP-001: Product Discovery

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-MP-001 |
| **Priority** | Critical |
| **Business Need** | ลูกค้าต้องการค้นหาสินค้าได้รวดเร็ว |
| **Business Value** | เพิ่มยอดขาย, ลด Bounce Rate |
| **Success Criteria** | < 3 คลิกถึงหน้าสินค้า |

**Product Categories:**
1. **Physical Products** - อิเล็กทรอนิกส์, แฟชั่น, ของใช้
2. **Digital Products** - บัตรเติมเงิน, E-vouchers
3. **Services** - ประกัน, สินเชื่อ, บริการซ่อม
4. **F&B** - Casa Lapin, Suki Teenoi vouchers

#### BR-MP-002: Shopping Cart & Checkout

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-MP-002 |
| **Priority** | Critical |
| **Business Need** | กระบวนการซื้อที่ราบรื่น |
| **Business Value** | ลด Cart Abandonment < 30% |
| **Success Criteria** | Checkout ภายใน 3 นาที |

**Payment Methods:**
1. J Wallet (JECO Wallet)
2. Credit/Debit Card
3. Bank Transfer (PromptPay)
4. Installment Plans

#### BR-MP-003: Order Fulfillment

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-MP-003 |
| **Priority** | High |
| **Business Need** | ติดตามคำสั่งซื้อได้ตลอดเวลา |
| **Business Value** | ลด Customer Support inquiries 50% |
| **Success Criteria** | 100% orders trackable |

---

### 3.3 Module: Wallet & Loan

#### BR-WL-001: Digital Wallet

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-WL-001 |
| **Priority** | Critical |
| **Business Need** | วิธีชำระเงินที่สะดวกในระบบ |
| **Business Value** | เพิ่ม Transaction Volume, ลดค่าธรรมเนียม |
| **Success Criteria** | 60% ของ transactions ผ่าน Wallet |

**Wallet Features:**
| Feature | Limit | Fee |
|---------|-------|-----|
| Top-up (Bank) | Min 100, Max 50,000 THB | Free |
| Top-up (Card) | Min 100, Max 30,000 THB | 2.5% |
| Withdraw | Min 500, Max 100,000 THB | 15 THB |
| Transfer | Max 50,000 THB/day | Free |
| Points Redemption | 100 pts = 1 THB | Free |

#### BR-LN-001: Loan Application

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-LN-001 |
| **Priority** | Critical |
| **Business Need** | สมัครสินเชื่อออนไลน์ได้ง่าย |
| **Business Value** | เพิ่มยอดสินเชื่อ 200% |
| **Success Criteria** | 70% completion rate |

**Loan Products:**

| Product | Provider | Amount | APR | Term |
|---------|----------|--------|-----|------|
| Personal Loan | J Fintech | 5K-100K | 18-25% | 6-36 mo |
| Pah Pay | J Fintech | 1K-50K | 30-36% | 1-12 mo |
| KB Personal | KB J Capital | 20K-500K | 15-22% | 12-60 mo |
| Singer HP | Singer | 3K-150K | 0-24% | 6-48 mo |
| Car Title | SG Capital | 10K-1M | 12-24% | 12-84 mo |

#### BR-LN-002: Auto Credit Scoring

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-LN-002 |
| **Priority** | Critical |
| **Business Need** | ตัดสินใจสินเชื่ออัตโนมัติ |
| **Business Value** | ลดเวลาอนุมัติจาก 3 วันเหลือ 3 นาที |
| **Success Criteria** | 80% auto-decision accuracy |

**Credit Score Model:**

| Factor | Weight | Data Source |
|--------|--------|-------------|
| Income Stability | 30% | Bank Statement |
| Expense Ratio | 20% | Bank Statement |
| Average Balance | 20% | Bank Statement |
| Payment History | 15% | Internal Data |
| Employment | 10% | Self-declared |
| Age Factor | 5% | Thai ID OCR |

**Decision Matrix:**

| Score Range | Decision | Action |
|-------------|----------|--------|
| 750-850 | Auto-Approve | Submit to Partner |
| 700-749 | Conditional | Manual Review |
| 600-699 | Decline | Show Reasons |
| 300-599 | Hard Decline | 90-day cooldown |

---

### 3.4 Module: Back-office

#### BR-BO-001: Admin Portal

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-BO-001 |
| **Priority** | High |
| **Business Need** | จัดการแพลตฟอร์มได้มีประสิทธิภาพ |
| **Business Value** | ลดเวลา Operations 60% |
| **Success Criteria** | Single dashboard for all operations |

**User Roles:**

| Role | Permissions |
|------|-------------|
| Super Admin | Full access, user management |
| Product Manager | Product CRUD, promotions |
| Loan Officer | Loan review, customer view |
| Operator | Order management, support |
| Viewer | Read-only dashboard |

#### BR-BO-002: Reporting & Analytics

| Field | Description |
|-------|-------------|
| **Requirement ID** | BR-BO-002 |
| **Priority** | Medium |
| **Business Need** | ข้อมูลเชิงลึกเพื่อตัดสินใจ |
| **Business Value** | Data-driven decisions |
| **Success Criteria** | Real-time dashboards |

**Key Reports:**
1. Daily Sales Summary
2. Loan Application Pipeline
3. Customer Acquisition Funnel
4. Product Performance
5. Wallet Transaction Volume
6. Chatbot Engagement Metrics

---

## 4. Compliance & Regulatory

### 4.1 Data Protection

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Personal Data | PDPA Thailand | Consent management, Data encryption |
| Financial Data | BOT Regulations | Secure storage, Audit logs |
| Card Data | PCI-DSS | Tokenization, No storage |

### 4.2 Financial Regulations

| Area | Regulator | Compliance |
|------|-----------|------------|
| Digital Lending | BOT | Licensed partners only |
| E-Wallet | BOT | Licensed e-money |
| Consumer Protection | OIC | Clear terms, Cooling-off |

### 4.3 Security Requirements

| Requirement | Standard |
|-------------|----------|
| Authentication | 2FA for sensitive operations |
| Encryption | TLS 1.3, AES-256 at rest |
| Session | 30-min timeout, Single session |
| Audit | Complete audit trail |

---

## 5. Assumptions & Constraints

### 5.1 Assumptions

1. Users มี smartphone และ internet access
2. Partners (banks, lenders) มี API พร้อมใช้งาน
3. OCR service มีความแม่นยำ > 95%
4. Users ยินยอมให้เก็บข้อมูลตาม PDPA

### 5.2 Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Budget: 10M THB | Limited features | Phased delivery |
| Timeline: 6 months | Aggressive schedule | MVP first |
| Team: 8 developers | Resource limit | Outsource UI |
| Legacy systems | Integration complexity | API abstraction |

### 5.3 Dependencies

| Dependency | Owner | Risk |
|------------|-------|------|
| Firebase Auth | Google | Low |
| OCR Service | External | Medium |
| Partner APIs | Banks | High |
| Payment Gateway | 2C2P | Medium |

---

## 6. Success Metrics

### 6.1 Business KPIs

| Metric | Baseline | Target (6mo) | Target (12mo) |
|--------|----------|--------------|---------------|
| MAU | 0 | 30,000 | 100,000 |
| Loan Applications | 0 | 2,000/mo | 5,000/mo |
| GMV | 0 | 20M/mo | 50M/mo |
| Wallet Transactions | 0 | 50,000/mo | 200,000/mo |
| NPS | N/A | 40 | 50 |

### 6.2 Technical KPIs

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Page Load | < 3 sec |
| API Response | < 500ms |
| Error Rate | < 0.1% |

---

## 7. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Partner API delays | Medium | High | Mock services, Parallel development |
| Security breach | Low | Critical | Penetration testing, Bug bounty |
| Low adoption | Medium | High | Marketing campaign, Incentives |
| Regulatory changes | Low | Medium | Legal monitoring, Flexible design |
| Performance issues | Medium | Medium | Load testing, Auto-scaling |

---

## 8. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Executive Sponsor | | | |
| Product Owner | | | |
| Tech Lead | | | |
| Legal | | | |

---

*End of Business Requirements Document*
