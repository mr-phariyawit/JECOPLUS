<template>
  <aside class="admin-sidebar">
    <div class="admin-sidebar__logo">
      <span class="admin-sidebar__logo-text">JECO+</span>
      <span class="admin-sidebar__logo-badge">Admin</span>
    </div>

    <nav class="admin-sidebar__nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="admin-sidebar__item"
        :class="{ 'admin-sidebar__item--active': isActive(item.path) }"
      >
        <span class="admin-sidebar__icon" v-html="item.icon"></span>
        <span class="admin-sidebar__label">{{ item.label }}</span>
        <span v-if="item.badge" class="admin-sidebar__badge">{{ item.badge }}</span>
      </router-link>
    </nav>

    <div class="admin-sidebar__footer">
      <div class="admin-sidebar__version">v1.0.0</div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminStore } from '../../stores/admin';

const route = useRoute();
const adminStore = useAdminStore();

const pendingKycCount = computed(() => adminStore.kycStats?.pending || 0);
const pendingLoansCount = computed(() => adminStore.loansStats?.pending || 0);

const menuItems = computed(() => [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  {
    path: '/admin/kyc',
    label: 'KYC Queue',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    badge: pendingKycCount.value > 0 ? pendingKycCount.value : null,
  },
  {
    path: '/admin/loans',
    label: 'Loans',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    badge: pendingLoansCount.value > 0 ? pendingLoansCount.value : null,
  },
  {
    path: '/admin/logs',
    label: 'Activity Logs',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
  },
]);

const isActive = (path) => {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(path);
};
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: var(--color-black);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: var(--z-fixed);
}

.admin-sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-sidebar__logo-text {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.admin-sidebar__logo-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--color-red);
  color: white;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: var(--font-weight-bold);
}

.admin-sidebar__nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.admin-sidebar__item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.admin-sidebar__item--active {
  background: var(--color-red);
  color: white;
}

.admin-sidebar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.admin-sidebar__label {
  flex: 1;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.admin-sidebar__badge {
  font-size: 11px;
  padding: 2px 8px;
  background: white;
  color: var(--color-red);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
}

.admin-sidebar__footer {
  padding: var(--space-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-sidebar__version {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

/* Responsive - hide on mobile */
@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
}
</style>
