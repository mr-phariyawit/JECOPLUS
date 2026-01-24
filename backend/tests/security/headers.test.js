
import { jest } from '@jest/globals';

// Use same mocks as other tests to avoid db connection
jest.unstable_mockModule('../../src/config/database.js', () => ({
  query: jest.fn(),
  pool: {
    on: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
  getClient: jest.fn(),
  transaction: jest.fn(),
  healthCheck: jest.fn(),
  close: jest.fn(),
  default: {
    on: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  }
}));

const { default: app } = await import('../../src/app.js');
const request = (await import('supertest')).default;

describe('Security Headers', () => {
    test('should present HSTS header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(res.headers['strict-transport-security']).toContain('includeSubDomains');
    });

    test('should present X-Content-Type-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
    
    test('should present X-Frame-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });
    
    test('should present Referrer-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
    
    test('should present Content-Security-Policy header', async () => {
        const res = await request(app).get('/');
        const csp = res.headers['content-security-policy'];
        expect(csp).toBeDefined();
        // Verify unsafe-inline is NOT in script-src (security critical)
        // Note: style-src allows 'unsafe-inline' for framework compatibility
        expect(csp).toContain("script-src 'self'");
        expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
        // Check for defaults
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("object-src 'none'");
    });
    
    test('should remove X-Powered-By header', async () => {
        const res = await request(app).get('/');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});
