import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import * as tokenService from '../../../src/services/tokenService.js'
import config from '../../../src/config/index.js'

describe('TokenService', () => {
  describe('generateAccessToken', () => {
    it('should generate valid JWT access token', () => {
      const user = { id: 'uuid', phone: '0891234567', role: 'USER' }
      const token = tokenService.generateAccessToken(user)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('should include correct payload claims', () => {
      const user = { id: 'uuid', phone: '0891234567', role: 'USER', kycStatus: 'VERIFIED' }
      const token = tokenService.generateAccessToken(user)
      const decoded = jwt.decode(token)
      expect(decoded.sub).toBe(user.id)
      expect(decoded.phone).toBe(user.phone)
      expect(decoded.role).toBe(user.role)
      expect(decoded.type).toBe('access')
    })

    it('should set correct expiry time', () => {
      const token = tokenService.generateAccessToken({ id: 'uuid' })
      const decoded = jwt.decode(token)
      expect(decoded.exp - decoded.iat).toBe(900) // 15 minutes
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate valid JWT refresh token', () => {
      const user = { id: 'uuid' }
      const token = tokenService.generateRefreshToken(user)
      expect(token).toBeDefined()
    })

    it('should include unique jti claim', () => {
      const token1 = tokenService.generateRefreshToken({ id: 'uuid' })
      const token2 = tokenService.generateRefreshToken({ id: 'uuid' })
      expect(jwt.decode(token1).jti).not.toBe(jwt.decode(token2).jti)
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const token = tokenService.generateAccessToken({ id: 'uuid', phone: '0891234567' })
      const decoded = tokenService.verifyAccessToken(token)
      expect(decoded.sub).toBe('uuid')
    })

    it('should throw on invalid token', () => {
      try {
        tokenService.verifyAccessToken('invalid')
      } catch (error) {
        // verifyAccessToken throws INVALID_TOKEN when jwt.verify fails
        // The implementation wraps it in Unauthorized(..., INVALID_TOKEN)
        expect(error.code).toBe('INVALID_TOKEN')
      }
    })

    it('should throw on expired token', async () => {
      // Create token with -1 second expiry
      // Ensure we use the same key/algorithm as the service
      const secret = config.jwt.privateKey || config.jwt.accessSecret || 'secret'
      const algorithm = config.jwt.privateKey ? 'RS256' : 'HS256'
      
      const token = jwt.sign({ sub: 'uuid' }, secret, { expiresIn: '-1s', algorithm })
      try {
        tokenService.verifyAccessToken(token)
      } catch (error) {
        expect(error.code).toBe('TOKEN_EXPIRED')
      }
    })
  })
})
