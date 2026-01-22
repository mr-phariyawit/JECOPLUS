<template>
  <div class="pay-jwallet screen screen--no-nav">
    <JHeader title="ชำระผ่าน J Wallet" />

    <!-- Processing State -->
    <template v-if="paymentStore.isProcessing">
      <div class="processing">
        <div class="processing__animation">
          <div class="processing__circle"></div>
          <div class="processing__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M2 10H22" stroke="currentColor" stroke-width="2" />
              <circle cx="17" cy="15" r="2" fill="currentColor" />
            </svg>
          </div>
        </div>
        <h2 class="processing__title">กำลังดำเนินการ...</h2>
        <p class="processing__subtitle text-small">กรุณารอสักครู่</p>
      </div>
    </template>

    <!-- Confirmation State -->
    <template v-else>
      <section class="pay-jwallet__content">
        <!-- J Wallet Card -->
        <div class="jwallet-card">
          <div class="jwallet-card__logo">
            <span class="jwallet-card__j">J</span>
            <span class="jwallet-card__name">Wallet</span>
          </div>
          <p class="jwallet-card__desc">
            ระบบจะเปิด J Wallet เพื่อยืนยันการชำระเงิน
          </p>
        </div>

        <!-- Payment Details -->
        <JCard>
          <div class="payment-details">
            <h3 class="payment-details__title">รายละเอียดการชำระ</h3>

            <div class="payment-details__row">
              <span>สินเชื่อ</span>
              <span>{{ loan?.productName }}</span>
            </div>
            <div class="payment-details__row">
              <span>เลขที่สัญญา</span>
              <span>{{ loan?.contractNo }}</span>
            </div>
            <div class="payment-details__row">
              <span>งวดที่</span>
              <span>{{ installment?.no }}</span>
            </div>
            <div class="payment-details__row">
              <span>วันครบกำหนด</span>
              <span>{{ formatDate(installment?.dueDate) }}</span>
            </div>

            <div class="payment-details__divider"></div>

            <div class="payment-details__row payment-details__row--total">
              <span>ยอดชำระรวม</span>
              <span class="payment-details__amount"
                >฿{{ formatCurrency(installment?.amount) }}</span
              >
            </div>
          </div>
        </JCard>

        <!-- Notice -->
        <div class="pay-jwallet__notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M12 16v-4M12 8h.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <p class="text-mini">
            คุณจะถูกนำไปยัง J Wallet เพื่อยืนยันการชำระเงิน หากสำเร็จ
            ระบบจะนำคุณกลับมาที่ JECO+ อัตโนมัติ
          </p>
        </div>
      </section>

      <!-- Confirm Button -->
      <div class="pay-jwallet__footer">
        <JButton variant="primary" @click="confirmPayment">
          ยืนยันชำระเงิน ฿{{ formatCurrency(installment?.amount) }}
        </JButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoansStore } from "../stores/loans";
import { usePaymentStore } from "../stores/payment";
import { formatCurrency, formatDate } from "../services/mockData";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";
import JButton from "../components/base/JButton.vue";

const route = useRoute();
const router = useRouter();
const loansStore = useLoansStore();
const paymentStore = usePaymentStore();

const loan = computed(() => loansStore.selectedLoan);
const installment = computed(() => {
  return loansStore.installments.find(
    (i) => i.installmentId === route.params.installmentId,
  );
});

const confirmPayment = async () => {
  const { loanId, installmentId } = route.params;

  const result = await paymentStore.payWithJWallet(
    loanId,
    installmentId,
    installment.value?.amount,
  );

  if (result.success) {
    loansStore.markInstallmentPaid(installmentId);
    router.replace("/payment-result/success");
  } else {
    router.replace("/payment-result/failed");
  }
};

onMounted(async () => {
  await loansStore.fetchLoanDetail(route.params.loanId);
});
</script>

<style scoped>
.pay-jwallet__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.jwallet-card {
  background: linear-gradient(135deg, var(--color-red), #ff4444);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--color-white);
  text-align: center;
}

.jwallet-card__logo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: var(--space-sm);
}

.jwallet-card__j {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
}

.jwallet-card__name {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
}

.jwallet-card__desc {
  opacity: 0.9;
}

.payment-details__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-md);
}

.payment-details__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  color: var(--color-gray-5);
}

.payment-details__row span:last-child {
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
}

.payment-details__divider {
  height: 1px;
  background: var(--color-gray-2);
  margin: var(--space-sm) 0;
}

.payment-details__row--total {
  padding-top: var(--space-md);
}

.payment-details__amount {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red) !important;
}

.pay-jwallet__notice {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  color: var(--color-gray-4);
}

.pay-jwallet__footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: var(--space-md);
  background: var(--color-white);
  border-top: 1px solid var(--color-gray-2);
}

/* Processing State */
.processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.processing__animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-xl);
}

.processing__circle {
  position: absolute;
  inset: 0;
  border: 3px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing__icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-red);
}

.processing__title {
  margin-bottom: var(--space-xs);
}

.processing__subtitle {
  color: var(--color-gray-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
