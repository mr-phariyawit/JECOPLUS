<template>
  <div class="pay-card screen screen--no-nav">
    <JHeader title="ชำระด้วยบัตร" />

    <!-- Processing State -->
    <template v-if="paymentStore.isProcessing">
      <div class="processing">
        <div class="processing__animation">
          <div class="processing__circle"></div>
          <div class="processing__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <h2 class="processing__title">กำลังดำเนินการ...</h2>
        <p class="processing__subtitle text-small">กรุณารอสักครู่</p>
      </div>
    </template>

    <!-- Card Selection -->
    <template v-else>
      <section class="pay-card__content">
        <!-- Amount Summary -->
        <div class="amount-summary">
          <p class="amount-summary__label">ยอดที่ต้องชำระ</p>
          <p class="amount-summary__value amount amount--large">฿{{ formatCurrency(installment?.amount) }}</p>
        </div>

        <!-- Linked Cards -->
        <div class="section">
          <h2 class="section-title">เลือกบัตร</h2>

          <template v-if="paymentStore.cards.length > 0">
            <div class="cards-list">
              <JCard 
                v-for="card in paymentStore.cards"
                :key="card.cardId"
                selectable
                :selected="selectedCard === card.cardId"
                @click="selectedCard = card.cardId"
              >
                <div class="card-item">
                  <div class="card-item__brand">
                    <img 
                      :src="getCardBrandLogo(card.brand)" 
                      :alt="card.brand"
                      class="card-item__logo"
                    />
                  </div>
                  <div class="card-item__info">
                    <span class="card-item__number">•••• {{ card.last4 }}</span>
                    <span class="card-item__expiry text-mini">หมดอายุ {{ card.expiry }}</span>
                  </div>
                  <div class="card-item__check" v-if="selectedCard === card.cardId">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="var(--color-red)"/>
                      <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </JCard>
            </div>
          </template>

          <template v-else>
            <div class="empty-cards">
              <p>ยังไม่มีบัตรที่ผูกไว้</p>
            </div>
          </template>

          <!-- Add Card Button -->
          <button class="add-card-btn" @click="showAddCardModal = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>ผูกบัตรใบใหม่</span>
          </button>
        </div>

        <!-- Payment Details -->
        <JCard>
          <div class="payment-details">
            <div class="payment-details__row">
              <span>สินเชื่อ</span>
              <span>{{ loan?.productName }}</span>
            </div>
            <div class="payment-details__row">
              <span>งวดที่</span>
              <span>{{ installment?.no }}</span>
            </div>
          </div>
        </JCard>
      </section>

      <!-- Confirm Button -->
      <div class="pay-card__footer">
        <JButton 
          variant="primary" 
          :disabled="!selectedCard"
          @click="confirmPayment"
        >
          ยืนยันชำระเงิน
        </JButton>
      </div>
    </template>

    <!-- Add Card Modal (simplified) -->
    <div v-if="showAddCardModal" class="modal-overlay" @click.self="showAddCardModal = false">
      <div class="modal">
        <div class="modal__header">
          <h3>ผูกบัตรใบใหม่</h3>
          <button class="modal__close" @click="showAddCardModal = false">×</button>
        </div>
        <div class="modal__body">
          <JInput 
            v-model="newCard.number" 
            label="หมายเลขบัตร" 
            placeholder="1234 5678 9012 3456"
            maxlength="19"
          />
          <div class="modal__row">
            <JInput 
              v-model="newCard.expiry" 
              label="วันหมดอายุ" 
              placeholder="MM/YY"
              maxlength="5"
            />
            <JInput 
              v-model="newCard.cvv" 
              label="CVV" 
              placeholder="123"
              maxlength="3"
              type="password"
            />
          </div>
          <JInput 
            v-model="newCard.name" 
            label="ชื่อบนบัตร" 
            placeholder="SOMCHAI T"
          />
        </div>
        <div class="modal__footer">
          <JButton variant="primary" @click="addNewCard">
            ผูกบัตร
          </JButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '../stores/loans'
import { usePaymentStore } from '../stores/payment'
import { formatCurrency } from '../services/mockData'
import JHeader from '../components/layout/JHeader.vue'
import JCard from '../components/base/JCard.vue'
import JButton from '../components/base/JButton.vue'
import JInput from '../components/base/JInput.vue'

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()
const paymentStore = usePaymentStore()

const selectedCard = ref(null)
const showAddCardModal = ref(false)
const newCard = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const loan = computed(() => loansStore.selectedLoan)
const installment = computed(() => {
  return loansStore.installments.find(i => i.installmentId === route.params.installmentId)
})

const getCardBrandLogo = (brand) => {
  // In production, use actual brand logos
  const logos = {
    VISA: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
    MASTERCARD: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    JCB: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg'
  }
  return logos[brand] || logos.VISA
}

const addNewCard = async () => {
  const last4 = newCard.value.number.slice(-4)
  await paymentStore.addCard({
    brand: 'VISA',
    last4,
    expiry: newCard.value.expiry,
    holderName: newCard.value.name
  })
  showAddCardModal.value = false
  newCard.value = { number: '', expiry: '', cvv: '', name: '' }
}

const confirmPayment = async () => {
  const { loanId, installmentId } = route.params
  
  const result = await paymentStore.payWithCard(
    loanId,
    installmentId,
    installment.value?.amount,
    selectedCard.value
  )
  
  if (result.success) {
    loansStore.markInstallmentPaid(installmentId)
    router.replace('/payment-result/success')
  } else {
    router.replace('/payment-result/failed')
  }
}

onMounted(async () => {
  await loansStore.fetchLoanDetail(route.params.loanId)
  await paymentStore.fetchPaymentMethods()
  
  // Auto-select first card if available
  if (paymentStore.cards.length > 0) {
    selectedCard.value = paymentStore.cards[0].cardId
  }
})
</script>

<style scoped>
.pay-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding-bottom: 100px;
}

.amount-summary {
  text-align: center;
  padding: var(--space-lg) 0;
}

.amount-summary__label {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.card-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.card-item__brand {
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-item__logo {
  max-width: 100%;
  max-height: 100%;
}

.card-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-item__number {
  font-weight: var(--font-weight-medium);
}

.empty-cards {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-gray-4);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.add-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  border: 2px dashed var(--color-gray-3);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-gray-4);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-card-btn:hover {
  border-color: var(--color-red);
  color: var(--color-red);
}

.payment-details__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.payment-details__row span:last-child {
  font-weight: var(--font-weight-medium);
}

.pay-card__footer {
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

/* Processing State */
.processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.processing__animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-xl);
}

.processing__circle {
  position: absolute;
  inset: 0;
  border: 3px solid var(--color-gray-2);
  border-top-color: var(--color-black);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing__icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal {
  width: 100%;
  max-width: 430px;
  background: var(--color-white);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  animation: slideUp 0.3s ease;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  font-size: 24px;
  cursor: pointer;
}

.modal__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.modal__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.modal__footer {
  padding: var(--space-md);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
