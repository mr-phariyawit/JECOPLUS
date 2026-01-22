import { jest } from '@jest/globals';

// 1. Mock the database module
// We must do this BEFORE importing app
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
  },
}));

// 2. Import modules
const { query } = await import('../../src/config/database.js');
const { default: app } = await import('../../src/app.js');
const request = (await import('supertest')).default;

describe('SQL Injection Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Service (Public)', () => {
    test('should ignore malicious sort parameter in listProducts', async () => {
      const maliciousSort = 'price; DROP TABLE products; --';
      
      // Mock db responses
      query
        .mockResolvedValueOnce({ rows: [{ total: 10 }] }) // count query
        .mockResolvedValueOnce({ rows: [] }); // products query

      const res = await request(app)
        .get(`/api/v1/products?sortBy=${encodeURIComponent(maliciousSort)}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Verify appropriate SQL was generated
      const productQueryCall = query.mock.calls[1]; // 0 is count, 1 is select
      
      expect(productQueryCall).toBeDefined();
      const sql = productQueryCall[0];
      
      // Should NOT contain the dropped table command
      expect(sql).not.toContain('DROP TABLE');
      expect(sql).not.toContain('products; --');
      
      // Should contain default sort or safe sort (created_at is default)
      expect(sql).toContain('ORDER BY p.created_at');
    });
    
    test('should use default sort when invalid column provided', async () => {
       // Mock db responses
      query
        .mockResolvedValueOnce({ rows: [{ total: 10 }] }) // count query
        .mockResolvedValueOnce({ rows: [] }); // products query

       const res = await request(app)
        .get('/api/v1/products?sortBy=invalid_column')
        .send();
        
       expect(res.status).toBe(200);
       
       const productQueryCall = query.mock.calls[1];
       const sql = productQueryCall[0];
       expect(sql).toContain('ORDER BY p.created_at');
    });

    test('should allow valid sort column', async () => {
      // Mock db responses
      query
        .mockResolvedValueOnce({ rows: [{ total: 10 }] }) // count query
        .mockResolvedValueOnce({ rows: [] }); // products query

       const res = await request(app)
        .get('/api/v1/products?sortBy=price')
        .send();
        
       expect(res.status).toBe(200);
       
       const productQueryCall = query.mock.calls[1];
       const sql = productQueryCall[0];
       expect(sql).toContain('ORDER BY p.price');
    });
  });
});
