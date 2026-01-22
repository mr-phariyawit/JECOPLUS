<template>
  <div class="admin-loans">
    <!-- Stats Cards -->
    <div class="admin-loans__stats">
      <div class="admin-loans__stat-card admin-loans__stat-card--pending">
        <div class="admin-loans__stat-label">Pending Review</div>
        <div class="admin-loans__stat-value">{{ adminStore.loansStats.pending }}</div>
      </div>
      <div class="admin-loans__stat-card admin-loans__stat-card--approved">
        <div class="admin-loans__stat-label">Approved Today</div>
        <div class="admin-loans__stat-value">{{ adminStore.loansStats.approvedToday }}</div>
      </div>
      <div class="admin-loans__stat-card admin-loans__stat-card--rejected">
        <div class="admin-loans__stat-label">Rejected Today</div>
        <div class="admin-loans__stat-value">{{ adminStore.loansStats.rejectedToday }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-loans__filters">
      <input
        v-model="search"
        type="text"
        class="admin-loans__search"
        placeholder="Search by phone or name..."
        @input="handleSearch"
      />

      <select v-model="statusFilter" class="admin-loans__select" @change="handleFilter">
        <option value="">All Status</option>
        <option value="PENDING_PARTNER">Pending Partner</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="SUBMISSION_FAILED">Submission Failed</option>
      </select>
    </div>

    <!-- Data Table -->
    <AdminDataTable
      :columns="columns"
      :data="adminStore.loans"
      :loading="adminStore.isLoading"
      :row-clickable="true"
      empty-text="No loan applications found"
      @row-click="viewLoan"
      @sort="handleSort"
    >
      <template #phone="{ row }">
        <span class="admin-loans__phone">{{ formatPhone(row.user.phone) }}</span>
      </template>

      <template #name="{ row }">
        <span>{{ row.user.firstName || '-' }} {{ row.user.lastName || '' }}</span>
      </template>

      <template #amountRequested="{ value }">
        <span class="admin-loans__amount">{{ formatCurrency(value) }}</span>
      </template>

      <template #termMonths="{ value }">
        <span>{{ value }} months</span>
      </template>

      <template #creditScore="{ value }">
        <span class="admin-loans__score" :class="`admin-loans__score--${getScoreColor(value)}`">
          {{ value || '-' }}
        </span>
      </template>

      <template #status="{ value }">
        <span class="admin-loans__badge" :class="`admin-loans__badge--${getStatusVariant(value)}`">
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <template #submittedAt="{ value }">
        <span>{{ formatDate(value) }}</span>
      </template>
    </AdminDataTable>

    <!-- Pagination -->
    <AdminPagination
      :total="adminStore.loansPagination.total"
      :current-page="adminStore.loansPagination.page"
      :per-page="adminStore.loansPagination.limit"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';
import AdminDataTable from '../../components/admin/AdminDataTable.vue';
import AdminPagination from '../../components/admin/AdminPagination.vue';

const router = useRouter();
const adminStore = useAdminStore();

const search = ref('');
const statusFilter = ref('');
let searchTimeout = null;

const columns = [
  { key: 'phone', label: 'Phone', sortable: false, width: '140px' },
  { key: 'name', label: 'Name', sortable: false },
  { key: 'amountRequested', label: 'Amount', sortable: true, width: '120px' },
  { key: 'termMonths', label: 'Term', sortable: false, width: '100px' },
  { key: 'creditScore', label: 'Credit Score', sortable: false, width: '120px' },
  { key: 'status', label: 'Status', sortable: true, width: '140px' },
  { key: 'submittedAt', label: 'Submitted', sortable: true, width: '120px' },
];

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
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  };
  return variants[status] || 'default';
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.setLoansFilter({ search: search.value });
  }, 300);
};

const handleFilter = () => {
  adminStore.setLoansFilter({
    status: statusFilter.value,
  });
};

const handleSort = ({ key, order }) => {
  adminStore.setLoansFilter({ sort: key, order });
};

const handlePageChange = (page) => {
  adminStore.fetchLoans(page);
};

const viewLoan = (loan) => {
  router.push(`/admin/loans/${loan.id}`);
};

onMounted(async () => {
  console.log('[AdminLoansView] Component mounted');
  console.log('[AdminLoansView] isLoading:', adminStore.isLoading);
  console.log('[AdminLoansView] loans:', adminStore.loans);
  console.log('[AdminLoansView] error:', adminStore.error);

  await adminStore.fetchLoans();

  console.log('[AdminLoansView] After fetchLoans:');
  console.log('[AdminLoansView] loans:', adminStore.loans);
  console.log('[AdminLoansView] loans length:', adminStore.loans?.length);
  console.log('[AdminLoansView] error:', adminStore.error);
});
</script>

<style scoped>
.admin-loans__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.admin-loans__stat-card {
  background: white;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.admin-loans__stat-card--pending {
  border-left: 3px solid #eab308;
}

.admin-loans__stat-card--approved {
  border-left: 3px solid #22c55e;
}

.admin-loans__stat-card--rejected {
  border-left: 3px solid #ef4444;
}

.admin-loans__stat-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
  font-weight: var(--font-weight-medium);
}

.admin-loans__stat-value {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-7);
}

.admin-loans__filters {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.admin-loans__search {
  flex: 1;
  min-width: 200px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
}

.admin-loans__search:focus {
  outline: none;
  border-color: var(--color-red);
}

.admin-loans__select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: white;
  font-size: var(--font-size-small);
  cursor: pointer;
}

.admin-loans__phone {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.admin-loans__amount {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-7);
}

.admin-loans__score {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.admin-loans__score--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.admin-loans__score--success {
  background: #dcfce7;
  color: #166534;
}

.admin-loans__score--warning {
  background: #fef9c3;
  color: #854d0e;
}

.admin-loans__score--error {
  background: #fee2e2;
  color: #991b1b;
}

.admin-loans__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.admin-loans__badge--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.admin-loans__badge--success {
  background: #dcfce7;
  color: #166534;
}

.admin-loans__badge--warning {
  background: #fef9c3;
  color: #854d0e;
}

.admin-loans__badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.admin-loans__badge--info {
  background: #dbeafe;
  color: #1e40af;
}
</style>
