<template>
  <div class="activity-logs">
    <div class="activity-logs__header">
      <h1 class="activity-logs__title">Activity Logs</h1>
    </div>

    <!-- Filters -->
    <div class="activity-logs__filters">
      <div class="activity-logs__filter">
        <label class="activity-logs__label">Admin</label>
        <select v-model="filters.adminId" class="activity-logs__select" @change="applyFilters">
          <option value="">All Admins</option>
          <option v-for="admin in adminList" :key="admin.id" :value="admin.id">
            {{ admin.email }}
          </option>
        </select>
      </div>

      <div class="activity-logs__filter">
        <label class="activity-logs__label">Action</label>
        <select v-model="filters.action" class="activity-logs__select" @change="applyFilters">
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="APPROVE_KYC">Approve KYC</option>
          <option value="REJECT_KYC">Reject KYC</option>
          <option value="SUSPEND_USER">Suspend User</option>
          <option value="UNSUSPEND_USER">Unsuspend User</option>
          <option value="BAN_USER">Ban User</option>
          <option value="UNBAN_USER">Unban User</option>
        </select>
      </div>

      <div class="activity-logs__filter">
        <label class="activity-logs__label">From</label>
        <input
          type="date"
          v-model="filters.startDate"
          class="activity-logs__input"
          @change="applyFilters"
        />
      </div>

      <div class="activity-logs__filter">
        <label class="activity-logs__label">To</label>
        <input
          type="date"
          v-model="filters.endDate"
          class="activity-logs__input"
          @change="applyFilters"
        />
      </div>

      <button class="activity-logs__btn activity-logs__btn--clear" @click="clearFilters">
        Clear
      </button>
    </div>

    <!-- Table -->
    <div class="activity-logs__table-wrapper">
      <AdminDataTable
        :columns="columns"
        :data="adminStore.activityLogs"
        :loading="adminStore.isLoading"
        :sortBy="sortBy"
        :sortDir="sortDir"
        @sort="handleSort"
      >
        <template #createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>

        <template #admin="{ row }">
          <span class="activity-logs__admin">
            {{ row.admin?.email || '-' }}
          </span>
        </template>

        <template #action="{ row }">
          <span class="activity-logs__action" :class="`activity-logs__action--${getActionVariant(row.action)}`">
            {{ formatAction(row.action) }}
          </span>
        </template>

        <template #target="{ row }">
          <div v-if="row.targetType" class="activity-logs__target">
            <span class="activity-logs__target-type">{{ row.targetType }}</span>
            <span v-if="row.targetId" class="activity-logs__target-id">#{{ row.targetId.slice(0, 8) }}</span>
          </div>
          <span v-else class="activity-logs__target-empty">-</span>
        </template>

        <template #details="{ row }">
          <span v-if="row.details" class="activity-logs__details">{{ row.details }}</span>
          <span v-else class="activity-logs__details-empty">-</span>
        </template>

        <template #ip="{ row }">
          <code class="activity-logs__ip">{{ row.ipAddress || '-' }}</code>
        </template>

        <template #empty>
          <div class="activity-logs__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <p>No activity logs found</p>
          </div>
        </template>
      </AdminDataTable>
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-if="adminStore.logsPagination.totalPages > 1"
      :currentPage="adminStore.logsPagination.page"
      :totalPages="adminStore.logsPagination.totalPages"
      :totalItems="adminStore.logsPagination.total"
      :pageSize="adminStore.logsPagination.limit"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin';
import AdminDataTable from '../../components/admin/AdminDataTable.vue';
import AdminPagination from '../../components/admin/AdminPagination.vue';

const adminStore = useAdminStore();

const columns = [
  { key: 'createdAt', label: 'Time', sortable: true, width: '160px' },
  { key: 'admin', label: 'Admin', sortable: false, width: '200px' },
  { key: 'action', label: 'Action', sortable: true, width: '140px' },
  { key: 'target', label: 'Target', sortable: false, width: '160px' },
  { key: 'details', label: 'Details', sortable: false },
  { key: 'ip', label: 'IP Address', sortable: false, width: '120px' },
];

const filters = reactive({
  adminId: '',
  action: '',
  startDate: '',
  endDate: '',
});

const sortBy = ref('createdAt');
const sortDir = ref('desc');

// Mock admin list (would come from API in real app)
const adminList = ref([
  { id: '1', email: 'admin@jecoplus.com' },
  { id: '2', email: 'superadmin@jecoplus.com' },
]);

const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAction = (action) => {
  const labels = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    APPROVE_KYC: 'Approve KYC',
    REJECT_KYC: 'Reject KYC',
    SUSPEND_USER: 'Suspend User',
    UNSUSPEND_USER: 'Unsuspend User',
    BAN_USER: 'Ban User',
    UNBAN_USER: 'Unban User',
    VIEW_USER: 'View User',
    VIEW_KYC: 'View KYC',
  };
  return labels[action] || action;
};

const getActionVariant = (action) => {
  if (action.includes('APPROVE') || action.includes('UNSUSPEND') || action.includes('UNBAN')) {
    return 'success';
  }
  if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('BAN')) {
    return 'danger';
  }
  if (action === 'LOGIN' || action === 'LOGOUT') {
    return 'info';
  }
  return 'default';
};

const fetchLogs = () => {
  adminStore.fetchActivityLogs({
    page: adminStore.logsPagination.page,
    limit: adminStore.logsPagination.limit,
    sortBy: sortBy.value,
    sortDir: sortDir.value,
    adminId: filters.adminId || undefined,
    action: filters.action || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });
};

const applyFilters = () => {
  adminStore.logsPagination.page = 1;
  fetchLogs();
};

const clearFilters = () => {
  filters.adminId = '';
  filters.action = '';
  filters.startDate = '';
  filters.endDate = '';
  applyFilters();
};

const handleSort = ({ key, direction }) => {
  sortBy.value = key;
  sortDir.value = direction;
  fetchLogs();
};

const handlePageChange = (page) => {
  adminStore.logsPagination.page = page;
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.activity-logs__header {
  margin-bottom: var(--space-lg);
}

.activity-logs__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.activity-logs__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  align-items: flex-end;
}

.activity-logs__filter {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.activity-logs__label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-5);
}

.activity-logs__select,
.activity-logs__input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  min-width: 160px;
}

.activity-logs__select:focus,
.activity-logs__input:focus {
  outline: none;
  border-color: var(--color-red);
}

.activity-logs__btn {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.activity-logs__btn--clear {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.activity-logs__btn--clear:hover {
  background: var(--color-gray-3);
}

.activity-logs__table-wrapper {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: var(--space-lg);
}

.activity-logs__admin {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
}

.activity-logs__action {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
}

.activity-logs__action--success {
  background: #dcfce7;
  color: #166534;
}

.activity-logs__action--danger {
  background: #fee2e2;
  color: #991b1b;
}

.activity-logs__action--info {
  background: #dbeafe;
  color: #1e40af;
}

.activity-logs__action--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.activity-logs__target {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-logs__target-type {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.activity-logs__target-id {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
  font-family: monospace;
}

.activity-logs__target-empty,
.activity-logs__details-empty {
  color: var(--color-gray-3);
}

.activity-logs__details {
  font-size: var(--font-size-small);
  color: var(--color-gray-5);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-logs__ip {
  font-size: var(--font-size-mini);
  background: var(--color-gray-1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.activity-logs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--color-gray-4);
}

.activity-logs__empty svg {
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.activity-logs__empty p {
  margin: 0;
}
</style>
