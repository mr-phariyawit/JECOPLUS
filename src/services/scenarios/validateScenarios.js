/**
 * Scenario Validation Script
 *
 * รัน script นี้เพื่อตรวจสอบความถูกต้องของข้อมูลทั้ง 10 scenarios
 *
 * Usage:
 *   node src/services/scenarios/validateScenarios.js
 *   หรือใช้ใน Vue component: import { validateAllScenarios } from './validateScenarios'
 */

import * as mockDataService from '../mockDataService.js'
import * as logic from './businessLogic.js'

/**
 * Validation Results Structure
 */
class ValidationResult {
  constructor(scenarioId) {
    this.scenarioId = scenarioId
    this.valid = true
    this.errors = []
    this.warnings = []
    this.stats = {}
  }

  addError(message) {
    this.errors.push(message)
    this.valid = false
  }

  addWarning(message) {
    this.warnings.push(message)
  }

  addStat(key, value) {
    this.stats[key] = value
  }
}

/**
 * ตรวจสอบความถูกต้องทางการเงิน
 */
function validateFinancialAccuracy(loan, installments, result) {
  console.log(`  → Validating financial accuracy for ${loan.loanId}...`)

  // 1. ตรวจสอบ Total Remaining = Principal + Interest
  const calculatedTotal = loan.remainingPrincipal + loan.remainingInterest
  const diff = Math.abs(calculatedTotal - loan.totalRemaining)

  if (diff > 1) {
    result.addError(
      `Loan ${loan.loanId}: Total mismatch. ` +
        `Expected ${calculatedTotal.toFixed(2)}, got ${loan.totalRemaining.toFixed(2)} (diff: ${diff.toFixed(2)})`
    )
  }

  // 2. ตรวจสอบ Total Paid = Sum of Paid Installments
  const paidInstallments = installments.filter((i) => i.status === 'PAID')
  const sumPaid = paidInstallments.reduce((sum, i) => sum + i.paidAmount, 0)
  const paidDiff = Math.abs(sumPaid - loan.totalPaid)

  if (paidDiff > 1) {
    result.addError(
      `Loan ${loan.loanId}: Paid total mismatch. ` +
        `Sum of installments: ${sumPaid.toFixed(2)}, loan.totalPaid: ${loan.totalPaid.toFixed(2)}`
    )
  }

  // 3. ตรวจสอบ Late Fees
  const totalLateFees = installments.reduce((sum, i) => sum + (i.lateFee || 0), 0)

  if (totalLateFees < 0) {
    result.addError(`Loan ${loan.loanId}: Negative late fees: ${totalLateFees}`)
  }

  // Check late fee cap (1000 per installment)
  installments.forEach((inst) => {
    if (inst.lateFee > 1000) {
      result.addError(`Installment ${inst.installmentNo}: Late fee exceeds cap (${inst.lateFee} > 1000)`)
    }
  })

  // 4. ตรวจสอบ Installment amounts
  installments.forEach((inst) => {
    const instTotal = inst.principalAmount + inst.interestAmount + (inst.lateFee || 0)
    const expectedTotal = inst.totalAmount + (inst.lateFee || 0)
    const instDiff = Math.abs(instTotal - expectedTotal)

    if (instDiff > 1) {
      result.addError(
        `Installment ${inst.installmentNo}: Amount mismatch. ` +
          `Principal + Interest + Late Fee = ${instTotal.toFixed(2)}, ` +
          `but totalAmount = ${inst.totalAmount.toFixed(2)}`
      )
    }
  })

  result.addStat('totalRemaining', loan.totalRemaining)
  result.addStat('totalPaid', loan.totalPaid)
  result.addStat('totalLateFees', totalLateFees)
}

/**
 * ตรวจสอบความสอดคล้องของวันที่
 */
function validateDateConsistency(loan, installments, result) {
  console.log(`  → Validating date consistency for ${loan.loanId}...`)

  // 1. Application → Approval → Disbursement
  const appDate = new Date(loan.applicationDate)
  const approvalDate = new Date(loan.approvalDate)
  const disbursementDate = new Date(loan.disbursementDate)

  if (approvalDate < appDate) {
    result.addError(
      `Loan ${loan.loanId}: Approval date (${loan.approvalDate}) before application date (${loan.applicationDate})`
    )
  }

  if (disbursementDate < approvalDate) {
    result.addError(
      `Loan ${loan.loanId}: Disbursement date (${loan.disbursementDate}) before approval date (${loan.approvalDate})`
    )
  }

  // 2. Installment dates sequential (25-35 days apart)
  const sortedInstallments = [...installments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  for (let i = 1; i < sortedInstallments.length; i++) {
    const prevDate = new Date(sortedInstallments[i - 1].dueDate)
    const currDate = new Date(sortedInstallments[i].dueDate)
    const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24)

    if (daysDiff < 25 || daysDiff > 35) {
      result.addWarning(
        `Loan ${loan.loanId}: Installment ${i} date gap unusual: ${daysDiff.toFixed(0)} days ` +
          `(expected 25-35 days)`
      )
    }
  }

  // 3. Payment dates should be >= due dates (for paid installments)
  installments
    .filter((i) => i.status === 'PAID' && i.paymentDate)
    .forEach((inst) => {
      const dueDate = new Date(inst.dueDate)
      const paymentDate = new Date(inst.paymentDate)

      if (paymentDate < dueDate && inst.isPaidOnTime) {
        result.addWarning(
          `Installment ${inst.installmentNo}: Payment date (${inst.paymentDate}) ` +
            `before due date (${inst.dueDate}) but marked as on-time`
        )
      }
    })
}

/**
 * ตรวจสอบ Business Rules
 */
function validateBusinessRules(loan, installments, result) {
  console.log(`  → Validating business rules for ${loan.loanId}...`)

  // 1. Grace Period (5 days)
  installments
    .filter((i) => i.status === 'PAID')
    .forEach((inst) => {
      if (inst.daysLate > 0 && inst.daysLate <= 5 && inst.lateFee > 0) {
        result.addError(
          `Installment ${inst.installmentNo}: Has late fee ${inst.lateFee} ` +
            `but within grace period (${inst.daysLate} days)`
        )
      }
    })

  // 2. Late Fee Calculation (200 * daysLate, capped at 1000)
  installments
    .filter((i) => i.daysLate > 5)
    .forEach((inst) => {
      const expectedFee = Math.min(200 * (inst.daysLate - 5), 1000)

      // Allow small rounding differences
      if (Math.abs(inst.lateFee - expectedFee) > 1) {
        result.addError(
          `Installment ${inst.installmentNo}: Late fee mismatch. ` +
            `Expected ${expectedFee} (${inst.daysLate} days late), got ${inst.lateFee}`
        )
      }
    })

  // 3. Status Consistency
  if (loan.status === 'ACTIVE') {
    if (loan.remainingPrincipal <= 0) {
      result.addError(`Loan ${loan.loanId}: Status ACTIVE but no principal remaining`)
    }
  }

  if (loan.status === 'PAID_OFF') {
    if (loan.remainingPrincipal > 0) {
      result.addError(
        `Loan ${loan.loanId}: Status PAID_OFF but principal remaining: ${loan.remainingPrincipal}`
      )
    }
  }

  // 4. Account Status Rules
  if (loan.daysOverdue >= 90 && loan.accountStatus !== 'SUSPENDED') {
    result.addWarning(
      `Loan ${loan.loanId}: 90+ days overdue but account not SUSPENDED ` +
        `(status: ${loan.accountStatus})`
    )
  }

  // 5. Payment Success Rate
  const paidInstallments = installments.filter((i) => i.status === 'PAID')
  if (paidInstallments.length > 0) {
    const onTimeCount = paidInstallments.filter((i) => i.isPaidOnTime).length
    const successRate = (onTimeCount / paidInstallments.length) * 100

    result.addStat('paymentSuccessRate', successRate.toFixed(1) + '%')

    if (loan.paymentSuccessRate !== undefined) {
      const diff = Math.abs(successRate - loan.paymentSuccessRate)
      if (diff > 5) {
        result.addWarning(
          `Loan ${loan.loanId}: Payment success rate mismatch. ` +
            `Calculated: ${successRate.toFixed(1)}%, stored: ${loan.paymentSuccessRate}%`
        )
      }
    }
  }
}

/**
 * ตรวจสอบ User Profile
 */
function validateUserProfile(user, result) {
  console.log(`  → Validating user profile...`)

  // Required fields
  const requiredFields = ['userId', 'firstName', 'lastName', 'age', 'monthlyIncome', 'creditScore']

  requiredFields.forEach((field) => {
    if (!user[field]) {
      result.addError(`User profile missing required field: ${field}`)
    }
  })

  // Credit Score range (300-850)
  if (user.creditScore < 300 || user.creditScore > 850) {
    result.addError(`Invalid credit score: ${user.creditScore} (valid range: 300-850)`)
  }

  // Age range (18-100)
  if (user.age < 18 || user.age > 100) {
    result.addWarning(`Unusual age: ${user.age}`)
  }

  // Monthly Income
  if (user.monthlyIncome < 0) {
    result.addError(`Negative monthly income: ${user.monthlyIncome}`)
  }

  result.addStat('creditScore', user.creditScore)
  result.addStat('monthlyIncome', user.monthlyIncome)
}

/**
 * ตรวจสอบ Scenario เดียว
 */
function validateScenario(scenarioId) {
  console.log(`\n🔍 Validating Scenario: ${scenarioId}`)

  const result = new ValidationResult(scenarioId)

  try {
    // Load scenario data
    const scenario = mockDataService.getScenarioData(scenarioId)

    if (!scenario) {
      result.addError(`Scenario ${scenarioId} not found`)
      return result
    }

    // Validate user profile
    validateUserProfile(scenario.user, result)

    // Validate each loan
    scenario.loans.forEach((loan) => {
      const installments = mockDataService.getInstallments(loan.loanId)

      validateFinancialAccuracy(loan, installments, result)
      validateDateConsistency(loan, installments, result)
      validateBusinessRules(loan, installments, result)
    })

    // Overall stats
    result.addStat('totalLoans', scenario.loans.length)
    result.addStat('activeLoans', scenario.loans.filter((l) => l.status === 'ACTIVE').length)

    if (result.valid) {
      console.log(`✅ ${scenarioId} is VALID`)
    } else {
      console.log(`❌ ${scenarioId} has ${result.errors.length} errors`)
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  ${scenarioId} has ${result.warnings.length} warnings`)
    }
  } catch (error) {
    result.addError(`Exception during validation: ${error.message}`)
    console.error(`💥 ${scenarioId} validation failed:`, error)
  }

  return result
}

/**
 * ตรวจสอบทุก Scenarios
 */
export function validateAllScenarios() {
  console.log('\n' + '='.repeat(60))
  console.log('🎭 VALIDATING ALL SCENARIOS')
  console.log('='.repeat(60))

  const scenarios = mockDataService.getAvailableScenarios().filter((s) => s.id !== 'DEFAULT')

  const results = {}
  let totalErrors = 0
  let totalWarnings = 0

  scenarios.forEach((scenario) => {
    const result = validateScenario(scenario.id)
    results[scenario.id] = result

    totalErrors += result.errors.length
    totalWarnings += result.warnings.length
  })

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 VALIDATION SUMMARY')
  console.log('='.repeat(60))

  const validCount = Object.values(results).filter((r) => r.valid).length
  const invalidCount = scenarios.length - validCount

  console.log(`Total Scenarios: ${scenarios.length}`)
  console.log(`✅ Valid: ${validCount}`)
  console.log(`❌ Invalid: ${invalidCount}`)
  console.log(`⚠️  Total Warnings: ${totalWarnings}`)
  console.log(`💥 Total Errors: ${totalErrors}`)

  // Detailed errors
  if (totalErrors > 0) {
    console.log('\n' + '-'.repeat(60))
    console.log('❌ ERRORS DETAIL')
    console.log('-'.repeat(60))

    Object.entries(results).forEach(([scenarioId, result]) => {
      if (result.errors.length > 0) {
        console.log(`\n${scenarioId}:`)
        result.errors.forEach((error) => {
          console.log(`  ❌ ${error}`)
        })
      }
    })
  }

  // Detailed warnings
  if (totalWarnings > 0) {
    console.log('\n' + '-'.repeat(60))
    console.log('⚠️  WARNINGS DETAIL')
    console.log('-'.repeat(60))

    Object.entries(results).forEach(([scenarioId, result]) => {
      if (result.warnings.length > 0) {
        console.log(`\n${scenarioId}:`)
        result.warnings.forEach((warning) => {
          console.log(`  ⚠️  ${warning}`)
        })
      }
    })
  }

  // Stats summary
  console.log('\n' + '-'.repeat(60))
  console.log('📈 STATISTICS')
  console.log('-'.repeat(60))

  Object.entries(results).forEach(([scenarioId, result]) => {
    if (Object.keys(result.stats).length > 0) {
      console.log(`\n${scenarioId}:`)
      Object.entries(result.stats).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
    }
  })

  console.log('\n' + '='.repeat(60))

  return {
    results,
    summary: {
      total: scenarios.length,
      valid: validCount,
      invalid: invalidCount,
      warnings: totalWarnings,
      errors: totalErrors,
    },
  }
}

/**
 * ตรวจสอบ Scenario เดียว (export for individual use)
 */
export { validateScenario }

/**
 * Quick validation (returns boolean only)
 */
export function isScenarioValid(scenarioId) {
  const result = validateScenario(scenarioId)
  return result.valid
}

/**
 * Get validation summary for UI
 */
export function getValidationSummary(scenarioId) {
  const result = validateScenario(scenarioId)

  return {
    valid: result.valid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors,
    warnings: result.warnings,
    stats: result.stats,
  }
}

// ถ้ารันเป็น standalone script
if (typeof process !== 'undefined' && process.argv[1] === new URL(import.meta.url).pathname) {
  validateAllScenarios()
}

export default {
  validateAllScenarios,
  validateScenario,
  isScenarioValid,
  getValidationSummary,
}
