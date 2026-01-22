import express from 'express';
import { authenticate } from '../middleware/auth.js';
import walletController from '../controllers/walletController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Balance
router.get('/balance', walletController.getBalance);

// Transactions
router.post('/topup', walletController.topUp);
router.post('/withdraw', walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;
