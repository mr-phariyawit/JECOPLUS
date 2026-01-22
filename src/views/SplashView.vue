<template>
  <div class="splash screen--dark screen--center screen--no-nav">
    <div class="splash__content animate-fadeIn">
      <div class="splash__logo">
        <span class="splash__logo-j">J</span>
        <span class="splash__logo-text">ECO+</span>
      </div>
      <p class="splash__tagline">แฮปปี้ เงินก้อน ผ่อนสบาย</p>
    </div>
    <div class="splash__loader">
      <div class="splash__spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  // Redirect after 2 seconds
  setTimeout(() => {
    if (authStore.isLoggedIn) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, 2000);
});
</script>

<style scoped>
.splash {
  background-color: var(--color-black);
  gap: var(--space-xl);
}

.splash__content {
  text-align: center;
}

.splash__logo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: var(--space-sm);
}

.splash__logo-j {
  font-size: 64px;
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.splash__logo-text {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
}

.splash__tagline {
  font-size: var(--font-size-body);
  color: var(--color-gray-3);
}

.splash__loader {
  position: absolute;
  bottom: 60px;
}

.splash__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-5);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
