import { query } from '../config/database.js';
import ragService from './ragService.js';
import logger from '../utils/logger.js';

/**
 * Loan Assistant Service
 * Provides loan recommendations, calculations, and comparisons
 */
class LoanAssistantService {
  /**
   * Build loan assistant system prompt
   * @param {Array} userLoans - User's current loans
   * @param {object} creditScore - User's credit score
   * @returns {string} System prompt
   */
  buildSystemPrompt(userLoans = [], creditScore = null) {
    let prompt = `You are JECO+ Loan Assistant, a specialized loan advisor for Thai users.

Your role:
1. Help users understand loan products and requirements
2. Calculate loan installments and interest accurately
3. Recommend suitable loan products based on user profile
4. Guide users through loan application process
5. Answer questions about loan terms, eligibility, and documents

Available Loan Products:
- Personal loans (สินเชื่อส่วนบุคคล): 5,000 - 100,000 THB, APR 18-25%
- KB Personal Loan: Up to 500,000 THB, APR from 15%
- Pah Pay: For users without credit history, uses AI credit scoring
- Vehicle title loans (สินเชื่อจำนำทะเบียนรถ): Secured loans using vehicle as collateral

Rules:
- Always calculate installments accurately using the formula
- Explain loan terms clearly in Thai
- Never guarantee approval
- Guide users to check eligibility before applying
- Be transparent about interest rates and fees
- Always respond in Thai language`;

    if (userLoans.length > 0) {
      prompt += `\n\nUser's Current Loans:`;
      userLoans.forEach(loan => {
        prompt += `\n- ${loan.name || 'Loan'}: ${loan.amount_requested || 0} THB, `;
        prompt += `${loan.term_months || 0} months, Status: ${loan.status || 'Unknown'}`;
      });
    }

    if (creditScore) {
      prompt += `\n\nUser's Credit Score: ${creditScore.score || 'N/A'} (${creditScore.grade || 'N/A'})`;
    }

    return prompt;
  }

  /**
   * Get user loan information
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's loans
   */
  async getUserLoans(userId) {
    try {
      const result = await query(
        `SELECT 
          la.id,
          la.amount_requested,
          la.term_months,
          la.status,
          la.created_at,
          lp.name,
          lp.provider
         FROM loan_applications la
         LEFT JOIN loan_products lp ON la.product_id = lp.id
         WHERE la.user_id = $1
         ORDER BY la.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error getting user loans:', error);
      throw error;
    }
  }

  /**
   * Calculate loan installment
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} months - Loan term in months
   * @returns {number} Monthly installment
   */
  calculateInstallment(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) {
      return 0;
    }

    const monthlyRate = annualRate / 12 / 100;
    
    if (monthlyRate === 0) {
      return principal / months;
    }

    const installment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(installment * 100) / 100;
  }

  /**
   * Recommend loans for user
   * @param {string} userId - User ID
   * @param {number} requestedAmount - Requested loan amount (optional)
   * @param {number} termMonths - Loan term in months (optional)
   * @returns {Promise<object>} Loan recommendations
   */
  async recommendLoans(userId, requestedAmount = null, termMonths = null) {
    try {
      // Get user credit score
      const creditScoreResult = await query(
        `SELECT score, grade FROM credit_scores 
         WHERE loan_app_id IN (
           SELECT id FROM loan_applications WHERE user_id = $1
         )
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      const creditScore = creditScoreResult.rows[0] || null;

      // Build recommendation query
      let queryText = 'Recommend loan products for user';
      if (requestedAmount) {
        queryText += ` requesting ${requestedAmount} THB`;
      }
      if (termMonths) {
        queryText += ` for ${termMonths} months`;
      }
      if (creditScore) {
        queryText += ` with credit score ${creditScore.score}`;
      }

      // Use RAG to find relevant loans
      const ragContext = await ragService.retrieveContext(queryText, userId, {
        entityTypes: ['loan'],
        maxResults: 5,
      });

      // Get actual loan products
      let loanQuery = `
        SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider, description
        FROM loan_products
        WHERE status = 'active'
      `;

      const params = [];
      let paramIndex = 1;

      if (requestedAmount) {
        loanQuery += ` AND min_amount <= $${paramIndex} AND max_amount >= $${paramIndex}`;
        params.push(requestedAmount);
        paramIndex++;
      }

      loanQuery += ` ORDER BY min_apr ASC LIMIT 5`;

      const loansResult = await query(loanQuery, params);
      const loans = loansResult.rows;

      // Calculate installments for each loan
      const loansWithInstallments = loans.map(loan => {
        const amount = requestedAmount || loan.min_amount;
        const rate = loan.min_apr;
        const term = termMonths || 12;

        const monthlyInstallment = this.calculateInstallment(amount, rate, term);
        const totalAmount = monthlyInstallment * term;
        const totalInterest = totalAmount - amount;

        return {
          ...loan,
          recommendedAmount: amount,
          recommendedTerm: term,
          monthlyInstallment,
          totalInterest,
          totalAmount,
          interestRate: rate,
        };
      });

      return {
        loans: loansWithInstallments,
        creditScore,
        recommendations: ragContext.contexts,
        reasoning: ragContext.formattedContext,
      };
    } catch (error) {
      logger.error('Error recommending loans:', error);
      throw error;
    }
  }

  /**
   * Compare loan products
   * @param {Array<string>} loanIds - Array of loan product IDs
   * @param {number} amount - Loan amount
   * @param {number} termMonths - Loan term in months
   * @returns {Promise<Array>} Comparison results
   */
  async compareLoans(loanIds, amount, termMonths) {
    try {
      const result = await query(
        `SELECT id, name, min_amount, max_amount, min_apr, max_apr, provider, description
         FROM loan_products
         WHERE id = ANY($1::uuid[])
         AND min_amount <= $2 AND max_amount >= $2`,
        [loanIds, amount]
      );

      const comparisons = result.rows.map(loan => {
        const monthlyInstallment = this.calculateInstallment(amount, loan.min_apr, termMonths);
        const totalAmount = monthlyInstallment * termMonths;
        const totalInterest = totalAmount - amount;

        return {
          ...loan,
          loanAmount: amount,
          termMonths,
          monthlyInstallment,
          totalInterest,
          totalAmount,
          annualRate: loan.min_apr,
          totalCost: totalAmount,
        };
      });

      return comparisons.sort((a, b) => a.monthlyInstallment - b.monthlyInstallment);
    } catch (error) {
      logger.error('Error comparing loans:', error);
      throw error;
    }
  }

  /**
   * Get loan product details
   * @param {string} loanId - Loan product ID
   * @returns {Promise<object>} Loan product details
   */
  async getLoanProduct(loanId) {
    try {
      const result = await query(
        `SELECT * FROM loan_products WHERE id = $1 AND status = 'active'`,
        [loanId]
      );

      if (result.rows.length === 0) {
        throw new Error('Loan product not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting loan product:', error);
      throw error;
    }
  }
}

export default new LoanAssistantService();
