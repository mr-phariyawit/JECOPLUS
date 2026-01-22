import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as geminiService from '../services/geminiService'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'jecoplus_chat_data'

export const useAIChatStore = defineStore('chat', () => {
  // State
  const isOpen = ref(false)
  const messages = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const conversationId = ref(null)
  const error = ref(null)
  const mode = ref('general')

  // Computed
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        messages.value = data.messages || []
        conversationId.value = data.conversationId || null
        mode.value = data.mode || 'general'
      }
    } catch (e) {
      console.error('[Chat] Load error:', e)
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: messages.value,
        conversationId: conversationId.value,
        mode: mode.value,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.error('[Chat] Save error:', e)
    }
  }

  // Auto-save
  watch([messages, conversationId, mode], saveToStorage, { deep: true })

  // Helpers
  const generateMessageId = () => 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const formatTime = (date) => date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  // Actions
  const openChat = (chatMode = 'general') => {
    mode.value = chatMode
    isOpen.value = true
    if (messages.value.length === 0) initializeChat()
  }

  const closeChat = () => { isOpen.value = false }
  const toggleChat = () => isOpen.value ? closeChat() : openChat()
  const setMode = (newMode) => { mode.value = newMode }

  const initializeChat = () => {
    const authStore = useAuthStore()
    const userName = authStore.fullName || 'คุณลูกค้า'
    messages.value = [{
      id: generateMessageId(),
      role: 'assistant',
      text: 'สวัสดีค่ะ คุณ' + userName + '\\n\\nดิฉันคือ JECO+ AI Assistant พร้อมช่วยเหลือคุณค่ะ\\n\\nมีอะไรให้ช่วยไหมคะ?',
      timestamp: new Date(),
      time: formatTime(new Date()),
    }]
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading.value) return

    const messageText = text.trim()

    // Add user message
    messages.value.push({
      id: generateMessageId(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      time: formatTime(new Date()),
    })

    isTyping.value = true
    isLoading.value = true
    error.value = null

    try {
      const response = await geminiService.sendMessage(messageText, {
        conversationId: conversationId.value,
        mode: mode.value,
        provider: 'gemini',
      })

      if (!response.success) {
        throw new Error(response.error || 'AI response failed')
      }

      // Add AI response
      messages.value.push({
        id: generateMessageId(),
        role: 'assistant',
        text: response.data.text || 'ไม่สามารถสร้างคำตอบได้',
        timestamp: new Date(),
        time: formatTime(new Date()),
        metadata: response.data.metadata || {},
      })

      // Update conversation ID
      if (response.data.conversationId) {
        conversationId.value = response.data.conversationId
      }

    } catch (err) {
      console.error('[Chat] Error:', err)
      error.value = err.message

      let errorText = 'เกิดข้อผิดพลาด'
      if (err.response?.status === 401) errorText = 'กรุณาเข้าสู่ระบบใหม่'
      else if (err.response?.status === 429) errorText = 'คำขอมากเกินไป กรุณารอสักครู่'
      else if (err.message.includes('Network')) errorText = 'ไม่สามารถเชื่อมต่อได้'

      messages.value.push({
        id: generateMessageId(),
        role: 'assistant',
        text: errorText + ' กรุณาลองใหม่ค่ะ',
        timestamp: new Date(),
        time: formatTime(new Date()),
        isError: true,
      })
    } finally {
      isTyping.value = false
      isLoading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
    conversationId.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEY)
    initializeChat()
  }

  // Initialize
  loadFromStorage()

  return {
    isOpen, messages, isLoading, isTyping, conversationId, error, mode,
    hasMessages, lastMessage,
    openChat, closeChat, toggleChat, sendMessage, clearChat, initializeChat, setMode,
  }
})
