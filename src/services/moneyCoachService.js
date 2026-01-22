import api from './api.js';

/**
 * Money Coach Service
 * Handles financial analysis and money coach interactions
 */

/**
 * Analyze user's financial situation
 * @returns {Promise<object>} Financial analysis data
 */
export const analyzeFinancialSituation = async () => {
  try {
    const response = await api.get('/money-coach/analyze');
    return response.data.data;
  } catch (error) {
    console.error('Failed to analyze financial situation:', error);
    throw error;
  }
};

/**
 * Get financial profile
 * @returns {Promise<object|null>} Financial profile or null
 */
export const getFinancialProfile = async () => {
  try {
    const response = await api.get('/money-coach/profile');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get financial profile:', error);
    throw error;
  }
};

/**
 * Update financial profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated profile
 */
export const updateFinancialProfile = async (profileData) => {
  try {
    const response = await api.put('/money-coach/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update financial profile:', error);
    throw error;
  }
};

/**
 * Chat with money coach
 * @param {string} message - User message
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<object>} AI response
 */
export const chatWithMoneyCoach = async (message, conversationId = null) => {
  try {
    const response = await api.post('/money-coach/chat', {
      message,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to chat with money coach:', error);
    throw error;
  }
};

export default {
  analyzeFinancialSituation,
  getFinancialProfile,
  updateFinancialProfile,
  chatWithMoneyCoach,
};
