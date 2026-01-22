import creditScoreService from '../services/creditScoreService.js';

const sendResponse = (res, data) => {
    res.status(200).json({ status: 'success', data });
};

export const calculateScore = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // In real flow, input might come from analyze results or DB aggregation
        // Here we accept it from body for the sprint scope (hooked from statement upload)
        const { income, expenses, avgBalance } = req.body;
        
        const result = await creditScoreService.calculateScore(userId, {
            monthlyIncome: income,
            monthlyExpenses: expenses,
            avgBalance: avgBalance || 0
        });

        sendResponse(res, result);
    } catch (error) {
        next(error);
    }
};

export default {
    calculateScore
};
