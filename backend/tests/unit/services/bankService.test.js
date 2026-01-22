import { jest } from '@jest/globals';

// Define mocks first
jest.unstable_mockModule('../../../src/config/database.js', () => ({
    query: jest.fn(),
    transaction: jest.fn(),
    __esModule: true
}));

const { query } = await import('../../../src/config/database.js');
const { default: bankService } = await import('../../../src/services/bankService.js');

describe('BankService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addBankAccount', () => {
        it('should add a valid bank account', async () => {
            const userId = 'user-1';
            const account = {
                bankCode: 'SCB',
                bankName: 'Siam Commercial Bank',
                accountNumber: '1234567890',
                accountName: 'John Doe'
            };
            const mockResult = { id: 'bank-1', ...account, user_id: userId };

            query.mockResolvedValue({ rows: [mockResult] });

            const result = await bankService.addBankAccount(userId, account);

            expect(result).toEqual(mockResult);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO bank_accounts'),
                [userId, account.bankCode, account.bankName, account.accountNumber, account.accountName]
            );
        });

        it('should throw error for invalid account number', async () => {
            const userId = 'user-1';
            const account = {
                bankCode: 'SCB',
                bankName: 'SCB',
                accountNumber: 'invalid-number', // Not digits
                accountName: 'John Doe'
            };

            await expect(bankService.addBankAccount(userId, account))
                .rejects
                .toThrow('Invalid account number');
        });
    });

    describe('getBankAccounts', () => {
        it('should return list of matching accounts', async () => {
            const userId = 'user-1';
            const mockAccounts = [{ id: 'bank-1', bank_code: 'SCB' }];

            query.mockResolvedValue({ rows: mockAccounts });

            const result = await bankService.getBankAccounts(userId);

            expect(result).toEqual(mockAccounts);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM bank_accounts'),
                [userId]
            );
        });
    });
});
