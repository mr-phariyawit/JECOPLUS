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

      <!-- Setup Profile (Empty State) -->
      <div
        v-else-if="!analysis || !analysis.profile?.monthly_income"
        class="setup-card"
      >
        <div class="setup-content">
          <h2>👋 เริ่มต้นใช้งาน Money Coach</h2>
          <p>กรุณากรอกข้อมูลเบื้องต้นเพื่อให้เราวิเคราะห์สถานะการเงินของคุณ</p>

          <div class="setup-form">
            <div class="form-group">
              <label>รายได้ต่อเดือน (บาท)</label>
              <input
                v-model.number="setupData.income"
                type="number"
                placeholder="เช่น 25000"
              />
            </div>
            <div class="form-group">
              <label>รายจ่ายคงที่ต่อเดือน (บาท)</label>
              <input
                v-model.number="setupData.expense"
                type="number"
                placeholder="เช่น 10000"
              />
            </div>
            <div class="form-group">
              <label>เป้าหมายเงินออม (บาท)</label>
              <input
                v-model.number="setupData.savings"
                type="number"
                placeholder="เช่น 100000"
              />
            </div>
            <button
              @click="saveProfile"
              class="start-btn"
              :disabled="!isValidSetup"
            >
              เริ่มวิเคราะห์
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Content -->
      <div v-else class="money-coach-content">
        <!-- Financial Summary Card -->
        <div class="summary-card">
          <h2>📊 สรุปภาพรวม</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="icon-bg income-bg">💵</div>
              <div class="summary-text">
                <span class="label">รายได้</span>
                <span class="value income">{{
                  formatCurrency(analysis.profile.monthly_income)
                }}</span>
              </div>
            </div>
            <div class="summary-item">
              <div class="icon-bg expense-bg">💸</div>
              <div class="summary-text">
                <span class="label">รายจ่าย</span>
                <span class="value expense">
                  {{
                    formatCurrency(
                      analysis.profile.monthly_expenses ||
                        analysis.spendingAnalysis?.totalSpent,
                    )
                  }}
                </span>
              </div>
            </div>
            <div class="summary-item">
              <div class="icon-bg balance-bg">🏦</div>
              <div class="summary-text">
                <span class="label">คงเหลือ</span>
                <span class="value balance">{{
                  formatCurrency(analysis.walletBalance)
                }}</span>
              </div>
            </div>
            <div class="summary-item" v-if="analysis.profile.savings_goal">
              <div class="icon-bg goal-bg">🎯</div>
              <div class="summary-text">
                <span class="label">เป้าหมาย</span>
                <span class="value goal">{{
                  formatCurrency(analysis.profile.savings_goal)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Spending Chart -->
          <div v-if="analysis.spendingAnalysis" class="chart-card">
            <h2>💳 สัดส่วนการใช้จ่าย</h2>
            <div class="chart-container">
              <Doughnut :data="chartData" :options="chartOptions" />
            </div>
            <div class="spending-total">
              <span>รวมรายจ่ายเดือนนี้:</span>
              <strong>{{
                formatCurrency(analysis.spendingAnalysis.totalSpent)
              }}</strong>
            </div>
          </div>

          <!-- Insights -->
          <div v-if="analysis.insights?.length" class="insights-card">
            <h2>💡 คำแนะนำสำหรับคุณ</h2>
            <div class="insights-list">
              <div
                v-for="(insight, index) in analysis.insights"
                :key="index"
                class="insight-item"
                :class="insight.type"
              >
                <span class="insight-icon">{{
                  getInsightIcon(insight.type)
                }}</span>
                <p>{{ insight.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div
          class="recommendations-section"
          v-if="
            analysis.recommendations?.products?.length ||
            analysis.recommendations?.loans?.length
          "
        >
          <h2>⭐ ข้อเสนอพิเศษเพื่อคุณ</h2>
          <div class="rec-grid">
            <!-- Product Recs -->
            <div
              v-for="product in analysis.recommendations.products"
              :key="product.id"
              class="rec-card product"
              @click="goToProduct(product.id)"
            >
              <div class="rec-badge">สินค้าแนะนำ</div>
              <h3>{{ product.name }}</h3>
              <p class="rec-price">{{ formatCurrency(product.price) }}</p>
              <p class="rec-reason">{{ product.reason }}</p>
            </div>

            <!-- Loan Recs -->
            <div
              v-for="loan in analysis.recommendations.loans"
              :key="loan.id"
              class="rec-card loan"
              @click="goToLoan(loan.id)"
            >
              <div class="rec-badge loan">สินเชื่อแนะนำ</div>
              <h3>{{ loan.name }}</h3>
              <p class="rec-detail">
                วงเงินสูงสุด {{ formatCurrency(loan.max_amount) }}
              </p>
              <p class="rec-reason">{{ loan.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Widget -->
      <AIChatWidget mode="money-coach" :context="chatContext" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import * as moneyCoachService from "@/services/moneyCoachService";
import AIChatWidget from "@/components/chat/AIChatWidget.vue";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const router = useRouter();

const analysis = ref(null);
const loading = ref(true);
const error = ref(null);

// Setup Form Data
const setupData = ref({
  income: null,
  expense: null,
  savings: null,
});

const isValidSetup = computed(() => {
  return setupData.value.income > 0 && setupData.value.expense >= 0;
});

// Chart Configuration
const chartData = computed(() => {
  if (!analysis.value?.spendingAnalysis?.categories) return null;

  const categories = analysis.value.spendingAnalysis.categories;
  const labels = Object.keys(categories).map(getCategoryName);
  const data = Object.values(categories);

  return {
    labels,
    datasets: [
      {
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        data,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const chatContext = computed(() => {
  if (!analysis.value) return {};
  return {
    profile: analysis.value.profile,
    spending: analysis.value.spendingAnalysis,
    insights: analysis.value.insights,
  };
});

const loadAnalysis = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await moneyCoachService.analyzeFinancialSituation();
    // If backend returns empty profile, we stay in setup mode (analysis=null or partial)
    // Adjust logic based on your backend response structure
    if (result && result.profile && result.profile.monthly_income > 0) {
      analysis.value = result;
    } else {
      // Prepare empty analysis structure if needed, or just keep null to show setup
      analysis.value = null;
    }
  } catch (err) {
    console.warn("Analysis not found or error:", err);
    // If 404/Not Found, it means no profile -> Show setup
    analysis.value = null;
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  loading.value = true;
  try {
    // Call service to save profile (Need to implement this in service if not exists)
    // For now, mock it locally or assume updateProfile endpoint exists
    await moneyCoachService.updateProfile({
      monthly_income: setupData.value.income,
      monthly_expenses: setupData.value.expense,
      savings_goal: setupData.value.savings,
    });

    // Reload analysis
    await loadAnalysis();
  } catch (err) {
    console.error("Failed to save profile:", err);
    error.value = "บันทึกข้อมูลไม่สำเร็จ";
    loading.value = false;
  }
};

// ... existing helpers ...
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 บาท";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryName = (category) => {
  const names = {
    food: "อาหาร",
    transport: "เดินทาง",
    shopping: "ช้อปปิ้ง",
    bills: "บิล/สาธารณูปโภค",
    entertainment: "บันเทิง",
    other: "อื่นๆ",
  };
  return names[category] || category;
};

const getInsightIcon = (type) => {
  switch (type) {
    case "positive":
      return "✅";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "💡";
  }
};

const goToProduct = (id) => router.push(`/products/${id}`);
const goToLoan = (id) => router.push(`/loans/${id}`);

onMounted(() => {
  loadAnalysis();
});
</script>

<style scoped>
.money-coach-view {
  min-height: 100vh;
  background: #f3f4f6; /* Lighter background for better contrast */
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px; /* Space for chat widget */
}

.money-coach-header {
  text-align: center;
  margin-bottom: 2rem;
}

.money-coach-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Loading & Error */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Setup Card */
.setup-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.setup-content h2 {
  color: #111827;
  margin-bottom: 0.5rem;
}

.setup-form {
  margin-top: 1.5rem;
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.start-btn,
.retry-btn {
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.start-btn:hover:not(:disabled) {
  background: #4338ca;
}

.start-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Dashboard Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Summary Card */
.summary-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.icon-bg {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.income-bg {
  background: #d1fae5;
}
.expense-bg {
  background: #fee2e2;
}
.balance-bg {
  background: #dbeafe;
}
.goal-bg {
  background: #ede9fe;
}

.summary-text {
  display: flex;
  flex-direction: column;
}

.summary-text .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-text .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* Chart Card */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 250px;
  position: relative;
  margin: 1rem 0;
}

/* Insights Card */
.insights-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  background: #f3f4f6;
}

.insight-item.positive {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
}
.insight-item.warning {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}
.insight-item.info {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.insight-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

/* Recommendations */
.recommendations-section {
  margin-top: 2rem;
}

.recommendations-section h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.rec-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.rec-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.rec-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  background: #f3f4f6;
  color: #374151;
}

.rec-badge.loan {
  background: #dbeafe;
  color: #1e40af;
}

.rec-card h3 {
  font-size: 1.1rem;
  color: #111827;
  margin-bottom: 0.5rem;
  padding-right: 2rem;
}

.rec-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 0.5rem;
}

.rec-detail {
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
  margin-bottom: 0.5rem;
}

.rec-reason {
  font-size: 0.9rem;
  color: #6b7280;
  background: #fffbeb;
  padding: 0.5rem;
  border-radius: 6px;
}
</style>
