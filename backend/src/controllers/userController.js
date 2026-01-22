import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { NotFound } from '../utils/errors.js';

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, phone, first_name, last_name, first_name_en, last_name_en,
              email, date_of_birth, gender,
              address_line1, address_line2, district, sub_district, province, postal_code,
              kyc_status, status, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw NotFound('ไม่พบผู้ใช้');
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        firstNameEn: user.first_name_en,
        lastNameEn: user.last_name_en,
        email: user.email,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: {
          line1: user.address_line1,
          line2: user.address_line2,
          district: user.district,
          subDistrict: user.sub_district,
          province: user.province,
          postalCode: user.postal_code,
        },
        kycStatus: user.kyc_status,
        status: user.status,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PATCH /api/v1/users/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, firstName, lastName } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    // Note: firstName and lastName can only be updated before KYC is verified
    // After KYC, these values come from the verified documents
    if (req.user.kycStatus === 'NONE' || req.user.kycStatus === 'REJECTED') {
      if (firstName !== undefined) {
        updates.push(`first_name = $${paramIndex++}`);
        values.push(firstName);
      }

      if (lastName !== undefined) {
        updates.push(`last_name = $${paramIndex++}`);
        values.push(lastName);
      }
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'ไม่มีข้อมูลที่ต้องอัพเดท',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, phone, first_name, last_name, email, kyc_status`,
      values
    );

    const user = result.rows[0];

    logger.info('User profile updated', { userId, updates: Object.keys(req.body) });

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        kycStatus: user.kyc_status,
      },
      message: 'อัพเดทข้อมูลสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed KYC status
 * GET /api/v1/users/me/kyc-status
 */
export const getKycStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's KYC status
    const userResult = await query(
      `SELECT kyc_status FROM users WHERE id = $1`,
      [userId]
    );

    const kycStatus = userResult.rows[0]?.kyc_status || 'NONE';

    // Get latest KYC session if any
    const sessionResult = await query(
      `SELECT id, status, created_at, updated_at, rejection_reason, rejection_code
       FROM kyc_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    const latestSession = sessionResult.rows[0];

    // Determine if user can submit new KYC
    const canSubmitKyc = ['NONE', 'REJECTED'].includes(kycStatus);

    res.json({
      success: true,
      data: {
        status: kycStatus,
        canSubmitKyc,
        latestSession: latestSession
          ? {
              id: latestSession.id,
              status: latestSession.status,
              createdAt: latestSession.created_at,
              updatedAt: latestSession.updated_at,
              rejectionReason: latestSession.rejection_reason,
              rejectionCode: latestSession.rejection_code,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  getKycStatus,
};
