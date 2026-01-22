import { jest } from '@jest/globals'
import * as firebaseService from '../../../src/services/firebaseService.js'

// Mock environment variables
process.env.FIREBASE_MOCK_MODE = 'true'

describe('FirebaseService', () => {
  describe('sendOtp', () => {
    it('should format Thai phone number correctly', async () => {
      const result = await firebaseService.sendOtp('0891234567')
      expect(result).toContain('+66891234567')
    })

    it('should return session info', async () => {
      const result = await firebaseService.sendOtp('0891234567')
      expect(JSON.parse(result)).toHaveProperty('phone')
      expect(JSON.parse(result)).toHaveProperty('timestamp')
    })
  })

  describe('verifyOtp (development)', () => {
    it('should accept "123456" in development mode', async () => {
      process.env.NODE_ENV = 'development'
      const result = await firebaseService.verifyOtp('{}', '123456')
      expect(result).toBe(true)
    })

    it('should reject invalid OTP in development mode', async () => {
      process.env.NODE_ENV = 'development'
      const result = await firebaseService.verifyOtp('{}', '000000')
      expect(result).toBe(false)
    })
  })
})
