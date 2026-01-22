# Test Suite: Login + eKYC System

## Overview

Test suite สำหรับระบบ Login ด้วยเบอร์โทรไทย + eKYC 1.2 + NDID + Backoffice

**Tech Stack:**
- Backend: Jest + Supertest
- Frontend: Vitest + Vue Test Utils
- E2E: Playwright

---

## 1. Backend Unit Tests

### 1.1 Auth Service Tests

```javascript
// tests/unit/services/tokenService.test.js

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
      expect(() => tokenService.verifyAccessToken('invalid')).toThrow()
    })

    it('should throw on expired token', async () => {
      // Create token with -1 second expiry
      const token = jwt.sign({ sub: 'uuid' }, 'secret', { expiresIn: '-1s' })
      expect(() => tokenService.verifyAccessToken(token)).toThrow('TOKEN_EXPIRED')
    })
  })

  describe('refreshTokens', () => {
    it('should return new access token for valid refresh token', async () => {
      const { refreshToken } = await tokenService.generateTokenPair(mockUser, {})
      const result = await tokenService.refreshTokens(refreshToken, {})
      expect(result.accessToken).toBeDefined()
    })

    it('should reject revoked refresh token', async () => {
      const { refreshToken } = await tokenService.generateTokenPair(mockUser, {})
      await tokenService.revokeRefreshToken(refreshToken)
      await expect(tokenService.refreshTokens(refreshToken, {})).rejects.toThrow()
    })

    it('should detect token reuse and revoke all tokens', async () => {
      // Simulate token reuse attack
    })
  })
})
```

### 1.2 Firebase Service Tests

```javascript
// tests/unit/services/firebaseService.test.js

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
```

### 1.3 Validator Tests

```javascript
// tests/unit/middleware/validator.test.js

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
```

---

## 2. Backend Integration Tests

### 2.1 Auth API Tests

```javascript
// tests/integration/auth.test.js

describe('Auth API', () => {
  describe('POST /api/v1/auth/otp/request', () => {
    it('should request OTP for valid Thai phone', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '0891234567' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('sessionId')
      expect(res.body.data).toHaveProperty('expiresIn')
      expect(res.body.data).toHaveProperty('maskedPhone')
    })

    it('should reject invalid phone format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '1234567890' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should enforce cooldown between requests', async () => {
      // First request
      await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '0891234567' })

      // Immediate second request
      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '0891234567' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('OTP_COOLDOWN')
    })

    it('should enforce rate limit', async () => {
      // Send 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/api/v1/auth/otp/request')
          .send({ phone: `089123456${i}` })

        if (i === 5) {
          expect(res.status).toBe(429)
        }
      }
    })
  })

  describe('POST /api/v1/auth/otp/verify', () => {
    let sessionId

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '0891234567' })
      sessionId = res.body.data.sessionId
    })

    it('should verify correct OTP and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ sessionId, otp: '123456' })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
      expect(res.body.data).toHaveProperty('refreshToken')
      expect(res.body.data.user).toHaveProperty('id')
      expect(res.body.data.user).toHaveProperty('phone', '0891234567')
    })

    it('should reject incorrect OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ sessionId, otp: '000000' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_OTP')
    })

    it('should reject after max attempts', async () => {
      // Try 3 wrong OTPs
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/auth/otp/verify')
          .send({ sessionId, otp: '000000' })
      }

      // 4th attempt should fail with max attempts error
      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ sessionId, otp: '123456' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('OTP_MAX_ATTEMPTS')
    })

    it('should create new user for first-time login', async () => {
      const phone = '0899999999'
      const reqRes = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone })

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ sessionId: reqRes.body.data.sessionId, otp: '123456' })

      expect(res.body.data.user.isNewUser).toBe(true)
    })
  })

  describe('POST /api/v1/auth/token/refresh', () => {
    it('should refresh access token', async () => {
      const loginRes = await loginUser('0891234567')
      const { refreshToken } = loginRes.body.data

      const res = await request(app)
        .post('/api/v1/auth/token/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('accessToken')
    })

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/token/refresh')
        .send({ refreshToken: 'invalid' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and revoke tokens', async () => {
      const { accessToken, refreshToken } = await getAuthTokens()

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })

      expect(res.status).toBe(200)

      // Verify token is revoked
      const refreshRes = await request(app)
        .post('/api/v1/auth/token/refresh')
        .send({ refreshToken })

      expect(refreshRes.status).toBe(401)
    })
  })
})
```

### 2.2 User API Tests

```javascript
// tests/integration/users.test.js

describe('User API', () => {
  let accessToken

  beforeEach(async () => {
    const tokens = await getAuthTokens()
    accessToken = tokens.accessToken
  })

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data).toHaveProperty('phone')
      expect(res.body.data).toHaveProperty('kycStatus')
    })

    it('should reject without auth token', async () => {
      const res = await request(app).get('/api/v1/users/me')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/v1/users/me', () => {
    it('should update user email', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'test@example.com' })

      expect(res.status).toBe(200)
      expect(res.body.data.email).toBe('test@example.com')
    })

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'invalid-email' })

      expect(res.status).toBe(400)
    })
  })
})
```

### 2.3 KYC API Tests

```javascript
// tests/integration/kyc.test.js

describe('KYC API', () => {
  let accessToken, sessionId

  beforeEach(async () => {
    const tokens = await getAuthTokens()
    accessToken = tokens.accessToken
  })

  describe('POST /api/v1/kyc/sessions', () => {
    it('should create new KYC session', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty('sessionId')
      expect(res.body.data).toHaveProperty('sessionToken')
      expect(res.body.data).toHaveProperty('expiresAt')
      expect(res.body.data.steps).toHaveLength(5)

      sessionId = res.body.data.sessionId
    })

    it('should reject if already verified', async () => {
      // Set user as verified first
      await setUserKycStatus(accessToken, 'VERIFIED')

      const res = await request(app)
        .post('/api/v1/kyc/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('KYC_ALREADY_VERIFIED')
    })
  })

  describe('POST /api/v1/kyc/sessions/:id/documents', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/kyc/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
      sessionId = res.body.data.sessionId
    })

    it('should upload ID card front', async () => {
      const res = await request(app)
        .post(`/api/v1/kyc/sessions/${sessionId}/documents`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('documentType', 'ID_CARD_FRONT')
        .attach('file', Buffer.from('fake-image'), 'id-front.jpg')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('documentId')
      expect(res.body.data).toHaveProperty('ocrResult')
    })

    it('should reject invalid document type', async () => {
      const res = await request(app)
        .post(`/api/v1/kyc/sessions/${sessionId}/documents`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('documentType', 'INVALID_TYPE')
        .attach('file', Buffer.from('fake'), 'test.jpg')

      expect(res.status).toBe(400)
    })

    it('should reject invalid file type', async () => {
      const res = await request(app)
        .post(`/api/v1/kyc/sessions/${sessionId}/documents`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('documentType', 'ID_CARD_FRONT')
        .attach('file', Buffer.from('fake'), 'test.exe')

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/kyc/sessions/:id/submit', () => {
    it('should submit KYC after completing all steps', async () => {
      await completeAllKycSteps(accessToken, sessionId)

      const res = await request(app)
        .post(`/api/v1/kyc/sessions/${sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(['PROCESSING', 'APPROVED']).toContain(res.body.data.status)
    })

    it('should reject if steps incomplete', async () => {
      const createRes = await request(app)
        .post('/api/v1/kyc/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      const res = await request(app)
        .post(`/api/v1/kyc/sessions/${createRes.body.data.sessionId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(400)
    })
  })
})
```

---

## 3. Frontend Unit Tests

### 3.1 Auth Store Tests

```javascript
// tests/unit/stores/auth.test.js

import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authService from '@/services/authService'

vi.mock('@/services/authService')
vi.mock('@/services/userService')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('sendOTP', () => {
    it('should call authService.requestOtp with phone', async () => {
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
```

### 3.2 KYC Store Tests

```javascript
// tests/unit/stores/kyc.test.js

import { setActivePinia, createPinia } from 'pinia'
import { useKycStore } from '@/stores/kyc'
import * as kycService from '@/services/kycService'

vi.mock('@/services/kycService')

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
      store.session = { sessionId: 'kyc-session-id' }

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = await store.uploadIdCard('front', file)

      expect(result.success).toBe(true)
      expect(store.ocrResult.firstName).toBe('สมชาย')
      expect(store.currentStep).toBe(2)
    })
  })
})
```

### 3.3 API Service Tests

```javascript
// tests/unit/services/api.test.js

import api, { setTokens, clearTokens, getAccessToken } from '@/services/api'
import MockAdapter from 'axios-mock-adapter'

describe('API Service', () => {
  let mock

  beforeEach(() => {
    mock = new MockAdapter(api)
    clearTokens()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      setTokens('test-token', null)
      mock.onGet('/test').reply((config) => {
        expect(config.headers.Authorization).toBe('Bearer test-token')
        return [200, {}]
      })

      await api.get('/test')
    })

    it('should add X-Device-ID header', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config.headers['X-Device-ID']).toBeDefined()
        return [200, {}]
      })

      await api.get('/test')
    })
  })

  describe('Response Interceptor', () => {
    it('should refresh token on 401 with TOKEN_EXPIRED', async () => {
      setTokens('expired-token', 'refresh-token')

      // First call returns 401
      mock.onGet('/test').replyOnce(401, {
        error: { code: 'TOKEN_EXPIRED' },
      })

      // Refresh call succeeds
      mock.onPost('/auth/token/refresh').replyOnce(200, {
        data: { accessToken: 'new-token' },
      })

      // Retry succeeds
      mock.onGet('/test').replyOnce(200, { data: 'success' })

      const res = await api.get('/test')
      expect(res.data.data).toBe('success')
      expect(getAccessToken()).toBe('new-token')
    })
  })
})
```

---

## 4. Frontend Component Tests

### 4.1 LoginView Tests

```javascript
// tests/components/LoginView.test.js

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

describe('LoginView', () => {
  let wrapper, router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/otp', component: { template: '<div>OTP</div>' } },
      ],
    })
  })

  it('renders phone input', () => {
    wrapper = mount(LoginView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('input[type="tel"]').exists()).toBe(true)
  })

  it('validates Thai phone format', async () => {
    wrapper = mount(LoginView, {
      global: { plugins: [router] },
    })

    const input = wrapper.find('input[type="tel"]')

    // Invalid phone
    await input.setValue('1234567890')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()

    // Valid phone
    await input.setValue('0891234567')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('navigates to OTP on success', async () => {
    wrapper = mount(LoginView, {
      global: { plugins: [router] },
    })

    // Mock store
    const store = useAuthStore()
    store.sendOTP = vi.fn().mockResolvedValue({ success: true })

    await wrapper.find('input[type="tel"]').setValue('0891234567')
    await wrapper.find('button').trigger('click')

    expect(router.currentRoute.value.path).toBe('/otp')
  })
})
```

### 4.2 OTPView Tests

```javascript
// tests/components/OTPView.test.js

import { mount } from '@vue/test-utils'
import OTPView from '@/views/OTPView.vue'

describe('OTPView', () => {
  it('renders 6 OTP input fields', () => {
    const wrapper = mount(OTPView, { /* ... */ })
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(6)
  })

  it('auto-focuses next input on digit entry', async () => {
    const wrapper = mount(OTPView, { /* ... */ })
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('1')
    expect(document.activeElement).toBe(inputs[1].element)
  })

  it('handles paste of 6-digit OTP', async () => {
    const wrapper = mount(OTPView, { /* ... */ })
    const inputs = wrapper.findAll('input')

    const pasteEvent = {
      preventDefault: vi.fn(),
      clipboardData: { getData: () => '123456' },
    }
    await inputs[0].trigger('paste', pasteEvent)

    expect(inputs[0].element.value).toBe('1')
    expect(inputs[5].element.value).toBe('6')
  })

  it('shows countdown timer', () => {
    const wrapper = mount(OTPView, { /* ... */ })
    expect(wrapper.text()).toContain('60 วินาที')
  })
})
```

---

## 5. E2E Tests (Playwright)

### 5.1 Login Flow

```javascript
// tests/e2e/login.spec.js

import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login with valid OTP', async ({ page }) => {
    await page.goto('/login')

    // Enter phone number
    await page.fill('input[type="tel"]', '0891234567')
    await page.click('button:has-text("ขอรหัส OTP")')

    // Wait for OTP page
    await expect(page).toHaveURL('/otp')

    // Enter OTP
    const otpInputs = page.locator('.otp__input')
    await otpInputs.nth(0).fill('1')
    await otpInputs.nth(1).fill('2')
    await otpInputs.nth(2).fill('3')
    await otpInputs.nth(3).fill('4')
    await otpInputs.nth(4).fill('5')
    await otpInputs.nth(5).fill('6')

    await page.click('button:has-text("ยืนยัน")')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error for invalid OTP', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="tel"]', '0891234567')
    await page.click('button:has-text("ขอรหัส OTP")')

    await expect(page).toHaveURL('/otp')

    // Enter wrong OTP
    const otpInputs = page.locator('.otp__input')
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('0')
    }
    await page.click('button:has-text("ยืนยัน")')

    // Should show error
    await expect(page.locator('.otp__error')).toBeVisible()
    await expect(page.locator('.otp__error')).toContainText('ไม่ถูกต้อง')
  })

  test('should resend OTP after countdown', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="tel"]', '0891234567')
    await page.click('button:has-text("ขอรหัส OTP")')

    await expect(page).toHaveURL('/otp')

    // Wait for resend button
    await expect(page.locator('button:has-text("ขอรหัส OTP ใหม่")')).toBeVisible({ timeout: 65000 })
    await page.click('button:has-text("ขอรหัส OTP ใหม่")')

    // Countdown should reset
    await expect(page.locator('text=60 วินาที')).toBeVisible()
  })
})
```

### 5.2 KYC Flow

```javascript
// tests/e2e/kyc.spec.js

import { test, expect } from '@playwright/test'

test.describe('KYC Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await loginUser(page)
  })

  test('should complete KYC steps', async ({ page }) => {
    await page.goto('/kyc')

    // Start KYC
    await expect(page.locator('text=ยืนยันตัวตนด้วย eKYC')).toBeVisible()
    await page.click('button:has-text("เริ่มยืนยันตัวตน")')

    // ID Card Front
    await expect(page).toHaveURL('/kyc/id-card')
    await expect(page.locator('text=ถ่ายบัตรด้านหน้า')).toBeVisible()

    // Grant camera permission and capture (mocked in test)
    await mockCameraCapture(page)
    await page.click('button:has-text("ถ่ายภาพ")')
    await page.click('button:has-text("ถัดไป")')

    // ID Card Back
    await expect(page.locator('text=ถ่ายบัตรด้านหลัง')).toBeVisible()
    await mockCameraCapture(page)
    await page.click('button:has-text("ถ่ายภาพ")')
    await page.click('button:has-text("ยืนยัน")')

    // Selfie
    await expect(page).toHaveURL('/kyc/selfie')
    await mockCameraCapture(page)
    await page.click('button:has-text("ถ่ายภาพ")')
    await expect(page.locator('text=ใบหน้าตรงกับบัตรประชาชน')).toBeVisible()
    await page.click('button:has-text("ถัดไป")')

    // Result
    await expect(page).toHaveURL(/\/kyc\/result\//)
  })
})
```

---

## 6. Test Configuration

### 6.1 Backend Jest Config

```javascript
// backend/jest.config.js

export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### 6.2 Frontend Vitest Config

```javascript
// vitest.config.js

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 6.3 Playwright Config

```javascript
// playwright.config.js

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

---

## 7. Test Commands

```bash
# Backend
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test -- --coverage # With coverage

# Frontend
npm run test              # Run Vitest
npm run test:ui           # Vitest UI
npm run test:coverage     # With coverage

# E2E
npm run test:e2e          # Run Playwright
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:debug    # Debug mode
```

---

## 8. Coverage Requirements

| Module | Target |
|--------|--------|
| Auth APIs | 90% |
| KYC APIs | 85% |
| Admin APIs | 80% |
| Token Service | 95% |
| Validators | 100% |
| Auth Store | 90% |
| KYC Store | 85% |
| Components | 80% |
| E2E Critical Paths | 100% |

---

## 9. CI Pipeline Integration

```yaml
# .github/workflows/test.yml

name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: jecoplus_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm test -- --coverage
      - uses: codecov/codecov-action@v4

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```
