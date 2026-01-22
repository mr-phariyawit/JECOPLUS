import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as geminiService from '../services/geminiService'
import { useAuthStore } from './auth'

export const useAIChatStore = defineStore('chat', () => {
  // State
  const isOpen = ref(false)
  const messages = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const conversationId = ref(null)
  const error = ref(null)
  const mode = ref('general') // 'general', 'money-coach', 'loan-assistant'

  // Quick actions
  const quickActions = ref([
    {
      text: 'สมัครสินเชื่อ',
      response:
        'คุณสามารถสมัครสินเชื่อได้หลายประเภท:\n\n• <strong>สินเชื่อส่วนบุคคล</strong> - วงเงิน 5,000 - 100,000 บาท ดอกเบี้ย 18-25% ต่อปี\n• <strong>KB Personal Loan</strong> - วงเงินสูงสุด 500,000 บาท ดอกเบี้ยต่ำสุด 15% (ร่วมกับ KB Kookmin Bank)\n• <strong>Pah Pay</strong> - สำหรับผู้ที่ไม่มีประวัติเครดิต ใช้ AI Credit Scoring\n\nต้องการให้ AI วิเคราะห์สินเชื่อที่เหมาะกับคุณไหมคะ?',
    },
    {
      text: 'เช็คค่างวด',
      response:
        'เพื่อคำนวณค่างวดของคุณ กรุณาบอก:\n\n1. วงเงินที่ต้องการกู้ (บาท)\n2. ระยะเวลาผ่อน (เดือน)\n\nตัวอย่าง: "กู้ 50,000 บาท ผ่อน 12 เดือน"\n\nหรือคุณสามารถใช้เครื่องมือคำนวณค่างวดในหน้าสมัครสินเชื่อได้เลยค่ะ',
    },
    {
      text: 'วิเคราะห์ Credit',
      response:
        'JECO+ ใช้ <strong>AI Credit Scoring</strong> ที่ทันสมัย สามารถประเมินความน่าเชื่อถือจากข้อมูลหลายแหล่ง:\n\n🤖 <strong>AI Model:</strong> Gradient Boosting + Neural Network\n📊 <strong>ข้อมูลที่ใช้:</strong> 42+ variables\n✅ <strong>ความแม่นยำ:</strong> 94.2%\n\nแม้คุณไม่มีประวัติเครดิตก็สามารถขอสินเชื่อได้ผ่าน <strong>Pah Pay</strong> ค่ะ\n\nต้องการให้ AI วิเคราะห์ Credit Score ของคุณไหมคะ?',
    },
    {
      text: 'ติดต่อพนักงาน',
      response:
        'หากต้องการพูดคุยกับพนักงาน สามารถติดต่อได้ที่:\n\n📞 <strong>Call Center:</strong> 02-123-4567 (08:00-20:00)\n💬 <strong>LINE:</strong> @jeco-plus\n📧 <strong>Email:</strong> support@jeco-plus.co.th\n\nหรือต้องการให้ดิฉันช่วยเรื่องอื่นก่อนไหมคะ?',
    },
  ])

  // Getters
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])

  // Actions

  /**
   * Open chat widget
   * @param {string} chatMode - Chat mode: 'general', 'money-coach', 'loan-assistant'
   */
  const openChat = (chatMode = 'general') => {
    mode.value = chatMode
    isOpen.value = true
    // Initialize with welcome message if empty
    if (messages.value.length === 0) {
      initializeChat()
    }
  }

  /**
   * Set chat mode
   * @param {string} newMode - New chat mode
   */
  const setMode = (newMode) => {
    mode.value = newMode
  }

  /**
   * Close chat widget
   */
  const closeChat = () => {
    isOpen.value = false
  }

  /**
   * Toggle chat widget
   */
  const toggleChat = () => {
    if (isOpen.value) {
      closeChat()
    } else {
      openChat()
    }
  }

  /**
   * Initialize chat with welcome message
   */
  const initializeChat = () => {
    const authStore = useAuthStore()
    const userName = authStore.fullName || 'คุณลูกค้า'
    
    const welcomeMessage = {
      id: generateMessageId(),
      role: 'assistant',
      text: `สวัสดีค่ะ! คุณ${userName}<br><br>ดิฉันคือ <strong>JECO+ AI Assistant</strong> พร้อมช่วยเหลือคุณเกี่ยวกับสินเชื่อและบริการต่างๆ ของ JECO+ ค่ะ 🙂<br><br>มีอะไรให้ช่วยไหมคะ?`,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }

    messages.value = [welcomeMessage]
  }

  /**
   * Send a message
   * @param {string} text - Message text
   */
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading.value) return

    const messageText = text.trim()

    // Add user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }

    messages.value.push(userMessage)

    // Show typing indicator
    isTyping.value = true
    isLoading.value = true
    error.value = null

    try {
      // Get AI response via service based on mode
      let response;
      
      // General chat
      response = await geminiService.sendMessage(messageText, {
        conversationId: conversationId.value,
        userId: useAuthStore().user?.id,
        mode: mode.value,
      });

      // Handle response (normalize different response formats)
      let responseData;
      if (response.success) {
        responseData = response.data;
      } else if (response.data) {
        // Money coach/loan assistant format
        responseData = response.data;
      } else {
        throw new Error(response.error || 'Failed to get response');
      }

      const aiMessage = {
        id: generateMessageId(),
        role: 'assistant',
        text: responseData.text || responseData.data?.text || 'ไม่สามารถสร้างคำตอบได้',
        timestamp: new Date(),
        time: formatTime(new Date()),
        metadata: responseData.metadata || responseData.data?.metadata || {},
      }

      messages.value.push(aiMessage)

      // Update conversation ID if provided
      const convId = responseData.conversationId || responseData.data?.conversationId;
      if (convId) {
        conversationId.value = convId
      }
    } catch (err) {
      console.error('Chat error:', err)
      error.value = err.message || 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่'

      // Add error message
      const errorMessage = {
        id: generateMessageId(),
        role: 'assistant',
        text: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ',
        timestamp: new Date(),
        time: formatTime(new Date()),
        isError: true,
      }

      messages.value.push(errorMessage)
    } finally {
      isTyping.value = false
      isLoading.value = false
    }
  }

  /**
   * Send quick action
   * @param {object} action - Quick action object
   */
  const sendQuickAction = async (action) => {
    // Add user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      text: action.text,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }

    messages.value.push(userMessage)

    // Show typing
    isTyping.value = true

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Add response
    const aiMessage = {
      id: generateMessageId(),
      role: 'assistant',
      text: action.response,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }

    messages.value.push(aiMessage)
    isTyping.value = false
  }

  /**
   * Clear chat history
   */
  const clearChat = () => {
    messages.value = []
    conversationId.value = null
    initializeChat()
  }

  /**
   * Load chat history (for future implementation)
   */
  const loadHistory = async (convId) => {
    // TODO: Implement when backend is ready
    isLoading.value = true
    try {
      // const history = await chatService.getConversation(convId)
      // messages.value = history.messages
      // conversationId.value = convId
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Helper functions
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    // State
    isOpen,
    messages,
    isLoading,
    isTyping,
    conversationId,
    error,
    quickActions,
    mode,

    // Getters
    hasMessages,
    lastMessage,

    // Actions
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    sendQuickAction,
    clearChat,
    loadHistory,
    initializeChat,
    setMode,
  }
})
