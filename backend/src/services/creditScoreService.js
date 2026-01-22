import { query } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Calculate credit score based on bank statement data and user profile
 * Score range: 300-850
 * Threshold: 700 (>=700 = APPROVED, <700 = REJECTED)
 *
 * @param {string} userId - User ID
 * @param {object} data - Input data containing financial and personal information
 * @returns {object} Credit score result
 */
export const calculateScore = async (userId, data) => {
    const {
        // Financial data from bank statement
        monthlyIncome,
        monthlyExpenses,
        avgBalance,
        incomeVariance = null, // Optional: standard deviation of monthly income

        // User profile data
        age = null, // From KYC
        employmentType = null, // 'permanent', 'contract', 'self-employed', 'unemployed'
        employmentDuration = null, // Months in current job

        // Internal data
        paymentHistory = null // { onTimePayments, totalPayments }
    } = data;

    // Base Score: 300
    let score = 300;
    const breakdown = {};

    // ==========================================
    // 1. Income Stability (30% weight, max +165 points)
    // ==========================================
    let incomeScore = 0;

    // Primary factor: Income amount (indicates repayment capacity)
    if (monthlyIncome >= 50000) {
        incomeScore += 100;
    } else if (monthlyIncome >= 30000) {
        incomeScore += 75;
    } else if (monthlyIncome >= 15000) {
        incomeScore += 50;
    } else if (monthlyIncome >= 10000) {
        incomeScore += 30;
    } else {
        incomeScore += 10;
    }

    // Secondary factor: Income stability (if variance data available)
    if (incomeVariance !== null) {
        const coefficientOfVariation = monthlyIncome > 0 ? (incomeVariance / monthlyIncome) : 1;
        if (coefficientOfVariation < 0.1) {
            incomeScore += 65; // Very stable income
        } else if (coefficientOfVariation < 0.2) {
            incomeScore += 45; // Stable income
        } else if (coefficientOfVariation < 0.3) {
            incomeScore += 20; // Moderate stability
        }
        // else 0 points for high variance
    } else {
        // If no variance data, give partial credit based on income alone
        incomeScore += 35;
    }

    incomeScore = Math.min(incomeScore, 165);
    score += incomeScore;
    breakdown.incomeStability = incomeScore;

    // ==========================================
    // 2. Expense Ratio (20% weight, max +110 points)
    // ==========================================
    let expenseScore = 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) : 1;

    if (expenseRatio < 0.5) {
        expenseScore = 110; // Excellent savings rate
    } else if (expenseRatio < 0.7) {
        expenseScore = 80; // Good savings rate
    } else if (expenseRatio < 0.85) {
        expenseScore = 50; // Moderate savings
    } else if (expenseRatio < 1.0) {
        expenseScore = 20; // Living paycheck to paycheck
    }
    // else 0 points (spending more than income)

    score += expenseScore;
    breakdown.expenseRatio = { score: expenseScore, ratio: expenseRatio };

    // ==========================================
    // 3. Average Balance (20% weight, max +110 points)
    // ==========================================
    // Linear scale: 0 THB = 0 points, 20,000 THB+ = 110 points
    const balanceScore = Math.floor(Math.min((avgBalance / 20000), 1) * 110);
    score += balanceScore;
    breakdown.averageBalance = { score: balanceScore, balance: avgBalance };

    // ==========================================
    // 4. Payment History (15% weight, max +82 points)
    // ==========================================
    let paymentScore = 0;
    if (paymentHistory && paymentHistory.totalPayments > 0) {
        const onTimeRate = paymentHistory.onTimePayments / paymentHistory.totalPayments;
        if (onTimeRate >= 0.95) {
            paymentScore = 82; // Excellent
        } else if (onTimeRate >= 0.85) {
            paymentScore = 60; // Good
        } else if (onTimeRate >= 0.75) {
            paymentScore = 35; // Fair
        } else if (onTimeRate >= 0.50) {
            paymentScore = 15; // Poor
        }
        // else 0 points
        breakdown.paymentHistory = { score: paymentScore, onTimeRate };
    } else {
        // No payment history - give partial credit for new customers
        paymentScore = 40;
        breakdown.paymentHistory = { score: paymentScore, onTimeRate: 'N/A' };
    }
    score += paymentScore;

    // ==========================================
    // 5. Employment Factor (10% weight, max +55 points)
    // ==========================================
    let employmentScore = 0;

    // Employment type
    if (employmentType === 'permanent') {
        employmentScore += 30;
    } else if (employmentType === 'contract') {
        employmentScore += 20;
    } else if (employmentType === 'self-employed') {
        employmentScore += 15;
    }
    // unemployed = 0 points

    // Employment duration (stability)
    if (employmentDuration !== null) {
        if (employmentDuration >= 36) {
            employmentScore += 25; // 3+ years
        } else if (employmentDuration >= 24) {
            employmentScore += 20; // 2+ years
        } else if (employmentDuration >= 12) {
            employmentScore += 15; // 1+ year
        } else if (employmentDuration >= 6) {
            employmentScore += 10; // 6+ months
        } else {
            employmentScore += 5; // < 6 months
        }
    } else {
        // No data - give partial credit
        employmentScore += 12;
    }

    employmentScore = Math.min(employmentScore, 55);
    score += employmentScore;
    breakdown.employment = { score: employmentScore, type: employmentType, duration: employmentDuration };

    // ==========================================
    // 6. Age Factor (5% weight, max +28 points)
    // ==========================================
    let ageScore = 0;
    if (age !== null) {
        if (age >= 30 && age <= 55) {
            ageScore = 28; // Prime working age
        } else if (age >= 25 && age < 30) {
            ageScore = 22; // Young professional
        } else if (age >= 55 && age <= 65) {
            ageScore = 18; // Experienced, nearing retirement
        } else if (age >= 18 && age < 25) {
            ageScore = 12; // Young, less established
        } else if (age > 65) {
            ageScore = 10; // Retirement age
        }
    } else {
        // No age data - give partial credit
        ageScore = 14;
    }
    score += ageScore;
    breakdown.age = { score: ageScore, age };

    // ==========================================
    // Final Score Calculation
    // ==========================================
    // Cap score between 300 and 850
    score = Math.floor(Math.min(850, Math.max(300, score)));

    // Determine approval status
    const status = score >= 700 ? 'APPROVED' : 'REJECTED';

    const result = {
        score,
        status,
        breakdown,
        inputs: {
            monthlyIncome,
            monthlyExpenses,
            expenseRatio,
            avgBalance,
            age,
            employmentType
        },
        calculatedAt: new Date().toISOString()
    };

    // Persist to database
    await saveScore(userId, result);

    logger.info(`Credit score calculated for user ${userId}: ${score} (${status})`);

    return result;
};

const saveScore = async (userId, result) => {
    try {
        await query(
            `INSERT INTO credit_scores
            (user_id, score, status, monthly_income, monthly_expenses, expense_ratio, avg_balance, factors_breakdown, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id)
            DO UPDATE SET
                score = EXCLUDED.score,
                status = EXCLUDED.status,
                monthly_income = EXCLUDED.monthly_income,
                monthly_expenses = EXCLUDED.monthly_expenses,
                expense_ratio = EXCLUDED.expense_ratio,
                avg_balance = EXCLUDED.avg_balance,
                factors_breakdown = EXCLUDED.factors_breakdown,
                updated_at = NOW()`,
            [
                userId,
                result.score,
                result.status,
                result.inputs.monthlyIncome,
                result.inputs.monthlyExpenses,
                result.inputs.expenseRatio,
                result.inputs.avgBalance,
                JSON.stringify(result.breakdown),
                new Date()
            ]
        );
        logger.info(`Credit score saved for user ${userId}`);
    } catch (error) {
        logger.error('Error saving credit score:', error);
        // Log error but don't fail the request - user still gets the result
    }
};

/**
 * Analyze bank statement transactions to extract financial metrics
 *
 * @param {Array} transactions - Array of transaction objects
 * @returns {object} Financial metrics
 */
export const analyzeTransactions = (transactions) => {
    if (!transactions || transactions.length === 0) {
        return {
            monthlyIncome: 0,
            monthlyExpenses: 0,
            avgBalance: 0,
            incomeVariance: 0,
            transactionCount: 0
        };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let balances = [];
    const monthlyIncomes = {};

    // Process each transaction
    transactions.forEach((tx) => {
        const amount = parseFloat(tx.amount) || 0;
        const balance = parseFloat(tx.balance) || 0;

        if (amount > 0) {
            // Credit/Deposit = Income
            totalIncome += amount;

            // Track monthly income for variance calculation
            const month = tx.date ? new Date(tx.date).toISOString().substring(0, 7) : 'unknown';
            monthlyIncomes[month] = (monthlyIncomes[month] || 0) + amount;
        } else if (amount < 0) {
            // Debit/Withdrawal = Expense
            totalExpenses += Math.abs(amount);
        }

        // Track balances
        if (balance > 0) {
            balances.push(balance);
        }
    });

    // Calculate average balance
    const avgBalance = balances.length > 0
        ? balances.reduce((sum, bal) => sum + bal, 0) / balances.length
        : 0;

    // Estimate monthly income/expenses
    const months = Object.keys(monthlyIncomes).length || 1;
    const monthlyIncome = totalIncome / months;
    const monthlyExpenses = totalExpenses / months;

    // Calculate income variance (standard deviation)
    const incomeValues = Object.values(monthlyIncomes);
    let incomeVariance = 0;
    if (incomeValues.length > 1) {
        const mean = monthlyIncome;
        const squaredDiffs = incomeValues.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / incomeValues.length;
        incomeVariance = Math.sqrt(variance);
    }

    return {
        monthlyIncome: Math.round(monthlyIncome),
        monthlyExpenses: Math.round(monthlyExpenses),
        avgBalance: Math.round(avgBalance),
        incomeVariance: Math.round(incomeVariance),
        transactionCount: transactions.length,
        months,
        totalIncome: Math.round(totalIncome),
        totalExpenses: Math.round(totalExpenses)
    };
};

/**
 * Get user's age from birth date
 *
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {number|null} Age in years
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age >= 0 && age <= 150 ? age : null;
};

export default {
    calculateScore,
    analyzeTransactions,
    calculateAge
};
