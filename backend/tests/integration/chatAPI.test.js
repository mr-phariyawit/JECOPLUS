import { jest } from '@jest/globals';
import request from 'supertest';

// Mock database and services
jest.unstable_mockModule('../../src/config/database.js', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

jest.unstable_mockModule('../../src/services/aiChatService.js', () => ({
  default: {
    generateResponse: jest.fn(),
    getAvailableProviders: jest.fn(() => ['gemini']),
    selectProvider: jest.fn(() => 'gemini'),
  },
}));

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user-123' };
    next();
  },
}));

const { default: app } = await import('../../src/app.js');
const { query } = await import('../../src/config/database.js');
const aiChatService = (await import('../../src/services/aiChatService.js')).default;

describe('Chat API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/chat/messages', () => {
    it('should send message and receive AI response', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'test-user-123',
        provider: 'gemini',
      };

      query
        .mockResolvedValueOnce({ rows: [mockConversation] })    // getOrCreateConversation
        .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] })      // save user message
        .mockResolvedValueOnce({ rows: [] })                     // get history
        .mockResolvedValueOnce({ rows: [{ id: 'msg-2' }] });     // save AI message

      aiChatService.generateResponse.mockResolvedValue({
        success: true,
        data: {
          text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?',
          provider: 'gemini',
          metadata: {
            model: 'gemini-1.5-pro',
            totalTokens: 120,
          },
        },
      });

      const response = await request(app)
        .post('/api/v1/chat/messages')
        .send({
          message: 'สวัสดีครับ',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?');
      expect(response.body.data.conversationId).toBeDefined();
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/v1/chat/messages')
        .send({
          message: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for message too long', async () => {
      const longMessage = 'x'.repeat(2001);

      const response = await request(app)
        .post('/api/v1/chat/messages')
        .send({
          message: longMessage,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should use existing conversation when conversationId provided', async () => {
      const mockConversation = {
        id: 'existing-conv-123',
        user_id: 'test-user-123',
        provider: 'gemini',
      };

      query
        .mockResolvedValueOnce({ rows: [mockConversation] })
        .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'msg-2' }] });

      aiChatService.generateResponse.mockResolvedValue({
        success: true,
        data: {
          text: 'Response',
          provider: 'gemini',
          metadata: {},
        },
      });

      const response = await request(app)
        .post('/api/v1/chat/messages')
        .send({
          message: 'Hello',
          conversationId: 'existing-conv-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.conversationId).toBe('existing-conv-123');
    });
  });

  describe('GET /api/v1/chat/conversations', () => {
    it('should return user conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          user_id: 'test-user-123',
          title: 'Loan Application',
          message_count: 5,
        },
        {
          id: 'conv-2',
          user_id: 'test-user-123',
          title: null,
          message_count: 2,
        },
      ];

      query.mockResolvedValueOnce({ rows: mockConversations });

      const response = await request(app)
        .get('/api/v1/chat/conversations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.conversations).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/v1/chat/conversations?limit=10&offset=20')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.offset).toBe(20);
    });

    it('should limit max results to 50', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/v1/chat/conversations?limit=100')
        .expect(200);

      expect(response.body.data.pagination.limit).toBe(50);
    });
  });

  describe('GET /api/v1/chat/conversations/:id', () => {
    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'test-user-123',
        title: 'Test Conversation',
      };

      const mockMessages = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          created_at: new Date(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Hi there!',
          created_at: new Date(),
        },
      ];

      query
        .mockResolvedValueOnce({ rows: [mockConversation] })
        .mockResolvedValueOnce({ rows: mockMessages });

      const response = await request(app)
        .get('/api/v1/chat/conversations/conv-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('conv-123');
      expect(response.body.data.messages).toHaveLength(2);
    });

    it('should return 404 for non-existent conversation', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/api/v1/chat/conversations/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/v1/chat/conversations', () => {
    it('should create new conversation', async () => {
      const mockConversation = {
        id: 'new-conv-123',
        user_id: 'test-user-123',
        title: 'New Chat',
        provider: 'gemini',
      };

      query.mockResolvedValueOnce({ rows: [mockConversation] });

      const response = await request(app)
        .post('/api/v1/chat/conversations')
        .send({
          title: 'New Chat',
          provider: 'gemini',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    it('should validate provider value', async () => {
      const response = await request(app)
        .post('/api/v1/chat/conversations')
        .send({
          provider: 'invalid-provider',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/chat/conversations/:id', () => {
    it('should delete conversation', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'conv-123' }] });

      const response = await request(app)
        .delete('/api/v1/chat/conversations/conv-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 for non-existent conversation', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .delete('/api/v1/chat/conversations/non-existent')
        .expect(404);
    });
  });
});
