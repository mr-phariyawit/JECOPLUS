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
 * Parse transactions from text using regex patterns
 * Supports basic formats: DD/MM/YYYY Description Amount
 * @param {string} text 
 * @returns {Array}
 */
export const parseTransactions = (text) => {
    const transactions = [];
    
    // Regex for: Date (DD/MM/YYYY) + Spaces + Description + Spaces + Amount (with , and +/-)
    // Example: 01/01/2026 Salary +50,000.00
    // Simplified regex for demonstration
    const pattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([+-]?[\d,]+\.\d{2})/g;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
        const [_, date, description, amountStr] = match;
        
        // Clean amount string (remove commas)
        const cleanAmountStr = amountStr.replace(/,/g, '');
        const amount = parseFloat(cleanAmountStr);
        
        // Determine type based on sign or context (if sign missing, assume positive? or logic needed)
        // For now, if negative sign present -> Withdrawal, else Deposit
        // In this regex, the sign is captured if present. 
        // If "Payment -500.00", amount is -500. 
        // If "Salary 50000.00", amount is 50000.
        
        const type = amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL';
        
        transactions.push({
            date,
            description: description.trim(),
            amount: Math.abs(amount), // Store absolute amount? Or signed? Let's use absolute and Type
            type
        });
    }

    logger.info(`Extracted ${transactions.length} transactions from text`);
    return transactions;
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
