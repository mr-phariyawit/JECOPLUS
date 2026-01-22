import { query } from '../config/database.js';
import ragService from './ragService.js';
import logger from '../utils/logger.js';

/**
 * Money Coach Service
 * Provides financial analysis, budgeting advice, and product recommendations
 */
class MoneyCoachService {
  /**
   * Build money coach system prompt
   * @param {object} userProfile - User financial profile
   * @returns {string} System prompt
   */
  buildSystemPrompt(userProfile = null) {
    let prompt = `You are JECO+ Money Coach, a friendly financial advisor for Thai users.

Your role:
1. Help users understand their financial situation
2. Provide budgeting and savings advice
3. Recommend relevant products from JECO+ marketplace
4. Suggest appropriate loan products when needed
5. Create personalized financial plans

Personality:
- Friendly, encouraging, and non-judgmental
- Use Thai language with polite particles (ค่ะ/ครับ)
- Be realistic but optimistic
- Never provide investment advice (only savings/budgeting)

Available Services:
- Personal loans (สินเชื่อส่วนบุคคล)
- KB Personal Loan
- Pah Pay
- Marketplace products (various categories)
- Savings plans

Rules:
- Always respond in Thai
- Focus on practical, actionable advice
- Use numbers and specific examples
- Encourage good financial habits`;

    if (userProfile) {
      prompt += `\n\nCurrent User Profile:`;
      
      if (userProfile.monthly_income) {
        prompt += `\n- Monthly Income: ${parseFloat(userProfile.monthly_income).toLocaleString('th-TH')} THB`;
      }
      
      if (userProfile.monthly_expenses) {
        prompt += `\n- Monthly Expenses: ${parseFloat(userProfile.monthly_expenses).toLocaleString('th-TH')} THB`;
      }
      
      if (userProfile.savings_goal) {
        prompt += `\n- Savings Goal: ${parseFloat(userProfile.savings_goal).toLocaleString('th-TH')} THB`;
      }
      
      if (userProfile.risk_tolerance) {
        prompt += `\n- Risk Tolerance: ${userProfile.risk_tolerance}`;
      }

      if (userProfile.spending_categories && Object.keys(userProfile.spending_categories).length > 0) {
        prompt += `\n- Spending Categories: ${JSON.stringify(userProfile.spending_categories)}`;
      }
    }

    return prompt;
  }

  /**
   * Analyze user financial situation
   * @param {string} userId - User ID
   * @returns {Promise<object>} Financial analysis
   */
  async analyzeFinancialSituation(userId) {
    try {
      // Get user profile
      const profileResult = await query(
        `SELECT * FROM financial_profiles WHERE user_id = $1`,
        [userId]
      );

      let profile = profileResult.rows[0];

      // Get wallet balance
      const walletResult = await query(
        `SELECT balance FROM wallets WHERE user_id = $1`,
        [userId]
      );
      const walletBalance = walletResult.rows[0]?.balance || 0;

      // Get recent transactions
      const transactionsResult = await query(
        `SELECT type, amount, description, created_at 
         FROM transactions 
         WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1)
         AND status = 'COMPLETED'
         ORDER BY created_at DESC
         LIMIT 30`,
        [userId]
      );

      // Calculate spending by category
      const spendingAnalysis = this.analyzeSpending(transactionsResult.rows);

      // Update or create profile if needed
      if (!profile) {
        profile = await this.createProfile(userId, {
          monthly_income: null,
          monthly_expenses: spendingAnalysis.totalSpent || null,
        });
      }

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        userId,
        profile,
        spendingAnalysis,
        walletBalance
      );

      return {
        profile,
        walletBalance,
        spendingAnalysis,
        recommendations,
        insights: this.generateInsights(profile, spendingAnalysis, walletBalance),
      };
    } catch (error) {
      logger.error('Error analyzing financial situation:', error);
      throw error;
    }
  }

  /**
   * Analyze spending patterns
   * @param {Array} transactions - Transaction array
   * @returns {object} Spending analysis
   */
  analyzeSpending(transactions) {
    const categories = {};
    let totalSpent = 0;
    let totalIncome = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount) || 0;

      if (tx.type === 'PAYMENT' || tx.type === 'WITHDRAW') {
        const category = this.categorizeTransaction(tx);
        categories[category] = (categories[category] || 0) + amount;
        totalSpent += amount;
      } else if (tx.type === 'TOPUP') {
        totalIncome += amount;
      }
    });

    const days = 30; // Assume last 30 days
    const averageDaily = totalSpent / days;

    return {
      categories,
      totalSpent,
      totalIncome,
      averageDaily,
      transactionCount: transactions.length,
      topCategory: Object.keys(categories).reduce((a, b) => 
        categories[a] > categories[b] ? a : b, Object.keys(categories)[0]
      ) || null,
    };
  }

  /**
   * Categorize transaction
   * @private
   */
  categorizeTransaction(transaction) {
    const description = (transaction.description || '').toLowerCase();
    
    if (description.includes('food') || description.includes('restaurant') || description.includes('ร้านอาหาร')) {
      return 'food';
    }
    if (description.includes('transport') || description.includes('gas') || description.includes('รถ')) {
      return 'transport';
    }
    if (description.includes('shopping') || description.includes('marketplace') || description.includes('ซื้อ')) {
      return 'shopping';
    }
    if (description.includes('bill') || description.includes('utility') || description.includes('ค่า')) {
      return 'bills';
    }
    if (description.includes('entertainment') || description.includes('บันเทิง')) {
      return 'entertainment';
    }
    
    return 'other';
  }

  /**
   * Generate product/loan recommendations
   * @param {string} userId - User ID
   * @param {object} profile - Financial profile
   * @param {object} spendingAnalysis - Spending analysis
   * @param {number} walletBalance - Current wallet balance
   * @returns {Promise<object>} Recommendations
   */
  async generateRecommendations(userId, profile, spendingAnalysis, walletBalance) {
    try {
      // Build recommendation query
      const queryText = this.buildRecommendationQuery(profile, spendingAnalysis, walletBalance);

      // Use RAG to find relevant products
      const ragContext = await ragService.retrieveContext(queryText, userId, {
        entityTypes: ['product', 'loan'],
        maxResults: 5,
      });

      // Get actual products from database
      const productIds = ragContext.contexts
        .filter(c => c.entityType === 'product')
        .map(c => c.entityId);

      let products = [];
      if (productIds.length > 0) {
        const productsResult = await query(
          `SELECT id, name, description, price, category_id, metadata
           FROM products
           WHERE status = 'active'
           AND id = ANY($1::uuid[])
           LIMIT 5`,
          [productIds]
        );
        products = productsResult.rows;
      }

      // Get loan products
      const loanIds = ragContext.contexts
        .filter(c => c.entityType === 'loan')
        .map(c => c.entityId);

      let loans = [];
      if (loanIds.length > 0) {
        const loansResult = await query(
          `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider
           FROM loan_products
           WHERE status = 'active'
           AND id = ANY($1::uuid[])
           LIMIT 3`,
          [loanIds]
        );
        loans = loansResult.rows;
      }

      return {
        products: products.map(p => ({
          ...p,
          reason: ragContext.contexts.find(c => c.entityId === p.id)?.text || 'Recommended based on your profile',
        })),
        loans: loans.map(l => ({
          ...l,
          reason: ragContext.contexts.find(c => c.entityId === l.id)?.text || 'Suitable for your financial situation',
        })),
        reasoning: ragContext.formattedContext,
      };
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return { products: [], loans: [] };
    }
  }

  /**
   * Build recommendation query for RAG
   * @private
   */
  buildRecommendationQuery(profile, spendingAnalysis, walletBalance) {
    let query = 'Recommend products and loans for user with: ';

    if (profile?.monthly_income) {
      query += `income ${profile.monthly_income} THB/month, `;
    }

    if (profile?.monthly_expenses) {
      query += `expenses ${profile.monthly_expenses} THB/month, `;
    }

    if (spendingAnalysis?.totalSpent) {
      query += `spending ${spendingAnalysis.totalSpent} THB in last month, `;
    }

    if (profile?.savings_goal) {
      query += `savings goal ${profile.savings_goal} THB, `;
    }

    if (walletBalance) {
      query += `current balance ${walletBalance} THB, `;
    }

    if (profile?.risk_tolerance) {
      query += `risk tolerance ${profile.risk_tolerance}`;
    }

    if (spendingAnalysis?.topCategory) {
      query += `, top spending category: ${spendingAnalysis.topCategory}`;
    }

    return query;
  }

  /**
   * Generate financial insights
   * @private
   */
  generateInsights(profile, spendingAnalysis, walletBalance) {
    const insights = [];

    if (profile?.monthly_income && profile?.monthly_expenses) {
      const savings = profile.monthly_income - profile.monthly_expenses;
      if (savings > 0) {
        insights.push({
          type: 'positive',
          message: `คุณมีเงินเหลือเก็บ ${savings.toLocaleString('th-TH')} บาท/เดือน`,
        });
      } else {
        insights.push({
          type: 'warning',
          message: `คุณใช้จ่ายเกินรายได้ ${Math.abs(savings).toLocaleString('th-TH')} บาท/เดือน`,
        });
      }
    }

    if (spendingAnalysis?.topCategory) {
      insights.push({
        type: 'info',
        message: `คุณใช้จ่ายมากที่สุดในหมวด ${spendingAnalysis.topCategory}: ${spendingAnalysis.categories[spendingAnalysis.topCategory]?.toLocaleString('th-TH')} บาท`,
      });
    }

    if (profile?.savings_goal && walletBalance) {
      const progress = (walletBalance / profile.savings_goal) * 100;
      insights.push({
        type: 'progress',
        message: `เป้าหมายออมเงิน: ${progress.toFixed(1)}% (${walletBalance.toLocaleString('th-TH')}/${profile.savings_goal.toLocaleString('th-TH')} บาท)`,
      });
    }

    return insights;
  }

  /**
   * Create financial profile
   * @param {string} userId - User ID
   * @param {object} data - Profile data
   * @returns {Promise<object>} Created profile
   */
  async createProfile(userId, data = {}) {
    const result = await query(
      `INSERT INTO financial_profiles (user_id, monthly_income, monthly_expenses, savings_goal, risk_tolerance)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        data.monthly_income || null,
        data.monthly_expenses || null,
        data.savings_goal || null,
        data.risk_tolerance || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Update financial profile from chat conversation
   * @param {string} userId - User ID
   * @param {object} conversationData - Extracted data from conversation
   * @returns {Promise<object>} Updated profile
   */
  async updateProfileFromChat(userId, conversationData) {
    const profileResult = await query(
      `SELECT * FROM financial_profiles WHERE user_id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      // Create new profile
      return this.createProfile(userId, conversationData);
    } else {
      // Update existing profile
      const result = await query(
        `UPDATE financial_profiles
         SET monthly_income = COALESCE($2, monthly_income),
             monthly_expenses = COALESCE($3, monthly_expenses),
             savings_goal = COALESCE($4, savings_goal),
             risk_tolerance = COALESCE($5, risk_tolerance),
             spending_categories = COALESCE($6::jsonb, spending_categories),
             updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [
          userId,
          conversationData.monthly_income,
          conversationData.monthly_expenses,
          conversationData.savings_goal,
          conversationData.risk_tolerance,
          conversationData.spending_categories ? JSON.stringify(conversationData.spending_categories) : null,
        ]
      );
      return result.rows[0];
    }
  }

  /**
   * Update spending categories
   * @param {string} userId - User ID
   * @param {object} categories - Spending categories
   * @returns {Promise<object>} Updated profile
   */
  async updateSpendingCategories(userId, categories) {
    const result = await query(
      `UPDATE financial_profiles
       SET spending_categories = $2::jsonb,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [userId, JSON.stringify(categories)]
    );
    return result.rows[0];
  }
}

export default new MoneyCoachService();
