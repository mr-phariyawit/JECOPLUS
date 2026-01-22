import claudeService from './claudeService.js';
import geminiService from './geminiService.js';
import vertexAIService from './vertexAIService.js';
import moneyCoachService from './moneyCoachService.js';
import loanAssistantService from './loanAssistantService.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Unified AI Chat Service
 * Routes requests to Vertex AI, Claude, or Gemini based on configuration
 * and integrates Money Coach / Loan Assistant capabilities.
 */
class AIChatService {
  constructor() {
    // Prioritize Vertex AI if available, otherwise use configured default
    this.defaultProvider = config.ai?.defaultProvider || 'vertex-ai';
    this.baseSystemPrompt = this.buildBaseSystemPrompt();
  }

  /**
   * Build base system prompt for JECO+ AI Assistant
   */
  buildBaseSystemPrompt() {
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
   * Build contextual system prompt based on mode and updated data
   * @param {string} mode - 'general', 'money_coach', 'loan_assistant'
   * @param {string} userId - User ID
   * @param {object} context - Additional context parameters (e.g., from charts)
   */
  async buildContextualSystemPrompt(mode, userId, context = {}) {
    try {
      if (mode === 'money_coach') {
        // If we have direct context (charts), use it to override or update profile temporarily
        let profile = null;
        if (userId) {
          // Fetch existing profile
          try {
             const analysis = await moneyCoachService.analyzeFinancialSituation(userId);
             profile = analysis.profile;
          } catch (e) {
            logger.warn(`Could not fetch financial profile for user ${userId}: ${e.message}`);
          }
        }
        
        // Merge chart context into profile if provided
        if (context) {
            profile = { ...profile, ...context };
        }

        return moneyCoachService.buildSystemPrompt(profile);
      } 
      
      if (mode === 'loan_assistant') {
        let userLoans = [];
        let creditScore = null;

        if (userId) {
          try {
            userLoans = await loanAssistantService.getUserLoans(userId);
            // We could also fetch credit score here if needed, 
            // but LoanAssistantService.buildSystemPrompt handles explicit score passing
          } catch (e) {
             logger.warn(`Could not fetch loans for user ${userId}: ${e.message}`);
          }
        }

        return loanAssistantService.buildSystemPrompt(userLoans, context?.creditScore || null);
      }

      // Default General Mode
      let prompt = this.baseSystemPrompt;
      if (context && Object.keys(context).length > 0) {
        prompt += `\n\nCurrent Context:\n${JSON.stringify(context, null, 2)}`;
      }
      return prompt;

    } catch (error) {
      logger.error('Error building contextual prompt:', error);
      return this.baseSystemPrompt;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const providers = [];
    // Check Vertex AI first (preferred)
    if (vertexAIService.isAvailable()) {
      providers.push('vertex-ai');
    }
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
   * @param {string} preferredProvider - Preferred provider ('vertex-ai', 'claude', or 'gemini')
   * @returns {string} Selected provider
   */
  selectProvider(preferredProvider = null) {
    const provider = preferredProvider || this.defaultProvider;
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('No AI providers are configured. Please set GCP_PROJECT_ID, ANTHROPIC_API_KEY, or GEMINI_API_KEY.');
    }

    // Prefer Vertex AI if available and no specific provider requested
    if (!preferredProvider && available.includes('vertex-ai')) {
      return 'vertex-ai';
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
    
    let systemPrompt = options.systemPrompt;
    if (!systemPrompt) {
      systemPrompt = await this.buildContextualSystemPrompt(
        options.mode, 
        options.userId, 
        options.context
      );
    }

    logger.info(`Generating response with ${provider} for message: ${message.substring(0, 50)}... (Mode: ${options.mode || 'general'})`);

    try {
      let response;

      if (provider === 'vertex-ai') {
        response = await vertexAIService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'claude') {
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
    
    let systemPrompt = options.systemPrompt;
    if (!systemPrompt) {
      systemPrompt = await this.buildContextualSystemPrompt(
        options.mode, 
        options.userId, 
        options.context
      );
    }

    try {
      if (provider === 'vertex-ai') {
        yield* vertexAIService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'claude') {
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
