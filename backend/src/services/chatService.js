import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import logger from '../utils/logger.js';
import aiChatService from './aiChatService.js';
import ragService from './ragService.js';

/**
 * Chat Service
 * Handles conversation and message persistence, integrates with AI Chat Service
 */

/**
 * Create or get conversation
 * @param {string} userId - User ID
 * @param {object} options - Options (provider, systemPrompt, title)
 * @returns {Promise<object>} Conversation object
 */
export const getOrCreateConversation = async (userId, options = {}) => {
  const { conversationId, provider, systemPrompt, title } = options;

  // If conversationId provided, get existing conversation
  if (conversationId) {
    const result = await query(
      `SELECT * FROM conversations 
       WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }
    throw NotFound('Conversation not found');
  }

  // Create new conversation
  const newConversationId = uuidv4();
  const result = await query(
    `INSERT INTO conversations (id, user_id, title, provider, system_prompt)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      newConversationId,
      userId,
      title || null,
      provider || 'gemini',
      systemPrompt || null,
    ]
  );

  logger.info('New conversation created', { conversationId: newConversationId, userId });
  return result.rows[0];
};

/**
 * Get conversation with messages
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<object>} Conversation with messages
 */
export const getConversation = async (conversationId, userId) => {
  // Get conversation
  const convResult = await query(
    `SELECT * FROM conversations 
     WHERE id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (convResult.rows.length === 0) {
    throw NotFound('Conversation not found');
  }

  const conversation = convResult.rows[0];

  // Get messages
  const messagesResult = await query(
    `SELECT * FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return {
    ...conversation,
    messages: messagesResult.rows,
  };
};

/**
 * Get user's conversations
 * @param {string} userId - User ID
 * @param {object} options - Options (limit, offset)
 * @returns {Promise<Array>} List of conversations
 */
export const getUserConversations = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;

  const result = await query(
    `SELECT * FROM conversations 
     WHERE user_id = $1 
     ORDER BY last_message_at DESC NULLS LAST, created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Save message to database
 * @param {string} conversationId - Conversation ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Saved message
 */
export const saveMessage = async (conversationId, role, content, metadata = {}) => {
  const messageId = uuidv4();

  const result = await query(
    `INSERT INTO messages (
      id, conversation_id, role, content, provider, model, tokens_used, 
      response_time_ms, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
    RETURNING *`,
    [
      messageId,
      conversationId,
      role,
      content,
      metadata.provider || null,
      metadata.model || null,
      metadata.tokens || null,
      metadata.responseTime || null,
      JSON.stringify(metadata.context || {}),
    ]
  );

  return result.rows[0];
};

/**
 * Send message and get AI response
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {object} options - Options (conversationId, provider, systemPrompt)
 * @returns {Promise<object>} Response with AI text and metadata
 */
export const sendMessage = async (userId, message, options = {}) => {
  const startTime = Date.now();

  // Get or create conversation
  const conversation = await getOrCreateConversation(userId, {
    conversationId: options.conversationId,
    provider: options.provider,
    systemPrompt: options.systemPrompt,
  });

  // Save user message
  await saveMessage(conversation.id, 'user', message);

  // Get conversation history for context
  const historyResult = await query(
    `SELECT role, content FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC
     LIMIT 20`,
    [conversation.id]
  );

  const conversationHistory = historyResult.rows.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // RAG: Retrieve relevant context (if RAG is available)
  let enhancedSystemPrompt = options.systemPrompt || conversation.system_prompt;
  let ragContext = null;

  try {
    const isRAGAvailable = await ragService.isRAGAvailable();
    if (isRAGAvailable) {
      ragContext = await ragService.retrieveContext(message, userId, {
        entityTypes: ['product', 'loan', 'user_profile'],
        maxResults: 5,
        similarityThreshold: 0.7,
      });

      if (ragContext.count > 0) {
        enhancedSystemPrompt = ragService.buildEnhancedPrompt(
          enhancedSystemPrompt || aiChatService.systemPrompt,
          ragContext.formattedContext
        );
        logger.debug(`RAG context retrieved: ${ragContext.count} contexts`);
      }
    }
  } catch (error) {
    logger.warn('RAG context retrieval failed, continuing without context:', error);
    // Continue without RAG context (graceful degradation)
  }

  // Generate AI response
  const aiResponse = await aiChatService.generateResponse(message, conversationHistory, {
    provider: options.provider || conversation.provider,
    systemPrompt: enhancedSystemPrompt,
    conversationId: conversation.id,
    temperature: 0.7,
    maxTokens: 2048,
    mode: options.mode,
    context: options.context,
    userId: userId,
  });

  if (!aiResponse.success) {
    throw new Error(aiResponse.error || 'Failed to generate AI response');
  }

  const responseTime = Date.now() - startTime;

  // Save AI response
  await saveMessage(
    conversation.id,
    'assistant',
    aiResponse.data.text,
    {
      provider: aiResponse.data.provider,
      model: aiResponse.data.metadata?.model,
      tokens: aiResponse.data.metadata?.tokens,
      responseTime,
      context: ragContext ? {
        contextsCount: ragContext.count,
        contexts: ragContext.contexts,
      } : null,
    }
  );

  return {
    success: true,
    data: {
      text: aiResponse.data.text,
      conversationId: conversation.id,
      provider: aiResponse.data.provider,
      metadata: {
        ...aiResponse.data.metadata,
        responseTime,
      },
    },
  };
};

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId, userId) => {
  const result = await query(
    `DELETE FROM conversations 
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [conversationId, userId]
  );

  if (result.rows.length === 0) {
    throw NotFound('Conversation not found');
  }

  logger.info('Conversation deleted', { conversationId, userId });
};

export default {
  getOrCreateConversation,
  getConversation,
  getUserConversations,
  saveMessage,
  sendMessage,
  deleteConversation,
};
