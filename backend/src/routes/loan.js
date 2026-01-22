import express from 'express';
import { authenticate } from '../middleware/auth.js';
import loanController from '../controllers/loanController.js';

const router = express.Router();

router.use(authenticate);

// Submit Loan Application
router.post('/apply', loanController.submitApplication);

// Get Application Status
router.get('/status', loanController.getStatus);

export default router;
