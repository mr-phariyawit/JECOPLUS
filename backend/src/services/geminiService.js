import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Gemini AI Service
 * Connects to Google Gemini API (supports Gemini Ultra, Pro, etc.)
 * Optimized for accuracy and consistency
 */
class GeminiService {
  constructor() {
    this.client = null;
    this.model = config.ai?.gemini?.model || 'gemini-2.0-flash';

    if (config.ai?.gemini?.apiKey) {
      this.client = new GoogleGenerativeAI(config.ai.gemini.apiKey);
    } else {
      logger.warn('Gemini API key not configured. Gemini service will not be available.');
    }
  }

  /**
   * Optimal settings for JECO+ AI Chat
   * Tuned for accuracy, consistency, and safety
   */
  static OPTIMAL_SETTINGS = {
    // Model selection
    model: 'gemini-2.0-flash', // or 'gemini-1.5-pro' for better quality

    // Generation config (optimized for accuracy)
    temperature: 0.3,      // Low temperature = more deterministic, accurate responses
    topP: 0.8,             // Reduced from 0.95 = less randomness
    topK: 40,              // Limit token selection pool
    maxOutputTokens: 2048, // Sufficient for most responses

    // Safety settings (strict enforcement)
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }

  /**
   * Check if Gemini service is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generate a response using Gemini
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages in format [{role: 'user'|'model', content: string}]
   * @param {string} systemInstruction - System instructions
   * @param {object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<object>} Response with text and metadata
   */
  async generateResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const modelName = options.model || GeminiService.OPTIMAL_SETTINGS.model;
      const genModel = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
        safetySettings: GeminiService.OPTIMAL_SETTINGS.safetySettings,
      });

      // Build chat history for Gemini
      // Gemini uses 'model' instead of 'assistant' for AI responses
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Start chat session with optimized settings
      const chat = genModel.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? GeminiService.OPTIMAL_SETTINGS.temperature,
          maxOutputTokens: options.maxTokens || GeminiService.OPTIMAL_SETTINGS.maxOutputTokens,
          topP: options.topP ?? GeminiService.OPTIMAL_SETTINGS.topP,
          topK: options.topK ?? GeminiService.OPTIMAL_SETTINGS.topK,
        },
      });

      logger.info(`Gemini API request: model=${modelName}, temp=${options.temperature ?? GeminiService.OPTIMAL_SETTINGS.temperature}, history=${history.length} messages`);

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // Get usage metadata if available (property, not method in newer SDK)
      const usageMetadata = response.usageMetadata;

      logger.info(`Gemini API response: ${text.substring(0, 100)}...`);

      return {
        text,
        metadata: {
          model: modelName,
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
          provider: 'gemini',
          timestamp: new Date().toISOString(),
          settings: {
            temperature: options.temperature ?? GeminiService.OPTIMAL_SETTINGS.temperature,
            topP: options.topP ?? GeminiService.OPTIMAL_SETTINGS.topP,
            topK: options.topK ?? GeminiService.OPTIMAL_SETTINGS.topK,
          },
        },
      };
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Stream response from Gemini (for real-time chat)
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {string} systemInstruction - System instructions
   * @param {object} options - Additional options
   * @returns {AsyncGenerator} Stream of text chunks
   */
  async *streamResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const modelName = options.model || GeminiService.OPTIMAL_SETTINGS.model;
      const genModel = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
        safetySettings: GeminiService.OPTIMAL_SETTINGS.safetySettings,
      });

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = genModel.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? GeminiService.OPTIMAL_SETTINGS.temperature,
          maxOutputTokens: options.maxTokens || GeminiService.OPTIMAL_SETTINGS.maxOutputTokens,
          topP: options.topP ?? GeminiService.OPTIMAL_SETTINGS.topP,
          topK: options.topK ?? GeminiService.OPTIMAL_SETTINGS.topK,
        },
      });

      const result = await chat.sendMessageStream(message);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      logger.error('Gemini streaming error:', error);
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new GeminiService();
