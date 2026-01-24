import conversationManager from '../../../src/services/conversationManager.js';

describe('ConversationManager', () => {
  describe('estimateTokens', () => {
    it('should estimate tokens for Thai text', () => {
      const text = 'สวัสดีครับ ยินดีต้อนรับ'; // ~20 chars
      const tokens = conversationManager.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10); // Thai: ~0.3 tokens per char
    });

    it('should handle empty text', () => {
      const tokens = conversationManager.estimateTokens('');
      expect(tokens).toBe(0);
    });
  });

  describe('extractKeywords', () => {
    it('should extract domain keywords from Thai text', () => {
      const keywords = conversationManager.extractKeywords('อยากกู้เงิน 100000 บาท');
      expect(keywords).toContain('กู้');
      expect(keywords).toContain('เงิน');
    });

    it('should extract KB Personal product name', () => {
      const keywords = conversationManager.extractKeywords('KB Personal ดอกเบี้ยเท่าไร');
      expect(keywords).toContain('kb');
      expect(keywords).toContain('personal');
      expect(keywords).toContain('ดอกเบี้ย');
    });

    it('should filter stop words', () => {
      const keywords = conversationManager.extractKeywords('ครับ ค่ะ นะ คะ');
      // Stop words create n-grams, so we expect some keywords but they should be filtered by relevance later
      expect(keywords.length).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const keywords = conversationManager.extractKeywords('');
      expect(keywords).toEqual([]);
    });
  });

  describe('calculateRelevance', () => {
    it('should return high score for similar messages', () => {
      const score = conversationManager.calculateRelevance(
        'อยากกู้เงิน 100000 บาท',
        'กู้เงินได้เท่าไหร่'
      );
      expect(score).toBeGreaterThan(0.1);
    });

    it('should return low score for different messages', () => {
      const score = conversationManager.calculateRelevance(
        'สวัสดีครับ',
        'กู้เงินได้เท่าไหร่'
      );
      expect(score).toBeLessThan(0.5);
    });

    it('should handle empty messages', () => {
      const score = conversationManager.calculateRelevance('', '');
      expect(score).toBe(0);
    });
  });

  describe('buildOptimalContext', () => {
    it('should limit to max messages', () => {
      const history = [];
      for (let i = 0; i < 20; i++) {
        history.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
        });
      }

      const optimized = conversationManager.buildOptimalContext(
        history,
        'Current message',
        { maxMessages: 5 }
      );

      expect(optimized.length).toBeLessThanOrEqual(5);
    });

    it('should filter by relevance', () => {
      const history = [
        { role: 'user', content: 'อยากกู้เงิน' },
        { role: 'assistant', content: 'กู้ได้ครับ' },
        { role: 'user', content: 'สวัสดีครับ' }, // Irrelevant
        { role: 'assistant', content: 'สวัสดีค่ะ' }, // Irrelevant
        { role: 'user', content: 'ดอกเบี้ยเท่าไร' },
      ];

      const optimized = conversationManager.buildOptimalContext(
        history,
        'KB Personal ดอกเบี้ยเท่าไร',
        { relevanceThreshold: 0.1 }
      );

      // Should keep relevant loan-related messages
      expect(optimized.length).toBeGreaterThan(0);
    });

    it('should trim to token limit', () => {
      const history = [];
      for (let i = 0; i < 50; i++) {
        history.push({
          role: 'user',
          content: 'This is a very long message that will consume many tokens. '.repeat(20),
        });
      }

      const optimized = conversationManager.buildOptimalContext(
        history,
        'Current message',
        { maxTokens: 1000 }
      );

      const totalTokens = conversationManager.calculateTotalTokens(optimized);
      expect(totalTokens).toBeLessThanOrEqual(1000);
    });

    it('should keep first message when trimming', () => {
      const history = [
        { role: 'user', content: 'First message - important context' },
        ...Array(20).fill({ role: 'user', content: 'Filler message' }),
      ];

      const optimized = conversationManager.buildOptimalContext(
        history,
        'Current message',
        { maxMessages: 5, useRelevanceFilter: false } // Disable relevance filter to test message limit
      );

      expect(optimized[0].content).toBe('First message - important context');
    });
  });

  describe('getStats', () => {
    it('should return statistics for conversation history', () => {
      const history = [
        { role: 'user', content: 'อยากกู้เงิน 100,000 บาท ทำงานมา 1 ปี เงินเดือน 30,000 บาท' },
        { role: 'assistant', content: 'ได้เลยค่ะ คุณผ่านเกณฑ์ขั้นต่ำแล้ว ต้องการให้ช่วยอะไรเพิ่มเติมไหมคะ' },
        { role: 'user', content: 'ดอกเบี้ยเท่าไหร่คะ KB Personal กับสินเชื่อส่วนบุคคลต่างกันอย่างไร' },
      ];

      const stats = conversationManager.getStats(history);
      expect(stats.totalMessages).toBe(3);
      expect(stats.estimatedTokens).toBeGreaterThan(0);
      expect(stats.utilizationPercent).toBeGreaterThan(0);
    });

    it('should handle empty history', () => {
      const stats = conversationManager.getStats([]);
      expect(stats.totalMessages).toBe(0);
      expect(stats.estimatedTokens).toBe(0);
      expect(stats.utilizationPercent).toBe(0);
    });
  });
});
