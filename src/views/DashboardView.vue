<template>
  <div class="dashboard screen">
    <header class="dashboard__header">
      <div class="dashboard__greeting">
        <p class="text-small">สวัสดี</p>
        <h1 class="text-title">{{ authStore.fullName || "คุณลูกค้า" }}</h1>
      </div>
      <button class="dashboard__notif" @click="goToNotifications">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-if="unreadCount" class="dashboard__notif-badge">{{
          unreadCount
        }}</span>
      </button>
    </header>

    <!-- AI Recommendation Banner -->
    <section class="ai-recommend">
      <JCard elevated>
        <div class="ai-recommend__content">
          <div class="ai-recommend__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="ai-recommend__text">
            <span class="ai-recommend__badge">AI แนะนำ</span>
            <p class="ai-recommend__title">KB Personal Loan</p>
            <p class="ai-recommend__desc">
              เหมาะกับโปรไฟล์ของคุณ ดอกเบี้ยต่ำสุด 15%
            </p>
          </div>
          <button
            class="ai-recommend__btn"
            @click="$router.push('/ai-scoring')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </JCard>
    </section>

    <!-- Summary Card -->
    <section class="dashboard__summary">
      <JCard>
        <div class="summary">
          <p class="summary__label">ยอดหนี้คงเหลือทั้งหมด</p>
          <p class="summary__amount amount amount--large">
            ฿{{ formatCurrency(loansStore.totalBalance) }}
          </p>
          <div class="summary__stats">
            <div class="summary__stat">
              <span class="summary__stat-value">{{
                loansStore.activeLoans.length
              }}</span>
              <span class="summary__stat-label">สัญญา</span>
            </div>
            <div class="summary__divider"></div>
            <div class="summary__stat">
              <span class="summary__stat-value">{{ nextDueDays }}</span>
              <span class="summary__stat-label">วันถึงกำหนดชำระ</span>
            </div>
          </div>
        </div>
      </JCard>
    </section>

    <!-- Loans List -->
    <section class="dashboard__loans section">
      <div class="flex-between">
        <h2 class="section-title">สินเชื่อของฉัน</h2>
        <router-link to="/loans" class="dashboard__see-all"
          >ดูทั้งหมด</router-link
        >
      </div>

      <div v-if="loansStore.isLoading" class="dashboard__loading">
        <div
          v-for="i in 2"
          :key="i"
          class="skeleton"
          style="height: 120px; margin-bottom: 12px"
        ></div>
      </div>

      <div v-else class="dashboard__loan-list">
        <JCard
          v-for="loan in loansStore.activeLoans"
          :key="loan.loanId"
          selectable
          @click="goToLoan(loan.loanId)"
        >
          <div class="loan-card">
            <div class="loan-card__header">
              <span class="loan-card__type">{{ loan.productName }}</span>
              <JBadge
                :label="loan.status === 'ACTIVE' ? 'Active' : loan.status"
                :variant="loan.status === 'ACTIVE' ? 'success' : 'default'"
              />
            </div>
            <p class="loan-card__balance amount amount--medium">
              ฿{{ formatCurrency(loan.remainingBalance) }}
            </p>
            <div class="loan-card__footer">
              <div class="loan-card__progress-wrap">
                <div class="loan-card__progress">
                  <div
                    class="loan-card__progress-bar"
                    :style="{
                      width: `${(loan.paidInstallments / loan.totalInstallments) * 100}%`,
                    }"
                  ></div>
                </div>
                <span class="text-mini"
                  >{{ loan.paidInstallments }}/{{
                    loan.totalInstallments
                  }}
                  งวด</span
                >
              </div>
              <div class="loan-card__due">
                <span class="text-mini"
                  >ครบกำหนด {{ formatDate(loan.nextDueDate) }}</span
                >
              </div>
            </div>
          </div>
        </JCard>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="dashboard__actions section">
      <h2 class="section-title">การดำเนินการ</h2>
      <div class="actions-grid">
        <button class="action-item" @click="$router.push('/apply')">
          <div class="action-item__icon action-item__icon--loan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 9V15M9 12H15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span>สมัครสินเชื่อ</span>
        </button>
        <button class="action-item" @click="$router.push('/bills')">
          <div class="action-item__icon action-item__icon--payment">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M2 10H22" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span>จ่ายบิล/บริการ</span>
        </button>
        <button class="action-item" @click="openChat">
          <div class="action-item__icon action-item__icon--support">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M9 9a3 3 0 115.83 1c0 2-3 3-3 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M12 17h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span>AI Assistant</span>
        </button>
      </div>
    </section>

    <!-- Demo Section for Hackathon -->
    <section class="demo-section section">
      <h2 class="section-title">Demo Features</h2>
      <p class="demo-desc">Hackathon Presentation</p>

      <div class="demo-grid">
        <button class="demo-item" @click="$router.push('/ai-scoring')">
          <div class="demo-item__icon demo-item__icon--ai">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="demo-item__content">
            <span class="demo-item__title">AI Credit Scoring</span>
            <span class="demo-item__desc">ระบบวิเคราะห์ credit ด้วย ML</span>
          </div>
        </button>

        <button class="demo-item" @click="$router.push('/business-impact')">
          <div class="demo-item__icon demo-item__icon--business">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" />
              <path
                d="M18 9l-5 5-4-4-3 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="demo-item__content">
            <span class="demo-item__title">Business Impact</span>
            <span class="demo-item__desc">ROI และ Business Value</span>
          </div>
        </button>

        <button class="demo-item" @click="$router.push('/architecture')">
          <div class="demo-item__icon demo-item__icon--tech">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 21h8M12 17v4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="demo-item__content">
            <span class="demo-item__title">System Architecture</span>
            <span class="demo-item__desc">System Thinking & Design</span>
          </div>
        </button>

        <button class="demo-item" @click="$router.push('/ecosystem')">
          <div class="demo-item__icon demo-item__icon--eco">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle
                cx="12"
                cy="4"
                r="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle
                cx="19"
                cy="17"
                r="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle
                cx="5"
                cy="17"
                r="2"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="demo-item__content">
            <span class="demo-item__title">Jaymart Ecosystem</span>
            <span class="demo-item__desc">16 บริษัทในเครือ</span>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useLoansStore } from "../stores/loans";
import {
  formatCurrency,
  formatDate,
  notifications,
} from "../services/mockData";
import JCard from "../components/base/JCard.vue";
import JBadge from "../components/base/JBadge.vue";
import { useAIChatStore } from "../stores/chat";

const router = useRouter();
const authStore = useAuthStore();
const loansStore = useLoansStore();
const chatStore = useAIChatStore();

const unreadCount = computed(() => {
  return notifications.filter((n) => !n.read).length;
});

const nextDueDays = computed(() => {
  if (loansStore.activeLoans.length === 0) return "-";
  const nextDue = loansStore.activeLoans
    .map((l) => new Date(l.nextDueDate))
    .sort((a, b) => a - b)[0];
  const today = new Date();
  const diff = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

const goToLoan = (loanId) => {
  router.push(`/loan/${loanId}`);
};

const goToNotifications = () => {
  router.push("/notifications");
};

const openChat = () => {
  chatStore.openChat();
};

onMounted(() => {
  loansStore.fetchLoans();
});
</script>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
}

.dashboard__greeting h1 {
  margin-top: 2px;
}

.dashboard__notif {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-1);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
}

.dashboard__notif-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  background: var(--color-red);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* AI Recommendation */
.ai-recommend {
  margin-bottom: var(--space-md);
}

.ai-recommend__content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.ai-recommend__icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-red) 0%, #ff6b6b 100%);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.ai-recommend__text {
  flex: 1;
}

.ai-recommend__badge {
  display: inline-block;
  padding: 2px var(--space-sm);
  background: rgba(228, 0, 15, 0.1);
  color: var(--color-red);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  margin-bottom: 2px;
}

.ai-recommend__title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
}

.ai-recommend__desc {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.ai-recommend__btn {
  width: 40px;
  height: 40px;
  background: var(--color-gray-1);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dashboard__summary {
  margin-bottom: var(--space-lg);
}

.summary {
  text-align: center;
  padding: var(--space-md) 0;
}

.summary__label {
  color: var(--color-gray-4);
  margin-bottom: var(--space-xs);
}

.summary__amount {
  margin-bottom: var(--space-lg);
}

.summary__stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
}

.summary__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary__stat-value {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.summary__stat-label {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.summary__divider {
  width: 1px;
  background: var(--color-gray-2);
}

.dashboard__see-all {
  color: var(--color-red);
  font-size: var(--font-size-small);
  text-decoration: none;
}

.dashboard__loan-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.loan-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.loan-card__type {
  font-weight: var(--font-weight-medium);
}

.loan-card__balance {
  margin-bottom: var(--space-md);
}

.loan-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.loan-card__progress-wrap {
  flex: 1;
  max-width: 60%;
}

.loan-card__progress {
  height: 4px;
  background: var(--color-gray-2);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 4px;
}

.loan-card__progress-bar {
  height: 100%;
  background: var(--color-red);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-item:hover {
  background: var(--color-gray-2);
}

.action-item__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--color-white);
}

.action-item__icon--loan {
  background: var(--color-red);
}
.action-item__icon--payment {
  background: var(--color-black);
}
.action-item__icon--support {
  background: var(--color-gray-5);
}
.action-item__icon--money {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-item span {
  font-size: var(--font-size-mini);
  font-weight: var(--font-weight-medium);
}

/* Demo Section */
.demo-section {
  background: linear-gradient(135deg, #1e1c1c 0%, #2d2b2b 100%);
  margin: 0 calc(-1 * var(--space-md));
  margin-bottom: calc(-1 * 80px - var(--space-md));
  padding: var(--space-lg) var(--space-md);
  padding-bottom: calc(80px + var(--space-xl));
  color: white;
}

.demo-section .section-title {
  color: white;
}

.demo-desc {
  font-size: var(--font-size-small);
  opacity: 0.7;
  margin-bottom: var(--space-md);
}

.demo-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.demo-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.demo-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-red);
}

.demo-item__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.demo-item__icon--ai {
  background: var(--color-red);
}
.demo-item__icon--business {
  background: #10b981;
}
.demo-item__icon--tech {
  background: #3b82f6;
}
.demo-item__icon--eco {
  background: #8b5cf6;
}

.demo-item__content {
  flex: 1;
}

.demo-item__title {
  display: block;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-body);
}

.demo-item__desc {
  display: block;
  font-size: var(--font-size-mini);
  opacity: 0.7;
}
</style>
