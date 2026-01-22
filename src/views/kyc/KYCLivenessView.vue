<template>
  <div class="kyc-liveness screen screen--no-nav">
    <JHeader title="ตรวจสอบใบหน้า" />

    <div class="kyc-liveness__content">
      <div class="kyc-liveness__preview">
        <video
          ref="videoRef"
          class="kyc-liveness__video"
          autoplay
          playsinline
          muted
        />

        <div class="kyc-liveness__overlay">
          <svg viewBox="0 0 200 200" class="kyc-liveness__oval">
            <ellipse cx="100" cy="100" rx="70" ry="90" fill="none" stroke="white" stroke-width="3"/>
          </svg>
        </div>

        <!-- Direction indicators -->
        <div v-if="currentAction" class="kyc-liveness__action">
          <div class="kyc-liveness__action-icon" :class="currentAction">
            <svg v-if="currentAction === 'blink'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="currentAction === 'left'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="currentAction === 'right'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="kyc-liveness__action-text">{{ actionText }}</p>
        </div>
      </div>

      <!-- Progress -->
      <div class="kyc-liveness__progress">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="kyc-liveness__step"
          :class="{ 'completed': step.completed, 'active': index === currentStepIndex }"
        >
          <div class="kyc-liveness__step-icon">
            <svg v-if="step.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="kyc-liveness__step-label">{{ step.label }}</span>
        </div>
      </div>

      <p v-if="!isStarted" class="kyc-liveness__hint">
        กดปุ่มเริ่มต้น แล้วทำตามคำแนะนำ
      </p>

      <div v-if="error" class="kyc-liveness__error">
        {{ error }}
      </div>
    </div>

    <div class="kyc-liveness__footer">
      <template v-if="!isStarted">
        <JButton
          variant="primary"
          :disabled="!cameraReady"
          @click="startLiveness"
        >
          เริ่มต้น
        </JButton>
      </template>

      <template v-else-if="isCompleted">
        <JButton
          variant="primary"
          :loading="kycStore.isLoading"
          @click="proceed"
        >
          ถัดไป
        </JButton>
      </template>

      <template v-else>
        <JButton variant="secondary" @click="retry">
          เริ่มใหม่
        </JButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import { useCamera } from '../../composables/useCamera';
import JHeader from '../../components/layout/JHeader.vue';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const kycStore = useKycStore();

const { videoRef, isReady: cameraReady, startCamera, stopCamera, capturePhoto } = useCamera();

const isStarted = ref(false);
const isCompleted = ref(false);
const error = ref(null);
const currentStepIndex = ref(0);

const steps = ref([
  { id: 'blink', label: 'กะพริบตา', completed: false },
  { id: 'left', label: 'หันซ้าย', completed: false },
  { id: 'right', label: 'หันขวา', completed: false },
]);

const currentAction = computed(() => {
  if (!isStarted.value || isCompleted.value) return null;
  return steps.value[currentStepIndex.value]?.id || null;
});

const actionText = computed(() => {
  switch (currentAction.value) {
    case 'blink': return 'กรุณากะพริบตา 2-3 ครั้ง';
    case 'left': return 'กรุณาหันหน้าไปทางซ้าย';
    case 'right': return 'กรุณาหันหน้าไปทางขวา';
    default: return '';
  }
});

let actionTimer = null;

const startLiveness = () => {
  isStarted.value = true;
  error.value = null;
  runNextAction();
};

const runNextAction = () => {
  if (currentStepIndex.value >= steps.value.length) {
    completeLiveness();
    return;
  }

  // Simulate action detection (in real app, use ML model)
  // For demo, auto-complete each step after 2 seconds
  actionTimer = setTimeout(async () => {
    steps.value[currentStepIndex.value].completed = true;

    // Capture frame for verification
    try {
      const { blob } = await capturePhoto();
      // In real implementation, send to backend for liveness verification
    } catch (err) {
      console.error('Failed to capture frame:', err);
    }

    currentStepIndex.value++;
    runNextAction();
  }, 2000);
};

const completeLiveness = async () => {
  isCompleted.value = true;

  // Submit liveness result to backend
  try {
    const { blob } = await capturePhoto();
    const file = new File([blob], 'liveness.jpg', { type: 'image/jpeg' });
    const result = await kycStore.submitLiveness(file);

    if (!result.success) {
      error.value = result.error;
      isCompleted.value = false;
    }
  } catch (err) {
    error.value = 'ไม่สามารถตรวจสอบใบหน้าได้ กรุณาลองใหม่';
    isCompleted.value = false;
  }
};

const retry = () => {
  if (actionTimer) {
    clearTimeout(actionTimer);
  }
  isStarted.value = false;
  isCompleted.value = false;
  currentStepIndex.value = 0;
  steps.value.forEach(s => s.completed = false);
  error.value = null;
};

const proceed = () => {
  router.push('/kyc/ndid');
};

onMounted(async () => {
  if (!kycStore.sessionId) {
    router.replace('/kyc');
    return;
  }

  await startCamera('user');
});

onUnmounted(() => {
  if (actionTimer) {
    clearTimeout(actionTimer);
  }
  stopCamera();
});
</script>

<style scoped>
.kyc-liveness {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #000;
}

.kyc-liveness__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
}

.kyc-liveness__preview {
  position: relative;
  width: 280px;
  height: 350px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #1a1a1a;
}

.kyc-liveness__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.kyc-liveness__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.kyc-liveness__oval {
  width: 100%;
  height: 100%;
}

.kyc-liveness__action {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.kyc-liveness__action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.kyc-liveness__action-text {
  color: white;
  font-size: var(--font-size-small);
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.kyc-liveness__progress {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.kyc-liveness__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  opacity: 0.5;
}

.kyc-liveness__step.active {
  opacity: 1;
}

.kyc-liveness__step.completed {
  opacity: 1;
}

.kyc-liveness__step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-small);
}

.kyc-liveness__step.completed .kyc-liveness__step-icon {
  background: var(--color-success);
}

.kyc-liveness__step.active .kyc-liveness__step-icon {
  background: var(--color-primary);
}

.kyc-liveness__step-label {
  color: white;
  font-size: 12px;
}

.kyc-liveness__hint {
  color: white;
  text-align: center;
  margin-top: var(--space-md);
  font-size: var(--font-size-small);
}

.kyc-liveness__error {
  color: var(--color-error);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 0, 0, 0.1);
  border-radius: var(--radius-sm);
}

.kyc-liveness__footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #000;
}

.kyc-liveness__footer > * {
  flex: 1;
}
</style>
