import logger from '../utils/logger.js';
import { query } from '../config/database.js';

/**
 * Partner API Service
 * Handles submission of loan applications to external lending partners
 */

/**
 * Submit loan application to partner
 *
 * @param {string} userId - User ID
 * @param {object} applicationData - Loan application data
 * @returns {Promise<object>} Submission result
 */
export const submitToPartner = async (userId, applicationData) => {
    const {
        loanAmount,
        loanPurpose,
        creditScore,
        userProfile,
        financialData
    } = applicationData;

    try {
        logger.info(`Submitting loan application to partner for user ${userId}`);

        // Prepare payload for partner API
        const payload = {
            applicant: {
                userId,
                citizenId: userProfile.citizenId,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                birthDate: userProfile.birthDate,
                age: userProfile.age,
                phoneNumber: userProfile.phoneNumber,
                email: userProfile.email
            },
            loan: {
                requestedAmount: loanAmount,
                purpose: loanPurpose,
                proposedTerm: applicationData.loanTerm || 12 // months
            },
            creditAssessment: {
                score: creditScore.score,
                status: creditScore.status,
                monthlyIncome: financialData.monthlyIncome,
                monthlyExpenses: financialData.monthlyExpenses,
                expenseRatio: financialData.expenseRatio,
                avgBalance: financialData.avgBalance,
                breakdown: creditScore.breakdown
            },
            metadata: {
                submittedAt: new Date().toISOString(),
                source: 'JECO_PLATFORM',
                version: '1.0'
            }
        };

        // In production, this would call the actual partner API
        // For now, we'll simulate the API call
        const partnerResponse = await callPartnerAPI(payload);

        // Save submission record
        await saveSubmission(userId, {
            partnerId: partnerResponse.partnerId,
            applicationId: partnerResponse.applicationId,
            status: partnerResponse.status,
            payload,
            response: partnerResponse
        });

        logger.info(`Loan application submitted successfully for user ${userId}. Partner ID: ${partnerResponse.partnerId}`);

        return {
            success: true,
            partnerId: partnerResponse.partnerId,
            applicationId: partnerResponse.applicationId,
            status: partnerResponse.status,
            message: partnerResponse.message,
            estimatedResponseTime: partnerResponse.estimatedResponseTime
        };

    } catch (error) {
        logger.error(`Error submitting to partner for user ${userId}:`, error);

        // Save failed submission
        await saveSubmission(userId, {
            status: 'FAILED',
            error: error.message
        });

        throw error;
    }
};

/**
 * Call partner API (mock implementation)
 * In production, replace with actual HTTP request to partner endpoint
 *
 * @param {object} payload - Request payload
 * @returns {Promise<object>} Partner response
 */
const callPartnerAPI = async (payload) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock partner API response
    const mockPartnerId = `PTN-${Date.now()}`;
    const mockApplicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Simulate different outcomes based on credit score
    const score = payload.creditAssessment.score;
    let status, message;

    if (score >= 750) {
        status = 'APPROVED';
        message = 'Application approved. Funds will be disbursed within 24 hours.';
    } else if (score >= 700) {
        status = 'PENDING_REVIEW';
        message = 'Application under review. Decision within 2-3 business days.';
    } else {
        // This shouldn't happen as we only submit approved (>=700) applications
        status = 'REJECTED';
        message = 'Credit score below threshold.';
    }

    return {
        partnerId: mockPartnerId,
        applicationId: mockApplicationId,
        status,
        message,
        estimatedResponseTime: status === 'APPROVED' ? '24 hours' : '2-3 business days',
        approvedAmount: status === 'APPROVED' ? payload.loan.requestedAmount : null,
        interestRate: status === 'APPROVED' ? 12.5 : null, // 12.5% APR
        term: status === 'APPROVED' ? payload.loan.proposedTerm : null,
        receivedAt: new Date().toISOString()
    };

    // In production, use actual HTTP client:
    /*
    const response = await fetch(process.env.PARTNER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PARTNER_API_KEY}`,
            'X-API-Version': '1.0'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Partner API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
    */
};

/**
 * Save partner submission record to database
 *
 * @param {string} userId - User ID
 * @param {object} data - Submission data
 */
const saveSubmission = async (userId, data) => {
    try {
        await query(
            `INSERT INTO partner_submissions
            (user_id, partner_id, application_id, status, payload, response, submitted_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                userId,
                data.partnerId || null,
                data.applicationId || null,
                data.status,
                JSON.stringify(data.payload || {}),
                JSON.stringify(data.response || data.error || {})
            ]
        );
    } catch (error) {
        logger.error('Error saving partner submission:', error);
        // Don't throw - submission already sent, just log the DB error
    }
};

/**
 * Get submission status from partner
 *
 * @param {string} applicationId - Partner application ID
 * @returns {Promise<object>} Status update
 */
export const getSubmissionStatus = async (applicationId) => {
    try {
        // Mock implementation - query partner API for status
        const status = await query(
            `SELECT * FROM partner_submissions WHERE application_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
            [applicationId]
        );

        if (status.rows.length === 0) {
            throw new Error('Application not found');
        }

        return {
            applicationId,
            status: status.rows[0].status,
            lastUpdated: status.rows[0].submitted_at
        };

        // In production:
        /*
        const response = await fetch(`${process.env.PARTNER_API_URL}/applications/${applicationId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.PARTNER_API_KEY}`
            }
        });
        return await response.json();
        */
    } catch (error) {
        logger.error(`Error getting submission status for ${applicationId}:`, error);
        throw error;
    }
};

/**
 * Check if auto-submission criteria are met
 *
 * @param {object} creditScore - Credit score result
 * @returns {boolean} Whether to auto-submit
 */
export const shouldAutoSubmit = (creditScore) => {
    // Auto-submit if score >= 700 (approved)
    return creditScore.status === 'APPROVED' && creditScore.score >= 700;
};

export default {
    submitToPartner,
    getSubmissionStatus,
    shouldAutoSubmit
};
