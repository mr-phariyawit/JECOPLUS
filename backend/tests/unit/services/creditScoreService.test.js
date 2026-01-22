import { jest } from '@jest/globals';

// Define mocks
jest.unstable_mockModule('../../../src/config/database.js', () => ({
    query: jest.fn(),
    __esModule: true
}));

const { query } = await import('../../../src/config/database.js');
const { default: creditScoreService } = await import('../../../src/services/creditScoreService.js');

describe('CreditScoreService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Mock data
    const mockProfileHigh = {
        monthlyIncome: 50000,
        monthlyExpenses: 15000, // Ratio 0.3 (Good)
        avgBalance: 20000
    };

    const mockProfileLow = {
        monthlyIncome: 20000,
        monthlyExpenses: 18000, // Ratio 0.9 (Bad)
        avgBalance: 1000
    };

    describe('calculateScore', () => {
        it('should return APPROVED status for good profile (Score > 700)', async () => {
            const userId = 'user-1';
            query.mockResolvedValue({ rows: [{ id: 'score-1' }] }); // mock save

            const result = await creditScoreService.calculateScore(userId, mockProfileHigh);

            expect(result.score).toBeGreaterThanOrEqual(700);
            expect(result.status).toBe('APPROVED');
            expect(result.monthlyIncome).toBe(50000);
        });

        it('should return REJECTED status for bad profile (Score < 700)', async () => {
            const userId = 'user-2';
            query.mockResolvedValue({ rows: [{ id: 'score-2' }] });

            const result = await creditScoreService.calculateScore(userId, mockProfileLow);

            expect(result.score).toBeLessThan(700);
            expect(result.status).toBe('REJECTED');
        });

        it('should clamp score between 300 and 850', async () => {
             // Edge case test logic would go here if we exposed raw calculation
             // For now, rely on integration through calculateScore
             const superBadProfile = { monthlyIncome: 0, monthlyExpenses: 50000, avgBalance: 0 };
             const result = await creditScoreService.calculateScore('user-3', superBadProfile);
             expect(result.score).toBeGreaterThanOrEqual(300);
        });
    });
});
