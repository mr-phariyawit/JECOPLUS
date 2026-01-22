import pdfParse from 'pdf-parse';
import logger from '../utils/logger.js';

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export const extractText = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        logger.error('PDF Parse Error:', error);
        throw new Error('Failed to parse PDF: ' + error.message);
    }
};

/**
 * Parse transactions from bank statement text
 * Supports multiple date formats and transaction patterns
 *
 * @param {string} text - Raw text from PDF
 * @returns {Array} Array of transaction objects
 */
export const parseTransactions = (text) => {
    if (!text || typeof text !== 'string') {
        logger.warn('Invalid text provided to parseTransactions');
        return [];
    }

    const transactions = [];
    const lines = text.split('\n');

    // Common bank statement patterns
    const patterns = [
        // Pattern 1: DD/MM/YYYY Description Amount Balance
        // Example: 01/01/2026 SALARY DEPOSIT 50,000.00 75,000.00
        /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([-+]?[\d,]+\.?\d*)\s+([\d,]+\.?\d*)/,

        // Pattern 2: DD-MM-YYYY Description +/-Amount
        // Example: 01-01-2026 ATM WITHDRAWAL -2,000.00
        /(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([+-]?[\d,]+\.?\d*)/,

        // Pattern 3: YYYY-MM-DD (ISO format)
        // Example: 2026-01-01 TRANSFER IN +5,000.00 80,000.00
        /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([+-]?[\d,]+\.?\d*)\s*([\d,]+\.?\d*)?/,

        // Pattern 4: DD MMM YYYY (e.g., 01 JAN 2026)
        // Example: 01 JAN 2026 ONLINE PURCHASE -890.50
        /(\d{2}\s+[A-Z]{3}\s+\d{4})\s+(.+?)\s+([+-]?[\d,]+\.?\d*)/
    ];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.length < 10) continue;

        for (const pattern of patterns) {
            const match = trimmedLine.match(pattern);
            if (match) {
                try {
                    const [_, dateStr, description, amountStr, balanceStr] = match;

                    // Parse amount
                    const cleanAmount = amountStr.replace(/,/g, '').trim();
                    let amount = parseFloat(cleanAmount);

                    if (isNaN(amount)) continue;

                    // Parse balance if available
                    let balance = null;
                    if (balanceStr) {
                        const cleanBalance = balanceStr.replace(/,/g, '').trim();
                        balance = parseFloat(cleanBalance);
                        if (isNaN(balance)) balance = null;
                    }

                    // Normalize date format to YYYY-MM-DD
                    const normalizedDate = normalizeDateFormat(dateStr);

                    // Categorize transaction
                    const category = categorizeTransaction(description, amount);

                    transactions.push({
                        date: normalizedDate,
                        description: description.trim(),
                        amount, // Keep signed amount (+ve = credit, -ve = debit)
                        balance,
                        category,
                        type: amount >= 0 ? 'CREDIT' : 'DEBIT'
                    });

                    break; // Move to next line after successful match
                } catch (error) {
                    logger.warn(`Failed to parse transaction line: ${trimmedLine}`, error);
                }
            }
        }
    }

    logger.info(`Extracted ${transactions.length} transactions from ${lines.length} lines`);
    return transactions;
};

/**
 * Normalize various date formats to YYYY-MM-DD
 *
 * @param {string} dateStr - Date string in various formats
 * @returns {string} ISO date format
 */
const normalizeDateFormat = (dateStr) => {
    // DD/MM/YYYY
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }

    // DD-MM-YYYY
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }

    // YYYY-MM-DD (already ISO format)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
    }

    // DD MMM YYYY (e.g., 01 JAN 2026)
    if (dateStr.match(/^\d{2}\s+[A-Z]{3}\s+\d{4}$/)) {
        const months = {
            JAN: '01', FEB: '02', MAR: '03', APR: '04',
            MAY: '05', JUN: '06', JUL: '07', AUG: '08',
            SEP: '09', OCT: '10', NOV: '11', DEC: '12'
        };
        const parts = dateStr.split(/\s+/);
        const day = parts[0];
        const month = months[parts[1]];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }

    // Fallback: return as-is
    return dateStr;
};

/**
 * Categorize transaction based on description
 *
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @returns {string} Category name
 */
const categorizeTransaction = (description, amount) => {
    const desc = description.toLowerCase();

    // Income categories
    if (amount > 0) {
        if (desc.includes('salary') || desc.includes('payroll')) return 'salary';
        if (desc.includes('transfer in') || desc.includes('deposit')) return 'deposit';
        if (desc.includes('refund')) return 'refund';
        if (desc.includes('interest')) return 'interest';
        return 'other_income';
    }

    // Expense categories
    if (desc.includes('atm') || desc.includes('withdrawal')) return 'cash_withdrawal';
    if (desc.includes('transfer out') || desc.includes('payment')) return 'payment';
    if (desc.includes('bill') || desc.includes('utility')) return 'bills';
    if (desc.includes('food') || desc.includes('restaurant')) return 'food';
    if (desc.includes('shopping') || desc.includes('purchase')) return 'shopping';
    if (desc.includes('transport') || desc.includes('fuel')) return 'transport';
    if (desc.includes('rent') || desc.includes('mortgage')) return 'housing';
    if (desc.includes('insurance')) return 'insurance';
    if (desc.includes('loan') || desc.includes('installment')) return 'loan_payment';

    return 'other_expense';
};

// Placeholder for Google Vision API integration
export const extractTextWithVision = async (buffer) => {
    // TODO: Implement Vision API fallback for image-based PDFs
    logger.warn('Vision API not implemented yet, falling back to empty text');
    return '';
};

export default {
    extractText,
    parseTransactions,
    extractTextWithVision
};
