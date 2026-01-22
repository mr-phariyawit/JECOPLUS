<template>
  <div class="kyc-list">
    <!-- Stats -->
    <div class="kyc-list__stats">
      <div class="kyc-list__stat">
        <span class="kyc-list__stat-value">{{ adminStore.kycStats.pending || 0 }}</span>
        <span class="kyc-list__stat-label">Pending</span>
      </div>
      <div class="kyc-list__stat kyc-list__stat--success">
        <span class="kyc-list__stat-value">{{ adminStore.kycStats.verifiedToday || 0 }}</span>
        <span class="kyc-list__stat-label">Verified Today</span>
      </div>
      <div class="kyc-list__stat kyc-list__stat--error">
        <span class="kyc-list__stat-value">{{ adminStore.kycStats.rejectedToday || 0 }}</span>
        <span class="kyc-list__stat-label">Rejected Today</span>
      </div>
    </div>

    <!-- Data Table -->
    <AdminDataTable
      :columns="columns"
      :data="adminStore.kycQueue"
      :loading="adminStore.isLoading"
      empty-text="No pending KYC requests"
    >
      <template #user="{ row }">
        <div class="kyc-list__user">
          <span class="kyc-list__phone">{{ formatPhone(row.user?.phone) }}</span>
          <span class="kyc-list__name">{{ row.user?.firstName || '' }} {{ row.user?.lastName || '' }}</span>
        </div>
      </template>

      <template #faceMatchScore="{ value }">
        <span
          v-if="value !== null"
          class="kyc-list__score"
          :class="{ 'kyc-list__score--low': value < 70 }"
        >
          {{ value.toFixed(1) }}%
        </span>
        <span v-else class="kyc-list__score--na">N/A</span>
      </template>

      <template #status="{ value }">
        <span class="kyc-list__badge" :class="`kyc-list__badge--${getStatusVariant(value)}`">
          {{ value }}
        </span>
      </template>

      <template #createdAt="{ value }">
        <span>{{ formatRelativeTime(value) }}</span>
      </template>

      <template #actions="{ row }">
        <router-link :to="`/admin/kyc/${row.id}`" class="kyc-list__action">
          Review
        </router-link>
      </template>
    </AdminDataTable>

    <!-- Pagination -->
    <AdminPagination
      :total="adminStore.kycPagination.total"
      :current-page="adminStore.kycPagination.page"
      :per-page="adminStore.kycPagination.limit"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin';
import AdminDataTable from '../../components/admin/AdminDataTable.vue';
import AdminPagination from '../../components/admin/AdminPagination.vue';

const adminStore = useAdminStore();

const columns = [
  { key: 'user', label: 'User', width: '200px' },
  { key: 'faceMatchScore', label: 'Face Score', width: '100px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'createdAt', label: 'Submitted', width: '120px' },
  { key: 'actions', label: '', width: '80px' },
];

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

const formatRelativeTime = (date) => {
  if (!date) return '-';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return then.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });
};

const getStatusVariant = (status) => {
  const variants = {
    PENDING: 'warning',
    PROCESSING: 'info',
  };
  return variants[status] || 'default';
};

const handlePageChange = (page) => {
  adminStore.fetchKycQueue(page);
};

onMounted(() => {
  adminStore.fetchKycQueue();
});
</script>

<style scoped>
.kyc-list__stats {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.kyc-list__stat {
  flex: 1;
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.kyc-list__stat-value {
  display: block;
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning);
}

.kyc-list__stat--success .kyc-list__stat-value {
  color: var(--color-success);
}

.kyc-list__stat--error .kyc-list__stat-value {
  color: var(--color-error);
}

.kyc-list__stat-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.kyc-list__user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kyc-list__phone {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--font-size-small);
}

.kyc-list__name {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.kyc-list__score {
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.kyc-list__score--low {
  color: var(--color-error);
}

.kyc-list__score--na {
  color: var(--color-gray-4);
}

.kyc-list__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.kyc-list__badge--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.kyc-list__badge--warning {
  background: #fef9c3;
  color: #854d0e;
}

.kyc-list__badge--info {
  background: #dbeafe;
  color: #1e40af;
}

.kyc-list__action {
  color: var(--color-red);
  text-decoration: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.kyc-list__action:hover {
  text-decoration: underline;
}
</style>
