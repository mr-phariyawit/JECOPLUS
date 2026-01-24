# 🎯 ตัวอย่างการใช้งานง่าย ๆ - Mockup Mode

## 1️⃣ Setup (ทำครั้งเดียว)

สร้างไฟล์ `.env.development`:

```env
VITE_MOCKUP_MODE=true
VITE_ENABLE_SCENARIO_SELECTOR=true
```

รัน:
```bash
npm run dev
```

**เสร็จแล้ว!** ระบบใช้ mock data อัตโนมัติ! 🎉

---

## 2️⃣ ใช้ใน Component

### ตัวอย่าง: แสดงรายการ Loans

```vue
<template>
  <div class="loans-page">
    <h1>สินเชื่อของฉัน</h1>

    <!-- Loading -->
    <div v-if="isLoading">กำลังโหลด...</div>

    <!-- Loans List -->
    <div v-else>
      <div v-for="loan in loans" :key="loan.loanId" class="loan-card">
        <h3>{{ loan.productName }}</h3>
        <p>ยอดคงเหลือ: {{ formatCurrency(loan.totalRemaining) }}</p>
        <p>งวด: {{ loan.paidInstallments }}/{{ loan.totalInstallments }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useLoansStore } from '@/stores/loans'

const loansStore = useLoansStore()

// Computed
const loans = computed(() => loansStore.loans)
const isLoading = computed(() => loansStore.isLoading)

// Load data
onMounted(async () => {
  await loansStore.fetchLoans()
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}
</script>
```

**นั่นแหละ!** ง่ายแค่นี้! ไม่ต้องห่วงว่าจะใช้ mockup หรือ API ✨

---

## 3️⃣ สลับ Scenario (Mockup Mode)

### ใน Browser Console:

```javascript
// ดู scenarios ทั้งหมด
import('@/services/dataService').then(ds => {
  console.log(ds.getAvailableScenarios())
})

// สลับเป็น "Perfect Borrower"
import('@/services/dataService').then(ds => {
  ds.switchScenario('PERFECT_BORROWER')
})

// สลับเป็น "Late Payer"
import('@/services/dataService').then(ds => {
  ds.switchScenario('OCCASIONAL_LATE')
})

// Reload page
location.reload()
```

### ใน Component (เพิ่ม Scenario Selector):

```vue
<template>
  <div>
    <!-- เพิ่ม Scenario Selector -->
    <ScenarioSelector v-if="showSelector" />

    <!-- เพิ่มปุ่มเปิด Selector -->
    <button @click="showSelector = true">
      🎭 Switch Scenario
    </button>

    <!-- Content ปกติ -->
    <YourContent />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const showSelector = ref(false)
</script>
```

---

## 4️⃣ ตัวอย่าง: หน้า Loan Detail

```vue
<template>
  <div class="loan-detail">
    <h1>รายละเอียดสินเชื่อ</h1>

    <div v-if="loan">
      <!-- Loan Info -->
      <div class="loan-info">
        <h2>{{ loan.productName }}</h2>
        <p>เงินต้น: {{ formatCurrency(loan.principalAmount) }}</p>
        <p>คงเหลือ: {{ formatCurrency(loan.totalRemaining) }}</p>
      </div>

      <!-- Payment Timeline -->
      <h2>ประวัติการชำระ</h2>
      <PaymentTimeline :installments="installments" />

      <!-- Late Fee (ถ้ามี) -->
      <div v-if="hasLateFees">
        <h2>ค่าปรับ</h2>
        <LateFeeBreakdown :installments="installments" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLoansStore } from '@/stores/loans'
import PaymentTimeline from '@/components/loans/PaymentTimeline.vue'
import LateFeeBreakdown from '@/components/loans/LateFeeBreakdown.vue'

const route = useRoute()
const loansStore = useLoansStore()

const loan = computed(() => loansStore.selectedLoan)
const installments = computed(() => loansStore.installments)

const hasLateFees = computed(() => {
  return installments.value.some(i => i.lateFee > 0)
})

onMounted(async () => {
  await loansStore.fetchLoanDetail(route.params.id)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}
</script>
```

---

## 5️⃣ ตัวอย่าง: หน้า Payment

```vue
<template>
  <div class="payment-page">
    <h1>ชำระเงิน</h1>

    <form @submit.prevent="handlePayment">
      <!-- Loan Selection -->
      <select v-model="selectedLoanId">
        <option v-for="loan in loans" :key="loan.loanId" :value="loan.loanId">
          {{ loan.productName }} - {{ formatCurrency(loan.monthlyPayment) }}
        </option>
      </select>

      <!-- Payment Method -->
      <select v-model="paymentMethod">
        <option value="JWALLET">J Wallet</option>
        <option value="CREDIT_CARD">บัตรเครดิต</option>
        <option value="BANK_ACCOUNT">บัญชีธนาคาร</option>
      </select>

      <!-- Submit -->
      <button type="submit" :disabled="isProcessing">
        {{ isProcessing ? 'กำลังชำระ...' : 'ยืนยันการชำระเงิน' }}
      </button>
    </form>

    <!-- Result -->
    <div v-if="result" :class="result.success ? 'success' : 'error'">
      {{ result.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLoansStore } from '@/stores/loans'
import * as dataService from '@/services/dataService'

const loansStore = useLoansStore()

const selectedLoanId = ref(null)
const paymentMethod = ref('JWALLET')
const isProcessing = ref(false)
const result = ref(null)

const loans = computed(() => loansStore.loans)

onMounted(async () => {
  await loansStore.fetchLoans()
  if (loans.value.length > 0) {
    selectedLoanId.value = loans.value[0].loanId
  }
})

const handlePayment = async () => {
  isProcessing.value = true
  result.value = null

  try {
    const loan = loans.value.find(l => l.loanId === selectedLoanId.value)

    const paymentData = {
      loanId: selectedLoanId.value,
      amount: loan.monthlyPayment,
      method: paymentMethod.value
    }

    const response = await dataService.makePayment(paymentData)
    result.value = response

    if (response.success) {
      // Reload loans
      await loansStore.fetchLoans()
    }
  } catch (error) {
    result.value = {
      success: false,
      message: 'เกิดข้อผิดพลาด: ' + error.message
    }
  } finally {
    isProcessing.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}
</script>
```

---

## 6️⃣ สลับไปใช้ API จริง

เมื่อพร้อม deploy จริง:

### แก้ .env.production:

```env
VITE_MOCKUP_MODE=false
VITE_API_BASE_URL=https://api.jecoplus.com
```

### Test ก่อน Deploy:

```bash
# Test แบบ API mode
VITE_MOCKUP_MODE=false npm run dev

# ถ้าทุกอย่างโอเค → Build
npm run build
```

**ไม่ต้องแก้โค้ดอะไรเลย!** แค่เปลี่ยน env variable! 🎉

---

## 📊 10 Scenarios ที่พร้อมใช้งาน

1. **PERFECT_BORROWER** ⭐ - ชำระตรงเวลา 100%
2. **EARLY_REPAYMENT** 🚀 - ชำระก่อนกำหนด
3. **OCCASIONAL_LATE** ⚠️ - ล่าช้าบางครั้ง
4. **STRUGGLING** 😰 - มีปัญหาทางการเงิน
5. **IN_COLLECTION** 📞 - ส่งเก็บหนี้
6. **FRAUD_FLAGGED** 🚨 - ตรวจพบฉ้อโกง
7. **MODIFIED_LOAN** 🔄 - ปรับโครงสร้างหนี้
8. **MULTI_LOAN** 📊 - หลายสินเชื่อ
9. **NEW_BORROWER** 🌱 - ผู้กู้ใหม่
10. **REJECTED** ❌ - ถูกปฏิเสธ

### สลับ Scenario:

```javascript
import * as dataService from '@/services/dataService'

// สลับ scenario
dataService.switchScenario('PERFECT_BORROWER')

// Reload
location.reload()
```

---

## ✅ Checklist

- [x] สร้าง `.env.development`
- [x] Set `VITE_MOCKUP_MODE=true`
- [x] Import `dataService` แทน `mockDataService`
- [x] ใช้ `await dataService.getUserLoans()` etc.
- [ ] เพิ่ม `<ScenarioSelector />` ถ้าต้องการ
- [ ] Test ทุก scenarios
- [ ] พร้อม deploy → เปลี่ยน `.env.production`

---

**เสร็จแล้ว! ง่ายมาก!** 🎉

Need more help? อ่าน [env_setup.md](env_setup.md)
