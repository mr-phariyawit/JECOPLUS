<template>
  <div class="user-detail">
    <!-- Back Button -->
    <button class="user-detail__back" @click="goBack">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
      <span>Back to Users</span>
    </button>

    <div v-if="adminStore.isLoading" class="user-detail__loading">
      <div class="user-detail__spinner"></div>
      <span>Loading user...</span>
    </div>

    <template v-else-if="user">
      <div class="user-detail__grid">
        <!-- Profile Card -->
        <div class="user-detail__card">
          <h3 class="user-detail__card-title">Profile</h3>

          <div class="user-detail__info">
            <div class="user-detail__row">
              <span class="user-detail__label">Phone</span>
              <span class="user-detail__value">{{ formatPhone(user.phone) }}</span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Name</span>
              <span class="user-detail__value">{{ user.firstName || '-' }} {{ user.lastName || '' }}</span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Email</span>
              <span class="user-detail__value">{{ user.email || '-' }}</span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Citizen ID</span>
              <span class="user-detail__value">{{ user.citizenId || '-' }}</span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">KYC Status</span>
              <span class="user-detail__badge" :class="`user-detail__badge--${getKycVariant(user.kycStatus)}`">
                {{ user.kycStatus }}
              </span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Status</span>
              <span class="user-detail__badge" :class="`user-detail__badge--${getStatusVariant(user.status)}`">
                {{ user.status }}
              </span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Joined</span>
              <span class="user-detail__value">{{ formatDateTime(user.createdAt) }}</span>
            </div>
            <div class="user-detail__row">
              <span class="user-detail__label">Last Login</span>
              <span class="user-detail__value">{{ formatDateTime(user.lastLoginAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="user-detail__actions">
            <button
              v-if="user.status === 'ACTIVE'"
              class="user-detail__btn user-detail__btn--warning"
              @click="openStatusModal('SUSPENDED')"
            >
              Suspend User
            </button>
            <button
              v-if="user.status === 'SUSPENDED'"
              class="user-detail__btn user-detail__btn--success"
              @click="handleStatusChange('ACTIVE')"
            >
              Unsuspend User
            </button>
            <button
              v-if="user.status !== 'BANNED'"
              class="user-detail__btn user-detail__btn--error"
              @click="openStatusModal('BANNED')"
            >
              Ban User
            </button>
            <button
              v-if="user.status === 'BANNED'"
              class="user-detail__btn user-detail__btn--success"
              @click="handleStatusChange('ACTIVE')"
            >
              Unban User
            </button>
          </div>
        </div>

        <!-- KYC History Card -->
        <div class="user-detail__card">
          <h3 class="user-detail__card-title">KYC History</h3>

          <div v-if="kycHistory.length === 0" class="user-detail__empty">
            No KYC submissions yet
          </div>

          <div v-else class="user-detail__history">
            <div
              v-for="session in kycHistory"
              :key="session.id"
              class="user-detail__history-item"
            >
              <div class="user-detail__history-icon" :class="`user-detail__history-icon--${getKycVariant(session.status)}`">
                <svg v-if="session.status === 'APPROVED'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <svg v-else-if="session.status === 'REJECTED'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div class="user-detail__history-info">
                <span class="user-detail__history-status">{{ session.status }}</span>
                <span class="user-detail__history-date">{{ formatDateTime(session.createdAt) }}</span>
                <span v-if="session.rejectionReason" class="user-detail__history-reason">
                  Reason: {{ session.rejectionReason }}
                </span>
              </div>
              <router-link
                v-if="session.status === 'PENDING' || session.status === 'PROCESSING'"
                :to="`/admin/kyc/${session.id}`"
                class="user-detail__history-link"
              >
                Review
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Status Change Modal -->
    <AdminModal
      v-model="showStatusModal"
      :title="`${pendingStatus === 'SUSPENDED' ? 'Suspend' : 'Ban'} User`"
      size="sm"
    >
      <div class="user-detail__modal-content">
        <p>Please provide a reason for {{ pendingStatus === 'SUSPENDED' ? 'suspending' : 'banning' }} this user.</p>
        <textarea
          v-model="statusReason"
          class="user-detail__textarea"
          placeholder="Enter reason..."
          rows="4"
        ></textarea>
      </div>

      <template #footer>
        <button class="user-detail__btn user-detail__btn--secondary" @click="showStatusModal = false">
          Cancel
        </button>
        <button
          class="user-detail__btn"
          :class="pendingStatus === 'SUSPENDED' ? 'user-detail__btn--warning' : 'user-detail__btn--error'"
          :disabled="!statusReason.trim()"
          @click="confirmStatusChange"
        >
          Confirm
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

const showStatusModal = ref(false);
const pendingStatus = ref('');
const statusReason = ref('');

const user = computed(() => adminStore.selectedUser?.user);
const kycHistory = computed(() => adminStore.selectedUser?.kycHistory || []);

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

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

const getKycVariant = (status) => {
  const variants = {
    NONE: 'default',
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    PROCESSING: 'info',
    VERIFIED: 'success',
    APPROVED: 'success',
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

const goBack = () => {
  router.push('/admin/users');
};

const openStatusModal = (status) => {
  pendingStatus.value = status;
  statusReason.value = '';
  showStatusModal.value = true;
};

const confirmStatusChange = async () => {
  await handleStatusChange(pendingStatus.value, statusReason.value);
  showStatusModal.value = false;
};

const handleStatusChange = async (status, reason = null) => {
  const result = await adminStore.updateUserStatus(route.params.userId, status, reason);

  if (!result.success) {
    alert(result.error);
  }
};

onMounted(() => {
  adminStore.fetchUserDetail(route.params.userId);
});
</script>

<style scoped>
.user-detail__back {
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

.user-detail__back:hover {
  color: var(--color-red);
}

.user-detail__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
  color: var(--color-gray-4);
}

.user-detail__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-2);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.user-detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.user-detail__card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.user-detail__card-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-2);
}

.user-detail__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.user-detail__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.user-detail__label {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

.user-detail__value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.user-detail__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.user-detail__badge--default {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.user-detail__badge--success {
  background: #dcfce7;
  color: #166534;
}

.user-detail__badge--warning {
  background: #fef9c3;
  color: #854d0e;
}

.user-detail__badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.user-detail__badge--info {
  background: #dbeafe;
  color: #1e40af;
}

.user-detail__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-gray-2);
}

.user-detail__btn {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-detail__btn--secondary {
  background: var(--color-gray-2);
  color: var(--color-gray-5);
}

.user-detail__btn--success {
  background: var(--color-success);
  color: white;
}

.user-detail__btn--warning {
  background: var(--color-warning);
  color: white;
}

.user-detail__btn--error {
  background: var(--color-error);
  color: white;
}

.user-detail__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-detail__empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-gray-4);
}

.user-detail__history {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.user-detail__history-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
}

.user-detail__history-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-detail__history-icon--success {
  background: #dcfce7;
  color: #166534;
}

.user-detail__history-icon--warning {
  background: #fef9c3;
  color: #854d0e;
}

.user-detail__history-icon--error {
  background: #fee2e2;
  color: #991b1b;
}

.user-detail__history-icon--info {
  background: #dbeafe;
  color: #1e40af;
}

.user-detail__history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-detail__history-status {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
}

.user-detail__history-date {
  font-size: var(--font-size-mini);
  color: var(--color-gray-4);
}

.user-detail__history-reason {
  font-size: var(--font-size-mini);
  color: var(--color-error);
  margin-top: var(--space-xs);
}

.user-detail__history-link {
  font-size: var(--font-size-small);
  color: var(--color-red);
  text-decoration: none;
}

.user-detail__modal-content p {
  margin: 0 0 var(--space-md);
  color: var(--color-gray-4);
}

.user-detail__textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  resize: vertical;
}

.user-detail__textarea:focus {
  outline: none;
  border-color: var(--color-red);
}
</style>
