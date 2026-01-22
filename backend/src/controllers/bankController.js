import bankService from '../services/bankService.js';

// Standard response helper
const sendResponse = (res, data, message = 'Success') => {
  res.status(200).json({
    status: 'success',
    message,
    data
  });
};

export const addBankAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bankCode, bankName, accountNumber, accountName } = req.body;
    
    // Basic validation handled in service currently
    
    const result = await bankService.addBankAccount(userId, {
        bankCode, 
        bankName, 
        accountNumber, 
        accountName
    });
    
    sendResponse(res, result, 'Bank account linked successfully');
  } catch (error) {
    next(error);
  }
};

export const getBankAccounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accounts = await bankService.getBankAccounts(userId);
    sendResponse(res, accounts);
  } catch (error) {
    next(error);
  }
};

export const deleteBankAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await bankService.deleteBankAccount(userId, id);
        sendResponse(res, null, 'Bank account removed');
    } catch (error) {
        next(error);
    }
};

export default {
  addBankAccount,
  getBankAccounts,
  deleteBankAccount
};
