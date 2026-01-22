import api from './api.js';

// Mock mode - set to true for demo without backend
const MOCK_MODE = true;

// Mock KYC sessions storage
const mockKycSessions = {};

/**
 * Create new KYC session
 * @returns {Promise<{sessionId: string, sessionToken: string, expiresAt: string, steps: Array}>}
 */
export const createSession = async () => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));

    const sessionId = `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionToken = `token_${sessionId}`;

    mockKycSessions[sessionId] = {
      id: sessionId,
      token: sessionToken,
      status: 'PENDING',
      currentStep: 1,
      steps: [
        { step: 1, name: 'ID_CARD', status: 'PENDING' },
        { step: 2, name: 'SELFIE', status: 'PENDING' },
        { step: 3, name: 'LIVENESS', status: 'PENDING' },
        { step: 4, name: 'NDID', status: 'PENDING' },
      ],
      documents: {},
      ocrResult: null,
      faceMatchScore: null,
      livenessScore: null,
      ndidStatus: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    return {
      sessionId,
      sessionToken,
      expiresAt: mockKycSessions[sessionId].expiresAt,
      steps: mockKycSessions[sessionId].steps,
    };
  }

  const response = await api.post('/kyc/sessions');
  return response.data.data;
};

/**
 * Get KYC session status
 * @param {string} sessionId - KYC session ID
 * @returns {Promise<object>}
 */
export const getSession = async (sessionId) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 200));

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    return { ...session };
  }

  const response = await api.get(`/kyc/sessions/${sessionId}`);
  return response.data.data;
};

/**
 * Upload KYC document
 * @param {string} sessionId - KYC session ID
 * @param {string} documentType - ID_CARD_FRONT, ID_CARD_BACK, SELFIE
 * @param {File} file - Document file
 * @returns {Promise<object>}
 */
export const uploadDocument = async (sessionId, documentType, file) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1000)); // Simulate upload time

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    // Store document (in real app, would upload to S3)
    session.documents[documentType] = {
      type: documentType,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    };

    // Mock OCR result after ID card upload
    if (documentType === 'ID_CARD_FRONT' || documentType === 'ID_CARD_BACK') {
      if (session.documents.ID_CARD_FRONT && session.documents.ID_CARD_BACK) {
        session.ocrResult = {
          citizenId: '1-1234-56789-01-2',
          firstName: 'ทดสอบ',
          lastName: 'ผู้ใช้',
          dateOfBirth: '1 ม.ค. 2533',
          address: '123 ถ.สุขุมวิท กรุงเทพฯ',
          confidence: 95.5,
        };
        session.steps[0].status = 'COMPLETED';
        session.currentStep = 2;
      }
    }

    // Mock face match after selfie
    if (documentType === 'SELFIE') {
      session.faceMatchScore = 92.5;
      session.steps[1].status = 'COMPLETED';
      session.currentStep = 3;
    }

    return {
      documentType,
      status: 'UPLOADED',
      ocrResult: session.ocrResult,
      faceMatchScore: session.faceMatchScore,
    };
  }

  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  const response = await api.post(`/kyc/sessions/${sessionId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * Submit liveness check
 * @param {string} sessionId - KYC session ID
 * @param {Blob} video - Liveness video
 * @returns {Promise<object>}
 */
export const submitLiveness = async (sessionId, video) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 2000)); // Simulate processing time

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    session.livenessScore = 98.2;
    session.steps[2].status = 'COMPLETED';
    session.currentStep = 4;

    return {
      livenessScore: session.livenessScore,
      passed: true,
      status: 'COMPLETED',
    };
  }

  const formData = new FormData();
  formData.append('video', video, 'liveness.webm');

  const response = await api.post(`/kyc/sessions/${sessionId}/liveness`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * Initiate NDID verification
 * @param {string} sessionId - KYC session ID
 * @param {string} citizenId - 13-digit citizen ID
 * @param {string} idpId - Identity Provider ID (optional)
 * @returns {Promise<{ndidRequestId: string, verificationUrl: string, expiresIn: number}>}
 */
export const initiateNdid = async (sessionId, citizenId, idpId = null) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    const ndidRequestId = `ndid_${Date.now()}`;
    session.ndidRequestId = ndidRequestId;
    session.ndidStatus = 'PENDING';

    return {
      ndidRequestId,
      verificationUrl: `ndid://verify/${ndidRequestId}`,
      expiresIn: 300,
      idpList: [
        { id: 'kbank', name: 'ธนาคารกสิกรไทย', logo: 'https://via.placeholder.com/48' },
        { id: 'scb', name: 'ธนาคารไทยพาณิชย์', logo: 'https://via.placeholder.com/48' },
        { id: 'ktb', name: 'ธนาคารกรุงไทย', logo: 'https://via.placeholder.com/48' },
        { id: 'bbl', name: 'ธนาคารกรุงเทพ', logo: 'https://via.placeholder.com/48' },
      ],
    };
  }

  const response = await api.post(`/kyc/sessions/${sessionId}/ndid/initiate`, {
    citizenId,
    ...(idpId && { idpId }),
  });
  return response.data.data;
};

/**
 * Check NDID verification status
 * @param {string} sessionId - KYC session ID
 * @returns {Promise<{status: string, verifiedAt: string}>}
 */
export const getNdidStatus = async (sessionId) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    // Auto-verify after a few calls (simulating user completing NDID on bank app)
    if (session.ndidCheckCount === undefined) {
      session.ndidCheckCount = 0;
    }
    session.ndidCheckCount++;

    // After 3 checks, auto-complete NDID (for demo purposes)
    if (session.ndidCheckCount >= 3) {
      session.ndidStatus = 'VERIFIED';
      session.ndidVerifiedAt = new Date().toISOString();
      session.steps[3].status = 'COMPLETED';
      session.status = 'PROCESSING';
    }

    return {
      status: session.ndidStatus || 'PENDING',
      verifiedAt: session.ndidVerifiedAt || null,
    };
  }

  const response = await api.get(`/kyc/sessions/${sessionId}/ndid/status`);
  return response.data.data;
};

/**
 * Submit KYC for final review
 * @param {string} sessionId - KYC session ID
 * @returns {Promise<{status: string, message: string}>}
 */
export const submitKyc = async (sessionId) => {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));

    const session = mockKycSessions[sessionId];
    if (!session) {
      throw { response: { data: { error: { message: 'Session ไม่พบหรือหมดอายุ' } } } };
    }

    session.status = 'SUBMITTED';
    session.submittedAt = new Date().toISOString();

    return {
      status: 'SUBMITTED',
      message: 'KYC ส่งเรียบร้อยแล้ว รอการตรวจสอบ',
    };
  }

  const response = await api.post(`/kyc/sessions/${sessionId}/submit`);
  return response.data.data;
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
