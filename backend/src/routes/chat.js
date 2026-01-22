import express from 'express';
import { authenticate } from '../middleware/auth.js';
import chatController from '../controllers/chatController.js';
import { validate } from '../middleware/validator.js';
import Joi from 'joi';

const router = express.Router();

// ⚠️⚠️⚠️ SECURITY DISABLED FOR TESTING - DO NOT USE IN PRODUCTION ⚠️⚠️⚠️
// All routes require authentication
// router.use(authenticate); // TEMPORARILY DISABLED
// ⚠️⚠️⚠️ RE-ENABLE AUTHENTICATION BEFORE DEPLOYING ⚠️⚠️⚠️

// Validation schemas
const sendMessageSchema = Joi.object({
  message: Joi.string().required().min(1).max(2000).messages({
    'string.empty': 'กรุณากรอกข้อความ',
    'string.max': 'ข้อความยาวเกินไป (สูงสุด 2000 ตัวอักษร)',
    'any.required': 'กรุณากรอกข้อความ',
  }),
  conversationId: Joi.string().uuid().optional().allow(null),
  provider: Joi.string().valid('claude', 'gemini', 'vertex-ai').optional().allow(null),
  systemPrompt: Joi.string().max(5000).optional().allow(null),
  mode: Joi.string().valid('general', 'money_coach', 'loan_assistant').optional().allow(null),
  context: Joi.object().optional().allow(null),
});

const createConversationSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  provider: Joi.string().valid('claude', 'gemini').optional(),
  systemPrompt: Joi.string().max(5000).optional(),
});

// Routes

/**
 * POST /api/v1/chat/messages
 * Send a message to AI and get response
 */
// Debug middleware to log request body
router.post('/messages', (req, res, next) => {
  console.log('🔍 [DEBUG] Chat request body:', JSON.stringify(req.body, null, 2));
  next();
}, validate(sendMessageSchema, 'body'), chatController.sendMessage);

/**
 * GET /api/v1/chat/conversations
 * Get user's conversations list
 */
router.get('/conversations', chatController.getConversations);

/**
 * POST /api/v1/chat/conversations
 * Create a new conversation
 */
router.post('/conversations', validate(createConversationSchema, 'body'), chatController.createConversation);

/**
 * GET /api/v1/chat/conversations/:id
 * Get conversation with messages
 */
router.get('/conversations/:id', chatController.getConversation);

/**
 * DELETE /api/v1/chat/conversations/:id
 * Delete a conversation
 */
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
