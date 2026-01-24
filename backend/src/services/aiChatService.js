import claudeService from './claudeService.js';
import geminiService from './geminiService.js';
import vertexAIService from './vertexAIService.js';
import moneyCoachService from './moneyCoachService.js';
import loanAssistantService from './loanAssistantService.js';
import intentClassifier from './intentClassifier.js';
import conversationManager from './conversationManager.js';
import responseValidator from './responseValidator.js';
import knowledgeBase from './knowledgeBase.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import CircuitBreaker from '../utils/CircuitBreaker.js';

/**
 * Unified AI Chat Service
 * Routes requests to Vertex AI, Claude, or Gemini based on configuration
 * and integrates Money Coach / Loan Assistant capabilities.
 */
class AIChatService {
  constructor() {
    // Prioritize Vertex AI if available, otherwise use configured default
    this.defaultProvider = config.ai?.defaultProvider || 'vertex-ai';
    this.baseSystemPrompt = ''; // Will be loaded async
    this.initializePrompt();

    // Initialize circuit breaker for provider resilience
    this.circuitBreaker = new CircuitBreaker({
      threshold: config.ai.circuitBreaker.threshold,
      timeout: config.ai.circuitBreaker.timeout,
      halfOpenAttempts: config.ai.circuitBreaker.halfOpenAttempts
    });
  }

  /**
   * Initialize the base system prompt asynchronously
   * Called once during service initialization
   */
  async initializePrompt() {
    try {
      this.baseSystemPrompt = this.buildBaseSystemPrompt();
      logger.info('AIChatService: Base system prompt initialized successfully');
    } catch (error) {
      logger.error('AIChatService: Failed to initialize prompt', { error: error.message });
      // Set a minimal fallback prompt
      this.baseSystemPrompt = 'คุณคือ JECO+ AI Assistant ผู้ช่วยด้านการเงินสำหรับคนไทย';
    }
  }

  /**
   * Build base system prompt for JECO+ AI Assistant
   * Enhanced with Thai language, business context, and few-shot examples
   */
  buildBaseSystemPrompt() {
    return `คุณคือ JECO+ AI Assistant ผู้ช่วยด้านการเงินที่เชี่ยวชาญสำหรับคนไทย

## บริบทธุรกิจ
JECO+ เป็นแพลตฟอร์มสินเชื่อดิจิทัล ให้บริการสินเชื่อออนไลน์ที่รวดเร็วและสะดวก

### ผลิตภัณฑ์ของเรา
1. **สินเชื่อส่วนบุคคล**
   - วงเงิน: 50,000 - 500,000 บาท
   - อัตราดอกเบี้ย: 18-25% ต่อปี
   - ระยะเวลา: 12-48 เดือน
   - คุณสมบัติ: มีรายได้ประจำ อายุงานขั้นต่ำ 6 เดือน

2. **KB Personal Loan** (สำหรับลูกค้าคุณภาพดี)
   - วงเงิน: 100,000 - 500,000 บาท
   - อัตราดอกเบี้ย: 15-20% ต่อปี (ต่ำกว่ามาตรฐาน)
   - คุณสมบัติ: ประวัติเครดิตดี รายได้ขั้นต่ำ 25,000 บาท/เดือน

3. **Pah Pay** (สินเชื่อระยะสั้น)
   - วงเงิน: 5,000 - 50,000 บาท
   - อัตราดอกเบี้ย: 20-28% ต่อปี
   - ระยะเวลา: 3-12 เดือน
   - อนุมัติเร็ว เหมาะสำหรับเงินฉุกเฉิน

4. **สินเชื่อจำนำทะเบียนรถ**
   - วงเงิน: สูงสุด 80% ของราคาประเมินรถ
   - อัตราดอกเบี้ย: 22-30% ต่อปี
   - ไม่ต้องจำนำตัวรถ (ใช้รถได้ตามปกติ)

## กฎการตอบ

### ✅ ต้องทำ
- ตอบเป็นภาษาไทยทุกครั้ง 100%
- ใช้คำสุภาพ เรียก "คุณลูกค้า" หรือชื่อจริงถ้ามี
- อ้างอิงข้อมูลจริงจากข้างต้นเท่านั้น (วงเงิน, ดอกเบี้ย, เงื่อนไข)
- ถ้าไม่แน่ใจหรือไม่ทราบ → บอกตรงๆ และแนะนำให้ติดต่อเจ้าหน้าที่
- ให้ขั้นตอนที่ชัดเจน เช่น "1. ... 2. ... 3. ..."
- จัดรูปแบบคำตอบให้อ่านง่าย มีหัวข้อ มี bullet points
- แสดงความเห็นอกเห็นใจเมื่อลูกค้ามีปัญหา

### ❌ ห้าม
- ห้ามแต่งข้อมูลตัวเลข (ดอกเบี้ย, วงเงิน, เงื่อนไข)
- ห้ามรับประกันผลการอนุมัติสินเชื่อ
- ห้ามให้คำแนะนำการลงทุน (หุ้น, กองทุน)
- ห้ามขอข้อมูลส่วนตัวที่ละเอียดอ่อน (เลขบัตรประชาชน, PIN, รหัสผ่าน)
- ห้ามตอบเป็นภาษาอังกฤษ (เว้นแต่คำศัพท์เฉพาะ)
- ห้ามใช้ภาษาที่ซับซ้อนหรือคำศัพท์ทางการมากเกินไป

## วิธีคิดก่อนตอบ (ในใจ)

เมื่อได้รับคำถาม ให้คิดตามขั้นตอนนี้:
1. **เข้าใจคำถาม**: ลูกค้าถามอะไร? ชัดเจนแค่ไหน? มีข้อมูลเพียงพอหรือไม่?
2. **ตรวจสอบข้อมูล**: มีข้อมูลที่แน่นอนในระบบหรือไม่? ตัวเลขถูกต้องหรือไม่?
3. **วางแผนคำตอบ**: ต้องตอบอะไรบ้าง? เรียงลำดับอย่างไร? ต้องถามเพิ่มไหม?
4. **ตรวจสอบความถูกต้อง**: ข้อมูลที่จะตอบถูกต้อง 100% หรือไม่?
5. **เพิ่มคุณค่า**: มีอะไรที่จะช่วยลูกค้าเพิ่มเติมได้ไหม?

## ตัวอย่างการสนทนา

### ตัวอย่างที่ 1: คำถามเกี่ยวกับดอกเบี้ย
**ลูกค้า**: "ดอกเบี้ยเท่าไหร่คะ"
**❌ ไม่ดี**: "ดอกเบี้ยประมาณ 20% ครับ"
**✅ ดี**:
"ดอกเบี้ยของเราขึ้นอยู่กับผลิตภัณฑ์ที่คุณสนใจค่ะ:

📋 **ผลิตภัณฑ์ของเรา**
- สินเชื่อส่วนบุคคล: 18-25% ต่อปี
- KB Personal Loan: 15-20% ต่อปี (สำหรับลูกค้าคุณภาพดี)
- Pah Pay: 20-28% ต่อปี
- สินเชื่อจำนำทะเบียนรถ: 22-30% ต่อปี

อัตราดอกเบี้ยที่แน่นอนจะขึ้นอยู่กับผลการพิจารณาค่ะ

คุณสนใจผลิตภัณฑ์ไหนเป็นพิเศษคะ?"

### ตัวอย่างที่ 2: ขอสินเชื่อ
**ลูกค้า**: "อยากกู้ 200,000 บาท ทำงานมา 1 ปี เงินเดือน 30,000"
**❌ ไม่ดี**: "ได้ครับ ยื่นเลย"
**✅ ดี**:
"ได้เลยค่ะ! จากข้อมูลของคุณ:
✅ วงเงิน 200,000 บาท - อยู่ในเกณฑ์
✅ อายุงาน 1 ปี - ผ่านเกณฑ์ขั้นต่ำ (6 เดือน)
✅ รายได้ 30,000 บาท/เดือน - เหมาะสมสำหรับวงเงินนี้

🎯 **ผลิตภัณฑ์ที่แนะนำ**
1. **KB Personal Loan** (แนะนำ)
   - ดอกเบี้ย 15-20% ต่อปี (ต่ำกว่า)
   - เหมาะสำหรับรายได้และวงเงินของคุณ

2. **สินเชื่อส่วนบุคคล**
   - ดอกเบี้ย 18-25% ต่อปี
   - เป็นทางเลือกสำรอง

📄 **เอกสารที่ต้องเตรียม**
1. บัตรประชาชน
2. สลิปเงินเดือน 3 เดือนล่าสุด
3. Statement บัญชีธนาคาร 6 เดือน

ต้องการให้ช่วยยื่นคำขอเลยไหมคะ?"

### ตัวอย่างที่ 3: ถูกปฏิเสธ
**ลูกค้า**: "ทำไมถูกปฏิเสธครับ"
**❌ ไม่ดี**: "เพราะคุณไม่ผ่านเกณฑ์"
**✅ ดี**:
"เสียใจด้วยค่ะที่คำขอของคุณไม่ผ่านการพิจารณา 😔

สาเหตุที่เป็นไปได้:
1. รายได้ต่ำกว่าเกณฑ์ขั้นต่ำ (15,000 บาท)
2. ประวัติเครดิตมีรายการค้างชำระ
3. หนี้สินรวมสูงเกินไป (เกิน 50% ของรายได้)
4. เอกสารไม่ครบถ้วน

💡 **คำแนะนำ**
✅ ตรวจสอบคะแนนเครดิตที่ National Credit Bureau
✅ ปรับปรุงประวัติการชำระหนี้ให้สม่ำเสมอ
✅ ลดภาระหนี้สินลง
✅ รอ 3-6 เดือนแล้วยื่นใหม่

ต้องการให้แนะนำผลิตภัณฑ์อื่นที่เหมาะสมกว่าไหมคะ?"

### ตัวอย่างที่ 4: ไม่ทราบคำตอบ
**ลูกค้า**: "เคลมประกันรถได้ไหม"
**❌ ไม่ดี**: "ได้ครับ ติดต่อประกันได้เลย"
**✅ ดี**:
"ขออภัยค่ะ เรื่องการเคลมประกันรถไม่ใช่บริการของ JECO+ ค่ะ

JECO+ ให้บริการ:
✅ สินเชื่อส่วนบุคคล
✅ สินเชื่อจำนำทะเบียนรถ (ไม่ใช่ประกันรถ)
✅ คำปรึกษาด้านการเงิน

สำหรับการเคลมประกัน แนะนำให้ติดต่อบริษัทประกันโดยตรงค่ะ

มีเรื่องอื่นที่ดิฉันช่วยได้ไหมคะ?"

## สำคัญ
ความแม่นยำสำคัญกว่าความรวดเร็ว - ถ้าไม่แน่ใจ อย่าแต่งข้อมูล!`;
  }

  /**
   * Build contextual system prompt based on mode, intent, and updated data
   * @param {string} mode - 'general', 'money_coach', 'loan_assistant'
   * @param {string} userId - User ID
   * @param {object} context - Additional context parameters (e.g., from charts, userMessage for intent)
   */
  async buildContextualSystemPrompt(mode, userId, context = {}) {
    try {
      if (mode === 'money_coach') {
        // If we have direct context (charts), use it to override or update profile temporarily
        let profile = null;
        if (userId) {
          // Fetch existing profile
          try {
             const analysis = await moneyCoachService.analyzeFinancialSituation(userId);
             profile = analysis.profile;
          } catch (e) {
            logger.warn(`Could not fetch financial profile for user ${userId}: ${e.message}`);
          }
        }

        // Merge chart context into profile if provided
        if (context) {
            profile = { ...profile, ...context };
        }

        return moneyCoachService.buildSystemPrompt(profile);
      }

      if (mode === 'loan_assistant') {
        let userLoans = [];
        let creditScore = null;

        if (userId) {
          try {
            userLoans = await loanAssistantService.getUserLoans(userId);
            // We could also fetch credit score here if needed,
            // but LoanAssistantService.buildSystemPrompt handles explicit score passing
          } catch (e) {
             logger.warn(`Could not fetch loans for user ${userId}: ${e.message}`);
          }
        }

        return loanAssistantService.buildSystemPrompt(userLoans, context?.creditScore || null);
      }

      // Default General Mode with Intent Classification
      let prompt = this.baseSystemPrompt;

      // Classify intent if user message provided
      if (context?.userMessage) {
        const intent = intentClassifier.classify(context.userMessage);
        prompt = intentClassifier.buildEnhancedPrompt(prompt, intent);
        logger.info(`[Intent] Message classified as: ${intent}`);
      }

      // Retrieve relevant knowledge from knowledge base
      if (context?.userMessage) {
        prompt = knowledgeBase.buildEnhancedPrompt(prompt, context.userMessage);
      }

      // Add additional context if provided
      if (context && Object.keys(context).length > 1) { // More than just userMessage
        const filteredContext = { ...context };
        delete filteredContext.userMessage; // Don't include message in context output

        if (Object.keys(filteredContext).length > 0) {
          prompt += `\n\nCurrent Context:\n${JSON.stringify(filteredContext, null, 2)}`;
        }
      }

      return prompt;

    } catch (error) {
      logger.error('Error building contextual prompt:', error);
      return this.baseSystemPrompt;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const providers = [];
    // Check Vertex AI first (preferred)
    if (vertexAIService.isAvailable()) {
      providers.push('vertex-ai');
    }
    if (claudeService.isAvailable()) {
      providers.push('claude');
    }
    if (geminiService.isAvailable()) {
      providers.push('gemini');
    }
    return providers;
  }

  /**
   * Select provider (with fallback logic)
   * @param {string} preferredProvider - Preferred provider ('vertex-ai', 'claude', or 'gemini')
   * @returns {string} Selected provider
   */
  selectProvider(preferredProvider = null) {
    const provider = preferredProvider || this.defaultProvider;
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('No AI providers are configured. Please set GCP_PROJECT_ID, ANTHROPIC_API_KEY, or GEMINI_API_KEY.');
    }

    // Prefer Vertex AI if available and no specific provider requested
    if (!preferredProvider && available.includes('vertex-ai')) {
      return 'vertex-ai';
    }

    // If preferred provider is available, use it
    if (available.includes(provider)) {
      return provider;
    }

    // Otherwise, use the first available provider
    logger.warn(`Provider ${provider} not available, using ${available[0]} instead`);
    return available[0];
  }

  /**
   * Get provider chain for fallback
   * @param {string} preferredProvider - Preferred provider
   * @returns {Array<string>} Array of providers in order of preference
   */
  getProviderChain(preferredProvider = null) {
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('No AI providers are configured.');
    }

    // If user specified a provider, put it first
    if (preferredProvider && available.includes(preferredProvider)) {
      const others = available.filter(p => p !== preferredProvider);
      return [preferredProvider, ...others];
    }

    // Default order: Vertex AI → Gemini → Claude
    const defaultOrder = ['vertex-ai', 'gemini', 'claude'];
    return defaultOrder.filter(p => available.includes(p));
  }

  /**
   * Classify error for structured error handling
   * @param {Error} error - Error object
   * @returns {string} Error code
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode;

    // Rate limit errors
    if (status === 429 || message.includes('rate limit') || message.includes('quota')) {
      return 'RATE_LIMIT';
    }

    // Context/token limit errors
    if (message.includes('context') || message.includes('token limit') || message.includes('too long')) {
      return 'CONTEXT_LIMIT';
    }

    // Network errors
    if (message.includes('network') || message.includes('econnrefused') || message.includes('etimedout')) {
      return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (status === 401 || status === 403 || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'AUTH_ERROR';
    }

    // Service unavailable
    if (status === 503 || message.includes('unavailable') || message.includes('service')) {
      return 'SERVICE_UNAVAILABLE';
    }

    // Default: Generic provider error
    return 'AI_PROVIDER_ERROR';
  }

  /**
   * Call a specific provider
   * @param {string} provider - Provider name
   * @param {string} message - User message
   * @param {Array} conversationHistory - Conversation history
   * @param {string} systemPrompt - System prompt
   * @param {object} providerOptions - Provider-specific options
   * @returns {Promise<object>} Provider response
   */
  async callProvider(provider, message, conversationHistory, systemPrompt, providerOptions = {}) {
    const { temperature, maxTokens, model } = providerOptions;

    switch (provider) {
      case 'vertex-ai':
        return await vertexAIService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          { temperature, maxTokens, model }
        );

      case 'claude':
        return await claudeService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          { temperature, maxTokens, model }
        );

      case 'gemini':
        return await geminiService.generateResponse(
          message,
          conversationHistory,
          systemPrompt,
          { temperature, maxTokens, model }
        );

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Generate AI response with automatic provider fallback
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {object} options - Options (provider, userId, conversationId, etc.)
   * @returns {Promise<object>} Response with text and metadata
   */
  async generateResponse(message, conversationHistory = [], options = {}) {
    // Build system prompt with intent classification
    let systemPrompt = options.systemPrompt;
    if (!systemPrompt) {
      // Add user message to context for intent classification
      const contextWithMessage = {
        ...(options.context || {}),
        userMessage: message,
      };

      systemPrompt = await this.buildContextualSystemPrompt(
        options.mode,
        options.userId,
        contextWithMessage
      );
    }

    // Optimize conversation history for context window
    const optimizedHistory = conversationManager.buildOptimalContext(
      conversationHistory,
      message,
      { maxTokens: options.maxTokens }
    );

    // Log context stats
    const contextStats = conversationManager.getStats(optimizedHistory);
    logger.info(`[Context] Using ${contextStats.totalMessages} messages (~${contextStats.estimatedTokens} tokens, ${contextStats.utilizationPercent}% of limit)`);

    // Get provider chain for fallback
    const providerChain = this.getProviderChain(options.provider);
    const providerOptions = {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      model: options.model,
    };

    logger.info(`AI Chat: Processing message (${message.substring(0, 50)}...) | Mode: ${options.mode || 'general'} | Provider chain: ${providerChain.join(' → ')}`);

    let lastError = null;
    const attemptedProviders = [];

    // Try each provider in the chain
    for (let i = 0; i < providerChain.length; i++) {
      const provider = providerChain[i];

      // Skip if circuit breaker is open
      if (this.circuitBreaker.isOpen(provider)) {
        logger.warn(`⚠️  Circuit breaker OPEN for ${provider}, skipping`);
        attemptedProviders.push({ provider, skipped: true, reason: 'circuit_breaker_open' });
        continue;
      }

      try {
        logger.info(`🔄 Attempt ${i + 1}/${providerChain.length}: Using ${provider}`);

        // Call provider with optimized history
        const response = await this.callProvider(
          provider,
          message,
          optimizedHistory,
          systemPrompt,
          providerOptions
        );

        // Success! Record success and validate response
        this.circuitBreaker.recordSuccess(provider);

        const fallbackOccurred = i > 0;
        if (fallbackOccurred) {
          logger.info(`✅ Fallback successful! ${provider} responded after ${attemptedProviders.length} failed attempt(s)`);
        } else {
          logger.info(`✅ ${provider} responded successfully`);
        }

        // Validate response before returning
        const validationResult = responseValidator.validate(
          response.text,
          message,
          response.metadata
        );

        // Log validation results
        if (!validationResult.isValid) {
          logger.error(`[Validation] Response failed validation (${validationResult.severity}):`, {
            provider,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
          });

          // For critical errors, try next provider (treat as provider failure)
          if (validationResult.severity === 'critical') {
            throw new Error(`Response validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
          }
        }

        return {
          success: true,
          data: {
            text: response.text,
            provider,
            conversationId: options.conversationId,
            metadata: {
              ...response.metadata,
              fallbackOccurred,
              attemptCount: i + 1,
              attemptedProviders: fallbackOccurred ? attemptedProviders : undefined,
              validation: {
                isValid: validationResult.isValid,
                severity: validationResult.severity,
                errorCount: validationResult.errors.length,
                warningCount: validationResult.warnings.length,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
              },
            },
          },
        };

      } catch (error) {
        lastError = error;
        const errorCode = this.classifyError(error);

        logger.error(`❌ Provider ${provider} failed (${errorCode}):`, error.message);

        // Record failure for circuit breaker
        this.circuitBreaker.recordFailure(provider);

        // Track attempt
        attemptedProviders.push({
          provider,
          error: errorCode,
          message: error.message,
          skipped: false,
        });

        // If this is the last provider, return error
        if (i === providerChain.length - 1) {
          logger.error(`💥 All providers failed. Attempted: ${attemptedProviders.map(a => a.provider).join(', ')}`);

          return {
            success: false,
            error: {
              code: errorCode,
              message: error.message || 'All AI providers failed',
              allProvidersFailed: true,
              attemptedProviders,
            },
          };
        }

        // Otherwise, continue to next provider
        logger.info(`🔄 Falling back to next provider...`);
      }
    }

    // This shouldn't happen, but handle it just in case
    return {
      success: false,
      error: {
        code: 'AI_PROVIDER_ERROR',
        message: 'No providers available',
        allProvidersFailed: true,
      },
    };
  }

  /**
   * Stream AI response (for real-time chat)
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {object} options - Options
   * @returns {AsyncGenerator} Stream of text chunks
   */
  async *streamResponse(message, conversationHistory = [], options = {}) {
    const provider = this.selectProvider(options.provider);
    
    let systemPrompt = options.systemPrompt;
    if (!systemPrompt) {
      systemPrompt = await this.buildContextualSystemPrompt(
        options.mode, 
        options.userId, 
        options.context
      );
    }

    try {
      if (provider === 'vertex-ai') {
        yield* vertexAIService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'claude') {
        yield* claudeService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else if (provider === 'gemini') {
        yield* geminiService.streamResponse(
          message,
          conversationHistory,
          systemPrompt,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model,
          }
        );
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`AI Chat streaming error (${provider}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AIChatService();
