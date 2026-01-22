<template>
  <div class="pay-bank screen screen--no-nav">
    <JHeader title="ชำระผ่านบัญชีธนาคาร" />

    <!-- Processing State -->
    <template v-if="paymentStore.isProcessing">
      <div class="processing">
        <div class="processing__animation">
          <div class="processing__circle"></div>
          <div class="processing__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M3 21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
              <path d="M5 10V17M9 10V17M15 10V17M19 10V17" stroke="currentColor" stroke-width="2"/>
              <path d="M12 3L21 10H3L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 class="processing__title">กำลังดำเนินการ...</h2>
        <p class="processing__subtitle text-small">กรุณารอสักครู่</p>
      </div>
    </template>

    <!-- Bank Selection -->
    <template v-else>
      <section class="pay-bank__content">
        <!-- Amount Summary -->
        <div class="amount-summary">
          <p class="amount-summary__label">ยอดที่ต้องชำระ</p>
          <p class="amount-summary__value amount amount--large">฿{{ formatCurrency(installment?.amount) }}</p>
        </div>

        <!-- Linked Banks -->
        <div class="section">
          <h2 class="section-title">เลือกบัญชี</h2>

          <template v-if="paymentStore.banks.length > 0">
            <div class="banks-list">
              <JCard 
                v-for="bank in paymentStore.banks"
                :key="bank.bankId"
                selectable
                :selected="selectedBank === bank.bankId"
                @click="selectedBank = bank.bankId"
              >
                <div class="bank-item">
                  <div 
                    class="bank-item__logo" 
                    :style="{ background: getBankColor(bank.bankCode) }"
                  >
                    {{ bank.bankCode.slice(0, 1) }}
                  </div>
                  <div class="bank-item__info">
                    <span class="bank-item__name">{{ bank.bankName }}</span>
                    <span class="bank-item__account text-mini">{{ bank.accountNo }}</span>
                  </div>
                  <div class="bank-item__check" v-if="selectedBank === bank.bankId">
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
            <div class="empty-banks">
              <p>ยังไม่มีบัญชีที่ผูกไว้</p>
            </div>
          </template>

          <!-- Add Bank Button -->
          <button class="add-bank-btn" @click="showAddBankModal = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>ผูกบัญชีใหม่</span>
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
      <div class="pay-bank__footer">
        <JButton 
          variant="primary" 
          :disabled="!selectedBank"
          @click="confirmPayment"
        >
          ยืนยันชำระเงิน
        </JButton>
      </div>
    </template>

    <!-- Add Bank Modal -->
    <div v-if="showAddBankModal" class="modal-overlay" @click.self="showAddBankModal = false">
      <div class="modal">
        <div class="modal__header">
          <h3>ผูกบัญชีธนาคาร</h3>
          <button class="modal__close" @click="showAddBankModal = false">×</button>
        </div>
        <div class="modal__body">
          <p class="modal__desc text-small">เลือกธนาคารที่ต้องการผูก</p>
          
          <div class="banks-grid">
            <button 
              v-for="bank in banksList" 
              :key="bank.code"
              :class="['bank-option', { 'bank-option--selected': selectedBankCode === bank.code }]"
              @click="selectedBankCode = bank.code"
            >
              <div class="bank-option__logo" :style="{ background: bank.color }">
                {{ bank.code.slice(0, 1) }}
              </div>
              <span class="bank-option__name">{{ bank.name }}</span>
            </button>
          </div>
        </div>
        <div class="modal__footer">
          <JButton variant="primary" :disabled="!selectedBankCode" @click="addNewBank">
            ดำเนินการต่อ
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
import { formatCurrency, banksList } from '../services/mockData'
import JHeader from '../components/layout/JHeader.vue'
import JCard from '../components/base/JCard.vue'
import JButton from '../components/base/JButton.vue'

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()
const paymentStore = usePaymentStore()

const selectedBank = ref(null)
const showAddBankModal = ref(false)
const selectedBankCode = ref('')

const loan = computed(() => loansStore.selectedLoan)
const installment = computed(() => {
  return loansStore.installments.find(i => i.installmentId === route.params.installmentId)
})

const getBankColor = (code) => {
  const bank = banksList.find(b => b.code === code)
  return bank?.color || '#666'
}

const addNewBank = async () => {
  const bankInfo = banksList.find(b => b.code === selectedBankCode.value)
  if (!bankInfo) return
  
  await paymentStore.addBank({
    bankCode: selectedBankCode.value,
    bankName: bankInfo.name,
    accountNo: 'xxx-x-xx' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9),
    holderName: 'Demo User'
  })
  
  showAddBankModal.value = false
  selectedBankCode.value = ''
}

const confirmPayment = async () => {
  const { loanId, installmentId } = route.params
  
  const result = await paymentStore.payWithBank(
    loanId,
    installmentId,
    installment.value?.amount,
    selectedBank.value
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
  
  if (paymentStore.banks.length > 0) {
    selectedBank.value = paymentStore.banks[0].bankId
  }
})
</script>

<style scoped>
.pay-bank__content {
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

.banks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.bank-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.bank-item__logo {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-title);
}

.bank-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bank-item__name {
  font-weight: var(--font-weight-medium);
}

.empty-banks {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-gray-4);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.add-bank-btn {
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

.add-bank-btn:hover {
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

.pay-bank__footer {
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
  border-top-color: #1E4598;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing__icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E4598;
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
}

.modal__desc {
  color: var(--color-gray-4);
  margin-bottom: var(--space-md);
}

.banks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.bank-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bank-option:hover {
  border-color: var(--color-gray-3);
}

.bank-option--selected {
  border-color: var(--color-red);
  background: #fff5f5;
}

.bank-option__logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: var(--font-weight-bold);
}

.bank-option__name {
  font-size: var(--font-size-mini);
  text-align: center;
}

.modal__footer {
  padding: var(--space-md);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
