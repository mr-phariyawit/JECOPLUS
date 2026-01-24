/**
 * Business Logic for JECO+ Mock Data System
 * Production-ready calculations for loans, payments, fees, and modifications
 */

// ============================================
// Constants
// ============================================

export const LATE_FEE_CONSTANTS = {
  BASE_FEE: 200, // THB per day
  GRACE_PERIOD_DAYS: 5,
  MAX_MULTIPLIER: 5, // Cap at 5x base fee
}

export const EARLY_REPAYMENT_CONSTANTS = {
  DISCOUNT_RATE: 0.30, // 30% discount on future interest
}

export const SUSPENSION_THRESHOLDS = {
  OVERDUE_CRITICAL_DAYS: 90,
  CONSECUTIVE_LATE_PAYMENTS: 3,
  PAYMENT_REVERSALS_LIMIT: 3,
}

// ============================================
// Date Utilities
// ============================================

/**
 * Add months to a date
 */
export function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Add days to a date
 */
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add years to a date
 */
export function addYears(date, years) {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return date.toISOString().split('T')[0]
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}

// ============================================
// Late Fee Calculations
// ============================================

/**
 * Calculate late fee for an installment
 * @param {Object} installment - Installment object
 * @param {string|Date} currentDate - Current date for calculation
 * @returns {number} Late fee amount in THB
 */
export function calculateLateFee(installment, currentDate) {
  const graceEndDate = new Date(installment.gracePeriodEndDate)
  const current = new Date(currentDate)

  // No fee during grace period
  if (current <= graceEndDate) {
    return 0
  }

  const daysLate = Math.floor((current - graceEndDate) / (1000 * 60 * 60 * 24))

  const calculatedFee = LATE_FEE_CONSTANTS.BASE_FEE * daysLate
  const cappedFee = Math.min(
    calculatedFee,
    LATE_FEE_CONSTANTS.BASE_FEE * LATE_FEE_CONSTANTS.MAX_MULTIPLIER
  )

  return cappedFee
}

/**
 * Create late fee record
 */
export function createLateFeeRecord(installment, currentDate, lateFeeId) {
  const daysLate = daysBetween(installment.gracePeriodEndDate, currentDate)
  if (daysLate <= 0) return null

  const calculatedFee = LATE_FEE_CONSTANTS.BASE_FEE * daysLate
  const cappedFee = Math.min(
    calculatedFee,
    LATE_FEE_CONSTANTS.BASE_FEE * LATE_FEE_CONSTANTS.MAX_MULTIPLIER
  )

  return {
    lateFeeId,
    loanId: installment.loanId,
    installmentId: installment.installmentId,
    baseFee: LATE_FEE_CONSTANTS.BASE_FEE,
    daysLate,
    calculatedFee,
    cappedFee,
    appliedFee: cappedFee,
    status: 'APPLIED',
    isWaived: false,
    waivedDate: null,
    waivedBy: null,
    waiverReason: null,
    assessedDate: formatDate(currentDate),
    createdAt: formatDate(currentDate),
    updatedAt: formatDate(currentDate),
  }
}

// ============================================
// Interest Calculations
// ============================================

/**
 * Calculate daily interest on remaining principal
 * @param {number} remainingPrincipal - Remaining principal amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @returns {number} Daily interest amount
 */
export function calculateDailyInterest(remainingPrincipal, annualRate) {
  const dailyRate = annualRate / 365 / 100
  return remainingPrincipal * dailyRate
}

/**
 * Accrue interest over a number of days
 * @param {Object} loan - Loan object
 * @param {number} days - Number of days
 * @returns {number} Accrued interest amount
 */
export function accrueInterest(loan, days) {
  const dailyInterest = calculateDailyInterest(loan.remainingPrincipal, loan.interestRate)
  return dailyInterest * days
}

/**
 * Calculate monthly payment using amortization formula
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} termMonths - Loan term in months
 * @returns {number} Monthly payment amount
 */
export function calculateMonthlyPayment(principal, annualRate, termMonths) {
  if (annualRate === 0) {
    // 0% interest promotional loan
    return principal / termMonths
  }

  const monthlyRate = annualRate / 12 / 100
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)

  return Math.round(payment * 100) / 100 // Round to 2 decimals
}

// ============================================
// Payment Application Order
// ============================================

/**
 * Apply payment to installment following standard order:
 * Late Fees → Interest → Principal → Excess
 * @param {Object} payment - Payment object with amount
 * @param {Object} installment - Installment object
 * @returns {Object} Breakdown of payment application
 */
export function applyPayment(payment, installment) {
  let remaining = payment.amount
  const breakdown = {
    lateFee: 0,
    interest: 0,
    principal: 0,
    excess: 0,
  }

  // 1. Apply to late fees first
  if (installment.lateFee > 0 && remaining > 0) {
    const toLateFee = Math.min(remaining, installment.lateFee)
    breakdown.lateFee = toLateFee
    remaining -= toLateFee
  }

  // 2. Apply to interest
  if (installment.interestAmount > 0 && remaining > 0) {
    const toInterest = Math.min(remaining, installment.interestAmount)
    breakdown.interest = toInterest
    remaining -= toInterest
  }

  // 3. Apply to principal
  if (installment.principalAmount > 0 && remaining > 0) {
    const toPrincipal = Math.min(remaining, installment.principalAmount)
    breakdown.principal = toPrincipal
    remaining -= toPrincipal
  }

  // 4. Excess (overpayment)
  if (remaining > 0) {
    breakdown.excess = remaining
  }

  return breakdown
}

// ============================================
// Partial Payment Handling
// ============================================

/**
 * Handle partial payment for an installment
 * @param {Object} installment - Installment object
 * @param {number} paymentAmount - Amount paid
 * @returns {Object} New status and remaining amount
 */
export function handlePartialPayment(installment, paymentAmount) {
  const totalDue = installment.totalAmount

  if (paymentAmount >= totalDue) {
    // Full payment
    return {
      status: 'PAID',
      remainingAmount: 0,
      paidAmount: totalDue,
    }
  } else if (paymentAmount > 0) {
    // Partial payment
    const breakdown = applyPayment({ amount: paymentAmount }, installment)
    return {
      status: 'PARTIALLY_PAID',
      remainingAmount: totalDue - paymentAmount,
      paidAmount: paymentAmount,
      breakdown,
    }
  }

  return {
    status: installment.status,
    remainingAmount: totalDue,
    paidAmount: 0,
  }
}

// ============================================
// Early Repayment Calculator
// ============================================

/**
 * Calculate early repayment amount with interest discount
 * @param {Object} loan - Loan object with installments
 * @param {string|Date} currentDate - Current date
 * @returns {Object} Early repayment breakdown
 */
export function calculateEarlyRepayment(loan, currentDate = new Date()) {
  const remainingPrincipal = loan.remainingPrincipal

  // Get all unpaid installments
  const unpaidInstallments = loan.installments.filter((i) => i.status !== 'PAID')
  const totalFutureInterest = unpaidInstallments.reduce((sum, i) => sum + i.interestAmount, 0)

  // Early repayment discount (waive some future interest)
  const discountedInterest = totalFutureInterest * (1 - EARLY_REPAYMENT_CONSTANTS.DISCOUNT_RATE)

  // Outstanding late fees must be paid
  const outstandingLateFees = loan.totalLateFees - (loan.totalFeesPaid || 0)

  const totalEarlyRepayment = remainingPrincipal + discountedInterest + outstandingLateFees
  const savings = totalFutureInterest * EARLY_REPAYMENT_CONSTANTS.DISCOUNT_RATE

  return {
    totalAmount: Math.round(totalEarlyRepayment * 100) / 100,
    principalAmount: remainingPrincipal,
    interestAmount: Math.round(discountedInterest * 100) / 100,
    lateFees: outstandingLateFees,
    savings: Math.round(savings * 100) / 100,
    originalRemainingInterest: totalFutureInterest,
    discountRate: EARLY_REPAYMENT_CONSTANTS.DISCOUNT_RATE,
    currentDate: formatDate(currentDate),
  }
}

// ============================================
// Loan Modification Calculator
// ============================================

/**
 * Create loan modification proposal
 * @param {Object} loan - Loan object
 * @param {Object} proposedChanges - Proposed term/rate changes
 * @returns {Object} Modification comparison
 */
export function createModificationProposal(loan, proposedChanges) {
  // Original terms
  const originalMonthly = loan.monthlyPayment
  const originalTerm = loan.currentTerm || loan.totalInstallments
  const originalRate = loan.interestRate
  const remainingInstallments = originalTerm - loan.paidInstallments

  // Proposed changes
  const newTerm = proposedChanges.term || remainingInstallments
  const newRate = proposedChanges.rate !== undefined ? proposedChanges.rate : originalRate

  // Calculate new monthly payment
  const remainingPrincipal = loan.remainingPrincipal
  const newMonthly = calculateMonthlyPayment(remainingPrincipal, newRate, newTerm)

  const originalTotalPayable = originalMonthly * remainingInstallments
  const newTotalPayable = newMonthly * newTerm

  return {
    original: {
      monthlyPayment: originalMonthly,
      term: remainingInstallments,
      rate: originalRate,
      totalPayable: Math.round(originalTotalPayable * 100) / 100,
    },
    proposed: {
      monthlyPayment: newMonthly,
      term: newTerm,
      rate: newRate,
      totalPayable: Math.round(newTotalPayable * 100) / 100,
    },
    savings: {
      monthlyReduction: Math.round((originalMonthly - newMonthly) * 100) / 100,
      totalCostChange: Math.round((newTotalPayable - originalTotalPayable) * 100) / 100,
      percentageReduction: Math.round(((originalMonthly - newMonthly) / originalMonthly) * 10000) / 100,
    },
    remainingPrincipal,
  }
}

// ============================================
// Account Suspension Logic
// ============================================

/**
 * Evaluate whether account should be suspended
 * @param {Object} loan - Loan object
 * @param {Object} user - User object
 * @returns {Object} Suspension evaluation result
 */
export function evaluateAccountSuspension(loan, user) {
  const reasons = []

  // Rule 1: Payment 90+ days overdue
  if (loan.daysOverdue >= SUSPENSION_THRESHOLDS.OVERDUE_CRITICAL_DAYS) {
    reasons.push({
      code: 'OVERDUE_90',
      severity: 'CRITICAL',
      action: 'SUSPEND_AND_COLLECT',
      message: `Payment overdue ${loan.daysOverdue} days (90+ critical)`,
    })
  }

  // Rule 2: 3+ consecutive late payments
  if (loan.consecutiveLatePayments >= SUSPENSION_THRESHOLDS.CONSECUTIVE_LATE_PAYMENTS) {
    reasons.push({
      code: 'CONSECUTIVE_LATE',
      severity: 'HIGH',
      action: 'RESTRICT_NEW_LOANS',
      message: `${loan.consecutiveLatePayments} consecutive late payments`,
    })
  }

  // Rule 3: Fraud flags
  if (user.fraudFlags && user.fraudFlags.length > 0) {
    reasons.push({
      code: 'FRAUD_DETECTED',
      severity: 'CRITICAL',
      action: 'FREEZE_ACCOUNT',
      message: `Fraud activity detected: ${user.fraudFlags.join(', ')}`,
    })
  }

  // Rule 4: Multiple payment reversals
  if (loan.transactions) {
    const reversals = loan.transactions.filter((t) => t.status === 'REVERSED').length
    if (reversals >= SUSPENSION_THRESHOLDS.PAYMENT_REVERSALS_LIMIT) {
      reasons.push({
        code: 'PAYMENT_REVERSALS',
        severity: 'HIGH',
        action: 'RESTRICT_PAYMENT_METHODS',
        message: `${reversals} payment reversals detected`,
      })
    }
  }

  return {
    shouldSuspend: reasons.some((r) => r.severity === 'CRITICAL'),
    reasons,
    recommendedAction: reasons[0]?.action || 'NONE',
  }
}

// ============================================
// Dispute & Refund Workflows
// ============================================

/**
 * Initiate a payment dispute
 * @param {string} transactionId - Transaction ID
 * @param {string} reason - Dispute reason
 * @param {Object} evidence - Supporting evidence
 * @returns {Object} Dispute record
 */
export function initiateDispute(transactionId, reason, evidence = {}) {
  const disputeId = `DIS${Date.now()}`
  const currentDate = new Date()

  return {
    disputeId,
    transactionId,
    reason,
    evidence,
    status: 'PENDING_REVIEW',
    submittedAt: formatDate(currentDate),
    resolutionDeadline: formatDate(addDays(currentDate, 14)), // 14 days to resolve
    timeline: [
      {
        status: 'SUBMITTED',
        date: formatDate(currentDate),
        actor: 'USER',
        notes: reason,
      },
    ],
  }
}

/**
 * Process a refund
 * @param {string} transactionId - Original transaction ID
 * @param {number} refundAmount - Amount to refund
 * @param {string} reason - Refund reason
 * @returns {Object} Refund record
 */
export function processRefund(transactionId, refundAmount, reason) {
  const refundId = `REF${Date.now()}`
  const currentDate = new Date()

  return {
    refundId,
    originalTransactionId: transactionId,
    amount: refundAmount,
    reason,
    status: 'PENDING',
    method: 'ORIGINAL_PAYMENT_METHOD',
    timeline: [
      {
        status: 'INITIATED',
        date: formatDate(currentDate),
        estimatedCompletion: formatDate(addDays(currentDate, 7)),
      },
    ],
  }
}

// ============================================
// Compliance Tracking
// ============================================

/**
 * Track user consent for compliance
 * @param {string} userId - User ID
 * @param {string} consentType - Type of consent
 * @param {string} version - Version of terms/policy
 * @returns {Object} Consent record
 */
export function trackConsent(userId, consentType, version) {
  const consentId = `CON${Date.now()}`
  const currentDate = new Date()

  return {
    consentId,
    userId,
    consentType, // TERMS_AND_CONDITIONS, PRIVACY_POLICY, CREDIT_INQUIRY, DATA_SHARING
    version,
    granted: true,
    grantedAt: formatDate(currentDate),
    ipAddress: '1.2.3.4', // Mock IP
    userAgent: 'Mozilla/5.0...',
    canWithdraw: true,
    withdrawnAt: null,
    expiresAt: formatDate(addYears(currentDate, 1)),
  }
}

/**
 * Record disclosure shown to user
 * @param {string} userId - User ID
 * @param {string} disclosureType - Type of disclosure
 * @param {string} content - Disclosure content
 * @returns {Object} Disclosure record
 */
export function recordDisclosure(userId, disclosureType, content) {
  const disclosureId = `DIS${Date.now()}`
  const currentDate = new Date()

  return {
    disclosureId,
    userId,
    disclosureType, // APR_DISCLOSURE, FEE_SCHEDULE, PAYMENT_TERMS, EARLY_REPAYMENT
    content,
    shownAt: formatDate(currentDate),
    acknowledged: false,
    acknowledgedAt: null,
    regulatoryRequirement: 'BOT_CONSUMER_LENDING_2024',
    language: 'th',
  }
}

// ============================================
// ID Generators
// ============================================

export function generateId(prefix = '') {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `${prefix}${timestamp}${random}`
}

export function generateLoanId() {
  return `LN${generateId()}`
}

export function generateInstallmentId() {
  return `INS${generateId()}`
}

export function generateTransactionId() {
  return `TXN${generateId()}`
}

export function generateUserId() {
  return `U${generateId()}`
}

export function generateEventId() {
  return `EVT${generateId()}`
}

export function generateLateFeeId() {
  return `FEE${generateId()}`
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate loan financial data accuracy
 * @param {Object} loan - Loan object
 * @returns {Object} Validation result
 */
export function validateLoanData(loan) {
  const errors = []

  // Check: Remaining = Principal + Interest
  const calculatedTotal = loan.remainingPrincipal + (loan.remainingInterest || 0)
  if (Math.abs(calculatedTotal - loan.totalRemaining) > 1) {
    errors.push({
      field: 'totalRemaining',
      message: `Total remaining mismatch: ${loan.totalRemaining} vs calculated ${calculatedTotal}`,
    })
  }

  // Check: Total paid = sum of paid installments
  if (loan.installments) {
    const sumPaid = loan.installments
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + (i.paidAmount || i.totalAmount), 0)
    if (Math.abs(sumPaid - loan.totalPaid) > 1) {
      errors.push({
        field: 'totalPaid',
        message: `Total paid mismatch: ${loan.totalPaid} vs calculated ${sumPaid}`,
      })
    }

    // Check: Paid installments count
    const paidCount = loan.installments.filter((i) => i.status === 'PAID').length
    if (paidCount !== loan.paidInstallments) {
      errors.push({
        field: 'paidInstallments',
        message: `Paid count mismatch: ${loan.paidInstallments} vs actual ${paidCount}`,
      })
    }
  }

  // Check: Late fees total
  if (loan.lateFees) {
    const sumLateFees = loan.lateFees.reduce((sum, f) => sum + f.appliedFee, 0)
    if (Math.abs(sumLateFees - loan.totalLateFees) > 1) {
      errors.push({
        field: 'totalLateFees',
        message: `Late fees mismatch: ${loan.totalLateFees} vs calculated ${sumLateFees}`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate date consistency in loan lifecycle
 * @param {Object} loan - Loan object
 * @returns {Object} Validation result
 */
export function validateDateConsistency(loan) {
  const errors = []

  // Application → Approval → Disbursement
  if (loan.approvalDate && loan.applicationDate) {
    if (new Date(loan.approvalDate) < new Date(loan.applicationDate)) {
      errors.push('Approval date before application date')
    }
  }

  if (loan.disbursementDate && loan.approvalDate) {
    if (new Date(loan.disbursementDate) < new Date(loan.approvalDate)) {
      errors.push('Disbursement date before approval date')
    }
  }

  // First installment due after disbursement
  if (loan.firstDueDate && loan.disbursementDate) {
    if (new Date(loan.firstDueDate) <= new Date(loan.disbursementDate)) {
      errors.push('First due date not after disbursement')
    }
  }

  // Installment dates sequential (25-35 days apart for monthly)
  if (loan.installments && loan.installments.length > 1) {
    const sortedDates = loan.installments.map((i) => new Date(i.dueDate)).sort((a, b) => a - b)
    for (let i = 1; i < sortedDates.length; i++) {
      const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
      if (daysDiff < 25 || daysDiff > 35) {
        errors.push(`Installment ${i} spacing inconsistent: ${daysDiff} days`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default {
  // Constants
  LATE_FEE_CONSTANTS,
  EARLY_REPAYMENT_CONSTANTS,
  SUSPENSION_THRESHOLDS,

  // Date utilities
  addMonths,
  addDays,
  addYears,
  formatDate,
  daysBetween,

  // Calculations
  calculateLateFee,
  createLateFeeRecord,
  calculateDailyInterest,
  accrueInterest,
  calculateMonthlyPayment,
  applyPayment,
  handlePartialPayment,
  calculateEarlyRepayment,
  createModificationProposal,

  // Business rules
  evaluateAccountSuspension,
  initiateDispute,
  processRefund,
  trackConsent,
  recordDisclosure,

  // ID generators
  generateId,
  generateLoanId,
  generateInstallmentId,
  generateTransactionId,
  generateUserId,
  generateEventId,
  generateLateFeeId,

  // Validation
  validateLoanData,
  validateDateConsistency,
}
