import bcrypt from 'bcrypt';
import { query, transaction } from '../config/database.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { BadRequest, Unauthorized, NotFound } from '../utils/errors.js';
import * as tokenService from '../services/tokenService.js';

/**
 * Log admin activity
 */
const logActivity = async (adminId, action, targetType, targetId, description, req, oldValue = null, newValue = null) => {
  await query(
    `INSERT INTO admin_activity_logs (id, admin_id, action, target_type, target_id, description, old_value, new_value, ip_address, user_agent)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [adminId, action, targetType, targetId, description, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null, req.ip, req.headers['user-agent']]
  );
};

/**
 * Admin login
 * POST /api/v1/admin/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const result = await query(
      `SELECT id, phone, email, first_name, last_name, role, status, password_hash
       FROM users WHERE email = $1 AND role IN ('ADMIN', 'SUPER_ADMIN')`,
      [email]
    );

    if (result.rows.length === 0) {
      throw Unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const admin = result.rows[0];

    // Check status
    if (admin.status !== 'ACTIVE') {
      throw Unauthorized('บัญชีของคุณถูกระงับ');
    }

    // Verify password
    // Note: In production, admin accounts should have password_hash set
    // For development, we'll allow a default password
    if (admin.password_hash) {
      isValid = await bcrypt.compare(password, admin.password_hash);
    } else {
      // If no password hash set, account is not configured
      throw new ApiError('Account not properly configured. Contact administrator.', 500);
    }

    if (!isValid) {
      throw Unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(admin, {
      deviceId: `admin-${Date.now()}`,
      deviceName: 'Admin Panel',
      deviceType: 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Update last login
    await query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      [admin.id]
    );

    // Log activity
    await logActivity(admin.id, 'LOGIN', 'user', admin.id, 'Admin login', req);

    logger.info('Admin logged in', { adminId: admin.id, email });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 * GET /api/v1/admin/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const period = req.query.period || '7d';

    // Calculate date range
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user stats
    const userStats = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today,
         COUNT(*) FILTER (WHERE created_at >= $1) as new_period
       FROM users WHERE role = 'USER'`,
      [startDate]
    );

    // Get KYC stats
    const kycStats = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('PENDING', 'PROCESSING')) as pending,
         COUNT(*) FILTER (WHERE status = 'APPROVED' AND updated_at >= CURRENT_DATE) as verified_today,
         COUNT(*) FILTER (WHERE status = 'REJECTED' AND updated_at >= CURRENT_DATE) as rejected_today
       FROM kyc_sessions`
    );

    // Get login stats
    const loginStats = await query(
      `SELECT COUNT(DISTINCT user_id) as daily_logins
       FROM refresh_tokens
       WHERE created_at >= CURRENT_DATE`
    );

    // Get active users (last 7 days)
    const activeStats = await query(
      `SELECT COUNT(DISTINCT user_id) as active_users
       FROM refresh_tokens
       WHERE last_used_at >= NOW() - INTERVAL '7 days'`
    );

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'dashboard', null, 'Viewed dashboard stats', req);

    res.json({
      success: true,
      data: {
        users: {
          total: parseInt(userStats.rows[0].total),
          newToday: parseInt(userStats.rows[0].new_today),
          newPeriod: parseInt(userStats.rows[0].new_period),
        },
        kyc: {
          pending: parseInt(kycStats.rows[0].pending),
          verifiedToday: parseInt(kycStats.rows[0].verified_today),
          rejectedToday: parseInt(kycStats.rows[0].rejected_today),
        },
        activity: {
          dailyLogins: parseInt(loginStats.rows[0].daily_logins),
          activeUsers7d: parseInt(activeStats.rows[0].active_users),
        },
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List users with filters
 * GET /api/v1/admin/users
 */
export const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, kycStatus, status, sort, order } = req.query;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [`role = 'USER'`];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(phone ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR citizen_id ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (kycStatus) {
      conditions.push(`kyc_status = $${paramIndex}`);
      params.push(kycStatus);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const sortColumns = {
      createdAt: 'created_at',
      phone: 'phone',
      firstName: 'first_name',
      kycStatus: 'kyc_status',
    };
    const sortColumn = sortColumns[sort] || 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );

    // Get users
    const usersResult = await query(
      `SELECT id, phone, first_name, last_name, email, kyc_status, status, created_at, last_login_at
       FROM users ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        users: usersResult.rows.map(u => ({
          id: u.id,
          phone: u.phone,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          kycStatus: u.kyc_status,
          status: u.status,
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details
 * GET /api/v1/admin/users/:userId
 */
export const getUserDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get user
    const userResult = await query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw NotFound('ไม่พบผู้ใช้');
    }

    const user = userResult.rows[0];

    // Get KYC history
    const kycResult = await query(
      `SELECT id, status, created_at, updated_at, rejection_reason
       FROM kyc_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'user', userId, `Viewed user detail: ${user.phone}`, req);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          citizenId: user.citizen_id ? user.citizen_id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-xxxx-xxxxx-$4-$5') : null,
          kycStatus: user.kyc_status,
          status: user.status,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at,
        },
        kycHistory: kycResult.rows.map(k => ({
          id: k.id,
          status: k.status,
          createdAt: k.created_at,
          updatedAt: k.updated_at,
          rejectionReason: k.rejection_reason,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status
 * PATCH /api/v1/admin/users/:userId/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    // Get current user
    const currentResult = await query(
      `SELECT status, phone FROM users WHERE id = $1`,
      [userId]
    );

    if (currentResult.rows.length === 0) {
      throw NotFound('ไม่พบผู้ใช้');
    }

    const oldStatus = currentResult.rows[0].status;

    // Update status
    await query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, userId]
    );

    // If suspended/banned, revoke all refresh tokens
    if (status === 'SUSPENDED' || status === 'BANNED') {
      await query(
        `UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW(), revoked_reason = $2
         WHERE user_id = $1 AND is_revoked = false`,
        [userId, `USER_${status}`]
      );
    }

    // Log activity
    await logActivity(
      req.user.id,
      status === 'ACTIVE' ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
      'user',
      userId,
      `Changed user status: ${currentResult.rows[0].phone} from ${oldStatus} to ${status}. Reason: ${reason || 'N/A'}`,
      req,
      { status: oldStatus },
      { status, reason }
    );

    logger.info('User status updated', { adminId: req.user.id, userId, oldStatus, newStatus: status, reason });

    res.json({
      success: true,
      message: 'อัพเดทสถานะสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List pending KYC requests
 * GET /api/v1/admin/kyc/pending
 */
export const listPendingKyc = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get pending/processing KYC sessions
    const result = await query(
      `SELECT ks.id, ks.status, ks.created_at, ks.updated_at,
              ks.ocr_first_name, ks.ocr_last_name, ks.face_match_score,
              u.phone, u.first_name, u.last_name
       FROM kyc_sessions ks
       JOIN users u ON ks.user_id = u.id
       WHERE ks.status IN ('PENDING', 'PROCESSING')
       ORDER BY ks.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get count
    const countResult = await query(
      `SELECT COUNT(*) FROM kyc_sessions WHERE status IN ('PENDING', 'PROCESSING')`
    );

    // Get stats
    const statsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('PENDING', 'PROCESSING')) as pending,
         COUNT(*) FILTER (WHERE status = 'APPROVED' AND updated_at >= CURRENT_DATE) as verified_today,
         COUNT(*) FILTER (WHERE status = 'REJECTED' AND updated_at >= CURRENT_DATE) as rejected_today
       FROM kyc_sessions`
    );

    res.json({
      success: true,
      data: {
        sessions: result.rows.map(s => ({
          id: s.id,
          status: s.status,
          createdAt: s.created_at,
          user: {
            phone: s.phone,
            firstName: s.first_name || s.ocr_first_name,
            lastName: s.last_name || s.ocr_last_name,
          },
          faceMatchScore: s.face_match_score ? parseFloat(s.face_match_score) : null,
        })),
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page,
          limit,
        },
        stats: {
          pending: parseInt(statsResult.rows[0].pending),
          verifiedToday: parseInt(statsResult.rows[0].verified_today),
          rejectedToday: parseInt(statsResult.rows[0].rejected_today),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC session details for review
 * GET /api/v1/admin/kyc/:sessionId
 */
export const getKycDetail = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get session with user info
    const result = await query(
      `SELECT ks.*, u.phone, u.first_name as user_first_name, u.last_name as user_last_name
       FROM kyc_sessions ks
       JOIN users u ON ks.user_id = u.id
       WHERE ks.id = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      throw NotFound('ไม่พบ KYC session นี้');
    }

    const session = result.rows[0];

    // Get documents
    const docsResult = await query(
      `SELECT document_type, file_path, created_at
       FROM kyc_documents WHERE kyc_session_id = $1`,
      [sessionId]
    );

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'kyc_session', sessionId, `Reviewed KYC for ${session.phone}`, req);

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          status: session.status,
          createdAt: session.created_at,
          ocrResult: {
            citizenId: session.ocr_citizen_id,
            firstName: session.ocr_first_name,
            lastName: session.ocr_last_name,
            dateOfBirth: session.ocr_date_of_birth,
            confidence: session.ocr_confidence_score ? parseFloat(session.ocr_confidence_score) : null,
          },
          faceMatch: {
            score: session.face_match_score ? parseFloat(session.face_match_score) : null,
            passed: session.face_match_passed,
          },
          liveness: {
            score: session.liveness_score ? parseFloat(session.liveness_score) : null,
            passed: session.liveness_passed,
          },
          ndidVerified: session.ndid_verified,
        },
        user: {
          phone: session.phone,
          firstName: session.user_first_name,
          lastName: session.user_last_name,
        },
        documents: docsResult.rows.map(d => ({
          type: d.document_type,
          // In production, generate signed URL
          url: `/api/v1/admin/kyc/documents/${d.file_path}`,
          uploadedAt: d.created_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve KYC
 * POST /api/v1/admin/kyc/:sessionId/approve
 */
export const approveKyc = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    // Get session
    const sessionResult = await query(
      `SELECT ks.*, u.id as user_id FROM kyc_sessions ks
       JOIN users u ON ks.user_id = u.id
       WHERE ks.id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      throw NotFound('ไม่พบ KYC session นี้');
    }

    const session = sessionResult.rows[0];

    if (session.status === 'APPROVED') {
      throw BadRequest('KYC นี้ได้รับการอนุมัติแล้ว');
    }

    // Approve in transaction
    await transaction(async (client) => {
      // Update session
      await client.query(
        `UPDATE kyc_sessions SET status = 'APPROVED', reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $1`,
        [sessionId, adminId]
      );

      // Update user
      await client.query(
        `UPDATE users SET
         kyc_status = 'VERIFIED',
         citizen_id = $2,
         first_name = $3,
         last_name = $4,
         first_name_en = $5,
         last_name_en = $6,
         date_of_birth = $7,
         updated_at = NOW()
         WHERE id = $1`,
        [
          session.user_id,
          session.ocr_citizen_id,
          session.ocr_first_name,
          session.ocr_last_name,
          session.ocr_first_name_en,
          session.ocr_last_name_en,
          session.ocr_date_of_birth,
        ]
      );
    });

    // Log activity
    await logActivity(adminId, 'APPROVE_KYC', 'kyc_session', sessionId, `Approved KYC. Notes: ${notes || 'N/A'}`, req);

    logger.info('KYC approved', { adminId, sessionId, userId: session.user_id });

    res.json({
      success: true,
      message: 'อนุมัติ KYC สำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject KYC
 * POST /api/v1/admin/kyc/:sessionId/reject
 */
export const rejectKyc = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { reason, code } = req.body;
    const adminId = req.user.id;

    // Get session
    const sessionResult = await query(
      `SELECT ks.*, u.id as user_id FROM kyc_sessions ks
       JOIN users u ON ks.user_id = u.id
       WHERE ks.id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      throw NotFound('ไม่พบ KYC session นี้');
    }

    const session = sessionResult.rows[0];

    // Reject in transaction
    await transaction(async (client) => {
      // Update session
      await client.query(
        `UPDATE kyc_sessions SET
         status = 'REJECTED',
         reviewed_by = $2,
         reviewed_at = NOW(),
         rejection_reason = $3,
         rejection_code = $4
         WHERE id = $1`,
        [sessionId, adminId, reason, code]
      );

      // Update user
      await client.query(
        `UPDATE users SET kyc_status = 'REJECTED', updated_at = NOW() WHERE id = $1`,
        [session.user_id]
      );
    });

    // Log activity
    await logActivity(adminId, 'REJECT_KYC', 'kyc_session', sessionId, `Rejected KYC. Reason: ${reason}`, req);

    logger.info('KYC rejected', { adminId, sessionId, userId: session.user_id, reason });

    res.json({
      success: true,
      message: 'ปฏิเสธ KYC สำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List loan applications with filters
 * GET /api/v1/admin/loans
 */
export const listLoans = async (req, res, next) => {
  try {
    const { page, limit, search, status, sort, order } = req.query;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.phone ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`la.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const sortColumns = {
      submittedAt: 'la.submitted_at',
      amountRequested: 'la.amount_requested',
      status: 'la.status',
      createdAt: 'la.created_at',
    };
    const sortColumn = sortColumns[sort] || 'la.submitted_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       ${whereClause}`,
      params
    );

    // Get loans with user and credit score info
    const loansResult = await query(
      `SELECT la.*,
              u.phone, u.first_name, u.last_name, u.email,
              cs.score as credit_score, cs.status as credit_status
       FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       LEFT JOIN credit_scores cs ON la.credit_score_id = cs.id
       ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // Get stats
    const statsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')) as pending,
         COUNT(*) FILTER (WHERE status = 'APPROVED' AND approved_at >= CURRENT_DATE) as approved_today,
         COUNT(*) FILTER (WHERE status = 'REJECTED' AND rejected_at >= CURRENT_DATE) as rejected_today
       FROM loan_applications`
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        loans: loansResult.rows.map(l => ({
          id: l.id,
          user: {
            id: l.user_id,
            phone: l.phone,
            firstName: l.first_name,
            lastName: l.last_name,
            email: l.email,
          },
          amountRequested: parseFloat(l.amount_requested),
          termMonths: l.term_months,
          purpose: l.purpose,
          status: l.status,
          creditScore: l.credit_score,
          creditStatus: l.credit_status,
          partnerId: l.partner_id,
          partnerStatus: l.partner_status,
          submittedAt: l.submitted_at,
          approvedAt: l.approved_at,
          rejectedAt: l.rejected_at,
          createdAt: l.created_at,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          pending: parseInt(statsResult.rows[0].pending),
          approvedToday: parseInt(statsResult.rows[0].approved_today),
          rejectedToday: parseInt(statsResult.rows[0].rejected_today),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan application details
 * GET /api/v1/admin/loans/:loanId
 */
export const getLoanDetail = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    // Get loan with user info
    const loanResult = await query(
      `SELECT la.*, u.phone, u.first_name, u.last_name, u.email, u.birth_date
       FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.id = $1`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      throw NotFound('ไม่พบใบสมัครสินเชื่อนี้');
    }

    const loan = loanResult.rows[0];

    // Get credit score details
    const creditResult = await query(
      `SELECT * FROM credit_scores WHERE id = $1`,
      [loan.credit_score_id]
    );

    // Get partner submissions
    const partnerResult = await query(
      `SELECT * FROM partner_submissions WHERE user_id = $1
       ORDER BY created_at DESC`,
      [loan.user_id]
    );

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'loan_application', loanId, `Reviewed loan application for ${loan.phone}`, req);

    res.json({
      success: true,
      data: {
        loan: {
          id: loan.id,
          amountRequested: parseFloat(loan.amount_requested),
          termMonths: loan.term_months,
          purpose: loan.purpose,
          status: loan.status,
          submittedAt: loan.submitted_at,
          approvedAt: loan.approved_at,
          rejectedAt: loan.rejected_at,
          rejectionReason: loan.rejection_reason,
          partnerApplicationId: loan.partner_application_id,
          createdAt: loan.created_at,
          updatedAt: loan.updated_at,
        },
        user: {
          id: loan.user_id,
          phone: loan.phone,
          firstName: loan.first_name,
          lastName: loan.last_name,
          email: loan.email,
          birthDate: loan.birth_date,
        },
        creditScore: creditResult.rows.length > 0 ? {
          id: creditResult.rows[0].id,
          score: creditResult.rows[0].score,
          status: creditResult.rows[0].status,
          breakdown: creditResult.rows[0].factors_breakdown,
          monthlyIncome: creditResult.rows[0].monthly_income ? parseFloat(creditResult.rows[0].monthly_income) : null,
          monthlyExpenses: creditResult.rows[0].monthly_expenses ? parseFloat(creditResult.rows[0].monthly_expenses) : null,
          expenseRatio: creditResult.rows[0].expense_ratio ? parseFloat(creditResult.rows[0].expense_ratio) : null,
          avgBalance: creditResult.rows[0].avg_balance ? parseFloat(creditResult.rows[0].avg_balance) : null,
          createdAt: creditResult.rows[0].created_at,
        } : null,
        partnerSubmissions: partnerResult.rows.map(p => ({
          id: p.id,
          partnerId: p.partner_id,
          applicationId: p.application_id,
          status: p.status,
          response: p.response,
          createdAt: p.created_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve loan application
 * POST /api/v1/admin/loans/:loanId/approve
 */
export const approveLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { notes, approvedAmount, approvedTerm } = req.body;
    const adminId = req.user.id;

    // Get loan
    const loanResult = await query(
      `SELECT la.*, u.phone FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.id = $1`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      throw NotFound('ไม่พบใบสมัครสินเชื่อนี้');
    }

    const loan = loanResult.rows[0];

    if (loan.status === 'APPROVED') {
      throw BadRequest('สินเชื่อนี้ได้รับการอนุมัติแล้ว');
    }

    // Use submitted values if not overridden
    const finalAmount = approvedAmount || loan.amount_requested;
    const finalTerm = approvedTerm || loan.term_months;

    // Approve in transaction
    await transaction(async (client) => {
      await client.query(
        `UPDATE loan_applications SET
         status = 'APPROVED',
         approved_at = NOW(),
         amount_approved = $2,
         term_approved = $3,
         updated_at = NOW()
         WHERE id = $1`,
        [loanId, finalAmount, finalTerm]
      );
    });

    // Log activity
    const description = `Approved loan application for ${loan.phone}. Amount: ${finalAmount}, Term: ${finalTerm} months. Notes: ${notes || 'N/A'}`;
    await logActivity(adminId, 'APPROVE_LOAN', 'loan_application', loanId, description, req);

    logger.info('Loan approved', { adminId, loanId, userId: loan.user_id, finalAmount, finalTerm });

    res.json({
      success: true,
      message: 'อนุมัติสินเชื่อสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject loan application
 * POST /api/v1/admin/loans/:loanId/reject
 */
export const rejectLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { reason, code } = req.body;
    const adminId = req.user.id;

    // Get loan
    const loanResult = await query(
      `SELECT la.*, u.phone FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.id = $1`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      throw NotFound('ไม่พบใบสมัครสินเชื่อนี้');
    }

    const loan = loanResult.rows[0];

    if (loan.status === 'REJECTED') {
      throw BadRequest('สินเชื่อนี้ถูกปฏิเสธแล้ว');
    }

    // Reject in transaction
    await transaction(async (client) => {
      await client.query(
        `UPDATE loan_applications SET
         status = 'REJECTED',
         rejected_at = NOW(),
         rejection_reason = $2,
         rejection_code = $3,
         updated_at = NOW()
         WHERE id = $1`,
        [loanId, reason, code]
      );
    });

    // Log activity
    const description = `Rejected loan application for ${loan.phone}. Reason: ${reason}. Code: ${code || 'N/A'}`;
    await logActivity(adminId, 'REJECT_LOAN', 'loan_application', loanId, description, req);

    logger.info('Loan rejected', { adminId, loanId, userId: loan.user_id, reason, code });

    res.json({
      success: true,
      message: 'ปฏิเสธสินเชื่อสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin activity logs
 * GET /api/v1/admin/activity-logs
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (req.query.adminId) {
      conditions.push(`al.admin_id = $${paramIndex++}`);
      params.push(req.query.adminId);
    }

    if (req.query.action) {
      conditions.push(`al.action = $${paramIndex++}`);
      params.push(req.query.action);
    }

    if (req.query.fromDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(req.query.fromDate);
    }

    if (req.query.toDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(req.query.toDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT al.*, u.email as admin_email, u.first_name as admin_first_name
       FROM admin_activity_logs al
       JOIN users u ON al.admin_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM admin_activity_logs al ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        logs: result.rows.map(l => ({
          id: l.id,
          admin: {
            id: l.admin_id,
            email: l.admin_email,
            firstName: l.admin_first_name,
          },
          action: l.action,
          targetType: l.target_type,
          targetId: l.target_id,
          description: l.description,
          ipAddress: l.ip_address,
          createdAt: l.created_at,
        })),
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  getDashboardStats,
  listUsers,
  getUserDetail,
  updateUserStatus,
  listPendingKyc,
  getKycDetail,
  approveKyc,
  rejectKyc,
  listLoans,
  getLoanDetail,
  approveLoan,
  rejectLoan,
  getActivityLogs,
};
