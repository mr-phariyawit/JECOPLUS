# Feature Spec: AI Chat Universal

> **Goal**: Implement a universal AI Chat interface powered by Google Gemini (via Vertex AI) into the JECO+ application.

## 1. Context & Scope
The JECO+ application requires an intelligent assistant accessible from anywhere in the app to help users with queries, navigation, or data analysis.

**Scope**:
- **UI**: A floating chat widget/sidebar accessible globally (Universal).
- **Integration**:
    - **Dashboard**: "AI Assistant" button (Quick Action) will open this widget.
    - **Support Page**: Legacy `SupportView.vue` logic will be migrated to the shared Store/Service.
- **AI**: Integration with Google Gemini via Vertex AI.
- **State**: Persisted chat history using Pinia.

## 2. Technical Architecture

### Frontend (Vue 3)
- **Component**: `AIChatWidget.vue` (Floating button + Chat window).
- **Store**: `useAIChatStore` (Pinia) to manage messages, loading state, and session context.
- **Service**: `geminiService.js` to handle API requests (migrating logic from `SupportView`).

### Backend / API Integration
> [!IMPORTANT]
> Client-side Vertex AI calls need a secure proxy or Firebase App Check to protect credentials. For this implementation, we will build the **Frontend Service Layer** designed to connect to a Vertex AI endpoint.

## 3. UI/UX Journey (Plaintext-UXUI)

### State A: Idle (Global)
```text
[Screen: Any Page]
+--------------------------------------------------+
|  (Regular App Content...)                        |
|                                                  |
|  [Dashboard]                                     |
|  [ (AI Assistant) ] button                       | <-- Existing Button
|          |                                       |
|          v (Click triggers State B)              |
|                                                  |
|                                     [ (✨) ]     |  <-- Floating Action Button (FAB)
+--------------------------------------------------+
```
**Options**:
1.  **Click FAB (Global)**: Transitions to **State B (Open)**.
2.  **Click Dashboard "AI Assistant"**: Transitions to **State B (Open)** (prevents navigation to `/support`, keeps user in context).

### State B: Active Chat Window
```text
[Screen: Any Page with Overlay]
+--------------------------------------------------+
|  (Blurred Background / Overlay)                  |
|                                                  |
|           +----------------------------------+   |
|           |  JECO+ Assistant           [ _ X ] | <-- Header (Minimize, Close)
|           +----------------------------------+   |
|           | [AI] Hello! I'm Gemini. How can  |   |
|           |      I help you today?           |   |
|           |                                  |   |
|           | [User] How do I apply for a loan?|   |
|           |                                  |   |
|           | [AI] You can start by...         |   |
|           |      [Button: Go to Loans]       |   | <-- Action Chip
|           |                                  |   |
|           |               (Typing...)        |   |
|           +----------------------------------+   |
|           | [ Type your question...      (>)]|   | <-- Input Area
|           +----------------------------------+   |
+--------------------------------------------------+
```
**Options**:
1.  **Type & Send**: Adds message to list, triggers AI loading state.
2.  **Quick Actions (Chips)**: Clicking a chip (e.g., "Check Credit", "Pay Bill") auto-fills input.
3.  **Minimize (_)**: Collapses window back to FAB (preserves history).
4.  **Close (X)**: Closes window (may clear session depending on config).

### State C: Loading / Thinking
```text
+----------------------------------+
| ...                              |
| [User] Analyze my spending       |
|                                  |
| [AI] (Thinking Animation o o o)  | <-- Polling/Streaming indicator
|                                  |
+----------------------------------+
```

## 4. Detailed Design

### UI Components
1.  **Floating Action Button (FAB)**
    - Bottom-right corner Position (Fixed).
2.  **Chat Window**
    - Uses Glassmorphism styles from `index.css` (or `style.css`).
    - Reuse avatar icons from `SupportView.vue`.

### State Management (Pinia)
```javascript
state: () => ({
  isOpen: false,
  messages: [], 
  isLoading: false,
})
actions: {
  toggleChat(forceState?) // Used by FAB and Dashboard Button
}
```

## 5. Implementation Steps
1.  **Store**: Extract logic from `SupportView.vue` into `src/stores/aiChat.js`.
2.  **Service**: Create `geminiService.js` (initially using the regex/mock logic from `SupportView`).
3.  **UI**: Create `AIChatWidget.vue` (Universal).
4.  **Integration**: 
    - Add `<AIChatWidget />` to `App.vue`.
    - Update `DashboardView.vue` to call `store.toggleChat(true)` instead of `router.push`.
