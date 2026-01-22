# AI Chat Setup Guide

This guide will help you connect your personal Claude (Anthropic) and Gemini (Google) API keys to the JECO+ application.

## Prerequisites

- Node.js 20+ installed
- Access to Anthropic API (for Claude)
- Access to Google Gemini API (for Gemini Ultra)

## Step 1: Install Required Packages

Navigate to the backend directory and install the required npm packages:

```bash
cd backend
npm install @anthropic-ai/sdk @google/generative-ai
```

## Step 2: Get Your API Keys

### Claude API Key (Anthropic)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

**Note:** Make sure you have access to Claude 3.5 Sonnet or higher tier (max 5x as mentioned).

### Gemini API Key (Google)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select your Google Cloud project (or create a new one)
5. Copy your API key

**Note:** Make sure you have access to Gemini Ultra model.

## Step 3: Configure Environment Variables

Add the following environment variables to your `.env` file in the `backend` directory:

```bash
# AI Service Configuration
# Default provider: 'claude' or 'gemini'
AI_DEFAULT_PROVIDER=gemini

# Claude (Anthropic) Configuration
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096

# Gemini (Google) Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-ultra
GEMINI_MAX_TOKENS=4096
```

### Example `.env` file:

```bash
# ... your existing environment variables ...

# AI Services
AI_DEFAULT_PROVIDER=gemini
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLAUDE_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-1.5-ultra
```

## Step 4: Run Database Migration

Create the necessary database tables for chat conversations and messages:

```bash
cd backend
# If you have a migration script
npm run migrate

# Or manually run the SQL migration
psql -U your_user -d jecoplus -f migrations/007_chat_schema.sql
```

The migration creates:
- `conversations` table - Stores chat conversations
- `messages` table - Stores individual messages
- Indexes and triggers for optimal performance

## Step 5: Verify Configuration

### Check Available Providers

You can verify which AI providers are configured by calling the API:

```bash
# Make sure you're authenticated first
curl -X GET http://localhost:3000/api/v1/chat/providers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "providers": ["claude", "gemini"],
    "defaultProvider": "gemini",
    "available": true
  }
}
```

### Test AI Chat

Send a test message:

```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "สวัสดี",
    "provider": "gemini"
  }'
```

## Step 6: Frontend Integration

The frontend service (`src/services/geminiService.js`) has been updated to call the backend API. No additional configuration is needed on the frontend.

You can specify which provider to use when sending messages:

```javascript
import geminiService from '@/services/geminiService'

// Use default provider (configured in backend)
const response = await geminiService.sendMessage('สวัสดี', {})

// Use specific provider
const response = await geminiService.sendMessage('สวัสดี', {
  provider: 'claude' // or 'gemini'
})
```

## Configuration Options

### Model Selection

#### Claude Models
- `claude-3-5-sonnet-20241022` (default) - Best balance of speed and capability
- `claude-3-opus-20240229` - Most capable, slower
- `claude-3-5-haiku-20241022` - Fastest, less capable

#### Gemini Models
- `gemini-1.5-ultra` (default) - Most capable
- `gemini-1.5-pro` - High capability, faster than Ultra
- `gemini-1.5-flash` - Fastest, good for simple tasks

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_DEFAULT_PROVIDER` | Default AI provider (`claude` or `gemini`) | `gemini` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `CLAUDE_MODEL` | Claude model to use | `claude-3-5-sonnet-20241022` |
| `CLAUDE_MAX_TOKENS` | Max tokens for Claude responses | `4096` |
| `GEMINI_API_KEY` | Your Google Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-ultra` |
| `GEMINI_MAX_TOKENS` | Max tokens for Gemini responses | `4096` |

## Troubleshooting

### "No AI providers are configured"

**Problem:** Neither Claude nor Gemini API keys are set.

**Solution:** Make sure at least one of `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` is set in your `.env` file.

### "Claude API key not configured"

**Problem:** `ANTHROPIC_API_KEY` is missing or invalid.

**Solution:** 
1. Verify your API key in the Anthropic Console
2. Make sure the key is correctly set in `.env`
3. Restart your backend server

### "Gemini API key not configured"

**Problem:** `GEMINI_API_KEY` is missing or invalid.

**Solution:**
1. Verify your API key in Google AI Studio
2. Make sure the key is correctly set in `.env`
3. Restart your backend server

### API Rate Limits

Both services have rate limits:
- **Claude:** Check your Anthropic plan limits
- **Gemini:** Free tier has 15 requests per minute, paid tiers have higher limits

If you hit rate limits, the service will automatically fall back to the other provider if available.

### Database Errors

If you see errors about missing tables:

```bash
# Run the migration
cd backend
psql -U your_user -d jecoplus -f migrations/007_chat_schema.sql
```

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to version control
- Keep your API keys secure
- Use different keys for development and production
- Monitor your API usage to avoid unexpected costs

## Cost Considerations

### Claude Pricing (as of 2024)
- Claude 3.5 Sonnet: ~$3 per 1M input tokens, $15 per 1M output tokens
- Claude 3 Opus: ~$15 per 1M input tokens, $75 per 1M output tokens

### Gemini Pricing (as of 2024)
- Gemini 1.5 Ultra: Check current pricing in Google Cloud Console
- Free tier available with limited requests

**Recommendation:** Start with Gemini for development (free tier available), use Claude for production if needed.

## Next Steps

1. ✅ Install packages
2. ✅ Set API keys in `.env`
3. ✅ Run database migration
4. ✅ Test the API endpoints
5. ✅ Start using AI chat in your application!

For more information, see the [AI Chat Feature Spec](./specs/features/ai_chat.md).
