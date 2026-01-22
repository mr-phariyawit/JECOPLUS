import api, { getAccessToken } from './api.js';

// Mock mode - set to true for demo without backend
const MOCK_MODE = true;

/**
 * Get current user profile
 * @returns {Promise<object>}
 */
export const getProfile = async () => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 200));

    // Try to get phone from token
    const token = getAccessToken();
    let phone = '0812345678';

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        phone = payload.phone || phone;
      } catch (e) {
        // Ignore parse errors
      }
    }

    return {
      id: `user_${phone}`,
      phone,
      firstName: 'ทดสอบ',
      lastName: 'ผู้ใช้',
      email: null,
      kycStatus: 'NONE',
      createdAt: new Date().toISOString(),
    };
  }

  const response = await api.get('/users/me');
  return response.data.data;
};

/**
 * Update user profile
 * @param {object} data - Profile data to update
 * @returns {Promise<object>}
 */
export const updateProfile = async (data) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      ...data,
      id: 'user_mock',
      phone: '0812345678',
      kycStatus: 'NONE',
    };
  }

  const response = await api.patch('/users/me', data);
  return response.data.data;
};

/**
 * Get KYC status
 * @returns {Promise<{status: string, canSubmitKyc: boolean, latestSession: object}>}
 */
export const getKycStatus = async () => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      status: 'NONE',
      canSubmitKyc: true,
      latestSession: null,
    };
  }

  const response = await api.get('/users/me/kyc-status');
  return response.data.data;
};

export default {
  getProfile,
  updateProfile,
  getKycStatus,
};
