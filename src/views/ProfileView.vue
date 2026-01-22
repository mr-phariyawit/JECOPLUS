<template>
  <div class="profile screen">
    <JHeader title="โปรไฟล์" :showBack="false" />

    <div class="profile__avatar">
      <div class="avatar">
        <span>{{ initials }}</span>
      </div>
      <h2 class="profile__name">{{ authStore.fullName }}</h2>
      <p class="profile__phone text-small">{{ authStore.user?.phone }}</p>
    </div>

    <section class="profile__info section">
      <JCard>
        <div class="info-row">
          <span class="info-row__label">อีเมล</span>
          <span class="info-row__value">{{
            authStore.user?.email || "-"
          }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">เลขบัตรประชาชน</span>
          <span class="info-row__value">{{
            authStore.user?.idCard || "-"
          }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">สถานะ KYC</span>
          <JBadge
            :label="
              authStore.user?.kycStatus === 'VERIFIED'
                ? 'ยืนยันแล้ว'
                : 'รอยืนยัน'
            "
            :variant="
              authStore.user?.kycStatus === 'VERIFIED' ? 'success' : 'warning'
            "
          />
        </div>
      </JCard>
    </section>

    <section class="profile__menu section">
      <div class="menu-list">
        <button class="menu-item" @click="$router.push('/notifications')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M13.73 21a2 2 0 01-3.46 0"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <span>การแจ้งเตือน</span>
          <svg
            class="menu-item__arrow"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <button class="menu-item" @click="$router.push('/payment-settings')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path d="M2 10H22" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>วิธีชำระเงิน</span>
          <svg
            class="menu-item__arrow"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <button class="menu-item" @click="$router.push('/support')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M9 9a3 3 0 115.83 1c0 2-3 3-3 3"
              stroke="currentColor"
              stroke-width="2"
            />
            <path d="M12 17h.01" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>ช่วยเหลือ</span>
          <svg
            class="menu-item__arrow"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>
    </section>

    <div class="profile__logout">
      <JButton variant="outline" @click="logout"> ออกจากระบบ </JButton>
    </div>

    <p class="profile__version text-mini">JECO+ v1.0.0</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";
import JBadge from "../components/base/JBadge.vue";
import JButton from "../components/base/JButton.vue";

const router = useRouter();
const authStore = useAuthStore();

const initials = computed(() => {
  const name = authStore.fullName;
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
});

const logout = () => {
  if (confirm("ต้องการออกจากระบบ?")) {
    authStore.logout();
    router.replace("/login");
  }
};
</script>

<style scoped>
.profile__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl) 0;
}

.avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-red);
  color: var(--color-white);
  font-size: var(--font-size-subheader);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-md);
}

.profile__name {
  margin-bottom: var(--space-xs);
}

.profile__phone {
  color: var(--color-gray-4);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-gray-1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row__label {
  color: var(--color-gray-4);
}

.info-row__value {
  font-weight: var(--font-weight-medium);
}

.menu-list {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-2);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid var(--color-gray-1);
  transition: background var(--transition-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--color-gray-1);
}

.menu-item span {
  flex: 1;
}

.menu-item__arrow {
  color: var(--color-gray-3);
}

.profile__logout {
  margin-top: var(--space-xl);
}

.profile__version {
  text-align: center;
  margin-top: var(--space-lg);
  color: var(--color-gray-3);
}
</style>
