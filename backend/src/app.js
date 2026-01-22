import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

import config from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { getCSRFToken, setCSRFToken } from './middleware/csrf.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import kycRoutes from './routes/kyc.js';
import walletRoutes from './routes/wallet.js';
import bankRoutes from './routes/bank.js';
import creditScoreRoutes from './routes/creditScore.js';
import loanRoutes from './routes/loan.js';
import adminRoutes from './routes/admin.js';
import healthRoutes from './routes/health.js';
import chatRoutes from './routes/chat.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import moneyCoachRoutes from './routes/moneyCoach.js';
import loanAssistantRoutes from './routes/loanAssistant.js';

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// CORS - Must be first to handle preflight requests
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (config.cors.origins.includes(origin) || config.env === 'development') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Device-ID', 'X-CSRF-Token'],
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"], // Removed unsafe-inline
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'https://storage.googleapis.com', // Specific domain only
      ],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true, // Enabled
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// Cookie parsing (must be before CSRF middleware)
app.use(cookieParser());

// Body parsing (1MB limit for security, file uploads use multer separately)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(morgan(config.logging.format, {
  stream: logger.stream,
  skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
}));

// Global rate limiting
app.use(globalRateLimiter);

// CSRF Token endpoint (should be called after login to get token)
app.get('/api/v1/csrf-token', getCSRFToken);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/money-coach', moneyCoachRoutes);
app.use('/api/v1/loan-assistant', loanAssistantRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'JECOPLUS API',
    version: '1.0.0',
    docs: '/api/v1/docs',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
