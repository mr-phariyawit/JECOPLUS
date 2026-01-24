#!/usr/bin/env node
import bcrypt from 'bcrypt';
import { query } from '../src/config/database.js';
import logger from '../src/utils/logger.js';

/**
 * Create admin user with hashed password
 */
async function createAdmin() {
  try {
    const adminEmail = 'admin@jecoplus.com';
    const adminPassword = 'admin123';
    const adminPhone = '0899999999';

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    logger.info(`Generated password hash: ${passwordHash}`);

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id, email FROM users WHERE email = $1 OR phone = $2',
      [adminEmail, adminPhone]
    );

    if (existingAdmin.rows.length > 0) {
      logger.info('Admin user already exists. Updating password...');

      // Update existing admin's password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, adminEmail]
      );

      logger.info(`✅ Admin password updated successfully!`);
      logger.info(`Email: ${adminEmail}`);
      logger.info(`Password: ${adminPassword}`);
    } else {
      logger.info('Creating new admin user...');

      // Create new admin user
      const result = await query(
        `INSERT INTO users (
          id,
          phone,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          kyc_status,
          status,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          'Admin',
          'JECO+',
          'ADMIN',
          'VERIFIED',
          'ACTIVE',
          NOW(),
          NOW()
        )
        RETURNING id, email, role`,
        [adminPhone, adminEmail, passwordHash]
      );

      logger.info(`✅ Admin user created successfully!`);
      logger.info(`ID: ${result.rows[0].id}`);
      logger.info(`Email: ${adminEmail}`);
      logger.info(`Password: ${adminPassword}`);
      logger.info(`Role: ${result.rows[0].role}`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdmin();
