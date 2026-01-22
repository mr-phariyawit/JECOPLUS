<template>
  <div class="admin-dashboard">
    <!-- Period Selector -->
    <div class="admin-dashboard__header">
      <select v-model="period" class="admin-dashboard__period" @change="fetchStats">
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
    </div>

    <!-- Stats Cards -->
    <div class="admin-dashboard__stats">
      <AdminStatsCard
        :value="stats.users?.total || 0"
        label="Total Users"
        variant="info"
        :icon="icons.users"
      />
      <AdminStatsCard
        :value="stats.users?.newToday || 0"
        label="New Today"
        variant="success"
        :icon="icons.newUsers"
      />
      <AdminStatsCard
        :value="stats.kyc?.pending || 0"
        label="Pending KYC"
        variant="warning"
        :icon="icons.pending"
      />
      <AdminStatsCard
        :value="stats.kyc?.verifiedToday || 0"
        label="Verified Today"
        variant="success"
        :icon="icons.verified"
      />
    </div>

    <!-- Quick Actions -->
    <div class="admin-dashboard__section">
      <h2 class="admin-dashboard__section-title">Quick Actions</h2>
      <div class="admin-dashboard__actions">
        <router-link to="/admin/kyc" class="admin-dashboard__action">
          <div class="admin-dashboard__action-icon" v-html="icons.kyc"></div>
          <div class="admin-dashboard__action-info">
            <span class="admin-dashboard__action-label">Review KYC Queue</span>
            <span class="admin-dashboard__action-count">{{ stats.kyc?.pending || 0 }} pending</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </router-link>

        <router-link to="/admin/users" class="admin-dashboard__action">
          <div class="admin-dashboard__action-icon" v-html="icons.users"></div>
          <div class="admin-dashboard__action-info">
            <span class="admin-dashboard__action-label">Manage Users</span>
            <span class="admin-dashboard__action-count">{{ stats.users?.total || 0 }} total</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </router-link>

        <router-link to="/admin/logs" class="admin-dashboard__action">
          <div class="admin-dashboard__action-icon" v-html="icons.logs"></div>
          <div class="admin-dashboard__action-info">
            <span class="admin-dashboard__action-label">View Activity Logs</span>
            <span class="admin-dashboard__action-count">Recent activities</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Activity Summary -->
    <div class="admin-dashboard__section">
      <h2 class="admin-dashboard__section-title">Activity Summary</h2>
      <div class="admin-dashboard__summary">
        <div class="admin-dashboard__summary-item">
          <span class="admin-dashboard__summary-label">Daily Logins</span>
          <span class="admin-dashboard__summary-value">{{ stats.activity?.dailyLogins || 0 }}</span>
        </div>
        <div class="admin-dashboard__summary-item">
          <span class="admin-dashboard__summary-label">Active Users (7d)</span>
          <span class="admin-dashboard__summary-value">{{ stats.activity?.activeUsers7d || 0 }}</span>
        </div>
        <div class="admin-dashboard__summary-item">
          <span class="admin-dashboard__summary-label">KYC Rejected Today</span>
          <span class="admin-dashboard__summary-value">{{ stats.kyc?.rejectedToday || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin';
import AdminStatsCard from '../../components/admin/AdminStatsCard.vue';

const adminStore = useAdminStore();

const period = ref('7d');

const stats = computed(() => adminStore.dashboardStats || {});

const icons = {
  users: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  newUsers: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  pending: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
  verified: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  kyc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  logs: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
};

const fetchStats = async () => {
  await adminStore.fetchDashboardStats(period.value);
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.admin-dashboard__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-lg);
}

.admin-dashboard__period {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  background: white;
  font-size: var(--font-size-small);
  cursor: pointer;
}

.admin-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.admin-dashboard__section {
  margin-bottom: var(--space-xl);
}

.admin-dashboard__section-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md);
}

.admin-dashboard__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .admin-dashboard__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-dashboard__actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-dashboard__stats {
    grid-template-columns: 1fr;
  }

  .admin-dashboard__actions {
    grid-template-columns: 1fr;
  }
}

.admin-dashboard__action {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.admin-dashboard__action:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.admin-dashboard__action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-gray-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-red);
}

.admin-dashboard__action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-dashboard__action-label {
  font-weight: var(--font-weight-medium);
}

.admin-dashboard__action-count {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.admin-dashboard__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .admin-dashboard__summary {
    grid-template-columns: 1fr;
  }
}

.admin-dashboard__summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.admin-dashboard__summary-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.admin-dashboard__summary-value {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
}
</style>
