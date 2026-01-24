import api, { setTokens, clearTokens, getRefreshToken } from './api.js';

// Mock mode - reads from environment variable
const MOCK_MODE = import.meta.env.VITE_MOCKUP_MODE === 'true';

// Mock OTP sessions storage
const mockOtpSessions = {};

/**
 * Request OTP for login
 * @param {string} phone - Thai phone number (10 digits)
 * @returns {Promise<{sessionId: string, expiresIn: number, maskedPhone: string}>}
 */
export const requestOtp = async (phone) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500)); // Simulate network delay

    // Generate mock session
    const sessionId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockOtp = '123456'; // Fixed OTP for demo

    // Store session
    mockOtpSessions[sessionId] = {
      phone,
      otp: mockOtp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    };

    // Mask phone number
    const maskedPhone = phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1-****-$3');

    return {
      sessionId,
      expiresIn: 300,
      maskedPhone,
      // Development mode: show OTP hint
      devOtp: mockOtp,
    };
  }

  const response = await api.post('/auth/otp/request', { phone });
  return response.data.data;
};

/**
 * Verify OTP and get tokens
 * @param {string} sessionId - OTP session ID
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{accessToken: string, refreshToken: string, user: object}>}
 */
export const verifyOtp = async (sessionId, otp) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500)); // Simulate network delay

    const session = mockOtpSessions[sessionId];

    // Check session exists
    if (!session) {
      throw { response: { data: { error: { message: 'Session หมดอายุ กรุณาขอ OTP ใหม่', code: 'SESSION_EXPIRED' } } } };
    }

    // Check if expired
    if (Date.now() > session.expiresAt) {
      delete mockOtpSessions[sessionId];
      throw { response: { data: { error: { message: 'OTP หมดอายุ กรุณาขอใหม่', code: 'OTP_EXPIRED' } } } };
    }

    // Check attempts
    session.attempts++;
    if (session.attempts > 5) {
      delete mockOtpSessions[sessionId];
      throw { response: { data: { error: { message: 'ลองผิดเกินจำนวนครั้ง กรุณาขอ OTP ใหม่', code: 'MAX_ATTEMPTS' } } } };
    }

    // Verify OTP
    if (otp !== session.otp) {
      throw {
        response: {
          data: {
            error: {
              message: 'รหัส OTP ไม่ถูกต้อง',
              code: 'INVALID_OTP',
              details: { attemptsRemaining: 5 - session.attempts },
            },
          },
        },
      };
    }

    // Success - create mock user and tokens
    const mockUser = {
      id: `user_${session.phone}`,
      phone: session.phone,
      firstName: 'ทดสอบ',
      lastName: 'ผู้ใช้',
      email: null,
      kycStatus: 'NONE',
      isNewUser: false,
    };

    // Create mock JWT token
    const payload = btoa(
      JSON.stringify({
        sub: mockUser.id,
        phone: mockUser.phone,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    );
    const mockAccessToken = `mock.${payload}.signature`;
    const mockRefreshToken = `refresh.${payload}.signature`;

    // Store tokens
    setTokens(mockAccessToken, mockRefreshToken);

    // Clean up session
    delete mockOtpSessions[sessionId];

    return { accessToken: mockAccessToken, refreshToken: mockRefreshToken, user: mockUser };
  }

  const response = await api.post('/auth/otp/verify', { sessionId, otp });
  const { accessToken, refreshToken, user, csrfToken } = response.data.data;

  // Store tokens
  setTokens(accessToken, refreshToken);
  
  if (csrfToken) {
    localStorage.setItem('csrf_token', csrfToken);
  }

  return { accessToken, refreshToken, user };
};

/**
 * Refresh access token
 * @returns {Promise<{accessToken: string}>}
 */
export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  const response = await api.post('/auth/token/refresh', { refreshToken: refresh });
  const { accessToken } = response.data.data;

  setTokens(accessToken, null);

  return { accessToken };
};

/**
 * Logout
 * @param {boolean} allDevices - Logout from all devices
 */
export const logout = async (allDevices = false) => {
  try {
    if (!MOCK_MODE) {
      const refresh = getRefreshToken();
      await api.post('/auth/logout', {
        refreshToken: refresh,
        allDevices,
      });
    }
  } catch (error) {
    // Ignore errors during logout
    console.warn('Logout error:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Get active sessions
 * @returns {Promise<{sessions: Array}>}
 */
export const getSessions = async () => {
  const response = await api.get('/auth/sessions');
  return response.data.data;
};

/**
 * Revoke a specific session
 * @param {string} sessionId - Session ID to revoke
 */
export const revokeSession = async (sessionId) => {
  await api.delete(`/auth/sessions/${sessionId}`);
};

export default {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  getSessions,
  revokeSession,
};
