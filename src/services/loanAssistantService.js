import api from './api.js';

/**
 * Loan Assistant Service
 * Handles loan recommendations, calculations, and comparisons
 */

/**
 * Get user's loans
 * @returns {Promise<Array>} User's loan applications
 */
export const getMyLoans = async () => {
  try {
    const response = await api.get('/loan-assistant/my-loans');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get my loans:', error);
    throw error;
  }
};

/**
 * Get loan recommendations
 * @param {number} amount - Requested loan amount (optional)
 * @param {number} termMonths - Loan term in months (optional)
 * @returns {Promise<object>} Loan recommendations
 */
export const recommendLoans = async (amount = null, termMonths = null) => {
  try {
    const params = {};
    if (amount) params.amount = amount;
    if (termMonths) params.termMonths = termMonths;

    const response = await api.get('/loan-assistant/recommend', { params });
    return response.data.data;
  } catch (error) {
    console.error('Failed to get loan recommendations:', error);
    throw error;
  }
};

/**
 * Calculate loan installment
 * @param {number} amount - Loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} months - Loan term in months
 * @returns {Promise<object>} Calculation result
 */
export const calculateInstallment = async (amount, annualRate, months) => {
  try {
    const response = await api.post('/loan-assistant/calculate', {
      amount,
      annualRate,
      months,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to calculate installment:', error);
    throw error;
  }
};

/**
 * Compare loan products
 * @param {Array<string>} loanIds - Array of loan product IDs
 * @param {number} amount - Loan amount
 * @param {number} termMonths - Loan term in months
 * @returns {Promise<Array>} Comparison results
 */
export const compareLoans = async (loanIds, amount, termMonths) => {
  try {
    const response = await api.post('/loan-assistant/compare', {
      loanIds,
      amount,
      termMonths,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to compare loans:', error);
    throw error;
  }
};

/**
 * Chat with loan assistant
 * @param {string} message - User message
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<object>} AI response
 */
export const chatWithLoanAssistant = async (message, conversationId = null) => {
  try {
    const response = await api.post('/loan-assistant/chat', {
      message,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to chat with loan assistant:', error);
    throw error;
  }
};

/**
 * Get loan product details
 * @param {string} productId - Loan product ID
 * @returns {Promise<object>} Loan product details
 */
export const getLoanProduct = async (productId) => {
  try {
    const response = await api.get(`/loan-assistant/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get loan product:', error);
    throw error;
  }
};

export default {
  getMyLoans,
  recommendLoans,
  calculateInstallment,
  compareLoans,
  chatWithLoanAssistant,
  getLoanProduct,
};
