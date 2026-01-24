# AI Chat Module - Bug Report & Issue Analysis

**Report Date:** 2026-01-22
**Analyzed by:** Claude AI
**Module Version:** 1.0.0
**Status:** Production Ready with Critical Issues

---

## Executive Summary

AI Chat module ของ JECO+ มีโครงสร้างที่ดีและ backend ที่แข็งแกร่ง แต่พบ **ปัญหาสำคัญหลายจุด** ที่ต้องแก้ไข โดยเฉพาะ:

1. **XSS Vulnerability** - ช่องโหว่ความปลอดภัยในการแสดงข้อความ
2. **Quick Actions ใช้ Response ที่ Hardcoded** - ไม่ได้เรียก AI จริง
3. **Chat History หายเมื่อ Refresh หน้า** - ไม่มี localStorage persistence
4. **Streaming Response ไม่ได้ใช้งาน** - Backend รองรับแต่ Frontend ไม่ได้ implement

---

## 1. Critical Issues (ต้องแก้ไขทันที)

### 1.1 XSS Vulnerability - ช่องโหว่ความปลอดภัย

**File:** `src/components/chat/AIChatWidget.vue:68`

```vue
<p v-html="message.text"></p>
```

**ปัญหา:**
- ใช้ `v-html` แสดง AI response โดยตรง
- หาก AI ตอบกลับด้วย HTML ที่มี script อาจถูก execute ได้
- ผู้ไม่ประสงค์ดีอาจ inject malicious HTML ผ่าน prompt injection

**ผลกระทบ:** HIGH - อาจนำไปสู่การขโมย session, token หรือข้อมูลส่วนตัว

**วิธีแก้ไข:**
```vue
<!-- Option 1: ใช้ text interpolation (แนะนำ) -->
<p>{{ message.text }}</p>

<!-- Option 2: ใช้ sanitizer library -->
<p v-html="sanitizeHtml(message.text)"></p>
```

---

### 1.2 Quick Actions ไม่ได้เรียก AI จริง

**File:** `src/stores/chat.js:191-220`

```javascript
const sendQuickAction = async (action) => {
  // ...
  await new Promise((resolve) => setTimeout(resolve, 800)) // Fake delay

  const aiMessage = {
    // ...
    text: action.response,  // ใช้ hardcoded response!
  }
  // ...
}
```

**ปัญหา:**
- Quick Actions (สมัครสินเชื่อ, เช็คค่างวด, วิเคราะห์ Credit, ติดต่อพนักงาน) ใช้ response ที่เขียนไว้ล่วงหน้า
- ไม่ได้เรียก AI จริง ทำให้ไม่สามารถให้คำตอบที่ personalized ตามข้อมูลผู้ใช้
- ผู้ใช้ได้รับคำตอบเดิมทุกครั้ง แม้สถานการณ์จะเปลี่ยนไป

**ผลกระทบ:** MEDIUM - ลด UX และความน่าเชื่อถือของ AI

**วิธีแก้ไข:**
```javascript
const sendQuickAction = async (action) => {
  // ควรเรียก sendMessage() แทน
  await sendMessage(action.text)
}
```

---

### 1.3 Chat History หายเมื่อ Refresh หน้า

**File:** `src/stores/chat.js:234-246`

```javascript
const loadHistory = async (convId) => {
  // TODO: Implement when backend is ready
  // ...
}
```

**ปัญหา:**
- ไม่มีการบันทึก chat history ลง localStorage
- เมื่อ refresh หน้า หรือปิดแล้วเปิดใหม่ ประวัติการสนทนาหายหมด
- conversationId ไม่ได้ถูกเก็บไว้

**ผลกระทบ:** HIGH - ทำให้ผู้ใช้ต้องเริ่มบทสนทนาใหม่ทุกครั้ง

**วิธีแก้ไข:**
```javascript
// ใช้ Pinia persist plugin หรือ manual localStorage
import { watch } from 'vue'

// บันทึกเมื่อ messages เปลี่ยน
watch(messages, (newMessages) => {
  localStorage.setItem('jeco_chat_messages', JSON.stringify(newMessages))
  localStorage.setItem('jeco_conversation_id', conversationId.value)
}, { deep: true })

// โหลดเมื่อ store ถูกสร้าง
const savedMessages = localStorage.getItem('jeco_chat_messages')
if (savedMessages) {
  messages.value = JSON.parse(savedMessages)
}
```

---

## 2. High Priority Issues (ควรแก้ไขเร็ว)

### 2.1 Streaming Response ไม่ได้ใช้งาน

**Backend รองรับ:** `backend/src/services/aiChatService.js:241-294`

```javascript
async *streamResponse(message, conversationHistory = [], options = {}) {
  // ✅ Implemented - รองรับ real-time streaming
}
```

**Frontend ไม่ได้ใช้:** `src/services/geminiService.js`

```javascript
export async function sendMessage(message, options = {}) {
  // ❌ ใช้แค่ Promise-based request
  const response = await api.post('/chat/messages', {...})
}
```

**ปัญหา:**
- AI ตอบยาวๆ ต้องรอจนกว่าจะเสร็จ
- UX ไม่ดี - ผู้ใช้เห็นแค่ typing indicator นาน

**วิธีแก้ไข:**
- Implement SSE (Server-Sent Events) หรือ WebSocket บน Frontend
- แสดงข้อความทีละคำขณะที่ AI กำลังตอบ

---

### 2.2 Unread Message Badge ไม่ทำงาน

**File:** `src/components/chat/AIChatFAB.vue:45`

```javascript
const hasUnread = computed(() => false) // TODO: Implement unread message tracking
```

**ปัญหา:**
- Badge แสดงข้อความใหม่ถูก hardcode เป็น `false`
- ผู้ใช้ไม่รู้ว่ามีข้อความใหม่

---

### 2.3 RAG Context อาจ Leak ข้อมูลข้ามผู้ใช้

**File:** `backend/src/services/embeddingService.js:116-119`

```javascript
// Add user-specific filtering if needed
if (userId && entityType === 'user_profile') {
  searchQuery += ` AND e.entity_id = $${paramIndex}`;
  params.push(userId);
}
```

**ปัญหา:**
- User filtering เฉพาะ `user_profile` entity เท่านั้น
- `product`, `loan`, `transaction` contexts อาจถูกดึงมาจากผู้ใช้อื่น

**ผลกระทบ:** MEDIUM - อาจเปิดเผยข้อมูลการทำธุรกรรมของผู้ใช้อื่น

---

### 2.4 Error Handling ไม่ละเอียดพอ

**File:** `src/stores/chat.js:166-180`

```javascript
} catch (err) {
  console.error('Chat error:', err)
  error.value = err.message || 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่'

  const errorMessage = {
    text: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ',
    // ...
  }
}
```

**ปัญหา:**
- Error message เหมือนกันหมดไม่ว่าจะเกิดอะไร
- ไม่แยกแยะระหว่าง network error, rate limit, API error

---

## 3. Medium Priority Issues

### 3.1 Conversation History จำกัด 20 Messages

**File:** `backend/src/services/chatService.js:164-170`

```javascript
const historyResult = await query(
  `SELECT role, content FROM messages
   WHERE conversation_id = $1
   ORDER BY created_at ASC
   LIMIT 20`,  // Hard limit
  [conversation.id]
);
```

**ปัญหา:**
- บทสนทนายาวๆ จะสูญเสีย context เก่า
- AI อาจลืมสิ่งที่คุยกันไว้ก่อนหน้า

---

### 3.2 ไม่มี Circuit Breaker Pattern

**ปัญหา:**
- หาก provider ล้มเหลวซ้ำๆ ระบบยังคงพยายามเรียกต่อ
- ไม่มีการ "หยุดพัก" provider ที่มีปัญหา

**ตามที่ระบุใน spec:** `specs/features/robust_ai_chat.md`

```
Implement CircuitBreaker pattern for providers
(if one fails repeatedly, skip it for x minutes)
```

---

### 3.3 Temperature/MaxTokens Hardcoded

**File:** `backend/src/services/chatService.js:208-209`

```javascript
const aiResponse = await aiChatService.generateResponse(message, conversationHistory, {
  // ...
  temperature: 0.7,   // Hardcoded
  maxTokens: 2048,    // Hardcoded
})
```

**ปัญหา:**
- ไม่สามารถปรับ creativity หรือ response length ได้
- ไม่ flexible สำหรับ use cases ต่างๆ

---

## 4. Low Priority Issues

### 4.1 No Retry Logic on Frontend

**File:** `src/services/geminiService.js`

- ไม่มี retry logic เมื่อ network error
- ไม่มี exponential backoff

### 4.2 Provider Fallback ไม่แจ้ง User

- เมื่อ primary provider ล้มเหลวและ fallback ไป provider อื่น
- User ไม่รู้ว่ากำลังใช้ backup provider

### 4.3 Chat Mode Naming ไม่ Consistent

**Frontend:** `'money-coach'`, `'loan-assistant'` (kebab-case)
**Backend:** `'money_coach'`, `'loan_assistant'` (snake_case)

---

## 5. Missing Features

| Feature | Status | Priority |
|---------|--------|----------|
| localStorage Persistence | ❌ ไม่มี | HIGH |
| Streaming Response Display | ❌ ไม่มี | HIGH |
| Auto-Retry (3x with backoff) | ❌ ไม่มี | MEDIUM |
| Connection Status Indicator | ❌ ไม่มี | MEDIUM |
| Unread Message Badge | ❌ Hardcoded false | LOW |
| Chat History Pagination | ❌ ไม่มี | LOW |
| Offline Mode (FAQ fallback) | ❌ ไม่มี | LOW |
| Circuit Breaker | ❌ ไม่มี | MEDIUM |
| Token Counting | ❌ ไม่มี | LOW |

---

## 6. What's Working Well

### Backend Strengths
- ✅ Multi-provider support (Vertex AI, Claude, Gemini)
- ✅ Smart provider fallback (Vertex AI > Claude > Gemini)
- ✅ RAG (Retrieval-Augmented Generation) integration
- ✅ Vector embeddings with caching (60-min TTL)
- ✅ Conversation persistence in database
- ✅ Money Coach & Loan Assistant specialized modes
- ✅ System prompt customization per mode

### Frontend Strengths
- ✅ Clean, responsive UI design
- ✅ Smooth animations (typing indicator, transitions)
- ✅ Quick actions for common queries
- ✅ Mobile-first responsive layout
- ✅ Accessible (ARIA labels)

---

## 7. Recommended Fix Priority

### Phase 1: Security & Critical (1-2 days)
1. **แก้ XSS Vulnerability** - ใช้ text interpolation แทน v-html
2. **แก้ Quick Actions** - เรียก AI จริงแทน hardcoded response
3. **เพิ่ม localStorage persistence** - เก็บ chat history

### Phase 2: UX Improvements (3-5 days)
4. **Implement Streaming Display** - แสดง response แบบ real-time
5. **แก้ RAG user filtering** - ป้องกัน data leak
6. **Error handling ละเอียดขึ้น** - แยกประเภท error

### Phase 3: Resilience (1 week)
7. **Auto-retry with backoff** - 3 retries
8. **Circuit Breaker** - skip failed providers
9. **Connection status indicator**
10. **Unread message badge**

---

## 8. Files Requiring Changes

| File | Changes Needed |
|------|----------------|
| `src/components/chat/AIChatWidget.vue` | Fix XSS (line 68) |
| `src/stores/chat.js` | localStorage persistence, fix quick actions |
| `src/services/geminiService.js` | Add retry logic, streaming support |
| `src/components/chat/AIChatFAB.vue` | Implement unread badge |
| `backend/src/services/embeddingService.js` | Fix user filtering |
| `backend/src/services/chatService.js` | Make limits configurable |
| `backend/src/services/aiChatService.js` | Add circuit breaker |

---

## 9. Test Cases Required

```javascript
// Security
- [ ] Verify HTML tags are escaped in chat messages
- [ ] Verify script tags don't execute in responses
- [ ] Test prompt injection attempts

// Functionality
- [ ] Quick actions call real AI
- [ ] Chat history persists after refresh
- [ ] Conversation continues from where left off

// Resilience
- [ ] Fallback works when primary provider fails
- [ ] Retry succeeds after temporary network error
- [ ] Error messages are user-friendly
```

---

## 10. Conclusion

AI Chat module มีพื้นฐานที่ดีมาก โดยเฉพาะ backend architecture ที่รองรับ multi-provider และ RAG
แต่มี **ช่องโหว่ความปลอดภัย (XSS)** ที่ต้องแก้ทันที และ **UX issues** หลายจุดที่ควรปรับปรุง

**สิ่งที่ต้องทำก่อน Production:**
1. ✅ Fix XSS vulnerability
2. ✅ Fix Quick Actions ให้เรียก AI จริง
3. ✅ Add localStorage persistence

**เวลาโดยประมาณ:** 1-2 สัปดาห์สำหรับแก้ไขทั้งหมด

---

*Report generated by Claude AI - JECO+ Development Team*
