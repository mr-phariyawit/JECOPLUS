<template>
  <div class="loan-detail screen">
    <JHeader :title="loan?.productName || 'รายละเอียดสินเชื่อ'" />

    <div v-if="loansStore.isLoading" class="loan-detail__loading">
      <div class="skeleton" style="height: 120px; margin-bottom: 16px;"></div>
      <div class="skeleton" style="height: 300px;"></div>
    </div>

    <template v-else-if="loan">
      <!-- Summary Card -->
      <section class="loan-detail__summary">
        <JCard>
          <div class="summary">
            <p class="summary__label">ยอดคงเหลือ</p>
            <p class="summary__amount amount amount--large">
              ฿{{ formatCurrency(loan.remainingBalance) }}
            </p>
            <div class="summary__meta">
              <span>สัญญาเลขที่ {{ loan.contractNo }}</span>
            </div>
            <div class="summary__stats">
              <div class="summary__stat">
                <span class="summary__stat-label">วงเงินกู้</span>
                <span class="summary__stat-value">฿{{ formatCurrency(loan.principalAmount) }}</span>
              </div>
              <div class="summary__stat">
                <span class="summary__stat-label">อัตราดอกเบี้ย</span>
                <span class="summary__stat-value">{{ loan.interestRate }}%</span>
              </div>
              <div class="summary__stat">
                <span class="summary__stat-label">ค่างวด/เดือน</span>
                <span class="summary__stat-value">฿{{ formatCurrency(loan.monthlyPayment) }}</span>
              </div>
            </div>
          </div>
        </JCard>
      </section>

      <!-- Installments -->
      <section class="loan-detail__installments section">
        <h2 class="section-title">ตารางผ่อนชำระ</h2>
        
        <div class="installments">
          <div 
            v-for="inst in loansStore.installments" 
            :key="inst.installmentId"
            :class="['installment', `installment--${inst.status.toLowerCase()}`]"
            @click="handleInstallmentClick(inst)"
          >
            <div class="installment__left">
              <div class="installment__icon">
                <svg v-if="inst.status === 'PAID'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor"/>
                  <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="inst.status === 'PENDING'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="installment__info">
                <span class="installment__no">งวดที่ {{ inst.no }}</span>
                <span class="installment__date text-mini">{{ formatDate(inst.dueDate) }}</span>
              </div>
            </div>
            <div class="installment__right">
              <span class="installment__amount">฿{{ formatCurrency(inst.amount) }}</span>
              <JBadge 
                :label="getStatusLabel(inst.status)" 
                :variant="getStatusVariant(inst.status)"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Pay Button (for pending installment) -->
      <div v-if="pendingInstallment" class="loan-detail__footer">
        <JButton variant="primary" @click="goToPay">
          ชำระงวดที่ {{ pendingInstallment.no }} • ฿{{ formatCurrency(pendingInstallment.amount) }}
        </JButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '../stores/loans'
import { formatCurrency, formatDate } from '../services/mockData'
import JHeader from '../components/layout/JHeader.vue'
import JCard from '../components/base/JCard.vue'
import JBadge from '../components/base/JBadge.vue'
import JButton from '../components/base/JButton.vue'

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()

const loan = computed(() => loansStore.selectedLoan)

const pendingInstallment = computed(() => {
  return loansStore.installments.find(i => i.status === 'PENDING')
})

const getStatusLabel = (status) => {
  const labels = {
    PAID: 'ชำระแล้ว',
    PENDING: 'รอชำระ',
    OVERDUE: 'เลยกำหนด',
    UPCOMING: 'ยังไม่ถึงกำหนด'
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const variants = {
    PAID: 'success',
    PENDING: 'warning',
    OVERDUE: 'error',
    UPCOMING: 'default'
  }
  return variants[status] || 'default'
}

const handleInstallmentClick = (inst) => {
  if (inst.status === 'PENDING' || inst.status === 'OVERDUE') {
    router.push(`/pay/${route.params.loanId}/${inst.installmentId}`)
  }
}

const goToPay = () => {
  if (pendingInstallment.value) {
    router.push(`/pay/${route.params.loanId}/${pendingInstallment.value.installmentId}`)
  }
}

onMounted(() => {
  loansStore.fetchLoanDetail(route.params.loanId)
})
</script>

<style scoped>
.loan-detail__summary {
  margin-bottom: var(--space-lg);
}

.summary {
  text-align: center;
  padding: var(--space-sm) 0;
}

.summary__label {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.summary__amount {
  margin-bottom: var(--space-sm);
}

.summary__meta {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
  margin-bottom: var(--space-lg);
}

.summary__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
}

.summary__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary__stat-label {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.summary__stat-value {
  font-weight: var(--font-weight-medium);
}

.installments {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.installment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.installment:hover {
  background: var(--color-gray-1);
}

.installment--paid {
  opacity: 0.7;
}

.installment--pending {
  border-color: var(--color-warning);
  background: #fffbeb;
}

.installment__left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.installment__icon {
  color: var(--color-gray-3);
}

.installment--paid .installment__icon {
  color: var(--color-success);
}

.installment--pending .installment__icon {
  color: var(--color-warning);
}

.installment__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.installment__no {
  font-weight: var(--font-weight-medium);
}

.installment__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
}

.installment__amount {
  font-weight: var(--font-weight-medium);
}

.loan-detail__footer {
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
