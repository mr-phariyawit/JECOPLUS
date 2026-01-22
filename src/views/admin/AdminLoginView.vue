<template>
  <div class="admin-login">
    <div class="admin-login__card">
      <div class="admin-login__header">
        <div class="admin-login__logo">
          <span class="admin-login__logo-text">JECO+</span>
          <span class="admin-login__logo-badge">Admin</span>
        </div>
        <h1 class="admin-login__title">Admin Portal</h1>
        <p class="admin-login__subtitle">Sign in to manage the platform</p>
      </div>

      <form class="admin-login__form" @submit.prevent="handleSubmit">
        <div class="admin-login__field">
          <label class="admin-login__label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="admin-login__input"
            :class="{ 'admin-login__input--error': errors.email }"
            placeholder="admin@jecoplus.com"
            autocomplete="email"
          />
          <span v-if="errors.email" class="admin-login__error">{{ errors.email }}</span>
        </div>

        <div class="admin-login__field">
          <label class="admin-login__label" for="password">Password</label>
          <div class="admin-login__password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="admin-login__input"
              :class="{ 'admin-login__input--error': errors.password }"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="admin-login__toggle-password"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="admin-login__error">{{ errors.password }}</span>
        </div>

        <div v-if="adminStore.error" class="admin-login__alert">
          {{ adminStore.error }}
        </div>

        <button
          type="submit"
          class="admin-login__submit"
          :disabled="adminStore.isLoading"
        >
          <span v-if="adminStore.isLoading" class="admin-login__spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="admin-login__footer">
        <a href="/" class="admin-login__link">Back to App</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';

const router = useRouter();
const adminStore = useAdminStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errors = ref({});

onMounted(() => {
  // Check if already logged in
  adminStore.initSession();
  if (adminStore.isAuthenticated) {
    router.replace('/admin');
  }
});

const validate = () => {
  errors.value = {};

  if (!email.value) {
    errors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Invalid email format';
  }

  if (!password.value) {
    errors.value.password = 'Password is required';
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  adminStore.clearError();

  if (!validate()) return;

  const result = await adminStore.login(email.value, password.value);

  if (result.success) {
    router.replace('/admin');
  }
};
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2d2d 100%);
  padding: var(--space-md);
}

.admin-login__card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-xl);
}

.admin-login__header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.admin-login__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.admin-login__logo-text {
  font-size: var(--font-size-header);
  font-weight: var(--font-weight-bold);
  color: var(--color-red);
}

.admin-login__logo-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--color-black);
  color: white;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: var(--font-weight-bold);
}

.admin-login__title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-xs);
}

.admin-login__subtitle {
  color: var(--color-gray-4);
  margin: 0;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.admin-login__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.admin-login__label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-5);
}

.admin-login__input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  transition: all var(--transition-fast);
}

.admin-login__input:focus {
  outline: none;
  border-color: var(--color-red);
  box-shadow: 0 0 0 3px rgba(228, 0, 15, 0.1);
}

.admin-login__input--error {
  border-color: var(--color-error);
}

.admin-login__password-wrapper {
  position: relative;
}

.admin-login__password-wrapper .admin-login__input {
  padding-right: 48px;
}

.admin-login__toggle-password {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: var(--space-xs);
  color: var(--color-gray-4);
  cursor: pointer;
}

.admin-login__error {
  font-size: var(--font-size-small);
  color: var(--color-error);
}

.admin-login__alert {
  padding: var(--space-sm) var(--space-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-small);
}

.admin-login__submit {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-red);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.admin-login__submit:hover:not(:disabled) {
  background: #c9000d;
}

.admin-login__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-login__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.admin-login__footer {
  text-align: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-gray-2);
}

.admin-login__link {
  color: var(--color-gray-4);
  text-decoration: none;
  font-size: var(--font-size-small);
}

.admin-login__link:hover {
  color: var(--color-red);
}
</style>
