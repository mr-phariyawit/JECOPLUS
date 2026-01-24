<template>
  <div class="early-repayment-calculator">
    <div class="calculator-header">
      <h3>คำนวณชำระก่อนกำหนด</h3>
      <span class="savings-badge" v-if="calculation">
        ประหยัด {{ formatCurrency(calculation.savings) }}
      </span>
    </div>

    <div v-if="!canEarlyRepay" class="not-available">
      <span class="icon">ℹ️</span>
      <p>สินเชื่อนี้ไม่สามารถชำระก่อนกำหนดได้</p>
    </div>

    <div v-else class="calculator-content">
      <!-- Current Loan Status -->
      <div class="status-card">
        <h4>สถานะปัจจุบัน</h4>
        <div class="status-rows">
          <div class="status-row">
            <span class="label">งวดที่ชำระแล้ว:</span>
            <span class="value">{{ loan.paidInstallments }} / {{ loan.totalInstallments }}</span>
          </div>
          <div class="status-row">
            <span class="label">เงินต้นคงเหลือ:</span>
            <span class="value">{{ formatCurrency(loan.remainingPrincipal) }}</span>
          </div>
          <div class="status-row">
            <span class="label">ดอกเบี้ยคงเหลือ:</span>
            <span class="value">{{ formatCurrency(loan.remainingInterest) }}</span>
          </div>
          <div class="status-row highlight">
            <span class="label">รวมยอดคงเหลือ:</span>
            <span class="value">{{ formatCurrency(loan.totalRemaining) }}</span>
          </div>
        </div>
      </div>

      <!-- Early Repayment Calculation -->
      <div v-if="calculation" class="calculation-card">
        <h4>การชำระก่อนกำหนด</h4>

        <!-- Discount Info -->
        <div class="discount-info">
          <div class="discount-badge">
            <span class="icon">🎉</span>
            <span class="text">
              ส่วนลดดอกเบี้ย {{ discountRate }}%
            </span>
          </div>
          <p class="discount-desc">
            ชำระก่อนกำหนดรับส่วนลดดอกเบี้ยในอนาคต
          </p>
        </div>

        <!-- Breakdown -->
        <div class="breakdown">
          <div class="breakdown-row">
            <span class="label">เงินต้นคงเหลือ:</span>
            <span class="value">{{ formatCurrency(calculation.principalAmount) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="label">ดอกเบี้ยในอนาคต:</span>
            <span class="value original">
              <s>{{ formatCurrency(calculation.originalInterest) }}</s>
            </span>
          </div>
          <div class="breakdown-row discount">
            <span class="label">ส่วนลดดอกเบี้ย ({{ discountRate }}%):</span>
            <span class="value">-{{ formatCurrency(calculation.savings) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="label">ดอกเบี้ยหลังส่วนลด:</span>
            <span class="value">{{ formatCurrency(calculation.interestAmount) }}</span>
          </div>
          <div v-if="calculation.lateFees > 0" class="breakdown-row alert">
            <span class="label">ค่าปรับค้างชำระ:</span>
            <span class="value">{{ formatCurrency(calculation.lateFees) }}</span>
          </div>
          <div class="breakdown-divider"></div>
          <div class="breakdown-row total">
            <span class="label">รวมที่ต้องชำระ:</span>
            <span class="value">{{ formatCurrency(calculation.totalAmount) }}</span>
          </div>
        </div>

        <!-- Savings Highlight -->
        <div class="savings-highlight">
          <div class="savings-amount">
            <span class="icon">💰</span>
            <div class="savings-text">
              <span class="label">คุณจะประหยัด</span>
              <span class="amount">{{ formatCurrency(calculation.savings) }}</span>
            </div>
          </div>
          <p class="savings-desc">
            จากการชำระก่อนกำหนดทั้งหมด
          </p>
        </div>

        <!-- Comparison Table -->
        <div class="comparison-table">
          <h4>เปรียบเทียบ</h4>
          <table>
            <thead>
              <tr>
                <th></th>
                <th class="highlight">ชำระก่อนกำหนด</th>
                <th>ชำระตามปกติ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="label">ยอดชำระ</td>
                <td class="value highlight">{{ formatCurrency(calculation.totalAmount) }}</td>
                <td class="value">{{ formatCurrency(loan.totalRemaining) }}</td>
              </tr>
              <tr>
                <td class="label">ดอกเบี้ย</td>
                <td class="value highlight">{{ formatCurrency(calculation.interestAmount) }}</td>
                <td class="value">{{ formatCurrency(calculation.originalInterest) }}</td>
              </tr>
              <tr>
                <td class="label">ประหยัด</td>
                <td class="value savings" colspan="2">{{ formatCurrency(calculation.savings) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action Button -->
        <div class="action-section">
          <button class="btn-proceed" @click="handleProceed">
            <span class="icon">✓</span>
            <span>ชำระก่อนกำหนด {{ formatCurrency(calculation.totalAmount) }}</span>
          </button>
          <p class="action-note">
            * ยอดชำระอาจมีการเปลี่ยนแปลงขึ้นอยู่กับวันที่ชำระจริง
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading">
        <span class="spinner"></span>
        <span>กำลังคำนวณ...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  loan: {
    type: Object,
    required: true,
  },
  discountRate: {
    type: Number,
    default: 30, // 30% discount
  },
})

const emit = defineEmits(['proceed'])

const calculation = ref(null)

const canEarlyRepay = computed(() => {
  return props.loan.status === 'ACTIVE' && props.loan.remainingPrincipal > 0
})

onMounted(() => {
  if (canEarlyRepay.value) {
    calculateEarlyRepayment()
  }
})

const calculateEarlyRepayment = () => {
  const principalAmount = props.loan.remainingPrincipal
  const originalInterest = props.loan.remainingInterest
  const discountAmount = (originalInterest * props.discountRate) / 100
  const discountedInterest = originalInterest - discountAmount

  // Get outstanding late fees
  const lateFees = (props.loan.totalLateFees || 0) - (props.loan.totalFeesPaid || 0)

  calculation.value = {
    principalAmount,
    originalInterest,
    interestAmount: discountedInterest,
    lateFees,
    savings: discountAmount,
    totalAmount: principalAmount + discountedInterest + lateFees,
  }
}

const handleProceed = () => {
  emit('proceed', calculation.value)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<style scoped>
.early-repayment-calculator {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.calculator-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.savings-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.not-available .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.not-available p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.calculator-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.status-card h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.status-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.status-row.highlight {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: 600;
}

.status-row .label {
  color: #666;
}

.status-row .value {
  font-weight: 600;
  color: #333;
}

.calculation-card {
  padding: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  border: 2px solid #2196f3;
}

.calculation-card h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
}

.discount-info {
  margin-bottom: 20px;
  text-align: center;
}

.discount-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  margin-bottom: 8px;
}

.discount-badge .icon {
  font-size: 20px;
}

.discount-desc {
  margin: 0;
  font-size: 13px;
  color: #1976d2;
}

.breakdown {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.breakdown-row .label {
  color: #666;
}

.breakdown-row .value {
  font-weight: 600;
  color: #333;
}

.breakdown-row.discount .value {
  color: #4caf50;
  font-size: 15px;
}

.breakdown-row.alert .value {
  color: #f44336;
}

.breakdown-row .value.original s {
  color: #999;
}

.breakdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 12px 0;
}

.breakdown-row.total {
  font-size: 16px;
  font-weight: 700;
  padding-top: 12px;
}

.breakdown-row.total .value {
  color: #2196f3;
  font-size: 18px;
}

.savings-highlight {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.savings-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.savings-amount .icon {
  font-size: 32px;
}

.savings-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.savings-text .label {
  font-size: 13px;
  opacity: 0.9;
}

.savings-text .amount {
  font-size: 28px;
  font-weight: 700;
}

.savings-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.comparison-table {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.comparison-table h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 10px 8px;
  text-align: right;
  font-size: 13px;
}

.comparison-table th:first-child,
.comparison-table td:first-child {
  text-align: left;
}

.comparison-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

.comparison-table th.highlight {
  color: #2196f3;
  background: #e3f2fd;
}

.comparison-table td.label {
  color: #666;
}

.comparison-table td.value {
  font-weight: 600;
  color: #333;
}

.comparison-table td.value.highlight {
  color: #2196f3;
  font-size: 14px;
}

.comparison-table td.value.savings {
  color: #4caf50;
  font-size: 15px;
  text-align: center;
}

.comparison-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.action-section {
  text-align: center;
}

.btn-proceed {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-proceed:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.5);
}

.btn-proceed:active {
  transform: translateY(0);
}

.btn-proceed .icon {
  font-size: 20px;
}

.action-note {
  margin: 12px 0 0;
  font-size: 12px;
  color: #666;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 12px;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .early-repayment-calculator {
    padding: 16px;
  }

  .calculator-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .savings-badge {
    align-self: stretch;
    text-align: center;
  }

  .discount-badge {
    font-size: 14px;
    padding: 8px 16px;
  }

  .savings-text .amount {
    font-size: 24px;
  }

  .comparison-table {
    overflow-x: auto;
  }

  .comparison-table table {
    min-width: 400px;
  }

  .btn-proceed {
    width: 100%;
    justify-content: center;
  }
}
</style>
