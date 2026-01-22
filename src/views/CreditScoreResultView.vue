<template>
  <div class="score-view">
    <header class="header">
      <button @click="$router.push('/wallet')" class="back-btn">✕</button>
      <h1>ผลการประเมินเครดิต</h1>
    </header>

    <div class="content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังวิเคราะห์ข้อมูลการเงินของคุณ...</p>
      </div>

      <div v-else-if="loanStore.score" class="result-container">
        <!-- Score Gauge (Visual simulation) -->
        <div :class="['score-circle', loanStore.status.toLowerCase()]">
          <div class="score-number">{{ loanStore.score }}</div>
          <div class="score-label">คะแนนเครดิต</div>
        </div>

        <div class="status-message">
          <h2 v-if="loanStore.status === 'APPROVED'" class="approved">
            ยินดีด้วย! คุณผ่านเกณฑ์
          </h2>
          <h2 v-else class="rejected">ยังไม่ผ่านเกณฑ์ในขณะนี้</h2>
          <p>{{ getStatusMessage(loanStore.status) }}</p>
        </div>

        <!-- Factors -->
        <div class="factors-card">
          <h3>ปัจจัยที่มีผลต่อคะแนน</h3>
          <div class="factor-item">
            <span>รายได้สุทธิ</span>
            <span class="value"
              >฿{{ loanStore.factors?.income.toLocaleString() }}</span
            >
          </div>
          <div class="factor-item">
            <span>ภาระหนี้/รายจ่าย</span>
            <span :class="['value', getRatioColor(loanStore.factors?.ratio)]">
              {{ (loanStore.factors?.ratio * 100).toFixed(0) }}%
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button
            v-if="loanStore.status === 'APPROVED'"
            class="jeco-btn primary"
            @click="applyLoan"
          >
            สมัครสินเชื่อทันที
          </button>
          <button
            v-else
            class="jeco-btn outline"
            @click="$router.push('/wallet')"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>

      <!-- Fallback if accessed directly without data -->
      <div v-else class="empty-state">
        <p>ไม่พบข้อมูลการประเมิน</p>
        <button
          @click="$router.push('/loan/statement-upload')"
          class="jeco-btn"
        >
          อัปโหลด Statement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useLoanStore } from "@/stores/loan";
import { useRouter } from "vue-router";

const loanStore = useLoanStore();
const router = useRouter();
const loading = computed(() => loanStore.loading);

// Mock auto-calculate if coming from proper flow, or strictly rely on store state
// For demo, we might want to trigger it if we have 'pending' data, but
// usually the calculation happens at the previous step (Upload).
// Here we assume store has state, or we redirect.

onMounted(async () => {
  // Demo: If no score, try to mock one for visualization if dev mode?
  if (!loanStore.score) {
    // Uncomment to auto-simulate on load for dev/preview
    // await loanStore.calculateScore({ income: 50000, expenses: 15000 })
  }
});

const getStatusMessage = (status) => {
  if (status === "APPROVED") {
    return "สุขภาพทางการเงินของคุณแข็งแรงมาก สามารถยื่นขอสินเชื่อได้ทันที";
  } else {
    return "ควรลดภาระค่าใช้จ่ายและรักษาเงินในบัญชีให้สม่ำเสมอเพื่อเพิ่มคะแนน";
  }
};

const getRatioColor = (ratio) => {
  if (ratio < 0.5) return "text-success";
  if (ratio < 0.7) return "text-warning";
  return "text-danger";
};

const applyLoan = () => {
  alert("ระบบสมัครสินเชื่อจะเปิดให้บริการเร็วๆ นี้");
};
</script>

<style scoped>
.score-view {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
}

.header {
  margin-bottom: 30px;
  position: relative;
  text-align: center;
}

.header h1 {
  font-size: 20px;
  margin: 0;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 10px solid #eee;
  margin: 0 auto 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.score-circle.approved {
  border-color: #28a745;
  color: #28a745;
}

.score-circle.rejected {
  border-color: #dc3545;
  color: #dc3545;
}

.score-number {
  font-size: 56px;
  font-weight: bold;
}

.score-label {
  font-size: 16px;
  color: #666;
}

.status-message {
  text-align: center;
  margin-bottom: 40px;
}

.status-message h2 {
  margin: 0 0 10px;
}

.status-message p {
  color: #666;
  margin: 0;
}

.approved {
  color: #28a745;
}
.rejected {
  color: #dc3545;
}

.factors-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.factors-card h3 {
  margin-top: 0;
  font-size: 16px;
  margin-bottom: 15px;
}

.factor-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.text-success {
  color: #28a745;
  font-weight: bold;
}
.text-warning {
  color: #ffc107;
  font-weight: bold;
}
.text-danger {
  color: #dc3545;
  font-weight: bold;
}

.jeco-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.jeco-btn.primary {
  background: #007bff;
  color: white;
}

.jeco-btn.outline {
  background: white;
  border: 2px solid #ddd;
  color: #666;
}

.loading-state {
  text-align: center;
  padding-top: 50px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
