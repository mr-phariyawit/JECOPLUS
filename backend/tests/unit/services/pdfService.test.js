import { jest } from '@jest/globals';

// Mock pdf-parse module
jest.unstable_mockModule('pdf-parse', () => ({
    default: jest.fn()
}));

const { default: pdfParse } = await import('pdf-parse');
const { default: pdfService } = await import('../../../src/services/pdfService.js');

describe('PdfService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('extractText', () => {
        it('should return text content from valid buffer', async () => {
            const mockBuffer = Buffer.from('fake-pdf-content');
            const mockText = 'Date Description Amount\n01/01/2026 Salary 50000.00';
            
            pdfParse.mockResolvedValue({ text: mockText, numpages: 1, info: {} });
            
            const result = await pdfService.extractText(mockBuffer);
            
            expect(result).toBe(mockText);
            expect(pdfParse).toHaveBeenCalledWith(mockBuffer);
        });

        it('should throw error if parsing fails', async () => {
            const mockBuffer = Buffer.from('invalid-pdf');
            pdfParse.mockRejectedValue(new Error('Parse error'));

            await expect(pdfService.extractText(mockBuffer))
                .rejects
                .toThrow('Failed to parse PDF');
        });
    });

    describe('parseTransactions', () => {
        it('should extract standard transactions (Date Desc Amount Balance)', () => {
            // Pattern 1 expects: DD/MM/YYYY Description Amount Balance
            const text = `
                Account Statement
                01/01/2026 SALARY DEPOSIT 50,000.00 75,000.00
                05/01/2026 Payment -500.00 74,500.00
                10/01/2026 Transfer 1,000.00 75,500.00
            `;
            
            const transactions = pdfService.parseTransactions(text);
            
            expect(transactions).toHaveLength(3);
            expect(transactions[0]).toMatchObject({
                date: expect.any(String), // Date is normalized
                description: 'SALARY DEPOSIT',
                amount: 50000.00,
                type: 'CREDIT'
            });
            expect(transactions[1]).toMatchObject({
                date: expect.any(String),
                description: 'Payment',
                amount: -500.00,
                type: 'DEBIT'
            });
        });

        it('should return empty array if no matches', () => {
            const text = 'No transactions here.';
            const result = pdfService.parseTransactions(text);
            expect(result).toEqual([]);
        });
    });
});
