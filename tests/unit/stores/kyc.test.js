import { setActivePinia, createPinia } from 'pinia'
import { useKycStore } from '@/stores/kyc'
import * as kycService from '@/services/kycService'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/services/kycService', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
  uploadDocument: vi.fn(),
  submitLiveness: vi.fn(),
  initiateNdid: vi.fn(),
  getNdidStatus: vi.fn(),
  submitKyc: vi.fn()
}))

describe('KYC Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('startSession', () => {
    it('should create KYC session', async () => {
      kycService.createSession.mockResolvedValue({
        sessionId: 'kyc-session-id',
        sessionToken: 'token',
        expiresAt: '2025-01-23T00:00:00Z',
        steps: [],
      })

      const store = useKycStore()
      const result = await store.startSession()

      expect(result.success).toBe(true)
      expect(store.sessionId).toBe('kyc-session-id')
    })
  })

  describe('uploadIdCard', () => {
    it('should upload and update OCR result', async () => {
      kycService.uploadDocument.mockResolvedValue({
        documentId: 'doc-id',
        ocrResult: {
          citizenId: '1234567890123',
          firstName: 'สมชาย',
          lastName: 'ทดสอบ',
        },
      })

      const store = useKycStore()
      // Manually set session state as if established
      store.session = { sessionId: 'kyc-session-id' }

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = await store.uploadIdCard('front', file)

      expect(result.success).toBe(true)
      expect(store.ocrResult.firstName).toBe('สมชาย')
      expect(store.currentStep).toBe(2)
    })
  })
})
