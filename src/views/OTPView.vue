<template>
  <div class="otp screen screen--no-nav">
    <JHeader title="ยืนยัน OTP" />

    <div class="otp__content">
      <div class="otp__info">
        <p>กรอกรหัส OTP 6 หลัก</p>
        <p class="otp__phone">ที่ส่งไปยัง {{ maskedPhone }}</p>
      </div>

      <div class="otp__inputs">
        <input
          v-for="(digit, index) in 6"
          :key="index"
          :ref="(el) => setInputRef(el, index)"
          v-model="otpDigits[index]"
          type="tel"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          class="otp__input"
          :class="{ 'otp__input--error': error }"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>

      <p v-if="error" class="otp__error">{{ error }}</p>

      <div class="otp__timer">
        <template v-if="countdown > 0">
          <span class="text-mini">ขอรหัสใหม่ได้ใน {{ countdown }} วินาที</span>
        </template>
        <template v-else>
          <button class="otp__resend" @click="resendOTP">
            ขอรหัส OTP ใหม่
          </button>
        </template>
      </div>
    </div>

    <div class="otp__footer">
      <JButton
        variant="primary"
        :loading="isLoading"
        :disabled="!isComplete"
        @click="handleSubmit"
      >
        ยืนยัน
      </JButton>
    </div>

    <p class="otp__hint text-mini" v-if="authStore.devOtp">
      รหัส OTP สำหรับทดสอบ: {{ authStore.devOtp }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import JHeader from "../components/layout/JHeader.vue";
import JButton from "../components/base/JButton.vue";

const router = useRouter();
const authStore = useAuthStore();

const otpDigits = ref(["", "", "", "", "", ""]);
const otpInputs = ref([]);
const error = ref("");
const isLoading = ref(false);
const countdown = ref(60);
let countdownInterval = null;

// Function ref setter for input array
const setInputRef = (el, index) => {
  if (el) {
    otpInputs.value[index] = el;
  }
};

const maskedPhone = computed(() => {
  const phone = authStore.phone;
  if (!phone) return "";
  return phone.slice(0, 3) + "-XXX-" + phone.slice(-4);
});

const isComplete = computed(() => {
  return otpDigits.value.every((d) => d !== "");
});

const handleInput = (index, event) => {
  const value = event.target.value;
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
  error.value = "";
};

const handleKeydown = (index, event) => {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const paste = event.clipboardData?.getData("text") || "";
  const digits = paste.replace(/\D/g, "").slice(0, 6).split("");

  digits.forEach((digit, i) => {
    otpDigits.value[i] = digit;
  });

  if (digits.length > 0) {
    const focusIndex = Math.min(digits.length, 5);
    otpInputs.value[focusIndex]?.focus();
  }
};

const resendOTP = async () => {
  const result = await authStore.sendOTP(authStore.phone);

  if (result.success) {
    countdown.value = 60;
    startCountdown();
    error.value = "";
    otpDigits.value = ["", "", "", "", "", ""];
    otpInputs.value[0]?.focus();

    // Show dev OTP hint in console (development only)
    if (result.devOtp) {
      console.log(`[DEV] New OTP: ${result.devOtp}`);
    }
  } else {
    error.value = result.error || "ไม่สามารถส่ง OTP ใหม่ได้";
  }
};

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
};

const handleSubmit = async () => {
  const otp = otpDigits.value.join("");

  if (otp.length !== 6) {
    error.value = "กรุณากรอก OTP ให้ครบ 6 หลัก";
    return;
  }

  isLoading.value = true;
  error.value = "";

  const result = await authStore.verifyOTP(otp);

  isLoading.value = false;

  if (result.success) {
    router.replace("/dashboard");
  } else {
    error.value = result.error;
    otpDigits.value = ["", "", "", "", "", ""];
    otpInputs.value[0]?.focus();
  }
};

onMounted(() => {
  startCountdown();
  otpInputs.value[0]?.focus();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
.otp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.otp__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--space-xl);
}

.otp__info {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.otp__phone {
  color: var(--color-gray-4);
  margin-top: var(--space-xs);
}

.otp__inputs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.otp__input {
  width: 48px;
  height: 56px;
  border: 2px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: var(--font-size-subheader);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.otp__input:focus {
  outline: none;
  border-color: var(--color-black);
}

.otp__input--error {
  border-color: var(--color-error);
  background-color: #fef2f2;
}

.otp__error {
  color: var(--color-error);
  font-size: var(--font-size-small);
  margin-bottom: var(--space-md);
}

.otp__timer {
  margin-top: var(--space-lg);
}

.otp__resend {
  background: none;
  border: none;
  color: var(--color-red);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: underline;
}

.otp__footer {
  padding: var(--space-md);
}

.otp__hint {
  text-align: center;
  padding-bottom: var(--space-md);
  color: var(--color-gray-3);
}
</style>
