<template>
  <div class="checkout screen">
    <!-- Header -->
    <header class="checkout__header">
      <button class="checkout__back" @click="handleBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <h1 class="text-title">ชำระเงิน</h1>
      <div style="width: 40px;"></div>
    </header>

    <!-- Empty Cart Warning -->
    <div v-if="cartStore.isEmpty" class="checkout__empty">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
        <path d="M9 2L7 6M17 2l2 4M21 6H3m18 0l-2 13H5L3 6h18zM10 11v3m4-3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="checkout__empty-title">ตะกร้าสินค้าว่างเปล่า</p>
      <p class="checkout__empty-text">กรุณาเพิ่มสินค้าลงตะกร้าก่อนทำการชำระเงิน</p>
      <button class="btn btn--primary" @click="goToMarketplace">
        เลือกซื้อสินค้า
      </button>
    </div>

    <!-- Checkout Content -->
    <div v-else class="checkout__content">
      <!-- Progress Steps -->
      <div class="checkout__steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="checkout__step"
          :class="{
            'checkout__step--active': currentStep === index + 1,
            'checkout__step--completed': currentStep > index + 1,
          }"
        >
          <div class="checkout__step-number">
            <svg v-if="currentStep > index + 1" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="checkout__step-label">{{ step }}</span>
        </div>
      </div>

      <!-- Step 1: Shipping Address -->
      <section v-if="currentStep === 1" class="checkout__section">
        <h2 class="checkout__section-title">ที่อยู่จัดส่ง</h2>

        <form class="checkout__form" @submit.prevent="goToStep2">
          <div class="form-group">
            <label class="form-label">ชื่อ-นามสกุล <span class="text-required">*</span></label>
            <input
              v-model="shippingAddress.fullName"
              type="text"
              class="form-input"
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">เบอร์โทรศัพท์ <span class="text-required">*</span></label>
            <input
              v-model="shippingAddress.phone"
              type="tel"
              class="form-input"
              placeholder="0812345678"
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">ที่อยู่ <span class="text-required">*</span></label>
            <textarea
              v-model="shippingAddress.address"
              class="form-textarea"
              placeholder="บ้านเลขที่ ซอย ถนน"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">แขวง/ตำบล <span class="text-required">*</span></label>
              <input
                v-model="shippingAddress.subDistrict"
                type="text"
                class="form-input"
                placeholder="แขวง/ตำบล"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">เขต/อำเภอ <span class="text-required">*</span></label>
              <input
                v-model="shippingAddress.district"
                type="text"
                class="form-input"
                placeholder="เขต/อำเภอ"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">จังหวัด <span class="text-required">*</span></label>
              <input
                v-model="shippingAddress.province"
                type="text"
                class="form-input"
                placeholder="จังหวัด"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">รหัสไปรษณีย์ <span class="text-required">*</span></label>
              <input
                v-model="shippingAddress.postalCode"
                type="text"
                class="form-input"
                placeholder="10100"
                pattern="[0-9]{5}"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn--primary btn--full">
            ดำเนินการต่อ
          </button>
        </form>
      </section>

      <!-- Step 2: Payment Method -->
      <section v-if="currentStep === 2" class="checkout__section">
        <h2 class="checkout__section-title">วิธีการชำระเงิน</h2>

        <div class="payment-methods">
          <label
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-method"
            :class="{ 'payment-method--selected': selectedPaymentMethod === method.id }"
          >
            <input
              v-model="selectedPaymentMethod"
              type="radio"
              :value="method.id"
              class="payment-method__radio"
            />
            <div class="payment-method__icon">
              <component :is="method.icon" />
            </div>
            <div class="payment-method__info">
              <p class="payment-method__name">{{ method.name }}</p>
              <p class="payment-method__description">{{ method.description }}</p>
            </div>
            <svg v-if="selectedPaymentMethod === method.id" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="var(--color-red)" />
              <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </label>
        </div>

        <div class="checkout__actions">
          <button class="btn btn--outline" @click="currentStep = 1">
            ย้อนกลับ
          </button>
          <button
            class="btn btn--primary"
            :disabled="!selectedPaymentMethod"
            @click="goToStep3"
          >
            ดำเนินการต่อ
          </button>
        </div>
      </section>

      <!-- Step 3: Order Review -->
      <section v-if="currentStep === 3" class="checkout__section">
        <h2 class="checkout__section-title">ตรวจสอบคำสั่งซื้อ</h2>

        <!-- Shipping Address Review -->
        <div class="review-card">
          <div class="review-card__header">
            <h3 class="review-card__title">ที่อยู่จัดส่ง</h3>
            <button class="review-card__edit" @click="currentStep = 1">แก้ไข</button>
          </div>
          <div class="review-card__content">
            <p class="review-card__text"><strong>{{ shippingAddress.fullName }}</strong></p>
            <p class="review-card__text">{{ shippingAddress.phone }}</p>
            <p class="review-card__text">
              {{ shippingAddress.address }}<br />
              {{ shippingAddress.subDistrict }} {{ shippingAddress.district }}<br />
              {{ shippingAddress.province }} {{ shippingAddress.postalCode }}
            </p>
          </div>
        </div>

        <!-- Payment Method Review -->
        <div class="review-card">
          <div class="review-card__header">
            <h3 class="review-card__title">วิธีการชำระเงิน</h3>
            <button class="review-card__edit" @click="currentStep = 2">แก้ไข</button>
          </div>
          <div class="review-card__content">
            <p class="review-card__text">
              <strong>{{ getPaymentMethodName(selectedPaymentMethod) }}</strong>
            </p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="review-card">
          <h3 class="review-card__title">รายการสินค้า ({{ cartStore.itemCount }} ชิ้น)</h3>
          <div class="review-card__items">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="review-item"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="review-item__image"
                @error="handleImageError"
              />
              <div class="review-item__info">
                <p class="review-item__name">{{ item.name }}</p>
                <p v-if="item.variant" class="review-item__variant">{{ item.variant.name }}</p>
                <p class="review-item__quantity">จำนวน {{ item.quantity }} ชิ้น</p>
              </div>
              <p class="review-item__price">฿{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="review-card">
          <h3 class="review-card__title">สรุปยอดชำระ</h3>
          <div class="review-summary">
            <div class="review-summary__row">
              <span>ยอดรวมสินค้า</span>
              <span>฿{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div v-if="cartStore.discount > 0" class="review-summary__row">
              <span>ส่วนลด</span>
              <span class="text-green">-฿{{ formatPrice(cartStore.discount) }}</span>
            </div>
            <div class="review-summary__row">
              <span>ค่าจัดส่ง</span>
              <span v-if="cartStore.shipping === 0" class="text-green">ฟรี</span>
              <span v-else>฿{{ formatPrice(cartStore.shipping) }}</span>
            </div>
            <div class="review-summary__divider"></div>
            <div class="review-summary__row review-summary__row--total">
              <span>ยอดรวมทั้งหมด</span>
              <span class="review-summary__total">฿{{ formatPrice(cartStore.total) }}</span>
            </div>
          </div>
        </div>

        <div class="checkout__actions">
          <button class="btn btn--outline" @click="currentStep = 2">
            ย้อนกลับ
          </button>
          <button
            class="btn btn--primary"
            :disabled="isProcessing"
            @click="placeOrder"
          >
            <span v-if="isProcessing">กำลังดำเนินการ...</span>
            <span v-else>ยืนยันการสั่งซื้อ</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();

// State
const currentStep = ref(1);
const isProcessing = ref(false);

const steps = ['ที่อยู่จัดส่ง', 'การชำระเงิน', 'ตรวจสอบคำสั่งซื้อ'];

// Shipping address
const shippingAddress = ref({
  fullName: '',
  phone: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
});

// Payment methods
const selectedPaymentMethod = ref('');
const paymentMethods = [
  {
    id: 'jwallet',
    name: 'JECO Wallet',
    description: 'ชำระผ่านกระเป๋าเงิน JECO',
    icon: 'WalletIcon',
  },
  {
    id: 'promptpay',
    name: 'พร้อมเพย์ (PromptPay)',
    description: 'สแกน QR Code เพื่อชำระเงิน',
    icon: 'QrCodeIcon',
  },
  {
    id: 'bank',
    name: 'โอนเงินผ่านธนาคาร',
    description: 'โอนเงินเข้าบัญชีธนาคาร',
    icon: 'BankIcon',
  },
  {
    id: 'cod',
    name: 'เก็บเงินปลายทาง',
    description: 'ชำระเงินเมื่อได้รับสินค้า',
    icon: 'CashIcon',
  },
];

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
};

const getPaymentMethodName = (methodId) => {
  const method = paymentMethods.find((m) => m.id === methodId);
  return method ? method.name : '';
};

const handleBack = () => {
  if (currentStep.value === 1) {
    router.back();
  } else {
    currentStep.value--;
  }
};

const goToStep2 = () => {
  orderStore.setShippingAddress(shippingAddress.value);
  currentStep.value = 2;
};

const goToStep3 = () => {
  if (!selectedPaymentMethod.value) {
    alert('กรุณาเลือกวิธีการชำระเงิน');
    return;
  }
  orderStore.setPaymentMethod(selectedPaymentMethod.value);
  currentStep.value = 3;
};

const placeOrder = async () => {
  isProcessing.value = true;

  try {
    // Prepare order data
    const orderData = {
      items: cartStore.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: shippingAddress.value,
      paymentMethod: selectedPaymentMethod.value,
      subtotal: cartStore.subtotal,
      discount: cartStore.discount,
      shippingFee: cartStore.shipping,
      total: cartStore.total,
    };

    // Create order
    const order = await orderStore.createOrder(orderData);

    // Clear cart
    cartStore.clearCart();

    // Reset checkout
    orderStore.resetCheckout();

    // Navigate to success page
    router.push(`/order-success/${order.id}`);
  } catch (error) {
    console.error('Error placing order:', error);
    alert(error.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
  } finally {
    isProcessing.value = false;
  }
};

const goToMarketplace = () => {
  router.push('/marketplace');
};

// Lifecycle
onMounted(() => {
  // Pre-fill address with user data if available
  if (authStore.user) {
    shippingAddress.value.fullName = authStore.fullName || '';
    shippingAddress.value.phone = authStore.user.phone || '';
  }

  // Redirect if cart is empty
  if (cartStore.isEmpty) {
    // Will show empty state
  }
});
</script>

<script>
// Payment method icons (simple inline components)
const WalletIcon = {
  template: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
    <path d="M2 10h20M16 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const QrCodeIcon = {
  template: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
    <path d="M14 14h7M14 17h7M14 20h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const BankIcon = {
  template: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M4 18h16M6 18V9m4 9V9m4 9V9m4 9V9M3 9l9-6 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const CashIcon = {
  template: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2"/>
    <path d="M18 12a6 6 0 00-12 0M18 12a6 6 0 01-12 0" stroke="currentColor" stroke-width="2"/>
  </svg>`,
};

export default {
  components: {
    WalletIcon,
    QrCodeIcon,
    BankIcon,
    CashIcon,
  },
};
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  background: var(--color-gray-1);
  padding-bottom: 80px;
}

/* Header */
.checkout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-2);
  position: sticky;
  top: 0;
  z-index: 10;
}

.checkout__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-black);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.checkout__back:hover {
  color: var(--color-red);
}

/* Empty State */
.checkout__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-xl);
}

.checkout__empty svg {
  color: var(--color-gray-4);
  margin-bottom: var(--space-md);
}

.checkout__empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.checkout__empty-text {
  color: var(--color-gray-5);
  margin-bottom: var(--space-lg);
  text-align: center;
}

/* Content */
.checkout__content {
  padding: var(--space-md);
  max-width: 800px;
  margin: 0 auto;
}

/* Progress Steps */
.checkout__steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.checkout__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  position: relative;
}

.checkout__step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--color-gray-3);
  z-index: -1;
}

.checkout__step--completed:not(:last-child)::after {
  background: var(--color-red);
}

.checkout__step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-gray-3);
  color: var(--color-white);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-small);
}

.checkout__step--active .checkout__step-number {
  background: var(--color-red);
}

.checkout__step--completed .checkout__step-number {
  background: var(--color-red);
}

.checkout__step-label {
  font-size: var(--font-size-mini);
  color: var(--color-gray-5);
  text-align: center;
}

.checkout__step--active .checkout__step-label {
  color: var(--color-black);
  font-weight: var(--font-weight-semibold);
}

/* Section */
.checkout__section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.checkout__section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-lg);
}

/* Form */
.checkout__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-body);
}

.text-required {
  color: var(--color-red);
}

.form-input,
.form-textarea {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-red);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.payment-method {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 2px solid var(--color-gray-3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.payment-method:hover {
  border-color: var(--color-gray-4);
}

.payment-method--selected {
  border-color: var(--color-red);
  background: var(--color-red-light, #fee);
}

.payment-method__radio {
  display: none;
}

.payment-method__icon {
  flex-shrink: 0;
  color: var(--color-gray-5);
}

.payment-method--selected .payment-method__icon {
  color: var(--color-red);
}

.payment-method__info {
  flex: 1;
}

.payment-method__name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
}

.payment-method__description {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

/* Review Cards */
.review-card {
  padding: var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}

.review-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.review-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.review-card__edit {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-red);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-red);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.review-card__edit:hover {
  background: var(--color-red);
  color: var(--color-white);
}

.review-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.review-card__text {
  line-height: 1.5;
  margin: 0;
}

.review-card__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.review-item {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-gray-1);
}

.review-item__image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.review-item__info {
  flex: 1;
}

.review-item__name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
}

.review-item__variant,
.review-item__quantity {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.review-item__price {
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.review-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.review-summary__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-body);
}

.review-summary__row--total {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.review-summary__total {
  color: var(--color-red);
}

.review-summary__divider {
  height: 1px;
  background: var(--color-gray-2);
  margin: var(--space-sm) 0;
}

.text-green {
  color: var(--color-green);
}

/* Actions */
.checkout__actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.btn--full {
  width: 100%;
}

/* Desktop */
@media (min-width: 768px) {
  .checkout__step-label {
    font-size: var(--font-size-small);
  }

  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
