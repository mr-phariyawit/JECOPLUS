<template>
  <div class="ecosystem screen">
    <JHeader title="สินค้าและบริการ" :showBack="false" />

    <!-- Hero Banner -->
    <section class="ecosystem__hero">
      <div class="hero__content">
        <h1 class="hero__title"><span class="hero__j">J</span>aymart</h1>
        <p class="hero__tagline">Products & Services</p>
        <p class="hero__desc text-small">
          สินค้าและบริการจากทุกบริษัทในเครือ<br />ชำระผ่าน JECO+ ได้เลย
        </p>
      </div>
    </section>

    <!-- Category Tabs -->
    <section class="ecosystem__tabs">
      <button
        :class="['tab-btn', { 'tab-btn--active': !selectedCategory }]"
        @click="selectedCategory = null"
      >
        🏠 ทั้งหมด
      </button>
      <button
        v-for="(cat, key) in serviceCategories"
        :key="key"
        :class="['tab-btn', { 'tab-btn--active': selectedCategory === key }]"
        @click="selectedCategory = key"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </section>

    <!-- Products/Services Grid -->
    <section class="ecosystem__grid section">
      <div class="products-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="product-card"
          @click="openPaymentModal(item)"
        >
          <div class="product-card__visual">
            <span class="product-card__icon">{{ item.icon }}</span>
            <span class="product-card__badge">{{
              getCategoryLabel(item.category)
            }}</span>
          </div>
          <div class="product-card__info">
            <h3 class="product-card__name">{{ item.name }}</h3>
            <p class="product-card__provider text-mini">{{ item.provider }}</p>
            <p class="product-card__desc text-small">{{ item.description }}</p>
            <p class="product-card__price">{{ item.priceRange }}</p>
          </div>
          <JButton variant="primary" size="small" class="product-card__btn">
            ชำระเงิน
          </JButton>
        </div>
      </div>
    </section>

    <!-- Payment Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal__header">
          <div class="modal__title-wrap">
            <span class="modal__icon">{{ selectedItem.icon }}</span>
            <div>
              <h3>{{ selectedItem.name }}</h3>
              <span class="text-mini">{{ selectedItem.provider }}</span>
            </div>
          </div>
          <button class="modal__close" @click="closeModal">×</button>
        </div>

        <div class="modal__body">
          <p class="modal__desc text-small">{{ selectedItem.description }}</p>
          <p class="modal__price-range">{{ selectedItem.priceRange }}</p>

          <JInput
            v-model="paymentAmount"
            label="ยอดที่ต้องชำระ (บาท)"
            placeholder="0.00"
            type="number"
            inputmode="numeric"
          />

          <JInput
            v-if="needsReference"
            v-model="paymentRef"
            label="เลขที่อ้างอิง"
            :placeholder="getRefPlaceholder"
          />

          <div class="pay-method">
            <label class="field-label">ชำระด้วย</label>
            <div class="pay-options">
              <label
                :class="[
                  'pay-option',
                  { 'pay-option--selected': payMethod === 'JWALLET' },
                ]"
              >
                <input type="radio" v-model="payMethod" value="JWALLET" />
                <span class="pay-option__icon">💳</span>
                <span>J Wallet</span>
              </label>
              <label
                :class="[
                  'pay-option',
                  { 'pay-option--selected': payMethod === 'JECO_PLUS' },
                ]"
              >
                <input type="radio" v-model="payMethod" value="JECO_PLUS" />
                <span class="pay-option__icon">💰</span>
                <span>หักจากสินเชื่อ</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="modal__summary">
            <span>ยอดรวม</span>
            <span class="modal__total"
              >฿{{ formatNumber(paymentAmount || 0) }}</span
            >
          </div>
          <JButton
            variant="primary"
            :disabled="!canPay"
            :loading="isPaying"
            @click="processPayment"
          >
            ยืนยันชำระเงิน
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
const selectedItem = ref(null);
const paymentAmount = ref("");
const paymentRef = ref("");
const payMethod = ref("JWALLET");
const isPaying = ref(false);

const filteredItems = computed(() => {
  if (!selectedCategory.value) return payableServices;
  return payableServices.filter((s) => s.category === selectedCategory.value);
});

const getCategoryLabel = (category) => {
  return serviceCategories[category]?.label || category;
};

const needsReference = computed(() => {
  if (!selectedItem.value) return false;
  const cat = selectedItem.value.category;
  return ["insurance", "utility", "property"].includes(cat);
});

const getRefPlaceholder = computed(() => {
  if (!selectedItem.value) return "";
  switch (selectedItem.value.category) {
    case "insurance":
      return "เลขกรมธรรม์";
    case "utility":
      return "เบอร์โทรศัพท์";
    case "property":
      return "เลขที่สัญญาเช่า";
    default:
      return "เลขที่อ้างอิง";
  }
});

const canPay = computed(() => {
  if (!paymentAmount.value || parseFloat(paymentAmount.value) <= 0)
    return false;
  if (needsReference.value && !paymentRef.value) return false;
  return true;
});

const formatNumber = (num) => new Intl.NumberFormat("th-TH").format(num);

const openPaymentModal = (item) => {
  selectedItem.value = item;
  paymentAmount.value = "";
  paymentRef.value = "";
  payMethod.value = "JWALLET";
};

const closeModal = () => {
  selectedItem.value = null;
};

const processPayment = async () => {
  isPaying.value = true;
  await new Promise((r) => setTimeout(r, 2000));
  isPaying.value = false;
  selectedItem.value = null;
  router.push("/payment-result/success");
};
</script>

<style scoped>
.ecosystem__hero {
  background: linear-gradient(135deg, var(--color-black) 0%, #1a1a1a 100%);
  color: var(--color-white);
  padding: var(--space-xl);
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-md);
  text-align: center;
}

.hero__title {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 4px;
}

.hero__j {
  color: var(--color-red);
  font-size: 40px;
}

.hero__tagline {
  font-size: var(--font-size-body);
  opacity: 0.9;
  margin-bottom: var(--space-sm);
}

.hero__desc {
  opacity: 0.7;
}

.ecosystem__tabs {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  -webkit-overflow-scrolling: touch;
}

.ecosystem__tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
  background: var(--color-white);
  font-size: var(--font-size-small);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn--active {
  background: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  padding-bottom: 100px;
}

.product-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-card:hover {
  border-color: var(--color-gray-3);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.product-card__visual {
  position: relative;
  background: linear-gradient(135deg, var(--color-gray-1), #f0f0f0);
  padding: var(--space-lg);
  text-align: center;
}

.product-card__icon {
  font-size: 40px;
}

.product-card__badge {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  padding: 2px 8px;
  background: var(--color-black);
  color: var(--color-white);
  font-size: 10px;
  border-radius: var(--radius-sm);
}

.product-card__info {
  padding: var(--space-sm);
}

.product-card__name {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  margin-bottom: 2px;
}

.product-card__provider {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.product-card__desc {
  color: var(--color-gray-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-xs);
}

.product-card__price {
  color: var(--color-red);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.product-card__btn {
  width: calc(100% - var(--space-md));
  margin: 0 var(--space-xs) var(--space-sm);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal {
  width: 100%;
  max-width: 430px;
  max-height: 90vh;
  background: var(--color-white);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  animation: slideUp 0.3s ease;
  overflow-y: auto;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.modal__title-wrap {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.modal__icon {
  font-size: 36px;
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

.modal__desc {
  color: var(--color-gray-4);
}

.modal__price-range {
  color: var(--color-red);
  font-weight: var(--font-weight-medium);
}

.field-label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.pay-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.pay-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-md);
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pay-option input {
  display: none;
}

.pay-option--selected {
  border-color: var(--color-red);
  background: #fff5f5;
}

.pay-option__icon {
  font-size: 24px;
}

.modal__footer {
  padding: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
}

.modal__summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.modal__total {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
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
