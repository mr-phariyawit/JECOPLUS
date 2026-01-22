<template>
  <button class="chat-fab" @click="toggleChat" aria-label="Open AI Chat">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup>
import { useAIChatStore } from '../../stores/chat'

const chatStore = useAIChatStore()

const toggleChat = () => {
  chatStore.toggleChat()
}
</script>

<style scoped>
.chat-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 9997;
}

.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chat-fab:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .chat-fab {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
