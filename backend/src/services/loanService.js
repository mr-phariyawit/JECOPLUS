import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import partnerService from './partnerService.js';
import creditScoreService from './creditScoreService.js';

/**
 * Submit loan application
 * Auto-submits to partner if credit score >= 700
 *
 * @param {string} userId - User ID
 * @param {object} data - Application data
 * @returns {Promise<object>} Application result
 */
export const submitApplication = async (userId, data) => {
    // 1. Get user's latest credit score
    const scoreResult = await query(
        `SELECT cs.*, u.first_name, u.last_name, u.phone_number, u.email, u.birth_date
         FROM credit_scores cs
         JOIN users u ON cs.user_id = u.id
         WHERE cs.user_id = $1
         ORDER BY cs.created_at DESC
         LIMIT 1`,
        [userId]
    );

    if (scoreResult.rows.length === 0) {
        throw new Error('No credit score found. Please complete credit scoring first.');
    }

    const creditData = scoreResult.rows[0];
    const latestScore = {
        id: creditData.id,
        score: creditData.score,
        status: creditData.status,
        breakdown: creditData.factors_breakdown
    };

    // 2. Get KYC data for citizenId
    const kycResult = await query(
        `SELECT citizen_id FROM kyc_sessions WHERE user_id = $1 AND status = 'COMPLETED' LIMIT 1`,
        [userId]
    );

    const citizenId = kycResult.rows[0]?.citizen_id || null;

    // 3. Create loan application
    const { amount, term, purpose } = data;
    const insertResult = await query(
        `INSERT INTO loan_applications
        (user_id, amount_requested, term_months, purpose, credit_score_id, status, submitted_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *`,
        [
            userId,
            amount,
            term,
            purpose,
            latestScore.id,
            latestScore.status === 'APPROVED' ? 'PENDING_PARTNER' : 'REJECTED'
        ]
    );

    const application = insertResult.rows[0];
    logger.info(`Loan application created for user ${userId}: ${application.id} (Status: ${application.status})`);

    // 4. Auto-submit to partner if approved (score >= 700)
    let partnerSubmission = null;
    if (partnerService.shouldAutoSubmit(latestScore)) {
        try {
            // Calculate age from birth date
            const age = creditScoreService.calculateAge(creditData.birth_date);

            // Prepare data for partner submission
            const applicationData = {
                loanAmount: amount,
                loanPurpose: purpose,
                loanTerm: term,
                creditScore: latestScore,
                userProfile: {
                    citizenId,
                    firstName: creditData.first_name,
                    lastName: creditData.last_name,
                    birthDate: creditData.birth_date,
                    age,
                    phoneNumber: creditData.phone_number,
                    email: creditData.email
                },
                financialData: {
                    monthlyIncome: creditData.monthly_income,
                    monthlyExpenses: creditData.monthly_expenses,
                    expenseRatio: creditData.expense_ratio,
                    avgBalance: creditData.avg_balance
                }
            };

            partnerSubmission = await partnerService.submitToPartner(userId, applicationData);

            // Update application with partner info
            await query(
                `UPDATE loan_applications
                 SET partner_application_id = $1,
                     status = $2,
                     updated_at = NOW()
                 WHERE id = $3`,
                [
                    partnerSubmission.applicationId,
                    partnerSubmission.status,
                    application.id
                ]
            );

            logger.info(`Application ${application.id} auto-submitted to partner: ${partnerSubmission.partnerId}`);

        } catch (error) {
            logger.error(`Failed to submit application ${application.id} to partner:`, error);
            // Don't fail the whole request - application is still created
            // Update status to indicate partner submission failed
            await query(
                `UPDATE loan_applications SET status = 'SUBMISSION_FAILED' WHERE id = $1`,
                [application.id]
            );
        }
    }

    return {
        ...application,
        creditScore: latestScore,
        partnerSubmission: partnerSubmission || null,
        autoSubmitted: partnerSubmission !== null
    };
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
