import express from 'express';
import { authenticate } from '../middleware/auth.js';
import walletController from '../controllers/walletController.js';

import { validateCSRFToken } from '../middleware/csrf.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Balance
router.get('/balance', walletController.getBalance);

// Transactions
router.post('/topup', validateCSRFToken, walletController.topUp);
router.post('/withdraw', validateCSRFToken, walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;
