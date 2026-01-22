import loanAssistantService from '../services/loanAssistantService.js';
import { sendMessage } from '../services/chatService.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Loan Assistant Controller
 * Handles loan recommendations, calculations, and chat
 */

/**
 * Get user's loans
 * GET /api/v1/loan-assistant/my-loans
 */
export const getMyLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await loanAssistantService.getUserLoans(userId);

    res.json({
      success: true,
      data: loans,
    });
  } catch (error) {
    logger.error('Get my loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get loans',
    });
  }
};

/**
 * Get loan recommendations
 * GET /api/v1/loan-assistant/recommend
 */
export const recommendLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, termMonths } = req.query;

    const recommendations = await loanAssistantService.recommendLoans(
      userId,
      amount ? parseFloat(amount) : null,
      termMonths ? parseInt(termMonths) : null
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Recommend loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations',
    });
  }
};

/**
 * Calculate loan installment
 * POST /api/v1/loan-assistant/calculate
 */
export const calculateInstallment = async (req, res) => {
  try {
    const { amount, annualRate, months } = req.body;

    if (!amount || !annualRate || !months) {
      return res.status(400).json({
        success: false,
        error: 'Amount, annualRate, and months are required',
      });
    }

    const installment = loanAssistantService.calculateInstallment(
      parseFloat(amount),
      parseFloat(annualRate),
      parseInt(months)
    );

    const totalAmount = installment * parseInt(months);
    const totalInterest = totalAmount - parseFloat(amount);

    res.json({
      success: true,
      data: {
        monthlyInstallment: installment,
        totalAmount,
        totalInterest,
        principal: parseFloat(amount),
        termMonths: parseInt(months),
        annualRate: parseFloat(annualRate),
      },
    });
  } catch (error) {
    logger.error('Calculate installment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate installment',
    });
  }
};

/**
 * Compare loan products
 * POST /api/v1/loan-assistant/compare
 */
export const compareLoans = async (req, res) => {
  try {
    const { loanIds, amount, termMonths } = req.body;

    if (!loanIds || !Array.isArray(loanIds) || loanIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'loanIds array is required',
      });
    }

    if (!amount || !termMonths) {
      return res.status(400).json({
        success: false,
        error: 'amount and termMonths are required',
      });
    }

    const comparisons = await loanAssistantService.compareLoans(
      loanIds,
      parseFloat(amount),
      parseInt(termMonths)
    );

    res.json({
      success: true,
      data: comparisons,
    });
  } catch (error) {
    logger.error('Compare loans error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare loans',
    });
  }
};

/**
 * Chat with loan assistant
 * POST /api/v1/loan-assistant/chat
 */
export const chatWithLoanAssistant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get user loans and credit score for context
    const userLoans = await loanAssistantService.getUserLoans(userId);
    const creditScoreResult = await query(
      `SELECT score, grade FROM credit_scores 
       WHERE loan_app_id IN (SELECT id FROM loan_applications WHERE user_id = $1)
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const creditScore = creditScoreResult.rows[0] || null;

    const systemPrompt = loanAssistantService.buildSystemPrompt(userLoans, creditScore);

    // Send message with loan assistant context
    const response = await sendMessage(userId, message, {
      systemPrompt,
      provider: 'vertex-ai',
    });

    res.json(response);
  } catch (error) {
    logger.error('Loan assistant chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message',
    });
  }
};

/**
 * Get loan product details
 * GET /api/v1/loan-assistant/products/:id
 */
export const getLoanProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await loanAssistantService.getLoanProduct(id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error('Get loan product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get loan product',
    });
  }
};
