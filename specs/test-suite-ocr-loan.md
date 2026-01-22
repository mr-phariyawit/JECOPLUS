# Test Suite: OCR & Loan Application (Sprint 4)

**Scope:** Backend Services (`OcrService`, `LoanService`) and Frontend (`OcrView`, `TrackingView`).

## 1. Backend: OcrService (`src/services/ocrService.js`)
**Goal:** Extract data from ID Card images using Vision API.

### 1.1 `analyzeImage(buffer)`
- **Case 1.1.1:** Should return extracted fields (ID, Name, DOB) from valid image buffer.
- **Case 1.1.2:** Should gracefully handle API errors (or return mock if config missing).
- **Case 1.1.3:** Should normalize date formats.

## 2. Backend: LoanService (`src/services/loanService.js`)
**Goal:** Manage loan application lifecycle.

### 2.1 `submitApplication(userId)`
- **Case 2.1.1:** Should create a new application record with status 'PENDING'.
- **Case 2.1.2:** Should fail if user has no Credit Score calculated.
- **Case 2.1.3:** Should fail if KYC is incomplete.

### 2.2 `getApplicationStatus(userId)`
- **Case 2.2.1:** Should return the latest application status.
- **Case 2.2.2:** Should return null/404 if no application exists.

## 3. Frontend: KYC Store & Logic
**Goal:** Handle OCR confirmation.

### 3.1 Actions
- **Case 3.1.1:** `confirmOcrData` should update KYC store state with user edits.
- **Case 3.1.2:** `submitLoan` should call API and redirect to tracking.
