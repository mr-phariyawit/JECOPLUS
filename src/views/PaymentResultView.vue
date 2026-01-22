<template>
  <div class="result screen screen--no-nav screen--center">
    <!-- Success State -->
    <template v-if="isSuccess">
      <div class="result__content animate-slideUp">
        <div class="result__icon result__icon--success">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="var(--color-success)"/>
            <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h1 class="result__title">ชำระเงินสำเร็จ!</h1>
        <p class="result__subtitle">การชำระค่างวดเสร็จสมบูรณ์</p>
        
        <JCard class="result__receipt">
          <div class="receipt">
            <div class="receipt__row">
              <span>หมายเลขอ้างอิง</span>
              <span class="receipt__value">{{ transaction?.reference }}</span>
            </div>
            <div class="receipt__row">
              <span>วิธีชำระ</span>
              <span class="receipt__value">{{ getMethodName(transaction?.method) }}</span>
            </div>
            <div class="receipt__row">
              <span>วันที่ชำระ</span>
              <span class="receipt__value">{{ formatDateTime(transaction?.timestamp) }}</span>
            </div>
            <div class="receipt__divider"></div>
            <div class="receipt__row receipt__row--total">
              <span>ยอดชำระ</span>
              <span class="receipt__amount">฿{{ formatCurrency(transaction?.amount) }}</span>
            </div>
          </div>
        </JCard>
      </div>
    </template>

    <!-- Failed State -->
    <template v-else>
      <div class="result__content animate-slideUp">
        <div class="result__icon result__icon--failed">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="var(--color-error)"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        
        <h1 class="result__title">ชำระเงินไม่สำเร็จ</h1>
        <p class="result__subtitle">กรุณาลองใหม่อีกครั้ง หรือเปลี่ยนวิธีชำระ</p>
        
        <div class="result__error-info">
          <p class="text-small">รหัสข้อผิดพลาด: {{ transaction?.reference }}</p>
        </div>
      </div>
    </template>

    <!-- Actions -->
    <div class="result__footer">
      <JButton v-if="isSuccess" variant="primary" @click="goToDashboard">
        กลับหน้าหลัก
      </JButton>
      <template v-else>
        <JButton variant="primary" @click="retry">
          ลองใหม่
        </JButton>
        <JButton variant="outline" @click="goToDashboard">
          กลับหน้าหลัก
        </JButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '../stores/payment'
import { formatCurrency } from '../services/mockData'
import JCard from '../components/base/JCard.vue'
import JButton from '../components/base/JButton.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const isSuccess = computed(() => route.params.status === 'success')
const transaction = computed(() => paymentStore.lastTransaction)

const getMethodName = (method) => {
  const names = {
    JWALLET: 'J Wallet',
    CREDIT_CARD: 'บัตรเครดิต',
    BANK_ACCOUNT: 'บัญชีธนาคาร'
  }
  return names[method] || method
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goToDashboard = () => {
  router.replace('/dashboard')
}

const retry = () => {
  router.back()
}
</script>

<style scoped>
.result {
  padding: var(--space-xl) var(--space-md);
}

.result__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.result__icon {
  margin-bottom: var(--space-lg);
}

.result__title {
  font-size: var(--font-size-subheader);
  margin-bottom: var(--space-xs);
}

.result__subtitle {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xl);
}

.result__receipt {
  width: 100%;
  margin-top: var(--space-md);
}

.receipt__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  font-size: var(--font-size-small);
}

.receipt__row span:first-child {
  color: var(--color-gray-4);
}

.receipt__value {
  font-weight: var(--font-weight-medium);
}

.receipt__divider {
  height: 1px;
  background: var(--color-gray-2);
  margin: var(--space-sm) 0;
}

.receipt__row--total {
  padding-top: var(--space-md);
}

.receipt__amount {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.result__error-info {
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  color: var(--color-gray-4);
}

.result__footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
}
</style>
