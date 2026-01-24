<!--
  QUICK START EXAMPLE - Copy this to your project!

  Create: src/views/ScenarioDemo.vue
  Then add route: { path: '/demo', component: ScenarioDemo }
-->

<template>
  <div class="scenario-demo">
    <!-- Header -->
    <div class="demo-header">
      <h1>🎭 Scenario Demo System</h1>
      <p>ทดลองใช้งาน 10 User Scenarios แบบ Interactive</p>
    </div>

    <!-- Scenario Selector -->
    <section class="selector-section">
      <div class="selector-card">
        <h2>เลือก Scenario</h2>
        <div class="scenarios-grid">
          <div
            v-for="scenario in scenarios"
            :key="scenario.id"
            class="scenario-option"
            :class="{ active: scenario.id === currentScenarioId }"
            @click="switchTo(scenario.id)"
          >
            <span class="icon">{{ scenario.icon }}</span>
            <span class="name">{{ scenario.name }}</span>
            <span v-if="scenario.id === currentScenarioId" class="check">✓</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Current Scenario Info -->
    <section v-if="currentScenario" class="info-section">
      <div class="info-card">
        <h2>ข้อมูลปัจจุบัน</h2>

        <!-- User Info -->
        <div class="user-info">
          <div class="info-row">
            <span class="label">ชื่อ:</span>
            <span class="value">{{ user.firstName }} {{ user.lastName }}</span>
          </div>
          <div class="info-row">
            <span class="label">อายุ:</span>
            <span class="value">{{ user.age }} ปี</span>
          </div>
          <div class="info-row">
            <span class="label">อาชีพ:</span>
            <span class="value">{{ user.occupation }}</span>
          </div>
          <div class="info-row">
            <span class="label">รายได้:</span>
            <span class="value">{{ formatCurrency(user.monthlyIncome) }}/เดือน</span>
          </div>
          <div class="info-row highlight">
            <span class="label">Credit Score:</span>
            <span class="value" :class="`score-${getCreditClass(user.creditScore)}`">
              {{ user.creditScore }}
            </span>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat">
            <span class="number">{{ stats.totalLoans }}</span>
            <span class="label">Total Loans</span>
          </div>
          <div class="stat">
            <span class="number">{{ stats.activeLoans }}</span>
            <span class="label">Active</span>
          </div>
          <div class="stat">
            <span class="number">{{ stats.paymentSuccessRate }}%</span>
            <span class="label">Success Rate</span>
          </div>
          <div class="stat" :class="{ alert: stats.daysOverdue > 0 }">
            <span class="number">{{ stats.daysOverdue }}</span>
            <span class="label">Days Overdue</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Loans List -->
    <section v-if="loans.length > 0" class="loans-section">
      <div class="loans-card">
        <h2>สินเชื่อทั้งหมด ({{ loans.length }})</h2>
        <div class="loans-list">
          <div v-for="loan in loans" :key="loan.loanId" class="loan-item">
            <div class="loan-header">
              <strong>{{ loan.productName }}</strong>
              <span class="status" :class="`status-${loan.status.toLowerCase()}`">
                {{ loan.status }}
              </span>
            </div>
            <div class="loan-details">
              <div>เงินต้น: {{ formatCurrency(loan.principalAmount) }}</div>
              <div>คงเหลือ: {{ formatCurrency(loan.totalRemaining) }}</div>
              <div>งวด: {{ loan.paidInstallments }}/{{ loan.totalInstallments }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <div class="actions-card">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button @click="runValidation" class="action-btn">
            🔍 Run Validation
          </button>
          <button @click="showConsoleData" class="action-btn">
            📊 Console.log Data
          </button>
          <button @click="resetScenario" class="action-btn">
            ↺ Reset to Default
          </button>
          <button @click="clearCache" class="action-btn">
            🗑️ Clear Cache
          </button>
        </div>
      </div>
    </section>

    <!-- Validation Results -->
    <section v-if="validationResult" class="validation-section">
      <div class="validation-card" :class="{ valid: validationResult.valid }">
        <h2>Validation Results</h2>
        <div class="result-summary">
          <span class="icon">{{ validationResult.valid ? '✅' : '❌' }}</span>
          <span class="text">
            {{ validationResult.valid ? 'All checks passed!' : `${validationResult.errorCount} errors` }}
          </span>
        </div>
        <div v-if="validationResult.errorCount > 0" class="errors">
          <h3>Errors:</h3>
          <ul>
            <li v-for="(error, i) in validationResult.errors" :key="i">{{ error }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { useLoansStore } from '@/stores/loans'
import { getValidationSummary } from '@/services/scenarios/validateScenarios'
import * as mockDataService from '@/services/mockDataService'

const scenarioStore = useScenarioStore()
const loansStore = useLoansStore()

const validationResult = ref(null)

// Computed
const scenarios = computed(() => scenarioStore.availableScenarios.filter(s => s.id !== 'DEFAULT'))
const currentScenarioId = computed(() => scenarioStore.currentScenarioId)
const currentScenario = computed(() => scenarioStore.currentScenario)
const user = computed(() => scenarioStore.currentUser)
const stats = computed(() => scenarioStore.scenarioStats)
const loans = computed(() => loansStore.loans)

// Methods
const switchTo = async (scenarioId) => {
  console.log('🎭 Switching to:', scenarioId)
  await scenarioStore.switchScenario(scenarioId)
}

const runValidation = () => {
  validationResult.value = getValidationSummary(currentScenarioId.value)
  console.log('Validation result:', validationResult.value)
}

const showConsoleData = () => {
  console.group('📊 Current Scenario Data')
  console.log('Scenario ID:', currentScenarioId.value)
  console.log('User:', user.value)
  console.log('Loans:', loans.value)
  console.log('Stats:', stats.value)
  console.groupEnd()
}

const resetScenario = async () => {
  await scenarioStore.resetToDefault()
  validationResult.value = null
  console.log('✅ Reset to DEFAULT')
}

const clearCache = () => {
  mockDataService.clearCaches()
  console.log('🗑️ Cache cleared')
}

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

// Watch for scenario changes
watch(() => currentScenarioId.value, async () => {
  validationResult.value = null
  await loansStore.fetchLoans()
})

// Lifecycle
onMounted(async () => {
  await loansStore.fetchLoans()
})
</script>

<style scoped>
.scenario-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

section {
  margin-bottom: 32px;
}

.selector-card,
.info-card,
.loans-card,
.actions-card,
.validation-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

/* Scenario Grid */
.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.scenario-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.scenario-option:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.scenario-option.active {
  border-color: #1976d2;
  background: #e3f2fd;
  border-width: 3px;
}

.scenario-option .icon {
  font-size: 32px;
}

.scenario-option .name {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.scenario-option .check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #1976d2;
  font-size: 20px;
}

/* User Info */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-row .label {
  font-weight: 500;
  color: #666;
}

.info-row .value {
  font-weight: 600;
  color: #333;
}

.info-row.highlight .value {
  font-size: 24px;
}

.score-excellent { color: #4caf50; }
.score-good { color: #2196f3; }
.score-fair { color: #ff9800; }
.score-poor { color: #f44336; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat .number {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.stat.alert .number {
  color: #f44336;
}

.stat .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

/* Loans List */
.loans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loan-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active { background: #e8f5e9; color: #4caf50; }
.status-paid_off { background: #e3f2fd; color: #2196f3; }
.status-overdue { background: #ffebee; color: #f44336; }
.status-suspended { background: #fce4ec; color: #c2185b; }

.loan-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  font-size: 13px;
  color: #666;
}

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  padding: 12px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

/* Validation */
.validation-card {
  border-left: 4px solid #f44336;
}

.validation-card.valid {
  border-left-color: #4caf50;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.result-summary .icon {
  font-size: 24px;
}

.result-summary .text {
  font-size: 16px;
  font-weight: 600;
}

.errors h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #f44336;
}

.errors ul {
  margin: 0;
  padding-left: 20px;
  color: #f44336;
}

.errors li {
  margin-bottom: 4px;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .scenarios-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .loan-details {
    grid-template-columns: 1fr;
  }
}
</style>
