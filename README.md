# JECO+ Platform

A Thai financial services super-app combining digital wallet, AI-powered loans, e-commerce marketplace, and intelligent financial advisory.

## 🚀 Features

### User Features

- **Digital Wallet** - Top-up, withdrawal, PromptPay QR payments, transaction history
- **AI-Powered Loans** - Credit scoring with 6-factor algorithm, instant approval
- **E-Commerce Marketplace** - Product catalog, cart, checkout with multiple payment options
- **KYC Verification** - Thai ID card OCR, selfie verification, liveness detection, NDID integration
- **AI Financial Advisor** - Chatbot for personalized financial guidance and loan recommendations
- **Money Coach** - AI-powered financial advice and spending insights

### Admin Features

- **Admin Dashboard** - Real-time statistics and system overview
- **User Management** - View, search, and manage user accounts
- **KYC Review Queue** - Approve/reject KYC submissions with document verification
- **Loan Management** - Review and process loan applications
- **Activity Logs** - Audit trail of all admin actions

## Tech Stack

### Frontend

- Vue 3 (Composition API)
- Vite 7
- Pinia (State Management)
- Vue Router 4
- Firebase Authentication
- Axios

### Backend

- Node.js / Express 4
- PostgreSQL
- Firebase Admin SDK
- Google Cloud Vision (OCR)
- JWT Authentication
- Winston (Logging)

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL
- Firebase project configured
- Google Cloud credentials (for Vision API)

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 🔄 Mock vs Real API Mode

The frontend supports two modes:

**1. Real API Mode** (Default - Production)

```bash
# Frontend uses real backend API
VITE_MOCKUP_MODE=false
VITE_API_URL=http://localhost:3002/api/v1
```

**2. Mock Data Mode** (Development)

```bash
# Frontend uses mock data without backend
VITE_MOCKUP_MODE=true
```

**Quick Switch:**

```bash
# Use Real Backend
echo "VITE_MOCKUP_MODE=false" > .env.local
npm run dev

# Use Mock Data
echo "VITE_MOCKUP_MODE=true" > .env.local
npm run dev
```

**Test Connection:**

```bash
./test-real-api.sh
```

📖 **Full Guide:** [QUICK_START_REAL_API.md](QUICK_START_REAL_API.md) | [Switching Modes Guide](docs/guides/SWITCHING_MODES.md)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

The API will be available at `http://localhost:3002`

### Create Admin User

To create or reset admin credentials:

```bash
cd backend
node scripts/create-admin.js
```

Default admin credentials:

- **Email**: `admin@jecoplus.com`
- **Password**: `admin123`
- **Access**: Admin Portal at `http://localhost:5173/admin/login`

## 📋 Scripts

### Frontend Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests |

### Backend Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start with hot reload |
| `npm start` | Start production server |
| `npm run migrate:up` | Run database migrations |
| `npm run migrate:down` | Rollback migrations |
| `npm run seed` | Seed database |
| `npm test` | Run tests |

## Project Structure

```text
JECOPLUS/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration & DB
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── migrations/         # SQL migrations
│   └── tests/              # Jest tests
│
├── src/                    # Frontend
│   ├── components/         # Reusable components
│   ├── composables/        # Vue composables
│   ├── router/             # Vue Router
│   ├── services/           # API clients
│   ├── stores/             # Pinia stores
│   └── views/              # Page components
│
├── specs/                  # Documentation
└── tests/                  # Frontend tests
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/send-otp` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke tokens

### User

- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile

### KYC

- `POST /api/v1/kyc/start` - Start KYC session
- `POST /api/v1/kyc/upload-id` - Upload ID card (front/back)
- `POST /api/v1/kyc/ocr-confirm` - Confirm OCR extracted data
- `POST /api/v1/kyc/verify-face` - Upload selfie for face matching
- `POST /api/v1/kyc/liveness` - Perform liveness detection
- `POST /api/v1/kyc/ndid` - Verify with NDID
- `GET /api/v1/kyc/status` - Get KYC status

### Wallet

- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/topup` - Top up wallet
- `POST /api/v1/wallet/withdraw` - Withdraw funds
- `GET /api/v1/wallet/transactions` - Get transaction history

### Credit Scoring & Loans

- `POST /api/v1/credit/score` - Calculate credit score
- `POST /api/v1/loans` - Submit loan application
- `GET /api/v1/loans` - Get user's loan applications
- `GET /api/v1/loans/:id` - Get loan details
- `POST /api/v1/loans/:id/pay` - Make loan payment

### Marketplace

- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/cart` - Add to cart
- `GET /api/v1/cart` - Get cart items
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user's orders

### Admin Portal

- `POST /api/v1/admin/auth/login` - Admin login with email/password
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - List users with filters
- `GET /api/v1/admin/users/:userId` - Get user details
- `PATCH /api/v1/admin/users/:userId/status` - Update user status
- `GET /api/v1/admin/kyc/pending` - Get pending KYC queue
- `GET /api/v1/admin/kyc/:sessionId` - Get KYC session details
- `POST /api/v1/admin/kyc/:sessionId/approve` - Approve KYC
- `POST /api/v1/admin/kyc/:sessionId/reject` - Reject KYC
- `GET /api/v1/admin/loans` - List loan applications
- `GET /api/v1/admin/loans/:loanId` - Get loan details
- `POST /api/v1/admin/loans/:loanId/approve` - Approve loan
- `POST /api/v1/admin/loans/:loanId/reject` - Reject loan
- `GET /api/v1/admin/activity-logs` - Get admin activity logs

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3002/api/v1
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Backend (.env)

```bash
NODE_ENV=development
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jecoplus_dev
DB_USER=postgres
DB_PASSWORD=your_db_password
DATABASE_URL=postgresql://postgres:password@localhost:5432/jecoplus_dev

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Cloud
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment

The project uses Firebase Hosting for the frontend and can be deployed with:

```bash
./deploy-staging.sh
```

CI/CD is configured via GitHub Actions in `.github/workflows/`.

## 🧪 Development Credentials

### Test User Accounts

```text
Phone: 0812345678
OTP: Check backend console logs in development mode
```

### Admin Portal

```text
URL: http://localhost:5173/admin/login
Email: admin@jecoplus.com
Password: admin123
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 3002 is in use
lsof -ti:3002

# Kill process if needed
lsof -ti:3002 | xargs kill -9

# Restart backend
cd backend && npm run dev
```

### Database connection errors

```bash
# Verify PostgreSQL is running
psql -U postgres -d jecoplus_dev

# Run migrations
cd backend && npm run migrate:up
```

### Admin login fails

```bash
# Reset admin user
cd backend && node scripts/create-admin.js
```

### Frontend CORS errors

- Verify `CORS_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Check backend is running on port 3002
- Clear browser cache and cookies

## 📚 Documentation

- [Business Requirements](specs/01_BRD_Business_Requirements.md)
- [User Journeys](specs/02_User_Journeys.md)
- [Technical Specifications](specs/03_Technical_Specifications.md)
- [UI/UX Wireframes](specs/04_UXUI_Wireframes.md)
- [Implementation Plan](specs/06_Implementation_Plan.md)
- [Security Hardening](specs/SECURITY_HARDENING.md)
- [GAP Analysis](specs/features/GAP_ANALYSIS.md)

### Detailed Documentation
- [AI Documentation](docs/ai/)
- [Guides](docs/guides/)
- [Reports](docs/reports/)
- [Scenarios](docs/scenarios/README.md)
- [Technical Docs](docs/technical/)

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Submit a pull request to `develop`
4. Ensure tests pass and code follows project conventions

## 📄 License

Private - All rights reserved
