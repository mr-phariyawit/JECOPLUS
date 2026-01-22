<template>
  <div class="order-success screen">
    <!-- Loading State -->
    <div v-if="isLoading" class="order-success__loading">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Success Content -->
    <div v-else-if="order" class="order-success__content">
      <!-- Success Icon -->
      <div class="order-success__icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="var(--color-green)" />
          <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 class="order-success__title">สั่งซื้อสำเร็จ!</h1>
      <p class="order-success__subtitle">
        เลขที่คำสั่งซื้อ: <strong>{{ order.orderNumber || order.id }}</strong>
      </p>

      <!-- Order Summary Card -->
      <div class="order-card">
        <h2 class="order-card__title">รายละเอียดคำสั่งซื้อ</h2>

        <!-- Order Status -->
        <div class="order-card__section">
          <div class="order-card__row">
            <span class="order-card__label">สถานะ</span>
            <span class="order-card__badge order-card__badge--pending">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="order-card__row">
            <span class="order-card__label">วันที่สั่งซื้อ</span>
            <span>{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="order-card__section">
          <h3 class="order-card__subtitle">ที่อยู่จัดส่ง</h3>
          <p class="order-card__text">
            {{ order.shippingAddress.fullName }}<br />
            {{ order.shippingAddress.phone }}<br />
            {{ order.shippingAddress.address }}<br />
            {{ order.shippingAddress.subDistrict }} {{ order.shippingAddress.district }}<br />
            {{ order.shippingAddress.province }} {{ order.shippingAddress.postalCode }}
          </p>
        </div>

        <!-- Payment Method -->
        <div class="order-card__section">
          <h3 class="order-card__subtitle">วิธีการชำระเงิน</h3>
          <p class="order-card__text">{{ getPaymentMethodName(order.paymentMethod) }}</p>
        </div>

        <!-- Order Items -->
        <div class="order-card__section">
          <h3 class="order-card__subtitle">รายการสินค้า</h3>
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item"
            >
              <div class="order-item__info">
                <p class="order-item__name">{{ item.productName || item.name }}</p>
                <p class="order-item__quantity">จำนวน {{ item.quantity }} ชิ้น</p>
              </div>
              <p class="order-item__price">฿{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="order-card__section">
          <div class="order-card__row">
            <span class="order-card__label">ยอดรวมสินค้า</span>
            <span>฿{{ formatPrice(order.subtotal) }}</span>
          </div>
          <div v-if="order.discount > 0" class="order-card__row">
            <span class="order-card__label">ส่วนลด</span>
            <span class="text-green">-฿{{ formatPrice(order.discount) }}</span>
          </div>
          <div class="order-card__row">
            <span class="order-card__label">ค่าจัดส่ง</span>
            <span v-if="order.shippingFee === 0" class="text-green">ฟรี</span>
            <span v-else>฿{{ formatPrice(order.shippingFee) }}</span>
          </div>
          <div class="order-card__divider"></div>
          <div class="order-card__row order-card__row--total">
            <span class="order-card__label">ยอดรวมทั้งหมด</span>
            <span class="order-card__total">฿{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Instructions (if needed) -->
      <div v-if="order.paymentMethod !== 'cod'" class="payment-instructions">
        <h3 class="payment-instructions__title">ขั้นตอนการชำระเงิน</h3>
        <div v-if="order.paymentMethod === 'promptpay'" class="payment-instructions__content">
          <p>1. สแกน QR Code ด้านล่างเพื่อชำระเงิน</p>
          <div class="payment-instructions__qr">
            <div class="qr-placeholder">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
                <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
                <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
                <rect x="14" y="14" width="3" height="3" fill="currentColor"/>
                <rect x="19" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="14" y="19" width="2" height="2" fill="currentColor"/>
                <rect x="18" y="18" width="3" height="3" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <p>2. กดยืนยันการชำระเงินในแอปธนาคาร</p>
          <p>3. เราจะส่ง SMS ยืนยันเมื่อได้รับการชำระเงิน</p>
        </div>
        <div v-else-if="order.paymentMethod === 'bank'" class="payment-instructions__content">
          <p><strong>โอนเงินเข้าบัญชี:</strong></p>
          <p>ธนาคารกสิกรไทย</p>
          <p>เลขที่บัญชี: 123-4-56789-0</p>
          <p>ชื่อบัญชี: บริษัท JECOPLUS จำกัด</p>
          <p class="text-orange">*โปรดโอนภายใน 24 ชั่วโมง</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="order-success__actions">
        <button class="btn btn--outline" @click="goToOrders">
          ดูคำสั่งซื้อของฉัน
        </button>
        <button class="btn btn--primary" @click="goToMarketplace">
          เลือกซื้อสินค้าเพิ่ม
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="order-success__error">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="order-success__error-title">ไม่พบคำสั่งซื้อ</p>
      <button class="btn btn--primary" @click="goToMarketplace">
        กลับไปหน้าแรก
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/order';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

// State
const order = ref(null);
const isLoading = ref(true);

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusText = (status) => {
  const statusMap = {
    PENDING: 'รอการชำระเงิน',
    PAID: 'ชำระเงินแล้ว',
    PROCESSING: 'กำลังดำเนินการ',
    SHIPPED: 'จัดส่งแล้ว',
    DELIVERED: 'ส่งสำเร็จ',
    CANCELLED: 'ยกเลิก',
  };
  return statusMap[status] || status;
};

const getPaymentMethodName = (method) => {
  const methodMap = {
    jwallet: 'JECO Wallet',
    promptpay: 'พร้อมเพย์ (PromptPay)',
    bank: 'โอนเงินผ่านธนาคาร',
    cod: 'เก็บเงินปลายทาง',
  };
  return methodMap[method] || method;
};

const goToOrders = () => {
  router.push('/orders');
};

const goToMarketplace = () => {
  router.push('/marketplace');
};

// Lifecycle
onMounted(async () => {
  const orderId = route.params.orderId;

  if (!orderId) {
    isLoading.value = false;
    return;
  }

  try {
    const fetchedOrder = await orderStore.fetchOrder(orderId);
    order.value = fetchedOrder;
  } catch (error) {
    console.error('Error fetching order:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.order-success {
  min-height: 100vh;
  background: var(--color-gray-1);
  padding: var(--space-xl) var(--space-md);
}

/* Loading */
.order-success__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-3);
  border-top-color: var(--color-red);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Content */
.order-success__content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-success__icon {
  margin-bottom: var(--space-lg);
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.order-success__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-green);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.order-success__subtitle {
  font-size: var(--font-size-body);
  color: var(--color-gray-5);
  margin-bottom: var(--space-xl);
  text-align: center;
}

/* Order Card */
.order-card {
  width: 100%;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.order-card__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-lg);
}

.order-card__section {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-gray-2);
}

.order-card__section:last-child {
  border-bottom: none;
}

.order-card__subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
}

.order-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.order-card__row:last-child {
  margin-bottom: 0;
}

.order-card__label {
  color: var(--color-gray-5);
}

.order-card__badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.order-card__badge--pending {
  background: var(--color-orange-light, #fff3e0);
  color: var(--color-orange);
}

.order-card__text {
  line-height: 1.6;
  color: var(--color-gray-6);
}

.order-card__divider {
  height: 1px;
  background: var(--color-gray-2);
  margin: var(--space-md) 0;
}

.order-card__row--total {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.order-card__total {
  color: var(--color-red);
  font-size: var(--font-size-2xl);
}

.text-green {
  color: var(--color-green);
}

.text-orange {
  color: var(--color-orange);
  font-weight: var(--font-weight-semibold);
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-gray-1);
}

.order-item__info {
  flex: 1;
}

.order-item__name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
}

.order-item__quantity {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.order-item__price {
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

/* Payment Instructions */
.payment-instructions {
  width: 100%;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.payment-instructions__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-md);
}

.payment-instructions__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  line-height: 1.6;
}

.payment-instructions__qr {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-1);
  border: 2px dashed var(--color-gray-3);
  border-radius: var(--radius-md);
}

/* Actions */
.order-success__actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

/* Error State */
.order-success__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-md);
}

.order-success__error svg {
  color: var(--color-gray-4);
}

.order-success__error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-5);
}

/* Desktop */
@media (min-width: 768px) {
  .order-success__actions {
    max-width: 500px;
  }
}
</style>
