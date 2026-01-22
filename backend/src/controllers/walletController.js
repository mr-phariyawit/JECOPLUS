import walletService from '../services/walletService.js';
import { handleResponse } from '../utils/helpers.js'; // Assuming helpers exist, or standard res.json

// Standard response helper if not imported
const sendResponse = (res, data, message = 'Success') => {
  res.status(200).json({
    status: 'success',
    message,
    data
  });
};

export const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWallet(userId);
    sendResponse(res, wallet);
  } catch (error) {
    next(error);
  }
};

export const topUp = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, method } = req.body;
    
    // Basic validation
    if (!amount || !method) {
        // Validation middleware usually handles this but check just in case
        throw new Error('Amount and method are required');
    }

    const result = await walletService.topUp(userId, amount, method, req.body);
    sendResponse(res, result, 'Topup successful');
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, bankInfo } = req.body;
    
    const result = await walletService.withdraw(userId, amount, bankInfo);
    sendResponse(res, result, 'Withdrawal initiated');
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;
    
    const transactions = await walletService.getTransactions(userId, { limit, offset });
    sendResponse(res, transactions);
  } catch (error) {
    next(error);
  }
};

export default {
  getBalance,
  topUp,
  withdraw,
  getTransactions
};
