import { jest } from '@jest/globals';

// Mock services
const mockClaudeService = {
  isAvailable: jest.fn(),
  generateResponse: jest.fn(),
  streamResponse: jest.fn(),
};

const mockGeminiService = {
  isAvailable: jest.fn(),
  generateResponse: jest.fn(),
  streamResponse: jest.fn(),
};

jest.unstable_mockModule('../../../src/services/claudeService.js', () => ({
  default: mockClaudeService,
}));

jest.unstable_mockModule('../../../src/services/geminiService.js', () => ({
  default: mockGeminiService,
}));

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    env: 'test',
    db: {
      host: 'localhost',
      port: 5432,
      name: 'test',
      user: 'test',
      password: 'test'
    },
    ai: {
      defaultProvider: 'gemini',
      circuitBreaker: {
        threshold: 5,
        timeout: 60000,
        halfOpenAttempts: 2
      }
    },
  },
}));

// Mock database to prevent connection issues
jest.unstable_mockModule('../../../src/config/database.js', () => ({
  query: jest.fn(),
  pool: { on: jest.fn(), connect: jest.fn() },
  default: { on: jest.fn() }
}));

const { default: aiChatService } = await import('../../../src/services/aiChatService.js');

describe('AI Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableProviders', () => {
    it('should return available providers', () => {
      mockClaudeService.isAvailable.mockReturnValue(true);
      mockGeminiService.isAvailable.mockReturnValue(true);

      const providers = aiChatService.getAvailableProviders();

      expect(providers).toEqual(['claude', 'gemini']);
    });

    it('should return only available providers', () => {
      mockClaudeService.isAvailable.mockReturnValue(false);
      mockGeminiService.isAvailable.mockReturnValue(true);

      const providers = aiChatService.getAvailableProviders();

      expect(providers).toEqual(['gemini']);
    });
  });

  describe('selectProvider', () => {
    it('should select preferred provider if available', () => {
      mockClaudeService.isAvailable.mockReturnValue(true);
      mockGeminiService.isAvailable.mockReturnValue(true);

      const provider = aiChatService.selectProvider('claude');

      expect(provider).toBe('claude');
    });

    it('should fallback to available provider', () => {
      mockClaudeService.isAvailable.mockReturnValue(false);
      mockGeminiService.isAvailable.mockReturnValue(true);

      const provider = aiChatService.selectProvider('claude');

      expect(provider).toBe('gemini');
    });

    it('should throw error when no providers available', () => {
      mockClaudeService.isAvailable.mockReturnValue(false);
      mockGeminiService.isAvailable.mockReturnValue(false);

      expect(() => {
        aiChatService.selectProvider();
      }).toThrow('No AI providers are configured');
    });
  });

  describe('generateResponse', () => {
    it('should generate response using Gemini', async () => {
      mockGeminiService.isAvailable.mockReturnValue(true);
      mockGeminiService.generateResponse.mockResolvedValue({
        text: 'Hello! How can I help?',
        metadata: {
          model: 'gemini-1.5-pro',
          totalTokens: 150,
        },
      });

      const result = await aiChatService.generateResponse('Hello', [], {
        provider: 'gemini',
      });

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hello! How can I help?');
      expect(result.data.provider).toBe('gemini');
      expect(mockGeminiService.generateResponse).toHaveBeenCalled();
    });

    it('should generate response using Claude', async () => {
      mockClaudeService.isAvailable.mockReturnValue(true);
      mockClaudeService.generateResponse.mockResolvedValue({
        text: 'Hi there!',
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          totalTokens: 100,
        },
      });

      const result = await aiChatService.generateResponse('Hello', [], {
        provider: 'claude',
      });

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hi there!');
      expect(result.data.provider).toBe('claude');
      expect(mockClaudeService.generateResponse).toHaveBeenCalled();
    });

    it('should handle AI provider errors', async () => {
      mockGeminiService.isAvailable.mockReturnValue(true);
      mockGeminiService.generateResponse.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      const result = await aiChatService.generateResponse('Hello', [], {
        provider: 'gemini',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API rate limit exceeded');
    });

    it('should use default system prompt when not provided', async () => {
      mockGeminiService.isAvailable.mockReturnValue(true);
      mockGeminiService.generateResponse.mockResolvedValue({
        text: 'Response',
        metadata: {},
      });

      await aiChatService.generateResponse('Hello', []);

      expect(mockGeminiService.generateResponse).toHaveBeenCalledWith(
        'Hello',
        [],
        expect.stringContaining('JECO+ AI Assistant'),
        expect.any(Object)
      );
    });

    it('should include conversation history in request', async () => {
      mockGeminiService.isAvailable.mockReturnValue(true);
      mockGeminiService.generateResponse.mockResolvedValue({
        text: 'Response',
        metadata: {},
      });

      const history = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ];

      await aiChatService.generateResponse('How are you?', history, {
        provider: 'gemini',
      });

      expect(mockGeminiService.generateResponse).toHaveBeenCalledWith(
        'How are you?',
        history,
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('streamResponse', () => {
    it('should stream response from Gemini', async () => {
      mockGeminiService.isAvailable.mockReturnValue(true);

      const mockStream = async function* () {
        yield 'Hello';
        yield ' there';
        yield '!';
      };

      mockGeminiService.streamResponse.mockReturnValue(mockStream());

      const chunks = [];
      for await (const chunk of aiChatService.streamResponse('Hello', [], {
        provider: 'gemini',
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' there', '!']);
    });

    it('should stream response from Claude', async () => {
      mockClaudeService.isAvailable.mockReturnValue(true);

      const mockStream = async function* () {
        yield 'Hi';
      };

      mockClaudeService.streamResponse.mockReturnValue(mockStream());

      const chunks = [];
      for await (const chunk of aiChatService.streamResponse('Hello', [], {
        provider: 'claude',
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hi']);
    });
  });
});
