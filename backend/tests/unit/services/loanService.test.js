import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/config/database.js', () => ({
    query: jest.fn(),
    __esModule: true
}));

const { query } = await import('../../../src/config/database.js');
const { default: loanService } = await import('../../../src/services/loanService.js');

describe('LoanService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('submitApplication', () => {
        it('should create application if score exists', async () => {
            // Mock fetching latest score
            query.mockResolvedValueOnce({ rows: [{ id: 'score-1', score: 750 }] });
            // Mock insert app
            query.mockResolvedValueOnce({ rows: [{ id: 'app-1', status: 'PENDING' }] });

            const result = await loanService.submitApplication('user-1', { amount: 10000 });
            
            expect(result.status).toBe('PENDING');
            expect(query).toHaveBeenCalledTimes(2);
        });

        it('should throw error if no credit score found', async () => {
            query.mockResolvedValueOnce({ rows: [] }); // No score

            await expect(loanService.submitApplication('user-no-score', { amount: 10000 }))
                .rejects.toThrow('No credit score found');
        });
    });
});
