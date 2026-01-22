<template>
  <div class="login screen screen--no-nav">
    <div class="login__header">
      <div class="login__logo">
        <span class="login__logo-j">J</span>
        <span class="login__logo-text">ECO+</span>
      </div>
      <h1 class="text-header">เข้าสู่ระบบ</h1>
      <p class="login__subtitle">กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP</p>
    </div>

    <div class="login__form">
      <JInput
        v-model="phone"
        label="เบอร์โทรศัพท์"
        placeholder="0XX-XXX-XXXX"
        type="tel"
        inputmode="tel"
        maxlength="10"
        :error="error"
        required
      >
        <template #prefix>
          <span class="login__prefix">+66</span>
        </template>
      </JInput>

      <JButton
        variant="primary"
        :loading="isLoading"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        ขอรหัส OTP
      </JButton>
    </div>

    <div class="login__footer">
      <p class="text-mini">
        เมื่อดำเนินการต่อ คุณยอมรับ
        <a href="#" class="login__link">เงื่อนไขการใช้งาน</a>
        และ
        <a href="#" class="login__link">นโยบายความเป็นส่วนตัว</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import JInput from "../components/base/JInput.vue";
import JButton from "../components/base/JButton.vue";

const router = useRouter();
const authStore = useAuthStore();

const phone = ref("");
const error = ref("");
const isLoading = ref(false);

const isValid = computed(() => {
  return phone.value.length === 10 && /^0[689]\d{8}$/.test(phone.value);
});

const handleSubmit = async () => {
  if (!isValid.value) {
    error.value = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง";
    return;
  }

  error.value = "";
  isLoading.value = true;

  try {
    const result = await authStore.sendOTP(phone.value);

    if (result.success) {
      // Show dev OTP hint in console (development only)
      if (result.devOtp) {
        console.log(`[DEV] OTP: ${result.devOtp}`);
      }
      router.push("/otp");
    } else {
      error.value = result.error || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  } catch (e) {
    error.value = "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: var(--space-2xl);
}

.login__header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.login__logo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: var(--space-lg);
}

.login__logo-j {
  font-size: 40px;
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.login__logo-text {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.login__subtitle {
  margin-top: var(--space-sm);
  color: var(--color-gray-4);
}

.login__form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.login__prefix {
  color: var(--color-gray-4);
  font-weight: var(--font-weight-medium);
  padding-right: var(--space-sm);
  border-right: 1px solid var(--color-gray-2);
  margin-right: var(--space-sm);
}

.login__footer {
  margin-top: auto;
  padding: var(--space-lg) 0;
  text-align: center;
}

.login__link {
  color: var(--color-red);
  text-decoration: none;
}

.login__link:hover {
  text-decoration: underline;
}
</style>
