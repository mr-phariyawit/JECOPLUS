import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as kycService from '../services/kycService';

export const useKycStore = defineStore('kyc', () => {
  // State
  const session = ref(null);
  const currentStep = ref(1);
  const isLoading = ref(false);
  const error = ref(null);

  // OCR results from ID card
  const ocrResult = ref(null);

  // Face match result
  const faceMatchResult = ref(null);

  // Liveness result
  const livenessResult = ref(null);

  // NDID status
  const ndidStatus = ref(null);

  // Getters
  const sessionId = computed(() => session.value?.sessionId || null);

  const steps = computed(() => session.value?.steps || []);

  const isSessionActive = computed(() => {
    if (!session.value) return false;
    return new Date() < new Date(session.value.expiresAt);
  });

  const completedSteps = computed(() => {
    return steps.value.filter((s) => s.status === 'completed').length;
  });

  // Actions

  /**
   * Start new KYC session
   */
  const startSession = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.createSession();
      session.value = data;
      currentStep.value = 1;

      return { success: true, sessionId: data.sessionId };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message || 'ไม่สามารถเริ่ม KYC ได้ กรุณาลองใหม่';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get session status
   */
  const fetchSession = async () => {
    if (!sessionId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.getSession(sessionId.value);
      session.value = { ...session.value, ...data };
      currentStep.value = data.currentStep || 1;

      if (data.ocrPreview) ocrResult.value = data.ocrPreview;
      if (data.faceMatch) faceMatchResult.value = data.faceMatch;
      if (data.liveness) livenessResult.value = data.liveness;

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'ไม่สามารถโหลดข้อมูลได้';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Upload ID card photo
   * @param {string} side - 'front' or 'back'
   * @param {File} file - Image file
   */
  const uploadIdCard = async (side, file) => {
    if (!sessionId.value) {
      return { success: false, error: 'กรุณาเริ่ม KYC session ก่อน' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const documentType = side === 'front' ? 'ID_CARD_FRONT' : 'ID_CARD_BACK';
      const data = await kycService.uploadDocument(sessionId.value, documentType, file);

      // Update OCR result if available
      if (data.ocrResult) {
        ocrResult.value = data.ocrResult;
      }

      // Move to next step
      if (side === 'front') {
        currentStep.value = 2;
      } else {
        currentStep.value = 3;
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถอัปโหลดได้';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Upload selfie photo
   * @param {File} file - Image file
   */
  const uploadSelfie = async (file) => {
    if (!sessionId.value) {
      return { success: false, error: 'กรุณาเริ่ม KYC session ก่อน' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.uploadDocument(sessionId.value, 'SELFIE', file);

      // Update face match result
      if (data.faceMatch) {
        faceMatchResult.value = data.faceMatch;
      }

      currentStep.value = 4;

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถอัปโหลดได้';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Submit liveness check
   * @param {Blob} video - Video blob
   */
  const submitLiveness = async (video) => {
    if (!sessionId.value) {
      return { success: false, error: 'กรุณาเริ่ม KYC session ก่อน' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.submitLiveness(sessionId.value, video);

      livenessResult.value = {
        score: data.livenessScore,
        passed: data.passed,
      };

      if (data.passed) {
        currentStep.value = 5;
      }

      return { success: data.passed, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถตรวจสอบได้';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Initiate NDID verification
   * @param {string} citizenId - 13-digit citizen ID
   * @param {string} idpId - Bank/IDP ID (optional)
   */
  const initiateNdid = async (citizenId, idpId = null) => {
    if (!sessionId.value) {
      return { success: false, error: 'กรุณาเริ่ม KYC session ก่อน' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.initiateNdid(sessionId.value, citizenId, idpId);

      ndidStatus.value = { status: 'PENDING', ...data };

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถเริ่ม NDID ได้';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check NDID status
   */
  const checkNdidStatus = async () => {
    if (!sessionId.value) return;

    try {
      const data = await kycService.getNdidStatus(sessionId.value);
      ndidStatus.value = data;

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message };
    }
  };

  /**
   * Submit KYC for review
   */
  const submitKyc = async () => {
    if (!sessionId.value) {
      return { success: false, error: 'กรุณาเริ่ม KYC session ก่อน' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await kycService.submitKyc(sessionId.value);

      return { success: true, status: data.status, message: data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถส่งข้อมูลได้';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reset KYC state
   */
  const reset = () => {
    session.value = null;
    currentStep.value = 1;
    isLoading.value = false;
    error.value = null;
    ocrResult.value = null;
    faceMatchResult.value = null;
    livenessResult.value = null;
    ndidStatus.value = null;
  };

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    session,
    currentStep,
    isLoading,
    error,
    ocrResult,
    faceMatchResult,
    livenessResult,
    ndidStatus,

    // Getters
    sessionId,
    steps,
    isSessionActive,
    completedSteps,

    // Actions
    startSession,
    fetchSession,
    uploadIdCard,
    uploadSelfie,
    submitLiveness,
    initiateNdid,
    checkNdidStatus,
    submitKyc,
    reset,
    clearError,
  };
});
