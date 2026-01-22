import { jest } from '@jest/globals';

// Mock dependencies
const mockQuery = jest.fn();
const mockTransaction = jest.fn();

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  query: mockQuery,
  transaction: mockTransaction,
}));

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockAIChatService = {
  generateResponse: jest.fn(),
};

jest.unstable_mockModule('../../../src/services/aiChatService.js', () => ({
  default: mockAIChatService,
}));

const { default: chatService } = await import('../../../src/services/chatService.js');

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing conversation when conversationId is provided', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Test Conversation',
        provider: 'gemini',
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockConversation],
      });

      const result = await chatService.getOrCreateConversation('user-123', {
        conversationId: 'conv-123',
      });

      expect(result).toEqual(mockConversation);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM conversations'),
        ['conv-123', 'user-123']
      );
    });

    it('should create new conversation when conversationId is not provided', async () => {
      const mockNewConversation = {
        id: expect.any(String),
        user_id: 'user-123',
        title: null,
        provider: 'gemini',
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockNewConversation],
      });

      const result = await chatService.getOrCreateConversation('user-123', {
        provider: 'gemini',
      });

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO conversations'),
        expect.arrayContaining([expect.any(String), 'user-123', null, 'gemini', null])
      );
    });

    it('should throw error when conversation not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        chatService.getOrCreateConversation('user-123', {
          conversationId: 'non-existent',
        })
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('getConversation', () => {
    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Test',
      };

      const mockMessages = [
        { id: 'msg-1', role: 'user', content: 'Hello' },
        { id: 'msg-2', role: 'assistant', content: 'Hi there!' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockConversation] })
        .mockResolvedValueOnce({ rows: mockMessages });

      const result = await chatService.getConversation('conv-123', 'user-123');

      expect(result).toEqual({
        ...mockConversation,
        messages: mockMessages,
      });
    });

    it('should throw error when conversation not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        chatService.getConversation('non-existent', 'user-123')
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('getUserConversations', () => {
    it('should return user conversations with pagination', async () => {
      const mockConversations = [
        { id: 'conv-1', user_id: 'user-123' },
        { id: 'conv-2', user_id: 'user-123' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockConversations });

      const result = await chatService.getUserConversations('user-123', {
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual(mockConversations);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY last_message_at DESC'),
        ['user-123', 20, 0]
      );
    });
  });

  describe('saveMessage', () => {
    it('should save message to database', async () => {
      const mockMessage = {
        id: expect.any(String),
        conversation_id: 'conv-123',
        role: 'user',
        content: 'Hello',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockMessage] });

      const result = await chatService.saveMessage('conv-123', 'user', 'Hello');

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        expect.any(Array)
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message and get AI response', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        provider: 'gemini',
      };

      const mockMessages = [
        { role: 'user', content: 'Hello' },
      ];

      const mockAIResponse = {
        success: true,
        data: {
          text: 'Hi there! How can I help?',
          provider: 'gemini',
          metadata: {
            model: 'gemini-1.5-pro',
            tokens: 150,
          },
        },
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockConversation] })  // getOrCreateConversation
        .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] })    // save user message
        .mockResolvedValueOnce({ rows: mockMessages })         // get history
        .mockResolvedValueOnce({ rows: [{ id: 'msg-2' }] });   // save AI message

      mockAIChatService.generateResponse.mockResolvedValueOnce(mockAIResponse);

      const result = await chatService.sendMessage('user-123', 'Hello');

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hi there! How can I help?');
      expect(mockAIChatService.generateResponse).toHaveBeenCalled();
    });

    it('should handle AI response error', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        provider: 'gemini',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockConversation] })
        .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockAIChatService.generateResponse.mockResolvedValueOnce({
        success: false,
        error: 'API error',
      });

      await expect(
        chatService.sendMessage('user-123', 'Hello')
      ).rejects.toThrow('API error');
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'conv-123' }],
      });

      await chatService.deleteConversation('conv-123', 'user-123');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM conversations'),
        ['conv-123', 'user-123']
      );
    });

    it('should throw error when conversation not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        chatService.deleteConversation('non-existent', 'user-123')
      ).rejects.toThrow('Conversation not found');
    });
  });
});
