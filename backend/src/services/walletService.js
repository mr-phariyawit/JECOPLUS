import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database.js';
import { BadRequest, NotFound } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const getWallet = async (userId) => {
  const result = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  
  if (result.rows.length === 0) {
    // Auto-create wallet if not exists (for now, or logic could be in registration)
    return await createWallet(userId);
  }
  
  return result.rows[0];
};

export const createWallet = async (userId) => {
  const walletId = uuidv4();
  const result = await query(
    'INSERT INTO wallets (id, user_id) VALUES ($1, $2) RETURNING *',
    [walletId, userId]
  );
  return result.rows[0];
};

export const topUp = async (userId, amount, method, metadata = {}) => {
  if (amount <= 0) {
    throw BadRequest('Amount must be positive');
  }

  return await transaction(async (client) => {
    // 1. Get Wallet (Lock for update)
    let walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    
    // Create if missing inside transaction? 
    // Usually wallet should exist. If not, create it.
    let wallet;
    if (walletRes.rows.length === 0) {
       const walletId = uuidv4();
       walletRes = await client.query(
         'INSERT INTO wallets (id, user_id) VALUES ($1, $2) RETURNING *', 
         [walletId, userId]
       );
       wallet = walletRes.rows[0];
    } else {
       wallet = walletRes.rows[0];
    }

    // 2. Create Transaction Record
    const txnId = uuidv4();
    const txnRes = await client.query(
      `INSERT INTO transactions 
       (id, wallet_id, type, amount, balance_after, status, reference_id, description, metadata) 
       VALUES ($1, $2, 'TOPUP', $3, $4, 'COMPLETED', $5, $6, $7) 
       RETURNING *`,
      [
        txnId, 
        wallet.id, 
        amount, 
        parseFloat(wallet.balance) + parseFloat(amount), 
        metadata.referenceId || `REF-${Date.now()}`,
        `Topup via ${method}`,
        metadata
      ]
    );

    // 3. Update Wallet Balance
    const updateRes = await client.query(
      'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [amount, wallet.id]
    );

    logger.info(`Topup successful for user ${userId}: +${amount}`);

    return {
      wallet: updateRes.rows[0],
      transaction: txnRes.rows[0]
    };
  });
};

export const withdraw = async (userId, amount, bankInfo = {}) => {
  if (amount <= 0) {
    throw BadRequest('Amount must be positive');
  }

  return await transaction(async (client) => {
     // 1. Get Wallet (Lock for update)
     const walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
     if (walletRes.rows.length === 0) {
        throw NotFound('Wallet not found');
     }
     const wallet = walletRes.rows[0];

     if (parseFloat(wallet.balance) < parseFloat(amount)) {
        throw BadRequest('Insufficient funds');
     }

     const fee = 15.00; // Hardcoded fee for now
     const totalDeduction = parseFloat(amount) + fee;

     if (parseFloat(wallet.balance) < totalDeduction) {
         throw BadRequest('Insufficient funds to cover amount + fee');
     }

     // 2. Create Transaction Record
     const txnId = uuidv4();
     const txnRes = await client.query(
       `INSERT INTO transactions 
        (id, wallet_id, type, amount, fee, balance_after, status, description, metadata) 
        VALUES ($1, $2, 'WITHDRAW', $3, $4, $5, 'PENDING', $6, $7) 
        RETURNING *`,
       [
         txnId, 
         wallet.id, 
         -amount, // Stored as negative or positive? 
         // Schema comment said "amount DECIMAL". 
         // Usually withdrawals are negative flow, but let's store absolute amount for 'amount' column and handle sign via type logic or store signed.
         // In 002 migration I said "Can be negative... usually signed logic in App".
         // Let's store NEGATIVE for withdrawal to make SUM(amount) easy calculation of balance if needed.
         fee,
         parseFloat(wallet.balance) - totalDeduction,
         `Withdraw to ${bankInfo.bankName} ${bankInfo.accountNumber}`,
         bankInfo
       ]
     );

     // 3. Update Wallet Balance
     const updateRes = await client.query(
       'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2 RETURNING *',
       [totalDeduction, wallet.id]
     );
     
     logger.info(`Withdrawal initiated for user ${userId}: -${amount} (Fee: ${fee})`);

     return {
       wallet: updateRes.rows[0],
       transaction: txnRes.rows[0]
     };
  });
};

export const getTransactions = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  // First ensure wallet exists/get ID
  const wallet = await getWallet(userId);
  if (!wallet) return []; // Should satisfy if auto-create is off

  const result = await query(
    `SELECT * FROM transactions 
     WHERE wallet_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [wallet.id, limit, offset]
  );
  
  return result.rows;
};

export default {
  getWallet,
  createWallet,
  topUp,
  withdraw,
  getTransactions
};
