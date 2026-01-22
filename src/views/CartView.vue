<template>
  <div class="cart screen">
    <header class="cart__header">
      <button class="cart__back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <h1 class="text-title">ตะกร้าสินค้า</h1>
      <button v-if="!cartStore.isEmpty" class="cart__clear" @click="confirmClearCart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>

    <!-- Empty Cart -->
    <div v-if="cartStore.isEmpty" class="cart__empty">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
        <path d="M9 2L7 6M17 2l2 4M21 6H3m18 0l-2 13H5L3 6h18zM10 11v3m4-3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="cart__empty-title">ตะกร้าสินค้าว่างเปล่า</p>
      <p class="cart__empty-text">เริ่มช้อปปิ้งเพื่อเพิ่มสินค้าลงตะกร้า</p>
      <button class="btn btn--primary" @click="goToMarketplace">
        เลือกซื้อสินค้า
      </button>
    </div>

    <!-- Cart Items -->
    <div v-else class="cart__content">
      <!-- Items List -->
      <section class="cart__items">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item"
        >
          <div class="cart-item__image-wrap" @click="goToProduct(item.productId)">
            <img
              :src="item.image"
              :alt="item.name"
              class="cart-item__image"
              @error="handleImageError"
            />
          </div>

          <div class="cart-item__info">
            <h3 class="cart-item__name" @click="goToProduct(item.productId)">
              {{ item.name }}
            </h3>
            <p v-if="item.code" class="cart-item__code">
              รหัส: {{ item.code }}
            </p>
            <p v-if="item.variant" class="cart-item__variant">
              {{ item.variant.name }}
            </p>

            <div class="cart-item__footer">
              <div class="cart-item__price-section">
                <p class="cart-item__price">฿{{ formatPrice(item.price) }}</p>
                <p v-if="item.compareAtPrice" class="cart-item__compare-price">
                  ฿{{ formatPrice(item.compareAtPrice) }}
                </p>
              </div>

              <div class="cart-item__actions">
                <!-- Quantity Controls -->
                <div class="cart-item__quantity">
                  <button
                    class="cart-item__quantity-btn"
                    :disabled="item.quantity <= 1"
                    @click="decrementQuantity(item.id)"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <span class="cart-item__quantity-text">{{ item.quantity }}</span>
                  <button
                    class="cart-item__quantity-btn"
                    :disabled="item.quantity >= item.stockQuantity"
                    @click="incrementQuantity(item.id)"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                <!-- Remove Button -->
                <button
                  class="cart-item__remove"
                  @click="confirmRemoveItem(item)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Stock Warning -->
            <p v-if="item.quantity >= item.stockQuantity" class="cart-item__warning">
              มีสินค้าเหลือเพียง {{ item.stockQuantity }} ชิ้น
            </p>
          </div>
        </div>
      </section>

      <!-- Order Summary -->
      <section class="cart__summary">
        <div class="summary-card">
          <h2 class="summary-card__title">สรุปคำสั่งซื้อ</h2>

          <div class="summary-card__row">
            <span class="summary-card__label">ยอดรวมสินค้า ({{ cartStore.itemCount }} ชิ้น)</span>
            <span class="summary-card__value">฿{{ formatPrice(cartStore.subtotal) }}</span>
          </div>

          <div v-if="cartStore.discount > 0" class="summary-card__row summary-card__row--discount">
            <span class="summary-card__label">ส่วนลด</span>
            <span class="summary-card__value">-฿{{ formatPrice(cartStore.discount) }}</span>
          </div>

          <div class="summary-card__row">
            <span class="summary-card__label">ค่าจัดส่ง</span>
            <span class="summary-card__value">
              <span v-if="cartStore.shipping === 0" class="summary-card__free">ฟรี</span>
              <span v-else>฿{{ formatPrice(cartStore.shipping) }}</span>
            </span>
          </div>

          <div v-if="cartStore.subtotal < 1000" class="summary-card__shipping-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>ซื้อเพิ่ม ฿{{ formatPrice(1000 - cartStore.subtotal) }} เพื่อจัดส่งฟรี</span>
          </div>

          <div class="summary-card__divider"></div>

          <div class="summary-card__row summary-card__row--total">
            <span class="summary-card__label">ยอดรวมทั้งหมด</span>
            <span class="summary-card__value summary-card__value--total">
              ฿{{ formatPrice(cartStore.total) }}
            </span>
          </div>

          <button class="btn btn--primary summary-card__checkout" @click="goToCheckout">
            ดำเนินการชำระเงิน
          </button>

          <button class="btn btn--outline summary-card__continue" @click="goToMarketplace">
            เลือกซื้อสินค้าเพิ่ม
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cartStore = useCartStore();

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const incrementQuantity = async (itemId) => {
  try {
    cartStore.incrementQuantity(itemId);
  } catch (error) {
    alert(error.message);
  }
};

const decrementQuantity = (itemId) => {
  cartStore.decrementQuantity(itemId);
};

const confirmRemoveItem = (item) => {
  if (confirm(`ต้องการลบ "${item.name}" ออกจากตะกร้าหรือไม่?`)) {
    cartStore.removeItem(item.id);
  }
};

const confirmClearCart = () => {
  if (confirm('ต้องการล้างตะกร้าสินค้าทั้งหมดหรือไม่?')) {
    cartStore.clearCart();
  }
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
};

const goBack = () => {
  router.back();
};

const goToMarketplace = () => {
  router.push('/marketplace');
};

const goToProduct = (productId) => {
  router.push(`/marketplace/product/${productId}`);
};

const goToCheckout = () => {
  // TODO: Implement checkout flow
  alert('ฟีเจอร์ชำระเงินจะพร้อมใช้งานเร็วๆ นี้');
  // router.push('/checkout');
};
</script>

<style scoped>
.cart {
  min-height: 100vh;
  background: var(--color-gray-1);
  padding-bottom: 80px;
}

/* Header */
.cart__header {
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

.cart__back,
.cart__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-black);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.cart__back:hover,
.cart__clear:hover {
  color: var(--color-red);
}

/* Empty State */
.cart__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-xl);
  text-align: center;
}

.cart__empty svg {
  color: var(--color-gray-3);
  margin-bottom: var(--space-lg);
}

.cart__empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.cart__empty-text {
  color: var(--color-gray-5);
  margin-bottom: var(--space-xl);
}

/* Content */
.cart__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

/* Cart Items */
.cart__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cart-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.cart-item__image-wrap {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-gray-1);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.cart-item__image-wrap:hover {
  opacity: 0.8;
}

.cart-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.cart-item__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  cursor: pointer;
  transition: color var(--transition-fast);
  line-height: 1.4;
}

.cart-item__name:hover {
  color: var(--color-red);
}

.cart-item__code,
.cart-item__variant {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
  margin: 0;
}

.cart-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.cart-item__price-section {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.cart-item__price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
  margin: 0;
}

.cart-item__compare-price {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  text-decoration: line-through;
  margin: 0;
}

.cart-item__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.cart-item__quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-black);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.cart-item__quantity-btn:hover:not(:disabled) {
  color: var(--color-red);
}

.cart-item__quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cart-item__quantity-text {
  min-width: 24px;
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.cart-item__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-3);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-gray-5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cart-item__remove:hover {
  border-color: var(--color-red);
  color: var(--color-red);
  background: var(--color-red-light, #fee);
}

.cart-item__warning {
  font-size: var(--font-size-mini);
  color: var(--color-orange);
  margin: 0;
}

/* Summary */
.cart__summary {
  position: sticky;
  bottom: var(--space-md);
}

.summary-card {
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.summary-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md) 0;
}

.summary-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.summary-card__label {
  color: var(--color-gray-6);
  font-size: var(--font-size-body);
}

.summary-card__value {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-body);
}

.summary-card__row--discount .summary-card__value {
  color: var(--color-green);
}

.summary-card__free {
  color: var(--color-green);
  font-weight: var(--font-weight-semibold);
}

.summary-card__shipping-notice {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-blue-light, #e3f2fd);
  color: var(--color-blue, #1976d2);
  font-size: var(--font-size-small);
  margin-bottom: var(--space-sm);
}

.summary-card__divider {
  height: 1px;
  background: var(--color-gray-2);
  margin: var(--space-md) 0;
}

.summary-card__row--total {
  margin-bottom: var(--space-md);
}

.summary-card__row--total .summary-card__label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.summary-card__value--total {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.summary-card__checkout {
  width: 100%;
  margin-bottom: var(--space-sm);
}

.summary-card__continue {
  width: 100%;
}

/* Desktop */
@media (min-width: 768px) {
  .cart__content {
    max-width: 1200px;
    margin: 0 auto;
    flex-direction: row;
    align-items: flex-start;
  }

  .cart__items {
    flex: 1;
  }

  .cart__summary {
    position: sticky;
    top: 80px;
    width: 350px;
  }
}
</style>
