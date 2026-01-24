/**
 * Scenarios Index - Central Hub for 10 User Personas
 * Loads and exports all scenario data
 */

import * as personas from './personas'
import * as mockDataService from '../mockDataService'

/**
 * Build all scenarios
 */
function buildScenarios() {
  console.log('🎭 Building scenario data...')

  const scenarios = {}

  // Persona 1: Perfect Borrower ⭐
  try {
    scenarios.PERFECT_BORROWER = personas.createPerfectBorrower()
    console.log('✓ Persona 1: Perfect Borrower created')
  } catch (err) {
    console.error('✗ Failed to create Perfect Borrower:', err)
  }

  // Persona 2: Early Repayment Champion 🚀
  try {
    scenarios.EARLY_REPAYMENT = personas.createEarlyRepaymentChampion()
    console.log('✓ Persona 2: Early Repayment Champion created')
  } catch (err) {
    console.error('✗ Failed to create Early Repayment Champion:', err)
  }

  // Persona 3: Occasional Late Payer ⚠️
  try {
    scenarios.OCCASIONAL_LATE = personas.createOccasionalLatePayer()
    console.log('✓ Persona 3: Occasional Late Payer created')
  } catch (err) {
    console.error('✗ Failed to create Occasional Late Payer:', err)
  }

  // Persona 4: Financially Struggling 😰
  try {
    scenarios.STRUGGLING = personas.createFinanciallyStruggling()
    console.log('✓ Persona 4: Financially Struggling created')
  } catch (err) {
    console.error('✗ Failed to create Financially Struggling:', err)
  }

  // Persona 5: Debt in Collections 📞
  try {
    scenarios.IN_COLLECTION = personas.createInCollection()
    console.log('✓ Persona 5: Debt in Collections created')
  } catch (err) {
    console.error('✗ Failed to create In Collection:', err)
  }

  // Persona 6: Fraud Flagged 🚨
  try {
    scenarios.FRAUD_FLAGGED = personas.createFraudFlagged()
    console.log('✓ Persona 6: Fraud Flagged created')
  } catch (err) {
    console.error('✗ Failed to create Fraud Flagged:', err)
  }

  // Persona 7: Loan Modification Success 🔄
  try {
    scenarios.MODIFIED_LOAN = personas.createModifiedLoan()
    console.log('✓ Persona 7: Loan Modification Success created')
  } catch (err) {
    console.error('✗ Failed to create Modified Loan:', err)
  }

  // Persona 8: Multiple Active Loans 📊
  try {
    scenarios.MULTI_LOAN = personas.createMultiLoan()
    console.log('✓ Persona 8: Multiple Active Loans created')
  } catch (err) {
    console.error('✗ Failed to create Multi Loan:', err)
  }

  // Persona 9: New Borrower 🌱
  try {
    scenarios.NEW_BORROWER = personas.createNewBorrower()
    console.log('✓ Persona 9: New Borrower created')
  } catch (err) {
    console.error('✗ Failed to create New Borrower:', err)
  }

  // Persona 10: Loan Rejection Case ❌
  try {
    scenarios.REJECTED = personas.createRejected()
    console.log('✓ Persona 10: Loan Rejection Case created')
  } catch (err) {
    console.error('✗ Failed to create Rejected:', err)
  }

  console.log(`🎭 Loaded ${Object.keys(scenarios).length} scenarios`)

  return scenarios
}

/**
 * Initialize scenarios and inject into mockDataService
 */
export function initializeScenarios() {
  const scenarios = buildScenarios()

  // Load scenarios into mockDataService
  mockDataService.loadScenarios(scenarios)

  console.log('✅ Scenarios initialized and loaded into mockDataService')

  return scenarios
}

/**
 * Get all available scenario IDs
 */
export function getScenarioIds() {
  return [
    'PERFECT_BORROWER',
    'EARLY_REPAYMENT',
    'OCCASIONAL_LATE',
    'STRUGGLING',
    'IN_COLLECTION',
    'FRAUD_FLAGGED',
    'MODIFIED_LOAN',
    'MULTI_LOAN',
    'NEW_BORROWER',
    'REJECTED',
  ]
}

/**
 * Validate all scenarios
 */
export function validateAllScenarios() {
  const scenarios = buildScenarios()
  const results = {}

  for (const [scenarioId, scenario] of Object.entries(scenarios)) {
    console.log(`\n🔍 Validating ${scenarioId}...`)

    const scenarioResults = {
      scenarioId,
      valid: true,
      errors: [],
      warnings: [],
    }

    // Validate user profile
    if (!scenario.user || !scenario.user.userId) {
      scenarioResults.valid = false
      scenarioResults.errors.push('Missing user profile or userId')
    }

    // Validate loans
    if (!scenario.loans || scenario.loans.length === 0) {
      scenarioResults.warnings.push('No loans found')
    } else {
      scenario.loans.forEach((loan) => {
        // Validate loan data
        const loanValidation = mockDataService.validateLoan(loan.loanId)
        if (!loanValidation.valid) {
          scenarioResults.valid = false
          scenarioResults.errors.push(...loanValidation.errors.map((e) => `Loan ${loan.loanId}: ${e}`))
        }

        // Validate dates
        const dateValidation = mockDataService.validateDates(loan.loanId)
        if (!dateValidation.valid) {
          scenarioResults.valid = false
          scenarioResults.errors.push(...dateValidation.errors.map((e) => `Loan ${loan.loanId} dates: ${e}`))
        }
      })
    }

    // Validate installments
    if (!scenario.installments) {
      scenarioResults.warnings.push('No installments data')
    }

    // Validate transactions
    if (!scenario.transactions) {
      scenarioResults.warnings.push('No transactions data')
    }

    results[scenarioId] = scenarioResults

    if (scenarioResults.valid) {
      console.log(`✅ ${scenarioId} is valid`)
    } else {
      console.log(`❌ ${scenarioId} has ${scenarioResults.errors.length} errors`)
      scenarioResults.errors.forEach((err) => console.log(`   - ${err}`))
    }

    if (scenarioResults.warnings.length > 0) {
      console.log(`⚠️  ${scenarioId} has ${scenarioResults.warnings.length} warnings`)
      scenarioResults.warnings.forEach((warn) => console.log(`   - ${warn}`))
    }
  }

  return results
}

/**
 * Export scenarios for direct access
 */
export const scenarios = buildScenarios()

/**
 * Auto-initialize on import (if not in test environment)
 */
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  initializeScenarios()
}

export default scenarios
