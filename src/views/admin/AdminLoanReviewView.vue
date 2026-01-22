<template>
  <div class="loan-review">
    <!-- Back Button -->
    <button class="loan-review__back" @click="goBack">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6" />
      </svg>
      <span>Back to Loan Queue</span>
    </button>

    <div v-if="adminStore.isLoading" class="loan-review__loading">
      <div class="loan-review__spinner"></div>
      <span>Loading loan data...</span>
    </div>

    <template v-else-if="loanData">
      <div class="loan-review__grid">
        <!-- Main Column -->
        <div class="loan-review__main">
          <!-- Loan Request -->
          <div class="loan-review__card">
            <h3 class="loan-review__card-title">Loan Request</h3>
            <div class="loan-review__row">
              <span class="loan-review__label">Amount Requested</span>
              <span class="loan-review__value loan-review__value--amount">{{ formatCurrency(loan?.amountRequested) }}</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Term</span>
              <span class="loan-review__value">{{ loan?.termMonths }} months</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Purpose</span>
              <span class="loan-review__value">{{ loan?.purpose || '-' }}</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Status</span>
              <span class="loan-review__badge" :class="`loan-review__badge--${getStatusVariant(loan?.status)}`">
                {{ getStatusLabel(loan?.status) }}
              </span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Submitted</span>
              <span class="loan-review__value">{{ formatDate(loan?.submittedAt) }}</span>
            </div>
          </div>

          <!-- Applicant Info -->
          <div class="loan-review__card">
            <h3 class="loan-review__card-title">Applicant</h3>
            <div class="loan-review__row">
              <span class="loan-review__label">Phone</span>
              <span class="loan-review__value">{{ formatPhone(user?.phone) }}</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Name</span>
              <span class="loan-review__value">{{ user?.firstName || '-' }} {{ user?.lastName || '' }}</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Email</span>
              <span class="loan-review__value">{{ user?.email || '-' }}</span>
            </div>
            <div class="loan-review__row">
              <span class="loan-review__label">Age</span>
              <span class="loan-review__value">{{ calculateAge(user?.birthDate) }} years</span>
            </div>
          </div>

          <!-- Credit Assessment -->
          <div class="loan-review__card">
            <h3 class="loan-review__card-title">Credit Assessment</h3>

            <div class="loan-review__credit-score">
              <span class="loan-review__credit-score-label">Credit Score</span>
              <span class="loan-review__credit-score-value" :class="`loan-review__credit-score-value--${getScoreColor(creditScore?.score)}`">
                {{ creditScore?.score || '-' }}
              </span>
              <span class="loan-review__credit-score-status" :class="`loan-review__credit-score-status--${creditScore?.status?.toLowerCase()}`">
                {{ creditScore?.status || '-' }}
              </span>
            </div>

            <div class="loan-review__breakdown">
              <h4 class="loan-review__breakdown-title">Scoring Breakdown</h4>

              <div v-for="(factor, key) in creditScore?.breakdown || {}" :key="key" class="loan-review__factor">
                <div class="loan-review__factor-header">
                  <span>{{ getFactorLabel(key) }}</span>
                  <span class="loan-review__factor-score">{{ factor.score }} / {{ Math.floor(850 * factor.weight) }}</span>
                </div>
                <div class="loan-review__factor-bar">
                  <div
                    class="loan-review__factor-fill"
                    :style="{ width: `${(factor.score / (850 * factor.weight)) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="loan-review__financial">
              <div class="loan-review__row">
                <span class="loan-review__label">Monthly Income</span>
                <span class="loan-review__value">{{ formatCurrency(creditScore?.monthlyIncome) }}</span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Monthly Expenses</span>
                <span class="loan-review__value">{{ formatCurrency(creditScore?.monthlyExpenses) }}</span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Expense Ratio</span>
                <span class="loan-review__value">{{ (creditScore?.expenseRatio * 100)?.toFixed(1) || '-' }}%</span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Avg Balance</span>
                <span class="loan-review__value">{{ formatCurrency(creditScore?.avgBalance) }}</span>
              </div>
            </div>
          </div>

          <!-- Partner Submissions -->
          <div v-if="partnerSubmissions && partnerSubmissions.length > 0" class="loan-review__card">
            <h3 class="loan-review__card-title">Partner Submissions</h3>
            <div v-for="submission in partnerSubmissions" :key="submission.id" class="loan-review__partner">
              <div class="loan-review__row">
                <span class="loan-review__label">Partner ID</span>
                <span class="loan-review__value">{{ submission.partnerId }}</span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Application ID</span>
                <span class="loan-review__value">{{ submission.applicationId }}</span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Status</span>
                <span class="loan-review__badge" :class="`loan-review__badge--${getStatusVariant(submission.status)}`">
                  {{ submission.status }}
                </span>
              </div>
              <div class="loan-review__row">
                <span class="loan-review__label">Submitted</span>
                <span class="loan-review__value">{{ formatDate(submission.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Decision Panel -->
        <div class="loan-review__sidebar">
          <div class="loan-review__card">
            <h3 class="loan-review__card-title">Decision</h3>

            <div class="loan-review__field">
              <label class="loan-review__field-label">Approved Amount (optional)</label>
              <input
                v-model.number="approvedAmount"
                type="number"
                class="loan-review__input"
                :placeholder="loan?.amountRequested?.toString()"
              />
              <span class="loan-review__field-hint">Leave empty to use requested amount</span>
            </div>

            <div class="loan-review__field">
              <label class="loan-review__field-label">Approved Term (optional)</label>
              <input
                v-model.number="approvedTerm"
                type="number"
                class="loan-review__input"
                :placeholder="loan?.termMonths?.toString()"
              />
              <span class="loan-review__field-hint">Leave empty to use requested term</span>
            </div>

            <div class="loan-review__field">
              <label class="loan-review__field-label">Notes (optional)</label>
              <textarea
                v-model="notes"
                class="loan-review__textarea"
                placeholder="Add notes..."
                rows="4"
              ></textarea>
            </div>

            <div class="loan-review__actions">
              <button class="loan-review__btn loan-review__btn--reject" @click="showRejectModal = true">
                Reject
              </button>
              <button
                class="loan-review__btn loan-review__btn--approve"
                :disabled="adminStore.isLoading"
                @click="handleApprove"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Reject Modal -->
    <AdminModal v-model="showRejectModal" title="Reject Loan Application" size="sm">
      <div class="loan-review__modal-content">
        <p>Please provide a reason for rejecting this loan application.</p>

        <div class="loan-review__field">
          <label class="loan-review__field-label">Rejection Reason *</label>
          <select v-model="rejectCode" class="loan-review__select">
            <option value="">Select reason...</option>
            <option value="LOW_CREDIT_SCORE">Credit score below threshold</option>
            <option value="INSUFFICIENT_INCOME">Insufficient income</option>
            <option value="HIGH_DEBT_RATIO">High debt-to-income ratio</option>
            <option value="INCOMPLETE_DOCUMENTS">Incomplete documentation</option>
            <option value="EMPLOYMENT_ISSUES">Employment verification failed</option>
            <option value="FRAUD_SUSPICION">Suspected fraud</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div class="loan-review__field">
          <label class="loan-review__field-label">Additional Details</label>
          <textarea
            v-model="rejectReason"
            class="loan-review__textarea"
            placeholder="Enter details..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button class="loan-review__btn loan-review__btn--secondary" @click="showRejectModal = false">
          Cancel
        </button>
        <button
          class="loan-review__btn loan-review__btn--reject"
          :disabled="!rejectCode"
          @click="handleReject"
        >
          Confirm Reject
        </button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';
import AdminModal from '../../components/admin/AdminModal.vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const notes = ref('');
const approvedAmount = ref(null);
const approvedTerm = ref(null);
const showRejectModal = ref(false);
const rejectCode = ref('');
const rejectReason = ref('');

const loanData = computed(() => adminStore.selectedLoan);
const loan = computed(() => loanData.value?.loan);
const user = computed(() => loanData.value?.user);
const creditScore = computed(() => loanData.value?.creditScore);
const partnerSubmissions = computed(() => loanData.value?.partnerSubmissions || []);

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateAge = (birthDate) => {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getScoreColor = (score) => {
  if (!score) return 'default';
  if (score >= 700) return 'success';
  if (score >= 600) return 'warning';
  return 'error';
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING_PARTNER: 'Pending Partner',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SUBMISSION_FAILED: 'Submission Failed',
  };
  return labels[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    PENDING_PARTNER: 'warning',
    SUBMITTED: 'info',
    UNDER_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    SUBMISSION_FAILED: 'error',
    PENDING: 'warning',
  };
  return variants[status] || 'default';
};

const getFactorLabel = (key) => {
  const labels = {
    incomeStability: 'Income Stability',
    expenseRatio: 'Expense Ratio',
    avgBalance: 'Average Balance',
    paymentHistory: 'Payment History',
    employment: 'Employment',
    age: 'Age',
  };
  return labels[key] || key;
};

const goBack = () => {
  router.push('/admin/loans');
};

const handleApprove = async () => {
  const result = await adminStore.approveLoan(
    route.params.loanId,
    notes.value || null,
    approvedAmount.value || null,
    approvedTerm.value || null
  );

  if (result.success) {
    router.push('/admin/loans');
  } else {
    alert(result.error);
  }
};

const handleReject = async () => {
  const reason = [rejectCode.value, rejectReason.value].filter(Boolean).join(': ');

  const result = await adminStore.rejectLoan(route.params.loanId, reason, rejectCode.value);

  if (result.success) {
    showRejectModal.value = false;
    router.push('/admin/loans');
  } else {
    alert(result.error);
  }
};

onMounted(() => {
  adminStore.fetchLoanDetail(route.params.loanId);
});
</script>

<style scoped>
.loan-review__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
  background: none;
  border: none;
  color: var(--color-gray-4);
  cursor: pointer;
  margin-bottom: var(--space-md);
}

.loan-review__back:hover {
  color: var(--color-red);
}

.loan-review__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
  color: var(--color-gray-4);
}

.loan-review__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loan-review__grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-lg);
}

@media (max-width: 1200px) {
  .loan-review__grid {
    grid-template-columns: 1fr;
  }
}

.loan-review__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loan-review__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loan-review__card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.loan-review__card-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-gray-2);
}

.loan-review__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.loan-review__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.loan-review__value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.loan-review__value--amount {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.loan-review__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.loan-review__badge--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.loan-review__badge--success {
  background: #dcfce7;
  color: #166534;
}

.loan-review__badge--warning {
  background: #fef9c3;
  color: #854d0e;
}

.loan-review__badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.loan-review__badge--info {
  background: #dbeafe;
  color: #1e40af;
}

.loan-review__credit-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-lg) 0;
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.loan-review__credit-score-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loan-review__credit-score-value {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.loan-review__credit-score-value--success {
  color: #22c55e;
}

.loan-review__credit-score-value--warning {
  color: #eab308;
}

.loan-review__credit-score-value--error {
  color: #ef4444;
}

.loan-review__credit-score-value--default {
  color: var(--color-gray-5);
}

.loan-review__credit-score-status {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.loan-review__credit-score-status--approved {
  background: #dcfce7;
  color: #166534;
}

.loan-review__credit-score-status--rejected {
  background: #fee2e2;
  color: #991b1b;
}

.loan-review__breakdown {
  margin-bottom: var(--space-md);
}

.loan-review__breakdown-title {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-5);
  margin: 0 0 var(--space-md);
}

.loan-review__factor {
  margin-bottom: var(--space-md);
}

.loan-review__factor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-small);
}

.loan-review__factor-score {
  font-weight: var(--font-weight-bold);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.loan-review__factor-bar {
  height: 8px;
  background: var(--color-gray-2);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.loan-review__factor-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.loan-review__financial {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
}

.loan-review__partner {
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}

.loan-review__field {
  margin-bottom: var(--space-md);
}

.loan-review__field-label {
  display: block;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-xs);
}

.loan-review__field-hint {
  display: block;
  font-size: 11px;
  color: var(--color-gray-4);
  margin-top: var(--space-xs);
}

.loan-review__input {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
}

.loan-review__input:focus {
  outline: none;
  border-color: var(--color-red);
}

.loan-review__textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  resize: vertical;
}

.loan-review__textarea:focus {
  outline: none;
  border-color: var(--color-red);
}

.loan-review__select {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  background: white;
}

.loan-review__actions {
  display: flex;
  gap: var(--space-sm);
}

.loan-review__btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.loan-review__btn--secondary {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.loan-review__btn--approve {
  background: var(--color-success);
  color: white;
}

.loan-review__btn--reject {
  background: var(--color-error);
  color: white;
}

.loan-review__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loan-review__modal-content p {
  margin: 0 0 var(--space-md);
  color: var(--color-gray-4);
}
</style>
