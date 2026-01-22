import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export const calculateScore = async (userId, data) => {
    const { monthlyIncome, monthlyExpenses, avgBalance } = data;
    
    // Scoring Algorithm (as per Plan)
    // Base Score: 300
    let score = 300;

    // 1. Income Stability (30% weight, max 165)
    // For now, based on income magnitude as proxy for stability + capacity
    // > 50k = 165, > 30k = 120, > 15k = 80
    if (monthlyIncome >= 50000) score += 165;
    else if (monthlyIncome >= 30000) score += 120;
    else if (monthlyIncome >= 15000) score += 80;
    else score += 30;

    // 2. Expense Ratio (20% weight, max 110)
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) : 1;
    if (expenseRatio < 0.5) score += 110;       // < 50% expenses
    else if (expenseRatio < 0.7) score += 80;   // < 70% expenses
    else if (expenseRatio < 0.85) score += 50;  // < 85% expenses
    // else 0 points

    // 3. Average Balance (20% weight, max 110)
    // Max points if avg balance >= 20,000
    const balanceScore = Math.min((avgBalance / 20000), 1) * 110;
    score += balanceScore;

    // 4. Other factors (30%, max 165)
    // Age, Employment, etc. - Mock randomized for now between 50-100
    // To ensure deterministic tests, we might need a way to control this, or just mock it high enough
    score += 80; 

    // Cap Score
    score = Math.floor(Math.min(850, Math.max(300, score)));

    // Determine Status
    const status = score >= 700 ? 'APPROVED' : 'REJECTED';

    const result = {
        score,
        status,
        monthlyIncome,
        monthlyExpenses,
        expenseRatio,
        avgBalance
    };

    // Persist to DB
    await saveScore(userId, result);

    return result;
};

const saveScore = async (userId, result) => {
    try {
        await query(
            `INSERT INTO credit_scores 
            (user_id, score, status, monthly_income, monthly_expenses, expense_ratio, avg_balance, factors_breakdown)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                userId, 
                result.score, 
                result.status, 
                result.monthlyIncome, 
                result.monthlyExpenses, 
                result.expenseRatio, 
                result.avgBalance, 
                JSON.stringify({ algorithm: 'v1' })
            ]
        );
        logger.info(`Credit score calculated for user ${userId}: ${result.score} (${result.status})`);
    } catch (error) {
        logger.error('Error saving credit score:', error);
        // Don't throw logic error strictly on save fail? Or should we?
        // Let's log but return result so user sees it.
    }
};

export default {
    calculateScore
};
