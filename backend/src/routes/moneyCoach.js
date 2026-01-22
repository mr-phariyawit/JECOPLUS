import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as moneyCoachController from '../controllers/moneyCoachController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/money-coach/analyze
 * @desc    Analyze user's financial situation
 * @access  Private
 */
router.get('/analyze', moneyCoachController.analyzeFinancialSituation);

/**
 * @route   GET /api/v1/money-coach/profile
 * @desc    Get user's financial profile
 * @access  Private
 */
router.get('/profile', moneyCoachController.getFinancialProfile);

/**
 * @route   POST /api/v1/money-coach/chat
 * @desc    Chat with money coach
 * @access  Private
 */
router.post('/chat', moneyCoachController.chatWithMoneyCoach);

/**
 * @route   PUT /api/v1/money-coach/profile
 * @desc    Update financial profile
 * @access  Private
 */
router.put('/profile', moneyCoachController.updateFinancialProfile);

export default router;
