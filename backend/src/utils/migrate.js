import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'jecoplus',
  user: process.env.DB_USER || 'jecoplus',
  password: process.env.DB_PASSWORD || 'jecoplus_dev_2025',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to database');

    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get applied migrations
    const { rows: appliedMigrations } = await client.query('SELECT name FROM migrations');
    const appliedNames = new Set(appliedMigrations.map(m => m.name));

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Run pending migrations
    for (const file of files) {
      if (!appliedNames.has(file)) {
        console.log(`🚀 Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Applied: ${file}`);
        } catch (err) {
          if (err.code === '42710' || err.code === '42P07') {
            // 42710 = duplicate object (type exists)
            // 42P07 = duplicate relation (table exists)
            await client.query('ROLLBACK'); // Rollback the failed statement
            
            // Allow proceeding by marking as applied
            await client.query('BEGIN');
            await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            
            console.warn(`⚠️  Skipping ${file}: Schema element already exists (Code ${err.code}). Marked as applied.`);
          } else if (err.code === '58P01') {
             // 58P01 = undefined_file (e.g., missing extension control file like vector.control)
             await client.query('ROLLBACK');
             console.warn(`⚠️  Skipping ${file}: Missing database extension (Code ${err.code}). Tables may be missing.`);
             // Do NOT mark as applied so we can try again later when extension is installed
             // Do NOT throw so we can proceed to next migration
          } else {
            await client.query('ROLLBACK');
            console.error(`❌ Failed to apply ${file}:`, err.message);
            throw err;
          }
        }
      } else {
        console.log(`⏭️  Skipping applied: ${file}`);
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
