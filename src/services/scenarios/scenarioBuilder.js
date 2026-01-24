/**
 * Scenario Builder Utilities
 * Data generation helpers for creating realistic loan scenarios
 */

import * as logic from './businessLogic'

// ============================================
// Random Utilities
// ============================================

/**
 * Generate random number between min and max
 */
export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random float between min and max
 */
export function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Pick random item from array
 */
export function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle array randomly
 */
export function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  ]
  return shuffled
}

// ============================================
// Installment Schedule Generator
// ============================================

/**
 * Generate complete installment schedule for a loan
 * @param {Object} loan - Loan configuration
 * @param {Object} options - Generation options
 * @returns {Array} Installment schedule
 */
export function generateInstallmentSchedule(loan, options = {}) {
  const {
    principalAmount,
    interestRate,
    termMonths,
    startDate,
    paymentDay = 15,
  } = loan

  const monthlyPayment = logic.calculateMonthlyPayment(principalAmount, interestRate, termMonths)
  const installments = []
  let remainingPrincipal = principalAmount

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = logic.addMonths(new Date(startDate), i)
    dueDate.setDate(paymentDay)

    // Calculate interest and principal for this installment
    let interestAmount
    let principalPortion

    if (interestRate === 0) {
      // 0% promotional loan
      interestAmount = 0
      principalPortion = principalAmount / termMonths
    } else {
      const monthlyRate = interestRate / 12 / 100
      interestAmount = remainingPrincipal * monthlyRate
      principalPortion = monthlyPayment - interestAmount
    }

    // Handle last installment rounding
    if (i === termMonths) {
      principalPortion = remainingPrincipal
      if (interestRate === 0) {
        monthlyPayment = principalPortion
      }
    }

    const installment = {
      installmentId: logic.generateInstallmentId(),
      loanId: loan.loanId,
      installmentNo: i,
      dueDate: logic.formatDate(dueDate),
      gracePeriodEndDate: logic.formatDate(logic.addDays(dueDate, logic.LATE_FEE_CONSTANTS.GRACE_PERIOD_DAYS)),

      // Amount breakdown
      totalAmount: Math.round(monthlyPayment * 100) / 100,
      principalAmount: Math.round(principalPortion * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      lateFee: 0,
      otherFees: 0,

      // Payment tracking (will be updated based on behavior)
      paidAmount: 0,
      paidPrincipal: 0,
      paidInterest: 0,
      paidLateFee: 0,
      remainingAmount: Math.round(monthlyPayment * 100) / 100,

      // Status
      status: 'UPCOMING',
      isPaidOnTime: null,
      daysLate: 0,

      // Payment details (will be filled when payment is applied)
      paymentDate: null,
      paymentMethod: null,
      paymentReference: null,

      // Partial payments
      partialPayments: [],

      // Dispute
      isDisputed: false,
      disputeDate: null,
      disputeReason: null,
      disputeStatus: null,

      createdAt: logic.formatDate(startDate),
      updatedAt: logic.formatDate(startDate),
    }

    installments.push(installment)
    remainingPrincipal -= principalPortion
  }

  return installments
}

// ============================================
// Payment Behavior Patterns
// ============================================

/**
 * Apply payment behavior to installments
 * @param {Array} installments - Installment schedule
 * @param {Object} behavior - Payment behavior configuration
 * @param {Object} loan - Loan object (for reference)
 * @returns {Array} Updated installments with payment history
 */
export function applyPaymentBehavior(installments, behavior, loan) {
  const {
    onTimeRate = 1.0, // Percentage of on-time payments
    lateDaysRange = [0, 0], // [min, max] days late
    partialPaymentRate = 0, // Percentage of partial payments
    missedPaymentIndices = [], // Array of installment indices to skip
    overduePaymentIndices = [], // Array of installment indices that are overdue (not paid yet)
    currentInstallmentIndex = installments.length, // Current installment number (all before are due)
  } = behavior

  const paymentMethods = ['JWALLET', 'CREDIT_CARD', 'BANK_ACCOUNT']
  const updated = []

  for (let index = 0; index < installments.length; index++) {
    const inst = { ...installments[index] }

    // Skip future installments (not yet due)
    if (index >= currentInstallmentIndex) {
      inst.status = 'UPCOMING'
      updated.push(inst)
      continue
    }

    // Current installment (due but unpaid)
    if (index === currentInstallmentIndex - 1) {
      inst.status = 'PENDING'
      updated.push(inst)
      continue
    }

    // Missed payment (completely unpaid)
    if (missedPaymentIndices.includes(index)) {
      inst.status = 'OVERDUE'
      inst.paidAmount = 0
      inst.isPaidOnTime = false

      const daysOverdue = logic.daysBetween(inst.dueDate, new Date())
      inst.daysLate = Math.max(daysOverdue, 1)

      // Calculate and apply late fee
      const lateFee = logic.calculateLateFee(inst, new Date())
      inst.lateFee = lateFee
      inst.totalAmount += lateFee
      inst.remainingAmount = inst.totalAmount

      updated.push(inst)
      continue
    }

    // Overdue payment (past due, not yet paid)
    if (overduePaymentIndices.includes(index)) {
      inst.status = 'OVERDUE'
      inst.paidAmount = 0
      inst.isPaidOnTime = false

      const daysOverdue = randomBetween(5, 45) // Realistic overdue range
      inst.daysLate = daysOverdue

      const overdueDate = logic.addDays(new Date(inst.dueDate), daysOverdue)
      const lateFee = logic.calculateLateFee(inst, overdueDate)
      inst.lateFee = lateFee
      inst.totalAmount += lateFee
      inst.remainingAmount = inst.totalAmount

      updated.push(inst)
      continue
    }

    // Payment was made - determine timing and amount

    // Determine if late
    const isLate = Math.random() > onTimeRate
    const daysLate = isLate ? randomBetween(lateDaysRange[0], lateDaysRange[1]) : 0

    const paymentDate = logic.addDays(new Date(inst.dueDate), daysLate)

    // Calculate late fee if applicable
    let lateFee = 0
    if (daysLate > logic.LATE_FEE_CONSTANTS.GRACE_PERIOD_DAYS) {
      lateFee = logic.calculateLateFee(inst, paymentDate)
      inst.lateFee = lateFee
      inst.totalAmount += lateFee
    }

    // Determine if partial payment
    const isPartial = Math.random() < partialPaymentRate
    const paidAmount = isPartial
      ? Math.round(inst.totalAmount * randomFloat(0.5, 0.9) * 100) / 100
      : inst.totalAmount

    // Apply payment
    const breakdown = logic.applyPayment({ amount: paidAmount }, inst)

    inst.status = paidAmount >= inst.totalAmount ? 'PAID' : 'PARTIALLY_PAID'
    inst.isPaidOnTime = daysLate === 0
    inst.daysLate = daysLate
    inst.paymentDate = logic.formatDate(paymentDate)
    inst.paymentMethod = randomPick(paymentMethods)
    inst.paymentReference = `${inst.paymentMethod === 'JWALLET' ? 'JW' : inst.paymentMethod === 'CREDIT_CARD' ? 'CC' : 'BA'}${Date.now()}${randomBetween(1000, 9999)}`

    inst.paidAmount = paidAmount
    inst.paidPrincipal = breakdown.principal
    inst.paidInterest = breakdown.interest
    inst.paidLateFee = breakdown.lateFee
    inst.remainingAmount = Math.max(0, inst.totalAmount - paidAmount)

    updated.push(inst)
  }

  return updated
}

// ============================================
// Transaction History Generator
// ============================================

/**
 * Generate payment transactions from installments
 * @param {Array} installments - Installments with payment data
 * @param {string} loanId - Loan ID
 * @param {string} userId - User ID
 * @returns {Array} Transaction records
 */
export function generateTransactions(installments, loanId, userId) {
  const transactions = []

  for (const inst of installments) {
    if (inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID') {
      const transaction = {
        transactionId: logic.generateTransactionId(),
        userId,
        loanId,
        installmentId: inst.installmentId,

        // Transaction details
        type: inst.status === 'PARTIALLY_PAID' ? 'PARTIAL_PAYMENT' : 'PAYMENT',
        amount: inst.paidAmount,

        // Breakdown
        appliedToPrincipal: inst.paidPrincipal,
        appliedToInterest: inst.paidInterest,
        appliedToLateFee: inst.paidLateFee,
        appliedToOtherFees: 0,

        // Payment method
        paymentMethod: inst.paymentMethod,
        paymentProvider: inst.paymentMethod === 'JWALLET' ? 'JWallet' : inst.paymentMethod === 'CREDIT_CARD' ? 'Bank Processor' : 'Bank Transfer',

        // Status
        status: 'COMPLETED',
        referenceNo: inst.paymentReference,
        externalReference: null,

        // Reversal tracking
        isReversed: false,
        reversalDate: null,
        reversalReason: null,
        reversalTransactionId: null,

        // Metadata
        ipAddress: `180.${randomBetween(1, 255)}.${randomBetween(1, 255)}.${randomBetween(1, 255)}`, // Thai IP range
        userAgent: randomPick([
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/96.0.4664.45 Mobile',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/96.0.4664.110',
        ]),
        location: randomPick(['Bangkok, Thailand', 'Chiang Mai, Thailand', 'Phuket, Thailand', 'Pattaya, Thailand']),

        // Timestamps
        initiatedAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:${randomBetween(10, 59)}Z`,
        completedAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:${randomBetween(10, 59)}Z`,
        createdAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:${randomBetween(10, 59)}Z`,
        updatedAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:${randomBetween(10, 59)}Z`,
      }

      transactions.push(transaction)
    }
  }

  return transactions
}

// ============================================
// Loan Metrics Calculator
// ============================================

/**
 * Calculate loan metrics from installments and transactions
 * @param {Object} loanConfig - Initial loan configuration
 * @param {Array} installments - Installment schedule with payments
 * @param {Array} transactions - Payment transactions
 * @returns {Object} Calculated metrics
 */
export function calculateLoanMetrics(loanConfig, installments, transactions = []) {
  const paidInstallments = installments.filter((i) => i.status === 'PAID')
  const overdueInstallments = installments.filter((i) => i.status === 'OVERDUE')

  // Total paid amounts
  const totalPaid = paidInstallments.reduce((sum, i) => sum + i.paidAmount, 0)
  const totalPrincipalPaid = paidInstallments.reduce((sum, i) => sum + i.paidPrincipal, 0)
  const totalInterestPaid = paidInstallments.reduce((sum, i) => sum + i.paidInterest, 0)
  const totalFeesPaid = paidInstallments.reduce((sum, i) => sum + i.paidLateFee, 0)

  // Total late fees (including unpaid)
  const totalLateFees = installments.reduce((sum, i) => sum + i.lateFee, 0)

  // Remaining amounts
  const remainingPrincipal = loanConfig.principalAmount - totalPrincipalPaid
  const unpaidInstallments = installments.filter((i) => i.status !== 'PAID' && i.status !== 'UPCOMING')
  const remainingInterest = unpaidInstallments.reduce((sum, i) => sum + i.interestAmount, 0)

  // Days overdue
  let daysOverdue = 0
  const overdueInst = installments.find((i) => i.status === 'OVERDUE' || i.status === 'PENDING')
  if (overdueInst && overdueInst.status === 'OVERDUE') {
    daysOverdue = logic.daysBetween(overdueInst.dueDate, new Date())
  }

  // Consecutive late payments
  let consecutiveLate = 0
  for (let i = installments.length - 1; i >= 0; i--) {
    if (installments[i].status === 'PAID' && !installments[i].isPaidOnTime) {
      consecutiveLate++
    } else if (installments[i].status === 'PAID') {
      break
    }
  }

  // Total late payments count
  const totalLatePayments = installments.filter(
    (i) => (i.status === 'PAID' || i.status === 'PARTIALLY_PAID') && !i.isPaidOnTime
  ).length

  // Payment success rate
  const totalPaidCount = paidInstallments.length
  const onTimePaidCount = paidInstallments.filter((i) => i.isPaidOnTime).length
  const paymentSuccessRate = totalPaidCount > 0 ? (onTimePaidCount / totalPaidCount) * 100 : 100

  // Next due installment
  const nextDue = installments.find((i) => i.status === 'PENDING' || i.status === 'OVERDUE')

  return {
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalPrincipalPaid: Math.round(totalPrincipalPaid * 100) / 100,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalFeesPaid: Math.round(totalFeesPaid * 100) / 100,
    totalLateFees: Math.round(totalLateFees * 100) / 100,
    remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    remainingInterest: Math.round(remainingInterest * 100) / 100,
    totalRemaining: Math.round((remainingPrincipal + remainingInterest) * 100) / 100,
    paidInstallments: paidInstallments.length,
    daysOverdue,
    consecutiveLatePayments: consecutiveLate,
    totalLatePayments,
    paymentSuccessRate: Math.round(paymentSuccessRate * 10) / 10,
    nextDueDate: nextDue?.dueDate || null,
    nextDueAmount: nextDue?.totalAmount || 0,
    lastPaymentDate: paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1].paymentDate : null,
    lastPaymentAmount: paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1].paidAmount : 0,
  }
}

// ============================================
// Audit Event Generator
// ============================================

/**
 * Generate audit events for a loan lifecycle
 * @param {Object} loan - Loan object
 * @param {Array} installments - Installments with payment history
 * @returns {Array} Audit events
 */
export function generateAuditEvents(loan, installments = []) {
  const events = []

  // Application submitted
  if (loan.applicationDate) {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'Loan application submitted',
      oldValue: null,
      newValue: 'APPLIED',
      metadata: {
        amountRequested: loan.principalAmount,
        term: loan.totalInstallments,
      },
      actorId: loan.userId,
      actorType: 'USER',
      occurredAt: `${loan.applicationDate}T10:00:00Z`,
      createdAt: `${loan.applicationDate}T10:00:00Z`,
    })
  }

  // Approval
  if (loan.approvalDate) {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'Loan application approved',
      oldValue: 'APPLIED',
      newValue: 'APPROVED',
      metadata: {
        approvedAmount: loan.principalAmount,
        interestRate: loan.interestRate,
      },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: `${loan.approvalDate}T14:30:00Z`,
      createdAt: `${loan.approvalDate}T14:30:00Z`,
    })
  }

  // Disbursement
  if (loan.disbursementDate) {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'Loan disbursed to user wallet',
      oldValue: 'APPROVED',
      newValue: 'ACTIVE',
      metadata: {
        disbursementAmount: loan.disbursedAmount || loan.principalAmount,
        disbursementMethod: 'WALLET_TRANSFER',
      },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: `${loan.disbursementDate}T10:00:00Z`,
      createdAt: `${loan.disbursementDate}T10:00:00Z`,
    })
  }

  // Payments (limit to 5 most recent for brevity)
  const paidInstallments = installments.filter((i) => i.status === 'PAID').slice(-5)
  for (const inst of paidInstallments) {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'PAYMENT',
      eventCategory: 'INSTALLMENT',
      description: `Installment #${inst.installmentNo} paid`,
      oldValue: 'PENDING',
      newValue: 'PAID',
      metadata: {
        installmentNo: inst.installmentNo,
        amount: inst.paidAmount,
        method: inst.paymentMethod,
        reference: inst.paymentReference,
        isOnTime: inst.isPaidOnTime,
      },
      actorId: loan.userId,
      actorType: 'USER',
      occurredAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:00Z`,
      createdAt: `${inst.paymentDate}T${randomBetween(9, 17)}:${randomBetween(10, 59)}:00Z`,
    })
  }

  // Modification (if applicable)
  if (loan.isModified && loan.modificationDate) {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'MODIFICATION',
      eventCategory: 'LOAN',
      description: 'Loan terms modified',
      oldValue: JSON.stringify({
        term: loan.originalTerm,
        monthlyPayment: loan.originalMonthlyPayment,
      }),
      newValue: JSON.stringify({
        term: loan.currentTerm,
        monthlyPayment: loan.monthlyPayment,
      }),
      metadata: {
        reason: loan.modificationReason,
        originalTerm: loan.originalTerm,
        newTerm: loan.currentTerm,
      },
      actorId: 'ADMIN_001',
      actorType: 'ADMIN',
      occurredAt: `${loan.modificationDate}T15:00:00Z`,
      createdAt: `${loan.modificationDate}T15:00:00Z`,
    })
  }

  // Suspension (if applicable)
  if (loan.accountStatus === 'SUSPENDED' || loan.accountStatus === 'FROZEN') {
    events.push({
      eventId: logic.generateId('EVT'),
      userId: loan.userId,
      loanId: loan.loanId,
      eventType: 'SUSPENSION',
      eventCategory: 'ACCOUNT',
      description: `Account ${loan.accountStatus.toLowerCase()}`,
      oldValue: 'ACTIVE',
      newValue: loan.accountStatus,
      metadata: {
        reason: loan.suspensionReason,
        daysOverdue: loan.daysOverdue,
      },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
  }

  return events
}

export default {
  randomBetween,
  randomFloat,
  randomPick,
  shuffle,
  generateInstallmentSchedule,
  applyPaymentBehavior,
  generateTransactions,
  calculateLoanMetrics,
  generateAuditEvents,
}
