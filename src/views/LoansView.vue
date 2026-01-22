<template>
  <div class="loans screen">
    <JHeader title="สินเชื่อของฉัน" :showBack="false" />

    <div v-if="loansStore.isLoading" class="loans__loading">
      <div
        v-for="i in 3"
        :key="i"
        class="skeleton"
        style="height: 140px; margin-bottom: 12px"
      ></div>
    </div>

    <div v-else-if="loansStore.loans.length === 0" class="loans__empty">
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
        <h3>ยังไม่มีสินเชื่อ</h3>
        <p>สมัครสินเชื่อกับ JECO+ วันนี้</p>
        <JButton variant="primary" style="margin-top: 16px">
          สมัครสินเชื่อ
        </JButton>
      </div>
    </div>

    <div v-else class="loans__list">
      <JCard
        v-for="loan in loansStore.loans"
        :key="loan.loanId"
        selectable
        @click="goToDetail(loan.loanId)"
      >
        <div class="loan-item">
          <div class="loan-item__header">
            <div>
              <span class="loan-item__type">{{ loan.productName }}</span>
              <p class="loan-item__contract text-mini">{{ loan.contractNo }}</p>
            </div>
            <JBadge
              :label="getStatusLabel(loan.status)"
              :variant="getStatusVariant(loan.status)"
            />
          </div>

          <div class="loan-item__body">
            <div class="loan-item__info">
              <span class="text-mini">ยอดคงเหลือ</span>
              <span class="amount amount--medium"
                >฿{{ formatCurrency(loan.remainingBalance) }}</span
              >
            </div>
            <div class="loan-item__info">
              <span class="text-mini">งวดถัดไป</span>
              <span class="loan-item__due">
                ฿{{ formatCurrency(loan.nextDueAmount) }}
                <span class="text-mini">
                  • {{ formatDate(loan.nextDueDate) }}</span
                >
              </span>
            </div>
          </div>

          <div class="loan-item__progress">
            <div class="loan-item__progress-bar">
              <div
                class="loan-item__progress-fill"
                :style="{
                  width: `${(loan.paidInstallments / loan.totalInstallments) * 100}%`,
                }"
              ></div>
            </div>
            <span class="text-mini"
              >ชำระแล้ว {{ loan.paidInstallments }}/{{
                loan.totalInstallments
              }}
              งวด</span
            >
          </div>

          <JButton
            variant="primary"
            class="loan-item__cta"
            @click.stop="goToPay(loan)"
          >
            ชำระค่างวด
          </JButton>
        </div>
      </JCard>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoansStore } from "../stores/loans";
import { formatCurrency, formatDate } from "../services/mockData";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";
import JBadge from "../components/base/JBadge.vue";
import JButton from "../components/base/JButton.vue";

const router = useRouter();
const loansStore = useLoansStore();

const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: "กำลังผ่อน",
    PAID_OFF: "ชำระครบแล้ว",
    OVERDUE: "ค้างชำระ",
  };
  return labels[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    ACTIVE: "success",
    PAID_OFF: "info",
    OVERDUE: "error",
  };
  return variants[status] || "default";
};

const goToDetail = (loanId) => {
  router.push(`/loan/${loanId}`);
};

const goToPay = (loan) => {
  // Navigate to payment with first pending installment
  loansStore.fetchLoanDetail(loan.loanId).then(() => {
    const pending = loansStore.installments.find((i) => i.status === "PENDING");
    if (pending) {
      router.push(`/pay/${loan.loanId}/${pending.installmentId}`);
    }
  });
};

onMounted(() => {
  loansStore.fetchLoans();
});
</script>

<style scoped>
.loans__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loans__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.empty-state {
  text-align: center;
  color: var(--color-gray-4);
}

.empty-state__icon {
  margin-bottom: var(--space-md);
  color: var(--color-gray-3);
}

.empty-state h3 {
  color: var(--color-black);
  margin-bottom: var(--space-xs);
}

.loan-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.loan-item__type {
  font-weight: var(--font-weight-bold);
}

.loan-item__contract {
  margin-top: 2px;
}

.loan-item__body {
  display: flex;
  gap: var(--space-xl);
  margin-bottom: var(--space-md);
}

.loan-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loan-item__due {
  font-weight: var(--font-weight-medium);
}

.loan-item__progress {
  margin-bottom: var(--space-md);
}

.loan-item__progress-bar {
  height: 6px;
  background: var(--color-gray-2);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-xs);
}

.loan-item__progress-fill {
  height: 100%;
  background: var(--color-red);
  border-radius: var(--radius-full);
}

.loan-item__cta {
  margin-top: var(--space-sm);
}
</style>
