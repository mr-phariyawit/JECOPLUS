/**
 * Mock Data Service - Enhanced Service Layer
 * Provides unified API for accessing scenario-based mock data
 * with backward compatibility for existing mockData.js
 */

import * as legacyMockData from './mockData'
import * as logic from './scenarios/businessLogic'

// Will be populated by scenarios/index.js
let scenariosData = null

/**
 * Get current scenario ID from localStorage
 */
export function getCurrentScenarioId() {
  return localStorage.getItem('jeco_current_scenario') || 'DEFAULT'
}

/**
 * Set current scenario ID
 */
export function setCurrentScenario(scenarioId) {
  localStorage.setItem('jeco_current_scenario', scenarioId)
  localStorage.setItem('jeco_scenario_switched_at', new Date().toISOString())
}

/**
 * Load scenarios data (called by scenarios/index.js)
 */
export function loadScenarios(scenarios) {
  scenariosData = scenarios
}

/**
 * Get current scenario data
 */
export function getCurrentScenario() {
  const scenarioId = getCurrentScenarioId()

  if (scenarioId === 'DEFAULT' || !scenariosData) {
    return null // Use legacy mock data
  }

  return scenariosData[scenarioId]
}

// ============================================
// User Profile
// ============================================

/**
 * Get user profile for current scenario
 */
export function getUserProfile() {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return legacyMockData.userProfile
  }

  return scenario.user
}

// ============================================
// Loans
// ============================================

/**
 * Get all loans for current user
 */
export function getUserLoans() {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return legacyMockData.loanAccounts
  }

  return scenario.loans || []
}

/**
 * Get loan by ID
 */
export function getLoanById(loanId) {
  const loans = getUserLoans()
  return loans.find((l) => l.loanId === loanId)
}

/**
 * Get active loans only
 */
export function getActiveLoans() {
  const loans = getUserLoans()
  return loans.filter((l) => l.status === 'ACTIVE')
}

// ============================================
// Installments
// ============================================

/**
 * Get installments for a loan
 */
export function getInstallments(loanId) {
  const scenario = getCurrentScenario()

  if (!scenario) {
    // Legacy behavior
    if (loanId === 'LN001') return legacyMockData.installmentsLN001
    if (loanId === 'LN002') return legacyMockData.installmentsLN002
    return []
  }

  return scenario.installments?.[loanId] || []
}

/**
 * Get installment by ID
 */
export function getInstallment(installmentId) {
  const loans = getUserLoans()

  for (const loan of loans) {
    const installments = getInstallments(loan.loanId)
    const installment = installments.find((i) => i.installmentId === installmentId)
    if (installment) return installment
  }

  return null
}

/**
 * Get pending installments across all loans
 */
export function getPendingInstallments() {
  const loans = getUserLoans()
  const pending = []

  for (const loan of loans) {
    const installments = getInstallments(loan.loanId)
    pending.push(...installments.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE'))
  }

  return pending
}

// ============================================
// Transactions
// ============================================

/**
 * Get transactions for a loan
 */
export function getTransactions(loanId) {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return [] // Legacy doesn't have transactions
  }

  return scenario.transactions?.[loanId] || []
}

/**
 * Get transaction by ID
 */
export function getTransaction(transactionId) {
  const loans = getUserLoans()

  for (const loan of loans) {
    const transactions = getTransactions(loan.loanId)
    const transaction = transactions.find((t) => t.transactionId === transactionId)
    if (transaction) return transaction
  }

  return null
}

/**
 * Get all transactions for user
 */
export function getAllTransactions() {
  const loans = getUserLoans()
  const allTransactions = []

  for (const loan of loans) {
    allTransactions.push(...getTransactions(loan.loanId))
  }

  return allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// ============================================
// Late Fees
// ============================================

/**
 * Get late fees for a loan
 */
export function getLateFees(loanId) {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return []
  }

  return scenario.lateFees?.[loanId] || []
}

/**
 * Get all unpaid late fees for user
 */
export function getUnpaidLateFees() {
  const loans = getUserLoans()
  const unpaid = []

  for (const loan of loans) {
    const fees = getLateFees(loan.loanId)
    unpaid.push(...fees.filter((f) => f.status === 'APPLIED' && !f.isWaived))
  }

  return unpaid
}

// ============================================
// Audit Events
// ============================================

/**
 * Get audit events for a loan
 */
export function getAuditEvents(loanId) {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return []
  }

  if (loanId) {
    return (scenario.events || []).filter((e) => e.loanId === loanId)
  }

  return scenario.events || []
}

// ============================================
// Payment Methods
// ============================================

/**
 * Get available payment methods
 */
export function getPaymentMethods() {
  return legacyMockData.paymentMethods
}

/**
 * Get linked cards
 */
export function getLinkedCards() {
  return legacyMockData.linkedCards
}

/**
 * Get linked banks
 */
export function getLinkedBanks() {
  return legacyMockData.linkedBanks
}

/**
 * Get banks list
 */
export function getBanksList() {
  return legacyMockData.banksList
}

// ============================================
// Notifications
// ============================================

/**
 * Get notifications for user
 */
export function getNotifications() {
  const scenario = getCurrentScenario()

  if (!scenario) {
    return legacyMockData.notifications
  }

  return scenario.notifications || []
}

// ============================================
// Business Logic Operations
// ============================================

/**
 * Calculate early repayment for a loan
 */
export function calculateEarlyRepayment(loanId) {
  const loan = getLoanById(loanId)
  if (!loan) return null

  return logic.calculateEarlyRepayment(loan)
}

/**
 * Create modification proposal for a loan
 */
export function createModificationRequest(loanId, proposedChanges) {
  const loan = getLoanById(loanId)
  if (!loan) return null

  return logic.createModificationProposal(loan, proposedChanges)
}

/**
 * Apply payment to an installment (simulation)
 */
export function applyPayment(amount, installment) {
  return logic.applyPayment({ amount }, installment)
}

/**
 * Record payment transaction (simulation)
 */
export function recordPaymentTransaction(paymentData) {
  const {
    loanId,
    installmentId,
    amount,
    method,
    breakdown,
    reference,
  } = paymentData

  const loan = getLoanById(loanId)
  const user = getUserProfile()

  return {
    transactionId: logic.generateTransactionId(),
    userId: user.userId,
    loanId,
    installmentId,
    type: 'PAYMENT',
    amount,
    appliedToPrincipal: breakdown.principal,
    appliedToInterest: breakdown.interest,
    appliedToLateFee: breakdown.lateFee,
    appliedToOtherFees: 0,
    paymentMethod: method,
    paymentProvider: method === 'JWALLET' ? 'JWallet' : method === 'CREDIT_CARD' ? 'Bank Processor' : 'Bank Transfer',
    status: 'COMPLETED',
    referenceNo: reference,
    externalReference: null,
    isReversed: false,
    reversalDate: null,
    reversalReason: null,
    reversalTransactionId: null,
    ipAddress: '180.1.1.1',
    userAgent: 'Mozilla/5.0...',
    location: 'Bangkok, Thailand',
    initiatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Update installment status after payment (simulation)
 */
export function updateInstallmentStatus(installmentId, breakdown) {
  // In a real app, this would update the backend
  // For mock, we just return the updated status
  const installment = getInstallment(installmentId)
  if (!installment) return null

  const totalPaid = breakdown.lateFee + breakdown.interest + breakdown.principal
  const isFullyPaid = totalPaid >= installment.totalAmount

  return {
    status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
    paidAmount: totalPaid,
    remainingAmount: Math.max(0, installment.totalAmount - totalPaid),
  }
}

// ============================================
// Scenario Management
// ============================================

/**
 * Get available scenarios
 */
export function getAvailableScenarios() {
  return [
    { id: 'DEFAULT', name: 'Legacy Mock Data', icon: '📦', color: 'gray' },
    { id: 'PERFECT_BORROWER', name: 'ผู้กู้ที่สมบูรณ์แบบ', icon: '⭐', color: 'green' },
    { id: 'EARLY_REPAYMENT', name: 'ผู้ชำระก่อนกำหนด', icon: '🚀', color: 'blue' },
    { id: 'OCCASIONAL_LATE', name: 'ผู้ชำระช้าบางครั้ง', icon: '⚠️', color: 'yellow' },
    { id: 'STRUGGLING', name: 'ผู้ประสบปัญหาการเงิน', icon: '😰', color: 'orange' },
    { id: 'IN_COLLECTION', name: 'ถูกติดตาม', icon: '📞', color: 'red' },
    { id: 'FRAUD_FLAGGED', name: 'ถูกตรวจสอบการฉ้อโกง', icon: '🚨', color: 'red' },
    { id: 'MODIFIED_LOAN', name: 'ปรับโครงสร้างหนี้สำเร็จ', icon: '🔄', color: 'teal' },
    { id: 'MULTI_LOAN', name: 'พอร์ตหลายสินเชื่อ', icon: '📊', color: 'purple' },
    { id: 'NEW_BORROWER', name: 'ผู้กู้มือใหม่', icon: '🌱', color: 'green' },
    { id: 'REJECTED', name: 'ถูกปฏิเสธ', icon: '❌', color: 'gray' },
  ]
}

/**
 * Switch to a different scenario
 */
export function switchScenario(scenarioId) {
  setCurrentScenario(scenarioId)

  // Clear any cached data
  clearCaches()

  // Emit event for stores to refresh
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('scenario:changed', {
        detail: { scenarioId, timestamp: new Date() },
      })
    )
  }
}

/**
 * Reset to default scenario
 */
export function resetToDefault() {
  switchScenario('DEFAULT')
}

/**
 * Clear caches
 */
export function clearCaches() {
  const keys = ['loans_cache', 'installments_cache', 'transactions_cache']
  keys.forEach((key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  })
}

/**
 * Get scenario metadata
 */
export function getScenarioMetadata(scenarioId) {
  const scenario = scenariosData?.[scenarioId]
  return scenario?.metadata || null
}

// ============================================
// Validation
// ============================================

/**
 * Validate loan data
 */
export function validateLoan(loanId) {
  const loan = getLoanById(loanId)
  if (!loan) return { valid: false, errors: ['Loan not found'] }

  return logic.validateLoanData(loan)
}

/**
 * Validate date consistency
 */
export function validateDates(loanId) {
  const loan = getLoanById(loanId)
  if (!loan) return { valid: false, errors: ['Loan not found'] }

  return logic.validateDateConsistency(loan)
}

// ============================================
// Export all functions
// ============================================

export default {
  // Scenario management
  getCurrentScenarioId,
  setCurrentScenario,
  loadScenarios,
  getCurrentScenario,
  getAvailableScenarios,
  switchScenario,
  resetToDefault,
  clearCaches,
  getScenarioMetadata,

  // User
  getUserProfile,

  // Loans
  getUserLoans,
  getLoanById,
  getActiveLoans,

  // Installments
  getInstallments,
  getInstallment,
  getPendingInstallments,

  // Transactions
  getTransactions,
  getTransaction,
  getAllTransactions,

  // Late Fees
  getLateFees,
  getUnpaidLateFees,

  // Audit Events
  getAuditEvents,

  // Payment Methods
  getPaymentMethods,
  getLinkedCards,
  getLinkedBanks,
  getBanksList,

  // Notifications
  getNotifications,

  // Business Logic
  calculateEarlyRepayment,
  createModificationRequest,
  applyPayment,
  recordPaymentTransaction,
  updateInstallmentStatus,

  // Validation
  validateLoan,
  validateDates,
}
