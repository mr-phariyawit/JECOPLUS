import express from 'express';
import { authenticate } from '../middleware/auth.js';
import bankController from '../controllers/bankController.js';

const router = express.Router();

router.use(authenticate);

// Bank Accounts
router.get('/', bankController.getBankAccounts);
router.post('/', bankController.addBankAccount);
router.delete('/:id', bankController.deleteBankAccount);

// Bank Statements (Placeholder for now)
// router.post('/statement', bankController.uploadStatement);

export default router;
