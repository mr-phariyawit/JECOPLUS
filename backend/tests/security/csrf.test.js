import request from 'supertest';
import app from '../../src/app.js';

describe('CSRF Protection', () => {
  let agent;
  let accessToken;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);

    // 1. Request OTP
    const otpRequestRes = await agent
      .post('/api/v1/auth/otp/request')
      .send({
        phone: '0812345678',
        deviceId: 'test-device'
      });
      
    const sessionId = otpRequestRes.body.data.sessionId;
    const otp = otpRequestRes.body.data.devOtp || '123456';

    const loginRes = await agent
      .post('/api/v1/auth/otp/verify')
      .send({
        sessionId: sessionId,
        otp: otp,
        deviceId: 'test-device',
      });

    accessToken = loginRes.body.data.accessToken;
    csrfToken = loginRes.body.data.csrfToken;
  });

  test('should reject request without CSRF token', async () => {
    // Note: We use agent here to send cookies, but we omit the header
    const res = await agent
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 1000, method: 'promptpay' });

    expect(res.status).toBe(403);
    // Fix: check res.body.error.message
    expect(res.body.error.message).toContain('CSRF');
  });

  test('should accept request with valid CSRF token', async () => {
    const res = await agent
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ amount: 1000, method: 'promptpay' });

    expect(res.status).not.toBe(403);
  });
  
  test('should reject request with invalid CSRF token', async () => {
    const res = await agent
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-CSRF-Token', 'invalid-token')
      .send({ amount: 1000, method: 'promptpay' });

    expect(res.status).toBe(403);
  });
});
