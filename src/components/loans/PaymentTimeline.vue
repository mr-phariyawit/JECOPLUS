<template>
  <div class="payment-timeline">
    <div class="timeline-header">
      <h3>ประวัติการชำระเงิน</h3>
      <div class="timeline-stats">
        <div class="stat-item success">
          <span class="icon">✓</span>
          <span>{{ onTimeCount }}</span>
        </div>
        <div class="stat-item late">
          <span class="icon">⚠</span>
          <span>{{ lateCount }}</span>
        </div>
        <div class="stat-item pending">
          <span class="icon">○</span>
          <span>{{ pendingCount }}</span>
        </div>
      </div>
    </div>

    <div class="timeline-content">
      <!-- Timeline visualization -->
      <div class="timeline-track">
        <div
          v-for="(item, index) in timelineItems"
          :key="item.installmentId"
          class="timeline-item"
          :class="getItemClass(item)"
          @click="selectItem(item)"
        >
          <div class="timeline-dot" :class="getDotClass(item)">
            <span class="dot-icon">{{ getIcon(item) }}</span>
          </div>
          <div class="timeline-label">
            <span class="installment-no">{{ item.installmentNo }}</span>
          </div>
          <div v-if="index < timelineItems.length - 1" class="timeline-connector"></div>
        </div>
      </div>

      <!-- Selected item details -->
      <transition name="slide-up">
        <div v-if="selectedItem" class="item-details">
          <div class="details-header">
            <h4>งวดที่ {{ selectedItem.installmentNo }}</h4>
            <button class="close-btn" @click="selectedItem = null">×</button>
          </div>

          <div class="details-content">
            <div class="detail-row">
              <span class="label">สถานะ:</span>
              <span class="value">
                <span class="status-badge" :class="getStatusClass(selectedItem)">
                  {{ getStatusText(selectedItem) }}
                </span>
              </span>
            </div>

            <div class="detail-row">
              <span class="label">วันครบกำหนด:</span>
              <span class="value">{{ formatDate(selectedItem.dueDate) }}</span>
            </div>

            <div v-if="selectedItem.gracePeriodEndDate" class="detail-row">
              <span class="label">Grace Period:</span>
              <span class="value">{{ formatDate(selectedItem.gracePeriodEndDate) }}</span>
            </div>

            <div v-if="selectedItem.paymentDate" class="detail-row">
              <span class="label">วันที่ชำระ:</span>
              <span class="value">{{ formatDate(selectedItem.paymentDate) }}</span>
            </div>

            <div v-if="selectedItem.daysLate > 0" class="detail-row alert">
              <span class="label">ล่าช้า:</span>
              <span class="value">{{ selectedItem.daysLate }} วัน</span>
            </div>

            <div class="detail-divider"></div>

            <div class="detail-row">
              <span class="label">ยอดที่ต้องชำระ:</span>
              <span class="value amount">{{ formatCurrency(selectedItem.totalAmount) }}</span>
            </div>

            <div class="detail-row sub">
              <span class="label">- เงินต้น:</span>
              <span class="value">{{ formatCurrency(selectedItem.principalAmount) }}</span>
            </div>

            <div class="detail-row sub">
              <span class="label">- ดอกเบี้ย:</span>
              <span class="value">{{ formatCurrency(selectedItem.interestAmount) }}</span>
            </div>

            <div v-if="selectedItem.lateFee > 0" class="detail-row sub alert">
              <span class="label">- ค่าปรับ:</span>
              <span class="value">{{ formatCurrency(selectedItem.lateFee) }}</span>
            </div>

            <div v-if="selectedItem.status === 'PAID'" class="detail-divider"></div>

            <div v-if="selectedItem.paidAmount" class="detail-row success">
              <span class="label">ชำระแล้ว:</span>
              <span class="value amount">{{ formatCurrency(selectedItem.paidAmount) }}</span>
            </div>

            <div v-if="selectedItem.paymentMethod" class="detail-row">
              <span class="label">ช่องทาง:</span>
              <span class="value">{{ getPaymentMethodText(selectedItem.paymentMethod) }}</span>
            </div>

            <div v-if="selectedItem.paymentReference" class="detail-row">
              <span class="label">เลขอ้างอิง:</span>
              <span class="value ref">{{ selectedItem.paymentReference }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- Legend -->
      <div class="timeline-legend">
        <div class="legend-item">
          <div class="legend-dot success"></div>
          <span>ชำระตรงเวลา</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot late"></div>
          <span>ชำระล่าช้า</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot partial"></div>
          <span>ชำระบางส่วน</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot pending"></div>
          <span>รอชำระ</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot upcoming"></div>
          <span>ยังไม่ถึงกำหนด</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  installments: {
    type: Array,
    required: true,
  },
})

const selectedItem = ref(null)

const timelineItems = computed(() => {
  return [...props.installments].sort((a, b) => a.installmentNo - b.installmentNo)
})

const onTimeCount = computed(() => {
  return timelineItems.value.filter((item) => item.status === 'PAID' && item.isPaidOnTime).length
})

const lateCount = computed(() => {
  return timelineItems.value.filter((item) => (item.status === 'PAID' || item.status === 'OVERDUE') && !item.isPaidOnTime && item.daysLate > 5).length
})

const pendingCount = computed(() => {
  return timelineItems.value.filter((item) => item.status === 'PENDING' || item.status === 'OVERDUE').length
})

const getItemClass = (item) => {
  const classes = []
  if (selectedItem.value?.installmentId === item.installmentId) {
    classes.push('selected')
  }
  return classes.join(' ')
}

const getDotClass = (item) => {
  if (item.status === 'UPCOMING') return 'upcoming'
  if (item.status === 'PENDING' || item.status === 'OVERDUE') {
    return item.daysLate > 0 ? 'overdue' : 'pending'
  }
  if (item.status === 'PARTIALLY_PAID') return 'partial'
  if (item.status === 'PAID') {
    return item.isPaidOnTime ? 'success' : 'late'
  }
  return 'default'
}

const getIcon = (item) => {
  if (item.status === 'UPCOMING') return '○'
  if (item.status === 'PENDING') return '○'
  if (item.status === 'OVERDUE') return '!'
  if (item.status === 'PARTIALLY_PAID') return '◐'
  if (item.status === 'PAID') {
    return item.isPaidOnTime ? '✓' : '⚠'
  }
  return '○'
}

const getStatusClass = (item) => {
  if (item.status === 'PAID') {
    return item.isPaidOnTime ? 'success' : 'late'
  }
  if (item.status === 'OVERDUE') return 'overdue'
  if (item.status === 'PARTIALLY_PAID') return 'partial'
  if (item.status === 'PENDING') return 'pending'
  return 'default'
}

const getStatusText = (item) => {
  const statusMap = {
    UPCOMING: 'ยังไม่ถึงกำหนด',
    PENDING: 'รอชำระ',
    OVERDUE: 'เกินกำหนด',
    PARTIALLY_PAID: 'ชำระบางส่วน',
    PAID: item.isPaidOnTime ? 'ชำระตรงเวลา' : 'ชำระล่าช้า',
  }
  return statusMap[item.status] || item.status
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    JWALLET: 'J Wallet',
    CREDIT_CARD: 'บัตรเครดิต',
    BANK_ACCOUNT: 'บัญชีธนาคาร',
    BANK_TRANSFER: 'โอนผ่านธนาคาร',
    CASH: 'เงินสด',
  }
  return methodMap[method] || method
}

const selectItem = (item) => {
  selectedItem.value = item
}

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
.payment-timeline {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.timeline-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.timeline-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.stat-item.success {
  background: #e8f5e9;
  color: #4caf50;
}

.stat-item.late {
  background: #ffebee;
  color: #f44336;
}

.stat-item.pending {
  background: #fff3e0;
  color: #ff9800;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-track {
  display: flex;
  overflow-x: auto;
  padding: 20px 10px;
  gap: 8px;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  cursor: pointer;
  transition: all 0.2s;
}

.timeline-item:hover .timeline-dot {
  transform: scale(1.2);
}

.timeline-item.selected .timeline-dot {
  transform: scale(1.3);
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-dot.success {
  background: #4caf50;
  color: white;
}

.timeline-dot.late {
  background: #ff9800;
  color: white;
}

.timeline-dot.overdue {
  background: #f44336;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
}

.timeline-dot.partial {
  background: linear-gradient(90deg, #4caf50 50%, #ff9800 50%);
  color: white;
}

.timeline-dot.pending {
  background: #fff3e0;
  color: #ff9800;
  border: 2px solid #ff9800;
}

.timeline-dot.upcoming {
  background: #f5f5f5;
  color: #999;
  border: 2px solid #e0e0e0;
}

.timeline-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.timeline-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #e0e0e0;
  z-index: -1;
}

.item-details {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.details-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
}

.close-btn:hover {
  color: #333;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row.sub {
  padding-left: 16px;
  font-size: 13px;
}

.detail-row .label {
  color: #666;
}

.detail-row .value {
  font-weight: 600;
  color: #333;
}

.detail-row .value.amount {
  font-size: 16px;
}

.detail-row .value.ref {
  font-family: monospace;
  font-size: 12px;
}

.detail-row.alert .value {
  color: #f44336;
}

.detail-row.success .value {
  color: #4caf50;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: #4caf50;
  color: white;
}

.status-badge.late {
  background: #ff9800;
  color: white;
}

.status-badge.overdue {
  background: #f44336;
  color: white;
}

.status-badge.partial {
  background: #2196f3;
  color: white;
}

.status-badge.pending {
  background: #ffc107;
  color: white;
}

.detail-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.legend-dot.success {
  background: #4caf50;
}

.legend-dot.late {
  background: #ff9800;
}

.legend-dot.partial {
  background: linear-gradient(90deg, #4caf50 50%, #ff9800 50%);
}

.legend-dot.pending {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.legend-dot.upcoming {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .payment-timeline {
    padding: 16px;
  }

  .timeline-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .timeline-stats {
    width: 100%;
    justify-content: space-between;
  }

  .stat-item {
    flex: 1;
    justify-content: center;
  }

  .timeline-item {
    min-width: 50px;
  }

  .timeline-dot {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .item-details {
    padding: 16px;
  }

  .timeline-legend {
    gap: 12px;
  }

  .legend-item {
    flex: 1 1 calc(50% - 6px);
    min-width: calc(50% - 6px);
  }
}
</style>
