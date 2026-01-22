import express from 'express';
import { authenticate } from '../middleware/auth.js';
import creditScoreController from '../controllers/creditScoreController.js';

const router = express.Router();

router.use(authenticate);

// Calculate score (Triggered after statement analysis)
router.post('/calculate', creditScoreController.calculateScore);

export default router;
