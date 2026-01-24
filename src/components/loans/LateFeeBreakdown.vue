<template>
  <div class="late-fee-breakdown">
    <div class="breakdown-header">
      <h3>รายละเอียดค่าปรับ</h3>
      <span v-if="totalLateFee > 0" class="total-badge">{{ formatCurrency(totalLateFee) }}</span>
    </div>

    <div v-if="!hasLateFees" class="no-late-fees">
      <span class="icon">✓</span>
      <p>ไม่มีค่าปรับ - ชำระตรงเวลาทุกงวด</p>
    </div>

    <div v-else class="breakdown-content">
      <!-- Grace Period Info -->
      <div class="info-card grace-period">
        <div class="info-icon">⏱️</div>
        <div class="info-text">
          <h4>Grace Period</h4>
          <p>5 วันหลังวันครบกำหนด ไม่มีค่าปรับ</p>
        </div>
      </div>

      <!-- Late Fee Calculation -->
      <div class="calculation-card">
        <h4>การคำนวณค่าปรับ</h4>
        <div class="calc-rows">
          <div class="calc-row">
            <span class="label">อัตราค่าปรับ:</span>
            <span class="value">200 ฿/วัน</span>
          </div>
          <div class="calc-row">
            <span class="label">ค่าปรับสูงสุด:</span>
            <span class="value">1,000 ฿ (5x)</span>
          </div>
        </div>
      </div>

      <!-- Late Installments List -->
      <div class="late-installments">
        <h4>งวดที่มีค่าปรับ</h4>
        <div class="installment-list">
          <div
            v-for="item in lateInstallments"
            :key="item.installmentId"
            class="installment-item"
            :class="{ 'is-paid': item.status === 'PAID' }"
          >
            <div class="installment-info">
              <div class="installment-number">งวดที่ {{ item.installmentNo }}</div>
              <div class="due-date">
                ครบกำหนด: {{ formatDate(item.dueDate) }}
              </div>
              <div v-if="item.paymentDate" class="payment-date">
                ชำระเมื่อ: {{ formatDate(item.paymentDate) }}
              </div>
            </div>

            <div class="fee-calculation">
              <div class="days-late">
                <span class="icon">📅</span>
                <span>{{ item.daysLate }} วัน</span>
              </div>
              <div class="fee-formula">
                200฿ × {{ item.daysLate }} = {{ formatCurrency(item.calculatedFee) }}
              </div>
              <div v-if="item.cappedFee < item.calculatedFee" class="fee-capped">
                <span class="icon">⚠️</span>
                <span>จำกัดที่ {{ formatCurrency(item.cappedFee) }}</span>
              </div>
              <div class="fee-amount" :class="{ 'waived': item.isWaived }">
                <span v-if="!item.isWaived">{{ formatCurrency(item.appliedFee) }}</span>
                <span v-else class="waived-text">
                  <s>{{ formatCurrency(item.appliedFee) }}</s> ยกเว้น
                </span>
              </div>
            </div>

            <div v-if="item.status === 'PAID'" class="paid-badge">
              <span class="icon">✓</span>
              <span>ชำระแล้ว</span>
            </div>
            <div v-else class="unpaid-badge">
              <span class="icon">!</span>
              <span>ค้างชำระ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card">
        <div class="summary-row">
          <span class="label">รวมค่าปรับทั้งหมด:</span>
          <span class="value total">{{ formatCurrency(totalCalculatedFee) }}</span>
        </div>
        <div v-if="totalWaived > 0" class="summary-row waived">
          <span class="label">ยกเว้น:</span>
          <span class="value">-{{ formatCurrency(totalWaived) }}</span>
        </div>
        <div class="summary-row highlight">
          <span class="label">ค่าปรับที่ต้องชำระ:</span>
          <span class="value">{{ formatCurrency(totalAppliedFee) }}</span>
        </div>
        <div v-if="paidLateFee > 0" class="summary-row paid">
          <span class="label">ชำระแล้ว:</span>
          <span class="value">{{ formatCurrency(paidLateFee) }}</span>
        </div>
        <div v-if="unpaidLateFee > 0" class="summary-row unpaid">
          <span class="label">ค้างชำระ:</span>
          <span class="value alert">{{ formatCurrency(unpaidLateFee) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  installments: {
    type: Array,
    required: true,
  },
})

const lateInstallments = computed(() => {
  return props.installments
    .filter((inst) => inst.daysLate > 5 || inst.lateFee > 0)
    .map((inst) => {
      const calculatedFee = 200 * inst.daysLate
      const cappedFee = Math.min(calculatedFee, 1000)
      return {
        ...inst,
        calculatedFee,
        cappedFee,
        appliedFee: inst.lateFee || 0,
        isWaived: inst.isWaived || false,
      }
    })
})

const hasLateFees = computed(() => lateInstallments.value.length > 0)

const totalCalculatedFee = computed(() => {
  return lateInstallments.value.reduce((sum, item) => sum + item.calculatedFee, 0)
})

const totalWaived = computed(() => {
  return lateInstallments.value
    .filter((item) => item.isWaived)
    .reduce((sum, item) => sum + item.appliedFee, 0)
})

const totalAppliedFee = computed(() => {
  return lateInstallments.value.reduce((sum, item) => sum + item.appliedFee, 0)
})

const paidLateFee = computed(() => {
  return lateInstallments.value
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.appliedFee, 0)
})

const unpaidLateFee = computed(() => {
  return lateInstallments.value
    .filter((item) => item.status !== 'PAID')
    .reduce((sum, item) => sum + item.appliedFee, 0)
})

const totalLateFee = computed(() => totalAppliedFee.value)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.late-fee-breakdown {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.breakdown-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-badge {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.no-late-fees {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.no-late-fees .icon {
  font-size: 48px;
  color: #4caf50;
  margin-bottom: 12px;
}

.no-late-fees p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.breakdown-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.info-icon {
  font-size: 24px;
  line-height: 1;
}

.info-text h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-text p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.calculation-card {
  padding: 16px;
  background: #fff3e0;
  border-radius: 8px;
  border: 1px solid #ff9800;
}

.calculation-card h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.calc-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.calc-row .label {
  color: #666;
}

.calc-row .value {
  font-weight: 600;
  color: #333;
}

.late-installments h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.installment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.installment-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  position: relative;
}

.installment-item.is-paid {
  background: #f1f8f4;
  border-color: #4caf50;
}

.installment-info {
  margin-bottom: 12px;
}

.installment-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.due-date,
.payment-date {
  font-size: 12px;
  color: #666;
}

.fee-calculation {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.days-late {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f44336;
  font-weight: 600;
}

.fee-formula {
  color: #666;
  font-family: monospace;
}

.fee-capped {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff9800;
  font-size: 12px;
}

.fee-amount {
  font-size: 16px;
  font-weight: 700;
  color: #f44336;
  margin-top: 4px;
}

.fee-amount.waived {
  color: #4caf50;
}

.waived-text s {
  color: #999;
}

.paid-badge,
.unpaid-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.paid-badge {
  background: #4caf50;
  color: white;
}

.unpaid-badge {
  background: #f44336;
  color: white;
}

.summary-card {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.summary-row .label {
  color: #666;
}

.summary-row .value {
  font-weight: 600;
  color: #333;
}

.summary-row.waived .value {
  color: #4caf50;
}

.summary-row.highlight {
  background: #fff3e0;
  margin: 8px -16px;
  padding: 12px 16px;
  border-radius: 6px;
}

.summary-row.highlight .value {
  color: #ff9800;
  font-size: 16px;
}

.summary-row.paid .value {
  color: #4caf50;
}

.summary-row.unpaid .value.alert {
  color: #f44336;
  font-size: 16px;
}

.summary-row.total .value {
  font-size: 16px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .late-fee-breakdown {
    padding: 16px;
  }

  .breakdown-header h3 {
    font-size: 16px;
  }

  .installment-item {
    padding: 12px;
  }

  .paid-badge,
  .unpaid-badge {
    position: static;
    align-self: flex-start;
    margin-top: 8px;
  }
}
</style>
