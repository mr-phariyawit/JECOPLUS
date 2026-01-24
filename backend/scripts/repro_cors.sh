#!/bin/bash

# Configuration
API_URL="http://localhost:3002/api/v1/chat/messages"
ORIGIN="http://localhost:5173"

echo "==================================================="
echo "Testing CORS Configuration for JECOPLUS"
echo "Target: $API_URL"
echo "Origin: $ORIGIN"
echo "==================================================="
echo ""

# 1. Test Preflight (OPTIONS)
echo "[1] Testing Preflight Request (OPTIONS)..."
echo "Sending OPTIONS request with Origin and Access-Control-Request-Method..."
curl -v -X OPTIONS "$API_URL" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  2>&1 | grep -E "< (HTTP|Access-Control|Vary)"

echo ""
echo "---------------------------------------------------"
echo ""

# 2. Test Actual Request (POST)
echo "[2] Testing Actual Request (POST)..."
echo "Sending POST request with Origin..."
curl -v -X POST "$API_URL" \
  -H "Origin: $ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' \
  2>&1 | grep -E "< (HTTP|Access-Control|Vary)"

echo ""
echo "==================================================="
echo "Analysis Complete."
