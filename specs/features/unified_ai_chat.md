# Unified AI Chat & Financial Assistant Integration Plan

## 1. Overview
The goal is to merge the specialized `MoneyCoachService` and `LoanAssistantService` into the main `AIChatService`. This will allow the AI Chat to dynamically switch personas and utilize specialized financial logic based on user intent or specific input parameters (via "Chat/Chart" context).

## 2. Architecture Design

### Current Architecture
- `AIChatService`: Generic "JECO+ Assistant" (Hardcoded System Prompt).
- `MoneyCoachService`: Standalone service with rich financial analysis logic.
- `LoanAssistantService`: Standalone service with loan comparison and calculation logic.

### New Architecture (Unified)
- **`AIChatService` (Orchestrator)**: 
    - Accepts `mode` (e.g., `general`, `money_coach`, `loan_assistant`).
    - Accepts `context/parameters` (e.g., income, loan amount).
    - dynamically builds the System Prompt using the specialized services.
    - Retrieves relevant data (RAG, User Profile, Loans) before generating response.

## 3. Implementation Plan

### Phase 1: Service Integration
Modify `AIChatService.js` to:
1.  Import `moneyCoachService` and `loanAssistantService`.
2.  Update `generateResponse` to accept `mode` and `additionalContext`.
3.  Implement a `buildContextualSystemPrompt` method that:
    - Fetches User Profile (via `MoneyCoachService` logic) if mode is `money_coach`.
    - Fetches User Loans/Credit Score (via `LoanAssistantService` logic) if mode is `loan_assistant`.
    - Generates the specialized prompt using existing methods in those services.

### Phase 2: API & Controller Updates
Modify `chatController.js` and `chat.js` routes to:
1.  Accept `mode` in the request body (default to `general`).
2.  Accept `parameters` (optional JSON object for user inputs like "salary", "loan_amount" from UI charts/forms).
3.  Pass these values to `AIChatService`.

### Phase 3: "Chart" Input Handling
Support "Parameter Input via Chat":
1.  If the frontend sends parameters (e.g., from a budget chart or loan calculator), inject them into the System Prompt context immediately.
2.  Allow the AI to "see" these parameters so it can give immediate advice without asking the user again.

## 4. Technical Specifications

### `AIChatService.generateResponse` Signature Update
```javascript
async generateResponse(message, conversationHistory, options = {}) {
    // options now includes:
    // - mode: 'general' | 'money_coach' | 'loan_assistant'
    // - context: { ...user inputs... }
    // - userId: string
}
```

### Prompt Strategy
- **Money Coach Mode**: Combines standard helpful persona + Financial Profile Data + Budgeting Rules.
- **Loan Assistant Mode**: Combines standard helpful persona + Loan Calculator Logic + Product Knowledge.

## 5. Next Steps
1. Refactor `AIChatService.js`.
2. Update `ChatController.js`.
3. Verify with test cases.
