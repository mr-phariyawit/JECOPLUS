import claudeService from './claudeService.js';
import geminiService from './geminiService.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Unified AI Chat Service
 * Routes requests to Claude or Gemini based on configuration
 */
class AIChatService {
  constructor() {
    this.defaultProvider = config.ai?.defaultProvider || 'gemini';
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Build system prompt for JECO+ AI Assistant
   */
  buildSystemPrompt() {
    return `You are JECO+ AI Assistant, a helpful financial advisor for Thai users.
Your role is to:
1. Help users with loan applications, product information, and account queries
2. Provide personalized financial guidance (non-advisory)
3. Answer questions about JECO+ products and services
4. Assist with navigation and general inquiries

Rules:
- Always respond in Thai language
- Be friendly, professional, and helpful
- Never provide investment advice
- Focus on budgeting, savings, and loan products
- If you don't know something, admit it and offer to help find the answer
- Use clear, simple language suitable for all users

Available Products:
- Personal loans (สินเชื่อส่วนบุคคล)
- KB Personal Loan
- Pah Pay
- Vehicle title loans (สินเชื่อจำนำทะเบียนรถ)

Remember: You are here to help users make informed decisions about their finances.`;
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const providers = [];
    if (claudeService.isAvailable()) {
      providers.push('claude');
    }
    if (geminiService.isAvailable()) {
      providers.push('gemini');
    }
    return providers;
  }

  /**
   * Select provider (with fallback logic)
   * @param {string} preferredProvider - Preferred provider ('claude' or 'gemini')
   * @returns {string} Selected provider
   */
  selectProvider(preferredProvider = null) {
    const provider = preferredProvider || this.defaultProvider;
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('No AI providers are configured. Please set ANTHROPIC_API_KEY or GEMINI_API_KEY.');
    }

    // If preferred provider is available, use it
    if (available.includes(provider)) {
      return provider;
    }

    // Otherwise, use the first available provider
    logger.warn(`Provider ${provider} not available, using ${available[0]} instead`);
    return available[0];
  }

  /**
   * Generate AI response
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {object} options - Options (provider, userId, conversationId, etc.)
   * @returns {Promise<object>} Response with text and metadata
   */
  async generateResponse(message, conversationHistory = [], options = {}) {
    const provider = this.selectProvider(options.provider);
    const systemPrompt = options.systemPrompt || this.systemPrompt;

    logger.info(`Generating response with ${provider} for message: ${message.substring(0, 50)}...`);

    try {
      let response;

      if (provider === 'claude') {
        response = await claudeService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'gemini') {
        response = await geminiService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      return {
        success: true,
        data: {
          text: response.text,
          provider,
          conversationId: options.conversationId,
          metadata: response.metadata,
        },
      };
    } catch (error) {
      logger.error(`AI Chat error (${provider}):`, error);
      return {
        success: false,
        error: error.message || 'Failed to generate AI response',
        provider,
      };
    }
  }

  /**
   * Stream AI response (for real-time chat)
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {object} options - Options
   * @returns {AsyncGenerator} Stream of text chunks
   */
  async *streamResponse(message, conversationHistory = [], options = {}) {
    const provider = this.selectProvider(options.provider);
    const systemPrompt = options.systemPrompt || this.systemPrompt;

    try {
      if (provider === 'claude') {
        yield* claudeService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'gemini') {
        yield* geminiService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`AI Chat streaming error (${provider}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AIChatService();
