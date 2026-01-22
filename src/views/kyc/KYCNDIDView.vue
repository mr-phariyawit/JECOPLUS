<template>
  <div class="kyc-ndid screen screen--no-nav">
    <JHeader title="ยืนยันตัวตน NDID" />

    <div class="kyc-ndid__content">
      <!-- Step 1: Select Bank -->
      <template v-if="!selectedBank">
        <div class="kyc-ndid__intro">
          <div class="kyc-ndid__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="kyc-ndid__title">เลือกธนาคารยืนยันตัวตน</h2>
          <p class="kyc-ndid__subtitle">เลือกธนาคารที่คุณมีบัญชี เพื่อยืนยันตัวตนผ่าน NDID</p>
        </div>

        <div class="kyc-ndid__banks">
          <button
            v-for="bank in banks"
            :key="bank.id"
            class="kyc-ndid__bank"
            @click="selectBank(bank)"
          >
            <div class="kyc-ndid__bank-logo" :style="{ backgroundColor: bank.color }">
              <span>{{ bank.shortName }}</span>
            </div>
            <div class="kyc-ndid__bank-info">
              <span class="kyc-ndid__bank-name">{{ bank.name }}</span>
              <span class="kyc-ndid__bank-desc">{{ bank.desc }}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- Step 2: Waiting for NDID -->
      <template v-else-if="!ndidStatus">
        <div class="kyc-ndid__waiting">
          <div class="kyc-ndid__bank-selected">
            <div class="kyc-ndid__bank-logo" :style="{ backgroundColor: selectedBank.color }">
              <span>{{ selectedBank.shortName }}</span>
            </div>
            <span>{{ selectedBank.name }}</span>
          </div>

          <div class="kyc-ndid__loading">
            <div class="kyc-ndid__spinner"></div>
          </div>

          <h3 class="kyc-ndid__waiting-title">กรุณายืนยันตัวตน</h3>
          <p class="kyc-ndid__waiting-desc">
            เปิดแอปธนาคาร {{ selectedBank.name }}<br/>
            และยืนยันการขอข้อมูลจาก JECOPLUS
          </p>

          <div class="kyc-ndid__timer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>รอการยืนยัน {{ formatTime(countdown) }}</span>
          </div>
        </div>
      </template>

      <!-- Step 3: Result -->
      <template v-else>
        <div class="kyc-ndid__result">
          <div class="kyc-ndid__result-icon" :class="{ success: ndidStatus === 'approved' }">
            <svg v-if="ndidStatus === 'approved'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="kyc-ndid__result-title">
            {{ ndidStatus === 'approved' ? 'ยืนยันตัวตนสำเร็จ' : 'ไม่สามารถยืนยันตัวตนได้' }}
          </h3>
          <p class="kyc-ndid__result-desc">
            {{ ndidStatus === 'approved'
              ? 'ข้อมูลของคุณได้รับการยืนยันจากธนาคารเรียบร้อยแล้ว'
              : 'กรุณาลองใหม่อีกครั้ง หรือเลือกธนาคารอื่น'
            }}
          </p>
        </div>
      </template>

      <div v-if="error" class="kyc-ndid__error">
        {{ error }}
      </div>
    </div>

    <div class="kyc-ndid__footer">
      <template v-if="!selectedBank">
        <JButton variant="secondary" @click="goBack">
          ย้อนกลับ
        </JButton>
      </template>

      <template v-else-if="!ndidStatus">
        <JButton variant="secondary" @click="cancelNdid">
          ยกเลิก
        </JButton>
      </template>

      <template v-else>
        <JButton
          v-if="ndidStatus !== 'approved'"
          variant="secondary"
          @click="retry"
        >
          เลือกธนาคารอื่น
        </JButton>
        <JButton
          variant="primary"
          :loading="kycStore.isLoading"
          @click="finish"
        >
          {{ ndidStatus === 'approved' ? 'ถัดไป' : 'ลองใหม่' }}
        </JButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import JHeader from '../../components/layout/JHeader.vue';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const kycStore = useKycStore();

const selectedBank = ref(null);
const ndidStatus = ref(null);
const countdown = ref(300); // 5 minutes
const error = ref(null);

let countdownTimer = null;
let pollingTimer = null;

const banks = [
  { id: 'kbank', name: 'ธนาคารกสิกรไทย', shortName: 'KBank', color: '#138F2D', desc: 'K PLUS' },
  { id: 'scb', name: 'ธนาคารไทยพาณิชย์', shortName: 'SCB', color: '#4E2A84', desc: 'SCB EASY' },
  { id: 'bbl', name: 'ธนาคารกรุงเทพ', shortName: 'BBL', color: '#1E4598', desc: 'Bualuang mBanking' },
  { id: 'ktb', name: 'ธนาคารกรุงไทย', shortName: 'KTB', color: '#1BA5E0', desc: 'Krungthai NEXT' },
  { id: 'bay', name: 'ธนาคารกรุงศรี', shortName: 'BAY', color: '#FEC601', desc: 'KMA' },
  { id: 'tmb', name: 'ธนาคารทหารไทยธนชาต', shortName: 'TTB', color: '#0066B3', desc: 'ttb touch' },
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const selectBank = async (bank) => {
  selectedBank.value = bank;
  error.value = null;

  // Get citizen ID from OCR result
  const citizenId = kycStore.ocrResult?.citizenId;
  if (!citizenId) {
    error.value = 'ไม่พบข้อมูลเลขบัตรประชาชน กรุณาถ่ายบัตรใหม่';
    selectedBank.value = null;
    return;
  }

  // Initiate NDID request
  try {
    const result = await kycStore.initiateNdid(citizenId, bank.id);

    if (result.success) {
      startCountdown();
      startPolling();
    } else {
      error.value = result.error;
      selectedBank.value = null;
    }
  } catch (err) {
    error.value = 'ไม่สามารถเชื่อมต่อกับ NDID ได้';
    selectedBank.value = null;
  }
};

const startCountdown = () => {
  countdown.value = 300;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopTimers();
      ndidStatus.value = 'timeout';
      error.value = 'หมดเวลารอการยืนยัน กรุณาลองใหม่';
    }
  }, 1000);
};

const startPolling = () => {
  pollingTimer = setInterval(async () => {
    try {
      const result = await kycStore.checkNdidStatus();

      if (result.status === 'approved' || result.status === 'rejected') {
        stopTimers();
        ndidStatus.value = result.status;
      }
    } catch (err) {
      console.error('NDID polling error:', err);
    }
  }, 3000);
};

const stopTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

const cancelNdid = () => {
  stopTimers();
  selectedBank.value = null;
  ndidStatus.value = null;
};

const retry = () => {
  selectedBank.value = null;
  ndidStatus.value = null;
  error.value = null;
};

const goBack = () => {
  router.back();
};

const finish = async () => {
  if (ndidStatus.value === 'approved') {
    // Submit KYC for final review
    const result = await kycStore.submitKyc();

    if (result.success) {
      router.push(`/kyc/result/${result.status || 'success'}`);
    } else {
      error.value = result.error;
    }
  } else {
    // Retry with same bank
    ndidStatus.value = null;
    selectBank(selectedBank.value);
  }
};

onMounted(() => {
  if (!kycStore.sessionId) {
    router.replace('/kyc');
    return;
  }
});

onUnmounted(() => {
  stopTimers();
});
</script>

<style scoped>
.kyc-ndid {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
}

.kyc-ndid__content {
  flex: 1;
  padding: var(--space-md);
}

.kyc-ndid__intro {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.kyc-ndid__icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  color: var(--color-primary);
}

.kyc-ndid__title {
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.kyc-ndid__subtitle {
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
}

.kyc-ndid__banks {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.kyc-ndid__bank {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.kyc-ndid__bank:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.kyc-ndid__bank-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: 12px;
}

.kyc-ndid__bank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.kyc-ndid__bank-name {
  font-weight: var(--font-weight-medium);
}

.kyc-ndid__bank-desc {
  font-size: var(--font-size-small);
  color: var(--color-gray-4);
}

/* Waiting state */
.kyc-ndid__waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-xl) 0;
}

.kyc-ndid__bank-selected {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-xl);
}

.kyc-ndid__bank-selected .kyc-ndid__bank-logo {
  width: 32px;
  height: 32px;
  font-size: 10px;
}

.kyc-ndid__loading {
  margin-bottom: var(--space-xl);
}

.kyc-ndid__spinner {
  width: 64px;
  height: 64px;
  border: 4px solid var(--color-gray-2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.kyc-ndid__waiting-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.kyc-ndid__waiting-desc {
  color: var(--color-gray-4);
  line-height: 1.5;
  margin-bottom: var(--space-lg);
}

.kyc-ndid__timer {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
}

/* Result state */
.kyc-ndid__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-xl) 0;
}

.kyc-ndid__result-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.kyc-ndid__result-icon.success {
  background: #f0fdf4;
  color: #22c55e;
}

.kyc-ndid__result-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.kyc-ndid__result-desc {
  color: var(--color-gray-4);
}

.kyc-ndid__error {
  color: var(--color-error);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 0, 0, 0.1);
  border-radius: var(--radius-sm);
}

.kyc-ndid__footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
}

.kyc-ndid__footer > * {
  flex: 1;
}
</style>
