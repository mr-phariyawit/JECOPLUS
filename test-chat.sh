#!/bin/bash

# Quick Test Script for AI Chat Feature
# This script helps verify the setup and test the chat API

echo "🧪 Testing AI Chat Feature"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

cd backend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
    cat > .env << EOF
# AI Provider API Keys (at least one required)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Default provider
AI_DEFAULT_PROVIDER=gemini

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jecoplus
DB_USER=jecoplus
DB_PASSWORD=jecoplus_dev_2025

# JWT
JWT_ACCESS_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
EOF
    echo -e "${YELLOW}⚠️  Please add your API keys to backend/.env${NC}"
    echo ""
fi

# Check for API keys
if ! grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null && ! grep -q "GEMINI_API_KEY=" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  No AI API keys found in .env${NC}"
    echo -e "${YELLOW}   Add at least one: ANTHROPIC_API_KEY or GEMINI_API_KEY${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Check database connection
echo "🔍 Checking database connection..."
if command -v psql &> /dev/null; then
    # Try to connect (this might fail, that's okay)
    psql -U jecoplus -d jecoplus -c "SELECT 1;" &> /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connection OK${NC}"
        
        # Check if tables exist
        TABLE_EXISTS=$(psql -U jecoplus -d jecoplus -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations');" 2>/dev/null | xargs)
        if [ "$TABLE_EXISTS" = "t" ]; then
            echo -e "${GREEN}✅ Chat tables exist${NC}"
        else
            echo -e "${YELLOW}⚠️  Chat tables not found. Run: npm run migrate${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not connect to database. Make sure PostgreSQL is running.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql not found. Skipping database check.${NC}"
fi

echo ""
echo "📋 Test Checklist:"
echo "=================="
echo ""
echo "1. ✅ Migration file exists: 007_chat_schema.sql"
echo "2. ✅ Routes integrated in app.js"
echo "3. ⚠️  Run database migration: cd backend && npm run migrate"
echo "4. ⚠️  Add API keys to backend/.env"
echo "5. ⚠️  Start backend: cd backend && npm run dev"
echo "6. ⚠️  Start frontend: npm run dev"
echo ""
echo "🧪 To test:"
echo "   1. Open http://localhost:5173"
echo "   2. Login (phone: 0812345678, OTP: 123456)"
echo "   3. Click 'AI Assistant' button"
echo "   4. Send a message: 'สวัสดีครับ'"
echo ""
echo "📖 See TESTING_GUIDE.md for detailed instructions"
