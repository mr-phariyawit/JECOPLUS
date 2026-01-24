<template>
  <div class="loan-assistant-view">
    <div class="container">
      <!-- Header -->
      <div class="loan-assistant-header">
        <h1>💳 Loan Assistant</h1>
        <p class="subtitle">
          ผู้ช่วยคำนวณและแนะนำสินเชื่อที่คุ้มที่สุดสำหรับคุณ
        </p>
      </div>

      <div class="content-grid">
        <!-- Loan Calculator -->
        <div class="calculator-card">
          <h2>🧮 คำนวณค่างวด</h2>
          <div class="calculator-layout">
            <div class="calculator-form">
              <div class="form-group">
                <label>วงเงินกู้ (บาท)</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="calcAmount"
                    type="number"
                    placeholder="เช่น 50000"
                    min="1000"
                  />
                  <span class="unit">THB</span>
                </div>
              </div>
              <div class="form-group">
                <label>ดอกเบี้ยต่อปี (%)</label>
                <div class="input-wrapper">
                  <input
                    v-model.number="calcRate"
                    type="number"
                    placeholder="เช่น 18"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="form-group">
                <label>ระยะเวลา (เดือน)</label>
                <input
                  v-model.number="calcMonths"
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  class="range-slider"
                />
                <div class="range-value">{{ calcMonths }} เดือน</div>
              </div>
              <button
                @click="calculateInstallment"
                class="calc-btn"
                :disabled="calculating"
              >
                {{ calculating ? "กำลังคำนวณ..." : "คำนวณค่างวด" }}
              </button>
            </div>

            <!-- Chart Visualization -->
            <div class="calculator-chart" v-if="calculationResult">
              <div class="chart-wrapper">
                <Doughnut :data="chartData" :options="chartOptions" />
              </div>
              <div class="monthly-payment">
                <small>ค่างวดต่อเดือน</small>
                <strong>{{
                  formatCurrency(calculationResult.monthlyInstallment)
                }}</strong>
              </div>
            </div>
          </div>

          <!-- Result Breakdown -->
          <div v-if="calculationResult" class="result-breakdown">
            <div class="breakdown-item">
              <span class="dot principal"></span>
              <span>เงินต้น</span>
              <strong>{{ formatCurrency(calcAmount) }}</strong>
            </div>
            <div class="breakdown-item">
              <span class="dot interest"></span>
              <span>ดอกเบี้ยรวม</span>
              <strong>{{
                formatCurrency(calculationResult.totalInterest)
              }}</strong>
            </div>
            <div class="breakdown-total">
              <span>ยอดชำระทั้งหมด</span>
              <strong>{{
                formatCurrency(calculationResult.totalAmount)
              }}</strong>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-section">
          <h2>⭐ สินเชื่อแนะนำสำหรับคุณ</h2>
          <div v-if="loadingRecommendations" class="loading-state">
            <div class="spinner"></div>
            <p>กำลังค้นหาสินเชื่อที่ดีที่สุด...</p>
          </div>

          <div v-else-if="recommendations?.loans?.length" class="rec-list">
            <div
              v-for="(loan, index) in recommendations.loans"
              :key="loan.id"
              class="rec-card"
              :class="{ 'best-match': index === 0 }"
            >
              <div class="rec-badge" v-if="index === 0">คุ้มค่าที่สุด 🔥</div>
              <div class="rec-header">
                <h3>{{ loan.name }}</h3>
                <span class="interest-tag"
                  >ดอกเบี้ย {{ loan.interestRate }}%</span
                >
              </div>

              <div class="rec-body">
                <div class="rec-info">
                  <div class="info-row">
                    <span>วงเงินอนุมัติ</span>
                    <strong>{{
                      formatCurrency(loan.recommendedAmount)
                    }}</strong>
                  </div>
                  <div class="info-row">
                    <span>ระยะเวลา</span>
                    <strong>{{ loan.recommendedTerm }} เดือน</strong>
                  </div>
                  <div class="info-row highlight">
                    <span>ค่างวด</span>
                    <strong
                      >{{
                        formatCurrency(loan.monthlyInstallment)
                      }}/เดือน</strong
                    >
                  </div>
                </div>

                <div class="rec-reason" v-if="loan.reason">
                  💡 {{ loan.reason }}
                </div>
              </div>

              <div class="rec-actions">
                <button class="apply-btn" @click="applyForLoan(loan.id)">
                  สมัครทันที
                </button>
                <button class="details-btn" @click="viewLoanDetails(loan.id)">
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>ไม่พบสินเชื่อที่ตรงกับเงื่อนไข ลองปรับวงเงินหรือระยะเวลา</p>
          </div>
        </div>
      </div>

      <!-- Chat Widget -->
      <AIChatWidget mode="loan-assistant" :context="chatContext" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import * as loanAssistantService from "@/services/loanAssistantService";
import AIChatWidget from "@/components/chat/AIChatWidget.vue";

ChartJS.register(ArcElement, Tooltip, Legend);

const router = useRouter();

// State
const myLoans = ref([]);
const recommendations = ref(null);
const loadingRecommendations = ref(false);
const calculating = ref(false);
const calculationResult = ref(null);

// Calculator Inputs
const calcAmount = ref(50000);
const calcRate = ref(18);
const calcMonths = ref(12);

// Chart Data
const chartData = computed(() => {
  if (!calculationResult.value) return null;
  return {
    labels: ["เงินต้น", "ดอกเบี้ย"],
    datasets: [
      {
        data: [calcAmount.value, calculationResult.value.totalInterest],
        backgroundColor: ["#6b7280", "#f5576c"],
        borderWidth: 0,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw;
          const total = context.chart._metasets[context.datasetIndex].total;
          const percentage = ((value / total) * 100).toFixed(1) + "%";
          return `${context.label}: ${formatCurrency(value)} (${percentage})`;
        },
      },
    },
  },
  cutout: "70%",
};

const chatContext = computed(() => ({
  calculator: {
    amount: calcAmount.value,
    rate: calcRate.value,
    months: calcMonths.value,
    result: calculationResult.value,
  },
  recommendations: recommendations.value,
}));

// Methods
const loadRecommendations = async () => {
  if (!calcAmount.value) return;
  loadingRecommendations.value = true;
  try {
    recommendations.value = await loanAssistantService.recommendLoans(
      calcAmount.value,
      calcMonths.value,
    );
  } catch (error) {
    console.error("Failed to load recommendations:", error);
  } finally {
    loadingRecommendations.value = false;
  }
};

const calculateInstallment = async () => {
  if (!calcAmount.value || !calcRate.value || !calcMonths.value) return;

  calculating.value = true;
  try {
    calculationResult.value = await loanAssistantService.calculateInstallment(
      calcAmount.value,
      calcRate.value,
      calcMonths.value,
    );
    await loadRecommendations();
  } catch (error) {
    console.error("Calculation failed:", error);
  } finally {
    calculating.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const applyForLoan = (loanId) => {
  router.push({
    path: "/loans/apply",
    query: { loanId, amount: calcAmount.value },
  });
};

const viewLoanDetails = (loanId) => {
  router.push(`/loans/${loanId}`);
};

// Watch inputs to auto-recalculate (debounced in real app, here simple)
watch([calcAmount, calcMonths], () => {
  // Optional: Auto calc or wait for button
});

onMounted(async () => {
  calculateInstallment();
});
</script>

<style scoped>
.loan-assistant-view {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.loan-assistant-header {
  text-align: center;
  margin-bottom: 2rem;
}

.loan-assistant-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Calculator Card */
.calculator-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.calculator-card h2 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.calculator-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 3rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.input-wrapper .unit {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.range-slider {
  width: 100%;
  accent-color: #f5576c;
}

.range-value {
  text-align: right;
  font-weight: 600;
  color: #f5576c;
  margin-top: 0.25rem;
}

.calc-btn {
  width: 100%;
  padding: 0.75rem;
  background: #f5576c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.calc-btn:hover:not(:disabled) {
  background: #e11d48;
}

/* Chart */
.calculator-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.monthly-payment {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}

.monthly-payment small {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
}

.monthly-payment strong {
  display: block;
  font-size: 1.2rem;
  color: #f5576c;
}

/* Result Breakdown */
.result-breakdown {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.breakdown-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e5e7eb;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
}

.dot.principal {
  background: #6b7280;
}
.dot.interest {
  background: #f5576c;
}

/* Recommendations */
.recommendations-section h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rec-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.rec-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #f5576c;
}

.rec-card.best-match {
  border: 2px solid #f5576c;
  background: linear-gradient(to right bottom, #fff, #fff1f2);
}

.rec-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #f5576c;
  color: white;
  padding: 0.25rem 1rem;
  border-bottom-left-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rec-header h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
}

.interest-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.rec-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-row span {
  font-size: 0.85rem;
  color: #6b7280;
}

.info-row strong {
  font-size: 1.1rem;
  color: #1f2937;
}

.rec-reason {
  font-size: 0.95rem;
  color: #92400e;
  background: #fffbeb;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.rec-actions {
  display: flex;
  gap: 1rem;
}

.apply-btn {
  flex: 2;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-btn:hover {
  background: #059669;
}

.details-btn {
  flex: 1;
  padding: 0.75rem;
  background: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.details-btn:hover {
  background: #f3f4f6;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  color: #6b7280;
}
</style>
