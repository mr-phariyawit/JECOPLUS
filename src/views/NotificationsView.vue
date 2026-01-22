<template>
  <div class="notifications screen">
    <JHeader title="การแจ้งเตือน" />

    <div v-if="notifications.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>ไม่มีการแจ้งเตือน</p>
    </div>

    <div v-else class="notifications__list">
      <div 
        v-for="notif in notifications" 
        :key="notif.id"
        :class="['notification', { 'notification--unread': !notif.read }]"
      >
        <div :class="['notification__icon', `notification__icon--${notif.type.toLowerCase()}`]">
          <svg v-if="notif.type === 'PAYMENT_DUE'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="notif.type === 'PAYMENT_SUCCESS'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="notification__content">
          <div class="notification__header">
            <span class="notification__title">{{ notif.title }}</span>
            <span class="notification__time text-mini">{{ formatTime(notif.createdAt) }}</span>
          </div>
          <p class="notification__message text-small">{{ notif.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { notifications } from '../services/mockData'
import JHeader from '../components/layout/JHeader.vue'

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'วันนี้'
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.notifications__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.notification {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-2);
}

.notification--unread {
  background: #fff5f5;
  border-color: var(--color-red);
}

.notification__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.notification__icon--payment_due {
  background: #fef3c7;
  color: #d97706;
}

.notification__icon--payment_success {
  background: #dcfce7;
  color: #16a34a;
}

.notification__icon--promo {
  background: #dbeafe;
  color: #2563eb;
}

.notification__content {
  flex: 1;
  min-width: 0;
}

.notification__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification__title {
  font-weight: var(--font-weight-medium);
}

.notification__time {
  color: var(--color-gray-3);
  flex-shrink: 0;
}

.notification__message {
  color: var(--color-gray-4);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-gray-3);
  text-align: center;
  gap: var(--space-md);
}
</style>
