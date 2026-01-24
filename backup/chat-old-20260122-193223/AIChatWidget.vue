<template>
  <Teleport to="body">
    <Transition name="chat-fade">
      <div v-if="isOpen" class="ai-chat-widget" @click.self="handleBackdropClick">
        <div class="ai-chat-widget__container">
          <!-- Header -->
          <div class="ai-chat-widget__header">
            <div class="ai-chat-widget__header-content">
              <div class="ai-chat-widget__avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M8 14s1.5 2 4 2 4-2 4-2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <div class="ai-chat-widget__header-info">
                <h3 class="ai-chat-widget__title">🤖 JECO Advisor</h3>
                <span class="ai-chat-widget__status">
                  <span class="status-dot"></span>
                  พร้อมช่วยเหลือ 24/7
                </span>
              </div>
            </div>
            <button class="ai-chat-widget__close" @click="closeChat" aria-label="Close chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Messages Container -->
          <div class="ai-chat-widget__messages" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              class="chat-message"
              :class="{
                'chat-message--user': message.role === 'user',
                'chat-message--ai': message.role === 'assistant',
                'chat-message--error': message.isError,
              }"
            >
              <div v-if="message.role === 'assistant'" class="chat-message__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M8 14s1.5 2 4 2 4-2 4-2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <div class="chat-message__bubble">
                <p style="white-space: pre-wrap;">{{ message.text }}</p>
                <span class="chat-message__time">{{ message.time }}</span>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="chat-message chat-message--ai">
              <div class="chat-message__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M8 14s1.5 2 4 2 4-2 4-2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="chat-message__bubble typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="showQuickActions" class="ai-chat-widget__quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.text"
              class="quick-action"
              @click="handleQuickAction(action)"
            >
              {{ action.text }}
            </button>
          </div>

          <!-- Input -->
          <div class="ai-chat-widget__input">
            <input
              v-model="userInput"
              type="text"
              placeholder="พิมพ์ข้อความ..."
              @keyup.enter="handleSend"
              @keyup.esc="closeChat"
              :disabled="isLoading"
              ref="inputRef"
            />
            <button
              class="ai-chat-widget__send"
              @click="handleSend"
              :disabled="!userInput.trim() || isLoading"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAIChatStore } from '../../stores/chat'

// Props
const props = defineProps({
  mode: {
    type: String,
    default: 'general', // 'general', 'money-coach', 'loan-assistant'
  },
})

const chatStore = useAIChatStore()

// Set mode when component mounts or prop changes
watch(() => props.mode, (newMode) => {
  chatStore.setMode(newMode)
}, { immediate: true })

// Refs
const messagesContainer = ref(null)
const inputRef = ref(null)
const userInput = ref('')

// Computed
const isOpen = computed(() => chatStore.isOpen)
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const isTyping = computed(() => chatStore.isTyping)
const quickActions = computed(() => chatStore.quickActions)

// Show quick actions only when there's just the welcome message
const showQuickActions = computed(() => {
  return messages.value.length === 1 && messages.value[0].role === 'assistant'
})

// Methods
const closeChat = () => {
  chatStore.closeChat()
}

const handleBackdropClick = () => {
  // Close on backdrop click (optional - can be removed if you want to keep it open)
  // closeChat()
}

const handleSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const text = userInput.value.trim()
  userInput.value = ''

  await chatStore.sendMessage(text)
  await scrollToBottom()
}

const handleQuickAction = async (action) => {
  await chatStore.sendQuickAction(action)
  await scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for new messages and scroll
watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

// Watch for typing indicator
watch(isTyping, () => {
  scrollToBottom()
})

// Focus input when chat opens
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--space-md);
  pointer-events: none;
}

.ai-chat-widget__container {
  width: 100%;
  max-width: 400px;
  max-height: 600px;
  height: calc(100vh - 120px);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  pointer-events: all;
  overflow: hidden;
}

/* Header */
.ai-chat-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
}

.ai-chat-widget__header-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
}

.ai-chat-widget__avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-chat-widget__header-info {
  flex: 1;
  min-width: 0;
}

.ai-chat-widget__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-chat-widget__status {
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.ai-chat-widget__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-white);
  cursor: pointer;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.ai-chat-widget__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Messages */
.ai-chat-widget__messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  scroll-behavior: smooth;
}

.chat-message {
  display: flex;
  gap: var(--space-xs);
  align-items: flex-start;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-message__avatar {
  width: 32px;
  height: 32px;
  background: var(--color-gray-1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-gray-4);
}

.chat-message--user .chat-message__avatar {
  display: none;
}

.chat-message__bubble {
  max-width: 75%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  position: relative;
}

.chat-message--ai .chat-message__bubble {
  background: var(--color-gray-1);
  color: var(--color-black);
  border-bottom-left-radius: 4px;
}

.chat-message--user .chat-message__bubble {
  background: var(--color-red);
  color: var(--color-white);
  border-bottom-right-radius: 4px;
}

.chat-message--error .chat-message__bubble {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.chat-message__bubble p {
  margin: 0;
  font-size: var(--font-size-body);
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-message__bubble p :deep(strong) {
  font-weight: var(--font-weight-bold);
}

.chat-message__time {
  display: block;
  font-size: var(--font-size-small);
  opacity: 0.6;
  margin-top: var(--space-xs);
}

/* Typing Indicator */
.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: var(--space-md);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--color-gray-3);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Quick Actions */
.ai-chat-widget__quick-actions {
  padding: 0 var(--space-md) var(--space-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.quick-action {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-gray-1);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  color: var(--color-black);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.quick-action:hover {
  background: var(--color-gray-2);
  border-color: var(--color-red);
  color: var(--color-red);
}

/* Input */
.ai-chat-widget__input {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
  background: var(--color-white);
}

.ai-chat-widget__input input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  outline: none;
  transition: border-color var(--transition-fast);
}

.ai-chat-widget__input input:focus {
  border-color: var(--color-red);
}

.ai-chat-widget__input input:disabled {
  background: var(--color-gray-1);
  cursor: not-allowed;
}

.ai-chat-widget__send {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-red);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.ai-chat-widget__send:hover:not(:disabled) {
  background: #c9000d;
  transform: translateY(-1px);
}

.ai-chat-widget__send:disabled {
  background: var(--color-gray-2);
  color: var(--color-gray-3);
  cursor: not-allowed;
  transform: none;
}

/* Transitions */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 0.2s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
}

.chat-fade-enter-active .ai-chat-widget__container,
.chat-fade-leave-active .ai-chat-widget__container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.chat-fade-enter-from .ai-chat-widget__container,
.chat-fade-leave-to .ai-chat-widget__container {
  transform: translateY(20px);
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .ai-chat-widget {
    padding: 0;
    align-items: stretch;
  }

  .ai-chat-widget__container {
    max-width: 100%;
    max-height: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
