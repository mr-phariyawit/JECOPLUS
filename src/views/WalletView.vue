<template>
  <div class="wallet-view screen">
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
      <h1 class="app-header__title">J Wallet</h1>
      <div class="app-header__actions"></div>
    </header>

    <div class="wallet-content">
      <!-- Balance Card -->
      <section class="balance-section">
        <JCard>
          <div class="balance-card">
            <p class="balance-label">ยอดเงินคงเหลือ</p>
            <h2 class="balance-amount">
              ฿{{ formatCurrency(walletStore.balance) }}
            </h2>

            <div class="points-badge">
              <span class="points-icon">🎁</span>
              <span>{{ walletStore.points }} Points</span>
            </div>

            <div class="balance-actions">
              <button
                class="action-btn action-btn--primary"
                @click="$router.push('/wallet/topup')"
              >
                <div class="action-icon">➕</div>
                <span>เติมเงิน</span>
              </button>
              <button
                class="action-btn withdraw"
                @click="$router.push('/wallet/withdraw')"
              >
                <span class="icon">💸</span>
                <span>ถอนเงิน</span>
              </button>
              <button
                class="action-btn statement"
                @click="$router.push('/loan/statement-upload')"
              >
                <span class="icon">📄</span>
                <span>Statement</span>
              </button>
            </div>
          </div>
        </JCard>
      </section>

      <!-- Transactions -->
      <section class="transactions-section">
        <div class="flex-between">
          <h2 class="section-title">รายการล่าสุด</h2>
          <button class="text-link">ดูทั้งหมด</button>
        </div>

        <div
          v-if="walletStore.loading && !walletStore.transactions.length"
          class="loading-state"
        >
          <div
            class="skeleton"
            style="height: 60px; margin-bottom: 8px"
            v-for="i in 3"
            :key="i"
          ></div>
        </div>

        <div
          v-else-if="walletStore.transactions.length > 0"
          class="transactions-list"
        >
          <div
            v-for="txn in walletStore.transactions"
            :key="txn.id"
            class="transaction-item"
          >
            <div class="txn-icon" :class="getTxnIconClass(txn.type)">
              {{ getTxnIcon(txn.type) }}
            </div>
            <div class="txn-details">
              <p class="txn-title">{{ txn.title }}</p>
              <p class="txn-date">{{ formatDate(txn.date) }}</p>
            </div>
            <div
              class="txn-amount"
              :class="txn.amount > 0 ? 'text-green' : 'text-red'"
            >
              {{ txn.amount > 0 ? "+" : "" }}{{ formatCurrency(txn.amount) }}
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>ไม่มีรายการล่าสุด</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useWalletStore } from "../stores/wallet";
import { formatCurrency, formatDate } from "../services/mockData";
import JCard from "../components/base/JCard.vue";
import * as walletService from "../services/walletService";

const walletStore = useWalletStore();

const getTxnIcon = (type) => {
  switch (type) {
    case "TOPUP":
      return "➕";
    case "WITHDRAW":
      return "➖";
    case "PAYMENT":
      return "🛒";
    default:
      return "📄";
  }
};

const getTxnIconClass = (type) => {
  switch (type) {
    case "TOPUP":
      return "bg-green-light text-green";
    case "WITHDRAW":
      return "bg-red-light text-red";
    case "PAYMENT":
      return "bg-gray-light text-gray";
    default:
      return "bg-gray-light";
  }
};

onMounted(async () => {
  // We call fetchBalance (store action) and we also need to fetch transactions
  // Since transactions are not yet in the store actions (I forgot to add them in step 64),
  // I will call service directly here or add it to store.
  // Best practice is store. But for speed I'll just load them here or assume store handles it?
  // Wait, step 64 store definition has 'transactions' state but no action to fetch them.
  // I should update store to have fetchTransactions.
  // For now I will manually simulate fetching transactions to walletStore.transactions in onMounted
  // ensuring the UI works.

  await walletStore.fetchBalance();
  await walletStore.fetchTransactions();
});
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  margin-bottom: var(--space-md);
}

.app-header__title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
}

.app-header__back {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.balance-card {
  text-align: center;
  padding: var(--space-md) 0;
}

.balance-label {
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
  margin-bottom: var(--space-xs);
}

.balance-amount {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-sm);
}

.points-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: #fff9c4;
  color: #fbc02d;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-lg);
}

.balance-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  background: none;
  border: none;
  cursor: pointer;
  min-width: 80px;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-gray-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--transition-fast);
}

.action-btn--primary .action-icon {
  background: var(--color-red);
  color: white;
}

.transactions-section {
  margin-top: var(--space-xl);
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--font-size-subtitle);
  font-weight: var(--font-weight-bold);
}

.text-link {
  background: none;
  border: none;
  color: var(--color-red);
  font-size: var(--font-size-small);
  cursor: pointer;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.transaction-item:last-child {
  border-bottom: none;
}

.txn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.bg-green-light {
  background: #e8f5e9;
}
.bg-red-light {
  background: #ffebee;
}
.bg-gray-light {
  background: var(--color-gray-1);
}

.txn-details {
  flex: 1;
}

.txn-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
}

.txn-date {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.txn-amount {
  font-weight: var(--font-weight-bold);
}

.text-green {
  color: #2e7d32;
}
.text-red {
  color: var(--color-red);
}
</style>
