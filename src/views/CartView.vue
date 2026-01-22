<template>
  <div class="cart screen">
    <header class="cart__header">
      <button class="cart__back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <h1 class="text-title">ตะกร้าสินค้า</h1>
      <div style="width: 40px;"></div>
    </header>

    <!-- Empty Cart -->
    <div class="cart__empty">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
        <path d="M9 2L7 6M17 2l2 4M21 6H3m18 0l-2 13H5L3 6h18zM10 11v3m4-3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="cart__empty-title">ตะกร้าสินค้าว่างเปล่า</p>
      <p class="cart__empty-text">เริ่มช้อปปิ้งเพื่อเพิ่มสินค้าลงตะกร้า</p>
      <button class="btn btn--primary" @click="goToMarketplace">
        เลือกซื้อสินค้า
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goToMarketplace = () => {
  router.push('/marketplace');
};
</script>

<style scoped>
.cart {
  min-height: 100vh;
  background: var(--color-gray-1);
}

.cart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-2);
}

.cart__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-black);
  cursor: pointer;
}

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
</style>
