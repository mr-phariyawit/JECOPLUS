import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export const submitApplication = async (userId, data) => {
    // 1. Verify Credit Score Existence
    const scoreResult = await query(
        `SELECT id, score, status FROM credit_scores WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );

    if (scoreResult.rows.length === 0) {
        throw new Error('No credit score found. Please complete credit scoring first.');
    }
    
    const latestScore = scoreResult.rows[0];

    // 2. Create Application
    const { amount, term, purpose } = data;
    const insertResult = await query(
        `INSERT INTO loan_applications 
        (user_id, amount_requested, term_months, purpose, credit_score_id, status, submitted_at)
        VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())
        RETURNING *`,
        [userId, amount, term, purpose, latestScore.id]
    );

    const application = insertResult.rows[0];
    logger.info(`Loan application submitted for user ${userId}: ${application.id}`);

    // Mock: Auto-Approve if Score > 750 (for Sprint Demo speed)
    if (latestScore.score >= 750) {
         // In real world, this would be a separate background job or admin action
         // We'll leave it as PENDING for now to show tracking flow
    }

    return application;
};

export const getApplicationStatus = async (userId) => {
    const result = await query(
        `SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );
    return result.rows[0] || null;
};

export default {
    submitApplication,
    getApplicationStatus
};
