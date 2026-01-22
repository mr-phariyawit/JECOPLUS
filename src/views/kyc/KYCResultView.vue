<template>
  <div class="kyc-result screen screen--no-nav">
    <div class="kyc-result__content">
      <div class="kyc-result__icon" :class="{ 'success': isSuccess, 'pending': isPending }">
        <svg v-if="isSuccess" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="isPending" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h2 class="kyc-result__title">{{ title }}</h2>
      <p class="kyc-result__message">{{ message }}</p>

      <div v-if="isSuccess" class="kyc-result__details">
        <div class="kyc-result__detail-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>ยืนยันบัตรประชาชน</span>
        </div>
        <div class="kyc-result__detail-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>ยืนยันใบหน้า</span>
        </div>
        <div class="kyc-result__detail-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>ยืนยันตัวตนผ่าน NDID</span>
        </div>
      </div>
    </div>

    <div class="kyc-result__footer">
      <JButton variant="primary" @click="goHome">
        {{ isSuccess ? 'เสร็จสิ้น' : 'กลับหน้าหลัก' }}
      </JButton>

      <JButton v-if="!isSuccess && !isPending" variant="secondary" @click="retry">
        ลองใหม่
      </JButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import { useAuthStore } from '../../stores/auth';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const route = useRoute();
const kycStore = useKycStore();
const authStore = useAuthStore();

const status = computed(() => route.params.status || 'pending');

const isSuccess = computed(() => status.value === 'success' || status.value === 'approved');
const isPending = computed(() => status.value === 'pending' || status.value === 'processing');

const title = computed(() => {
  if (isSuccess.value) return 'ยืนยันตัวตนสำเร็จ';
  if (isPending.value) return 'รอการตรวจสอบ';
  return 'ไม่สามารถยืนยันตัวตนได้';
});

const message = computed(() => {
  if (isSuccess.value) return 'ขอบคุณที่ยืนยันตัวตน คุณสามารถใช้บริการทั้งหมดได้แล้ว';
  if (isPending.value) return 'ข้อมูลของคุณอยู่ระหว่างการตรวจสอบ จะแจ้งผลภายใน 24 ชั่วโมง';
  return 'กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า';
});

const goHome = async () => {
  kycStore.reset();
  await authStore.fetchProfile();
  router.replace('/dashboard');
};

const retry = () => {
  kycStore.reset();
  router.replace('/kyc');
};

onMounted(() => {
  // Refresh auth status
  authStore.fetchProfile();
});
</script>

<style scoped>
.kyc-result {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.kyc-result__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
}

.kyc-result__icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-xl);
  background: #fef2f2;
  color: #ef4444;
}

.kyc-result__icon.success {
  background: #f0fdf4;
  color: #22c55e;
}

.kyc-result__icon.pending {
  background: #fefce8;
  color: #eab308;
}

.kyc-result__title {
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.kyc-result__message {
  color: var(--color-gray-4);
  max-width: 300px;
  line-height: 1.5;
}

.kyc-result__details {
  margin-top: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.kyc-result__detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-success);
  font-size: var(--font-size-small);
}

.kyc-result__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
}
</style>
