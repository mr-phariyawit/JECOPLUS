<template>
  <div class="pay-methods screen screen--no-nav">
    <JHeader title="เลือกวิธีชำระเงิน" />

    <!-- Payment Summary -->
    <section class="pay-methods__summary">
      <JCard>
        <div class="payment-summary">
          <div class="payment-summary__row">
            <span>งวดที่</span>
            <span class="payment-summary__value">{{ installment?.no }}</span>
          </div>
          <div class="payment-summary__row">
            <span>วันครบกำหนด</span>
            <span class="payment-summary__value">{{ formatDate(installment?.dueDate) }}</span>
          </div>
          <div class="payment-summary__row payment-summary__row--total">
            <span>ยอดชำระ</span>
            <span class="payment-summary__amount amount">฿{{ formatCurrency(installment?.amount) }}</span>
          </div>
        </div>
      </JCard>
    </section>

    <!-- Payment Methods List -->
    <section class="pay-methods__list section">
      <h2 class="section-title">วิธีชำระเงิน</h2>

      <div v-if="paymentStore.methods.length === 0" class="pay-methods__loading">
        <div v-for="i in 3" :key="i" class="skeleton" style="height: 80px; margin-bottom: 12px;"></div>
      </div>

      <div v-else class="methods-grid">
        <!-- J Wallet -->
        <JCard 
          selectable
          :selected="selectedMethod === 'JWALLET'"
          @click="selectMethod('JWALLET')"
        >
          <div class="method-card">
            <div class="method-card__icon method-card__icon--jwallet">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
                <circle cx="17" cy="15" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div class="method-card__info">
              <span class="method-card__name">J Wallet</span>
              <span class="method-card__desc text-mini">ชำระผ่านกระเป๋าเงิน J Wallet</span>
            </div>
            <div class="method-card__check" v-if="selectedMethod === 'JWALLET'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--color-red)"/>
                <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </JCard>

        <!-- Credit Card -->
        <JCard 
          selectable
          :selected="selectedMethod === 'CREDIT_CARD'"
          @click="selectMethod('CREDIT_CARD')"
        >
          <div class="method-card">
            <div class="method-card__icon method-card__icon--card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
                <path d="M6 15H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="method-card__info">
              <span class="method-card__name">บัตรเครดิต / เดบิต</span>
              <span class="method-card__desc text-mini">
                <template v-if="paymentStore.cards.length > 0">
                  {{ paymentStore.cards.length }} บัตรที่ผูกไว้
                </template>
                <template v-else>
                  ยังไม่มีบัตรที่ผูกไว้
                </template>
              </span>
            </div>
            <div class="method-card__check" v-if="selectedMethod === 'CREDIT_CARD'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--color-red)"/>
                <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </JCard>

        <!-- Bank Account -->
        <JCard 
          selectable
          :selected="selectedMethod === 'BANK_ACCOUNT'"
          @click="selectMethod('BANK_ACCOUNT')"
        >
          <div class="method-card">
            <div class="method-card__icon method-card__icon--bank">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                <path d="M5 10V17M9 10V17M15 10V17M19 10V17" stroke="currentColor" stroke-width="2"/>
                <path d="M12 3L21 10H3L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="method-card__info">
              <span class="method-card__name">บัญชีธนาคาร</span>
              <span class="method-card__desc text-mini">
                <template v-if="paymentStore.banks.length > 0">
                  {{ paymentStore.banks.length }} บัญชีที่ผูกไว้
                </template>
                <template v-else>
                  ยังไม่มีบัญชีที่ผูกไว้
                </template>
              </span>
            </div>
            <div class="method-card__check" v-if="selectedMethod === 'BANK_ACCOUNT'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--color-red)"/>
                <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </JCard>
      </div>
    </section>

    <!-- Continue Button -->
    <div class="pay-methods__footer">
      <JButton 
        variant="primary" 
        :disabled="!selectedMethod"
        @click="continuePayment"
      >
        ดำเนินการต่อ
      </JButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '../stores/loans'
import { usePaymentStore } from '../stores/payment'
import { formatCurrency, formatDate } from '../services/mockData'
import JHeader from '../components/layout/JHeader.vue'
import JCard from '../components/base/JCard.vue'
import JButton from '../components/base/JButton.vue'

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()
const paymentStore = usePaymentStore()

const selectedMethod = ref(null)

const installment = computed(() => {
  return loansStore.installments.find(i => i.installmentId === route.params.installmentId)
})

const selectMethod = (method) => {
  selectedMethod.value = method
  paymentStore.selectMethod(method)
}

const continuePayment = () => {
  const { loanId, installmentId } = route.params
  
  switch (selectedMethod.value) {
    case 'JWALLET':
      router.push(`/pay/jwallet/${loanId}/${installmentId}`)
      break
    case 'CREDIT_CARD':
      router.push(`/pay/card/${loanId}/${installmentId}`)
      break
    case 'BANK_ACCOUNT':
      router.push(`/pay/bank/${loanId}/${installmentId}`)
      break
  }
}

onMounted(async () => {
  await loansStore.fetchLoanDetail(route.params.loanId)
  await paymentStore.fetchPaymentMethods()
})
</script>

<style scoped>
.pay-methods__summary {
  margin-bottom: var(--space-lg);
}

.payment-summary__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-gray-1);
}

.payment-summary__row:last-child {
  border-bottom: none;
  padding-top: var(--space-md);
}

.payment-summary__row--total {
  margin-top: var(--space-sm);
}

.payment-summary__value {
  font-weight: var(--font-weight-medium);
}

.payment-summary__amount {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.methods-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.method-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xs) 0;
}

.method-card__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-white);
}

.method-card__icon--jwallet {
  background: linear-gradient(135deg, var(--color-red), #ff4444);
}

.method-card__icon--card {
  background: linear-gradient(135deg, var(--color-black), #3d3d3d);
}

.method-card__icon--bank {
  background: linear-gradient(135deg, #1E4598, #3B82F6);
}

.method-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-card__name {
  font-weight: var(--font-weight-medium);
}

.pay-methods__footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: var(--space-md);
  background: var(--color-white);
  border-top: 1px solid var(--color-gray-2);
}
</style>
