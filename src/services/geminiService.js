import api from './api'

/**
 * AI Chat Service
 * Connects to backend API which routes to Claude or Gemini
 */

/**
 * Send message to AI
 * @param {string} message - User message
 * @param {object} options - Options (conversationId, provider, systemPrompt, etc.)
 * @returns {Promise<object>} Response object
 */
export async function sendMessage(message, options = {}) {
  try {
    const response = await api.post('/chat/messages', {
      message,
      conversationId: options.conversationId,
      provider: options.provider, // 'claude' or 'gemini'
      systemPrompt: options.systemPrompt,
    })
    
    return {
      success: true,
      data: {
        text: response.data.data.text,
        conversationId: response.data.data.conversationId,
        provider: response.data.data.provider,
        metadata: response.data.data.metadata,
      },
    }
  } catch (error) {
    console.error('AI Chat API error:', error)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get AI response',
    }
  }
}

/**
 * Get conversation history
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} Conversation data
 */
export async function getConversation(conversationId) {
  try {
    const response = await api.get(`/chat/conversations/${conversationId}`)
    return response.data
  } catch (error) {
    console.error('Failed to load conversation:', error)
    throw new Error(error.response?.data?.error?.message || 'Failed to load conversation')
  }
}

/**
 * Create new conversation
 * @param {string} title - Optional conversation title
 * @returns {Promise<object>} New conversation data
 */
export async function createConversation(title = null) {
  try {
    const response = await api.post('/chat/conversations', { title })
    return response.data
  } catch (error) {
    console.error('Failed to create conversation:', error)
    throw new Error(error.response?.data?.error?.message || 'Failed to create conversation')
  }
}

/**
 * List user's conversations
 * @param {object} options - Options (limit, offset)
 * @returns {Promise<object>} Conversations list
 */
export async function listConversations(options = {}) {
  try {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)
    if (options.offset) params.append('offset', options.offset)
    
    const response = await api.get(`/chat/conversations?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Failed to list conversations:', error)
    throw new Error(error.response?.data?.error?.message || 'Failed to list conversations')
  }
}

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object>} Success response
 */
export async function deleteConversation(conversationId) {
  try {
    const response = await api.delete(`/chat/conversations/${conversationId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    throw new Error(error.response?.data?.error?.message || 'Failed to delete conversation')
  }
}

/**
 * Get available AI providers
 * @returns {Promise<object>} Available providers
 */
export async function getProviders() {
  try {
    const response = await api.get('/chat/providers')
    return response.data
  } catch (error) {
    console.error('Failed to get providers:', error)
    throw new Error(error.response?.data?.error?.message || 'Failed to get providers')
  }
}

export default {
  sendMessage,
  getConversation,
  createConversation,
  listConversations,
  deleteConversation,
  getProviders,
}
