import knowledgeBase from '../../../src/services/knowledgeBase.js';

describe('KnowledgeBase', () => {
  describe('retrieveKnowledge', () => {
    it('should retrieve relevant knowledge for loan inquiry', () => {
      const results = knowledgeBase.retrieveKnowledge('อยากกู้เงิน 100,000 บาท');

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('category');
      expect(results[0]).toHaveProperty('content');
    });

    it('should retrieve KB Personal info when asked', () => {
      const results = knowledgeBase.retrieveKnowledge('KB Personal ดอกเบี้ยเท่าไร');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('product_kb_personal');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should retrieve interest rate FAQ', () => {
      const results = knowledgeBase.retrieveKnowledge('ดอกเบี้ยคำนวณอย่างไร');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.category === 'faq')).toBe(true);
    });

    it('should retrieve payment channel info', () => {
      const results = knowledgeBase.retrieveKnowledge('จ่ายเงินผ่านช่องทางไหน');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.keywords.some(k => k.includes('ชำระ')))).toBe(true);
    });

    it('should return empty for irrelevant query', () => {
      const results = knowledgeBase.retrieveKnowledge('สภาพอากาศวันนี้');

      expect(results.length).toBe(0);
    });

    it('should limit results to maxResults', () => {
      const results = knowledgeBase.retrieveKnowledge('สินเชื่อ', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should score results correctly', () => {
      const results = knowledgeBase.retrieveKnowledge('KB Personal ดอกเบี้ยเท่าไร');

      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe('getByCategory', () => {
    it('should retrieve all products', () => {
      const products = knowledgeBase.getByCategory('product');

      expect(products.length).toBe(4);
      expect(products.every(p => p.category === 'product')).toBe(true);
    });

    it('should retrieve all FAQs', () => {
      const faqs = knowledgeBase.getByCategory('faq');

      expect(faqs.length).toBe(6);
      expect(faqs.every(f => f.category === 'faq')).toBe(true);
    });

    it('should return empty for unknown category', () => {
      const results = knowledgeBase.getByCategory('unknown');

      expect(results.length).toBe(0);
    });
  });

  describe('buildEnhancedPrompt', () => {
    it('should add relevant knowledge to base prompt', () => {
      const basePrompt = 'You are an AI assistant.';
      const enhanced = knowledgeBase.buildEnhancedPrompt(
        basePrompt,
        'KB Personal ดอกเบี้ยเท่าไร'
      );

      expect(enhanced).toContain('You are an AI assistant.');
      expect(enhanced).toContain('ข้อมูลเพิ่มเติมที่เกี่ยวข้อง');
      expect(enhanced).toContain('KB Personal');
    });

    it('should not modify prompt if no relevant knowledge', () => {
      const basePrompt = 'You are an AI assistant.';
      const enhanced = knowledgeBase.buildEnhancedPrompt(
        basePrompt,
        'สภาพอากาศวันนี้'
      );

      expect(enhanced).toBe(basePrompt);
    });

    it('should include multiple knowledge entries', () => {
      const basePrompt = 'You are an AI assistant.';
      const enhanced = knowledgeBase.buildEnhancedPrompt(
        basePrompt,
        'สินเชื่อส่วนบุคคล ดอกเบี้ยเท่าไร'
      );

      // Should have multiple entries (product + FAQ)
      const entryCounts = (enhanced.match(/###/g) || []).length;
      expect(entryCounts).toBeGreaterThan(1);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = knowledgeBase.getStats();

      expect(stats.totalEntries).toBe(12);
      expect(stats.categories.product).toBe(4);
      expect(stats.categories.faq).toBe(6);
      expect(stats.categories.document).toBe(1);
      expect(stats.categories.policy).toBe(1);
      expect(parseFloat(stats.averageKeywordsPerEntry)).toBeGreaterThan(0);
    });
  });

  describe('Knowledge content validation', () => {
    it('should have correct product data for สินเชื่อส่วนบุคคล', () => {
      const products = knowledgeBase.getByCategory('product');
      const personalLoan = products.find(p => p.id === 'product_personal_loan');

      expect(personalLoan).toBeDefined();
      expect(personalLoan.content).toContain('50,000 - 500,000 บาท');
      expect(personalLoan.content).toContain('18-25% ต่อปี');
    });

    it('should have correct product data for KB Personal', () => {
      const products = knowledgeBase.getByCategory('product');
      const kbPersonal = products.find(p => p.id === 'product_kb_personal');

      expect(kbPersonal).toBeDefined();
      expect(kbPersonal.content).toContain('100,000 - 500,000 บาท');
      expect(kbPersonal.content).toContain('15-20% ต่อปี');
      expect(kbPersonal.content).toContain('25,000 บาท/เดือน');
    });

    it('should have correct product data for Pah Pay', () => {
      const products = knowledgeBase.getByCategory('product');
      const pahPay = products.find(p => p.id === 'product_pah_pay');

      expect(pahPay).toBeDefined();
      expect(pahPay.content).toContain('5,000 - 50,000 บาท');
      expect(pahPay.content).toContain('20-28% ต่อปี');
    });

    it('should have all 12 entries', () => {
      const allKnowledge = [
        ...knowledgeBase.getByCategory('product'),
        ...knowledgeBase.getByCategory('faq'),
        ...knowledgeBase.getByCategory('document'),
        ...knowledgeBase.getByCategory('policy'),
      ];

      expect(allKnowledge.length).toBe(12);
    });
  });
});
