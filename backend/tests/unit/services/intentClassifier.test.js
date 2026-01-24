import intentClassifier from '../../../src/services/intentClassifier.js';

describe('IntentClassifier', () => {
  describe('classify', () => {
    it('should classify loan inquiry correctly', () => {
      const intent = intentClassifier.classify('อยากกู้เงิน 100,000 บาท');
      expect(intent).toBe('loan_inquiry');
    });

    it('should classify loan status correctly', () => {
      const intent = intentClassifier.classify('ผลการพิจารณาออกมาแล้วหรือยัง');
      expect(intent).toBe('loan_status');
    });

    it('should classify payment inquiry correctly', () => {
      const intent = intentClassifier.classify('จ่ายเงินผ่านช่องทางไหนได้บ้าง');
      expect(intent).toBe('payment');
    });

    it('should classify greeting correctly', () => {
      const intent = intentClassifier.classify('สวัสดีครับ');
      expect(intent).toBe('greeting');
    });

    it('should classify thanks correctly', () => {
      const intent = intentClassifier.classify('ขอบคุณมากครับ');
      expect(intent).toBe('thanks');
    });

    it('should classify document inquiry correctly', () => {
      const intent = intentClassifier.classify('ต้องเตรียมเอกสารอะไรบ้าง');
      expect(intent).toBe('document');
    });

    it('should classify KB Personal product inquiry correctly', () => {
      const intent = intentClassifier.classify('KB Personal ดอกเบี้ยเท่าไร');
      expect(intent).toBe('loan_inquiry');
    });

    it('should classify complaint correctly', () => {
      const intent = intentClassifier.classify('โกรธมากเลยนะ บริการแย่');
      expect(intent).toBe('complaint');
    });

    it('should default to general for unclear message', () => {
      const intent = intentClassifier.classify('อธิบายหน่อย');
      expect(intent).toBe('general');
    });
  });

  describe('buildEnhancedPrompt', () => {
    it('should add intent context to base prompt', () => {
      const basePrompt = 'You are an AI assistant.';
      const enhanced = intentClassifier.buildEnhancedPrompt(basePrompt, 'loan_inquiry');

      expect(enhanced).toContain('You are an AI assistant.');
      expect(enhanced).toContain('บริบทของคำถาม');
      expect(enhanced).toContain('การสอบถามสินเชื่อ');
      expect(enhanced).toContain('โฟกัสการตอบ');
    });

    it('should handle greeting intent', () => {
      const basePrompt = 'You are an AI assistant.';
      const enhanced = intentClassifier.buildEnhancedPrompt(basePrompt, 'greeting');

      expect(enhanced).toContain('ทักทาย');
      expect(enhanced).toContain('บริบทของคำถาม');
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = intentClassifier.getStats();

      expect(stats.totalIntents).toBe(9);
      expect(stats.intents).toHaveProperty('loan_inquiry');
      expect(stats.intents).toHaveProperty('greeting');
      expect(stats.intents).toHaveProperty('thanks');
      expect(parseFloat(stats.averageKeywordsPerIntent)).toBeGreaterThan(0);
    });
  });
});
