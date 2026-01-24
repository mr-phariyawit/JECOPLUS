# Robust AI Chat System Specification

## Goal
Improve the JECO+ AI Chat system (`AIChatService`) to be resilient against network issues, API failures, and provider outages. Ensure a seamless user experience even when errors occur.

## Problem Statement
The current implementation is functional but fragile. Network interruptions (like CORS or timeout) cause generic errors. Chat history is lost on refresh. If the primary AI provider is down or rate-limited, the request fails.

## Proposed Features

### 1. Robust Backend Orchestration
-   **Intelligent Fallback**: If the selected provider fails (e.g., 503, 429), automatically retry with the next available provider (Vertex AI -> Gemini -> Claude).
-   **Conversation Persistence**: Ensure all messages are saved to the database (`conversation_messages` table) *before* sending to AI, and updated *after* response.
-   **Structured Error Handling**: Return specific error codes (`AI_PROVIDER_ERROR`, `RATE_LIMIT`, `CONTEXT_LIMIT`) to client.

### 2. Resilient Frontend Client
-   **Local Persistence**: Use `localStorage` (via persistent state pattern) to keep chat history across reloads.
-   **Auto-Retry**: If `sendMessage` fails due to network error, automatically retry up to 3 times with backoff.
-   **Connection Status**: Visual indicator if the backend is unreachable.
-   **Graceful Degradation**: If AI is completely unavailable, fall back to "Offline Mode" (pre-defined FAQ responses).

### 3. Architecture Updates

#### Backend `AIChatService`
-   Refactor `generateResponse` to use a `providerChain`.
-   Implement `CircuitBreaker` pattern for providers (if one fails repeatedly, skip it for x minutes).

#### Frontend `AIChatStore`
-   Implement persistence logic in Pinia store.
-   Add `retryQueue` for failed messages.

## API Changes
No breaking changes to endpoints, but enhanced response metadata:
```json
{
  "success": true,
  "data": {
    "text": "...",
    "provider": "gemini", // Actual provider used
    "fallbackOccurred": true // If primary failed
  }
}
```

## Implementation Phases
1.  **Phase 1: Backend Reliability** (Provider Fallback, Database Persistence verified)
2.  **Phase 2: Frontend Resilience** (Auto-retry, Local Persistence)
3.  **Phase 3: Visual Feedback** (Connection status, "Using backup provider" indicator)
