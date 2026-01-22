import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as loanAssistantController from '../controllers/loanAssistantController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/loan-assistant/my-loans
 * @desc    Get user's loans
 * @access  Private
 */
router.get('/my-loans', loanAssistantController.getMyLoans);

/**
 * @route   GET /api/v1/loan-assistant/recommend
 * @desc    Get loan recommendations
 * @access  Private
 */
router.get('/recommend', loanAssistantController.recommendLoans);

/**
 * @route   POST /api/v1/loan-assistant/calculate
 * @desc    Calculate loan installment
 * @access  Private
 */
router.post('/calculate', loanAssistantController.calculateInstallment);

/**
 * @route   POST /api/v1/loan-assistant/compare
 * @desc    Compare loan products
 * @access  Private
 */
router.post('/compare', loanAssistantController.compareLoans);

/**
 * @route   POST /api/v1/loan-assistant/chat
 * @desc    Chat with loan assistant
 * @access  Private
 */
router.post('/chat', loanAssistantController.chatWithLoanAssistant);

/**
 * @route   GET /api/v1/loan-assistant/products/:id
 * @desc    Get loan product details
 * @access  Private
 */
router.get('/products/:id', loanAssistantController.getLoanProduct);

export default router;
