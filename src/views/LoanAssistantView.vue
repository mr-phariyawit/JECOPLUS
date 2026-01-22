<template>
  <div class="loan-assistant-view">
    <div class="container">
      <!-- Header -->
      <div class="loan-assistant-header">
        <h1>💳 Loan Assistant</h1>
        <p class="subtitle">ผู้ช่วยแนะนำสินเชื่อของคุณ</p>
      </div>

      <!-- Loan Calculator -->
      <div class="calculator-card">
        <h2>🧮 คำนวณค่างวด</h2>
        <div class="calculator-form">
          <div class="form-group">
            <label>วงเงินกู้ (บาท)</label>
            <input
              v-model.number="calcAmount"
              type="number"
              placeholder="เช่น 50000"
              min="1000"
            />
          </div>
          <div class="form-group">
            <label>อัตราดอกเบี้ยต่อปี (%)</label>
            <input
              v-model.number="calcRate"
              type="number"
              placeholder="เช่น 18"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>ระยะเวลาผ่อน (เดือน)</label>
            <input
              v-model.number="calcMonths"
              type="number"
              placeholder="เช่น 12"
              min="1"
              max="60"
            />
          </div>
          <button @click="calculateInstallment" class="calc-btn" :disabled="calculating">
            {{ calculating ? 'กำลังคำนวณ...' : 'คำนวณ' }}
          </button>
        </div>

        <!-- Calculation Result -->
        <div v-if="calculationResult" class="calculation-result">
          <div class="result-item">
            <span>ค่างวดต่อเดือน</span>
            <strong class="highlight">
              {{ formatCurrency(calculationResult.monthlyInstallment) }}
            </strong>
          </div>
          <div class="result-item">
            <span>ยอดรวมทั้งหมด</span>
            <strong>{{ formatCurrency(calculationResult.totalAmount) }}</strong>
          </div>
          <div class="result-item">
            <span>ดอกเบี้ยรวม</span>
            <strong class="interest">{{ formatCurrency(calculationResult.totalInterest) }}</strong>
          </div>
        </div>
      </div>

      <!-- My Loans -->
      <div v-if="myLoans.length > 0" class="my-loans-card">
        <h2>📋 สินเชื่อของฉัน</h2>
        <div class="loans-list">
          <div
            v-for="loan in myLoans"
            :key="loan.id"
            class="loan-item"
          >
            <div class="loan-header">
              <h3>{{ loan.name || 'สินเชื่อส่วนบุคคล' }}</h3>
              <span class="loan-status" :class="loan.status.toLowerCase()">
                {{ getStatusText(loan.status) }}
              </span>
            </div>
            <div class="loan-details">
              <p>วงเงิน: {{ formatCurrency(loan.amount_requested) }}</p>
              <p>ระยะเวลา: {{ loan.term_months }} เดือน</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations" class="recommendations-card">
        <h2>⭐ สินเชื่อแนะนำ</h2>
        <div v-if="loadingRecommendations" class="loading">กำลังโหลด...</div>
        <div v-else-if="recommendations.loans?.length" class="loans-grid">
          <div
            v-for="loan in recommendations.loans"
            :key="loan.id"
            class="recommended-loan"
            @click="viewLoanDetails(loan.id)"
          >
            <h3>{{ loan.name }}</h3>
            <div class="loan-info">
              <p><strong>วงเงิน:</strong> {{ formatCurrency(loan.recommendedAmount) }}</p>
              <p><strong>ค่างวด:</strong> {{ formatCurrency(loan.monthlyInstallment) }}/เดือน</p>
              <p><strong>ดอกเบี้ย:</strong> {{ loan.interestRate }}% ต่อปี</p>
              <p><strong>ระยะเวลา:</strong> {{ loan.recommendedTerm }} เดือน</p>
            </div>
            <p v-if="loan.reason" class="loan-reason">{{ loan.reason }}</p>
            <button class="view-btn">ดูรายละเอียด</button>
          </div>
        </div>
        <div v-else class="no-recommendations">
          <p>ไม่มีสินเชื่อแนะนำในขณะนี้</p>
        </div>
      </div>

      <!-- Chat Widget -->
      <AIChatWidget mode="loan-assistant" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as loanAssistantService from '@/services/loanAssistantService'
import AIChatWidget from '@/components/chat/AIChatWidget.vue'

const router = useRouter()

const myLoans = ref([])
const recommendations = ref(null)
const loadingRecommendations = ref(false)

// Calculator state
const calcAmount = ref(50000)
const calcRate = ref(18)
const calcMonths = ref(12)
const calculating = ref(false)
const calculationResult = ref(null)

const loadMyLoans = async () => {
  try {
    myLoans.value = await loanAssistantService.getMyLoans()
  } catch (error) {
    console.error('Failed to load my loans:', error)
  }
}

const loadRecommendations = async () => {
  loadingRecommendations.value = true
  try {
    recommendations.value = await loanAssistantService.recommendLoans(
      calcAmount.value,
      calcMonths.value
    )
  } catch (error) {
    console.error('Failed to load recommendations:', error)
  } finally {
    loadingRecommendations.value = false
  }
}

const calculateInstallment = async () => {
  if (!calcAmount.value || !calcRate.value || !calcMonths.value) {
    return
  }

  calculating.value = true
  try {
    calculationResult.value = await loanAssistantService.calculateInstallment(
      calcAmount.value,
      calcRate.value,
      calcMonths.value
    )
    
    // Reload recommendations with new values
    await loadRecommendations()
  } catch (error) {
    console.error('Calculation failed:', error)
  } finally {
    calculating.value = false
  }
}

const formatCurrency = (amount) => {
  if (!amount) return '0 บาท'
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusText = (status) => {
  const statusMap = {
    DRAFT: 'ร่าง',
    SUBMITTED: 'ส่งแล้ว',
    UNDER_REVIEW: 'กำลังพิจารณา',
    APPROVED: 'อนุมัติ',
    REJECTED: 'ปฏิเสธ',
    DISBURSED: 'โอนเงินแล้ว',
  }
  return statusMap[status] || status
}

const viewLoanDetails = (loanId) => {
  router.push(`/loans/${loanId}`)
}

onMounted(async () => {
  await loadMyLoans()
  await loadRecommendations()
})
</script>

<style scoped>
.loan-assistant-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.loan-assistant-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.loan-assistant-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.calculator-card,
.my-loans-card,
.recommendations-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.calculator-card h2,
.my-loans-card h2,
.recommendations-card h2 {
  margin-bottom: 1rem;
  color: #333;
}

.calculator-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #666;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #f5576c;
}

.calc-btn {
  grid-column: 1 / -1;
  padding: 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.calc-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.calc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.calculation-result {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1.1rem;
}

.result-item .highlight {
  font-size: 1.5rem;
  color: #f5576c;
}

.result-item .interest {
  color: #ef4444;
}

.loans-list,
.loans-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loan-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.loan-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.loan-status.approved {
  background: #d1fae5;
  color: #065f46;
}

.loan-status.submitted,
.loan-status.under_review {
  background: #dbeafe;
  color: #1e40af;
}

.loan-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.loan-details p {
  margin: 0.25rem 0;
  color: #666;
}

.recommended-loan {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommended-loan:hover {
  border-color: #f5576c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
}

.recommended-loan h3 {
  color: #f5576c;
  margin-bottom: 1rem;
}

.loan-info {
  margin: 1rem 0;
}

.loan-info p {
  margin: 0.5rem 0;
  color: #666;
}

.loan-reason {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #92400e;
}

.view-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #f5576c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}

.view-btn:hover {
  background: #e0485c;
}

.no-recommendations {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .calculator-form {
    grid-template-columns: 1fr;
  }
}
</style>
