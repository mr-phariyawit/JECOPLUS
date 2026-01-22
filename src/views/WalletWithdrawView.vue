<template>
  <div class="withdraw-view">
    <header class="header">
      <button @click="$router.push('/wallet')" class="back-btn">←</button>
      <h1>ถอนเงิน</h1>
    </header>

    <div class="content">
      <div v-if="loading" class="loading">Processing...</div>

      <div v-else class="withdraw-form">
        <div class="balance-info">
          <p>ยอดเงินที่ถอนได้</p>
          <h2>
            ฿
            {{
              walletStore.balance.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })
            }}
          </h2>
        </div>

        <div class="form-group">
          <label>จำนวนเงิน (บาท)</label>
          <input
            v-model.number="amount"
            type="number"
            placeholder="0.00"
            min="100"
          />
          <p class="hint">ถอนขั้นต่ำ 100 บาท | ค่าธรรมเนียม 15 บาท</p>
        </div>

        <div class="form-group">
          <label>โอนเข้าบัญชี</label>
          <select v-model="selectedBankId">
            <option value="" disabled>เลือกบัญชีธนาคาร</option>
            <option
              v-for="bank in walletStore.bankAccounts"
              :key="bank.id"
              :value="bank.id"
            >
              {{ bank.bankName }} - {{ bank.accountNumber }}
            </option>
          </select>
          <p v-if="walletStore.bankAccounts.length === 0" class="error-text">
            * กรุณาเชื่อมบัญชีธนาคารก่อนถอนเงิน
            <a @click.prevent="$router.push('/wallet/banks')" href="#"
              >เพิ่มบัญชี</a
            >
          </p>
        </div>

        <button
          @click="handleWithdraw"
          :disabled="!isValid"
          class="jeco-btn primary"
        >
          ยืนยันการถอนเงิน
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useWalletStore } from "@/stores/wallet";
import { useRouter } from "vue-router";

const walletStore = useWalletStore();
const router = useRouter();

const amount = ref("");
const selectedBankId = ref("");

onMounted(() => {
  walletStore.fetchBalance();
  walletStore.fetchBankAccounts();
});

const loading = computed(() => walletStore.loading);

const isValid = computed(() => {
  return (
    amount.value >= 100 &&
    amount.value <= walletStore.balance &&
    selectedBankId.value !== ""
  );
});

const handleWithdraw = async () => {
  if (!isValid.value) return;

  if (!confirm(`ยืนยันการถอนเงิน ${amount.value} บาท? (ค่าธรรมเนียม 15 บาท)`))
    return;

  try {
    await walletStore.withdraw(amount.value, selectedBankId.value);
    alert("ดำเนินการถอนเงินสำเร็จ");
    router.push("/wallet");
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
};
</script>

<style scoped>
.withdraw-view {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  margin-right: 15px;
  cursor: pointer;
}

.balance-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 25px;
}

.balance-info h2 {
  color: #007bff;
  margin: 5px 0 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
}

.hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.error-text {
  font-size: 12px;
  color: #dc3545;
  margin-top: 5px;
}

.jeco-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.jeco-btn.primary {
  background: #007bff;
  color: white;
}

.jeco-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
