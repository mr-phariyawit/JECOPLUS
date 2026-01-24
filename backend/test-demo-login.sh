#!/bin/bash

# ========================================
# DEMO LOGIN TEST SCRIPT
# ========================================

echo "🎭 Testing Demo Login..."
echo ""

# Server URL
API_URL="http://localhost:3000"

# Demo credentials
PHONE="0999999999"
PASSWORD="demo123"

# Test demo login
echo "📝 Request:"
echo "POST ${API_URL}/api/v1/auth/demo/login"
echo "Body: { \"phone\": \"${PHONE}\", \"password\": \"${PASSWORD}\" }"
echo ""

# Make the request
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/demo/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"${PHONE}\",\"password\":\"${PASSWORD}\"}")

echo "📥 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ Demo login successful!"
  echo ""
  echo "🔑 Access Token:"
  echo "$ACCESS_TOKEN"
  echo ""
  echo "📋 You can now use this token for API requests:"
  echo "Authorization: Bearer $ACCESS_TOKEN"
  echo ""

  # Test authenticated request
  echo "🧪 Testing authenticated request (GET /api/v1/auth/sessions)..."
  AUTH_RESPONSE=$(curl -s -X GET "${API_URL}/api/v1/auth/sessions" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

  echo "📥 Sessions Response:"
  echo "$AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$AUTH_RESPONSE"
  echo ""
else
  echo "❌ Demo login failed!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✨ All tests passed! Demo mode is working."
