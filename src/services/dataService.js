/**
 * Data Service - Unified API (Auto-switch: Mockup ↔ Real API)
 *
 * ใช้ VITE_MOCKUP_MODE=true/false ควบคุม
 * - true  = ใช้ mock data (development)
 * - false = เรียก API จริง (production)
 */

import api from './api'
import * as mockDataService from './mockDataService'

// อ่านค่าจาก .env
const IS_MOCKUP = import.meta.env.VITE_MOCKUP_MODE === 'true'

// Log mode ตอน start
if (IS_MOCKUP) {
  console.log('🎭 Running in MOCKUP MODE')
  console.log('   → Using mock data from scenarios')
  console.log('   → Set VITE_MOCKUP_MODE=false to use real API')
} else {
  console.log('🌐 Running in API MODE')
  console.log('   → Using real API:', import.meta.env.VITE_API_URL)
}

/**
 * Helper: Simulate API delay
 */
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * =========================================
 * USER
 * =========================================
 */

export async function getCurrentUser() {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getCurrentUser')
    await delay()
    return mockDataService.getCurrentUser()
  }

  console.log('🌐 [API] GET /user/me')
  const response = await api.get('/user/me')
  return response.data.data
}

/**
 * =========================================
 * LOANS
 * =========================================
 */

export async function getUserLoans() {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getUserLoans')
    await delay(500)
    return mockDataService.getUserLoans()
  }

  console.log('🌐 [API] GET /loans')
  const response = await api.get('/loans')
  return response.data.data
}

export async function getLoanById(loanId) {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getLoanById:', loanId)
    await delay(300)
    return mockDataService.getLoanById(loanId)
  }

  console.log('🌐 [API] GET /loans/:id', loanId)
  const response = await api.get(`/loans/${loanId}`)
  return response.data.data
}

export async function getInstallments(loanId) {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getInstallments:', loanId)
    await delay(300)
    return mockDataService.getInstallments(loanId)
  }

  console.log('🌐 [API] GET /loans/:id/installments', loanId)
  const response = await api.get(`/loans/${loanId}/installments`)
  return response.data.data
}

export async function getTransactions(loanId) {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getTransactions:', loanId)
    await delay(300)
    return mockDataService.getTransactions(loanId)
  }

  console.log('🌐 [API] GET /loans/:id/transactions', loanId)
  const response = await api.get(`/loans/${loanId}/transactions`)
  return response.data.data
}

/**
 * =========================================
 * PAYMENT
 * =========================================
 */

export async function getPaymentMethods() {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getPaymentMethods')
    await delay(300)
    return mockDataService.getPaymentMethods()
  }

  console.log('🌐 [API] GET /payment/methods')
  const response = await api.get('/payment/methods')
  return response.data.data
}

export async function getLinkedCards() {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getLinkedCards')
    await delay(300)
    return mockDataService.getLinkedCards()
  }

  console.log('🌐 [API] GET /payment/cards')
  const response = await api.get('/payment/cards')
  return response.data.data
}

export async function getLinkedBanks() {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] getLinkedBanks')
    await delay(300)
    return mockDataService.getLinkedBanks()
  }

  console.log('🌐 [API] GET /payment/banks')
  const response = await api.get('/payment/banks')
  return response.data.data
}

export async function makePayment(paymentData) {
  if (IS_MOCKUP) {
    console.log('📦 [MOCKUP] makePayment:', paymentData)
    await delay(2000)

    // Simulate 90% success
    const success = Math.random() > 0.1

    return {
      success,
      transactionId: `TXN${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: success ? 'Payment successful' : 'Payment failed',
    }
  }

  console.log('🌐 [API] POST /payment/pay')
  const response = await api.post('/payment/pay', paymentData)
  return response.data.data
}

/**
 * =========================================
 * SCENARIOS (Mockup Only)
 * =========================================
 */

export function getAvailableScenarios() {
  if (!IS_MOCKUP) {
    return []
  }
  return mockDataService.getAvailableScenarios()
}

export function switchScenario(scenarioId) {
  if (!IS_MOCKUP) {
    console.warn('⚠️ Scenarios only available in mockup mode')
    return false
  }

  console.log('🎭 Switching to scenario:', scenarioId)
  mockDataService.switchScenario(scenarioId)

  // Emit event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('scenario:changed', {
        detail: { scenarioId, timestamp: new Date() },
      })
    )
  }

  return true
}

export function getCurrentScenarioId() {
  if (!IS_MOCKUP) {
    return 'PRODUCTION'
  }
  return mockDataService.getCurrentScenarioId()
}

export function getScenarioData(scenarioId) {
  if (!IS_MOCKUP) {
    return null
  }
  return mockDataService.getScenarioData(scenarioId)
}

/**
 * =========================================
 * UTILITIES
 * =========================================
 */

export function isMockupMode() {
  return IS_MOCKUP
}

export function clearCaches() {
  if (IS_MOCKUP) {
    mockDataService.clearCaches()
  }
}

/**
 * =========================================
 * EXPORT ALL
 * =========================================
 */

export default {
  // User
  getCurrentUser,

  // Loans
  getUserLoans,
  getLoanById,
  getInstallments,
  getTransactions,

  // Payment
  getPaymentMethods,
  getLinkedCards,
  getLinkedBanks,
  makePayment,

  // Scenarios
  getAvailableScenarios,
  switchScenario,
  getCurrentScenarioId,
  getScenarioData,

  // Utils
  isMockupMode,
  clearCaches,
}
