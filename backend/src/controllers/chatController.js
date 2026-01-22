import { query } from '../config/database.js';
import { BadRequest, NotFound } from '../utils/errors.js';
import logger from '../utils/logger.js';
import * as chatService from '../services/chatService.js';

/**
 * Send message to AI
 * POST /api/v1/chat/messages
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId, provider, systemPrompt } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      throw BadRequest('Message is required');
    }

    const result = await chatService.sendMessage(userId, message.trim(), {
      conversationId,
      provider,
      systemPrompt,
    });

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation with messages
 * GET /api/v1/chat/conversations/:id
 */
export const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await chatService.getConversation(id, userId);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's conversations
 * GET /api/v1/chat/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const conversations = await chatService.getUserConversations(userId, {
      limit: Math.min(limit, 50), // Max 50
      offset,
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          limit,
          offset,
          hasMore: conversations.length === limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new conversation
 * POST /api/v1/chat/conversations
 */
export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, provider, systemPrompt } = req.body;

    const conversation = await chatService.getOrCreateConversation(userId, {
      provider,
      systemPrompt,
      title,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete conversation
 * DELETE /api/v1/chat/conversations/:id
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await chatService.deleteConversation(id, userId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendMessage,
  getConversation,
  getConversations,
  createConversation,
  deleteConversation,
};
