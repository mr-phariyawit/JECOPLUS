<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-layout__main">
      <AdminHeader />
      <main class="admin-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';
import AdminSidebar from './AdminSidebar.vue';
import AdminHeader from './AdminHeader.vue';

const router = useRouter();
const adminStore = useAdminStore();

onMounted(() => {
  // Check authentication
  adminStore.initSession();

  if (!adminStore.isAuthenticated) {
    router.replace('/admin/login');
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-gray-1);
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
}

.admin-layout__content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-layout__main {
    margin-left: 0;
  }
}
</style>
