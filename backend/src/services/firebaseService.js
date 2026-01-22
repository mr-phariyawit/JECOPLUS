import admin from 'firebase-admin';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { BadRequest, AuthErrors } from '../utils/errors.js';

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Skip initialization in development if credentials not provided
  if ((config.env === 'development' || config.env === 'test') && !config.firebase.projectId) {
    logger.warn('Firebase credentials not provided. Using mock mode.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
    });

    logger.info('Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Send OTP via Firebase Phone Auth
 * Note: In a real implementation, Firebase Phone Auth is typically done client-side
 * This is a placeholder for server-side phone verification flow
 */
export const sendOtp = async (phoneNumber) => {
  // Initialize Firebase if not already done
  initializeFirebase();

  // Format phone number for Thailand (+66)
  const formattedPhone = phoneNumber.startsWith('0')
    ? `+66${phoneNumber.substring(1)}`
    : phoneNumber;

  if (config.env === 'development' || config.env === 'test') {
    // In development, return mock session info
    logger.info('Mock OTP sent', { phone: formattedPhone });
    return JSON.stringify({ mock: true, phone: formattedPhone, timestamp: Date.now() });
  }

  try {
    // In production, you would typically:
    // 1. Use Firebase Auth REST API for phone verification
    // 2. Or handle this client-side with Firebase JS SDK

    // For server-side verification, you might use custom token or
    // integrate with a third-party SMS provider via Firebase Functions

    // This is a simplified placeholder
    const sessionInfo = {
      phone: formattedPhone,
      timestamp: Date.now(),
      // In reality, this would be a session token from Firebase
    };

    logger.info('OTP request initiated', { phone: formattedPhone });
    return JSON.stringify(sessionInfo);
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    throw BadRequest('ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่', AuthErrors.FIREBASE_ERROR);
  }
};

/**
 * Verify OTP code
 * Note: In production, this would verify against Firebase
 */
export const verifyOtp = async (sessionInfo, otpCode) => {
  if (config.env === 'development' || config.env === 'test') {
    // In development, always accept '123456'
    return otpCode === '123456';
  }

  try {
    // Parse session info
    const session = JSON.parse(sessionInfo);

    // In production, you would verify the OTP with Firebase
    // This is a placeholder for the actual verification logic

    // Firebase phone auth verification is typically done client-side
    // The server receives an ID token after successful verification

    // For now, return true as a placeholder
    logger.info('OTP verification attempted', { phone: session.phone });
    return true;
  } catch (error) {
    logger.error('Failed to verify OTP:', error);
    return false;
  }
};

/**
 * Verify Firebase ID Token (used after client-side phone auth)
 */
export const verifyIdToken = async (idToken) => {
  initializeFirebase();

  if (!firebaseApp) {
    throw BadRequest('Firebase not configured', AuthErrors.FIREBASE_ERROR);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
      email: decodedToken.email,
    };
  } catch (error) {
    logger.error('Failed to verify ID token:', error);
    throw Unauthorized('Invalid Firebase token', AuthErrors.FIREBASE_ERROR);
  }
};

/**
 * Get user by Firebase UID
 */
export const getFirebaseUser = async (uid) => {
  initializeFirebase();

  if (!firebaseApp) {
    return null;
  }

  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    logger.error('Failed to get Firebase user:', error);
    return null;
  }
};

/**
 * Delete Firebase user
 */
export const deleteFirebaseUser = async (uid) => {
  initializeFirebase();

  if (!firebaseApp) {
    return false;
  }

  try {
    await admin.auth().deleteUser(uid);
    logger.info('Firebase user deleted', { uid });
    return true;
  } catch (error) {
    logger.error('Failed to delete Firebase user:', error);
    return false;
  }
};

export default {
  initializeFirebase,
  sendOtp,
  verifyOtp,
  verifyIdToken,
  getFirebaseUser,
  deleteFirebaseUser,
};
