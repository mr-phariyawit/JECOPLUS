/**
 * Simple Chat API Test Script
 * Run with: node test-chat-api.js
 * Requires: Node.js 18+ (for native fetch)
 */

// Use native fetch (Node 18+)
// For Node < 18, install: npm install node-fetch
const fetch = globalThis.fetch;
if (!fetch) {
  console.error('❌ Node.js 18+ required for native fetch, or install node-fetch');
  process.exit(1);
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
let authToken = '';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAuth() {
  log('\n🔐 Step 1: Testing Authentication...', 'blue');
  
  try {
    // Request OTP
    const otpResponse = await fetch(`${API_URL}/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0812345678',
        deviceId: 'test-device',
      }),
    });
    const otpData = await otpResponse.json();

    if (otpData.success) {
      log('✅ OTP request successful', 'green');
      log(`   Session ID: ${otpData.data.sessionId}`, 'yellow');
      
      // In development, OTP is 123456
      const verifyResponse = await fetch(`${API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: otpData.data.sessionId,
          otp: '123456',
          deviceId: 'test-device',
        }),
      });
      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        authToken = verifyData.data.accessToken;
        log('✅ Authentication successful', 'green');
        log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
        return true;
      }
    }
  } catch (error) {
    log(`❌ Auth failed: ${error.message}`, 'red');
    return false;
  }
  
  return false;
}

async function testSendMessage() {
  log('\n💬 Step 2: Testing Send Message...', 'blue');
  
  if (!authToken) {
    log('❌ No auth token. Run testAuth() first.', 'red');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message: 'สวัสดีครับ',
        provider: 'gemini',
      }),
    });
    const data = await response.json();

    if (data.success) {
      log('✅ Message sent successfully', 'green');
      log(`   Conversation ID: ${data.data.conversationId}`, 'yellow');
      log(`   Provider: ${data.data.provider}`, 'yellow');
      log(`   Response: ${data.data.text.substring(0, 100)}...`, 'yellow');
      return data.data.conversationId;
    } else {
      log(`❌ Send message failed: ${data.error?.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Send message failed: ${error.message}`, 'red');
    return null;
  }
}

async function testGetConversations() {
  log('\n📋 Step 3: Testing Get Conversations...', 'blue');
  
  if (!authToken) {
    log('❌ No auth token', 'red');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      log('✅ Conversations retrieved', 'green');
      log(`   Count: ${data.data.conversations.length}`, 'yellow');
      if (data.data.conversations.length > 0) {
        const conv = data.data.conversations[0];
        log(`   Latest: ${conv.id} (${conv.message_count} messages)`, 'yellow');
      }
    } else {
      log(`❌ Get conversations failed: ${data.error?.message || 'Unknown error'}`, 'red');
    }
  } catch (error) {
    log(`❌ Get conversations failed: ${error.message}`, 'red');
  }
}

async function testGetConversation(conversationId) {
  log('\n📖 Step 4: Testing Get Conversation...', 'blue');
  
  if (!authToken || !conversationId) {
    log('❌ Missing auth token or conversation ID', 'red');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      log('✅ Conversation retrieved', 'green');
      log(`   Messages: ${data.data.messages.length}`, 'yellow');
      if (data.data.messages.length > 0) {
        const lastMsg = data.data.messages[data.data.messages.length - 1];
        log(`   Last message: ${lastMsg.role} - ${lastMsg.content.substring(0, 50)}...`, 'yellow');
      }
    } else {
      log(`❌ Get conversation failed: ${data.error?.message || 'Unknown error'}`, 'red');
    }
  } catch (error) {
    log(`❌ Get conversation failed: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('🧪 AI Chat API Test Suite', 'blue');
  log('==========================\n', 'blue');

  // Check if backend is running
  try {
    const healthCheck = await fetch(`${API_URL.replace('/api/v1', '')}/health`);
    if (healthCheck.ok) {
      log('✅ Backend is running', 'green');
    } else {
      throw new Error('Backend health check failed');
    }
  } catch (error) {
    log('❌ Backend is not running!', 'red');
    log('   Start it with: cd backend && npm run dev', 'yellow');
    process.exit(1);
  }

  // Run tests
  const authSuccess = await testAuth();
  if (!authSuccess) {
    log('\n❌ Authentication failed. Cannot continue tests.', 'red');
    process.exit(1);
  }

  const conversationId = await testSendMessage();
  await testGetConversations();
  
  if (conversationId) {
    await testGetConversation(conversationId);
  }

  log('\n✅ All tests completed!', 'green');
  log('\n📝 Next steps:', 'blue');
  log('   1. Test in browser: npm run dev (frontend)', 'yellow');
  log('   2. Open: http://localhost:5173', 'yellow');
  log('   3. Login and click "AI Assistant"', 'yellow');
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
