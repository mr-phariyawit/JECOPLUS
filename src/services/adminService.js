import api from './api.js';

// Admin token keys (separate from user tokens)
const ADMIN_TOKEN_KEY = 'jecoplus_admin_token';
const ADMIN_REFRESH_TOKEN_KEY = 'jecoplus_admin_refresh_token';

// Mock mode - set to true for demo without backend
const MOCK_MODE = true;

/**
 * Get stored admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

/**
 * Set admin tokens
 */
export const setAdminTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Clear admin tokens
 */
export const clearAdminTokens = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

/**
 * Create admin API instance with admin token
 */
const adminApi = {
  async request(method, url, data = null, config = {}) {
    const token = getAdminToken();
    const headers = {
      ...config.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api({
      method,
      url: `/admin${url}`,
      data,
      ...config,
      headers,
    });

    return response;
  },

  get(url, config) {
    return this.request('get', url, null, config);
  },

  post(url, data, config) {
    return this.request('post', url, data, config);
  },

  patch(url, data, config) {
    return this.request('patch', url, data, config);
  },

  delete(url, config) {
    return this.request('delete', url, null, config);
  },
};

// ============================================
// Authentication
// ============================================

/**
 * Admin login with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{accessToken, refreshToken, admin}>}
 */
export const login = async (email, password) => {
  if (MOCK_MODE) {
    // Mock validation
    if (email === 'admin@jecoplus.com' && password === 'Admin123!') {
      const mockAdmin = {
        id: 'admin-001',
        email: 'admin@jecoplus.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      };

      // Create mock JWT token with admin info
      const payload = btoa(
        JSON.stringify({
          sub: mockAdmin.id,
          email: mockAdmin.email,
          role: mockAdmin.role,
          firstName: mockAdmin.firstName,
          lastName: mockAdmin.lastName,
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })
      );
      const mockToken = `mock.${payload}.signature`;
      const mockRefreshToken = `refresh.${payload}.signature`;

      setAdminTokens(mockToken, mockRefreshToken);

      return { accessToken: mockToken, refreshToken: mockRefreshToken, admin: mockAdmin };
    } else {
      throw { response: { data: { error: { message: 'Invalid email or password' } } } };
    }
  }

  const response = await api.post('/admin/auth/login', { email, password });
  const { accessToken, refreshToken, admin } = response.data.data;

  // Store tokens
  setAdminTokens(accessToken, refreshToken);

  return { accessToken, refreshToken, admin };
};

/**
 * Admin logout
 */
export const logout = async () => {
  try {
    await adminApi.post('/auth/logout');
  } catch (err) {
    // Ignore errors on logout
  } finally {
    clearAdminTokens();
  }
};

// ============================================
// Dashboard
// ============================================

/**
 * Get dashboard statistics
 * @param {string} period - '7d', '30d', or '90d'
 * @returns {Promise<{users, kyc, activity, period}>}
 */
export const getDashboardStats = async (period = '7d') => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300)); // Simulate network delay
    const multiplier = period === '7d' ? 1 : period === '30d' ? 4 : 12;
    return {
      users: {
        total: 12345,
        newToday: 89 * multiplier,
        active: 10234,
        suspended: 45,
        banned: 12,
      },
      kyc: {
        pending: 23,
        verifiedToday: 15 * multiplier,
        rejectedToday: 3 * multiplier,
        totalVerified: 8567,
      },
      activity: {
        dailyLogins: 234 * multiplier,
        activeUsers7d: 8567,
      },
      recentActivity: [
        { id: '1', action: 'APPROVE_KYC', admin: { email: 'admin@jecoplus.com' }, targetType: 'User', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', action: 'SUSPEND_USER', admin: { email: 'admin@jecoplus.com' }, targetType: 'User', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', action: 'REJECT_KYC', admin: { email: 'admin@jecoplus.com' }, targetType: 'User', createdAt: new Date(Date.now() - 10800000).toISOString() },
      ],
      period,
    };
  }

  const response = await adminApi.get(`/dashboard/stats?period=${period}`);
  return response.data.data;
};

// ============================================
// User Management
// ============================================

// Mock user data
const mockUsers = [
  { id: 'u1', phone: '0812345678', firstName: 'สมชาย', lastName: 'ทดสอบ', email: 'somchai@test.com', kycStatus: 'VERIFIED', status: 'ACTIVE', createdAt: '2024-01-15T10:30:00Z' },
  { id: 'u2', phone: '0823456789', firstName: 'สมหญิง', lastName: 'รักดี', email: 'somying@test.com', kycStatus: 'PENDING', status: 'ACTIVE', createdAt: '2024-01-14T09:00:00Z' },
  { id: 'u3', phone: '0834567890', firstName: 'ทดสอบ', lastName: 'ระบบ', email: 'test@test.com', kycStatus: 'REJECTED', status: 'BANNED', createdAt: '2024-01-13T14:20:00Z' },
  { id: 'u4', phone: '0845678901', firstName: 'วิชัย', lastName: 'มั่งมี', email: 'wichai@test.com', kycStatus: 'VERIFIED', status: 'ACTIVE', createdAt: '2024-01-12T11:45:00Z' },
  { id: 'u5', phone: '0856789012', firstName: 'จันทร์', lastName: 'ดี', email: 'jan@test.com', kycStatus: 'NONE', status: 'ACTIVE', createdAt: '2024-01-11T16:30:00Z' },
  { id: 'u6', phone: '0867890123', firstName: 'อังคาร', lastName: 'สุข', email: 'ang@test.com', kycStatus: 'IN_PROGRESS', status: 'SUSPENDED', createdAt: '2024-01-10T08:15:00Z' },
  { id: 'u7', phone: '0878901234', firstName: 'พุธ', lastName: 'เจริญ', email: 'put@test.com', kycStatus: 'VERIFIED', status: 'ACTIVE', createdAt: '2024-01-09T13:00:00Z' },
  { id: 'u8', phone: '0889012345', firstName: 'พฤหัส', lastName: 'บดี', email: 'pru@test.com', kycStatus: 'PENDING', status: 'ACTIVE', createdAt: '2024-01-08T17:45:00Z' },
];

/**
 * List users with filters and pagination
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search by phone/name
 * @param {string} params.kycStatus - Filter by KYC status
 * @param {string} params.status - Filter by user status
 * @param {string} params.sort - Sort field
 * @param {string} params.order - Sort order (asc/desc)
 * @returns {Promise<{users, pagination}>}
 */
export const listUsers = async (params = {}) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockUsers];

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.phone.includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search)
      );
    }
    if (params.kycStatus) {
      filtered = filtered.filter((u) => u.kycStatus === params.kycStatus);
    }
    if (params.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      users: paged,
      pagination: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
    };
  }

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.kycStatus) queryParams.append('kycStatus', params.kycStatus);
  if (params.status) queryParams.append('status', params.status);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.order) queryParams.append('order', params.order);

  const response = await adminApi.get(`/users?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get user detail by ID
 * @param {string} userId - User UUID
 * @returns {Promise<{user, kycHistory}>}
 */
export const getUserDetail = async (userId) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
    return {
      user: { ...user, citizenId: '1-1234-56789-01-2', lastLoginAt: new Date(Date.now() - 86400000).toISOString() },
      kycHistory: [
        { id: 'kyc1', status: 'APPROVED', createdAt: '2024-01-15T10:30:00Z', rejectionReason: null },
        { id: 'kyc2', status: 'REJECTED', createdAt: '2024-01-10T09:00:00Z', rejectionReason: 'ภาพบัตรไม่ชัด' },
      ],
    };
  }

  const response = await adminApi.get(`/users/${userId}`);
  return response.data.data;
};

/**
 * Update user status (suspend/ban/activate)
 * @param {string} userId - User UUID
 * @param {string} status - 'ACTIVE', 'SUSPENDED', or 'BANNED'
 * @param {string} reason - Reason for status change (required for suspend/ban)
 * @returns {Promise<{user}>}
 */
export const updateUserStatus = async (userId, status, reason = null) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const userIdx = mockUsers.findIndex((u) => u.id === userId);
    if (userIdx >= 0) {
      mockUsers[userIdx].status = status;
    }
    return { user: mockUsers[userIdx] || mockUsers[0] };
  }

  const data = { status };
  if (reason) data.reason = reason;

  const response = await adminApi.patch(`/users/${userId}/status`, data);
  return response.data.data;
};

// ============================================
// KYC Management
// ============================================

// Mock KYC sessions
const mockKycSessions = [
  { id: 'kyc1', userId: 'u2', user: { phone: '0823456789', firstName: 'สมหญิง', lastName: 'รักดี' }, status: 'PENDING', faceMatchScore: 92.5, livenessScore: 98.2, ndidStatus: 'VERIFIED', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'kyc2', userId: 'u8', user: { phone: '0889012345', firstName: 'พฤหัส', lastName: 'บดี' }, status: 'PENDING', faceMatchScore: 87.3, livenessScore: 95.1, ndidStatus: 'VERIFIED', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 'kyc3', userId: 'u5', user: { phone: '0856789012', firstName: 'จันทร์', lastName: 'ดี' }, status: 'PROCESSING', faceMatchScore: 45.2, livenessScore: 88.5, ndidStatus: 'PENDING', createdAt: new Date(Date.now() - 18000000).toISOString() },
];

/**
 * List pending KYC requests
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<{sessions, pagination, stats}>}
 */
export const listPendingKyc = async (params = {}) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const page = params.page || 1;
    const limit = params.limit || 20;
    return {
      sessions: mockKycSessions,
      pagination: { total: mockKycSessions.length, page, limit, totalPages: 1 },
      stats: { pending: 23, verifiedToday: 15, rejectedToday: 3 },
    };
  }

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const response = await adminApi.get(`/kyc/pending?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get KYC session detail for review
 * @param {string} sessionId - KYC session UUID
 * @returns {Promise<{session, user, documents}>}
 */
export const getKycDetail = async (sessionId) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const kycSession = mockKycSessions.find((s) => s.id === sessionId) || mockKycSessions[0];
    return {
      session: {
        ...kycSession,
        ocrResult: {
          citizenId: '1-1234-56789-01-2',
          firstName: kycSession.user.firstName,
          lastName: kycSession.user.lastName,
          dateOfBirth: '15 พ.ค. 2533',
          confidence: 95.5,
        },
        faceMatch: {
          score: kycSession.faceMatchScore,
          passed: kycSession.faceMatchScore >= 70,
        },
        liveness: {
          score: kycSession.livenessScore,
          passed: kycSession.livenessScore >= 70,
        },
        ndidVerified: kycSession.ndidStatus === 'VERIFIED',
      },
      user: kycSession.user,
      documents: [
        { type: 'ID_CARD_FRONT', url: 'https://via.placeholder.com/400x250/e0e0e0/666666?text=ID+Card+Front' },
        { type: 'ID_CARD_BACK', url: 'https://via.placeholder.com/400x250/e0e0e0/666666?text=ID+Card+Back' },
        { type: 'SELFIE', url: 'https://via.placeholder.com/300x400/e0e0e0/666666?text=Selfie' },
      ],
    };
  }

  const response = await adminApi.get(`/kyc/${sessionId}`);
  return response.data.data;
};

/**
 * Approve KYC session
 * @param {string} sessionId - KYC session UUID
 * @param {string} notes - Optional approval notes
 * @returns {Promise<{session}>}
 */
export const approveKyc = async (sessionId, notes = null) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const sessionIdx = mockKycSessions.findIndex((s) => s.id === sessionId);
    if (sessionIdx >= 0) {
      mockKycSessions[sessionIdx].status = 'APPROVED';
    }
    return { session: mockKycSessions[sessionIdx] || { id: sessionId, status: 'APPROVED' } };
  }

  const data = {};
  if (notes) data.notes = notes;

  const response = await adminApi.post(`/kyc/${sessionId}/approve`, data);
  return response.data.data;
};

/**
 * Reject KYC session
 * @param {string} sessionId - KYC session UUID
 * @param {string} reason - Rejection reason (required)
 * @param {string} code - Rejection code (optional)
 * @returns {Promise<{session}>}
 */
export const rejectKyc = async (sessionId, reason, code = null) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const sessionIdx = mockKycSessions.findIndex((s) => s.id === sessionId);
    if (sessionIdx >= 0) {
      mockKycSessions[sessionIdx].status = 'REJECTED';
      mockKycSessions[sessionIdx].rejectionReason = reason;
    }
    return { session: mockKycSessions[sessionIdx] || { id: sessionId, status: 'REJECTED' } };
  }

  const data = { reason };
  if (code) data.code = code;

  const response = await adminApi.post(`/kyc/${sessionId}/reject`, data);
  return response.data.data;
};

// ============================================
// Activity Logs
// ============================================

// Mock activity logs
const mockActivityLogs = [
  { id: '1', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'LOGIN', targetType: null, targetId: null, details: null, ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: '2', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'APPROVE_KYC', targetType: 'User', targetId: 'u1', details: 'KYC approved', ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'SUSPEND_USER', targetType: 'User', targetId: 'u6', details: 'Suspicious activity', ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', adminId: 'admin-002', admin: { email: 'superadmin@jecoplus.com' }, action: 'REJECT_KYC', targetType: 'User', targetId: 'u3', details: 'ภาพบัตรไม่ชัด', ipAddress: '192.168.1.101', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '5', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'BAN_USER', targetType: 'User', targetId: 'u3', details: 'Multiple fraud attempts', ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: '6', adminId: 'admin-002', admin: { email: 'superadmin@jecoplus.com' }, action: 'LOGIN', targetType: null, targetId: null, details: null, ipAddress: '192.168.1.101', createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: '7', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'APPROVE_KYC', targetType: 'User', targetId: 'u4', details: 'All documents verified', ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 21600000).toISOString() },
  { id: '8', adminId: 'admin-001', admin: { email: 'admin@jecoplus.com' }, action: 'LOGOUT', targetType: null, targetId: null, details: null, ipAddress: '192.168.1.100', createdAt: new Date(Date.now() - 25200000).toISOString() },
];

/**
 * Get admin activity logs
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.adminId - Filter by admin ID
 * @param {string} params.action - Filter by action type
 * @param {string} params.fromDate - Filter from date
 * @param {string} params.toDate - Filter to date
 * @returns {Promise<{logs, pagination}>}
 */
export const getActivityLogs = async (params = {}) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));

    let filtered = [...mockActivityLogs];

    // Apply filters
    if (params.adminId) {
      filtered = filtered.filter((l) => l.adminId === params.adminId);
    }
    if (params.action) {
      filtered = filtered.filter((l) => l.action === params.action);
    }

    // Sort
    if (params.sortBy === 'createdAt') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return params.sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      logs: paged,
      pagination: { total: filtered.length, page, limit },
    };
  }

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.adminId) queryParams.append('adminId', params.adminId);
  if (params.action) queryParams.append('action', params.action);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  const response = await adminApi.get(`/activity-logs?${queryParams.toString()}`);
  return response.data.data;
};

export default {
  // Auth
  login,
  logout,
  getAdminToken,
  setAdminTokens,
  clearAdminTokens,

  // Dashboard
  getDashboardStats,

  // Users
  listUsers,
  getUserDetail,
  updateUserStatus,

  // KYC
  listPendingKyc,
  getKycDetail,
  approveKyc,
  rejectKyc,

  // Activity Logs
  getActivityLogs,
};
