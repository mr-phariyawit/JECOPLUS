<template>
  <div class="admin-users">
    <!-- Filters -->
    <div class="admin-users__filters">
      <input
        v-model="search"
        type="text"
        class="admin-users__search"
        placeholder="Search by phone or name..."
        @input="handleSearch"
      />

      <select v-model="kycStatus" class="admin-users__select" @change="handleFilter">
        <option value="">All KYC Status</option>
        <option value="NONE">None</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="VERIFIED">Verified</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <select v-model="status" class="admin-users__select" @change="handleFilter">
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="SUSPENDED">Suspended</option>
        <option value="BANNED">Banned</option>
      </select>
    </div>

    <!-- Data Table -->
    <AdminDataTable
      :columns="columns"
      :data="adminStore.users"
      :loading="adminStore.isLoading"
      :row-clickable="true"
      empty-text="No users found"
      @row-click="viewUser"
      @sort="handleSort"
    >
      <template #phone="{ value }">
        <span class="admin-users__phone">{{ formatPhone(value) }}</span>
      </template>

      <template #firstName="{ row }">
        <span>{{ row.firstName || '-' }} {{ row.lastName || '' }}</span>
      </template>

      <template #kycStatus="{ value }">
        <span class="admin-users__badge" :class="`admin-users__badge--${getKycVariant(value)}`">
          {{ getKycLabel(value) }}
        </span>
      </template>

      <template #status="{ value }">
        <span class="admin-users__badge" :class="`admin-users__badge--${getStatusVariant(value)}`">
          {{ value }}
        </span>
      </template>

      <template #createdAt="{ value }">
        <span>{{ formatDate(value) }}</span>
      </template>
    </AdminDataTable>

    <!-- Pagination -->
    <AdminPagination
      :total="adminStore.usersPagination.total"
      :current-page="adminStore.usersPagination.page"
      :per-page="adminStore.usersPagination.limit"
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
const kycStatus = ref('');
const status = ref('');
let searchTimeout = null;

const columns = [
  { key: 'phone', label: 'Phone', sortable: true, width: '140px' },
  { key: 'firstName', label: 'Name', sortable: true },
  { key: 'kycStatus', label: 'KYC Status', sortable: true, width: '120px' },
  { key: 'status', label: 'Status', sortable: false, width: '100px' },
  { key: 'createdAt', label: 'Joined', sortable: true, width: '120px' },
];

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
};

const getKycLabel = (status) => {
  const labels = {
    NONE: 'None',
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
  };
  return labels[status] || status;
};

const getKycVariant = (status) => {
  const variants = {
    NONE: 'default',
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    VERIFIED: 'success',
    REJECTED: 'error',
  };
  return variants[status] || 'default';
};

const getStatusVariant = (status) => {
  const variants = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    BANNED: 'error',
  };
  return variants[status] || 'default';
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.setUsersFilter({ search: search.value });
  }, 300);
};

const handleFilter = () => {
  adminStore.setUsersFilter({
    kycStatus: kycStatus.value,
    status: status.value,
  });
};

const handleSort = ({ key, order }) => {
  adminStore.setUsersFilter({ sort: key, order });
};

const handlePageChange = (page) => {
  adminStore.fetchUsers(page);
};

const viewUser = (user) => {
  router.push(`/admin/users/${user.id}`);
};

onMounted(() => {
  adminStore.fetchUsers();
});
</script>

<style scoped>
.admin-users__filters {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.admin-users__search {
  flex: 1;
  min-width: 200px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
}

.admin-users__search:focus {
  outline: none;
  border-color: var(--color-red);
}

.admin-users__select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: white;
  font-size: var(--font-size-small);
  cursor: pointer;
}

.admin-users__phone {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.admin-users__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.admin-users__badge--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.admin-users__badge--success {
  background: #dcfce7;
  color: #166534;
}

.admin-users__badge--warning {
  background: #fef9c3;
  color: #854d0e;
}

.admin-users__badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.admin-users__badge--info {
  background: #dbeafe;
  color: #1e40af;
}
</style>
