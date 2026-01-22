import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '../../.env') });

// Load JWT keys if RS256 is used
const loadKey = (path) => {
  try {
    const keyPath = join(__dirname, '../..', path);
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    }
  } catch (error) {
    console.warn(`Could not load key from ${path}:`, error.message);
  }
  return null;
};

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'jecoplus',
    user: process.env.DB_USER || 'jecoplus',
    password: process.env.DB_PASSWORD || 'jecoplus_dev_2025',
    ssl: process.env.DB_SSL === 'true',
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    privateKey: loadKey(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem'),
    publicKey: loadKey(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem'),
    algorithm: 'RS256', // Use RS256 for production
  },

  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },

  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'jecoplus-kyc-documents',
  },

  // NDID
  ndid: {
    nodeId: process.env.NDID_NODE_ID,
    apiUrl: process.env.NDID_API_URL,
    callbackUrl: process.env.NDID_CALLBACK_URL,
  },

  // OTP
  otp: {
    expirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS, 10) || 300,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
    cooldownSeconds: parseInt(process.env.OTP_COOLDOWN_SECONDS, 10) || 60,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'dev',
  },

  // AI Services
  ai: {
    // Default provider: 'vertex-ai', 'claude', or 'gemini'
    // Vertex AI is preferred if configured
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'vertex-ai',

    // Vertex AI (Google Cloud) Configuration
    vertexAI: {
      projectId: process.env.GCP_PROJECT_ID,
      location: process.env.GCP_LOCATION || 'us-central1',
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
      embeddingModel: process.env.VERTEX_EMBEDDING_MODEL || 'text-embedding-004',
    },

    // Claude (Anthropic) Configuration
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS, 10) || 4096,
    },

    // Gemini (Google) Configuration
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS, 10) || 4096,
    },
  },

  // Demo Mode (WARNING: ONLY for presentations - NEVER use in production!)
  demo: {
    enabled: process.env.DEMO_MODE === 'true',
    phone: process.env.DEMO_PHONE || '0999999999',
    password: process.env.DEMO_PASSWORD || 'demo123',
  },
};

// Validate required config in production
if (config.env === 'production') {
  const required = [
    'jwt.accessSecret',
    'jwt.refreshSecret',
    'firebase.projectId',
    'firebase.privateKey',
    'firebase.clientEmail',
  ];

  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }
  }

  // CRITICAL: Demo mode must NEVER be enabled in production
  if (config.demo.enabled) {
    throw new Error(
      '❌ FATAL: Demo mode is ENABLED in production environment! ' +
      'This is a critical security risk. Set DEMO_MODE=false or remove the variable.'
    );
  }
}

// Validate staging environment
if (config.env === 'staging') {
  // Demo mode should be disabled in staging too
  if (config.demo.enabled) {
    console.warn(
      '⚠️  WARNING: Demo mode is enabled in staging environment. ' +
      'This should only be used for testing purposes.'
    );
  }
}

export default config;
