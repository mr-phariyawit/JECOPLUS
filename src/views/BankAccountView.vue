<template>
  <div class="bank-account-view">
    <header class="header">
      <button @click="$router.push('/wallet')" class="back-btn">←</button>
      <h1>ข้อมูลบัญชีธนาคาร</h1>
    </header>

    <div class="content">
      <div v-if="loading" class="loading">Loading...</div>

      <div v-else>
        <!-- Bank List -->
        <div class="bank-list">
          <div
            v-for="account in bankAccounts"
            :key="account.id"
            class="bank-card"
          >
            <div class="bank-icon">{{ account.bankName.substring(0, 1) }}</div>
            <div class="bank-info">
              <h3>{{ account.bankName }}</h3>
              <p>{{ account.accountName }}</p>
              <p class="account-number">{{ account.accountNumber }}</p>
            </div>
            <div v-if="account.isPrimary" class="primary-badge">หลัก</div>
          </div>
        </div>

        <!-- Add Bank Form -->
        <div class="add-bank-section">
          <h2>เพิ่มบัญชีธนาคาร</h2>
          <form @submit.prevent="handleAddBank" class="add-bank-form">
            <div class="form-group">
              <label>ธนาคาร</label>
              <select v-model="form.bankCode" required>
                <option value="" disabled>เลือกธนาคาร</option>
                <option value="SCB">ไทยพาณิชย์ (SCB)</option>
                <option value="KBANK">กสิกรไทย (KBANK)</option>
                <option value="BBL">กรุงเทพ (BBL)</option>
                <option value="KTB">กรุงไทย (KTB)</option>
                <option value="TTB">ทหารไทยธนชาต (TTB)</option>
              </select>
            </div>

            <div class="form-group">
              <label>เลขที่บัญชี</label>
              <input
                v-model="form.accountNumber"
                type="text"
                placeholder="ไม่ต้องใส่ขีด"
                required
                pattern="\d{10,12}"
              />
            </div>

            <div class="form-group">
              <label>ชื่อบัญชี</label>
              <input
                v-model="form.accountName"
                type="text"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>

            <button type="submit" :disabled="loading" class="jeco-btn primary">
              {{ loading ? "กำลังบันทึก..." : "บันทึกบัญชี" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useWalletStore } from "@/stores/wallet";
import { useRouter } from "vue-router";

const walletStore = useWalletStore();
const router = useRouter();

const loading = computed(() => walletStore.loading);
const bankAccounts = computed(() => walletStore.bankAccounts);

const form = ref({
  bankCode: "",
  accountNumber: "",
  accountName: "",
});

onMounted(() => {
  walletStore.fetchBankAccounts();
});

const handleAddBank = async () => {
  try {
    await walletStore.addBankAccount({
      bankName: form.value.bankCode, // For mock simplicity
      accountNumber: form.value.accountNumber,
      accountName: form.value.accountName,
    });
    form.value = { bankCode: "", accountNumber: "", accountName: "" }; // Reset
    alert("เพิ่มบัญชีสำเร็จ");
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
};
</script>

<style scoped>
.bank-account-view {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  margin-right: 10px;
  cursor: pointer;
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.bank-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.bank-icon {
  width: 40px;
  height: 40px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
}

.bank-info h3 {
  margin: 0;
  font-size: 16px;
}

.bank-info p {
  margin: 2px 0 0;
  font-size: 14px;
  color: #666;
}

.primary-badge {
  margin-left: auto;
  background: #d4edda;
  color: #155724;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.add-bank-section {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.add-bank-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.jeco-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
}

.jeco-btn.primary {
  background: #007bff;
  color: white;
}
</style>
