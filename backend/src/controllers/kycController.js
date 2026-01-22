import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { query, transaction } from '../config/database.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { BadRequest, NotFound, Conflict, KYCErrors } from '../utils/errors.js';

/**
 * Create new KYC session
 * POST /api/v1/kyc/sessions
 */
export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user already has verified KYC
    if (req.user.kycStatus === 'VERIFIED') {
      throw Conflict('คุณได้ยืนยันตัวตนแล้ว', KYCErrors.KYC_ALREADY_VERIFIED);
    }

    // Check if there's a pending session
    const pendingResult = await query(
      `SELECT id FROM kyc_sessions
       WHERE user_id = $1 AND status IN ('PENDING', 'PROCESSING')
       AND expires_at > NOW()`,
      [userId]
    );

    if (pendingResult.rows.length > 0) {
      throw Conflict('คุณมี session ที่ยังไม่เสร็จสมบูรณ์', KYCErrors.KYC_PENDING);
    }

    // Create new session
    const sessionId = uuidv4();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO kyc_sessions (id, user_id, session_token, status, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, 'PENDING', $4, $5, $6)`,
      [sessionId, userId, sessionToken, expiresAt, req.ip, req.headers['user-agent']]
    );

    // Update user KYC status
    await query(
      `UPDATE users SET kyc_status = 'PENDING' WHERE id = $1`,
      [userId]
    );

    logger.info('KYC session created', { userId, sessionId });

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        sessionToken,
        expiresAt,
        steps: [
          { step: 1, name: 'id_card_front', status: 'pending' },
          { step: 2, name: 'id_card_back', status: 'pending' },
          { step: 3, name: 'selfie', status: 'pending' },
          { step: 4, name: 'liveness', status: 'pending' },
          { step: 5, name: 'ndid_verify', status: 'pending' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC session status
 * GET /api/v1/kyc/sessions/:sessionId
 */
export const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT ks.*,
              (SELECT json_agg(json_build_object(
                'type', kd.document_type,
                'uploaded', true,
                'processed', kd.is_processed
              )) FROM kyc_documents kd WHERE kd.kyc_session_id = ks.id) as documents
       FROM kyc_sessions ks
       WHERE ks.id = $1 AND ks.user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    const session = result.rows[0];

    // Check if expired
    if (new Date() > new Date(session.expires_at)) {
      throw BadRequest('Session หมดอายุ กรุณาเริ่มใหม่', KYCErrors.SESSION_EXPIRED);
    }

    // Build steps status
    const documents = session.documents || [];
    const hasDocument = (type) => documents.some(d => d.type === type && d.uploaded);

    const steps = [
      { step: 1, name: 'id_card_front', status: hasDocument('ID_CARD_FRONT') ? 'completed' : 'pending' },
      { step: 2, name: 'id_card_back', status: hasDocument('ID_CARD_BACK') ? 'completed' : 'pending' },
      { step: 3, name: 'selfie', status: hasDocument('SELFIE') ? 'completed' : 'pending' },
      { step: 4, name: 'liveness', status: session.liveness_passed ? 'completed' : 'pending' },
      { step: 5, name: 'ndid_verify', status: session.ndid_verified ? 'completed' : 'pending' },
    ];

    // Determine current step
    const currentStep = steps.findIndex(s => s.status === 'pending') + 1 || steps.length;

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        currentStep,
        steps,
        expiresAt: session.expires_at,
        ocrPreview: session.ocr_citizen_id ? {
          citizenId: session.ocr_citizen_id?.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5'),
          firstName: session.ocr_first_name,
          lastName: session.ocr_last_name,
        } : null,
        faceMatch: session.face_match_score ? {
          score: parseFloat(session.face_match_score),
          passed: session.face_match_passed,
        } : null,
        liveness: session.liveness_score ? {
          score: parseFloat(session.liveness_score),
          passed: session.liveness_passed,
        } : null,
        ndidVerified: session.ndid_verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload KYC document
 * POST /api/v1/kyc/sessions/:sessionId/documents
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { documentType } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      throw BadRequest('กรุณาเลือกไฟล์', KYCErrors.DOCUMENT_INVALID);
    }

    // Verify session
    const sessionResult = await query(
      `SELECT * FROM kyc_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    const session = sessionResult.rows[0];

    if (new Date() > new Date(session.expires_at)) {
      throw BadRequest('Session หมดอายุ กรุณาเริ่มใหม่', KYCErrors.SESSION_EXPIRED);
    }

    // For now, store locally or mock S3 upload
    // In production, upload to S3
    const documentId = uuidv4();
    const filePath = `kyc/${userId}/${sessionId}/${documentType}_${documentId}.${file.mimetype.split('/')[1]}`;
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Save document record
    await query(
      `INSERT INTO kyc_documents (id, kyc_session_id, document_type, file_path, file_size, mime_type, checksum)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (kyc_session_id, document_type)
       DO UPDATE SET file_path = $4, file_size = $5, mime_type = $6, checksum = $7, created_at = NOW()`,
      [documentId, sessionId, documentType, filePath, file.size, file.mimetype, checksum]
    );

    // Mock OCR processing for ID cards
    let ocrResult = null;
    if (documentType === 'ID_CARD_FRONT') {
      // In production, call OCR service
      // For now, mock the result
      ocrResult = {
        citizenId: '1234567890123',
        firstName: 'สมชาย',
        lastName: 'ทดสอบ',
        firstNameEn: 'SOMCHAI',
        lastNameEn: 'TODSOB',
        dateOfBirth: '1990-01-15',
        confidence: 0.95,
      };

      // Update session with OCR data
      await query(
        `UPDATE kyc_sessions SET
         ocr_citizen_id = $2, ocr_first_name = $3, ocr_last_name = $4,
         ocr_first_name_en = $5, ocr_last_name_en = $6, ocr_date_of_birth = $7,
         ocr_confidence_score = $8, updated_at = NOW()
         WHERE id = $1`,
        [
          sessionId,
          ocrResult.citizenId,
          ocrResult.firstName,
          ocrResult.lastName,
          ocrResult.firstNameEn,
          ocrResult.lastNameEn,
          ocrResult.dateOfBirth,
          ocrResult.confidence,
        ]
      );
    }

    // Mock face matching for selfie
    let faceMatch = null;
    if (documentType === 'SELFIE') {
      // In production, call face matching service
      faceMatch = {
        score: 0.92,
        passed: true,
      };

      await query(
        `UPDATE kyc_sessions SET face_match_score = $2, face_match_passed = $3, updated_at = NOW()
         WHERE id = $1`,
        [sessionId, faceMatch.score, faceMatch.passed]
      );
    }

    // Mark document as processed
    await query(
      `UPDATE kyc_documents SET is_processed = true WHERE id = $1`,
      [documentId]
    );

    logger.info('KYC document uploaded', { userId, sessionId, documentType });

    res.json({
      success: true,
      data: {
        documentId,
        processingStatus: 'completed',
        ...(ocrResult && { ocrResult }),
        ...(faceMatch && { faceMatch }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit liveness check
 * POST /api/v1/kyc/sessions/:sessionId/liveness
 */
export const submitLiveness = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session
    const sessionResult = await query(
      `SELECT * FROM kyc_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    // Mock liveness detection
    // In production, call liveness detection service
    const livenessResult = {
      score: 0.95,
      passed: true,
    };

    await query(
      `UPDATE kyc_sessions SET liveness_score = $2, liveness_passed = $3, updated_at = NOW()
       WHERE id = $1`,
      [sessionId, livenessResult.score, livenessResult.passed]
    );

    logger.info('KYC liveness check completed', { userId, sessionId, passed: livenessResult.passed });

    res.json({
      success: true,
      data: {
        livenessScore: livenessResult.score,
        passed: livenessResult.passed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate NDID verification
 * POST /api/v1/kyc/sessions/:sessionId/ndid/initiate
 */
export const initiateNdid = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { citizenId, idpId } = req.body;
    const userId = req.user.id;

    // Verify session
    const sessionResult = await query(
      `SELECT * FROM kyc_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    // Mock NDID request
    // In production, call NDID API
    const ndidRequestId = `NDID-${uuidv4().substring(0, 8).toUpperCase()}`;
    const ndidReferenceId = `REF-${Date.now()}`;

    await query(
      `UPDATE kyc_sessions SET ndid_request_id = $2, ndid_reference_id = $3, ndid_status = 'PENDING', updated_at = NOW()
       WHERE id = $1`,
      [sessionId, ndidRequestId, ndidReferenceId]
    );

    logger.info('NDID verification initiated', { userId, sessionId, ndidRequestId });

    res.json({
      success: true,
      data: {
        ndidRequestId,
        // In production, this would be a deep link to the bank app
        verificationUrl: `ndid://verify/${ndidReferenceId}`,
        expiresIn: 300, // 5 minutes
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check NDID verification status
 * GET /api/v1/kyc/sessions/:sessionId/ndid/status
 */
export const getNdidStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT ndid_status, ndid_verified, ndid_verified_at
       FROM kyc_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    const session = result.rows[0];

    // Mock: For development, auto-verify after a few seconds
    if (config.env === 'development' && session.ndid_status === 'PENDING') {
      // Simulate verification
      await query(
        `UPDATE kyc_sessions SET ndid_status = 'VERIFIED', ndid_verified = true, ndid_verified_at = NOW()
         WHERE id = $1`,
        [sessionId]
      );

      return res.json({
        success: true,
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: {
        status: session.ndid_status || 'PENDING',
        verifiedAt: session.ndid_verified_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit KYC for final review
 * POST /api/v1/kyc/sessions/:sessionId/submit
 */
export const submitKyc = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get session with all checks
    const result = await query(
      `SELECT * FROM kyc_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw NotFound('ไม่พบ session นี้', KYCErrors.SESSION_NOT_FOUND);
    }

    const session = result.rows[0];

    // Verify all steps completed
    const documentsResult = await query(
      `SELECT document_type FROM kyc_documents WHERE kyc_session_id = $1`,
      [sessionId]
    );

    const uploadedDocs = documentsResult.rows.map(d => d.document_type);
    const requiredDocs = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'SELFIE'];

    const missingDocs = requiredDocs.filter(d => !uploadedDocs.includes(d));
    if (missingDocs.length > 0) {
      throw BadRequest(`กรุณาอัพโหลดเอกสาร: ${missingDocs.join(', ')}`, KYCErrors.DOCUMENT_INVALID);
    }

    if (!session.liveness_passed) {
      throw BadRequest('กรุณาทำ Liveness Check ให้สำเร็จ', KYCErrors.LIVENESS_FAILED);
    }

    if (!session.ndid_verified) {
      throw BadRequest('กรุณายืนยันตัวตนผ่าน NDID', KYCErrors.NDID_ERROR);
    }

    // Update session status to processing (waiting for manual review if needed)
    await query(
      `UPDATE kyc_sessions SET status = 'PROCESSING', updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    // Update user KYC status
    await query(
      `UPDATE users SET kyc_status = 'IN_PROGRESS' WHERE id = $1`,
      [userId]
    );

    // In production with auto-approval based on scores:
    // If all scores pass threshold, auto-approve
    const autoApprove = session.face_match_passed &&
                        session.liveness_passed &&
                        session.ndid_verified &&
                        parseFloat(session.ocr_confidence_score) >= 0.9;

    if (autoApprove) {
      // Auto approve
      await transaction(async (client) => {
        await client.query(
          `UPDATE kyc_sessions SET status = 'APPROVED', reviewed_at = NOW() WHERE id = $1`,
          [sessionId]
        );

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
            userId,
            session.ocr_citizen_id,
            session.ocr_first_name,
            session.ocr_last_name,
            session.ocr_first_name_en,
            session.ocr_last_name_en,
            session.ocr_date_of_birth,
          ]
        );
      });

      logger.info('KYC auto-approved', { userId, sessionId });

      return res.json({
        success: true,
        data: {
          status: 'APPROVED',
          message: 'ยืนยันตัวตนสำเร็จ',
        },
      });
    }

    logger.info('KYC submitted for review', { userId, sessionId });

    res.json({
      success: true,
      data: {
        status: 'PROCESSING',
        message: 'ส่งข้อมูลสำเร็จ รอการตรวจสอบ',
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSession,
  getSession,
  uploadDocument,
  submitLiveness,
  initiateNdid,
  getNdidStatus,
  submitKyc,
};
