import logger from '../utils/logger.js';

/**
 * Response Validator Service
 * Validates AI responses for quality, accuracy, and compliance
 * Prevents hallucinations and ensures responses meet quality standards
 */
class ResponseValidator {
  constructor() {
    // Product data for validation (must match system prompt)
    this.validProducts = {
      'สินเชื่อส่วนบุคคล': {
        minAmount: 50000,
        maxAmount: 500000,
        minInterest: 18,
        maxInterest: 25,
        minTerm: 12,
        maxTerm: 48,
      },
      'KB Personal': {
        minAmount: 100000,
        maxAmount: 500000,
        minInterest: 15,
        maxInterest: 20,
        minTerm: 12,
        maxTerm: 48,
        minSalary: 25000,
      },
      'Pah Pay': {
        minAmount: 5000,
        maxAmount: 50000,
        minInterest: 20,
        maxInterest: 28,
        minTerm: 3,
        maxTerm: 12,
      },
      'จำนำทะเบียน': {
        maxLTV: 80, // Loan to value percentage
        minInterest: 22,
        maxInterest: 30,
      },
    };

    // Forbidden patterns
    this.forbiddenPatterns = [
      // Guarantees (violates system prompt rules)
      /รับประกัน.*อนุมัติ/i,
      /ได้แน่นอน/i,
      /ผ่านแน่/i,

      // Investment advice (forbidden)
      /แนะนำ.*หุ้น/i,
      /ลงทุน.*กองทุน/i,
      /ซื้อ.*หุ้น/i,

      // Requesting sensitive info (forbidden)
      /ขอ.*เลขบัตรประชาชน/i,
      /ส่ง.*รหัสผ่าน/i,
      /PIN/i,

      // Made-up products or services
      /JECO.*ประกัน/i,
      /JECO.*เคลม/i,
    ];

    // Warning patterns (log but don't reject)
    this.warningPatterns = [
      // Vague language
      /ประมาณ.*\d+/i,
      /ราว.*\d+/i,
      /อาจจะ.*\d+/i,
    ];

    // Validation thresholds
    this.MIN_RESPONSE_LENGTH = 10;
    this.MAX_RESPONSE_LENGTH = 2500;
    this.MIN_THAI_RATIO = 0.5; // 50% of text should be Thai
  }

  /**
   * Main validation function
   * @param {string} response - AI response text
   * @param {string} userMessage - Original user message
   * @param {object} metadata - Response metadata
   * @returns {object} Validation result
   */
  validate(response, userMessage = '', metadata = {}) {
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      severity: 'none', // 'none' | 'low' | 'medium' | 'high' | 'critical'
      timestamp: new Date().toISOString(),
    };

    try {
      // Run all validation checks
      this.validateLength(response, validationResult);
      this.validateThaiLanguage(response, validationResult);
      this.validateProductData(response, validationResult);
      this.validateForbiddenContent(response, validationResult);
      this.validateWarningPatterns(response, validationResult);
      this.validateStructure(response, validationResult);

      // Determine overall severity
      validationResult.severity = this.calculateSeverity(validationResult);

      // Mark as invalid if there are critical errors
      if (validationResult.errors.length > 0) {
        validationResult.isValid = false;
      }

      // Log validation result
      if (!validationResult.isValid) {
        logger.warn('[Validator] Response failed validation:', {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          severity: validationResult.severity,
          responsePreview: response.substring(0, 100),
        });
      } else if (validationResult.warnings.length > 0) {
        logger.info('[Validator] Response has warnings:', {
          warnings: validationResult.warnings,
        });
      }

      return validationResult;

    } catch (error) {
      logger.error('[Validator] Validation error:', error);
      // On validation error, allow response to pass (fail-open)
      return {
        isValid: true,
        errors: [],
        warnings: [`Validation system error: ${error.message}`],
        severity: 'low',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate response length
   */
  validateLength(response, result) {
    if (!response || response.length < this.MIN_RESPONSE_LENGTH) {
      result.errors.push({
        type: 'LENGTH_TOO_SHORT',
        message: `Response too short (${response?.length || 0} chars, min ${this.MIN_RESPONSE_LENGTH})`,
        severity: 'high',
      });
    }

    if (response && response.length > this.MAX_RESPONSE_LENGTH) {
      result.warnings.push({
        type: 'LENGTH_TOO_LONG',
        message: `Response very long (${response.length} chars, max ${this.MAX_RESPONSE_LENGTH})`,
        severity: 'low',
      });
    }
  }

  /**
   * Validate Thai language usage
   */
  validateThaiLanguage(response, result) {
    if (!response) return;

    // Count Thai characters
    const thaiChars = (response.match(/[\u0E00-\u0E7F]/g) || []).length;
    const totalChars = response.replace(/\s/g, '').length;
    const thaiRatio = totalChars > 0 ? thaiChars / totalChars : 0;

    if (thaiRatio < this.MIN_THAI_RATIO) {
      result.errors.push({
        type: 'INSUFFICIENT_THAI',
        message: `Response not in Thai (${(thaiRatio * 100).toFixed(1)}% Thai, min ${this.MIN_THAI_RATIO * 100}%)`,
        severity: 'critical',
      });
    }

    // Check for English sentences (not just words)
    const englishSentences = response.match(/[A-Z][a-z\s]{10,}[.!?]/g);
    if (englishSentences && englishSentences.length > 0) {
      result.warnings.push({
        type: 'ENGLISH_SENTENCES',
        message: `Found ${englishSentences.length} English sentence(s)`,
        severity: 'medium',
      });
    }
  }

  /**
   * Validate product data accuracy
   */
  validateProductData(response, result) {
    if (!response) return;

    // Extract numbers from response
    const numberMatches = response.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
    const numbers = numberMatches.map(n => parseFloat(n.replace(/,/g, '')));

    // Check for suspicious interest rates (outside valid ranges)
    const interestRatePattern = /(\d+(?:\.\d+)?)\s*%\s*(?:ต่อปี|ต่อเดือน)/g;
    let match;
    while ((match = interestRatePattern.exec(response)) !== null) {
      const rate = parseFloat(match[1]);

      // Interest rates should be between 10-35% for loans
      if (rate < 10 || rate > 35) {
        result.errors.push({
          type: 'INVALID_INTEREST_RATE',
          message: `Suspicious interest rate: ${rate}% (valid range: 10-35%)`,
          severity: 'critical',
          value: rate,
        });
      }
    }

    // Check for loan amounts outside valid ranges
    numbers.forEach(num => {
      if (num >= 1000 && num <= 1000000) {
        // This looks like a loan amount
        const isValid = Object.values(this.validProducts).some(product => {
          if (product.minAmount && product.maxAmount) {
            return num >= product.minAmount && num <= product.maxAmount;
          }
          return true;
        });

        if (!isValid) {
          result.warnings.push({
            type: 'SUSPICIOUS_LOAN_AMOUNT',
            message: `Loan amount ${num.toLocaleString()} บาท not in any product range`,
            severity: 'medium',
            value: num,
          });
        }
      }
    });

    // Check for specific product mentions and validate their data
    for (const [productName, productData] of Object.entries(this.validProducts)) {
      if (response.includes(productName) || response.includes(productName.replace(/\s/g, ''))) {
        // Product mentioned, check if numbers are accurate
        const productContext = this.extractProductContext(response, productName);
        this.validateProductContext(productContext, productName, productData, result);
      }
    }
  }

  /**
   * Extract context around product mention
   */
  extractProductContext(response, productName) {
    const index = response.indexOf(productName);
    if (index === -1) return '';

    // Get 200 chars before and after
    const start = Math.max(0, index - 200);
    const end = Math.min(response.length, index + productName.length + 200);
    return response.substring(start, end);
  }

  /**
   * Validate product context for accuracy
   */
  validateProductContext(context, productName, productData, result) {
    // Extract interest rates mentioned
    const interestPattern = /(\d+)-(\d+)%/g;
    let match;

    while ((match = interestPattern.exec(context)) !== null) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);

      if (productData.minInterest && productData.maxInterest) {
        if (min !== productData.minInterest || max !== productData.maxInterest) {
          result.errors.push({
            type: 'INCORRECT_PRODUCT_DATA',
            message: `${productName}: Interest rate ${min}-${max}% incorrect (should be ${productData.minInterest}-${productData.maxInterest}%)`,
            severity: 'critical',
            product: productName,
          });
        }
      }
    }

    // Extract amounts mentioned
    const amountPattern = /(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*บาท/g;
    while ((match = amountPattern.exec(context)) !== null) {
      const min = parseInt(match[1].replace(/,/g, ''));
      const max = parseInt(match[2].replace(/,/g, ''));

      if (productData.minAmount && productData.maxAmount) {
        if (min !== productData.minAmount || max !== productData.maxAmount) {
          result.errors.push({
            type: 'INCORRECT_PRODUCT_DATA',
            message: `${productName}: Amount range ${min.toLocaleString()}-${max.toLocaleString()} บาท incorrect`,
            severity: 'critical',
            product: productName,
          });
        }
      }
    }
  }

  /**
   * Check for forbidden content
   */
  validateForbiddenContent(response, result) {
    if (!response) return;

    this.forbiddenPatterns.forEach((pattern, index) => {
      if (pattern.test(response)) {
        result.errors.push({
          type: 'FORBIDDEN_CONTENT',
          message: `Response contains forbidden pattern #${index + 1}`,
          severity: 'critical',
          pattern: pattern.toString(),
        });
      }
    });
  }

  /**
   * Check for warning patterns
   */
  validateWarningPatterns(response, result) {
    if (!response) return;

    this.warningPatterns.forEach((pattern, index) => {
      if (pattern.test(response)) {
        result.warnings.push({
          type: 'WARNING_PATTERN',
          message: `Response contains vague language (pattern #${index + 1})`,
          severity: 'low',
          pattern: pattern.toString(),
        });
      }
    });
  }

  /**
   * Validate response structure
   */
  validateStructure(response, result) {
    if (!response) return;

    // Check for proper formatting
    const hasHeaders = /(?:^|\n)##?\s+/m.test(response) || /\*\*[^*]+\*\*/g.test(response);
    const hasBulletPoints = /(?:^|\n)[-•✅❌📋🎯💡]\s+/m.test(response);
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(response);

    // Long responses should have structure
    if (response.length > 200 && !hasHeaders && !hasBulletPoints) {
      result.warnings.push({
        type: 'POOR_STRUCTURE',
        message: 'Long response lacks headers or bullet points',
        severity: 'low',
      });
    }

    // Check for empty lines (good formatting)
    const emptyLines = (response.match(/\n\n/g) || []).length;
    if (response.length > 300 && emptyLines < 2) {
      result.warnings.push({
        type: 'POOR_FORMATTING',
        message: 'Response lacks paragraph breaks',
        severity: 'low',
      });
    }
  }

  /**
   * Calculate overall severity
   */
  calculateSeverity(result) {
    if (result.errors.length === 0 && result.warnings.length === 0) {
      return 'none';
    }

    // Check for critical errors
    const hasCritical = result.errors.some(e => e.severity === 'critical');
    if (hasCritical) return 'critical';

    const hasHighError = result.errors.some(e => e.severity === 'high');
    if (hasHighError) return 'high';

    const hasMediumError = result.errors.some(e => e.severity === 'medium');
    if (hasMediumError || result.errors.length > 0) return 'medium';

    // Only warnings
    const hasMediumWarning = result.warnings.some(w => w.severity === 'medium');
    if (hasMediumWarning) return 'medium';

    return 'low';
  }

  /**
   * Get validation statistics
   * @returns {object} Statistics
   */
  getStats() {
    return {
      validationRules: {
        productCount: Object.keys(this.validProducts).length,
        forbiddenPatterns: this.forbiddenPatterns.length,
        warningPatterns: this.warningPatterns.length,
      },
      thresholds: {
        minLength: this.MIN_RESPONSE_LENGTH,
        maxLength: this.MAX_RESPONSE_LENGTH,
        minThaiRatio: this.MIN_THAI_RATIO,
      },
    };
  }
}

// Export singleton instance
export default new ResponseValidator();
