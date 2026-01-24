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
            // Mock fetching latest score (with user data)
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 'score-1', 
                    score: 750, 
                    status: 'APPROVED',
                    first_name: 'Test',
                    last_name: 'User',
                    birth_date: '1990-01-01'
                }] 
            });
            // Mock KYC query
            query.mockResolvedValueOnce({ rows: [{ citizen_id: '1234567890123' }] });
            // Mock insert app
            query.mockResolvedValueOnce({ 
                rows: [{ id: 'app-1', status: 'PENDING_PARTNER' }] 
            });

            const result = await loanService.submitApplication('user-1', { 
                amount: 10000, 
                term: 12, 
                purpose: 'personal' 
            });
            
            expect(result.status).toBe('PENDING_PARTNER');
            expect(query).toHaveBeenCalledTimes(3);
        });

        it('should throw error if no credit score found', async () => {
            query.mockResolvedValueOnce({ rows: [] }); // No score

            await expect(loanService.submitApplication('user-no-score', { amount: 10000 }))
                .rejects.toThrow('No credit score found');
        });
    });
});
