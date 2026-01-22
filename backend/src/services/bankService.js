import { query } from '../config/database.js';
import { BadRequest } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const addBankAccount = async (userId, accountDetails) => {
  const { bankCode, bankName, accountNumber, accountName } = accountDetails;

  // Basic validation
  // Account number must be digits only, length 10-12 usually
  if (!/^\d{10,12}$/.test(accountNumber)) {
    throw BadRequest('Invalid account number');
  }

  // Check supported banks (whitelist) - simplified for now
  const supportedBanks = ['SCB', 'KBANK', 'BBL', 'KTB', 'TTB', 'BAY'];
  if (!supportedBanks.includes(bankCode)) {
      // Allow it for mock purposes if it's not in strict mode, or throw? 
      // Spec said "throw error if bank code is not supported"
      throw BadRequest('Unsupported bank code');
  }

  try {
    const result = await query(
      `INSERT INTO bank_accounts (user_id, bank_code, bank_name, account_number, account_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, bank_code, account_number) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [userId, bankCode, bankName, accountNumber, accountName]
    );

    logger.info(`Bank account added for user ${userId}: ${bankCode} ***${accountNumber.slice(-4)}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error adding bank account:', error);
    throw error;
  }
};

export const getBankAccounts = async (userId) => {
  const result = await query(
    'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const deleteBankAccount = async (userId, accountId) => {
  const result = await query(
    'UPDATE bank_accounts SET status = \'DELETED\', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
    [accountId, userId]
  );
  
  if (result.rowCount === 0) {
      // Or throw NotFound?
      return null; 
  }
  return result.rows[0];
};

export default {
  addBankAccount,
  getBankAccounts,
  deleteBankAccount
};
