import { jest } from '@jest/globals'
import { schemas } from '../../../src/middleware/validator.js'

describe('Validator Schemas', () => {
  describe('Phone Validation', () => {
    const phoneTests = [
      { input: '0891234567', valid: true, desc: 'valid 08x number' },
      { input: '0612345678', valid: true, desc: 'valid 06x number' },
      { input: '0912345678', valid: true, desc: 'valid 09x number' },
      { input: '0712345678', valid: false, desc: 'invalid prefix 07' },
      { input: '089123456', valid: false, desc: 'too short (9 digits)' },
      { input: '08912345678', valid: false, desc: 'too long (11 digits)' },
      { input: '1891234567', valid: false, desc: 'not starting with 0' },
      { input: 'abcdefghij', valid: false, desc: 'non-numeric' },
    ]

    phoneTests.forEach(({ input, valid, desc }) => {
      it(`should ${valid ? 'accept' : 'reject'} ${desc}: ${input}`, () => {
        const { error } = schemas.phone.validate(input)
        expect(!!error).toBe(!valid)
      })
    })
  })

  describe('OTP Validation', () => {
    it('should accept 6-digit numeric OTP', () => {
      expect(schemas.otp.validate('123456').error).toBeUndefined()
    })

    it('should reject non-6-digit OTP', () => {
      expect(schemas.otp.validate('12345').error).toBeDefined()
      expect(schemas.otp.validate('1234567').error).toBeDefined()
    })

    it('should reject non-numeric OTP', () => {
      expect(schemas.otp.validate('12345a').error).toBeDefined()
    })
  })

  describe('Citizen ID Validation', () => {
    it('should accept 13-digit numeric citizen ID', () => {
      expect(schemas.citizenId.validate('1234567890123').error).toBeUndefined()
    })

    it('should reject non-13-digit citizen ID', () => {
      expect(schemas.citizenId.validate('123456789012').error).toBeDefined()
    })
  })
})
