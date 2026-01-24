<template>
  <div class="kyc-idcard screen screen--no-nav">
    <JHeader
      :title="side === 'front' ? 'ถ่ายบัตรด้านหน้า' : 'ถ่ายบัตรด้านหลัง'"
    />

    <div class="kyc-idcard__content">
      <div class="kyc-idcard__preview">
        <video
          ref="videoRef"
          class="kyc-idcard__video"
          :class="{ 'kyc-idcard__video--hidden': capturedImage }"
          autoplay
          playsinline
          muted
        />

        <img
          v-if="capturedImage"
          :src="capturedImage"
          class="kyc-idcard__captured"
          alt="Captured ID Card"
        />

        <div v-if="!capturedImage" class="kyc-idcard__frame">
          <div
            class="kyc-idcard__frame-corner kyc-idcard__frame-corner--tl"
          ></div>
          <div
            class="kyc-idcard__frame-corner kyc-idcard__frame-corner--tr"
          ></div>
          <div
            class="kyc-idcard__frame-corner kyc-idcard__frame-corner--bl"
          ></div>
          <div
            class="kyc-idcard__frame-corner kyc-idcard__frame-corner--br"
          ></div>

          <!-- Scanning Beam -->
          <div v-if="isScanning" class="kyc-idcard__scan-beam"></div>
        </div>
      </div>

      <p v-if="!capturedImage" class="kyc-idcard__hint">
        {{
          isScanning
            ? "กำลังสแกน..."
            : side === "front"
              ? "วางบัตรประชาชนด้านหน้าให้อยู่ในกรอบ"
              : "วางบัตรประชาชนด้านหลังให้อยู่ในกรอบ"
        }}
      </p>

      <div v-if="error" class="kyc-idcard__error">
        {{ error }}
      </div>

      <!-- OCR Preview -->
      <div
        v-if="capturedImage && kycStore.ocrResult && side === 'front'"
        class="kyc-idcard__ocr"
      >
        <p class="kyc-idcard__ocr-title">ข้อมูลที่อ่านได้:</p>
        <div class="kyc-idcard__ocr-item">
          <span class="label">ชื่อ-นามสกุล:</span>
          <span
            >{{ kycStore.ocrResult.firstName }}
            {{ kycStore.ocrResult.lastName }}</span
          >
        </div>
        <div class="kyc-idcard__ocr-item">
          <span class="label">เลขบัตร:</span>
          <span>{{ formatCitizenId(kycStore.ocrResult.citizenId) }}</span>
        </div>
      </div>
    </div>

    <div class="kyc-idcard__footer">
      <template v-if="!capturedImage">
        <JButton
          variant="primary"
          :disabled="!cameraReady || isScanning"
          @click="handleCapture"
        >
          {{ isScanning ? "กำลังสแกน..." : "ถ่ายภาพ" }}
        </JButton>
      </template>

      <template v-else>
        <JButton variant="secondary" @click="retake"> ถ่ายใหม่ </JButton>
        <JButton
          variant="primary"
          :loading="kycStore.isLoading"
          @click="confirm"
        >
          {{ side === "front" ? "ถัดไป" : "ยืนยัน" }}
        </JButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useKycStore } from "../../stores/kyc";
import { useDemoStore } from "../../stores/demo";
import { useCamera } from "../../composables/useCamera";
import JHeader from "../../components/layout/JHeader.vue";
import JButton from "../../components/base/JButton.vue";

const router = useRouter();
const route = useRoute();
const kycStore = useKycStore();

const {
  videoRef,
  isReady: cameraReady,
  error: cameraError,
  startCamera,
  stopCamera,
  capturePhoto,
} = useCamera();

const side = ref("front");
const capturedImage = ref(null);
const capturedBlob = ref(null);
const error = ref(null);

const formatCitizenId = (id) => {
  if (!id) return "";
  return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
};

const capture = async () => {
  try {
    error.value = null;
    const { blob, dataUrl } = await capturePhoto();
    capturedImage.value = dataUrl;
    capturedBlob.value = blob;
  } catch (err) {
    error.value = "ไม่สามารถถ่ายภาพได้ กรุณาลองใหม่";
  }
};

const retake = () => {
  capturedImage.value = null;
  capturedBlob.value = null;
  error.value = null;
};

const confirm = async () => {
  if (!capturedBlob.value) return;

  const file = new File([capturedBlob.value], `id-card-${side.value}.jpg`, {
    type: "image/jpeg",
  });
  const result = await kycStore.uploadIdCard(side.value, file);

  if (result.success) {
    if (side.value === "front") {
      // Move to OCR confirmation page
      router.push("/kyc/ocr-confirm");
    } else {
      // Move to selfie
      router.push("/kyc/selfie");
    }
  } else {
    error.value = result.error;
  }
};

onMounted(async () => {
  // Check if session exists
  const demoStore = useDemoStore();
  if (!kycStore.sessionId && !demoStore.isDemoMode) {
    router.replace("/kyc");
    return;
  }

  // Start camera (back camera for ID card)
  await startCamera("environment");
});

onUnmounted(() => {
  stopCamera();
});

// Demo Mode: Mock OCR
const demoStore = useDemoStore();
const isScanning = ref(false);

const performDemoCapture = async () => {
  if (isScanning.value) return;

  isScanning.value = true;
  await demoStore.simulateDelay(2000); // 2s scanning animation

  // Mock Image (placeholder)
  capturedImage.value = "https://placehold.co/600x400/png?text=E-ID+Card";
  capturedBlob.value = new Blob([""], { type: "image/jpeg" });

  isScanning.value = false;

  // Mock OCR Result
  kycStore.setOcrResult({
    firstName: demoStore.mockUser.firstName,
    lastName: demoStore.mockUser.lastName,
    citizenId: "1-1037-02499-63-2",
  });
};

// Intercept capture for demo
const originalCapture = capture;
const handleCapture = () => {
  if (demoStore.isDemoMode) {
    performDemoCapture();
  } else {
    originalCapture();
  }
};
</script>

<style scoped>
.kyc-idcard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #000;
}

.kyc-idcard__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
}

.kyc-idcard__preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1.585 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #1a1a1a;
}

.kyc-idcard__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kyc-idcard__video--hidden {
  display: none;
}

.kyc-idcard__captured {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kyc-idcard__frame {
  position: absolute;
  inset: 20px;
  pointer-events: none;
}

.kyc-idcard__frame-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid white;
}

.kyc-idcard__frame-corner--tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.kyc-idcard__frame-corner--tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.kyc-idcard__frame-corner--bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.kyc-idcard__frame-corner--br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.kyc-idcard__scan-beam {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
  animation: scan 2s linear infinite;
  opacity: 0.8;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0;
  }
}

.kyc-idcard__hint {
  color: white;
  text-align: center;
  margin-top: var(--space-md);
  font-size: var(--font-size-small);
}

.kyc-idcard__error {
  color: var(--color-error);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 0, 0, 0.1);
  border-radius: var(--radius-sm);
}

.kyc-idcard__ocr {
  width: 100%;
  max-width: 400px;
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: white;
}

.kyc-idcard__ocr-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.kyc-idcard__ocr-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-small);
  margin-bottom: var(--space-xs);
}

.kyc-idcard__ocr-item .label {
  color: rgba(255, 255, 255, 0.7);
}

.kyc-idcard__footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #000;
}

.kyc-idcard__footer > * {
  flex: 1;
}
</style>
