<template>
  <div class="modification-proposal">
    <div class="proposal-header">
      <h3>ข้อเสนอปรับโครงสร้างสินเชื่อ</h3>
      <span v-if="savings > 0" class="savings-badge success">
        ลดค่าผ่อน {{ formatCurrency(savings) }}/เดือน
      </span>
      <span v-else-if="savings < 0" class="savings-badge increase">
        เพิ่มค่าผ่อน {{ formatCurrency(Math.abs(savings)) }}/เดือน
      </span>
    </div>

    <div class="proposal-content">
      <!-- Modification Reason -->
      <div v-if="modificationReason" class="reason-card">
        <h4>เหตุผลในการปรับโครงสร้าง</h4>
        <p>{{ modificationReason }}</p>
      </div>

      <!-- Comparison Cards -->
      <div class="comparison-container">
        <!-- Original Terms -->
        <div class="terms-card original">
          <div class="card-header">
            <h4>เงื่อนไขเดิม</h4>
            <span class="badge">ก่อนปรับ</span>
          </div>
          <div class="terms-content">
            <div class="term-item">
              <span class="icon">📅</span>
              <div class="term-info">
                <span class="label">ระยะเวลา</span>
                <span class="value">{{ original.termMonths }} เดือน</span>
              </div>
            </div>
            <div class="term-item">
              <span class="icon">%</span>
              <div class="term-info">
                <span class="label">อัตราดอกเบี้ย</span>
                <span class="value">{{ original.interestRate }}%</span>
              </div>
            </div>
            <div class="term-item highlight">
              <span class="icon">💰</span>
              <div class="term-info">
                <span class="label">ค่าผ่อนต่อเดือน</span>
                <span class="value">{{ formatCurrency(original.monthlyPayment) }}</span>
              </div>
            </div>
            <div class="term-item">
              <span class="icon">📊</span>
              <div class="term-info">
                <span class="label">ยอดรวมที่ต้องชำระ</span>
                <span class="value">{{ formatCurrency(original.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div class="arrow-container">
          <div class="arrow">→</div>
        </div>

        <!-- Proposed Terms -->
        <div class="terms-card proposed">
          <div class="card-header">
            <h4>เงื่อนไขใหม่</h4>
            <span class="badge">หลังปรับ</span>
          </div>
          <div class="terms-content">
            <div class="term-item" :class="{ changed: original.termMonths !== proposed.termMonths }">
              <span class="icon">📅</span>
              <div class="term-info">
                <span class="label">ระยะเวลา</span>
                <span class="value">{{ proposed.termMonths }} เดือน</span>
                <span v-if="original.termMonths !== proposed.termMonths" class="change">
                  (+{{ proposed.termMonths - original.termMonths }})
                </span>
              </div>
            </div>
            <div class="term-item" :class="{ changed: original.interestRate !== proposed.interestRate }">
              <span class="icon">%</span>
              <div class="term-info">
                <span class="label">อัตราดอกเบี้ย</span>
                <span class="value">{{ proposed.interestRate }}%</span>
                <span v-if="original.interestRate !== proposed.interestRate" class="change">
                  ({{ proposed.interestRate > original.interestRate ? '+' : '' }}{{ (proposed.interestRate - original.interestRate).toFixed(2) }}%)
                </span>
              </div>
            </div>
            <div class="term-item highlight changed">
              <span class="icon">💰</span>
              <div class="term-info">
                <span class="label">ค่าผ่อนต่อเดือน</span>
                <span class="value">{{ formatCurrency(proposed.monthlyPayment) }}</span>
                <span class="change" :class="{ success: savings > 0, alert: savings < 0 }">
                  ({{ savings > 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(savings)) }})
                </span>
              </div>
            </div>
            <div class="term-item" :class="{ changed: original.totalAmount !== proposed.totalAmount }">
              <span class="icon">📊</span>
              <div class="term-info">
                <span class="label">ยอดรวมที่ต้องชำระ</span>
                <span class="value">{{ formatCurrency(proposed.totalAmount) }}</span>
                <span v-if="original.totalAmount !== proposed.totalAmount" class="change">
                  ({{ proposed.totalAmount > original.totalAmount ? '+' : '' }}{{ formatCurrency(proposed.totalAmount - original.totalAmount) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Changes Summary -->
      <div class="summary-card">
        <h4>สรุปการเปลี่ยนแปลง</h4>
        <div class="summary-grid">
          <div class="summary-item" :class="{ positive: savings > 0, negative: savings < 0 }">
            <span class="label">ค่าผ่อนต่อเดือน</span>
            <span class="value">
              {{ savings > 0 ? 'ลดลง' : 'เพิ่มขึ้น' }} {{ formatCurrency(Math.abs(savings)) }}
            </span>
            <span class="percentage">
              ({{ ((Math.abs(savings) / original.monthlyPayment) * 100).toFixed(1) }}%)
            </span>
          </div>
          <div class="summary-item" :class="{ negative: termIncrease > 0 }">
            <span class="label">ระยะเวลา</span>
            <span class="value">
              {{ termIncrease > 0 ? 'เพิ่ม' : 'ลดลง' }} {{ Math.abs(termIncrease) }} เดือน
            </span>
            <span class="percentage" v-if="termIncrease > 0">
              ({{ ((termIncrease / original.termMonths) * 100).toFixed(0) }}%)
            </span>
          </div>
          <div class="summary-item" :class="{
            positive: rateChange < 0,
            negative: rateChange > 0
          }">
            <span class="label">อัตราดอกเบี้ย</span>
            <span class="value">
              {{ rateChange > 0 ? 'เพิ่ม' : 'ลดลง' }} {{ Math.abs(rateChange).toFixed(2) }}%
            </span>
          </div>
          <div class="summary-item" :class="{ negative: totalChange > 0, positive: totalChange < 0 }">
            <span class="label">ยอดรวมทั้งหมด</span>
            <span class="value">
              {{ totalChange > 0 ? 'เพิ่ม' : 'ลดลง' }} {{ formatCurrency(Math.abs(totalChange)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Benefits & Considerations -->
      <div class="info-section">
        <div class="benefits-card">
          <h4>✓ ข้อดี</h4>
          <ul>
            <li v-for="benefit in benefits" :key="benefit">{{ benefit }}</li>
          </ul>
        </div>

        <div class="considerations-card">
          <h4>! ข้อควรพิจารณา</h4>
          <ul>
            <li v-for="consideration in considerations" :key="consideration">{{ consideration }}</li>
          </ul>
        </div>
      </div>

      <!-- Timeline -->
      <div v-if="modificationDate" class="timeline-card">
        <h4>ไทม์ไลน์</h4>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="date">{{ formatDate(originalStartDate) }}</span>
              <span class="event">สัญญาเดิม</span>
            </div>
          </div>
          <div class="timeline-item active">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="date">{{ formatDate(modificationDate) }}</span>
              <span class="event">ปรับโครงสร้าง</span>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="date">{{ formatDate(proposed.maturityDate) }}</span>
              <span class="event">ครบกำหนด</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn-secondary" @click="$emit('decline')">
          <span>ปฏิเสธ</span>
        </button>
        <button class="btn-primary" @click="$emit('accept')">
          <span class="icon">✓</span>
          <span>ยอมรับข้อเสนอ</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  original: {
    type: Object,
    required: true,
  },
  proposed: {
    type: Object,
    required: true,
  },
  modificationReason: {
    type: String,
    default: '',
  },
  modificationDate: {
    type: String,
    default: '',
  },
  originalStartDate: {
    type: String,
    default: '',
  },
})

defineEmits(['accept', 'decline'])

const savings = computed(() => {
  return props.original.monthlyPayment - props.proposed.monthlyPayment
})

const termIncrease = computed(() => {
  return props.proposed.termMonths - props.original.termMonths
})

const rateChange = computed(() => {
  return props.proposed.interestRate - props.original.interestRate
})

const totalChange = computed(() => {
  return props.proposed.totalAmount - props.original.totalAmount
})

const benefits = computed(() => {
  const list = []
  if (savings.value > 0) {
    list.push(`ลดภาระค่าผ่อนรายเดือน ${formatCurrency(savings.value)}`)
  }
  if (rateChange.value < 0) {
    list.push(`ลดอัตราดอกเบี้ย ${Math.abs(rateChange.value).toFixed(2)}%`)
  }
  list.push('เพิ่มสภาพคล่องทางการเงิน')
  list.push('ลดความเสี่ยงในการผิดนัดชำระ')
  return list
})

const considerations = computed(() => {
  const list = []
  if (termIncrease.value > 0) {
    list.push(`ระยะเวลาผ่อนชำระยาวขึ้น ${termIncrease.value} เดือน`)
  }
  if (totalChange.value > 0) {
    list.push(`ยอดรวมที่ต้องชำระเพิ่มขึ้น ${formatCurrency(totalChange.value)}`)
  }
  if (rateChange.value > 0) {
    list.push(`อัตราดอกเบี้ยเพิ่มขึ้น ${rateChange.value.toFixed(2)}%`)
  }
  list.push('ข้อมูลการปรับโครงสร้างจะถูกบันทึกในประวัติเครดิต')
  return list
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.modification-proposal {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.proposal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.savings-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.savings-badge.success {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.savings-badge.increase {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.proposal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reason-card {
  padding: 16px;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.reason-card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.reason-card p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.comparison-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.terms-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
}

.terms-card.original {
  background: #fafafa;
  border-color: #e0e0e0;
}

.terms-card.proposed {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.card-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.card-header .badge {
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.terms-card.proposed .badge {
  background: #2196f3;
  color: white;
}

.terms-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.term-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.term-item.changed {
  background: #fff9c4;
  border: 1px solid #ffd54f;
}

.term-item.highlight {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  font-weight: 600;
}

.term-item.highlight .label,
.term-item.highlight .value {
  color: white;
}

.term-item .icon {
  font-size: 20px;
  line-height: 1;
}

.term-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.term-info .label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.term-info .value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.term-info .change {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.term-info .change.success {
  color: #4caf50;
  font-weight: 600;
}

.term-info .change.alert {
  color: #f44336;
  font-weight: 600;
}

.arrow-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  font-size: 32px;
  color: #2196f3;
  font-weight: bold;
}

.summary-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.summary-card h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item.positive {
  border-color: #4caf50;
  background: #f1f8f4;
}

.summary-item.negative {
  border-color: #ff9800;
  background: #fff8f1;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.summary-item .percentage {
  font-size: 12px;
  color: #999;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.benefits-card,
.considerations-card {
  padding: 16px;
  border-radius: 8px;
}

.benefits-card {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.considerations-card {
  background: #fff3e0;
  border: 1px solid #ff9800;
}

.benefits-card h4,
.considerations-card h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.benefits-card h4 {
  color: #2e7d32;
}

.considerations-card h4 {
  color: #e65100;
}

.benefits-card ul,
.considerations-card ul {
  margin: 0;
  padding-left: 20px;
}

.benefits-card li,
.considerations-card li {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 6px;
}

.timeline-card {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.timeline-card h4 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 30px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e0e0e0;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e0e0e0;
}

.timeline-item.active .timeline-dot {
  background: #2196f3;
  border-color: #2196f3;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.timeline-content .date {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.timeline-content .event {
  font-size: 11px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.5);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #999;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modification-proposal {
    padding: 16px;
  }

  .proposal-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .savings-badge {
    align-self: stretch;
    text-align: center;
  }

  .comparison-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .arrow-container {
    transform: rotate(90deg);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .info-section {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
