# Test Suite: Credit Scoring Engine (Sprint 3)

**Scope:** Backend `CreditScoreService` and Frontend `LoanStore`.

## 1. Backend: CreditScoreService (`src/services/creditScoreService.js`)
**Goal:** Calculate credit score based on financial factors.

### 1.1 `calculateScore(data)`
- **Case 1.1.1:** Should calculate score > 700 for high income, low expense profile.
    - *Input:* Income 50k, Expense 15k, Stable.
    - *Expected:* Score >= 700, Status: APPROVED.
- **Case 1.1.2:** Should calculate score < 700 for high expense ratio.
    - *Input:* Income 20k, Expense 18k.
    - *Expected:* Score < 700, Status: REJECTED.
- **Case 1.1.3:** Should cap score at min (300) and max (850).

### 1.2 `analyzeIncome(transactions)`
- **Case 1.2.1:** Should correctly sum positive transactions as income.
- **Case 1.2.2:** Should calculate variance/stability (mock logic).

### 1.3 `analyzeExpenses(transactions)`
- **Case 1.3.1:** Should correctly sum negative transactions as expenses.

## 2. Frontend: LoanStore (`src/stores/loan.js`)
**Goal:** Manage score state.

### 2.1 Actions
- **Case 2.1.1:** `calculateScore` should call API and update state.
- **Case 2.1.2:** `fetchLatestScore` should retrieve persisted score.
