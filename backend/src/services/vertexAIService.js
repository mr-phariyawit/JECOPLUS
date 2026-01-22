import { getVertexAIClient } from '../config/vertexAI.js';
import vertexAIConfig from '../config/vertexAI.js';
import logger from '../utils/logger.js';

/**
 * Vertex AI Service
 * Connects to Google Vertex AI (Gemini models via GCP)
 */
class VertexAIService {
  constructor() {
    this.client = getVertexAIClient();
    this.model = vertexAIConfig.model;
    this.embeddingModel = vertexAIConfig.embeddingModel;
  }

  /**
   * Check if Vertex AI service is available
   */
  isAvailable() {
    return this.client !== null && vertexAIConfig.projectId !== undefined;
  }

  /**
   * Generate response using Vertex AI Gemini
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages in format [{role: 'user'|'assistant', content: string}]
   * @param {string} systemInstruction - System instructions
   * @param {object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<object>} Response with text and metadata
   */
  async generateResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured. Please set GCP_PROJECT_ID and GCP_LOCATION.');
    }

    try {
      const modelName = options.model || this.model;
      const model = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
      });

      // Convert conversation history to Vertex AI format
      // Vertex AI uses 'model' instead of 'assistant' for AI responses
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? vertexAIConfig.temperature,
          maxOutputTokens: options.maxTokens || vertexAIConfig.maxOutputTokens,
          topP: options.topP ?? 0.95,
          topK: options.topK ?? 40,
        },
      });

      logger.info(`Vertex AI request: model=${modelName}, history=${history.length} messages`);

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // Get usage metadata
      const usageMetadata = response.usageMetadata;

      logger.info(`Vertex AI response: ${text.substring(0, 100)}...`);

      return {
        text,
        metadata: {
          model: modelName,
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
          provider: 'vertex-ai',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Vertex AI error:', error);
      throw new Error(`Vertex AI error: ${error.message}`);
    }
  }

  /**
   * Generate embeddings using Vertex AI
   * @param {string} text - Text to embed
   * @param {object} options - Options (taskType, embeddingModel)
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(text, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured');
    }

    try {
      const embeddingModelName = options.embeddingModel || this.embeddingModel;
      
      // Use the embedding model
      const model = this.client.getGenerativeModel({
        model: embeddingModelName,
      });

      // Generate embedding
      const result = await model.embedContent({
        content: { parts: [{ text }] },
        taskType: options.taskType || 'RETRIEVAL_DOCUMENT',
      });

      // Extract embedding values
      const embedding = result.embedding?.values || [];

      if (embedding.length === 0) {
        throw new Error('Empty embedding returned from Vertex AI');
      }

      logger.debug(`Generated embedding: dimension=${embedding.length}`);

      return embedding;
    } catch (error) {
      logger.error('Vertex AI embedding error:', error);
      throw new Error(`Vertex AI embedding error: ${error.message}`);
    }
  }

  /**
   * Stream response (for real-time chat)
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {string} systemInstruction - System instructions
   * @param {object} options - Additional options
   * @returns {AsyncGenerator} Stream of text chunks
   */
  async *streamResponse(message, conversationHistory = [], systemInstruction = null, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Vertex AI client not configured');
    }

    try {
      const modelName = options.model || this.model;
      const model = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
      });

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history.length > 0 ? history : undefined,
        generationConfig: {
          temperature: options.temperature ?? vertexAIConfig.temperature,
          maxOutputTokens: options.maxTokens || vertexAIConfig.maxOutputTokens,
          topP: options.topP ?? 0.95,
          topK: options.topK ?? 40,
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
      logger.error('Vertex AI streaming error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new VertexAIService();
