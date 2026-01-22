<template>
  <div class="support screen">
    <JHeader title="ช่วยเหลือ" />

    <!-- AI Assistant Section -->
    <section class="ai-assistant section">
      <div class="ai-assistant__header">
        <div class="ai-assistant__avatar">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
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
        <div class="ai-assistant__info">
          <h2 class="ai-assistant__title">JECO+ AI Assistant</h2>
          <span class="ai-assistant__status">
            <span class="status-dot"></span>
            พร้อมช่วยเหลือ 24/7
          </span>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="chat-container" ref="chatContainer">
        <div class="chat-messages">
          <div
            v-for="(msg, index) in chatMessages"
            :key="index"
            class="chat-message"
            :class="{
              'chat-message--user': msg.isUser,
              'chat-message--ai': !msg.isUser,
            }"
          >
            <div v-if="!msg.isUser" class="chat-message__avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            <div class="chat-message__bubble">
              <p v-html="msg.text"></p>
              <span class="chat-message__time">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="chat-message chat-message--ai">
            <div class="chat-message__avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              </svg>
            </div>
            <div class="chat-message__bubble typing">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          v-for="action in quickActions"
          :key="action.text"
          class="quick-action"
          @click="sendQuickAction(action)"
        >
          {{ action.text }}
        </button>
      </div>

      <!-- Chat Input -->
      <div class="chat-input">
        <input
          v-model="userInput"
          type="text"
          placeholder="พิมพ์ข้อความ..."
          @keyup.enter="sendMessage"
        />
        <button
          class="chat-send"
          @click="sendMessage"
          :disabled="!userInput.trim()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    </section>

    <!-- Contact Options -->
    <section class="support__contact section">
      <h2 class="section-title">ช่องทางติดต่ออื่นๆ</h2>

      <div class="contact-list">
        <JCard>
          <a href="tel:021234567" class="contact-item">
            <div class="contact-item__icon contact-item__icon--phone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="contact-item__info">
              <span class="contact-item__title">Call Center</span>
              <span class="contact-item__value">02-123-4567</span>
            </div>
            <svg
              class="contact-item__arrow"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </a>
        </JCard>

        <JCard>
          <a
            href="https://line.me/ti/p/@jeco-plus"
            target="_blank"
            class="contact-item"
          >
            <div class="contact-item__icon contact-item__icon--line">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19.365 9.863c.349 0 .632.283.632.632 0 .349-.283.632-.632.632H17.61v1.125h1.755c.349 0 .632.283.632.632 0 .349-.283.632-.632.632h-2.387c-.349 0-.632-.283-.632-.632V8.474c0-.349.283-.632.632-.632h2.387c.349 0 .632.283.632.632 0 .349-.283.632-.632.632H17.61v1.125h1.755z"
                />
              </svg>
            </div>
            <div class="contact-item__info">
              <span class="contact-item__title">LINE Official</span>
              <span class="contact-item__value">@jeco-plus</span>
            </div>
            <svg
              class="contact-item__arrow"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </a>
        </JCard>
      </div>
    </section>

    <!-- AI Capabilities -->
    <section class="ai-capabilities section">
      <h2 class="section-title">AI Assistant ช่วยอะไรได้บ้าง</h2>
      <div class="capability-list">
        <div class="capability-item">
          <div class="capability-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <span>แนะนำสินเชื่อที่เหมาะสม</span>
        </div>
        <div class="capability-item">
          <div class="capability-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 21h8M12 17v4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span>คำนวณค่างวดและดอกเบี้ย</span>
        </div>
        <div class="capability-item">
          <div class="capability-item__icon">
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
                stroke-linecap="round"
              />
              <path
                d="M12 17h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span>ตอบคำถามเกี่ยวกับบริการ</span>
        </div>
        <div class="capability-item">
          <div class="capability-item__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span>วิเคราะห์สถานะการเงิน</span>
        </div>
      </div>
    </section>

    <!-- App Info -->
    <section class="support__info">
      <p class="text-mini">JECO+ © 2025 J Fintech Co., Ltd.</p>
      <p class="text-mini">Powered by J Ventures AI Technology</p>
    </section>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import JHeader from "../components/layout/JHeader.vue";
import JCard from "../components/base/JCard.vue";

const chatContainer = ref(null);
const userInput = ref("");
const isTyping = ref(false);

const chatMessages = ref([
  {
    isUser: false,
    text: "สวัสดีค่ะ! ดิฉันคือ <strong>JECO+ AI Assistant</strong> พร้อมช่วยเหลือคุณเกี่ยวกับสินเชื่อและบริการต่างๆ ของ JECO+ ค่ะ 🙂<br><br>มีอะไรให้ช่วยไหมคะ?",
    time: formatTime(new Date()),
  },
]);

const quickActions = [
  {
    text: "สมัครสินเชื่อ",
    response:
      "คุณสามารถสมัครสินเชื่อได้หลายประเภท:\n\n• <strong>สินเชื่อส่วนบุคคล</strong> - วงเงิน 5,000 - 100,000 บาท ดอกเบี้ย 18-25% ต่อปี\n• <strong>KB Personal Loan</strong> - วงเงินสูงสุด 500,000 บาท ดอกเบี้ยต่ำสุด 15% (ร่วมกับ KB Kookmin Bank)\n• <strong>Pah Pay</strong> - สำหรับผู้ที่ไม่มีประวัติเครดิต ใช้ AI Credit Scoring\n\nต้องการให้ AI วิเคราะห์สินเชื่อที่เหมาะกับคุณไหมคะ?",
  },
  {
    text: "เช็คค่างวด",
    response:
      'เพื่อคำนวณค่างวดของคุณ กรุณาบอก:\n\n1. วงเงินที่ต้องการกู้ (บาท)\n2. ระยะเวลาผ่อน (เดือน)\n\nตัวอย่าง: "กู้ 50,000 บาท ผ่อน 12 เดือน"\n\nหรือคุณสามารถใช้เครื่องมือคำนวณค่างวดในหน้าสมัครสินเชื่อได้เลยค่ะ',
  },
  {
    text: "วิเคราะห์ Credit",
    response:
      "JECO+ ใช้ <strong>AI Credit Scoring</strong> ที่ทันสมัย สามารถประเมินความน่าเชื่อถือจากข้อมูลหลายแหล่ง:\n\n🤖 <strong>AI Model:</strong> Gradient Boosting + Neural Network\n📊 <strong>ข้อมูลที่ใช้:</strong> 42+ variables\n✅ <strong>ความแม่นยำ:</strong> 94.2%\n\nแม้คุณไม่มีประวัติเครดิตก็สามารถขอสินเชื่อได้ผ่าน <strong>Pah Pay</strong> ค่ะ\n\nต้องการให้ AI วิเคราะห์ Credit Score ของคุณไหมคะ?",
  },
  {
    text: "ติดต่อพนักงาน",
    response:
      "หากต้องการพูดคุยกับพนักงาน สามารถติดต่อได้ที่:\n\n📞 <strong>Call Center:</strong> 02-123-4567 (08:00-20:00)\n💬 <strong>LINE:</strong> @jeco-plus\n📧 <strong>Email:</strong> support@jeco-plus.co.th\n\nหรือต้องการให้ดิฉันช่วยเรื่องอื่นก่อนไหมคะ?",
  },
];

// AI Response logic
const aiResponses = {
  สมัคร:
    "คุณสนใจสมัครสินเชื่อประเภทไหนคะ?\n\n1. <strong>สินเชื่อส่วนบุคคล</strong> - เหมาะกับค่าใช้จ่ายทั่วไป\n2. <strong>KB Personal Loan</strong> - ดอกเบี้ยต่ำ วงเงินสูง\n3. <strong>Pah Pay</strong> - ไม่ต้องมีประวัติเครดิต\n4. <strong>สินเชื่อจำนำทะเบียนรถ</strong> - วงเงินสูงสุด 1 ล้านบาท\n\nหรือต้องการให้ AI แนะนำสินเชื่อที่เหมาะกับคุณไหมคะ?",
  ดอกเบี้ย:
    "อัตราดอกเบี้ยของ JECO+:\n\n• สินเชื่อส่วนบุคคล: 18-25% ต่อปี\n• KB Personal Loan: 15-22% ต่อปี\n• Pah Pay: 30-36% ต่อปี\n• สินเชื่อจำนำทะเบียน: 18-24% ต่อปี\n\nอัตราดอกเบี้ยขึ้นอยู่กับผลการพิจารณาและ Credit Score ของคุณค่ะ",
  ผ่อน: 'คุณต้องการคำนวณค่างวดใช่ไหมคะ?\n\nกรุณาบอกข้อมูล:\n• วงเงินที่ต้องการ (บาท)\n• ระยะเวลาผ่อน (เดือน)\n\nเช่น "กู้ 30000 ผ่อน 6 เดือน"',
  ai: "JECO+ ใช้เทคโนโลยี AI หลายรูปแบบ:\n\n🧠 <strong>AI Credit Scoring</strong>\n- วิเคราะห์ความน่าเชื่อถือจาก 42+ variables\n- ใช้ Machine Learning: Gradient Boosting + Neural Network\n- ความแม่นยำ 94.2%\n\n🤖 <strong>AI Assistant</strong> (ที่คุณกำลังคุยอยู่)\n- NLP สำหรับทำความเข้าใจคำถาม\n- ให้คำแนะนำเฉพาะบุคคล\n\n📊 <strong>AI Product Recommendation</strong>\n- แนะนำสินเชื่อที่เหมาะสม\n- วิเคราะห์พฤติกรรมการเงิน",
  jaymart:
    "JECO+ เป็นส่วนหนึ่งของ <strong>Jaymart Group</strong> ซึ่งประกอบด้วย:\n\n💰 <strong>Finance:</strong> J Fintech, KB J Capital\n📱 <strong>Technology:</strong> Jaymart Mobile, Synergy E\n🏪 <strong>Retail:</strong> Singer, JAS Mart\n☕ <strong>F&B:</strong> Casa Lapin, Suki Teenoi\n\nคุณสามารถใช้ JECO+ ชำระค่าบริการของบริษัทในเครือได้ทั้งหมดค่ะ",
  default:
    "ขอบคุณสำหรับข้อความค่ะ 🙂\n\nดิฉันสามารถช่วยคุณได้เกี่ยวกับ:\n• สมัครสินเชื่อ\n• คำนวณค่างวด\n• วิเคราะห์ Credit Score ด้วย AI\n• ข้อมูลผลิตภัณฑ์และบริการ\n\nกรุณาบอกรายละเอียดเพิ่มเติม หรือเลือกหัวข้อด้านบนได้เลยค่ะ",
};

function formatTime(date) {
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAIResponse(input) {
  const lowerInput = input.toLowerCase();

  // Calculate installment if format matches
  const loanMatch =
    input.match(/(\d+)\s*(บาท)?\s*ผ่อน\s*(\d+)/i) ||
    input.match(/กู้\s*(\d+)/i);
  if (loanMatch) {
    const amount = parseInt(loanMatch[1]);
    const months = loanMatch[3] ? parseInt(loanMatch[3]) : 12;
    const rate = 0.22 / 12; // 22% per year
    const payment =
      (amount * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);

    return `คำนวณค่างวดสำหรับคุณแล้วค่ะ:\n\n💰 <strong>วงเงินกู้:</strong> ${amount.toLocaleString()} บาท\n📅 <strong>ระยะเวลา:</strong> ${months} เดือน\n📊 <strong>อัตราดอกเบี้ย:</strong> 22% ต่อปี\n\n✅ <strong>ค่างวดโดยประมาณ: ${Math.round(payment).toLocaleString()} บาท/เดือน</strong>\n\n*อัตราดอกเบี้ยจริงอาจแตกต่างขึ้นอยู่กับผลการพิจารณา\n\nต้องการสมัครสินเชื่อเลยไหมคะ?`;
  }

  // Check keywords
  for (const [keyword, response] of Object.entries(aiResponses)) {
    if (keyword !== "default" && lowerInput.includes(keyword)) {
      return response;
    }
  }

  return aiResponses.default;
}

async function sendMessage() {
  if (!userInput.value.trim()) return;

  const text = userInput.value.trim();
  userInput.value = "";

  // Add user message
  chatMessages.value.push({
    isUser: true,
    text: text,
    time: formatTime(new Date()),
  });

  await scrollToBottom();

  // Show typing
  isTyping.value = true;
  await scrollToBottom();

  // Simulate AI thinking
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));

  isTyping.value = false;

  // Add AI response
  chatMessages.value.push({
    isUser: false,
    text: getAIResponse(text),
    time: formatTime(new Date()),
  });

  await scrollToBottom();
}

async function sendQuickAction(action) {
  chatMessages.value.push({
    isUser: true,
    text: action.text,
    time: formatTime(new Date()),
  });

  await scrollToBottom();

  isTyping.value = true;
  await scrollToBottom();

  await new Promise((r) => setTimeout(r, 800));

  isTyping.value = false;

  chatMessages.value.push({
    isUser: false,
    text: action.response,
    time: formatTime(new Date()),
  });

  await scrollToBottom();
}

async function scrollToBottom() {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-assistant__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--color-black) 0%, #2d2b2b 100%);
  color: var(--color-white);
  margin: calc(-1 * var(--space-md));
  margin-bottom: var(--space-md);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.ai-assistant__avatar {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-assistant__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  margin-bottom: 2px;
}

.ai-assistant__status {
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: var(--radius-full);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Chat Container */
.chat-container {
  height: 300px;
  overflow-y: auto;
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.chat-message {
  display: flex;
  gap: var(--space-sm);
  max-width: 85%;
}

.chat-message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-message--ai {
  align-self: flex-start;
}

.chat-message__avatar {
  width: 32px;
  height: 32px;
  background: var(--color-black);
  color: var(--color-white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message__bubble {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  line-height: var(--line-height-relaxed);
}

.chat-message--ai .chat-message__bubble {
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
}

.chat-message--user .chat-message__bubble {
  background: var(--color-red);
  color: var(--color-white);
}

.chat-message__time {
  display: block;
  font-size: 10px;
  opacity: 0.6;
  margin-top: var(--space-xs);
  text-align: right;
}

/* Typing indicator */
.typing {
  display: flex;
  gap: 4px;
  padding: var(--space-md) !important;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--color-gray-3);
  border-radius: var(--radius-full);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.quick-action {
  flex-shrink: 0;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-action:hover {
  background: var(--color-red);
  color: var(--color-white);
  border-color: var(--color-red);
}

/* Chat Input */
.chat-input {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-white);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--radius-full);
}

.chat-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-body);
  padding: var(--space-xs) var(--space-sm);
}

.chat-send {
  width: 44px;
  height: 44px;
  background: var(--color-red);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-send:disabled {
  background: var(--color-gray-3);
  cursor: not-allowed;
}

.chat-send:not(:disabled):hover {
  transform: scale(1.05);
}

/* Contact List */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  text-decoration: none;
  color: inherit;
}

.contact-item__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-white);
}

.contact-item__icon--phone {
  background: var(--color-red);
}

.contact-item__icon--line {
  background: #00b900;
}

.contact-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-item__title {
  font-weight: var(--font-weight-medium);
}

.contact-item__value {
  color: var(--color-gray-4);
  font-size: var(--font-size-small);
}

.contact-item__arrow {
  color: var(--color-gray-3);
}

/* AI Capabilities */
.capability-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.capability-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-gray-1);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
}

.capability-item__icon {
  width: 36px;
  height: 36px;
  background: var(--color-black);
  color: var(--color-white);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support__info {
  text-align: center;
  padding: var(--space-xl) 0;
  color: var(--color-gray-3);
}
</style>
