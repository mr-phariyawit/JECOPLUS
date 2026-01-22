import moneyCoachService from '../services/moneyCoachService.js';
import { sendMessage } from '../services/chatService.js';
import logger from '../utils/logger.js';

/**
 * Money Coach Controller
 * Handles financial analysis and money coach chat
 */

/**
 * Analyze user's financial situation
 * GET /api/v1/money-coach/analyze
 */
export const analyzeFinancialSituation = async (req, res) => {
  try {
    const userId = req.user.id;

    const analysis = await moneyCoachService.analyzeFinancialSituation(userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Money coach analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze financial situation',
    });
  }
};

/**
 * Chat with money coach
 * POST /api/v1/money-coach/chat
 */
export const chatWithMoneyCoach = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get user profile for context
    const analysis = await moneyCoachService.analyzeFinancialSituation(userId);
    const systemPrompt = moneyCoachService.buildSystemPrompt(analysis.profile);

    // Send message with money coach context
    const response = await sendMessage(userId, message, {
      systemPrompt,
      provider: 'vertex-ai',
    });

    res.json(response);
  } catch (error) {
    logger.error('Money coach chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message',
    });
  }
};

/**
 * Update financial profile
 * PUT /api/v1/money-coach/profile
 */
export const updateFinancialProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Validate required fields
    const allowedFields = [
      'monthly_income',
      'monthly_expenses',
      'savings_goal',
      'risk_tolerance',
      'spending_categories',
      'goals',
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        filteredData[field] = profileData[field];
      }
    }

    await moneyCoachService.updateProfileFromChat(userId, filteredData);

    res.json({
      success: true,
      message: 'Financial profile updated successfully',
    });
  } catch (error) {
    logger.error('Update financial profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
};

/**
 * Get financial profile
 * GET /api/v1/money-coach/profile
 */
export const getFinancialProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = await import('../config/database.js');

    const result = await query(
      `SELECT * FROM financial_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No financial profile found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get financial profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get profile',
    });
  }
};
