# 🔧 Integration Example

คู่มือการใช้งานระบบ Scenario System แบบครบวงจร

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Scenario Selector Integration](#scenario-selector-integration)
3. [Loan Detail Page Integration](#loan-detail-page-integration)
4. [Dashboard Integration](#dashboard-integration)
5. [Complete Page Example](#complete-page-example)
6. [Advanced Usage](#advanced-usage)

---

## Quick Start

### 1. ติดตั้ง Scenario System

```bash
# ไม่ต้องติดตั้งอะไรเพิ่ม - ทุกอย่างพร้อมใช้งานแล้ว!
# Scenarios จะ auto-initialize เมื่อ app start

npm run dev
```

### 2. ตรวจสอบว่าระบบทำงาน

```javascript
// ใน Browser Console
import * as mockDataService from '@/services/mockDataService'

// ดู scenarios ทั้งหมด
console.log(mockDataService.getAvailableScenarios())

// ดู scenario ปัจจุบัน
console.log(mockDataService.getCurrentScenarioId())

// สลับ scenario
mockDataService.switchScenario('PERFECT_BORROWER')
```

---

## Scenario Selector Integration

### วิธีที่ 1: ใช้ใน Layout (แนะนำ)

เพิ่ม ScenarioSelector และ ScenarioBanner ใน main layout เพื่อให้ใช้งานได้ทุกหน้า

```vue
<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <!-- Scenario Banner (แสดงเฉพาะเมื่อไม่ใช่ DEFAULT) -->
    <ScenarioBanner @switch="showSelector = true" @reset="handleReset" />

    <!-- App Header -->
    <AppHeader>
      <!-- เพิ่มปุ่มสลับ scenario -->
      <template #actions>
        <button class="scenario-btn" @click="showSelector = true">
          {{ scenarioStore.currentIcon }} {{ scenarioStore.currentName }}
        </button>
      </template>
    </AppHeader>

    <!-- Main Content -->
    <main class="content">
      <router-view />
    </main>

    <!-- Scenario Selector Modal -->
    <ScenarioSelector v-if="showSelector" @close="showSelector = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import ScenarioBanner from '@/components/scenarios/ScenarioBanner.vue'
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const scenarioStore = useScenarioStore()
const showSelector = ref(false)

const handleReset = () => {
  console.log('Scenario reset to DEFAULT')
  showSelector.value = false
}
</script>

<style scoped>
.scenario-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
```

### วิธีที่ 2: ใช้ในหน้าเฉพาะ

```vue
<!-- src/views/DemoPage.vue -->
<template>
  <div class="demo-page">
    <h1>Demo Scenarios</h1>

    <!-- Scenario Selector -->
    <div class="scenario-controls">
      <ScenarioSelector />

      <!-- Current Scenario Info -->
      <div class="current-info">
        <p>Current: {{ scenarioStore.currentName }}</p>
        <p>Credit Score: {{ scenarioStats.creditScore }}</p>
        <p>Active Loans: {{ scenarioStats.activeLoans }}</p>
      </div>
    </div>

    <!-- Content based on scenario -->
    <div class="content">
      <!-- Your content here -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const scenarioStore = useScenarioStore()

const scenarioStats = computed(() => scenarioStore.scenarioStats)
</script>
```

---

## Loan Detail Page Integration

### Complete Loan Detail Page

```vue
<!-- src/views/LoanDetailPage.vue -->
<template>
  <div class="loan-detail-page">
    <!-- Scenario Banner -->
    <ScenarioBanner v-if="isInScenarioMode" />

    <!-- Loading State -->
    <div v-if="loansStore.isLoading" class="loading">
      <span class="spinner"></span>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Loan Content -->
    <div v-else-if="loan" class="loan-content">
      <!-- Header Section -->
      <div class="loan-header">
        <div class="loan-info">
          <h1>{{ loan.productName }}</h1>
          <div class="loan-id">Loan ID: {{ loan.loanId }}</div>
          <div class="loan-status" :class="`status-${loan.status.toLowerCase()}`">
            {{ getStatusText(loan.status) }}
          </div>
        </div>

        <div class="loan-summary">
          <div class="summary-item">
            <span class="label">ยอดคงเหลือ</span>
            <span class="value">{{ formatCurrency(loan.totalRemaining) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">ชำระแล้ว</span>
            <span class="value">{{ loan.paidInstallments }}/{{ loan.totalInstallments }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Timeline -->
      <section class="section">
        <h2>ประวัติการชำระเงิน</h2>
        <PaymentTimeline :installments="installments" />
      </section>

      <!-- Late Fee Breakdown (แสดงเฉพาะเมื่อมีค่าปรับ) -->
      <section v-if="hasLateFees" class="section">
        <h2>รายละเอียดค่าปรับ</h2>
        <LateFeeBreakdown :installments="installments" />
      </section>

      <!-- Early Repayment Calculator (แสดงเฉพาะเมื่อ ACTIVE) -->
      <section v-if="canEarlyRepay" class="section">
        <h2>คำนวณชำระก่อนกำหนด</h2>
        <EarlyRepaymentCalculator :loan="loan" @proceed="handleEarlyRepayment" />
      </section>

      <!-- Modification Proposal (แสดงเฉพาะเมื่อ isModified) -->
      <section v-if="loan.isModified" class="section">
        <h2>ประวัติการปรับโครงสร้าง</h2>
        <ModificationProposal
          :original="modificationOriginal"
          :proposed="modificationProposed"
          :modificationReason="loan.modificationReason"
          :modificationDate="loan.modificationDate"
          :originalStartDate="loan.disbursementDate"
        />
      </section>

      <!-- Installments Table -->
      <section class="section">
        <h2>รายการงวดชำระ</h2>
        <InstallmentsTable :installments="installments" />
      </section>
    </div>

    <!-- Error State -->
    <div v-else class="error">
      <p>ไม่พบข้อมูลสินเชื่อ</p>
      <button @click="$router.push('/loans')">กลับหน้าหลัก</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '@/stores/loans'
import { useScenarioStore } from '@/stores/scenario'

import ScenarioBanner from '@/components/scenarios/ScenarioBanner.vue'
import PaymentTimeline from '@/components/loans/PaymentTimeline.vue'
import LateFeeBreakdown from '@/components/loans/LateFeeBreakdown.vue'
import EarlyRepaymentCalculator from '@/components/loans/EarlyRepaymentCalculator.vue'
import ModificationProposal from '@/components/loans/ModificationProposal.vue'

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()
const scenarioStore = useScenarioStore()

const loanId = computed(() => route.params.id)

// Computed
const loan = computed(() => loansStore.selectedLoan)
const installments = computed(() => loansStore.installments)

const isInScenarioMode = computed(() => scenarioStore.currentScenarioId !== 'DEFAULT')

const hasLateFees = computed(() => {
  return installments.value.some((i) => (i.lateFee || 0) > 0)
})

const canEarlyRepay = computed(() => {
  return loan.value?.status === 'ACTIVE' && loan.value?.remainingPrincipal > 0
})

const modificationOriginal = computed(() => {
  if (!loan.value?.isModified) return null

  return {
    termMonths: 36, // จาก loan history
    interestRate: 18,
    monthlyPayment: loan.value.originalMonthlyPayment,
    totalAmount: loan.value.principalAmount * 1.3, // estimate
  }
})

const modificationProposed = computed(() => {
  if (!loan.value?.isModified) return null

  return {
    termMonths: loan.value.currentTerm,
    interestRate: loan.value.interestRate,
    monthlyPayment: loan.value.monthlyPayment,
    totalAmount: loan.value.totalRemaining + loan.value.totalPaid,
    maturityDate: loan.value.maturityDate,
  }
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusText = (status) => {
  const statusMap = {
    ACTIVE: 'ใช้งานอยู่',
    PAID_OFF: 'ชำระครบแล้ว',
    OVERDUE: 'เกินกำหนด',
    SUSPENDED: 'ระงับ',
    FROZEN: 'อายัด',
  }
  return statusMap[status] || status
}

const handleEarlyRepayment = (calculation) => {
  console.log('Early repayment:', calculation)
  // Navigate to payment page
  router.push({
    name: 'payment',
    query: {
      loanId: loan.value.loanId,
      amount: calculation.totalAmount,
      type: 'early_repayment',
    },
  })
}

// Lifecycle
onMounted(async () => {
  await loansStore.fetchLoanDetail(loanId.value)
})

// Watch for scenario changes
watch(
  () => scenarioStore.currentScenarioId,
  async () => {
    console.log('Scenario changed, reloading loan detail')
    await loansStore.fetchLoanDetail(loanId.value)
  }
)
</script>

<style scoped>
.loan-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.loan-info h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.loan-id {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.loan-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-paid_off {
  background: #e3f2fd;
  color: #2196f3;
}

.status-overdue {
  background: #ffebee;
  color: #f44336;
}

.loan-summary {
  display: flex;
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.summary-item .label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.summary-item .value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.section {
  margin-bottom: 24px;
}

.section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .loan-header {
    flex-direction: column;
    gap: 16px;
  }

  .loan-summary {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
```

---

## Dashboard Integration

### Dashboard with Scenario Support

```vue
<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Scenario Banner -->
    <ScenarioBanner @switch="showSelector = true" />

    <!-- Scenario Info Card (Demo Mode Only) -->
    <div v-if="isInScenarioMode" class="scenario-info-card">
      <div class="card-header">
        <span class="icon">{{ scenarioStore.currentIcon }}</span>
        <h3>{{ scenarioStore.currentName }}</h3>
      </div>
      <div class="card-body">
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Credit Score</span>
            <span class="value">{{ scenarioStats.creditScore }}</span>
          </div>
          <div class="stat">
            <span class="label">Active Loans</span>
            <span class="value">{{ scenarioStats.activeLoans }}</span>
          </div>
          <div class="stat">
            <span class="label">Payment Success</span>
            <span class="value">{{ scenarioStats.paymentSuccessRate }}%</span>
          </div>
          <div class="stat">
            <span class="label">Days Overdue</span>
            <span class="value" :class="{ alert: scenarioStats.daysOverdue > 0 }">
              {{ scenarioStats.daysOverdue || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile -->
    <section class="profile-section">
      <h2>โปรไฟล์</h2>
      <UserProfileCard :user="user" />
    </section>

    <!-- Active Loans -->
    <section class="loans-section">
      <div class="section-header">
        <h2>สินเชื่อของฉัน</h2>
        <span class="count">{{ activeLoans.length }} รายการ</span>
      </div>

      <div v-if="loansStore.isLoading" class="loading">
        <span class="spinner"></span>
      </div>

      <div v-else-if="activeLoans.length > 0" class="loans-grid">
        <LoanCard
          v-for="loan in activeLoans"
          :key="loan.loanId"
          :loan="loan"
          @click="viewLoanDetail(loan.loanId)"
        />
      </div>

      <div v-else class="no-loans">
        <p>ไม่มีสินเชื่อที่ใช้งานอยู่</p>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <h2>การดำเนินการ</h2>
      <div class="actions-grid">
        <ActionCard
          icon="💳"
          title="ชำระเงิน"
          description="ชำระค่างวดสินเชื่อ"
          @click="navigateTo('/payment')"
        />
        <ActionCard
          icon="📊"
          title="ประวัติ"
          description="ดูประวัติการทำรายการ"
          @click="navigateTo('/history')"
        />
        <ActionCard
          icon="🎯"
          title="สินเชื่อใหม่"
          description="สมัครสินเชื่อเพิ่มเติม"
          @click="navigateTo('/apply')"
        />
        <ActionCard v-if="isInScenarioMode" icon="🎭" title="เปลี่ยน Scenario" @click="showSelector = true" />
      </div>
    </section>

    <!-- Scenario Selector -->
    <ScenarioSelector v-if="showSelector" @close="showSelector = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoansStore } from '@/stores/loans'
import { useScenarioStore } from '@/stores/scenario'

import ScenarioBanner from '@/components/scenarios/ScenarioBanner.vue'
import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const router = useRouter()
const loansStore = useLoansStore()
const scenarioStore = useScenarioStore()

const showSelector = ref(false)

// Computed
const isInScenarioMode = computed(() => scenarioStore.currentScenarioId !== 'DEFAULT')
const scenarioStats = computed(() => scenarioStore.scenarioStats)
const user = computed(() => scenarioStore.currentUser)
const activeLoans = computed(() => loansStore.activeLoans)

// Methods
const viewLoanDetail = (loanId) => {
  router.push(`/loans/${loanId}`)
}

const navigateTo = (path) => {
  router.push(path)
}

// Lifecycle
onMounted(async () => {
  await loansStore.fetchLoans()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.scenario-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header .icon {
  font-size: 32px;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat .label {
  font-size: 13px;
  opacity: 0.9;
}

.stat .value {
  font-size: 24px;
  font-weight: 700;
}

.stat .value.alert {
  color: #ff5252;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .count {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.loans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stat-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

## Complete Page Example

### Scenario Demo Page (ตัวอย่างครบวงจร)

```vue
<!-- src/views/ScenarioDemoPage.vue -->
<template>
  <div class="scenario-demo-page">
    <h1>🎭 Scenario Demo System</h1>
    <p class="subtitle">ระบบ Mock Data แบบ Interactive - ทดลองใช้งาน 10 User Personas</p>

    <!-- Scenario Selector -->
    <section class="selector-section">
      <ScenarioSelector />
    </section>

    <!-- Current Scenario Details -->
    <section v-if="currentScenario" class="details-section">
      <h2>ข้อมูลปัจจุบัน</h2>

      <!-- User Profile -->
      <div class="profile-card">
        <h3>👤 User Profile</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <span class="label">ชื่อ:</span>
            <span class="value">{{ user.firstName }} {{ user.lastName }}</span>
          </div>
          <div class="profile-item">
            <span class="label">อายุ:</span>
            <span class="value">{{ user.age }} ปี</span>
          </div>
          <div class="profile-item">
            <span class="label">อาชีพ:</span>
            <span class="value">{{ user.occupation }}</span>
          </div>
          <div class="profile-item">
            <span class="label">รายได้:</span>
            <span class="value">{{ formatCurrency(user.monthlyIncome) }}/เดือน</span>
          </div>
          <div class="profile-item highlight">
            <span class="label">Credit Score:</span>
            <span class="value" :class="`score-${getCreditClass(user.creditScore)}`">
              {{ user.creditScore }}
            </span>
          </div>
          <div class="profile-item">
            <span class="label">Rating:</span>
            <span class="value">{{ user.creditRating }}</span>
          </div>
        </div>
      </div>

      <!-- Loans Summary -->
      <div class="loans-summary-card">
        <h3>💼 Loans Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="number">{{ stats.totalLoans }}</span>
            <span class="label">Total Loans</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ stats.activeLoans }}</span>
            <span class="label">Active</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ stats.paymentSuccessRate }}%</span>
            <span class="label">Success Rate</span>
          </div>
          <div class="stat-item" :class="{ alert: stats.daysOverdue > 0 }">
            <span class="number">{{ stats.daysOverdue }}</span>
            <span class="label">Days Overdue</span>
          </div>
        </div>
      </div>

      <!-- Loans List -->
      <div v-if="loans.length > 0" class="loans-list-card">
        <h3>📋 Loan Details</h3>
        <div v-for="loan in loans" :key="loan.loanId" class="loan-item">
          <div class="loan-header">
            <div class="loan-title">
              <strong>{{ loan.productName }}</strong>
              <span class="loan-id">{{ loan.loanId }}</span>
            </div>
            <span class="loan-status" :class="`status-${loan.status.toLowerCase()}`">
              {{ loan.status }}
            </span>
          </div>
          <div class="loan-details">
            <div class="detail">
              <span class="label">Principal:</span>
              <span>{{ formatCurrency(loan.principalAmount) }}</span>
            </div>
            <div class="detail">
              <span class="label">Remaining:</span>
              <span>{{ formatCurrency(loan.totalRemaining) }}</span>
            </div>
            <div class="detail">
              <span class="label">Progress:</span>
              <span>{{ loan.paidInstallments }}/{{ loan.totalInstallments }}</span>
            </div>
            <div class="detail">
              <span class="label">Monthly:</span>
              <span>{{ formatCurrency(loan.monthlyPayment) }}</span>
            </div>
          </div>
          <button class="view-btn" @click="viewDetails(loan.loanId)">View Full Details</button>
        </div>
      </div>
    </section>

    <!-- Validation Results -->
    <section class="validation-section">
      <div class="section-header">
        <h2>🔍 Validation</h2>
        <button class="validate-btn" @click="runValidation" :disabled="isValidating">
          {{ isValidating ? 'Validating...' : 'Run Validation' }}
        </button>
      </div>

      <div v-if="validationResult" class="validation-result">
        <div class="result-summary" :class="{ valid: validationResult.valid, invalid: !validationResult.valid }">
          <span class="icon">{{ validationResult.valid ? '✅' : '❌' }}</span>
          <span class="text">
            {{ validationResult.valid ? 'All checks passed!' : `${validationResult.errorCount} errors found` }}
          </span>
        </div>

        <div v-if="validationResult.errorCount > 0" class="errors-list">
          <h4>Errors:</h4>
          <ul>
            <li v-for="(error, index) in validationResult.errors" :key="index">{{ error }}</li>
          </ul>
        </div>

        <div v-if="validationResult.warningCount > 0" class="warnings-list">
          <h4>Warnings:</h4>
          <ul>
            <li v-for="(warning, index) in validationResult.warnings" :key="index">{{ warning }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/scenario'
import { useLoansStore } from '@/stores/loans'
import { getValidationSummary } from '@/services/scenarios/validateScenarios'

import ScenarioSelector from '@/components/scenarios/ScenarioSelector.vue'

const router = useRouter()
const scenarioStore = useScenarioStore()
const loansStore = useLoansStore()

const isValidating = ref(false)
const validationResult = ref(null)

// Computed
const currentScenario = computed(() => scenarioStore.currentScenario)
const user = computed(() => scenarioStore.currentUser)
const loans = computed(() => loansStore.loans)
const stats = computed(() => scenarioStore.scenarioStats)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getCreditClass = (score) => {
  if (score >= 750) return 'excellent'
  if (score >= 700) return 'good'
  if (score >= 650) return 'fair'
  return 'poor'
}

const viewDetails = (loanId) => {
  router.push(`/loans/${loanId}`)
}

const runValidation = async () => {
  isValidating.value = true

  // Simulate async validation
  await new Promise((resolve) => setTimeout(resolve, 500))

  validationResult.value = getValidationSummary(scenarioStore.currentScenarioId)

  isValidating.value = false
}

// Watch for scenario changes
watch(
  () => scenarioStore.currentScenarioId,
  async () => {
    // Clear validation when switching scenarios
    validationResult.value = null

    // Reload loans
    await loansStore.fetchLoans()
  }
)
</script>

<style scoped>
.scenario-demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.subtitle {
  margin: 0 0 40px;
  font-size: 16px;
  color: #666;
}

section {
  margin-bottom: 32px;
}

.profile-card,
.loans-summary-card,
.loans-list-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

h2,
h3 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-item .label {
  font-size: 13px;
  color: #666;
}

.profile-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.profile-item.highlight {
  grid-column: span 3;
}

.profile-item.highlight .value {
  font-size: 32px;
}

.score-excellent {
  color: #4caf50;
}

.score-good {
  color: #2196f3;
}

.score-fair {
  color: #ff9800;
}

.score-poor {
  color: #f44336;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-item .number {
  font-size: 36px;
  font-weight: 700;
  color: #333;
}

.stat-item.alert .number {
  color: #f44336;
}

.stat-item .label {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loan-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 12px;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.loan-id {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.loan-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #e8f5e9;
  color: #4caf50;
}

.loan-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.detail .label {
  color: #666;
}

.view-btn {
  width: 100%;
  padding: 10px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #1565c0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.validate-btn {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.validate-btn:hover:not(:disabled) {
  background: #388e3c;
}

.validate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.validation-result {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.result-summary.valid {
  background: #e8f5e9;
  color: #4caf50;
}

.result-summary.invalid {
  background: #ffebee;
  color: #f44336;
}

.result-summary .icon {
  font-size: 24px;
}

.errors-list,
.warnings-list {
  margin-top: 16px;
}

.errors-list h4,
.warnings-list h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.errors-list {
  color: #f44336;
}

.warnings-list {
  color: #ff9800;
}

ul {
  margin: 0;
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-item.highlight {
    grid-column: span 1;
  }

  .summary-stats,
  .loan-details {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

---

## Advanced Usage

### 1. Programmatic Scenario Switching

```javascript
import { useScenarioStore } from '@/stores/scenario'
import * as mockDataService from '@/services/mockDataService'

// Method 1: Using store (recommended)
const scenarioStore = useScenarioStore()
await scenarioStore.switchScenario('PERFECT_BORROWER')

// Method 2: Using service directly
mockDataService.switchScenario('OCCASIONAL_LATE')

// Method 3: Reset to default
await scenarioStore.resetToDefault()
```

### 2. Listen to Scenario Changes

```javascript
// In any component
if (typeof window !== 'undefined') {
  window.addEventListener('scenario:changed', (event) => {
    console.log('Scenario changed:', event.detail.scenarioId)

    // Reload your data
    await loansStore.fetchLoans()
    await paymentStore.fetchPaymentMethods()
  })
}
```

### 3. Conditional Features Based on Scenario

```vue
<template>
  <div>
    <!-- Show special features for specific scenarios -->
    <EarlyRepaymentBanner v-if="isEarlyRepaymentScenario" />

    <LateFeeWarning v-if="hasLateFees" />

    <FraudAlert v-if="isFraudFlagged" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScenarioStore } from '@/stores/scenario'

const scenarioStore = useScenarioStore()

const isEarlyRepaymentScenario = computed(() => scenarioStore.currentScenarioId === 'EARLY_REPAYMENT')

const hasLateFees = computed(() => {
  const stats = scenarioStore.scenarioStats
  return stats.totalLateFees > 0
})

const isFraudFlagged = computed(() => scenarioStore.currentScenarioId === 'FRAUD_FLAGGED')
</script>
```

### 4. Validation in Forms

```javascript
import { getValidationSummary } from '@/services/scenarios/validateScenarios'

// Validate before submission
const validateBeforeSubmit = () => {
  const result = getValidationSummary(scenarioStore.currentScenarioId)

  if (!result.valid) {
    console.error('Validation failed:', result.errors)
    return false
  }

  return true
}
```

---

## 🎓 Best Practices

### 1. Always Use Scenario Store

```javascript
// ✅ Good
import { useScenarioStore } from '@/stores/scenario'
const scenarioStore = useScenarioStore()

// ❌ Bad
import * as mockData from '../services/mockData'
```

### 2. Handle Scenario Changes

```javascript
// ✅ Good - Listen to changes
watch(
  () => scenarioStore.currentScenarioId,
  async () => {
    await refreshData()
  }
)

// ❌ Bad - Assume data never changes
onMounted(async () => {
  await loadData()
  // Data becomes stale when scenario changes
})
```

### 3. Use Computed for Dynamic Data

```javascript
// ✅ Good
const loans = computed(() => loansStore.loans)
const stats = computed(() => scenarioStore.scenarioStats)

// ❌ Bad
const loans = loansStore.loans // Static reference
```

### 4. Validate Data

```javascript
// ✅ Good
import { isScenarioValid } from '@/services/scenarios/validateScenarios'

if (!isScenarioValid(scenarioId)) {
  console.warn('Invalid scenario data')
}

// ❌ Bad - Assume data is always correct
```

---

## 📝 Summary

ระบบ Scenario System ให้คุณ:

✅ **10 User Personas** พร้อมข้อมูล lifecycle 1-2 ปี
✅ **Easy Integration** เพียง import store และ components
✅ **Reactive Updates** data อัพเดทอัตโนมัติเมื่อสลับ scenario
✅ **Rich Components** UI components พร้อมใช้งาน
✅ **Validation Tools** ตรวจสอบความถูกต้องของข้อมูล
✅ **Production-Ready** business logic ถูกต้องครบถ้วน

เริ่มต้นใช้งานได้ทันที - ไม่ต้องติดตั้งอะไรเพิ่ม! 🚀
