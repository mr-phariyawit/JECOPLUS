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
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
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
              <div>
                <h3 class="chat-title">{{ chatTitle }}</h3>
                <span class="chat-status">
                  <span class="status-dot"></span>
                  พร้อมช่วยเหลือ 24/7
                </span>
              </div>
            </div>
            <button class="chat-close" @click="closeChat" aria-label="Close">
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

          <!-- Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{
                'message-user': message.role === 'user',
                'message-error': message.isError,
              }"
            >
              <div v-if="message.role === 'assistant'" class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <div class="message-bubble">
                <div
                  class="message-text"
                  v-html="renderMarkdown(message.text)"
                ></div>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="message">
              <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div class="message-bubble typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>

          <!-- Suggested Questions -->
          <div
            class="chat-suggestions"
            v-if="suggestions.length && !isTyping && messages.length < 5"
          >
            <div class="suggestion-scroll">
              <button
                v-for="(question, index) in suggestions"
                :key="index"
                class="suggestion-chip"
                @click="sendSuggestion(question)"
              >
                {{ question }}
              </button>
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
import { ref, computed, watch, nextTick } from "vue";
import { useAIChatStore } from "../../stores/chat";

// Props
const props = defineProps({
  mode: {
    type: String,
    default: "general",
  },
  context: {
    type: Object,
    default: () => ({}),
  },
});

const chatStore = useAIChatStore();

// Refs
const messagesContainer = ref(null);
const inputRef = ref(null);
const userInput = ref("");

// Computed
const isOpen = computed(() => chatStore.isOpen);
const messages = computed(() => chatStore.messages);
const isLoading = computed(() => chatStore.isLoading);
const isTyping = computed(() => chatStore.isTyping);

const chatTitle = computed(() => {
  switch (props.mode) {
    case "money-coach":
      return "💰 Money Coach AI";
    case "loan-assistant":
      return "💳 Loan Assistant AI";
    default:
      return "🤖 JECO Advisor";
  }
});

const suggestions = computed(() => {
  switch (props.mode) {
    case "money-coach":
      return [
        "วิเคราะห์การใช้จ่ายเดือนนี้ให้หน่อย",
        "ฉันควรลดค่าใช้จ่ายส่วนไหนดี?",
        "วางแผนเก็บเงินซื้อบ้านให้หน่อย",
        "การเงินของฉันเป็นอย่างไรบ้าง?",
      ];
    case "loan-assistant":
      return [
        "ช่วยคำนวณดอกเบี้ยหน่อย",
        "สินเชื่อตัวไหนเหมาะกับฉันที่สุด?",
        "ถ้ากู้ 100,000 ผ่อน 2 ปี ต้องจ่ายเดือนละเท่าไหร่?",
        "มีเทคนิคการผ่อนสินเชื่อให้หมดไวๆ ไหม?",
      ];
    default:
      return [
        "สวัสดี แนะนำตัวหน่อย",
        "JECO+ ทำอะไรได้บ้าง?",
        "สมัครสินเชื่อต้องใช้อะไรบ้าง?",
      ];
  }
});

// Watch Mode & Context
watch(
  () => props.mode,
  (newMode) => {
    chatStore.setMode(newMode);
  },
  { immediate: true },
);

watch(
  () => props.context,
  (newContext) => {
    if (newContext && Object.keys(newContext).length > 0) {
      chatStore.setContext(newContext);
    }
  },
  { deep: true, immediate: true },
);

// Methods
const closeChat = () => chatStore.closeChat();

const handleSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  const text = userInput.value.trim();
  userInput.value = "";
  await chatStore.sendMessage(text);
  await scrollToBottom();
};

const sendSuggestion = async (text) => {
  userInput.value = "";
  await chatStore.sendMessage(text);
  await scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Render markdown safely
const renderMarkdown = (text) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Basic Markdown
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br>");

  // Lists
  const lines = html.split("<br>");
  let inList = false;
  const processedLines = [];

  for (let line of lines) {
    const isBullet = /^[\s]*[*\-][\s]+/.test(line);
    if (isBullet) {
      if (!inList) {
        processedLines.push("<ul>");
        inList = true;
      }
      processedLines.push(`<li>${line.replace(/^[\s]*[*\-][\s]+/, "")}</li>`);
    } else {
      if (inList) {
        processedLines.push("</ul>");
        inList = false;
      }
      processedLines.push(line);
    }
  }
  if (inList) processedLines.push("</ul>");

  return processedLines.join("");
};

// Auto Scroll & Focus
watch(() => messages.value.length, scrollToBottom);
watch(isTyping, scrollToBottom);
watch(isOpen, (open) => {
  if (open) nextTick(() => inputRef.value?.focus());
});
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
  padding: 1.5rem;
  pointer-events: none;
}

.chat-container {
  width: 100%;
  max-width: 400px;
  height: 600px;
  max-height: calc(100vh - 100px);
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  pointer-events: all;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.chat-status {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
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

.chat-close {
  background: transparent;
  border: none;
  color: white;
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: opacity 0.2s;
}

.chat-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #f3f4f6;
  color: #1f2937;
  font-size: 0.95rem;
}

.message-user .message-bubble {
  background: #ef4444;
  color: white;
}

.message-error .message-bubble {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.message-text p {
  margin: 0;
}

.message-text ul {
  padding-left: 1.2rem;
  margin: 0.5rem 0;
}

.message-time {
  display: block;
  font-size: 0.7rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* Suggestions */
.chat-suggestions {
  padding: 0.5rem 1rem;
  border-top: 1px solid #f3f4f6;
}

.suggestion-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.suggestion-chip {
  white-space: nowrap;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #e5e7eb;
  color: #1f2937;
}

/* Input */
.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
}

.chat-input input:focus {
  border-color: #ef4444;
}

.send-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #dc2626;
}

.send-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Typing */
.typing {
  display: flex;
  gap: 4px;
  padding: 1rem;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
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
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Transitions */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .chat-widget {
    padding: 0;
  }
  .chat-container {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
