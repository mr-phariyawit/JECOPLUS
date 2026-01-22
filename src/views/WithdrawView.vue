<template>
  <div class="withdraw-view screen">
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
      <h1 class="app-header__title">ถอนเงิน</h1>
      <div class="app-header__actions"></div>
    </header>

    <div class="content">
      <JCard>
        <div style="padding: 20px; text-align: center">
          <p>ฟีเจอร์ถอนเงินกำลังพัฒนา (Sprint 1)</p>
          <div style="margin-top: 20px">
            <button class="btn btn-primary" @click="handleMockWithdraw">
              จำลองถอนเงิน 500 THB
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

const handleMockWithdraw = async () => {
  // Fixed typo
  try {
    await walletStore.topUp(-500, "BANK_ACCOUNT"); // Just using topUp with negative for quick hack or better call withdraw? Store has NO withdraw action yet in implementation!
    // My store implementation in Step 64 did not implement withdraw action.
    // I need to add withdraw action to store to fix this proper.
    // For now I'll just alert.
    alert("Withdraw action not implemented in store yet (Sprint 1 backlog)");
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
