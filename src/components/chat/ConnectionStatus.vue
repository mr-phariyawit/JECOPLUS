<template>
  <Transition name="slide-down">
    <div v-if="shouldShow" class="connection-status" :class="statusClass">
      <div class="status-indicator">
        <div class="status-dot" :class="`status-dot--${connectionStatus}`"></div>
        <span class="status-text">{{ statusText }}</span>
      </div>

      <!-- Failed messages indicator -->
      <div v-if="hasFailedMessages" class="retry-indicator">
        <span class="retry-count">{{ retryQueue.length }}</span>
        <span class="retry-text">ข้อความรอส่ง</span>
        <button v-if="!isRetrying" @click="retry" class="retry-button">
          ลองใหม่
        </button>
        <span v-else class="retrying-text">กำลังส่ง...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIChatStore } from '../../stores/chat'

const chatStore = useAIChatStore()
const { connectionStatus, retryQueue, isRetrying, isOnline } = storeToRefs(chatStore)

const hasFailedMessages = computed(() => retryQueue.value.length > 0)

const shouldShow = computed(() => {
  // Show if offline, unstable, or has failed messages
  return connectionStatus.value !== 'online' || hasFailedMessages.value
})

const statusClass = computed(() => {
  if (connectionStatus.value === 'offline') return 'connection-status--offline'
  if (connectionStatus.value === 'unstable') return 'connection-status--unstable'
  if (hasFailedMessages.value) return 'connection-status--warning'
  return ''
})

const statusText = computed(() => {
  if (connectionStatus.value === 'offline') return 'ออฟไลน์'
  if (connectionStatus.value === 'unstable') return 'การเชื่อมต่อไม่เสถียร'
  if (hasFailedMessages.value && isOnline.value) return 'ออนไลน์'
  return 'ออนไลน์'
})

const retry = () => {
  chatStore.processRetryQueue()
}
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  transition: all 0.3s ease;
}

.connection-status--offline {
  background: #fee;
  border-bottom-color: #fcc;
}

.connection-status--unstable {
  background: #fffbe6;
  border-bottom-color: #ffe58f;
}

.connection-status--warning {
  background: #fff7e6;
  border-bottom-color: #ffd591;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot--online {
  background: #52c41a;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.5);
}

.status-dot--offline {
  background: #ff4d4f;
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.5);
}

.status-dot--unstable {
  background: #fa8c16;
  box-shadow: 0 0 4px rgba(250, 140, 22, 0.5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.status-text {
  font-weight: 500;
  color: #595959;
}

.retry-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.retry-text {
  color: #8c8c8c;
  font-size: 12px;
}

.retry-button {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #40a9ff;
}

.retry-button:active {
  background: #096dd9;
}

.retrying-text {
  color: #1890ff;
  font-size: 12px;
  font-weight: 500;
}

/* Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
