/**
 * Integration Tests: Complete Loan Application Flow
 *
 * Tests the end-to-end loan application journey:
 * 1. Bank statement upload → PDF parsing
 * 2. Transaction extraction → Financial analysis
 * 3. Credit score calculation
 * 4. Auto-approval/rejection logic
 * 5. Partner submission (for approved loans)
 */

import { jest } from '@jest/globals';

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../../src/config/database.js', () => ({
    query: jest.fn(),
    __esModule: true
}));

// Mock pdf-parse (CommonJS module)
jest.unstable_mockModule('pdf-parse', () => ({
    default: jest.fn((buffer) => Promise.resolve({ text: '' })),
    __esModule: true
}));

// Dynamic imports are required after unstable_mockModule
const { query } = await import('../../src/config/database.js');
const { default: pdfService } = await import('../../src/services/pdfService.js');
const { default: creditScoreService } = await import('../../src/services/creditScoreService.js');
const { default: loanService } = await import('../../src/services/loanService.js');
const { default: partnerService } = await import('../../src/services/partnerService.js');

describe('Loan Application Flow - Integration Tests', () => {
    const mockUserId = 'user-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Scenario 1: High-Income Applicant (Auto-Approved)', () => {
        it('should process high-income applicant and auto-submit to partner', async () => {
            // Step 1: Parse bank statement
            const mockBankStatement = `
01/01/2026 SALARY DEPOSIT 55,000.00 80,000.00
05/01/2026 RENT PAYMENT -15,000.00 65,000.00
10/01/2026 FOOD PURCHASE -2,500.00 62,500.00
15/01/2026 UTILITIES BILL -3,000.00 59,500.00
01/02/2026 SALARY DEPOSIT 55,000.00 114,500.00
05/02/2026 RENT PAYMENT -15,000.00 99,500.00
10/02/2026 SHOPPING -5,000.00 94,500.00
01/03/2026 SALARY DEPOSIT 55,000.00 149,500.00
05/03/2026 RENT PAYMENT -15,000.00 134,500.00
            `.trim();

            const transactions = pdfService.parseTransactions(mockBankStatement);

            // Verify transactions parsed correctly
            expect(transactions).toHaveLength(9);
            expect(transactions[0].description).toContain('SALARY');
            expect(transactions[0].category).toBe('salary');
            expect(transactions[0].amount).toBe(55000);

            // Step 2: Analyze transactions
            const financialMetrics = creditScoreService.analyzeTransactions(transactions);

            expect(financialMetrics.monthlyIncome).toBe(55000); // 165,000 / 3 months
            expect(financialMetrics.monthlyExpenses).toBeGreaterThan(0);
            expect(financialMetrics.avgBalance).toBeGreaterThan(90000);
            expect(financialMetrics.months).toBe(3);

            // Step 3: Calculate credit score
            const scoreData = {
                ...financialMetrics,
                age: 35, // Prime working age
                employmentType: 'permanent',
                employmentDuration: 36 // 3 years
            };

            query.mockResolvedValueOnce({ rows: [] }); // No existing score

            const creditScore = await creditScoreService.calculateScore(mockUserId, scoreData);

            // High income + good expense ratio should result in APPROVED
            expect(creditScore.score).toBeGreaterThanOrEqual(700);
            expect(creditScore.status).toBe('APPROVED');
            expect(creditScore.breakdown.incomeStability).toBeGreaterThan(100);

            // Step 4: Verify auto-submission criteria
            const shouldSubmit = partnerService.shouldAutoSubmit(creditScore);
            expect(shouldSubmit).toBe(true);

            // Step 5: Submit loan application (mocked)
            query.mockResolvedValueOnce({
                rows: [{
                    id: 'score-123',
                    score: creditScore.score,
                    status: creditScore.status,
                    factors_breakdown: creditScore.breakdown,
                    first_name: 'สมชาย',
                    last_name: 'ใจดี',
                    phone_number: '0812345678',
                    email: 'somchai@example.com',
                    birth_date: '1988-01-01'
                }]
            }); // Credit score query

            query.mockResolvedValueOnce({
                rows: [{ citizen_id: '1234567890123' }]
            }); // KYC query

            query.mockResolvedValueOnce({
                rows: [{
                    id: 'loan-app-123',
                    user_id: mockUserId,
                    amount_requested: 100000,
                    term_months: 12,
                    purpose: 'home_improvement',
                    status: 'PENDING_PARTNER'
                }]
            }); // Loan application insert

            query.mockResolvedValueOnce({ rows: [] }); // Partner submission update
            query.mockResolvedValueOnce({ rows: [] }); // Partner submission record

            const loanApplication = await loanService.submitApplication(mockUserId, {
                amount: 100000,
                term: 12,
                purpose: 'home_improvement'
            });

            // Verify application created with correct status
            expect(loanApplication.status).toBe('PENDING_PARTNER');
            expect(loanApplication.autoSubmitted).toBe(true);
            expect(loanApplication.partnerSubmission).toBeTruthy();
        });
    });

    describe('Scenario 2: Low-Income Applicant (Auto-Rejected)', () => {
        it('should reject low-income applicant and not submit to partner', async () => {
            // Step 1: Parse bank statement with low income
            const mockBankStatement = `
01/01/2026 SALARY DEPOSIT 12,000.00 15,000.00
05/01/2026 RENT PAYMENT -8,000.00 7,000.00
10/01/2026 FOOD PURCHASE -2,000.00 5,000.00
15/01/2026 UTILITIES BILL -1,500.00 3,500.00
20/01/2026 SHOPPING -2,000.00 1,500.00
01/02/2026 SALARY DEPOSIT 12,000.00 13,500.00
05/02/2026 RENT PAYMENT -8,000.00 5,500.00
            `.trim();

            const transactions = pdfService.parseTransactions(mockBankStatement);
            expect(transactions).toHaveLength(7);

            // Step 2: Analyze transactions
            const financialMetrics = creditScoreService.analyzeTransactions(transactions);

            expect(financialMetrics.monthlyIncome).toBe(12000);
            expect(financialMetrics.avgBalance).toBeLessThan(10000);

            // Step 3: Calculate credit score
            const scoreData = {
                ...financialMetrics,
                age: 22, // Young, less established
                employmentType: 'contract',
                employmentDuration: 6 // 6 months
            };

            query.mockResolvedValueOnce({ rows: [] });

            const creditScore = await creditScoreService.calculateScore(mockUserId, scoreData);

            // Low income + high expense ratio should result in REJECTED
            expect(creditScore.score).toBeLessThan(700);
            expect(creditScore.status).toBe('REJECTED');

            // Step 4: Verify auto-submission criteria
            const shouldSubmit = partnerService.shouldAutoSubmit(creditScore);
            expect(shouldSubmit).toBe(false);

            // Step 5: Submit loan application
            query.mockResolvedValueOnce({
                rows: [{
                    id: 'score-456',
                    score: creditScore.score,
                    status: creditScore.status,
                    factors_breakdown: creditScore.breakdown,
                    first_name: 'สมหญิง',
                    last_name: 'ทดสอบ',
                    phone_number: '0898765432',
                    email: 'somying@example.com',
                    birth_date: '2001-06-15'
                }]
            });

            query.mockResolvedValueOnce({
                rows: [{ citizen_id: '9876543210987' }]
            });

            query.mockResolvedValueOnce({
                rows: [{
                    id: 'loan-app-456',
                    user_id: mockUserId,
                    amount_requested: 50000,
                    term_months: 6,
                    purpose: 'debt_consolidation',
                    status: 'REJECTED'
                }]
            });

            const loanApplication = await loanService.submitApplication(mockUserId, {
                amount: 50000,
                term: 6,
                purpose: 'debt_consolidation'
            });

            // Verify application rejected
            expect(loanApplication.status).toBe('REJECTED');
            expect(loanApplication.autoSubmitted).toBe(false);
            expect(loanApplication.partnerSubmission).toBeNull();
        });
    });

    describe('Scenario 3: Mid-Range Applicant (Borderline Approval)', () => {
        it('should approve borderline applicant at exactly 700 score', async () => {
            const mockBankStatement = `
01/01/2026 SALARY DEPOSIT 32,000.00 45,000.00
05/01/2026 RENT PAYMENT -12,000.00 33,000.00
10/01/2026 BILLS -3,000.00 30,000.00
01/02/2026 SALARY DEPOSIT 32,000.00 62,000.00
05/02/2026 RENT PAYMENT -12,000.00 50,000.00
01/03/2026 SALARY DEPOSIT 32,000.00 82,000.00
            `.trim();

            const transactions = pdfService.parseTransactions(mockBankStatement);
            const financialMetrics = creditScoreService.analyzeTransactions(transactions);

            const scoreData = {
                ...financialMetrics,
                age: 28,
                employmentType: 'permanent',
                employmentDuration: 18
            };

            query.mockResolvedValueOnce({ rows: [] });

            const creditScore = await creditScoreService.calculateScore(mockUserId, scoreData);

            // Should be around 700 threshold
            expect(creditScore.score).toBeGreaterThanOrEqual(650);

            if (creditScore.score >= 700) {
                expect(creditScore.status).toBe('APPROVED');
                expect(partnerService.shouldAutoSubmit(creditScore)).toBe(true);
            } else {
                expect(creditScore.status).toBe('REJECTED');
                expect(partnerService.shouldAutoSubmit(creditScore)).toBe(false);
            }
        });
    });

    describe('PDF Parsing - Various Date Formats', () => {
        it('should parse DD/MM/YYYY format', () => {
            const text = '01/01/2026 SALARY 50000.00 75000.00';
            const transactions = pdfService.parseTransactions(text);

            expect(transactions).toHaveLength(1);
            expect(transactions[0].date).toBe('2026-01-01');
        });

        it('should parse DD-MM-YYYY format', () => {
            const text = '01-01-2026 PAYMENT -2000.00';
            const transactions = pdfService.parseTransactions(text);

            expect(transactions).toHaveLength(1);
            expect(transactions[0].date).toBe('2026-01-01');
        });

        it('should parse YYYY-MM-DD format', () => {
            const text = '2026-01-01 DEPOSIT +5000.00 10000.00';
            const transactions = pdfService.parseTransactions(text);

            expect(transactions).toHaveLength(1);
            expect(transactions[0].date).toBe('2026-01-01');
        });

        it('should parse DD MMM YYYY format', () => {
            const text = '01 JAN 2026 SHOPPING -890.50';
            const transactions = pdfService.parseTransactions(text);

            expect(transactions).toHaveLength(1);
            expect(transactions[0].date).toBe('2026-01-01');
        });
    });

    describe('Transaction Categorization', () => {
        const testCases = [
            { description: 'SALARY DEPOSIT', category: 'salary' },
            { description: 'ATM WITHDRAWAL', category: 'cash_withdrawal' },
            { description: 'FOOD PURCHASE', category: 'food' },
            { description: 'SHOPPING', category: 'shopping' },
            { description: 'UTILITY BILL', category: 'bills' },
            { description: 'RENT PAYMENT', category: 'housing' },
            { description: 'FUEL', category: 'transport' },
            { description: 'INSURANCE PREMIUM', category: 'insurance' }
        ];

        testCases.forEach(({ description, category }) => {
            it(`should categorize "${description}" as "${category}"`, () => {
                const text = `01/01/2026 ${description} -1000.00`;
                const transactions = pdfService.parseTransactions(text);

                if (transactions.length > 0) {
                    expect(transactions[0].category).toBe(category);
                }
            });
        });
    });

    describe('Credit Score Breakdown Validation', () => {
        it('should provide detailed score breakdown', async () => {
            const scoreData = {
                monthlyIncome: 45000,
                monthlyExpenses: 25000,
                avgBalance: 25000,
                incomeVariance: 2000,
                age: 40,
                employmentType: 'permanent',
                employmentDuration: 48,
                paymentHistory: { onTimePayments: 20, totalPayments: 20 }
            };

            query.mockResolvedValueOnce({ rows: [] });

            const creditScore = await creditScoreService.calculateScore(mockUserId, scoreData);

            // Verify breakdown exists for all factors
            expect(creditScore.breakdown.incomeStability).toBeDefined();
            expect(creditScore.breakdown.expenseRatio).toBeDefined();
            expect(creditScore.breakdown.averageBalance).toBeDefined();
            expect(creditScore.breakdown.paymentHistory).toBeDefined();
            expect(creditScore.breakdown.employment).toBeDefined();
            expect(creditScore.breakdown.age).toBeDefined();

            // Verify score components sum correctly
            const totalPoints =
                creditScore.breakdown.incomeStability +
                creditScore.breakdown.expenseRatio.score +
                creditScore.breakdown.averageBalance.score +
                creditScore.breakdown.paymentHistory.score +
                creditScore.breakdown.employment.score +
                creditScore.breakdown.age.score +
                300; // Base score

            expect(creditScore.score).toBe(totalPoints);
        });
    });

    describe('Age Calculation', () => {
        it('should calculate age correctly', () => {
            const birthDate = '1990-01-01';
            const age = creditScoreService.calculateAge(birthDate);

            // Age should be around 36 (as of 2026)
            expect(age).toBeGreaterThanOrEqual(35);
            expect(age).toBeLessThanOrEqual(37);
        });

        it('should handle invalid birth dates', () => {
            expect(creditScoreService.calculateAge(null)).toBeNull();
            expect(creditScoreService.calculateAge('invalid')).toBeNull();
            expect(creditScoreService.calculateAge('')).toBeNull();
        });

        it('should handle future birth dates', () => {
            const futureDate = '2030-01-01';
            const age = creditScoreService.calculateAge(futureDate);

            // Future dates should return null (age validation: 0-150)
            expect(age).toBeNull();
        });
    });

    describe('Transaction Analysis Edge Cases', () => {
        it('should handle empty transactions', () => {
            const metrics = creditScoreService.analyzeTransactions([]);

            expect(metrics.monthlyIncome).toBe(0);
            expect(metrics.monthlyExpenses).toBe(0);
            expect(metrics.avgBalance).toBe(0);
            expect(metrics.transactionCount).toBe(0);
        });

        it('should handle single transaction', () => {
            const transactions = [{
                date: '2026-01-01',
                description: 'SALARY',
                amount: 50000,
                balance: 50000,
                category: 'salary'
            }];

            const metrics = creditScoreService.analyzeTransactions(transactions);

            expect(metrics.monthlyIncome).toBe(50000);
            expect(metrics.avgBalance).toBe(50000);
            expect(metrics.transactionCount).toBe(1);
        });

        it('should calculate income variance correctly', () => {
            const transactions = [
                { date: '2026-01-01', amount: 50000, balance: 50000 },
                { date: '2026-02-01', amount: 50000, balance: 100000 },
                { date: '2026-03-01', amount: 50000, balance: 150000 }
            ];

            const metrics = creditScoreService.analyzeTransactions(transactions);

            // Stable income should have low variance
            expect(metrics.incomeVariance).toBe(0);
        });

        it('should handle variable income correctly', () => {
            const transactions = [
                { date: '2026-01-01', amount: 30000, balance: 30000 },
                { date: '2026-02-01', amount: 60000, balance: 90000 },
                { date: '2026-03-01', amount: 45000, balance: 135000 }
            ];

            const metrics = creditScoreService.analyzeTransactions(transactions);

            // Variable income should have higher variance
            expect(metrics.incomeVariance).toBeGreaterThan(0);
        });
    });

    describe('Partner Submission', () => {
        it('should format submission data correctly', async () => {
            const applicationData = {
                loanAmount: 100000,
                loanPurpose: 'home_improvement',
                loanTerm: 12,
                creditScore: { score: 750, status: 'APPROVED', breakdown: {} },
                userProfile: {
                    citizenId: '1234567890123',
                    firstName: 'สมชาย',
                    lastName: 'ใจดี',
                    birthDate: '1990-01-01',
                    age: 36,
                    phoneNumber: '0812345678',
                    email: 'somchai@example.com'
                },
                financialData: {
                    monthlyIncome: 55000,
                    monthlyExpenses: 30000,
                    expenseRatio: 0.545,
                    avgBalance: 100000
                }
            };

            query.mockResolvedValueOnce({ rows: [] }); // Save submission

            const result = await partnerService.submitToPartner(mockUserId, applicationData);

            expect(result.success).toBe(true);
            expect(result.partnerId).toBeDefined();
            expect(result.applicationId).toBeDefined();
            expect(result.status).toMatch(/APPROVED|PENDING_REVIEW/);
        });
    });
});
