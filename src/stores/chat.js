import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import * as geminiService from '../services/geminiService'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'jecoplus_chat_data'
const MAX_RETRIES = 3
const BASE_DELAY = 1000 // 1 second

/**
 * AI Chat Store with Auto-Retry and Connection Monitoring
 * Features:
 * - Auto-retry with exponential backoff (3 retries)
 * - localStorage persistence
 * - Connection status monitoring
 * - Structured error handling
 * - Retry queue for failed messages
 */
export const useAIChatStore = defineStore('chat', () => {
  // ========== State ==========
  const isOpen = ref(false)
  const messages = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const conversationId = ref(null)
  const error = ref(null)
  const mode = ref('general')
  const context = ref({})

  // Connection monitoring
  const isOnline = ref(navigator.onLine)
  const connectionStatus = ref('online') // 'online' | 'offline' | 'unstable'
  const lastSuccessfulRequest = ref(Date.now())

  // Retry queue
  const retryQueue = ref([])
  const isRetrying = ref(false)

  // ========== Computed ==========
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])
  const hasFailedMessages = computed(() => retryQueue.value.length > 0)
  const isConnected = computed(() => isOnline.value && connectionStatus.value !== 'offline')

  // ========== Connection Monitoring ==========
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    connectionStatus.value = navigator.onLine ? 'online' : 'offline'

    if (navigator.onLine && retryQueue.value.length > 0) {
      // Auto-retry failed messages when back online
      console.log('[Chat] Back online, retrying failed messages...')
      processRetryQueue()
    }
  }

  // Listen to browser online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  // ========== localStorage Persistence ==========
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        messages.value = data.messages || []
        conversationId.value = data.conversationId || null
        mode.value = data.mode || 'general'
        // Context is transient, don't load from storage usually, or maybe yes? 
        // Let's keep context transient for now as it depends on current page state.
        console.log('[Chat] Loaded from localStorage:', messages.value.length, 'messages')
      }
    } catch (e) {
      console.error('[Chat] Load error:', e)
    }
  }

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

  // Auto-save when messages change
  watch([messages, conversationId, mode], saveToStorage, { deep: true })

  // ========== Helpers ==========
  const generateMessageId = () => 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const formatTime = (date) => date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  /**
   * Classify error from backend response
   */
  const classifyError = (err) => {
    if (err.response?.data?.error?.code) {
      return err.response.data.error.code
    }

    const status = err.response?.status
    const message = err.message?.toLowerCase() || ''

    if (status === 429 || message.includes('rate limit')) return 'RATE_LIMIT'
    if (status === 401 || status === 403) return 'AUTH_ERROR'
    if (status === 503 || message.includes('unavailable')) return 'SERVICE_UNAVAILABLE'
    if (message.includes('network') || message.includes('timeout')) return 'NETWORK_ERROR'

    return 'AI_PROVIDER_ERROR'
  }

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'RATE_LIMIT': 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่ค่ะ',
      'CONTEXT_LIMIT': 'ข้อความยาวเกินไป กรุณาลองใช้ข้อความสั้นลงค่ะ',
      'NETWORK_ERROR': 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตค่ะ',
      'AUTH_ERROR': 'กรุณาเข้าสู่ระบบใหม่ค่ะ',
      'SERVICE_UNAVAILABLE': 'บริการไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ในอีกสักครู่ค่ะ',
      'AI_PROVIDER_ERROR': 'เกิดข้อผิดพลาดจาก AI กรุณาลองใหม่ค่ะ',
    }

    return errorMessages[errorCode] || 'เกิดข้อผิดพลาด กรุณาลองใหม่ค่ะ'
  }

  // ========== Auto-Retry Logic ==========
  /**
   * Send message with auto-retry (exponential backoff)
   */
  const sendMessageWithRetry = async (text, attempt = 1) => {
    try {
      console.log(`[Chat] Sending message (attempt ${attempt}/${MAX_RETRIES})`)

      const response = await geminiService.sendMessage(text, {
        conversationId: conversationId.value,
        mode: mode.value,
        context: context.value, // Pass context here
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'AI response failed')
      }

      // Success!
      lastSuccessfulRequest.value = Date.now()
      connectionStatus.value = 'online'

      return response

    } catch (err) {
      const errorCode = classifyError(err)
      console.error(`[Chat] Attempt ${attempt} failed (${errorCode}):`, err.message)

      // If this is the last attempt, throw error
      if (attempt >= MAX_RETRIES) {
        throw err
      }

      // Calculate exponential backoff delay
      const delay = BASE_DELAY * Math.pow(2, attempt - 1)
      console.log(`[Chat] Retrying in ${delay}ms...`)

      // Check if we should retry (don't retry AUTH_ERROR or CONTEXT_LIMIT)
      if (errorCode === 'AUTH_ERROR' || errorCode === 'CONTEXT_LIMIT') {
        throw err
      }

      // Wait before retry
      await sleep(delay)

      // Retry
      return sendMessageWithRetry(text, attempt + 1)
    }
  }

  /**
   * Add failed message to retry queue
   */
  const addToRetryQueue = (messageText) => {
    retryQueue.value.push({
      text: messageText,
      timestamp: Date.now(),
      retries: 0,
    })
  }

  /**
   * Process retry queue
   */
  const processRetryQueue = async () => {
    if (isRetrying.value || retryQueue.value.length === 0) return

    isRetrying.value = true

    while (retryQueue.value.length > 0) {
      const item = retryQueue.value[0]

      try {
        await sendMessage(item.text)
        // Success - remove from queue
        retryQueue.value.shift()
      } catch (err) {
        console.error('[Chat] Retry failed:', err)
        // Keep in queue but increment retry count
        item.retries++

        if (item.retries >= MAX_RETRIES) {
          // Max retries reached, remove from queue
          retryQueue.value.shift()
        } else {
          // Stop processing for now
          break
        }
      }
    }

    isRetrying.value = false
  }

  // ========== Actions ==========
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
      text: `สวัสดีค่ะ คุณ${userName}\n\nดิฉันคือ JECO+ AI Assistant พร้อมช่วยเหลือคุณค่ะ\n\nมีอะไรให้ช่วยไหมคะ?`,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }]
  }

  /**
   * Send message (with auto-retry)
   */
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading.value) return

    const messageText = text.trim()

    // Check connection
    if (!isOnline.value) {
      error.value = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต'
      addToRetryQueue(messageText)

      messages.value.push({
        id: generateMessageId(),
        role: 'assistant',
        text: 'ไม่สามารถเชื่อมต่อได้ในขณะนี้ ข้อความของคุณจะถูกส่งอีกครั้งเมื่อกลับมาออนไลน์ค่ะ',
        timestamp: new Date(),
        time: formatTime(new Date()),
        isError: true,
      })

      return
    }

    // Add user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      time: formatTime(new Date()),
    }
    messages.value.push(userMessage)

    isTyping.value = true
    isLoading.value = true
    error.value = null

    try {
      // Send with auto-retry
      const response = await sendMessageWithRetry(messageText)

      // Add AI response
      const aiMessage = {
        id: generateMessageId(),
        role: 'assistant',
        text: response.data.text || 'ไม่สามารถสร้างคำตอบได้',
        timestamp: new Date(),
        time: formatTime(new Date()),
        metadata: response.data.metadata || {},
      }

      // Show fallback indicator if fallback occurred
      if (response.data.metadata?.fallbackOccurred) {
        aiMessage.fallbackInfo = {
          provider: response.data.provider,
          attemptCount: response.data.metadata.attemptCount,
        }
        console.log(`[Chat] ✅ Response from ${response.data.provider} (fallback occurred)`)
      }

      messages.value.push(aiMessage)

      // Update conversation ID
      if (response.data.conversationId) {
        conversationId.value = response.data.conversationId
      }

    } catch (err) {
      const errorCode = classifyError(err)
      const errorMessage = getErrorMessage(errorCode)

      console.error(`[Chat] Final error (${errorCode}):`, err)
      error.value = errorCode

      // Check if we should add to retry queue
      if (errorCode === 'NETWORK_ERROR' || errorCode === 'SERVICE_UNAVAILABLE') {
        addToRetryQueue(messageText)
        messages.value.push({
          id: generateMessageId(),
          role: 'assistant',
          text: errorMessage + '\n\nข้อความของคุณจะถูกลองส่งอีกครั้งอัตโนมัติค่ะ',
          timestamp: new Date(),
          time: formatTime(new Date()),
          isError: true,
          errorCode,
        })
      } else {
        // Don't retry for AUTH_ERROR, CONTEXT_LIMIT, etc.
        messages.value.push({
          id: generateMessageId(),
          role: 'assistant',
          text: errorMessage,
          timestamp: new Date(),
          time: formatTime(new Date()),
          isError: true,
          errorCode,
        })
      }

      // Update connection status
      if (errorCode === 'NETWORK_ERROR') {
        connectionStatus.value = 'unstable'
      }

    } finally {
      isTyping.value = false
      isLoading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
    conversationId.value = null
    error.value = null
    retryQueue.value = []
    localStorage.removeItem(STORAGE_KEY)
    initializeChat()
  }

  // ========== Initialize ==========
  loadFromStorage()

  return {
    // State
    isOpen,
    messages,
    isLoading,
    isTyping,
    conversationId,
    error,
    mode,
    isOnline,
    connectionStatus,
    retryQueue,
    isRetrying,

    // Computed
    hasMessages,
    lastMessage,
    hasFailedMessages,
    isConnected,

    // Actions
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    clearChat,
    initializeChat,
    setMode,
    setContext: (ctx) => { context.value = ctx },
    processRetryQueue,
  }
})
