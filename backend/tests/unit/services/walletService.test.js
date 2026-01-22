import { jest } from '@jest/globals';

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../../../src/config/database.js', () => ({
    query: jest.fn(),
    transaction: jest.fn(),
    __esModule: true
}));

// Dynamic imports are required after unstable_mockModule
const { query, transaction } = await import('../../../src/config/database.js');
const { default: walletService } = await import('../../../src/services/walletService.js');

describe('WalletService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getWallet', () => {
        it('should return existing wallet', async () => {
            const userId = 'user-1';
            const mockWallet = { id: 'wallet-1', user_id: userId, balance: 1000 };
            
            query.mockResolvedValue({ rows: [mockWallet] });
            
            const result = await walletService.getWallet(userId);
            
            expect(result).toEqual(mockWallet);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM wallets'), 
                [userId]
            );
        });

        it('should create new wallet if not exists', async () => {
            const userId = 'user-2';
            const newWallet = { id: 'wallet-2', user_id: userId, balance: 0 };
            
            query
              .mockResolvedValueOnce({ rows: [] }) // First query (select) returns empty
              .mockResolvedValueOnce({ rows: [newWallet] }); // Second query (insert) returns new wallet
            
            const result = await walletService.getWallet(userId);
            
            expect(result).toEqual(newWallet);
            expect(query).toHaveBeenCalledTimes(2);
        });
    });

    describe('topUp', () => {
        it('should perform topup transaction', async () => {
            const userId = 'user-1';
            const amount = 500;
            const mockWallet = { id: 'wallet-1', user_id: userId, balance: 1000 };
            const updatedWallet = { ...mockWallet, balance: 1500 };
            const mockTxn = { id: 'txn-1', amount: 500, type: 'TOPUP' };

            // Mock transaction helper to execute callback immediately with a mock client
            const mockClient = {
                query: jest.fn()
            };
            
            transaction.mockImplementation(async (callback) => {
                return await callback(mockClient);
            });

            mockClient.query
                .mockResolvedValueOnce({ rows: [mockWallet] }) // 1. Get Wallet
                .mockResolvedValueOnce({ rows: [mockTxn] }) // 2. Insert Txn
                .mockResolvedValueOnce({ rows: [updatedWallet] }); // 3. Update Wallet

            const result = await walletService.topUp(userId, amount, 'PROMPTPAY');

            expect(result.wallet.balance).toBe(1500);
            expect(transaction).toHaveBeenCalled();
            expect(mockClient.query).toHaveBeenCalledTimes(3);
        });
    });
});
