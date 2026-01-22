<template>
  <div class="apply screen screen--no-nav">
    <JHeader title="สมัครสินเชื่อ" />

    <!-- Loan Categories -->
    <section class="apply__categories">
      <button 
        v-for="(cat, key) in loanCategories"
        :key="key"
        :class="['category-btn', { 'category-btn--active': selectedCategory === key }]"
        @click="selectedCategory = selectedCategory === key ? null : key"
      >
        <span class="category-btn__icon">{{ cat.icon }}</span>
        <span class="category-btn__label">{{ cat.label }}</span>
      </button>
    </section>

    <!-- Loan Products -->
    <section class="apply__products section">
      <h2 class="section-title">เลือกสินเชื่อที่ต้องการ</h2>

      <div class="products-grid">
        <div 
          v-for="loan in filteredLoans"
          :key="loan.id"
          class="loan-card"
          @click="selectLoan(loan)"
        >
          <div class="loan-card__header">
            <div class="loan-card__icon" :style="{ background: loan.color }">
              {{ loan.icon }}
            </div>
            <div class="loan-card__info">
              <h3 class="loan-card__name">{{ loan.name }}</h3>
              <span class="loan-card__provider text-mini">{{ loan.provider }}</span>
            </div>
          </div>

          <div class="loan-card__details">
            <div class="detail-row">
              <span>วงเงิน</span>
              <span class="detail-value">฿{{ formatNumber(loan.minAmount) }} - {{ formatNumber(loan.maxAmount) }}</span>
            </div>
            <div class="detail-row">
              <span>ดอกเบี้ย</span>
              <span class="detail-value">{{ loan.interestRate }} ต่อปี</span>
            </div>
            <div class="detail-row">
              <span>ระยะผ่อน</span>
              <span class="detail-value">{{ loan.term }}</span>
            </div>
          </div>

          <div class="loan-card__features">
            <span v-for="(feature, idx) in loan.features.slice(0, 2)" :key="idx" class="feature-tag">
              ✓ {{ feature }}
            </span>
          </div>

          <JButton variant="primary" size="small" class="loan-card__cta">
            สมัครเลย
          </JButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loanProducts, loanCategories } from '../services/loanProducts'
import JHeader from '../components/layout/JHeader.vue'
import JButton from '../components/base/JButton.vue'

const router = useRouter()
const selectedCategory = ref(null)

const filteredLoans = computed(() => {
  if (!selectedCategory.value) return loanProducts
  return loanProducts.filter(l => l.category === selectedCategory.value)
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num)
}

const selectLoan = (loan) => {
  router.push(`/apply/${loan.id}`)
}
</script>

<style scoped>
.apply__categories {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  -webkit-overflow-scrolling: touch;
}

.apply__categories::-webkit-scrollbar {
  display: none;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  min-width: 80px;
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-btn--active {
  border-color: var(--color-red);
  background: #fff5f5;
}

.category-btn__icon {
  font-size: 24px;
}

.category-btn__label {
  font-size: var(--font-size-mini);
  white-space: nowrap;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-bottom: 100px;
}

.loan-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: all var(--transition-fast);
}

.loan-card:hover {
  border-color: var(--color-gray-3);
  box-shadow: var(--shadow-sm);
}

.loan-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.loan-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 24px;
}

.loan-card__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
}

.loan-card__provider {
  color: var(--color-gray-4);
}

.loan-card__details {
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-xs) 0;
  font-size: var(--font-size-small);
}

.detail-row span:first-child {
  color: var(--color-gray-4);
}

.detail-value {
  font-weight: var(--font-weight-medium);
}

.loan-card__features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.feature-tag {
  font-size: var(--font-size-mini);
  color: var(--color-success);
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.loan-card__cta {
  width: 100%;
}
</style>
