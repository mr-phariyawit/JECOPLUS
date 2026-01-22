<template>
  <div class="topup-view screen">
    <header class="app-header">
      <button class="app-header__back" @click="$router.go(-1)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="app-header__title">เติมเงิน</h1>
      <div class="app-header__actions"></div>
    </header>

    <div class="content">
      <JCard>
        <div style="padding: 20px; text-align: center">
          <p>ฟีเจอร์เติมเงินกำลังพัฒนา (Sprint 1)</p>
          <div style="margin-top: 20px">
            <button class="btn btn-primary" @click="handleMockTopUp">
              จำลองเติมเงิน 1,000 THB
            </button>
          </div>
        </div>
      </JCard>
    </div>
  </div>
</template>

<script setup>
import JCard from "../components/base/JCard.vue";
import { useWalletStore } from "../stores/wallet";
import { useRouter } from "vue-router";

const walletStore = useWalletStore();
const router = useRouter();

const handleMockTopUp = async () => {
  try {
    await walletStore.topUp(1000, "PROMPTPAY");
    alert("เติมเงินสำเร็จ!");
    router.go(-1);
  } catch (e) {
    alert(e);
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  margin-bottom: var(--space-md);
}
.app-header__back {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.app-header__title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
}
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.btn-primary {
  background: var(--color-red);
  color: white;
}
</style>
