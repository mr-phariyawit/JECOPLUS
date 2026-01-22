import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authService from '@/services/authService'
// We might need to mock userService if it's used in actions, but let's see.
// The code uses it in fetchProfile and updateProfile.
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock services
vi.mock('@/services/authService', () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn()
}))

vi.mock('@/services/userService', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn()
}))

vi.mock('@/services/api', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
  clearTokens: vi.fn()
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('sendOTP', () => {
    it('should call authService.requestOtp with phone', async () => {
      // Setup mock
      authService.requestOtp.mockResolvedValue({
        sessionId: 'test-session',
        expiresIn: 300,
        maskedPhone: '089-XXX-4567',
      })

      const store = useAuthStore()
      const result = await store.sendOTP('0891234567')

      expect(authService.requestOtp).toHaveBeenCalledWith('0891234567')
      expect(result.success).toBe(true)
      expect(store.phone).toBe('0891234567')
      expect(store.otpSessionId).toBe('test-session')
    })

    it('should handle API error', async () => {
      authService.requestOtp.mockRejectedValue({
        response: { data: { error: { message: 'Rate limit exceeded' } } },
      })

      const store = useAuthStore()
      const result = await store.sendOTP('0891234567')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
      expect(store.error).toBe('Rate limit exceeded')
    })
  })

  describe('verifyOTP', () => {
    it('should login user on successful verification', async () => {
      authService.verifyOtp.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          phone: '0891234567',
          kycStatus: 'NONE',
          isNewUser: true,
          firstName: 'Somchai', 
          lastName: 'Test',
          email: 'test@example.com'
        },
      })

      const store = useAuthStore()
      store.otpSessionId = 'test-session'

      const result = await store.verifyOTP('123456')

      expect(authService.verifyOtp).toHaveBeenCalledWith('test-session', '123456')
      expect(result.success).toBe(true)
      expect(store.isLoggedIn).toBe(true)
      expect(store.user.id).toBe('user-id')
    })

    it('should fail without session ID', async () => {
      const store = useAuthStore()
      const result = await store.verifyOTP('123456')

      expect(result.success).toBe(false)
      expect(authService.verifyOtp).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should clear user state', async () => {
      const store = useAuthStore()
      store.user = { id: 'user-id' }
      store.isLoggedIn = true

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('fullName getter', () => {
    it('should return full name', () => {
      const store = useAuthStore()
      store.user = { firstName: 'สมชาย', lastName: 'ทดสอบ' }

      expect(store.fullName).toBe('สมชาย ทดสอบ')
    })

    it('should handle missing names', () => {
      const store = useAuthStore()
      store.user = { firstName: 'สมชาย' }

      expect(store.fullName).toBe('สมชาย')
    })
  })
})
