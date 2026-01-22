# Test Suite: Wallet Sprint 2 (Bank & Statements)

**Scope:** Backend Services (`BankService`, `PdfService`) and Frontend Store (`WalletStore` updates) for Sprint 2.

## 1. Backend: BankService (`src/services/bankService.js`)
**Goal:** Manage bank accounts and statements.

### 1.1 `addBankAccount(userId, accountDetails)`
- **Case 1.1.1:** Should successfully add a valid bank account.
- **Case 1.1.2:** Should throw error if account number is invalid (basic regex).
- **Case 1.1.3:** Should throw error if bank code is not supported.

### 1.2 `getBankAccounts(userId)`
- **Case 1.2.1:** Should return list of linked bank accounts.
- **Case 1.2.2:** Should return empty list if none found.

### 1.3 `deleteBankAccount(userId, accountId)`
- **Case 1.3.1:** Should soft-delete or remove the bank account.
- **Case 1.3.2:** Should throw error if account belongs to another user.

## 2. Backend: PdfService (`src/services/pdfService.js`)
**Goal:** Extract text from PDFs and identify transactions.

### 2.1 `extractText(buffer)`
- **Case 2.1.1:** Should return text content from a valid PDF buffer (mocked `pdf-parse`).
- **Case 2.1.2:** Should throw error for invalid file/buffer.

### 2.2 `parseTransactions(text)`
- **Case 2.2.1:** Should extract transactions from SCB-style text format (Date, Description, Amount).
- **Case 2.2.2:** Should extract transactions from KBank-style text format.
- **Case 2.2.3:** Should return empty array if no patterns match.

## 3. Frontend: WalletStore (`src/stores/wallet.js`)
**Goal:** Integrate bank actions.

### 3.1 Actions
- **Case 3.1.1:** `fetchBankAccounts` should commit accounts to state.
- **Case 3.1.2:** `addBankAccount` should call API and refresh list.
- **Case 3.1.3:** `uploadStatement` should handle file upload and update status.
