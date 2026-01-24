# 🎭 10 User Scenarios for Interactive Mockup

These scenarios demonstrate the full capabilities of the JECOPLUS platform, covering all 5 pillars: Wallet, Loans, Marketplace, AI, and Admin.

> **Goal**: Achieve "10x Realism" in interactive demos.
> **Technique**: Use `DEMO_MODE` to inject rich, realistic data and enabling smooth navigation flows.

---

## 👤 Consumer Scenarios

### 1. The "First Timer" (Onboarding & KYC)
**Scenario**: User signs up, verifies identity via KYC, and gets approved instantly.
- **Interact**: Signup Form → OTP (Auto-fill) → ID Card Upload (drag & drop) → Selfie → Liveness → Success.
- **10x Polish**: Real-time progress bar, smooth camera transitions, "Scanning..." animation, instant "Verified" badge.

### 2. The "Digital Saver" (Cash In & Wallet)
**Scenario**: User tops up wallet via QR code to reach a savings goal.
- **Interact**: Wallet Home → Top Up → Generate QR → Simulate "Payment Received" toast.
- **10x Polish**: Confetti animation on success, balance count-up animation (`฿0` -> `฿100.00`).

### 3. The "Smart Shopper" (Marketplace)
**Scenario**: User buys an iPhone 16 Pro Max using wallet balance.
- **Interact**: Marketplace → Search "iPhone" → Filter "In Stock" → Add to Cart → Checkout → Pay.
- **10x Polish**: Flying "Add to Cart" animation, skeleton loaders for images, smooth slide-over cart drawer.

### 4. The "Financial Planner" (AI Money Coach)
**Scenario**: User asks AI for budget advice and gets a visual breakdown.
- **Interact**: AI Chat → "Analyze my spending" → AI generates chart → "How to save more?" → Recommendation card.
- **10x Polish**: Streaming text response (typing effect), interactive charts (Chart.js) appearing in chat stream.

### 5. The "Dream Chaser" (Loan Application)
**Scenario**: User checks credit score and applies for a personal loan.
- **Interact**: Loan Tab → "Check Score" → Speedometer animation → "Apply Now" → Slider (Amount/Term) → Submit.
- **10x Polish**: Animated gauge for credit score (750+ green glow), interactive slider for loan calculator.

### 6. The "Emergency Need" (Fast Cash)
**Scenario**: User requests instant micro-loan and withdraws to bank.
- **Interact**: "Flash Loan" button → 1-Click Apply → Instant Approval (>1s) → Withdraw → Bank transfer success.
- **10x Polish**: "Processing..." pulse effect, satisfying "Money Sent" checkmark animation.

### 7. The "Data Analyst" (Statement Analysis)
**Scenario**: User uploads bank statement to boost credit score.
- **Interact**: Credit Score → "Boost Score" → Upload PDF → AI Extraction Table → Score updates (+20 pts).
- **10x Polish**: File upload progress ring, row-by-row scanning effect, score number jumping up.

### 8. The "Returning Payer" (Repayment)
**Scenario**: User pays a loan installment early.
- **Interact**: My Loans → Select Active Loan → "Pay Installment" → Confirm → Success.
- **10x Polish**: Loan progress bar fills up, "Safe & Secure" shield animation.

---

## 👮‍♂️ Admin & Operations Scenarios

### 9. The "Risk Officer" (Loan Review)
**Scenario**: Admin reviews a high-risk loan application and overrides the decision.
- **Interact**: Admin Dashboard → Loan Queue → Click "Pending" → View Credit Report → Adjust Amount → Approve.
- **10x Polish**: Detailed credit factor spider-chart, "Decision Submitted" stamp animation.

### 10. The "Security Guard" (KYC Audit)
**Scenario**: Admin flags a suspicious ID card.
- **Interact**: KYC Queue → View "Flagged" → Zoom ID Image → Reject with Reason "Blurry Image".
- **10x Polish**: Magnifying glass hover effect on ID card, red "REJECTED" stamp overlay.
