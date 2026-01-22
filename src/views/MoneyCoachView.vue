<template>
  <div class="money-coach-view">
    <div class="container">
      <!-- Header -->
      <div class="money-coach-header">
        <h1>💰 Money Coach</h1>
        <p class="subtitle">ที่ปรึกษาการเงินส่วนบุคคลของคุณ</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังวิเคราะห์ข้อมูลการเงิน...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>❌ {{ error }}</p>
        <button @click="loadAnalysis" class="retry-btn">ลองใหม่</button>
      </div>

      <!-- Content -->
      <div v-else-if="analysis" class="money-coach-content">
        <!-- Financial Summary Card -->
        <div class="summary-card">
          <h2>📊 สรุปการเงิน</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">รายได้ต่อเดือน</span>
              <span class="value income">
                {{ formatCurrency(analysis.profile?.monthly_income) || 'ยังไม่ได้ตั้งค่า' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">รายจ่ายต่อเดือน</span>
              <span class="value expense">
                {{ formatCurrency(analysis.profile?.monthly_expenses) || formatCurrency(analysis.spendingAnalysis?.totalSpent) || 'ยังไม่ได้ตั้งค่า' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">เงินคงเหลือ</span>
              <span class="value balance">
                {{ formatCurrency(analysis.walletBalance) }}
              </span>
            </div>
            <div class="summary-item" v-if="analysis.profile?.savings_goal">
              <span class="label">เป้าหมายออมเงิน</span>
              <span class="value goal">
                {{ formatCurrency(analysis.profile.savings_goal) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Spending Analysis -->
        <div v-if="analysis.spendingAnalysis" class="spending-card">
          <h2>💳 การใช้จ่าย</h2>
          <div class="spending-categories">
            <div
              v-for="(amount, category) in analysis.spendingAnalysis.categories"
              :key="category"
              class="category-item"
            >
              <span class="category-name">{{ getCategoryName(category) }}</span>
              <span class="category-amount">{{ formatCurrency(amount) }}</span>
            </div>
          </div>
          <div class="spending-total">
            <span>รวม:</span>
            <strong>{{ formatCurrency(analysis.spendingAnalysis.totalSpent) }}</strong>
          </div>
        </div>

        <!-- Insights -->
        <div v-if="analysis.insights?.length" class="insights-card">
          <h2>💡 ข้อเสนอแนะ</h2>
          <div class="insights-list">
            <div
              v-for="(insight, index) in analysis.insights"
              :key="index"
              class="insight-item"
              :class="insight.type"
            >
              {{ insight.message }}
            </div>
          </div>
        </div>

        <!-- Product Recommendations -->
        <div v-if="analysis.recommendations?.products?.length" class="recommendations-card">
          <h2>🛍️ สินค้าแนะนำ</h2>
          <div class="products-grid">
            <div
              v-for="product in analysis.recommendations.products"
              :key="product.id"
              class="product-item"
              @click="goToProduct(product.id)"
            >
              <h3>{{ product.name }}</h3>
              <p class="product-price">{{ formatCurrency(product.price) }}</p>
              <p class="product-reason" v-if="product.reason">{{ product.reason }}</p>
            </div>
          </div>
        </div>

        <!-- Loan Recommendations -->
        <div v-if="analysis.recommendations?.loans?.length" class="recommendations-card">
          <h2>💳 สินเชื่อแนะนำ</h2>
          <div class="loans-list">
            <div
              v-for="loan in analysis.recommendations.loans"
              :key="loan.id"
              class="loan-item"
              @click="goToLoan(loan.id)"
            >
              <h3>{{ loan.name }}</h3>
              <p class="loan-details">
                วงเงิน: {{ formatCurrency(loan.min_amount) }} - {{ formatCurrency(loan.max_amount) }}
              </p>
              <p class="loan-reason" v-if="loan.reason">{{ loan.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Widget -->
      <AIChatWidget mode="money-coach" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as moneyCoachService from '@/services/moneyCoachService'
import AIChatWidget from '@/components/chat/AIChatWidget.vue'

const router = useRouter()

const analysis = ref(null)
const loading = ref(true)
const error = ref(null)

const loadAnalysis = async () => {
  loading.value = true
  error.value = null

  try {
    analysis.value = await moneyCoachService.analyzeFinancialSituation()
  } catch (err) {
    console.error('Failed to load financial analysis:', err)
    error.value = err.message || 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    loading.value = false
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

const getCategoryName = (category) => {
  const names = {
    food: 'อาหาร',
    transport: 'การเดินทาง',
    shopping: 'ช้อปปิ้ง',
    bills: 'ค่าใช้จ่าย',
    entertainment: 'บันเทิง',
    other: 'อื่นๆ',
  }
  return names[category] || category
}

const goToProduct = (productId) => {
  router.push(`/products/${productId}`)
}

const goToLoan = (loanId) => {
  router.push(`/loans/${loanId}`)
}

onMounted(() => {
  loadAnalysis()
})
</script>

<style scoped>
.money-coach-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.money-coach-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.money-coach-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.money-coach-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card,
.spending-card,
.insights-card,
.recommendations-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-card h2,
.spending-card h2,
.insights-card h2,
.recommendations-card h2 {
  margin-bottom: 1rem;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  color: #666;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
}

.value.income { color: #10b981; }
.value.expense { color: #ef4444; }
.value.balance { color: #3b82f6; }
.value.goal { color: #8b5cf6; }

.spending-categories {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.spending-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.1rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-item {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.insight-item.positive {
  background: #d1fae5;
  border-color: #10b981;
}

.insight-item.warning {
  background: #fee2e2;
  border-color: #ef4444;
}

.insight-item.info {
  background: #dbeafe;
  border-color: #3b82f6;
}

.products-grid,
.loans-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.product-item,
.loan-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-item:hover,
.loan-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0.5rem 0;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .products-grid,
  .loans-list {
    grid-template-columns: 1fr;
  }
}
</style>
