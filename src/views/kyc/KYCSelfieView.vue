<template>
  <div class="kyc-selfie screen screen--no-nav">
    <JHeader title="ถ่าย Selfie" />

    <div class="kyc-selfie__content">
      <div class="kyc-selfie__preview">
        <video
          ref="videoRef"
          class="kyc-selfie__video"
          :class="{ 'kyc-selfie__video--hidden': capturedImage }"
          autoplay
          playsinline
          muted
        />

        <img
          v-if="capturedImage"
          :src="capturedImage"
          class="kyc-selfie__captured"
          alt="Captured Selfie"
        />

        <div v-if="!capturedImage" class="kyc-selfie__frame">
          <svg viewBox="0 0 200 200" class="kyc-selfie__oval">
            <ellipse cx="100" cy="100" rx="70" ry="90" fill="none" stroke="white" stroke-width="3"/>
          </svg>
        </div>
      </div>

      <p v-if="!capturedImage" class="kyc-selfie__hint">
        วางใบหน้าของคุณให้อยู่ในวงรี
      </p>

      <div v-if="error" class="kyc-selfie__error">
        {{ error }}
      </div>

      <!-- Face Match Result -->
      <div v-if="capturedImage && kycStore.faceMatchResult" class="kyc-selfie__result">
        <div class="kyc-selfie__result-icon" :class="{ 'success': kycStore.faceMatchResult.passed }">
          <svg v-if="kycStore.faceMatchResult.passed" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p>{{ kycStore.faceMatchResult.passed ? 'ใบหน้าตรงกับบัตรประชาชน' : 'ใบหน้าไม่ตรงกับบัตรประชาชน' }}</p>
      </div>
    </div>

    <div class="kyc-selfie__footer">
      <template v-if="!capturedImage">
        <JButton
          variant="primary"
          :disabled="!cameraReady"
          @click="capture"
        >
          ถ่ายภาพ
        </JButton>
      </template>

      <template v-else>
        <JButton variant="secondary" @click="retake">
          ถ่ายใหม่
        </JButton>
        <JButton
          variant="primary"
          :loading="kycStore.isLoading"
          :disabled="!kycStore.faceMatchResult?.passed"
          @click="confirm"
        >
          ถัดไป
        </JButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useKycStore } from '../../stores/kyc';
import { useCamera } from '../../composables/useCamera';
import JHeader from '../../components/layout/JHeader.vue';
import JButton from '../../components/base/JButton.vue';

const router = useRouter();
const kycStore = useKycStore();

const { videoRef, isReady: cameraReady, startCamera, stopCamera, capturePhoto } = useCamera();

const capturedImage = ref(null);
const capturedBlob = ref(null);
const error = ref(null);

const capture = async () => {
  try {
    error.value = null;
    const { blob, dataUrl } = await capturePhoto();
    capturedImage.value = dataUrl;
    capturedBlob.value = blob;

    // Upload for face matching
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
    const result = await kycStore.uploadSelfie(file);

    if (!result.success) {
      error.value = result.error;
    }
  } catch (err) {
    error.value = 'ไม่สามารถถ่ายภาพได้ กรุณาลองใหม่';
  }
};

const retake = () => {
  capturedImage.value = null;
  capturedBlob.value = null;
  error.value = null;
};

const confirm = () => {
  router.push('/kyc/liveness');
};

onMounted(async () => {
  if (!kycStore.sessionId) {
    router.replace('/kyc');
    return;
  }

  // Start front camera for selfie
  await startCamera('user');
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.kyc-selfie {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #000;
}

.kyc-selfie__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
}

.kyc-selfie__preview {
  position: relative;
  width: 280px;
  height: 350px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #1a1a1a;
}

.kyc-selfie__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.kyc-selfie__video--hidden {
  display: none;
}

.kyc-selfie__captured {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kyc-selfie__frame {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.kyc-selfie__oval {
  width: 100%;
  height: 100%;
}

.kyc-selfie__hint {
  color: white;
  text-align: center;
  margin-top: var(--space-md);
  font-size: var(--font-size-small);
}

.kyc-selfie__error {
  color: var(--color-error);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 0, 0, 0.1);
  border-radius: var(--radius-sm);
}

.kyc-selfie__result {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: white;
}

.kyc-selfie__result-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
}

.kyc-selfie__result-icon.success {
  background: rgba(0, 255, 0, 0.2);
  color: #4ade80;
}

.kyc-selfie__footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #000;
}

.kyc-selfie__footer > * {
  flex: 1;
}
</style>
