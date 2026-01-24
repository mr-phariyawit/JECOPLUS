import logger from '../utils/logger.js';

/**
 * Conversation Manager
 * Manages conversation history and context window
 * Features:
 * - Context window limiting
 * - Message relevance filtering
 * - Conversation summarization (for long histories)
 * - Token estimation
 */
class ConversationManager {
  constructor() {
    // Configuration
    this.MAX_MESSAGES = 10; // Maximum messages to keep
    this.MAX_RECENT_MESSAGES = 5; // Always keep recent messages
    this.AVG_TOKENS_PER_CHAR = 0.3; // Rough estimate for Thai text
    this.MAX_CONTEXT_TOKENS = 8000; // Safe limit for most models
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated tokens
   */
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length * this.AVG_TOKENS_PER_CHAR);
  }

  /**
   * Calculate total tokens for conversation history
   * @param {Array} history - Conversation history
   * @returns {number} Total tokens
   */
  calculateTotalTokens(history) {
    return history.reduce((sum, msg) => {
      return sum + this.estimateTokens(msg.content);
    }, 0);
  }

  /**
   * Extract keywords from message for relevance matching
   * Optimized for Thai text using domain keywords and selective n-grams
   * @param {string} text - Message text
   * @returns {Array<string>} Keywords
   */
  extractKeywords(text) {
    if (!text) return [];

    // Common Thai stop words and particles
    const stopWords = [
      'ครับ', 'ค่ะ', 'คะ', 'นะ', 'เลย', 'เหรอ', 'หรือ',
      'ที่', 'ใน', 'และ', 'หรือ', 'แต่', 'กับ', 'ของ',
      'เป็น', 'มี', 'ได้', 'จะ', 'ไป', 'มา', 'ให้', 'อะไร',
      'อย่าง', 'เรา', 'ผม', 'ดิฉัน', 'คุณ', 'ไหม', 'ยัง'
    ];

    const keywords = new Set();
    const cleanText = text.toLowerCase().trim();

    // Priority 1: Extract important domain keywords (loan-related terms)
    const domainKeywords = [
      // Core loan terms
      'กู้', 'เงิน', 'สินเชื่อ', 'ดอกเบี้ย', 'ผ่อน', 'วงเงิน',
      'อนุมัติ', 'สถานะ', 'ชำระ', 'จ่าย', 'ค่างวด', 'งวด',
      // Product names
      'kb', 'personal', 'pah', 'pay', 'จำนำ', 'ทะเบียน',
      // Documents & application
      'เอกสาร', 'สมัคร', 'บัตร', 'ประชาชน', 'สลิป', 'statement',
      // Status & results
      'ผล', 'ปฏิเสธ', 'รอ', 'ตรวจสอบ', 'เช็ค',
      // Other relevant
      'รถ', 'บ้าน', 'ซื้อ', 'ทำงาน', 'รายได้', 'เงินเดือน'
    ];

    domainKeywords.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        keywords.add(keyword);
      }
    });

    // Priority 2: Extract space-separated words
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    words.forEach(word => {
      // Skip numbers and stop words
      if (!/^[0-9,]+$/.test(word) && !stopWords.includes(word) && word.length >= 2) {
        keywords.add(word);
      }
    });

    // Priority 3: Extract selective Thai 3-4 character n-grams (only if we have few keywords so far)
    if (keywords.size < 5) {
      // Only extract from Thai characters, skip spaces and punctuation
      const thaiOnly = cleanText.replace(/[^\u0E00-\u0E7F]/g, '');

      // Extract 3-character grams
      for (let i = 0; i <= thaiOnly.length - 3; i++) {
        const trigram = thaiOnly.substring(i, i + 3);
        if (!stopWords.includes(trigram)) {
          keywords.add(trigram);
        }
      }

      // Extract 4-character grams (more meaningful for Thai)
      for (let i = 0; i <= thaiOnly.length - 4; i++) {
        const fourgram = thaiOnly.substring(i, i + 4);
        if (!stopWords.includes(fourgram)) {
          keywords.add(fourgram);
        }
      }
    }

    return [...keywords];
  }

  /**
   * Check if two messages are relevant to each other
   * @param {string} text1 - First message
   * @param {string} text2 - Second message
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevance(text1, text2) {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0;
    }

    // Count common keywords
    const common = keywords1.filter(k => keywords2.includes(k)).length;

    // Jaccard similarity
    const union = [...new Set([...keywords1, ...keywords2])].length;
    return common / union;
  }

  /**
   * Filter conversation history by relevance to current message
   * @param {Array} history - Full conversation history
   * @param {string} currentMessage - Current user message
   * @returns {Array} Filtered history
   */
  filterByRelevance(history, currentMessage) {
    if (!currentMessage || history.length === 0) {
      return history;
    }

    // Always keep recent messages
    const recentMessages = history.slice(-this.MAX_RECENT_MESSAGES);

    // Calculate relevance for older messages
    const olderMessages = history.slice(0, -this.MAX_RECENT_MESSAGES);

    const scoredMessages = olderMessages.map(msg => ({
      ...msg,
      relevanceScore: this.calculateRelevance(msg.content, currentMessage),
    }));

    // Sort by relevance and take top relevant messages
    const topRelevant = scoredMessages
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter(msg => msg.relevanceScore > 0.1) // Minimum relevance threshold
      .slice(0, this.MAX_MESSAGES - this.MAX_RECENT_MESSAGES);

    // Combine and sort by original order
    const selected = [...topRelevant, ...recentMessages];
    return selected.sort((a, b) => {
      const indexA = history.indexOf(history.find(m => m === a || (m.content === a.content && m.role === a.role)));
      const indexB = history.indexOf(history.find(m => m === b || (m.content === b.content && m.role === b.role)));
      return indexA - indexB;
    });
  }

  /**
   * Trim conversation history to fit context window
   * @param {Array} history - Conversation history
   * @param {number} maxTokens - Maximum tokens allowed
   * @returns {Array} Trimmed history
   */
  trimToTokenLimit(history, maxTokens = this.MAX_CONTEXT_TOKENS) {
    if (history.length === 0) return history;

    // Calculate current tokens
    let currentTokens = this.calculateTotalTokens(history);

    if (currentTokens <= maxTokens) {
      return history;
    }

    logger.info(`[Context] Trimming history: ${currentTokens} tokens → target ${maxTokens}`);

    // Keep first message (important context) and trim from middle, then from end if needed
    let trimmed = [...history];

    // Phase 1: Remove from middle (keep first + recent messages)
    let startIndex = 1;
    while (currentTokens > maxTokens && startIndex < trimmed.length - this.MAX_RECENT_MESSAGES) {
      const removed = trimmed.splice(startIndex, 1)[0];
      currentTokens -= this.estimateTokens(removed.content);
    }

    // Phase 2: If still over limit, remove from end (oldest of recent messages)
    while (currentTokens > maxTokens && trimmed.length > 1) {
      // Remove second-to-last (keep first, remove oldest recent)
      const removeIndex = Math.max(1, trimmed.length - 1);
      const removed = trimmed.splice(removeIndex, 1)[0];
      currentTokens -= this.estimateTokens(removed.content);
    }

    logger.info(`[Context] Trimmed to ${trimmed.length} messages (${currentTokens} tokens)`);

    return trimmed;
  }

  /**
   * Build optimal context for AI
   * @param {Array} conversationHistory - Full conversation history
   * @param {string} currentMessage - Current user message
   * @param {object} options - Options
   * @returns {Array} Optimized history
   */
  buildOptimalContext(conversationHistory, currentMessage, options = {}) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return [];
    }

    try {
      logger.info(`[Context] Building optimal context from ${conversationHistory.length} messages`);

      let optimized = conversationHistory;

      // Step 1: Filter by relevance (if enabled)
      if (options.useRelevanceFilter !== false && currentMessage) {
        optimized = this.filterByRelevance(optimized, currentMessage);
        logger.info(`[Context] After relevance filter: ${optimized.length} messages`);
      }

      // Step 2: Limit by max messages
      const maxMessages = options.maxMessages || this.MAX_MESSAGES;
      if (optimized.length > maxMessages) {
        // Keep first message (context) and recent messages
        const first = optimized[0];
        const recent = optimized.slice(-maxMessages + 1);
        optimized = [first, ...recent];
        logger.info(`[Context] After message limit: ${optimized.length} messages`);
      }

      // Step 3: Trim to token limit
      const maxTokens = options.maxTokens || this.MAX_CONTEXT_TOKENS;
      optimized = this.trimToTokenLimit(optimized, maxTokens);

      // Calculate final stats
      const finalTokens = this.calculateTotalTokens(optimized);
      logger.info(`[Context] Final: ${optimized.length} messages, ~${finalTokens} tokens`);

      return optimized;

    } catch (error) {
      logger.error('[Context] Error building optimal context:', error);
      // Fallback: return recent messages only
      return conversationHistory.slice(-this.MAX_RECENT_MESSAGES);
    }
  }

  /**
   * Summarize old conversation (future enhancement)
   * This would use AI to summarize old messages
   * @param {Array} messages - Messages to summarize
   * @returns {string} Summary
   */
  async summarizeConversation(messages) {
    // TODO: Implement AI-powered summarization
    // For now, return a simple text summary
    if (messages.length === 0) return '';

    const userMessages = messages.filter(m => m.role === 'user').length;
    const aiMessages = messages.filter(m => m.role === 'assistant' || m.role === 'model').length;

    return `[สรุปการสนทนาก่อนหน้า: มี ${userMessages} คำถาม และ ${aiMessages} คำตอบ]`;
  }

  /**
   * Get context statistics
   * @param {Array} history - Conversation history
   * @returns {object} Statistics
   */
  getStats(history) {
    const tokens = this.calculateTotalTokens(history);
    const userMessages = history.filter(m => m.role === 'user').length;
    const aiMessages = history.filter(m => m.role === 'assistant' || m.role === 'model').length;

    return {
      totalMessages: history.length,
      userMessages,
      aiMessages,
      estimatedTokens: tokens,
      withinLimit: tokens <= this.MAX_CONTEXT_TOKENS,
      utilizationPercent: Math.round((tokens / this.MAX_CONTEXT_TOKENS) * 100),
    };
  }
}

// Export singleton instance
export default new ConversationManager();
