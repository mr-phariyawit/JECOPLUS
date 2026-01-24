#!/bin/bash
# Test Script: ตรวจสอบการเชื่อมต่อ Frontend กับ Real Backend

echo "========================================="
echo "🧪 Testing Real API Connection"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Backend Health
echo "1. Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3002/api/v1/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "   Please start backend: cd backend && npm run dev"
    exit 1
fi
echo ""

# Test 2: Check Frontend Config
echo "2. Checking Frontend Configuration..."
if grep -q "VITE_MOCKUP_MODE=false" .env 2>/dev/null || grep -q "VITE_MOCKUP_MODE=false" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend configured for Real API mode${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might be in Mock mode${NC}"
    echo "   Set VITE_MOCKUP_MODE=false in .env or .env.local"
fi

API_URL=$(grep "VITE_API_URL" .env 2>/dev/null | head -n 1 | cut -d '=' -f2)
if [ ! -z "$API_URL" ]; then
    echo "   API URL: $API_URL"
else
    echo -e "${YELLOW}⚠️  VITE_API_URL not found${NC}"
fi
echo ""

# Test 3: Check CORS Configuration
echo "3. Checking Backend CORS Configuration..."
if [ -f "backend/.env" ]; then
    CORS_ORIGINS=$(grep "CORS_ORIGINS" backend/.env | cut -d '=' -f2)
    if [[ $CORS_ORIGINS == *"localhost:5173"* ]]; then
        echo -e "${GREEN}✅ CORS configured for localhost:5173${NC}"
        echo "   CORS_ORIGINS: $CORS_ORIGINS"
    else
        echo -e "${YELLOW}⚠️  CORS might need configuration${NC}"
        echo "   Current: $CORS_ORIGINS"
        echo "   Should include: http://localhost:5173"
    fi
else
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
fi
echo ""

# Test 4: Test CSRF Token Endpoint
echo "4. Testing CSRF Token Endpoint..."
CSRF_RESPONSE=$(curl -s http://localhost:3002/api/v1/csrf-token)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CSRF endpoint accessible${NC}"
    echo "   Response: $CSRF_RESPONSE"
else
    echo -e "${RED}❌ CSRF endpoint failed${NC}"
fi
echo ""

# Test 5: Check if Demo Mode is enabled
echo "5. Checking Backend Demo Mode..."
if [ -f "backend/.env" ]; then
    DEMO_MODE=$(grep "DEMO_MODE" backend/.env | cut -d '=' -f2)
    if [ "$DEMO_MODE" = "true" ]; then
        echo -e "${GREEN}✅ Demo Mode enabled${NC}"
        DEMO_PHONE=$(grep "DEMO_PHONE" backend/.env | cut -d '=' -f2)
        DEMO_PASSWORD=$(grep "DEMO_PASSWORD" backend/.env | cut -d '=' -f2)
        echo "   Demo Login:"
        echo "   Phone: $DEMO_PHONE"
        echo "   Password: $DEMO_PASSWORD"
    else
        echo -e "${YELLOW}ℹ️  Demo Mode disabled (will need real OTP)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
fi
echo ""

# Summary
echo "========================================="
echo "📊 Summary"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Start frontend: npm run dev"
echo "2. Check console for: '🌐 Running in API MODE'"
echo "3. Open Network tab to see API requests"
echo "4. Test login with demo credentials (if enabled)"
echo ""
echo "Documentation:"
echo "- Quick Start: QUICK_START_REAL_API.md"
echo "- Full Guide: docs/guides/SWITCHING_MODES.md"
echo ""
