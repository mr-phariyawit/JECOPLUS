import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Claude AI Service
 * Connects to Anthropic Claude API (supports Claude 3.5 Sonnet, Opus, etc.)
 */
class ClaudeService {
  constructor() {
    this.client = null;
    this.model = config.ai?.claude?.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.ai?.claude?.maxTokens || 4096;
    
    if (config.ai?.claude?.apiKey) {
      this.client = new Anthropic({
        apiKey: config.ai.claude.apiKey,
      });
    } else {
      logger.warn('Claude API key not configured. Claude service will not be available.');
    }
  }

  /**
   * Check if Claude service is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generate a response using Claude
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages in format [{role: 'user'|'assistant', content: string}]
   * @param {string} systemPrompt - System prompt/instructions
   * @param {object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<object>} Response with text and metadata
   */
  async generateResponse(message, conversationHistory = [], systemPrompt = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Claude API key not configured');
    }

    try {
      // Build messages array from conversation history
      const messages = [...conversationHistory];
      
      // Add current user message
      messages.push({
        role: 'user',
        content: message,
      });

      const requestOptions = {
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature ?? 0.7,
        messages,
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestOptions.system = systemPrompt;
      }

      logger.info(`Claude API request: model=${requestOptions.model}, messages=${messages.length}`);

      const response = await this.client.messages.create(requestOptions);

      const text = response.content[0].text;
      const usage = response.usage;

      logger.info(`Claude API response: ${text.substring(0, 100)}...`);

      return {
        text,
        metadata: {
          model: requestOptions.model,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens,
          provider: 'claude',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  /**
   * Stream response from Claude (for real-time chat)
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {string} systemPrompt - System prompt
   * @param {object} options - Additional options
   * @returns {AsyncGenerator} Stream of text chunks
   */
  async *streamResponse(message, conversationHistory = [], systemPrompt = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Claude API key not configured');
    }

    try {
      const messages = [...conversationHistory, { role: 'user', content: message }];

      const requestOptions = {
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature ?? 0.7,
        messages,
        stream: true,
      };

      if (systemPrompt) {
        requestOptions.system = systemPrompt;
      }

      const stream = await this.client.messages.stream(requestOptions);

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } catch (error) {
      logger.error('Claude streaming error:', error);
      throw new Error(`Claude streaming error: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new ClaudeService();
