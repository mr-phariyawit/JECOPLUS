import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as adminService from '../services/adminService';

export const useAdminStore = defineStore('admin', () => {
  // ============================================
  // State
  // ============================================

  // Auth
  const admin = ref(null);
  const isAuthenticated = ref(false);

  // Dashboard
  const dashboardStats = ref(null);
  const dashboardPeriod = ref('7d');

  // Users
  const users = ref([]);
  const usersPagination = ref({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const usersFilters = ref({ search: '', kycStatus: '', status: '', sort: 'createdAt', order: 'desc' });
  const selectedUser = ref(null);

  // KYC
  const kycQueue = ref([]);
  const kycPagination = ref({ total: 0, page: 1, limit: 20 });
  const kycStats = ref({ pending: 0, verifiedToday: 0, rejectedToday: 0 });
  const selectedKyc = ref(null);

  // Loans
  const loans = ref([]);
  const loansPagination = ref({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const loansFilters = ref({ search: '', status: '', sort: 'submittedAt', order: 'desc' });
  const loansStats = ref({ pending: 0, approvedToday: 0, rejectedToday: 0 });
  const selectedLoan = ref(null);

  // Activity Logs
  const activityLogs = ref([]);
  const logsPagination = ref({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const logsFilters = ref({ adminId: '', action: '', fromDate: '', toDate: '' });

  // Loading & Error
  const isLoading = ref(false);
  const error = ref(null);

  // ============================================
  // Getters
  // ============================================

  const adminName = computed(() => {
    if (!admin.value) return '';
    return `${admin.value.firstName || ''} ${admin.value.lastName || ''}`.trim() || admin.value.email;
  });

  const adminRole = computed(() => admin.value?.role || '');

  const isSuperAdmin = computed(() => admin.value?.role === 'SUPER_ADMIN');

  // ============================================
  // Actions - Auth
  // ============================================

  /**
   * Initialize admin session from stored token
   */
  const initSession = () => {
    const token = adminService.getAdminToken();
    if (token) {
      // Token exists, assume authenticated
      // In production, you'd verify the token here
      isAuthenticated.value = true;

      // Try to parse admin info from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        admin.value = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          firstName: payload.firstName,
          lastName: payload.lastName,
        };
      } catch (e) {
        // Token invalid, clear session
        logout();
      }
    }
  };

  /**
   * Admin login
   */
  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.login(email, password);
      admin.value = data.admin;
      isAuthenticated.value = true;

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Admin logout
   */
  const logout = async () => {
    await adminService.logout();
    admin.value = null;
    isAuthenticated.value = false;
    dashboardStats.value = null;
    users.value = [];
    kycQueue.value = [];
    activityLogs.value = [];
  };

  // ============================================
  // Actions - Dashboard
  // ============================================

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardStats = async (period = '7d') => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.getDashboardStats(period);
      dashboardStats.value = data;
      dashboardPeriod.value = period;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load dashboard';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // Actions - Users
  // ============================================

  /**
   * Fetch users list
   */
  const fetchUsers = async (page = 1) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = {
        page,
        limit: usersPagination.value.limit,
        ...usersFilters.value,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const data = await adminService.listUsers(params);
      users.value = data.users;
      usersPagination.value = data.pagination;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load users';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Set users filter and refresh
   */
  const setUsersFilter = (filters) => {
    usersFilters.value = { ...usersFilters.value, ...filters };
    return fetchUsers(1);
  };

  /**
   * Fetch user detail
   */
  const fetchUserDetail = async (userId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.getUserDetail(userId);
      selectedUser.value = data;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load user';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update user status
   */
  const updateUserStatus = async (userId, status, reason = null) => {
    isLoading.value = true;
    error.value = null;

    try {
      await adminService.updateUserStatus(userId, status, reason);

      // Refresh user detail if viewing
      if (selectedUser.value?.user?.id === userId) {
        await fetchUserDetail(userId);
      }

      // Refresh users list
      await fetchUsers(usersPagination.value.page);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to update status';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // Actions - KYC
  // ============================================

  /**
   * Fetch pending KYC queue
   */
  const fetchKycQueue = async (page = 1) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.listPendingKyc({
        page,
        limit: kycPagination.value.limit,
      });

      kycQueue.value = data.sessions;
      kycPagination.value = data.pagination;
      kycStats.value = data.stats;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load KYC queue';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch KYC session detail
   */
  const fetchKycDetail = async (sessionId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.getKycDetail(sessionId);
      selectedKyc.value = data;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load KYC detail';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Approve KYC session
   */
  const approveKyc = async (sessionId, notes = null) => {
    isLoading.value = true;
    error.value = null;

    try {
      await adminService.approveKyc(sessionId, notes);

      // Refresh KYC queue
      await fetchKycQueue(kycPagination.value.page);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to approve KYC';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reject KYC session
   */
  const rejectKyc = async (sessionId, reason, code = null) => {
    isLoading.value = true;
    error.value = null;

    try {
      await adminService.rejectKyc(sessionId, reason, code);

      // Refresh KYC queue
      await fetchKycQueue(kycPagination.value.page);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to reject KYC';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // Actions - Loans
  // ============================================

  /**
   * Fetch loans list
   */
  const fetchLoans = async (page = 1) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = {
        page,
        limit: loansPagination.value.limit,
        ...loansFilters.value,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const data = await adminService.listLoans(params);
      loans.value = data.loans;
      loansPagination.value = data.pagination;
      loansStats.value = data.stats;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load loans';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Set loans filter and refresh
   */
  const setLoansFilter = (filters) => {
    loansFilters.value = { ...loansFilters.value, ...filters };
    return fetchLoans(1);
  };

  /**
   * Fetch loan detail
   */
  const fetchLoanDetail = async (loanId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await adminService.getLoanDetail(loanId);
      selectedLoan.value = data;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load loan';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Approve loan application
   */
  const approveLoan = async (loanId, notes = null, approvedAmount = null, approvedTerm = null) => {
    isLoading.value = true;
    error.value = null;

    try {
      await adminService.approveLoan(loanId, notes, approvedAmount, approvedTerm);

      // Refresh loans list
      await fetchLoans(loansPagination.value.page);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to approve loan';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reject loan application
   */
  const rejectLoan = async (loanId, reason, code = null) => {
    isLoading.value = true;
    error.value = null;

    try {
      await adminService.rejectLoan(loanId, reason, code);

      // Refresh loans list
      await fetchLoans(loansPagination.value.page);

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to reject loan';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // Actions - Activity Logs
  // ============================================

  /**
   * Fetch activity logs
   * @param {Object} params - Query parameters
   */
  const fetchActivityLogs = async (params = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const queryParams = {
        page: params.page || logsPagination.value.page,
        limit: params.limit || logsPagination.value.limit,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        adminId: params.adminId,
        action: params.action,
        startDate: params.startDate,
        endDate: params.endDate,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key]) delete queryParams[key];
      });

      const data = await adminService.getActivityLogs(queryParams);
      activityLogs.value = data.logs;
      logsPagination.value = {
        ...logsPagination.value,
        ...data.pagination,
        totalPages: Math.ceil(data.pagination.total / data.pagination.limit),
      };

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Failed to load logs';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Set logs filter and refresh
   */
  const setLogsFilter = (filters) => {
    logsFilters.value = { ...logsFilters.value, ...filters };
    return fetchActivityLogs(1);
  };

  // ============================================
  // Utility
  // ============================================

  const clearError = () => {
    error.value = null;
  };

  const clearSelectedUser = () => {
    selectedUser.value = null;
  };

  const clearSelectedKyc = () => {
    selectedKyc.value = null;
  };

  const clearSelectedLoan = () => {
    selectedLoan.value = null;
  };

  // ============================================
  // Return
  // ============================================

  return {
    // State
    admin,
    isAuthenticated,
    dashboardStats,
    dashboardPeriod,
    users,
    usersPagination,
    usersFilters,
    selectedUser,
    kycQueue,
    kycPagination,
    kycStats,
    selectedKyc,
    loans,
    loansPagination,
    loansFilters,
    loansStats,
    selectedLoan,
    activityLogs,
    logsPagination,
    logsFilters,
    isLoading,
    error,

    // Getters
    adminName,
    adminRole,
    isSuperAdmin,

    // Actions - Auth
    initSession,
    login,
    logout,

    // Actions - Dashboard
    fetchDashboardStats,

    // Actions - Users
    fetchUsers,
    setUsersFilter,
    fetchUserDetail,
    updateUserStatus,

    // Actions - KYC
    fetchKycQueue,
    fetchKycDetail,
    approveKyc,
    rejectKyc,

    // Actions - Loans
    fetchLoans,
    setLoansFilter,
    fetchLoanDetail,
    approveLoan,
    rejectLoan,

    // Actions - Activity Logs
    fetchActivityLogs,
    setLogsFilter,

    // Utility
    clearError,
    clearSelectedUser,
    clearSelectedKyc,
    clearSelectedLoan,
  };
});
