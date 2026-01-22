<template>
  <header class="admin-header">
    <div class="admin-header__left">
      <h1 class="admin-header__title">{{ pageTitle }}</h1>
    </div>

    <div class="admin-header__right">
      <div class="admin-header__user">
        <div class="admin-header__avatar">
          {{ adminInitials }}
        </div>
        <div class="admin-header__info">
          <span class="admin-header__name">{{ adminStore.adminName }}</span>
          <span class="admin-header__role">{{ adminStore.adminRole }}</span>
        </div>
      </div>

      <button class="admin-header__logout" @click="handleLogout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const pageTitle = computed(() => {
  const titles = {
    '/admin': 'Dashboard',
    '/admin/users': 'User Management',
    '/admin/kyc': 'KYC Queue',
    '/admin/logs': 'Activity Logs',
  };

  // Check for exact match first
  if (titles[route.path]) {
    return titles[route.path];
  }

  // Check for partial match
  if (route.path.startsWith('/admin/users/')) {
    return 'User Detail';
  }
  if (route.path.startsWith('/admin/kyc/')) {
    return 'KYC Review';
  }

  return 'Admin';
});

const adminInitials = computed(() => {
  const admin = adminStore.admin;
  if (!admin) return 'A';

  const first = admin.firstName?.[0] || '';
  const last = admin.lastName?.[0] || '';

  return (first + last).toUpperCase() || admin.email?.[0]?.toUpperCase() || 'A';
});

const handleLogout = async () => {
  await adminStore.logout();
  router.replace('/admin/login');
};
</script>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: white;
  border-bottom: 1px solid var(--color-gray-2);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.admin-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.admin-header__title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.admin-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.admin-header__user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.admin-header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-red);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-small);
}

.admin-header__info {
  display: flex;
  flex-direction: column;
}

.admin-header__name {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.admin-header__role {
  font-size: 11px;
  color: var(--color-gray-4);
  text-transform: uppercase;
}

.admin-header__logout {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-gray-4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.admin-header__logout:hover {
  background: var(--color-gray-1);
  color: var(--color-error);
}
</style>
