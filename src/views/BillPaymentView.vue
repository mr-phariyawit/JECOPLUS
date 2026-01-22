<template>
  <div class="bills screen screen--no-nav">
    <JHeader title="จ่ายบิล & บริการ" />

    <!-- Category Filter -->
    <section class="bills__categories">
      <button
        :class="[
          'category-chip',
          { 'category-chip--active': !selectedCategory },
        ]"
        @click="selectedCategory = null"
      >
        ทั้งหมด
      </button>
      <button
        v-for="(cat, key) in serviceCategories"
        :key="key"
        :class="[
          'category-chip',
          { 'category-chip--active': selectedCategory === key },
        ]"
        @click="selectedCategory = key"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </section>

    <!-- Services Grid -->
    <section class="bills__services section">
      <h2 class="section-title">เลือกบริการที่ต้องการชำระ</h2>

      <div class="services-grid">
        <div
          v-for="service in filteredServices"
          :key="service.id"
          class="service-card"
          @click="selectService(service)"
        >
          <div class="service-card__icon">{{ service.icon }}</div>
          <div class="service-card__info">
            <h3 class="service-card__name">{{ service.name }}</h3>
            <span class="service-card__provider text-mini">{{
              service.provider
            }}</span>
            <p class="service-card__desc text-small">
              {{ service.description }}
            </p>
          </div>
          <span class="service-card__price text-mini">{{
            service.priceRange
          }}</span>
        </div>
      </div>
    </section>

    <!-- Payment Modal -->
    <div
      v-if="selectedService"
      class="modal-overlay"
      @click.self="selectedService = null"
    >
      <div class="modal">
        <div class="modal__header">
          <h3>{{ selectedService.name }}</h3>
          <button class="modal__close" @click="selectedService = null">
            ×
          </button>
        </div>
        <div class="modal__body">
          <div class="service-preview">
            <span class="service-preview__icon">{{
              selectedService.icon
            }}</span>
            <span class="service-preview__provider">{{
              selectedService.provider
            }}</span>
          </div>

          <JInput
            v-model="paymentAmount"
            label="ยอดที่ต้องชำระ"
            placeholder="0.00"
            type="number"
          />

          <JInput
            v-model="paymentRef"
            label="เลขที่อ้างอิง/หมายเลขลูกค้า"
            placeholder="เช่น เลขกรมธรรม์, เลขเติมเงิน"
          />

          <div class="pay-method">
            <label class="field-label">ชำระด้วย</label>
            <div class="pay-method__options">
              <label class="radio-option">
                <input type="radio" v-model="payMethod" value="JWALLET" />
                <span class="radio-label">J Wallet</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="payMethod" value="JECO_PLUS" />
                <span class="radio-label">หักจากสินเชื่อ JECO+</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal__footer">
          <JButton
            variant="primary"
            :disabled="!paymentAmount || !paymentRef"
            :loading="isPaying"
            @click="processPayment"
          >
            ชำระเงิน ฿{{ formatNumber(paymentAmount || 0) }}
          </JButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { payableServices, serviceCategories } from "../services/loanProducts";
import JHeader from "../components/layout/JHeader.vue";
import JButton from "../components/base/JButton.vue";
import JInput from "../components/base/JInput.vue";

const router = useRouter();
const selectedCategory = ref(null);
const selectedService = ref(null);
const paymentAmount = ref("");
const paymentRef = ref("");
const payMethod = ref("JWALLET");
const isPaying = ref(false);

const filteredServices = computed(() => {
  if (!selectedCategory.value) return payableServices;
  return payableServices.filter((s) => s.category === selectedCategory.value);
});

const formatNumber = (num) => new Intl.NumberFormat("th-TH").format(num);

const selectService = (service) => {
  selectedService.value = service;
  paymentAmount.value = "";
  paymentRef.value = "";
};

const processPayment = async () => {
  isPaying.value = true;
  await new Promise((r) => setTimeout(r, 2000));
  isPaying.value = false;
  selectedService.value = null;

  // Navigate to success
  router.push("/payment-result/success");
};
</script>

<style scoped>
.bills__categories {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  -webkit-overflow-scrolling: touch;
}

.bills__categories::-webkit-scrollbar {
  display: none;
}

.category-chip {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
  background: var(--color-white);
  font-size: var(--font-size-small);
  white-space: nowrap;
  cursor: pointer;
}

.category-chip--active {
  background: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-bottom: 100px;
}

.service-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.service-card:hover {
  border-color: var(--color-gray-3);
  box-shadow: var(--shadow-sm);
}

.service-card__icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.service-card__info {
  flex: 1;
}

.service-card__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.service-card__provider {
  color: var(--color-gray-4);
}

.service-card__desc {
  color: var(--color-gray-4);
  margin-top: var(--space-xs);
}

.service-card__price {
  color: var(--color-red);
  white-space: nowrap;
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

.modal__footer {
  padding: var(--space-md);
}

.service-preview {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.service-preview__icon {
  font-size: 32px;
}

.field-label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.pay-method__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.radio-option:has(input:checked) {
  border-color: var(--color-red);
  background: #fff5f5;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
