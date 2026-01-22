<template>
  <Teleport to="body">
    <Transition name="chat-fade">
      <div v-if="isOpen" class="chat-widget">
        <div class="chat-container">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="9" cy="10" r="1" fill="currentColor"/>
                  <circle cx="15" cy="10" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3 class="chat-title">🤖 JECO Advisor</h3>
                <span class="chat-status">
                  <span class="status-dot"></span>
                  พร้อมช่วยเหลือ 24/7
                </span>
              </div>
            </div>
            <button class="chat-close" @click="closeChat" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{'message-user': message.role === 'user', 'message-error': message.isError}"
            >
              <div v-if="message.role === 'assistant'" class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="10" r="1" fill="currentColor"/>
                  <circle cx="15" cy="10" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div class="message-bubble">
                <div class="message-text" v-html="renderMarkdown(message.text)"></div>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="message">
              <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="message-bubble typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input">
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
              class="send-button"
              @click="handleSend"
              :disabled="!userInput.trim() || isLoading"
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAIChatStore } from '../../stores/chat'

// Props
const props = defineProps({
  mode: {
    type: String,
    default: 'general',
  },
})

const chatStore = useAIChatStore()

// Refs
const messagesContainer = ref(null)
const inputRef = ref(null)
const userInput = ref('')

// Computed
const isOpen = computed(() => chatStore.isOpen)
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const isTyping = computed(() => chatStore.isTyping)

// Set mode
watch(() => props.mode, (newMode) => {
  chatStore.setMode(newMode)
}, { immediate: true })

// Methods
const closeChat = () => chatStore.closeChat()

const handleSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const text = userInput.value.trim()
  userInput.value = ''

  await chatStore.sendMessage(text)
  await scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Render markdown safely
const renderMarkdown = (text) => {
  if (!text) return ''

  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Convert markdown to HTML
  // Bold: **text** (process first to avoid conflicts with italic *)
  html = html.replace(/\*\*(.+?)\*\*/g, '{{BOLD_START}}$1{{BOLD_END}}')

  // Italic: *text* (now safe, won't match ** since we replaced them)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Restore bold markers as HTML
  html = html.replace(/\{\{BOLD_START\}\}/g, '<strong>')
  html = html.replace(/\{\{BOLD_END\}\}/g, '</strong>')

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  // Bullet lists: lines starting with * or -
  const lines = html.split('<br>')
  let inList = false
  const processedLines = []

  for (let line of lines) {
    const isBullet = /^[\s]*[*\-][\s]+/.test(line)

    if (isBullet) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      // Remove the bullet marker and wrap in <li>
      const content = line.replace(/^[\s]*[*\-][\s]+/, '')
      processedLines.push(`<li>${content}</li>`)
    } else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }

  if (inList) {
    processedLines.push('</ul>')
  }

  return processedLines.join('')
}

// Watch messages
watch(() => messages.value.length, scrollToBottom)
watch(isTyping, scrollToBottom)

// Focus input when opened
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => inputRef.value?.focus())
  }
})
</script>

<style scoped>
.chat-widget {
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

.chat-container {
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
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin: 0 0 2px 0;
}

.chat-status {
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-close {
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
}

.chat-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  scroll-behavior: smooth;
}

.message {
  display: flex;
  gap: var(--space-xs);
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
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

.message-user .message-avatar {
  display: none;
}

.message-bubble {
  max-width: 75%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-gray-1);
  color: var(--color-black);
}

.message-user .message-bubble {
  background: var(--color-red);
  color: var(--color-white);
}

.message-error .message-bubble {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.message-text {
  margin: 0;
  font-size: var(--font-size-body);
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text strong {
  font-weight: var(--font-weight-bold);
}

.message-text em {
  font-style: italic;
}

.message-text ul {
  margin: 8px 0;
  padding-left: 20px;
  list-style-type: disc;
}

.message-text li {
  margin: 4px 0;
  line-height: 1.4;
}

.message-time {
  display: block;
  font-size: var(--font-size-small);
  opacity: 0.6;
  margin-top: var(--space-xs);
}

/* Typing */
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

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
  30% { transform: translateY(-10px); opacity: 1; }
}

/* Input */
.chat-input {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-top: 1px solid var(--color-gray-2);
}

.chat-input input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  outline: none;
  transition: border-color var(--transition-fast);
}

.chat-input input:focus {
  border-color: var(--color-red);
}

.chat-input input:disabled {
  background: var(--color-gray-1);
  cursor: not-allowed;
}

.send-button {
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
}

.send-button:hover:not(:disabled) {
  background: #c9000d;
  transform: translateY(-1px);
}

.send-button:disabled {
  background: var(--color-gray-2);
  color: var(--color-gray-3);
  cursor: not-allowed;
}

/* Transitions */
.chat-fade-enter-active, .chat-fade-leave-active {
  transition: opacity 0.2s ease;
}

.chat-fade-enter-from, .chat-fade-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .chat-widget {
    padding: 0;
    align-items: stretch;
  }

  .chat-container {
    max-width: 100%;
    max-height: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
