<template>
  <button
    class="ai-chat-fab"
    @click="toggleChat"
    :aria-label="isOpen ? 'Close AI Assistant' : 'Open AI Assistant'"
    :class="{ 'ai-chat-fab--active': isOpen }"
  >
    <Transition name="fab-icon" mode="out-in">
      <svg
        v-if="!isOpen"
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else key="close" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </Transition>
    <span v-if="hasUnread" class="ai-chat-fab__badge"></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useAIChatStore } from '../../stores/chat'

const chatStore = useAIChatStore()

const isOpen = computed(() => chatStore.isOpen)
const hasUnread = computed(() => false) // TODO: Implement unread message tracking

const toggleChat = () => {
  chatStore.toggleChat()
}
</script>

<style scoped>
.ai-chat-fab {
  position: fixed;
  bottom: 100px;
  right: var(--space-md);
  width: 56px;
  height: 56px;
  background: var(--color-red);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9997;
  transition: all var(--transition-fast);
  animation: pulse 2s infinite;
}

.ai-chat-fab:hover {
  background: #c9000d;
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.ai-chat-fab:active {
  transform: scale(0.95);
}

.ai-chat-fab--active {
  background: var(--color-gray-5);
  animation: none;
}

.ai-chat-fab--active:hover {
  background: var(--color-gray-4);
}

.ai-chat-fab__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background: #4ade80;
  border: 2px solid var(--color-white);
  border-radius: 50%;
  animation: pulse-badge 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(201, 0, 13, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(201, 0, 13, 0.6);
  }
}

@keyframes pulse-badge {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.fab-icon-enter-active,
.fab-icon-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fab-icon-enter-from,
.fab-icon-leave-to {
  transform: rotate(90deg);
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .ai-chat-fab {
    bottom: 80px;
    right: var(--space-md);
  }
}
</style>
