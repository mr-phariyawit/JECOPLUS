import responseValidator from '../../../src/services/responseValidator.js';

describe('ResponseValidator', () => {
  describe('validate - Basic validation', () => {
    it('should pass valid Thai response', () => {
      const response = 'สินเชื่อส่วนบุคคลของเรามีวงเงิน 50,000 - 500,000 บาท อัตราดอกเบี้ย 18-25% ต่อปี';
      const result = responseValidator.validate(response, 'ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.severity).toBe('none');
    });

    it('should fail on too short response', () => {
      const response = 'ได้ครับ'; // Only 7 chars
      const result = responseValidator.validate(response, 'กู้ได้ไหม');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'LENGTH_TOO_SHORT')).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('should fail on English response', () => {
      const response = 'You can apply for a loan with our platform. We offer personal loans up to 500,000 baht.';
      const result = responseValidator.validate(response, 'How to apply');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'INSUFFICIENT_THAI')).toBe(true);
      expect(result.severity).toBe('critical');
    });
  });

  describe('validate - Product data validation', () => {
    it('should pass correct สินเชื่อส่วนบุคคล data', () => {
      const response = 'สินเชื่อส่วนบุคคล: วงเงิน 50,000 - 500,000 บาท อัตราดอกเบี้ย 18-25% ต่อปี';
      const result = responseValidator.validate(response, 'ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail on incorrect interest rate', () => {
      const response = 'สินเชื่อส่วนบุคคล: อัตราดอกเบี้ย 10-15% ต่อปี'; // Wrong! Should be 18-25%
      const result = responseValidator.validate(response, 'ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'INCORRECT_PRODUCT_DATA')).toBe(true);
      expect(result.severity).toBe('critical');
    });

    it('should pass correct KB Personal data', () => {
      const response = 'สินเชื่อ KB Personal เหมาะสำหรับลูกค้าคุณภาพดี มีวงเงิน 100,000 - 500,000 บาท อัตราดอกเบี้ย 15-20% ต่อปี คุณสมบัติต้องมีรายได้ขั้นต่ำ 25,000 บาทต่อเดือน และมีประวัติเครดิตที่ดีค่ะ';
      const result = responseValidator.validate(response, 'KB Personal ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(true);
    });

    it('should fail on incorrect KB Personal data', () => {
      const response = 'KB Personal: วงเงิน 50,000 - 300,000 บาท อัตราดอกเบี้ย 18-25% ต่อปี';
      const result = responseValidator.validate(response, 'KB Personal ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'INCORRECT_PRODUCT_DATA')).toBe(true);
    });

    it('should detect suspicious interest rates', () => {
      const response = 'ดอกเบี้ยของเราเพียง 5% ต่อปี'; // Too low!
      const result = responseValidator.validate(response, 'ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_INTEREST_RATE')).toBe(true);
    });
  });

  describe('validate - Forbidden content', () => {
    it('should block guarantee promises', () => {
      const response = 'รับประกันว่าจะอนุมัติแน่นอนครับ';
      const result = responseValidator.validate(response, 'จะอนุมัติไหม');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'FORBIDDEN_CONTENT')).toBe(true);
      expect(result.severity).toBe('critical');
    });

    it('should block investment advice', () => {
      const response = 'แนะนำให้คุณซื้อหุ้นดีกว่าครับ';
      const result = responseValidator.validate(response, 'ลงทุนอะไรดี');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'FORBIDDEN_CONTENT')).toBe(true);
    });

    it('should block sensitive info requests', () => {
      const response = 'ขอเลขบัตรประชาชนหน่อยครับ';
      const result = responseValidator.validate(response, 'ต้องการอะไร');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'FORBIDDEN_CONTENT')).toBe(true);
    });
  });

  describe('validate - Warning patterns', () => {
    it('should warn about vague language but still pass', () => {
      const response = 'ดอกเบี้ยประมาณ 20% ต่อปีครับ';
      const result = responseValidator.validate(response, 'ดอกเบี้ยเท่าไร');

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings.some(w => w.type === 'WARNING_PATTERN')).toBe(true);
      expect(result.severity).toBe('low');
    });

    it('should warn about poor structure for long response', () => {
      const response = 'A'.repeat(300); // Long text without structure
      const result = responseValidator.validate(response, 'อธิบายหน่อย');

      expect(result.warnings.some(w => w.type === 'POOR_STRUCTURE')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return validation configuration', () => {
      const stats = responseValidator.getStats();

      expect(stats.validationRules.productCount).toBe(4);
      expect(stats.validationRules.forbiddenPatterns).toBeGreaterThan(5);
      expect(stats.thresholds.minLength).toBe(10);
      expect(stats.thresholds.maxLength).toBe(2500);
      expect(stats.thresholds.minThaiRatio).toBe(0.5);
    });
  });
});
