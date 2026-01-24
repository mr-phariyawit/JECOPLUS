# 📋 Scenario Testing Guide

คู่มือการทดสอบระบบ Mock Data Scenarios ทั้ง 10 แบบ

## 🎯 ภาพรวม

ระบบ Mock Data Scenarios มีทั้งหมด **10 User Personas** แต่ละแบบออกแบบมาเพื่อจำลองสถานการณ์จริงที่แตกต่างกัน ครอบคลุมตั้งแต่ผู้กู้ที่สมบูรณ์แบบไปจนถึงกรณีที่มีปัญหาร้ายแรง

## 🔧 การเตรียมพร้อม

### 1. เริ่มต้นใช้งาน

```javascript
// ใน main.js หรือ App.vue
import { useScenarioStore } from '@/stores/scenario'

const scenarioStore = useScenarioStore()

// ดูรายชื่อ scenarios ทั้งหมด
console.log(scenarioStore.availableScenarios)

// ดู scenario ปัจจุบัน
console.log(scenarioStore.currentScenarioId)
```

### 2. เปิด Browser DevTools

- Chrome: `Cmd+Option+I` (Mac) หรือ `F12` (Windows)
- เปิดแท็บ **Console** เพื่อดู log messages
- เปิดแท็บ **Application > Local Storage** เพื่อดู stored data

---

## 🧪 Testing Scenarios แต่ละแบบ

### Scenario 1: Perfect Borrower (⭐)

**Profile:**
- ชื่อ: ทดลอง สมบูรณ์
- Credit Score: 820 (Excellent)
- สินเชื่อ: 2 รายการ
- Payment History: 100% on-time

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('PERFECT_BORROWER')
   ```

2. **ตรวจสอบ User Profile:**
   - ✅ Credit Score แสดง 820
   - ✅ Credit Rating แสดง "EXCELLENT"
   - ✅ Monthly Income: 50,000 บาท

3. **ตรวจสอบ Loans:**
   ```javascript
   import { useLoansStore } from '@/stores/loans'
   const loansStore = useLoansStore()
   await loansStore.fetchLoans()

   console.log(loansStore.loans)
   // Expected: 2 loans
   // - Personal Loan: 200,000 บาท
   // - Phone Loan: 30,000 บาท
   ```

4. **ตรวจสอบ Payment History:**
   - ✅ ทุกงวดชำระตรงเวลา
   - ✅ `isPaidOnTime: true` ทุกงวด
   - ✅ `daysLate: 0` ทุกงวด
   - ✅ `lateFee: 0` ทุกงวด

5. **ตรวจสอบ Payment Timeline:**
   - ใช้ `<PaymentTimeline :installments="installments" />`
   - ✅ ทุก dot เป็นสีเขียว (success)
   - ✅ Statistics แสดง on-time = 18, late = 0

6. **ตรวจสอบ Late Fee Breakdown:**
   - ใช้ `<LateFeeBreakdown :installments="installments" />`
   - ✅ แสดงข้อความ "ไม่มีค่าปรับ - ชำระตรงเวลาทุกงวด"

---

### Scenario 2: Early Repayment Champion (🚀)

**Profile:**
- ชื่อ: วิทย์ รวดเร็ว
- Credit Score: 785
- สินเชื่อ: 1 ชำระก่อนกำหนดแล้ว, 1 active
- Savings: 8,450 บาท

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('EARLY_REPAYMENT')
   ```

2. **ตรวจสอบ Closed Loan:**
   ```javascript
   const closedLoan = loansStore.loans.find(l => l.status === 'PAID_OFF')

   console.log('Early Repayment Info:', {
     closedDate: closedLoan.closedDate,
     paidInstallments: closedLoan.paidInstallments,
     totalInstallments: closedLoan.totalInstallments
   })

   // Expected: Paid 6/12 installments, closed early
   ```

3. **ตรวจสอบ Early Repayment Calculator:**
   - ใช้ `<EarlyRepaymentCalculator :loan="activeLoan" />`
   - ✅ แสดงส่วนลดดอกเบี้ย 30%
   - ✅ แสดงจำนวนเงินที่ประหยัดได้
   - ✅ Comparison table ถูกต้อง

4. **ตรวจสอบ Savings:**
   ```javascript
   // ดูจาก event logs
   const earlyRepaymentEvent = scenarioStore.currentScenario.auditLog
     .find(e => e.eventType === 'EARLY_REPAYMENT')

   console.log('Savings:', earlyRepaymentEvent.metadata.savings)
   // Expected: 8,450 บาท
   ```

---

### Scenario 3: Occasional Late Payer (⚠️)

**Profile:**
- ชื่อ: สมชาย ล่าช้า
- Credit Score: 650 (Fair)
- Late Payments: 4 ครั้งใน 14 เดือน
- Total Late Fees: 2,200 บาท

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('OCCASIONAL_LATE')
   ```

2. **ตรวจสอบ Late Payments:**
   ```javascript
   const lateInstallments = installments.value.filter(i => !i.isPaidOnTime && i.status === 'PAID')

   console.log('Late Payments:', lateInstallments.length)
   // Expected: 4 late payments

   lateInstallments.forEach(inst => {
     console.log(`งวด ${inst.installmentNo}: ล่าช้า ${inst.daysLate} วัน, ค่าปรับ ${inst.lateFee} บาท`)
   })
   ```

3. **ตรวจสอบ Late Fee Calculation:**
   - ใช้ `<LateFeeBreakdown :installments="installments" />`
   - ✅ แสดงรายการงวดที่มีค่าปรับ
   - ✅ แสดงการคำนวณ: 200฿ × จำนวนวัน
   - ✅ แสดง total late fees: 2,200 บาท

4. **ตรวจสอบ Grace Period:**
   ```javascript
   const graceInstallments = installments.value.filter(i => i.daysLate > 0 && i.daysLate <= 5)

   graceInstallments.forEach(inst => {
     // ✅ ต้องไม่มีค่าปรับถ้า daysLate <= 5
     console.assert(inst.lateFee === 0, 'Grace period should have no late fee')
   })
   ```

5. **ตรวจสอบ Current Overdue:**
   ```javascript
   const currentLoan = loansStore.selectedLoan
   console.log('Days Overdue:', currentLoan.daysOverdue)
   // Expected: 5 วัน (ยังไม่ถึง 6 วันจึงไม่มีค่าปรับเพิ่ม)
   ```

---

### Scenario 4: Financially Struggling (😰)

**Profile:**
- ชื่อ: นางสาว ลำบาก
- Credit Score: 580 (Poor)
- Overdue: 45 วัน (loan 1), 10 วัน (loan 2)
- Total Late Fees: 3,000+ บาท

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('STRUGGLING')
   ```

2. **ตรวจสอบ Multiple Overdue Loans:**
   ```javascript
   const overdueLoans = loansStore.loans.filter(l => l.daysOverdue > 0)

   console.log('Overdue Loans:', overdueLoans.length)
   // Expected: 2 loans

   overdueLoans.forEach(loan => {
     console.log(`${loan.productName}: ${loan.daysOverdue} days, Status: ${loan.status}`)
   })
   ```

3. **ตรวจสอบ Partial Payments:**
   ```javascript
   const partialPayments = installments.value.filter(i => i.status === 'PARTIALLY_PAID')

   console.log('Partial Payments:', partialPayments.length)
   // Expected: 2 partial payments

   partialPayments.forEach(inst => {
     console.log(`งวด ${inst.installmentNo}: ชำระ ${inst.paidAmount}/${inst.totalAmount}`)
   })
   ```

4. **ตรวจสอบ Late Fee Cap:**
   ```javascript
   const highLateFees = installments.value.filter(i => i.lateFee >= 1000)

   highLateFees.forEach(inst => {
     // ✅ ค่าปรับต้องไม่เกิน 1,000 บาท (5x cap)
     console.assert(inst.lateFee <= 1000, 'Late fee should be capped at 1000')
   })
   ```

5. **ตรวจสอบ Payment Timeline:**
   - ใช้ `<PaymentTimeline :installments="installments" />`
   - ✅ มี dots หลายสี (success, late, partial, overdue)
   - ✅ Overdue dots มี animation pulse

---

### Scenario 5: Debt in Collections (📞)

**Profile:**
- ชื่อ: ประยุทธ์ ค้างชำระ
- Credit Score: 420 (Very Poor)
- Overdue: 105+ วัน
- Status: SUSPENDED
- Collection Date: 15 ธ.ค. 2024

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('IN_COLLECTION')
   ```

2. **ตรวจสอบ Account Status:**
   ```javascript
   const loan = loansStore.loans[0]

   console.log('Account Status:', loan.accountStatus)
   // Expected: SUSPENDED

   console.log('Suspension Reason:', loan.suspensionReason)
   // Expected: "OVERDUE_90_DAYS"
   ```

3. **ตรวจสอบ Collection Event:**
   ```javascript
   const collectionEvents = scenarioStore.currentScenario.auditLog
     .filter(e => e.eventCategory === 'COLLECTION')

   console.log('Collection Events:', collectionEvents.length)
   // Expected: มีอย่างน้อย 1 event

   collectionEvents.forEach(event => {
     console.log(event.description)
   })
   ```

4. **ตรวจสอบ Total Outstanding:**
   ```javascript
   const totalOutstanding = loan.remainingPrincipal +
                           loan.remainingInterest +
                           (loan.totalLateFees - loan.totalFeesPaid)

   console.log('Total Outstanding:', totalOutstanding)
   // Expected: 285,000+ บาท
   ```

5. **ตรวจสอบ Restrictions:**
   - ✅ ไม่สามารถทำรายการใหม่ได้
   - ✅ แสดง warning message
   - ✅ แสดง collection contact info

---

### Scenario 6: Fraud Detection Flagged (🚨)

**Profile:**
- ชื่อ: วิภา ผิดปกติ
- Credit Score: 540 (suspended)
- Status: FROZEN
- Fraud Flags: 3 รายการ

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('FRAUD_FLAGGED')
   ```

2. **ตรวจสอบ Fraud Flags:**
   ```javascript
   const user = scenarioStore.currentScenario.user

   console.log('Fraud Flags:', user.fraudFlags)
   // Expected: Array with 3 flags

   user.fraudFlags.forEach(flag => {
     console.log(`${flag.type}: ${flag.description}`)
   })
   ```

3. **ตรวจสอบ Account Frozen:**
   ```javascript
   const loan = loansStore.loans[0]

   console.log('Account Status:', loan.accountStatus)
   // Expected: FROZEN
   ```

4. **ตรวจสอบ Payment Reversals:**
   ```javascript
   const transactions = scenarioStore.currentScenario.transactions
   const reversals = transactions.filter(t => t.isReversed)

   console.log('Reversed Transactions:', reversals.length)
   // Expected: 3 reversals
   ```

5. **ตรวจสอบ Security Events:**
   ```javascript
   const securityEvents = scenarioStore.currentScenario.auditLog
     .filter(e => e.eventCategory === 'SECURITY')

   console.log('Security Events:', securityEvents)
   // Expected: Login from multiple countries, KYC mismatch, etc.
   ```

---

### Scenario 7: Loan Modification Success (🔄)

**Profile:**
- ชื่อ: สุดา ปรับปรุง
- Credit Score: 670 (Fair to Good)
- Modified: ส.ค. 2024
- Terms: 36→48 months, 18%→16%

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('MODIFIED_LOAN')
   ```

2. **ตรวจสอบ Modification Details:**
   ```javascript
   const loan = loansStore.loans[0]

   console.log('Is Modified:', loan.isModified)
   // Expected: true

   console.log('Original Terms:', {
     term: 36,
     rate: 18,
     monthly: loan.originalMonthlyPayment
   })

   console.log('Current Terms:', {
     term: loan.currentTerm,
     rate: loan.interestRate,
     monthly: loan.monthlyPayment
   })
   ```

3. **ตรวจสอบ Before/After Payment History:**
   ```javascript
   const modificationDate = new Date(loan.modificationDate)

   const beforeMod = installments.value.filter(i =>
     new Date(i.dueDate) < modificationDate
   )
   const afterMod = installments.value.filter(i =>
     new Date(i.dueDate) >= modificationDate
   )

   console.log('Before Modification:', {
     total: beforeMod.length,
     late: beforeMod.filter(i => !i.isPaidOnTime).length
   })

   console.log('After Modification:', {
     total: afterMod.length,
     late: afterMod.filter(i => !i.isPaidOnTime).length
   })
   // Expected: 0 late payments after modification
   ```

4. **ตรวจสอบ ModificationProposal Component:**
   - ใช้ `<ModificationProposal :original="..." :proposed="..." />`
   - ✅ แสดง comparison ก่อน/หลัง
   - ✅ แสดง monthly payment reduction
   - ✅ แสดง timeline
   - ✅ แสดง benefits & considerations

---

### Scenario 8: Multiple Active Loans (📊)

**Profile:**
- ชื่อ: ชาย พอร์ตโฟลิโอ
- Credit Score: 740 (Good)
- Active Loans: 4 รายการ
- Monthly Payment: 68,500 บาท

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('MULTI_LOAN')
   ```

2. **ตรวจสอบ Multiple Loans:**
   ```javascript
   const activeLoans = loansStore.loans.filter(l => l.status === 'ACTIVE')

   console.log('Active Loans:', activeLoans.length)
   // Expected: 4 loans

   activeLoans.forEach(loan => {
     console.log(`${loan.productName}: ${loan.monthlyPayment} บาท/เดือน`)
   })
   ```

3. **ตรวจสอบ Total Monthly Payment:**
   ```javascript
   const totalMonthly = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)

   console.log('Total Monthly:', totalMonthly)
   // Expected: 68,500 บาท
   ```

4. **ตรวจสอบ Payment Success Rate:**
   ```javascript
   let totalInstallments = 0
   let onTimeInstallments = 0

   activeLoans.forEach(loan => {
     const loanInst = mockDataService.getInstallments(loan.loanId)
     const paid = loanInst.filter(i => i.status === 'PAID')
     totalInstallments += paid.length
     onTimeInstallments += paid.filter(i => i.isPaidOnTime).length
   })

   const successRate = (onTimeInstallments / totalInstallments) * 100
   console.log('Payment Success Rate:', successRate.toFixed(1) + '%')
   // Expected: 98%
   ```

5. **ตรวจสอบ Portfolio View:**
   - ✅ แสดงสินเชื่อทั้ง 4 รายการ
   - ✅ แสดง total debt ratio
   - ✅ แสดง consolidated payment schedule

---

### Scenario 9: New Borrower (🌱)

**Profile:**
- ชื่อ: น้อง มือใหม่
- Credit Score: 680 (new borrower bonus)
- Loan Age: 2 เดือน
- Payment History: 2/2 on-time

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('NEW_BORROWER')
   ```

2. **ตรวจสอบ New Borrower Status:**
   ```javascript
   const loan = loansStore.loans[0]

   console.log('Loan Age:', {
     disbursement: loan.disbursementDate,
     age: Math.floor((new Date() - new Date(loan.disbursementDate)) / (1000*60*60*24*30))
   })
   // Expected: 2 months old
   ```

3. **ตรวจสอบ Limited History:**
   ```javascript
   const paidInstallments = installments.value.filter(i => i.status === 'PAID')

   console.log('Paid Installments:', paidInstallments.length)
   // Expected: 2

   console.log('All On-Time:', paidInstallments.every(i => i.isPaidOnTime))
   // Expected: true
   ```

4. **ตรวจสอบ Credit Building:**
   - ✅ แสดง "First-time borrower" badge
   - ✅ แสดง credit building tips
   - ✅ แสดง payment reminders

---

### Scenario 10: Loan Rejection Case (❌)

**Profile:**
- ชื่อ: สมหมาย ปฏิเสธ
- Credit Score: 520 (Poor)
- Applications: 3 ปฏิเสธ
- Rejection Reasons: รายได้ต่ำ, expense ratio สูง, รายได้ไม่แน่นอน

**การทดสอบ:**

1. **Switch to Scenario:**
   ```javascript
   await scenarioStore.switchScenario('REJECTED')
   ```

2. **ตรวจสอบ No Active Loans:**
   ```javascript
   const activeLoans = loansStore.loans.filter(l => l.status === 'ACTIVE')

   console.log('Active Loans:', activeLoans.length)
   // Expected: 0
   ```

3. **ตรวจสอบ Rejection History:**
   ```javascript
   const rejectedLoans = loansStore.loans.filter(l => l.status === 'REJECTED')

   console.log('Rejected Applications:', rejectedLoans.length)
   // Expected: 3

   rejectedLoans.forEach(loan => {
     console.log(`${loan.applicationDate}: ${loan.rejectionReason}`)
   })
   ```

4. **ตรวจสอบ Rejection Reasons:**
   ```javascript
   const reasons = rejectedLoans.map(l => l.rejectionReason)
   console.log('Rejection Reasons:', reasons)
   // Expected:
   // 1. "รายได้ต่ำกว่าเกณฑ์ขั้นต่ำ (18,000 บาท)"
   // 2. "Expense ratio สูงเกินไป (85%)"
   // 3. "รายได้ไม่สม่ำเสมอ"
   ```

5. **ตรวจสอบ Improvement Roadmap:**
   - ✅ แสดงเหตุผลการปฏิเสธแต่ละครั้ง
   - ✅ แสดงคำแนะนำในการปรับปรุง
   - ✅ แสดงทางเลือกอื่น (alternative options)

---

## ✅ Validation Tests

### Financial Accuracy Validation

```javascript
import * as mockDataService from '@/services/mockDataService'

// Test ทุก scenario
const scenarios = mockDataService.getAvailableScenarios()

scenarios.forEach(scenario => {
  console.log(`\n🔍 Validating ${scenario.name}...`)

  const data = mockDataService.getScenarioData(scenario.id)

  // 1. Validate loan totals
  data.loans.forEach(loan => {
    const calculatedTotal = loan.remainingPrincipal + loan.remainingInterest
    const diff = Math.abs(calculatedTotal - loan.totalRemaining)

    console.assert(diff < 1, `Total mismatch for ${loan.loanId}: ${diff}`)
  })

  // 2. Validate installment totals
  data.loans.forEach(loan => {
    const installments = mockDataService.getInstallments(loan.loanId)
    const paidInstallments = installments.filter(i => i.status === 'PAID')

    const sumPaid = paidInstallments.reduce((sum, i) => sum + i.paidAmount, 0)
    const diff = Math.abs(sumPaid - loan.totalPaid)

    console.assert(diff < 1, `Paid total mismatch for ${loan.loanId}: ${diff}`)
  })

  // 3. Validate late fees
  data.loans.forEach(loan => {
    const installments = mockDataService.getInstallments(loan.loanId)
    const totalLateFees = installments.reduce((sum, i) => sum + (i.lateFee || 0), 0)

    console.assert(totalLateFees >= 0, `Invalid late fees for ${loan.loanId}`)
  })

  console.log(`✅ ${scenario.name} validated successfully`)
})
```

### Date Consistency Validation

```javascript
function validateDates(loan) {
  const dates = {
    application: new Date(loan.applicationDate),
    approval: new Date(loan.approvalDate),
    disbursement: new Date(loan.disbursementDate)
  }

  // Application → Approval → Disbursement
  console.assert(dates.approval >= dates.application, 'Approval before application')
  console.assert(dates.disbursement >= dates.approval, 'Disbursement before approval')

  // Installment dates sequential
  const installments = mockDataService.getInstallments(loan.loanId)
  for (let i = 1; i < installments.length; i++) {
    const prev = new Date(installments[i-1].dueDate)
    const curr = new Date(installments[i].dueDate)
    const daysDiff = (curr - prev) / (1000*60*60*24)

    console.assert(daysDiff >= 25 && daysDiff <= 35,
      `Installment date gap invalid: ${daysDiff} days`)
  }
}
```

---

## 🎨 UI Component Testing

### ScenarioSelector Component

```vue
<template>
  <div>
    <ScenarioSelector />

    <!-- Test display -->
    <div class="test-info">
      <p>Current: {{ scenarioStore.currentScenarioId }}</p>
      <p>Name: {{ scenarioStore.currentName }}</p>
      <p>Icon: {{ scenarioStore.currentIcon }}</p>
    </div>
  </div>
</template>

<script setup>
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'
import { useScenarioStore } from '@/stores/scenario'

const scenarioStore = useScenarioStore()
</script>
```

**Test Cases:**
- ✅ Click ปุ่ม → Modal เปิด
- ✅ แสดง scenarios ครบ 10 แบบ
- ✅ Active scenario มี checkmark
- ✅ Click scenario → สลับสำเร็จ
- ✅ Click Reset → กลับเป็น DEFAULT
- ✅ Click overlay → Modal ปิด

### ScenarioBanner Component

```vue
<template>
  <div>
    <ScenarioBanner @switch="showSelector = true" @reset="handleReset" />
    <ScenarioSelector v-if="showSelector" />
  </div>
</template>
```

**Test Cases:**
- ✅ Banner แสดงเฉพาะเมื่อ scenario !== DEFAULT
- ✅ Banner สี gradient ตรงกับ scenario color
- ✅ Click Switch → เปิด selector
- ✅ Click Reset → กลับเป็น DEFAULT + banner หาย
- ✅ Sticky positioning ทำงาน

---

## 🐛 Common Issues & Solutions

### Issue 1: Scenario ไม่เปลี่ยน

**สาเหตุ:**
- localStorage ไม่ sync
- Event listener ไม่ทำงาน

**วิธีแก้:**
```javascript
// ลบ cache ทั้งหมด
localStorage.clear()

// Reload page
window.location.reload()
```

### Issue 2: ข้อมูลไม่ตรงกัน

**สาเหตุ:**
- Cache เก่ายังค้างอยู่

**วิธีแก้:**
```javascript
import * as mockDataService from '@/services/mockDataService'

// Clear all caches
mockDataService.clearCaches()

// Reload scenario
await scenarioStore.switchScenario(scenarioStore.currentScenarioId)
```

### Issue 3: Late Fee คำนวณไม่ถูกต้อง

**วิธีตรวจสอบ:**
```javascript
import { calculateLateFee } from '@/services/scenarios/businessLogic'

const installment = {
  dueDate: '2024-11-01',
  gracePeriodEndDate: '2024-11-06'
}

const fee = calculateLateFee(installment, '2024-11-15')
console.log('Late Fee:', fee)
// Expected: 200 * 9 = 1,800 บาท (but capped at 1,000)
```

---

## 📊 Performance Testing

### Scenario Switch Time

```javascript
async function measureSwitchTime(scenarioId) {
  const start = performance.now()

  await scenarioStore.switchScenario(scenarioId)
  await loansStore.fetchLoans()

  const end = performance.now()
  console.log(`Switch time: ${(end - start).toFixed(2)}ms`)
}

// Test all scenarios
const scenarios = scenarioStore.availableScenarios
for (const scenario of scenarios) {
  await measureSwitchTime(scenario.id)
}
```

**Expected Performance:**
- Scenario switch: < 100ms
- Data load: < 500ms
- Total time: < 1 second

---

## ✨ Best Practices

1. **Always Clear Cache เมื่อสลับ scenario**
   ```javascript
   mockDataService.clearCaches()
   ```

2. **ใช้ Event Listener สำหรับ Auto-refresh**
   ```javascript
   window.addEventListener('scenario:changed', () => {
     // Refresh your data
   })
   ```

3. **ตรวจสอบ Data Integrity**
   ```javascript
   console.assert(condition, message)
   ```

4. **Log Important Events**
   ```javascript
   console.log('🎭 Scenario switched:', scenarioId)
   console.log('💰 Loan loaded:', loanId)
   ```

5. **Test ใน Different Browsers**
   - Chrome, Firefox, Safari
   - Mobile browsers (iOS Safari, Android Chrome)

---

## 📝 Test Checklist

### สำหรับแต่ละ Scenario:

- [ ] Switch scenario สำเร็จ
- [ ] User profile ถูกต้อง
- [ ] Loans โหลดครบ
- [ ] Installments ถูกต้อง
- [ ] Transactions ครบถ้วน
- [ ] Late fees คำนวณถูก
- [ ] Payment timeline แสดงถูก
- [ ] Components ทำงาน
- [ ] Event listeners ทำงาน
- [ ] localStorage sync ถูกต้อง

### สำหรับระบบโดยรวม:

- [ ] ทุก scenario load ได้
- [ ] Scenario switching ทำงาน
- [ ] Reset to default ทำงาน
- [ ] Data validation ผ่าน
- [ ] UI responsive
- [ ] Performance ดี
- [ ] No console errors
- [ ] Browser compatibility

---

## 🎓 Training Scenarios

### Scenario สำหรับฝึกทีมงาน:

1. **Happy Path**: PERFECT_BORROWER → EARLY_REPAYMENT
2. **Problem Handling**: OCCASIONAL_LATE → STRUGGLING
3. **Crisis Management**: IN_COLLECTION → FRAUD_FLAGGED
4. **Recovery Path**: MODIFIED_LOAN
5. **New User Onboarding**: NEW_BORROWER
6. **Rejection Handling**: REJECTED

---

**สรุป:** ระบบ testing ครอบคลุมทั้ง functional testing, validation testing, UI testing, และ performance testing เพื่อให้มั่นใจว่าทุก scenario ทำงานได้อย่างสมบูรณ์และสมจริง! ✅
