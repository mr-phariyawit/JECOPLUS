# JECO Platform - User Acceptance Criteria (UAC)

**Version:** 1.0
**Last Updated:** January 2026
**Format:** Gherkin (Given-When-Then)

---

## Table of Contents

1. [Module: Authentication](#module-authentication)
2. [Module: Chatbot - Financial Advisor](#module-chatbot---financial-advisor)
3. [Module: Marketplace](#module-marketplace)
4. [Module: Wallet](#module-wallet)
5. [Module: Loan Application](#module-loan-application)
6. [Module: Back-office](#module-back-office)
7. [Non-Functional Requirements](#non-functional-requirements)

---

## Module: Authentication

### AUTH-001: Phone Number Login

**Feature:** User login with phone number and OTP

```gherkin
Feature: Phone Number Authentication
  As a user
  I want to login with my phone number
  So that I can access JECO platform securely

  Background:
    Given the JECO app is loaded
    And I am on the login screen

  Scenario: Successful OTP request
    Given I enter a valid phone number "0812345678"
    When I tap the "รับรหัส OTP" button
    Then I should see the OTP verification screen
    And I should receive an SMS with 6-digit OTP
    And I should see a 60-second countdown timer

  Scenario: Successful login with valid OTP
    Given I have requested OTP for "0812345678"
    And I received OTP "123456"
    When I enter OTP "123456"
    Then the OTP should be verified automatically
    And I should be redirected to the dashboard
    And I should see welcome message "สวัสดี, [username]!"

  Scenario: Failed login with invalid OTP
    Given I have requested OTP for "0812345678"
    When I enter incorrect OTP "000000"
    Then I should see error message "รหัส OTP ไม่ถูกต้อง"
    And the OTP input fields should shake
    And I should have 2 remaining attempts

  Scenario: Account locked after 3 failed attempts
    Given I have entered incorrect OTP 3 times
    Then I should see error message "บัญชีถูกระงับชั่วคราว 15 นาที"
    And the OTP input should be disabled
    And I should see a 15-minute countdown

  Scenario: Resend OTP after timeout
    Given I am on OTP verification screen
    And the countdown timer shows "00:00"
    When I tap "ส่งรหัสใหม่"
    Then a new OTP should be sent to my phone
    And the timer should reset to 60 seconds

  Scenario: Invalid phone number format
    When I enter phone number "123"
    Then the "รับรหัส OTP" button should be disabled
    And I should see helper text "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"

  Scenario: Rate limiting on OTP requests
    Given I have requested OTP 3 times in 5 minutes
    When I try to request another OTP
    Then I should see error "กรุณารอ 5 นาทีก่อนขอรหัส OTP ใหม่"
```

### AUTH-002: Session Management

```gherkin
Feature: Session Management
  As a user
  I want my session to be managed securely
  So that my account is protected

  Scenario: Auto logout after inactivity
    Given I am logged in
    When I am inactive for 30 minutes
    Then I should see session expiry warning
    And after 5 more minutes I should be logged out
    And I should see message "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"

  Scenario: Logout from current device
    Given I am logged in on my phone
    When I tap "ออกจากระบบ" in profile
    Then I should be logged out
    And I should see the login screen
    And my session token should be invalidated

  Scenario: View active sessions
    Given I am logged in
    When I navigate to "อุปกรณ์ที่เชื่อมต่อ"
    Then I should see a list of active sessions
    And each session should show device name and last active time
```

---

## Module: Chatbot - Financial Advisor

### FA-001: Chat with Financial Advisor Bot

```gherkin
Feature: Financial Advisor Chatbot
  As a user
  I want to chat with an AI financial advisor
  So that I can get personalized financial guidance

  Background:
    Given I am logged in
    And I am on the chat screen

  Scenario: Start new conversation
    Given I have no previous conversation
    When the chat screen loads
    Then I should see bot greeting message
    And the message should ask about my monthly income
    And I should see quick reply buttons with income ranges

  Scenario: Bot collects financial profile
    Given the bot has asked about my income
    When I reply "45,000 บาท"
    Then the bot should acknowledge "45,000 บาท"
    And the bot should ask about my monthly expenses
    And my financial profile should be updated with income: 45000

  Scenario: Bot responds within SLA
    Given I am in an active conversation
    When I send a message
    Then I should see typing indicator within 500ms
    And I should receive a response within 3 seconds

  Scenario: Chat history persists across sessions
    Given I have previous chat history
    When I close and reopen the app
    And I navigate to chat screen
    Then I should see my previous conversation
    And messages should be in chronological order

  Scenario: Bot generates financial summary
    Given I have provided income of "45,000"
    And I have provided expenses of "30,000"
    When the bot calculates my financial status
    Then I should see a summary card showing:
      | Field      | Value       |
      | รายได้     | ฿45,000     |
      | รายจ่าย    | ฿30,000     |
      | เงินเก็บ   | ฿15,000     |
      | อัตราเก็บ  | 33%         |
    And the status should show "ดี" or "ดีมาก"

  Scenario: Bot recommends relevant products
    Given the bot knows my financial profile
    And I have expressed interest in "ออมเงิน"
    When the bot generates recommendations
    Then I should see product cards inline in chat
    And products should match my financial profile
    And each card should have "ดูรายละเอียด" button
```

### FA-002: Product Recommendations in Chat

```gherkin
Feature: Product Recommendations
  As a user
  I want to see product recommendations in chat
  So that I can discover relevant products

  Scenario: Product card appears in chat
    Given the bot recommends a product
    Then I should see a product card with:
      | Element       | Required |
      | Product image | Yes      |
      | Product name  | Yes      |
      | Description   | Yes      |
      | Price         | Yes      |
      | Promo badge   | If applicable |
      | CTA button    | Yes      |

  Scenario: Navigate to product from chat
    Given I see a product card in chat
    When I tap "ดูรายละเอียด"
    Then I should navigate to product detail page
    And any applicable promo should be auto-applied

  Scenario: Only active promotions shown
    Given a product has an expired promotion
    When the bot recommends that product
    Then the product card should not show promotion badge
    And the price should reflect non-promotional price
```

---

## Module: Marketplace

### MP-001: Browse and Search Products

```gherkin
Feature: Product Browsing and Search
  As a user
  I want to browse and search products
  So that I can find items I want to purchase

  Background:
    Given I am logged in
    And I am on the marketplace screen

  Scenario: Search products by keyword
    When I enter "iPhone" in the search box
    And I tap the search button
    Then I should see products matching "iPhone"
    And results should load within 2 seconds
    And I should see the number of results found

  Scenario: Filter products by category
    Given products are displayed
    When I tap category "อิเล็กทรอนิกส์"
    Then only electronics products should be displayed
    And the category tab should be highlighted

  Scenario: Filter products by price range
    When I tap the filter icon
    And I set minimum price to "10000"
    And I set maximum price to "50000"
    And I tap "Apply Filter"
    Then only products priced ฿10,000 - ฿50,000 should display

  Scenario: Sort products by price ascending
    Given products are displayed
    When I tap sort dropdown
    And I select "ราคาต่ำ-สูง"
    Then products should be sorted by price ascending
    And the first product should have the lowest price

  Scenario: Pagination with infinite scroll
    Given there are 50 products matching search
    When I scroll to the bottom of the list
    Then the next 20 products should load
    And loading indicator should appear during load

  Scenario: Product card displays required info
    Given products are displayed
    Then each product card should show:
      | Element        | Required |
      | Product image  | Yes      |
      | Product name   | Yes      |
      | Price          | Yes      |
      | Rating         | Yes      |
      | Stock status   | Yes      |

  Scenario: Empty search results
    When I search for "xyz123nonexistent"
    Then I should see "ไม่พบสินค้าที่ค้นหา"
    And I should see suggestions to broaden search
```

### MP-002: Cart and Checkout

```gherkin
Feature: Shopping Cart and Checkout
  As a user
  I want to add items to cart and checkout
  So that I can purchase products

  Background:
    Given I am logged in
    And I have added "iPhone 15 Pro" to my cart

  Scenario: Add product to cart
    Given I am on product detail page
    When I select quantity "1"
    And I tap "เพิ่มลงตะกร้า"
    Then the product should be added to cart
    And cart badge should show "1"
    And I should see confirmation toast "เพิ่มสินค้าลงตะกร้าแล้ว"

  Scenario: Update cart quantity
    Given I am on the cart page
    When I tap "+" to increase quantity to 2
    Then the quantity should update to 2
    And the subtotal should recalculate
    And the cart total should update

  Scenario: Remove item from cart
    Given I am on the cart page
    When I tap the delete icon for "iPhone 15 Pro"
    Then I should see confirmation dialog
    When I confirm deletion
    Then the item should be removed from cart
    And cart total should recalculate

  Scenario: Apply valid promotion code
    Given I am on the cart page
    When I enter promo code "JECO2026"
    And I tap "ใช้โค้ด"
    Then the discount should be applied
    And I should see "✅ ลดเพิ่ม 500 บาท!"
    And the total should reflect the discount

  Scenario: Apply invalid promotion code
    Given I am on the cart page
    When I enter promo code "INVALID123"
    And I tap "ใช้โค้ด"
    Then I should see error "โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ"

  Scenario: Complete checkout with card payment
    Given I am on checkout page
    And I have selected shipping address
    When I select "บัตรเครดิต/เดบิต" as payment method
    And I select saved card "**** 4532"
    And I tap "ยืนยันและชำระเงิน"
    Then payment should be processed
    And I should see order confirmation screen
    And I should see order number starting with "ORD-"
    And I should receive SMS confirmation

  Scenario: Checkout with insufficient wallet balance
    Given my wallet balance is ฿1,000
    And cart total is ฿38,900
    When I select "J Wallet" as payment method
    Then J Wallet option should show "ยอดไม่พอ"
    And I should not be able to proceed with wallet payment

  Scenario: Cart persists across sessions
    Given I have items in cart
    When I close and reopen the app
    Then my cart items should still be present
    And quantities should be preserved
```

### MP-003: Order Tracking

```gherkin
Feature: Order Tracking
  As a user
  I want to track my order status
  So that I know when my items will arrive

  Background:
    Given I have completed an order
    And my order number is "ORD-2026012201"

  Scenario: View order status
    Given I am on order history page
    When I tap on order "ORD-2026012201"
    Then I should see order details:
      | Status           |
      | Order items      |
      | Total amount     |
      | Shipping address |
      | Payment method   |

  Scenario: Track shipped order
    Given my order status is "Shipped"
    Then I should see tracking number
    And I should see carrier name
    And I should see "ติดตามพัสดุ" link

  Scenario: Open external tracking
    Given my order has tracking number "TH123456789"
    When I tap "ติดตามพัสดุ"
    Then I should be redirected to carrier tracking page
    And the tracking number should be pre-filled

  Scenario: Receive push notification on status change
    Given my order status changes to "Shipped"
    Then I should receive push notification
    And notification should say "คำสั่งซื้อ ORD-2026012201 ถูกจัดส่งแล้ว"
```

---

## Module: Wallet

### WL-001: Wallet Management

```gherkin
Feature: Wallet Management
  As a user
  I want to manage my digital wallet
  So that I can pay for purchases conveniently

  Background:
    Given I am logged in
    And I am on the wallet screen

  Scenario: View wallet balance
    Then I should see my THB balance prominently
    And I should see my points balance
    And I should see points value in THB (100 pts = ฿1)

  Scenario: Top up via PromptPay
    When I tap "เติมเงิน"
    And I enter amount "2,000"
    And I select "PromptPay QR"
    And I tap "ดำเนินการเติมเงิน"
    Then I should see QR code for payment
    And QR should expire in 15 minutes
    When payment is completed
    Then my balance should increase by ฿2,000
    And I should see transaction in history

  Scenario: Top up via credit card
    When I tap "เติมเงิน"
    And I enter amount "1,000"
    And I select "บัตรเครดิต/เดบิต"
    Then I should see 2.5% fee warning
    When I confirm
    Then total charged should be ฿1,025
    And my wallet should receive ฿1,000

  Scenario: Minimum top-up validation
    When I tap "เติมเงิน"
    And I enter amount "50"
    Then I should see error "ยอดเติมเงินขั้นต่ำ ฿100"
    And the proceed button should be disabled

  Scenario: Withdraw to bank account
    Given my wallet balance is ฿10,000
    When I tap "ถอนเงิน"
    And I enter amount "5,000"
    And I select linked bank account
    And I tap "ยืนยันถอนเงิน"
    Then I should see confirmation
    And my balance should decrease by ฿5,015 (including ฿15 fee)
    And I should see "เงินจะเข้าบัญชีภายใน 1-2 วันทำการ"

  Scenario: Minimum withdrawal validation
    When I tap "ถอนเงิน"
    And I enter amount "100"
    Then I should see error "ยอดถอนขั้นต่ำ ฿500"

  Scenario: View transaction history
    When I tap "ดูทั้งหมด" on transaction history
    Then I should see all transactions
    And transactions should be grouped by date
    And I should be able to filter by type (เติม/ถอน/ชำระ)

  Scenario: Transaction history shows correct icons
    Given I have various transaction types
    Then top-up transactions should show "➕" icon in green
    And payment transactions should show "🛒" icon in red
    And withdrawal transactions should show "➖" icon in red
    And points earned should show "🎁" icon in green
```

---

## Module: Loan Application

### LN-001: Loan Application

```gherkin
Feature: Loan Application
  As a user
  I want to apply for a loan online
  So that I can get financing quickly

  Background:
    Given I am logged in
    And I have completed KYC verification
    And I am on the loan products screen

  Scenario: Select loan product
    Given I see available loan products
    When I tap "สมัครเลย" on "สินเชื่อส่วนบุคคล J Fintech"
    Then I should navigate to loan application flow
    And I should see step indicator "Step 1 of 3"

  Scenario: Upload Thai ID card
    Given I am on Step 1 (Upload ID)
    When I tap the upload area
    Then I should see options to take photo or upload file
    When I upload ID card front image
    And I upload ID card back image
    Then both images should show as uploaded
    And I should be able to proceed to OCR confirmation

  Scenario: OCR extracts information correctly
    Given I have uploaded clear ID card images
    When OCR processing completes
    Then I should see extracted information:
      | Field            | Editable |
      | ชื่อ-นามสกุล      | Yes      |
      | เลขบัตรประชาชน   | No       |
      | วันเกิด          | Yes      |
      | ที่อยู่           | Yes      |
    And confidence score should be ≥ 90%

  Scenario: Edit OCR results before confirmation
    Given OCR has extracted my information
    And name shows "นาย สมชาย ใจดี"
    When I edit name to "นายสมชาย ใจดี"
    And I tap "ยืนยัน"
    Then the corrected name should be saved
    And I should proceed to Step 2

  Scenario: Upload bank statements
    Given I am on Step 2 (Bank Statement)
    When I upload 3 PDF bank statements
    Then I should see all 3 files listed
    And each file should show name and size
    And I should be able to remove individual files

  Scenario: Minimum bank statement requirement
    Given I have uploaded only 2 bank statements
    When I tap "ส่งใบสมัคร"
    Then I should see error "กรุณาอัปโหลดอย่างน้อย 3 เดือน"

  Scenario: Credit score approval (≥700)
    Given I have submitted complete application
    When credit scoring is calculated
    And my score is 750
    Then I should see "✅ อนุมัติสินเชื่อเบื้องต้น!"
    And I should see my credit score with visual bar
    And I should see approved amount, interest rate, and terms
    And status should show "ส่งข้อมูลไปยังพาร์ทเนอร์แล้ว"

  Scenario: Credit score rejection (<700)
    Given I have submitted complete application
    When credit scoring is calculated
    And my score is 580
    Then I should see "❌ ขออภัย ไม่ผ่านเกณฑ์การพิจารณา"
    And I should see my credit score
    And I should see rejection reasons
    And I should see advice for improvement
    And I should see "สมัครใหม่ได้หลัง 90 วัน"

  Scenario: Track application status
    Given I have submitted a loan application
    When I navigate to loan history
    Then I should see my application with current status
    And status should be one of: Pending, Processing, Approved, Rejected
```

### LN-002: OCR Integration

```gherkin
Feature: OCR Integration for ID Cards
  As a system
  I want to extract data from ID card images
  So that users don't need to manually enter information

  Scenario: Successful OCR extraction
    Given a user uploads a clear Thai ID card image
    When OCR processing completes within 10 seconds
    Then the following fields should be extracted:
      | Field          | Format              |
      | Name (Thai)    | Thai characters     |
      | ID Number      | X-XXXX-XXXXX-XX-X   |
      | Date of Birth  | DD/MM/YYYY (BE)     |
      | Address        | Thai text           |
    And confidence score should be returned
    And processing time should be < 10 seconds

  Scenario: Handle blurry image
    Given a user uploads a blurry ID card image
    When OCR processing completes
    Then confidence score should be < 80%
    And user should see warning "ภาพไม่ชัด กรุณาอัปโหลดใหม่"

  Scenario: Supported file formats
    Given a user tries to upload a file
    Then the following formats should be accepted:
      | Format | Max Size |
      | JPG    | 5MB      |
      | PNG    | 5MB      |
      | PDF    | 5MB      |
    And unsupported formats should show error
```

### LN-003: Credit Scoring

```gherkin
Feature: Credit Scoring System
  As a system
  I want to calculate credit scores from bank statements
  So that loan decisions can be automated

  Scenario: Parse bank statement PDF
    Given a user uploads valid bank statement PDFs
    When the system processes the statements
    Then the following data should be extracted:
      | Data Point         |
      | Total credits      |
      | Total debits       |
      | Monthly balances   |
      | Transaction dates  |

  Scenario: Calculate financial metrics
    Given bank statement data is extracted
    When the system calculates financial metrics
    Then the following should be computed:
      | Metric                | Formula                    |
      | Monthly Income        | Sum of credits / months    |
      | Monthly Expense       | Sum of debits / months     |
      | Average Balance       | Sum of balances / months   |
      | Income Stability      | Variance analysis          |

  Scenario: Generate credit score
    Given financial metrics are calculated
    When the scoring algorithm runs
    Then a score between 300-850 should be generated
    And the following factors should be weighted:
      | Factor            | Weight |
      | Income Stability  | 30%    |
      | Expense Ratio     | 20%    |
      | Average Balance   | 20%    |
      | Payment History   | 15%    |
      | Employment        | 10%    |
      | Age Factor        | 5%     |

  Scenario: Auto-approval threshold
    Given a user's credit score is calculated as 720
    Then the application should be auto-approved
    And data should be submitted to partner API
    And user should see approved status

  Scenario: Auto-rejection threshold
    Given a user's credit score is calculated as 580
    Then the application should be auto-rejected
    And user should see rejection reasons
    And 90-day cooldown should be applied
```

---

## Module: Back-office

### BO-001: Admin Login & Dashboard

```gherkin
Feature: Admin Login and Dashboard
  As an admin
  I want to login and see platform metrics
  So that I can manage the platform

  Scenario: Admin login with email/password
    Given I am on admin login page
    When I enter valid email "admin@jeco.co.th"
    And I enter valid password
    And I tap "เข้าสู่ระบบ"
    Then I should be logged in successfully
    And I should see the admin dashboard

  Scenario: Dashboard shows key metrics
    Given I am logged in as admin
    When I view the dashboard
    Then I should see the following metrics:
      | Metric               |
      | Total Users          |
      | Active Loans         |
      | Today's Applications |
      | Revenue              |

  Scenario: Session timeout
    Given I am logged in as admin
    When I am inactive for 30 minutes
    Then I should be automatically logged out
    And I should see "Session หมดอายุ"
```

### BO-002: Product CRUD

```gherkin
Feature: Product Management
  As an admin
  I want to manage products
  So that the catalog is up to date

  Background:
    Given I am logged in as admin
    And I am on the product management page

  Scenario: Create new product
    When I tap "Add Product"
    And I fill in product details:
      | Field       | Value               |
      | Name        | iPhone 16 Pro       |
      | Description | Latest Apple phone  |
      | Price       | 42900               |
      | Type        | Physical            |
      | Category    | Electronics         |
      | Stock       | 50                  |
    And I upload product images
    And I tap "Save Product"
    Then the product should be created
    And I should see success message

  Scenario: Edit existing product
    Given product "iPhone 15 Pro" exists
    When I tap "Edit" on that product
    And I change price from "38900" to "36900"
    And I tap "Save"
    Then the price should be updated
    And the change should reflect on marketplace

  Scenario: Bulk upload products
    When I tap "Bulk Upload"
    And I upload a CSV file with 10 products
    Then the system should preview the import
    And AI should auto-map columns
    When I confirm the import
    Then all 10 products should be created
```

### BO-004: Loan Customer Management

```gherkin
Feature: Loan Customer Management
  As a loan officer
  I want to view loan applications
  So that I can review and support customers

  Background:
    Given I am logged in as loan officer
    And I am on loan management page

  Scenario: Search customers
    When I search for "สมชาย"
    Then I should see customers matching "สมชาย"
    And results should include name, ID, phone, score, status

  Scenario: Filter by application status
    When I filter by status "Pending"
    Then I should only see pending applications

  Scenario: View customer details
    Given I see application "LN-003"
    When I tap "View"
    Then I should see:
      | Section              |
      | Customer Information |
      | Credit Assessment    |
      | Documents            |
      | Application Timeline |

  Scenario: Data masking for sensitive fields
    Given I am viewing customer details
    Then ID card should show "1-1234-xxxxx-xx-x"
    And phone should show "081-xxx-xxxx"
    And only authorized roles can see full data
```

---

## Non-Functional Requirements

### NFR-001: Performance

```gherkin
Feature: Performance Requirements
  As a user
  I want the app to be fast and responsive
  So that I have a good experience

  Scenario: Page load time
    Given I am on a stable network connection
    When I navigate to any page
    Then the page should load within 3 seconds

  Scenario: API response time
    When the app makes an API request
    Then response should arrive within 500ms (P95)

  Scenario: Chat bot response time
    When I send a message to the chat bot
    Then I should see typing indicator within 500ms
    And response should arrive within 3 seconds

  Scenario: Handle concurrent users
    Given 10,000 users are active
    Then the system should remain responsive
    And error rate should be < 0.1%
```

### NFR-002: Security

```gherkin
Feature: Security Requirements
  As a user
  I want my data to be secure
  So that my information is protected

  Scenario: Data encryption in transit
    When data is transmitted between app and server
    Then it should be encrypted with TLS 1.3

  Scenario: Sensitive data masking
    When displaying Thai ID numbers
    Then only last 4 digits should be visible

  Scenario: Rate limiting on authentication
    When I attempt login 10 times in 1 minute
    Then I should be temporarily blocked
    And I should see "Too many attempts"

  Scenario: Session management
    When I login on a new device
    Then my other sessions should remain active
    But I should be able to revoke them from settings
```

### NFR-003: Accessibility

```gherkin
Feature: Accessibility Requirements
  As a user with disabilities
  I want the app to be accessible
  So that I can use all features

  Scenario: Screen reader support
    Given I am using a screen reader
    Then all interactive elements should have labels
    And navigation should be keyboard accessible

  Scenario: Color contrast
    Given I am viewing the app
    Then text should have contrast ratio ≥ 4.5:1
    And interactive elements should be distinguishable

  Scenario: Touch targets
    Given I am using the mobile app
    Then all tappable elements should be ≥ 48x48 pixels
```

### NFR-004: Availability

```gherkin
Feature: Availability Requirements
  As a user
  I want the app to be always available
  So that I can use it anytime

  Scenario: High availability
    Given the platform is in production
    Then uptime should be ≥ 99.9%
    And planned maintenance should be < 4 hours/month

  Scenario: Graceful degradation
    When a non-critical service is down
    Then core features should remain functional
    And users should see appropriate messages
```

---

## Test Sign-off Checklist

### Module Completion Criteria

| Module | Scenarios | Pass Criteria |
|--------|-----------|---------------|
| Authentication | 10 | 100% pass |
| Chatbot | 9 | 95% pass |
| Marketplace | 15 | 95% pass |
| Wallet | 12 | 100% pass |
| Loan Application | 14 | 100% pass |
| Back-office | 8 | 95% pass |
| Non-Functional | 10 | 100% pass |

### Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Tech Lead | | | |
| Business Analyst | | | |

---

*End of User Acceptance Criteria Document*
