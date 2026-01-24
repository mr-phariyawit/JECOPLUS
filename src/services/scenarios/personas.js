/**
 * User Personas - 10 Realistic Borrower Profiles
 * Complete user profiles with financial history and behavior patterns
 */

import * as builder from './scenarioBuilder'
import * as logic from './businessLogic'

/**
 * Persona 1: Perfect Borrower (ทดลอง สมบูรณ์) ⭐
 * - Age 35, Salaried Employee, 50,000 THB/month
 * - Credit Score: 820 (Excellent)
 * - 2 Active Loans (Personal 200K, Phone 30K)
 * - Payment Behavior: 100% on-time for 18 months
 * - Features: Auto-payment, premium offers, perfect payment history
 */
export function createPerfectBorrower() {
  const now = new Date()
  const userId = 'USR_PERFECT_001'

  // User Profile
  const user = {
    userId,
    firstName: 'ทดลอง',
    lastName: 'สมบูรณ์',
    email: 'perfect.borrower@jeco.test',
    phoneNumber: '0812345001',
    dateOfBirth: '1988-03-15',
    age: 35,
    occupation: 'พนักงานประจำ',
    employer: 'บริษัท ABC จำกัด',
    monthlyIncome: 50000,

    // Credit Info
    creditScore: 820,
    creditRating: 'EXCELLENT',

    // Account Status
    accountStatus: 'ACTIVE',
    accountCreatedAt: '2023-01-10T08:30:00+07:00',
    kycStatus: 'VERIFIED',

    // Risk Profile
    riskLevel: 'VERY_LOW',
    debtToIncomeRatio: 0.32, // 16,000 / 50,000

    // Preferences
    autoPaymentEnabled: true,
    notificationsEnabled: true,
    preferredPaymentMethod: 'JWALLET',
  }

  // Loan 1: Personal Loan (200K, 18 months ago, 24 months term)
  const loan1StartDate = logic.addMonths(now, -18) // Started 18 months ago
  const loan1 = {
    loanId: 'LOAN_PERFECT_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2023010001',

    // Financial Details
    principalAmount: 200000,
    disbursedAmount: 200000,
    interestRate: 15.0, // % per year
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(200000, 15.0, 24),

    // Status
    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    // Dates
    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -15)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -10)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 24)),

    // Modification
    isModified: false,

    // Payment Behavior Metadata (for display)
    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  // Generate installments for Loan 1 (18 months of perfect payments)
  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 24,
    paymentDay: 5, // Pay on 5th of each month
  })

  // Apply perfect payment behavior (100% on-time, current = 18 paid, 6 upcoming)
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 1.0, // 100% on-time
    lateDaysRange: [0, 0], // Never late
    partialPaymentRate: 0, // No partial payments
    missedPaymentIndices: [], // Never missed
    currentInstallmentIndex: 18, // 18 paid, 6 remaining
  }, loan1)

  // Generate transactions from paid installments
  const loan1Transactions = builder.generateTransactions(loan1InstallmentsPaid, loan1.loanId, userId)

  // Calculate loan metrics
  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  // Loan 2: Phone Loan (30K, 12 months ago, 18 months term)
  const loan2StartDate = logic.addMonths(now, -12)
  const loan2 = {
    loanId: 'LOAN_PERFECT_002',
    userId,
    productId: 'PROD_PHONE_001',
    productName: 'สินเชื่อมือถือ JeCO Phone',
    contractNo: 'CONT2023060001',

    principalAmount: 30000,
    disbursedAmount: 30000,
    interestRate: 12.0,
    originalTerm: 18,
    currentTerm: 18,
    monthlyPayment: logic.calculateMonthlyPayment(30000, 12.0, 18),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan2StartDate, -7)),
    approvalDate: logic.formatDate(logic.addDays(loan2StartDate, -3)),
    disbursementDate: logic.formatDate(loan2StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan2StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan2StartDate, 18)),

    isModified: false,

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan2Installments = builder.generateInstallmentSchedule(loan2, {
    startDate: loan2.firstDueDate,
    termMonths: 18,
    paymentDay: 5,
  })

  const loan2InstallmentsPaid = builder.applyPaymentBehavior(loan2Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 12, // 12 paid, 6 remaining
  }, loan2)

  const loan2Transactions = builder.generateTransactions(loan2InstallmentsPaid, loan2.loanId, userId)

  const loan2Metrics = builder.calculateLoanMetrics(loan2, loan2InstallmentsPaid)
  Object.assign(loan2, loan2Metrics)

  // Combine all data
  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
    [loan2.loanId]: loan2InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
    [loan2.loanId]: loan2Transactions,
  }

  // No late fees (perfect borrower!)
  const lateFees = {
    [loan1.loanId]: [],
    [loan2.loanId]: [],
  }

  // Generate audit events
  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    ...builder.generateAuditEvents(loan2, loan2InstallmentsPaid),
  ]

  // Notifications (positive messages for perfect borrower)
  const notifications = [
    {
      id: 'NOTIF_PERFECT_001',
      userId,
      type: 'ACHIEVEMENT',
      title: 'คุณเป็นลูกค้าตัวอย่าง! 🌟',
      message: 'ชำระตรงเวลาต่อเนื่อง 18 งวด รับส่วนลด 0.5% ในงวดถัดไป',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -2)),
      priority: 'LOW',
    },
    {
      id: 'NOTIF_PERFECT_002',
      userId,
      type: 'PROMOTION',
      title: 'สิทธิพิเศษสำหรับคุณ',
      message: 'ได้รับอนุมัติวงเงินเพิ่มสูงสุด 500,000 บาท อัตราดอกเบี้ยพิเศษ 12%',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -5)),
      priority: 'MEDIUM',
    },
    {
      id: 'NOTIF_PERFECT_003',
      userId,
      type: 'PAYMENT_REMINDER',
      title: 'การชำระอัตโนมัติสำเร็จ',
      message: 'ระบบหักชำระสำเร็จ 9,566 บาท จาก JWallet',
      isRead: true,
      createdAt: logic.formatDate(logic.addDays(now, -25)),
      priority: 'LOW',
    },
  ]

  return {
    metadata: {
      scenarioId: 'PERFECT_BORROWER',
      scenarioName: 'ผู้กู้ที่สมบูรณ์แบบ',
      icon: '⭐',
      color: 'green',
      description: 'พนักงานประจำ 35 ปี ชำระตรงเวลา 100% เป็นเวลา 18 เดือน มี 2 สินเชื่อ ไม่มีค่าปรับ มี Auto-payment',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2],
    },
    user,
    loans: [loan1, loan2],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 2: Early Repayment Champion (วิทย์ รวดเร็ว) 🚀
 * - Age 42, Business Owner, 80,000 THB/month
 * - Credit Score: 785
 * - Loans: 1 paid off early (saved 8,450 THB), 1 active
 * - Features: Early repayment breakdown, savings calculator, premium status
 */
export function createEarlyRepaymentChampion() {
  const now = new Date()
  const userId = 'USR_EARLY_001'

  const user = {
    userId,
    firstName: 'วิทย์',
    lastName: 'รวดเร็ว',
    email: 'early.champion@jeco.test',
    phoneNumber: '0812345002',
    dateOfBirth: '1981-07-22',
    age: 42,
    occupation: 'เจ้าของธุรกิจ',
    employer: 'ธุรกิจส่วนตัว - ร้านค้าออนไลน์',
    monthlyIncome: 80000,

    creditScore: 785,
    creditRating: 'VERY_GOOD',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2022-06-15T10:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'LOW',
    debtToIncomeRatio: 0.18, // 14,200 / 80,000

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'BANK_ACCOUNT',
  }

  // Loan 1: PAID OFF EARLY (300K loan, started 24 months ago, paid off at month 16)
  const loan1StartDate = logic.addMonths(now, -24)
  const loan1PaidOffDate = logic.addMonths(now, -8) // Paid off 8 months ago (16 months into 24-month term)

  const loan1 = {
    loanId: 'LOAN_EARLY_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2022060001',

    principalAmount: 300000,
    disbursedAmount: 300000,
    interestRate: 16.0,
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(300000, 16.0, 24),

    status: 'PAID_OFF',
    accountStatus: 'CLOSED',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -12)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -5)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 24)),
    closedDate: logic.formatDate(loan1PaidOffDate),

    isModified: false,
    isEarlyRepayment: true,
    earlyRepaymentDate: logic.formatDate(loan1PaidOffDate),
    earlyRepaymentSavings: 8450, // Saved interest

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,

    // All paid off
    remainingPrincipal: 0,
    remainingInterest: 0,
    totalRemaining: 0,
    totalPaid: 300000 + 31000, // Principal + interest paid (16 months)
    totalInstallments: 24,
    paidInstallments: 16, // Paid 16 regular + 1 early repayment
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 24,
    paymentDay: 10,
  })

  // Mark first 16 as paid (all on-time)
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 16, // Paid 16 out of 24
  }, loan1)

  // Mark remaining 8 installments as WAIVED (early repayment)
  const loan1InstallmentsFinal = loan1InstallmentsPaid.map((inst, index) => {
    if (index >= 16) {
      return { ...inst, status: 'WAIVED', waivedDate: loan1PaidOffDate, waiverReason: 'EARLY_REPAYMENT' }
    }
    return inst
  })

  const loan1Transactions = builder.generateTransactions(loan1InstallmentsFinal, loan1.loanId, userId)

  // Add early repayment transaction
  loan1Transactions.push({
    transactionId: logic.generateTransactionId(),
    userId,
    loanId: loan1.loanId,
    installmentId: null,
    type: 'EARLY_REPAYMENT',
    amount: 131000, // Remaining principal + discounted interest
    appliedToPrincipal: 120000,
    appliedToInterest: 11000,
    appliedToLateFee: 0,
    appliedToOtherFees: 0,
    paymentMethod: 'BANK_ACCOUNT',
    paymentProvider: 'Bangkok Bank',
    status: 'COMPLETED',
    referenceNo: `EARLY${Date.now()}`,
    externalReference: 'BB2024051500123',
    isReversed: false,
    ipAddress: '180.183.100.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Bangkok, Thailand',
    initiatedAt: logic.formatDate(loan1PaidOffDate),
    completedAt: logic.formatDate(loan1PaidOffDate),
    createdAt: logic.formatDate(loan1PaidOffDate),
    updatedAt: logic.formatDate(loan1PaidOffDate),
  })

  // Loan 2: Active Business Loan (250K, started 10 months ago)
  const loan2StartDate = logic.addMonths(now, -10)
  const loan2 = {
    loanId: 'LOAN_EARLY_002',
    userId,
    productId: 'PROD_BUSINESS_001',
    productName: 'สินเชื่อธุรกิจ JeCO Business',
    contractNo: 'CONT2024020001',

    principalAmount: 250000,
    disbursedAmount: 250000,
    interestRate: 14.0,
    originalTerm: 18,
    currentTerm: 18,
    monthlyPayment: logic.calculateMonthlyPayment(250000, 14.0, 18),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan2StartDate, -10)),
    approvalDate: logic.formatDate(logic.addDays(loan2StartDate, -4)),
    disbursementDate: logic.formatDate(loan2StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan2StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan2StartDate, 18)),

    isModified: false,

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan2Installments = builder.generateInstallmentSchedule(loan2, {
    startDate: loan2.firstDueDate,
    termMonths: 18,
    paymentDay: 10,
  })

  const loan2InstallmentsPaid = builder.applyPaymentBehavior(loan2Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 10, // 10 paid, 8 remaining
  }, loan2)

  const loan2Transactions = builder.generateTransactions(loan2InstallmentsPaid, loan2.loanId, userId)

  const loan2Metrics = builder.calculateLoanMetrics(loan2, loan2InstallmentsPaid)
  Object.assign(loan2, loan2Metrics)

  const installments = {
    [loan1.loanId]: loan1InstallmentsFinal,
    [loan2.loanId]: loan2InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
    [loan2.loanId]: loan2Transactions,
  }

  const lateFees = {
    [loan1.loanId]: [],
    [loan2.loanId]: [],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsFinal),
    ...builder.generateAuditEvents(loan2, loan2InstallmentsPaid),
    // Add early repayment event
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'EARLY_REPAYMENT',
      eventCategory: 'PAYMENT',
      description: 'ชำระปิดบัญชีก่อนกำหนด ประหยัดดอกเบี้ย 8,450 บาท',
      oldValue: JSON.stringify({ status: 'ACTIVE', remainingInstallments: 8 }),
      newValue: JSON.stringify({ status: 'PAID_OFF', savings: 8450 }),
      metadata: { savingsAmount: 8450, remainingTerm: 8 },
      actorId: userId,
      actorType: 'USER',
      occurredAt: logic.formatDate(loan1PaidOffDate),
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_EARLY_001',
      userId,
      type: 'ACHIEVEMENT',
      title: 'ชำระปิดบัญชีสำเร็จ! 🎉',
      message: 'คุณประหยัดดอกเบี้ย 8,450 บาท จากการชำระก่อนกำหนด',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(loan1PaidOffDate, 1)),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_EARLY_002',
      userId,
      type: 'PROMOTION',
      title: 'สิทธิพิเศษ Premium Status',
      message: 'รับวงเงินเพิ่ม 1,000,000 บาท อัตราดอกเบี้ย 11% สำหรับธุรกิจ',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -3)),
      priority: 'MEDIUM',
    },
  ]

  return {
    metadata: {
      scenarioId: 'EARLY_REPAYMENT',
      scenarioName: 'ผู้ชำระก่อนกำหนด',
      icon: '🚀',
      color: 'blue',
      description: 'เจ้าของธุรกิจ 42 ปี ชำระปิดสินเชื่อ 300K ก่อนกำหนด 8 เดือน ประหยัดดอกเบี้ย 8,450 บาท',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2],
    },
    user,
    loans: [loan1, loan2],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 3: Occasional Late Payer (สมชาย ล่าช้า) ⚠️
 * - Age 28, Contract Employee, 25,000 THB/month
 * - Credit Score: 650 (Fair)
 * - 1 Active Loan with payment issues
 * - Payment Behavior: 4 late payments (7-15 days late) in 12 months
 * - Late Fees: 800 THB, currently 5 days overdue
 * - Features: Late fee tracking, grace period, warning notifications
 */
export function createOccasionalLatePayer() {
  const now = new Date()
  const userId = 'USR_LATE_001'

  const user = {
    userId,
    firstName: 'สมชาย',
    lastName: 'ล่าช้า',
    email: 'occasional.late@jeco.test',
    phoneNumber: '0812345003',
    dateOfBirth: '1995-11-08',
    age: 28,
    occupation: 'พนักงานสัญญาจ้าง',
    employer: 'บริษัท XYZ จำกัด',
    monthlyIncome: 25000,

    creditScore: 650,
    creditRating: 'FAIR',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2023-03-20T14:30:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'MEDIUM',
    debtToIncomeRatio: 0.48, // 12,000 / 25,000

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'CREDIT_CARD',
  }

  // Loan 1: Personal Loan with late payment history
  const loan1StartDate = logic.addMonths(now, -14) // Started 14 months ago
  const loan1 = {
    loanId: 'LOAN_LATE_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2023030001',

    principalAmount: 180000,
    disbursedAmount: 180000,
    interestRate: 18.0, // Higher rate due to risk
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(180000, 18.0, 24),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -18)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -8)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 24)),

    isModified: false,

    paymentSuccessRate: 70, // 70% on-time (10/14 paid, 4 late)
    totalLatePayments: 4,
    consecutiveLatePayments: 1, // Currently in late streak
    daysOverdue: 5, // Current installment is 5 days late
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 24,
    paymentDay: 15,
  })

  // Apply occasional late payment behavior
  // Installments: 0-13 should be processed (14 total), last one (13) is currently 5 days overdue
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 0.70, // 70% on-time, 30% late
    lateDaysRange: [7, 15], // 7-15 days late when late
    partialPaymentRate: 0, // No partial payments
    missedPaymentIndices: [], // No missed payments
    overduePaymentIndices: [13], // Installment 13 (index 13) is currently overdue by 5 days
    currentInstallmentIndex: 14, // 14 installments due (0-13), last one overdue
  }, loan1)

  // Manually set the last installment (index 13) to be 5 days overdue
  const currentDueDate = new Date(loan1InstallmentsPaid[13].dueDate)
  const overdueDate = logic.addDays(currentDueDate, 5) // 5 days past due
  loan1InstallmentsPaid[13] = {
    ...loan1InstallmentsPaid[13],
    status: 'OVERDUE',
    daysLate: 5,
    isPaidOnTime: false,
    paymentDate: null,
    paidAmount: 0,
  }

  // Calculate late fee for the overdue installment (5 days overdue)
  // Grace period is 5 days, so 5 days overdue = 0 days past grace = no late fee yet
  // But let's say this is day 10 past due date (5 days into late fee territory)
  const overdueInstallment = loan1InstallmentsPaid[13]
  const lateFeeAmount = logic.calculateLateFee(overdueInstallment, logic.formatDate(overdueDate))

  const loan1Transactions = builder.generateTransactions(
    loan1InstallmentsPaid.filter(inst => inst.status === 'PAID'),
    loan1.loanId,
    userId
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  // Late fees (from previous late payments)
  const lateFees = {
    [loan1.loanId]: [
      {
        lateFeeId: 'LATE_FEE_001',
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[3].installmentId, // Installment 4 was 10 days late
        baseFee: 200,
        daysLate: 5, // 10 days past due - 5 days grace
        calculatedFee: 1000, // 200 * 5
        cappedFee: 1000,
        appliedFee: 1000,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[3].dueDate), 10)),
      },
      {
        lateFeeId: 'LATE_FEE_002',
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[7].installmentId, // Installment 8 was 12 days late
        baseFee: 200,
        daysLate: 7, // 12 - 5 grace
        calculatedFee: 1000, // Capped at 5x
        cappedFee: 1000,
        appliedFee: 600, // Waived 400 as goodwill
        status: 'APPLIED',
        isWaived: false,
        waivedAmount: 400,
        waiverReason: 'GOODWILL_GESTURE',
        assessedDate: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[7].dueDate), 12)),
      },
      {
        lateFeeId: 'LATE_FEE_003',
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[11].installmentId, // Installment 12 was 8 days late
        baseFee: 200,
        daysLate: 3, // 8 - 5 grace
        calculatedFee: 600,
        cappedFee: 600,
        appliedFee: 600,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[11].dueDate), 8)),
      },
      {
        lateFeeId: 'LATE_FEE_004',
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[13].installmentId, // Current overdue installment
        baseFee: 200,
        daysLate: 0, // Still in grace period (day 5 of 5-day grace)
        calculatedFee: 0,
        cappedFee: 0,
        appliedFee: 0,
        status: 'PENDING',
        isWaived: false,
        assessedDate: logic.formatDate(now),
      },
    ],
  }

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
  }

  const events = builder.generateAuditEvents(loan1, loan1InstallmentsPaid)

  // Add late payment events
  events.push(
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'LATE_FEE',
      eventCategory: 'FEE',
      description: 'ค่าปรับชำระล่าช้า 1,000 บาท (งวดที่ 4)',
      oldValue: null,
      newValue: JSON.stringify({ amount: 1000, daysLate: 5 }),
      metadata: { installmentNo: 4, daysLate: 5 },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[3].dueDate), 10)),
    },
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'LATE_FEE',
      eventCategory: 'FEE',
      description: 'ค่าปรับชำระล่าช้า 600 บาท (ลดจาก 1,000) งวดที่ 8',
      oldValue: null,
      newValue: JSON.stringify({ amount: 600, daysLate: 7, waived: 400 }),
      metadata: { installmentNo: 8, daysLate: 7, waivedAmount: 400 },
      actorId: 'ADMIN_001',
      actorType: 'ADMIN',
      occurredAt: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[7].dueDate), 12)),
    }
  )

  const notifications = [
    {
      id: 'NOTIF_LATE_001',
      userId,
      type: 'WARNING',
      title: 'ค้างชำระ 5 วัน ⚠️',
      message: 'งวดที่ 14 ครบกำหนด 15 ม.ค. 2026 (เหลือ grace period 0 วัน) จำนวน 9,566 บาท',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -1)),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_LATE_002',
      userId,
      type: 'INFO',
      title: 'ยกเว้นค่าปรับบางส่วน',
      message: 'เราลดค่าปรับ 400 บาท จาก 1,000 เป็น 600 บาท ขอให้ชำระตรงเวลาในครั้งต่อไป',
      isRead: true,
      createdAt: logic.formatDate(logic.addMonths(now, -2)),
      priority: 'MEDIUM',
    },
    {
      id: 'NOTIF_LATE_003',
      userId,
      type: 'PAYMENT_REMINDER',
      title: 'เตือนชำระงวดถัดไป',
      message: 'งวดที่ 15 ครบกำหนด 15 ก.พ. 2026 จำนวน 9,566 บาท',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -7)),
      priority: 'MEDIUM',
    },
  ]

  return {
    metadata: {
      scenarioId: 'OCCASIONAL_LATE',
      scenarioName: 'ผู้ชำระช้าบางครั้ง',
      icon: '⚠️',
      color: 'yellow',
      description: 'พนักงานสัญญาจ้าง 28 ปี มีประวัติชำระล่าช้า 4 ครั้งใน 14 เดือน ค่าปรับสะสม 2,200 บาท ปัจจุบันค้าง 5 วัน',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1],
    },
    user,
    loans: [loan1],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 4: Financially Struggling (นางสาว ลำบาก) 😰
 * - Age 31, Freelancer, 18,000-30,000 THB/month (inconsistent)
 * - Credit Score: 580 (Poor)
 * - 2 Active Loans with payment issues
 * - Payment Behavior: Multiple late payments, 2 partial payments
 * - Overdue: 45 days (loan 1), 10 days (loan 2)
 * - Late Fees: 1,600 THB accumulated
 * - Features: Payment plan modification, financial counseling flags, partial payment tracking
 */
export function createFinanciallyStruggling() {
  const now = new Date()
  const userId = 'USR_STRUGGLING_001'

  const user = {
    userId,
    firstName: 'นางสาว ลำบาก',
    lastName: 'การเงิน',
    email: 'struggling@jeco.test',
    phoneNumber: '0812345004',
    dateOfBirth: '1992-05-14',
    age: 31,
    occupation: 'ฟรีแลนซ์',
    employer: 'อิสระ',
    monthlyIncome: 24000, // Variable: 18K-30K

    creditScore: 580,
    creditRating: 'POOR',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2022-08-10T09:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'HIGH',
    debtToIncomeRatio: 0.72, // 17,280 / 24,000

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'BANK_ACCOUNT',
  }

  // Loan 1: Personal Loan 150K - 45 days overdue
  const loan1StartDate = logic.addMonths(now, -16)
  const loan1 = {
    loanId: 'LOAN_STRUGGLING_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2022080001',

    principalAmount: 150000,
    disbursedAmount: 150000,
    interestRate: 20.0, // High risk rate
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(150000, 20.0, 24),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -20)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -10)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 24)),

    isModified: false,

    paymentSuccessRate: 50, // 50% on-time
    totalLatePayments: 8,
    consecutiveLatePayments: 3,
    daysOverdue: 45,
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 24,
    paymentDay: 20,
  })

  // Apply struggling payment behavior
  // 16 installments due, 13 paid (some late, 2 partial), 3 overdue (including current which is 45 days late)
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 0.50,
    lateDaysRange: [10, 30],
    partialPaymentRate: 0.15, // 15% chance of partial payment
    missedPaymentIndices: [],
    overduePaymentIndices: [13, 14, 15], // Last 3 installments overdue
    currentInstallmentIndex: 16,
  }, loan1)

  // Manually set the oldest overdue installment to 45 days
  loan1InstallmentsPaid[13] = {
    ...loan1InstallmentsPaid[13],
    status: 'OVERDUE',
    daysLate: 45,
    isPaidOnTime: false,
    paymentDate: null,
    paidAmount: 0,
  }

  // Set the second overdue to 30 days
  loan1InstallmentsPaid[14] = {
    ...loan1InstallmentsPaid[14],
    status: 'OVERDUE',
    daysLate: 30,
    isPaidOnTime: false,
    paymentDate: null,
    paidAmount: 0,
  }

  // Set the third overdue to 10 days
  loan1InstallmentsPaid[15] = {
    ...loan1InstallmentsPaid[15],
    status: 'OVERDUE',
    daysLate: 10,
    isPaidOnTime: false,
    paymentDate: null,
    paidAmount: 0,
  }

  const loan1Transactions = builder.generateTransactions(
    loan1InstallmentsPaid.filter(inst => inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID'),
    loan1.loanId,
    userId
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  // Loan 2: Phone Loan 40K - 10 days overdue
  const loan2StartDate = logic.addMonths(now, -8)
  const loan2 = {
    loanId: 'LOAN_STRUGGLING_002',
    userId,
    productId: 'PROD_PHONE_001',
    productName: 'สินเชื่อมือถือ JeCO Phone',
    contractNo: 'CONT2023040001',

    principalAmount: 40000,
    disbursedAmount: 40000,
    interestRate: 16.0,
    originalTerm: 12,
    currentTerm: 12,
    monthlyPayment: logic.calculateMonthlyPayment(40000, 16.0, 12),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan2StartDate, -8)),
    approvalDate: logic.formatDate(logic.addDays(loan2StartDate, -3)),
    disbursementDate: logic.formatDate(loan2StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan2StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan2StartDate, 12)),

    isModified: false,

    paymentSuccessRate: 62,
    totalLatePayments: 3,
    consecutiveLatePayments: 1,
    daysOverdue: 10,
  }

  const loan2Installments = builder.generateInstallmentSchedule(loan2, {
    startDate: loan2.firstDueDate,
    termMonths: 12,
    paymentDay: 20,
  })

  const loan2InstallmentsPaid = builder.applyPaymentBehavior(loan2Installments, {
    onTimeRate: 0.62,
    lateDaysRange: [8, 20],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    overduePaymentIndices: [7], // Current installment 10 days overdue
    currentInstallmentIndex: 8,
  }, loan2)

  // Manually set overdue
  loan2InstallmentsPaid[7] = {
    ...loan2InstallmentsPaid[7],
    status: 'OVERDUE',
    daysLate: 10,
    isPaidOnTime: false,
    paymentDate: null,
    paidAmount: 0,
  }

  const loan2Transactions = builder.generateTransactions(
    loan2InstallmentsPaid.filter(inst => inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID'),
    loan2.loanId,
    userId
  )

  const loan2Metrics = builder.calculateLoanMetrics(loan2, loan2InstallmentsPaid)
  Object.assign(loan2, loan2Metrics)

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
    [loan2.loanId]: loan2InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
    [loan2.loanId]: loan2Transactions,
  }

  // Accumulated late fees
  const lateFees = {
    [loan1.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[13].installmentId,
        baseFee: 200,
        daysLate: 40, // 45 days overdue - 5 grace
        calculatedFee: 1000, // Capped at 5x
        cappedFee: 1000,
        appliedFee: 1000,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addDays(now, -5)),
      },
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[14].installmentId,
        baseFee: 200,
        daysLate: 25, // 30 - 5 grace
        calculatedFee: 1000, // Capped
        cappedFee: 1000,
        appliedFee: 1000,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addDays(now, -20)),
      },
    ],
    [loan2.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan2.loanId,
        installmentId: loan2InstallmentsPaid[7].installmentId,
        baseFee: 200,
        daysLate: 5, // 10 - 5 grace
        calculatedFee: 1000,
        cappedFee: 1000,
        appliedFee: 1000,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(now),
      },
    ],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    ...builder.generateAuditEvents(loan2, loan2InstallmentsPaid),
    // Financial counseling flag
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: null,
      eventType: 'NOTE',
      eventCategory: 'ACCOUNT',
      description: 'ระบบแนะนำปรึกษาที่ปรึกษาทางการเงิน',
      oldValue: null,
      newValue: 'COUNSELING_RECOMMENDED',
      metadata: { reason: 'MULTIPLE_LATE_PAYMENTS', totalOverdue: 3 },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(logic.addDays(now, -10)),
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_STRUGGLING_001',
      userId,
      type: 'CRITICAL',
      title: 'ค้างชำระ 45 วัน - อาจส่งติดตาม 🚨',
      message: 'สินเชื่อ 150,000 บาท ค้างชำระ 3 งวด มูลค่า 27,000 บาท กรุณาติดต่อเจ้าหน้าที่',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -1)),
      priority: 'CRITICAL',
    },
    {
      id: 'NOTIF_STRUGGLING_002',
      userId,
      type: 'INFO',
      title: 'แผนผ่อนชำระพิเศษ',
      message: 'เรามีแผนปรับโครงสร้างหนี้ ลดงวดละ 30% ขยายเวลา 12 เดือน',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -5)),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_STRUGGLING_003',
      userId,
      type: 'WARNING',
      title: 'ค้างชำระสินเชื่อมือถือ',
      message: 'งวดที่ 8 ค้าง 10 วัน จำนวน 3,566 บาท + ค่าปรับ 1,000 บาท',
      isRead: false,
      createdAt: logic.formatDate(now),
      priority: 'HIGH',
    },
  ]

  return {
    metadata: {
      scenarioId: 'STRUGGLING',
      scenarioName: 'ผู้ประสบปัญหาการเงิน',
      icon: '😰',
      color: 'orange',
      description: 'ฟรีแลนซ์ 31 ปี รายได้ไม่แน่นอน มีสินเชื่อ 2 รายการ ค้าง 45 วัน และ 10 วัน ค่าปรับสะสม 3,000 บาท',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2],
    },
    user,
    loans: [loan1, loan2],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 5: Debt in Collections (ประยุทธ์ ค้างชำระ) 📞
 * - Age 39, Unemployed (recently), 0 THB/month
 * - Credit Score: 420 (Very Poor)
 * - 1 Loan sent to collections
 * - Overdue: 105 days, no payment for 90+ days
 * - Total Debt: 285,400 THB (principal + interest + late fees)
 * - Status: SUSPENDED, sent to collection agency Dec 15, 2024
 * - Features: Collection workflow, legal notice tracking, restructuring options
 */
export function createInCollection() {
  const now = new Date()
  const userId = 'USR_COLLECTION_001'

  const user = {
    userId,
    firstName: 'ประยุทธ์',
    lastName: 'ค้างชำระ',
    email: 'collection@jeco.test',
    phoneNumber: '0812345005',
    dateOfBirth: '1984-09-20',
    age: 39,
    occupation: 'ว่างงาน',
    employer: 'ไม่มี',
    monthlyIncome: 0,

    creditScore: 420,
    creditRating: 'VERY_POOR',

    accountStatus: 'SUSPENDED',
    suspensionDate: '2024-12-15',
    suspensionReason: 'OVERDUE_90_DAYS',
    accountCreatedAt: '2021-05-10T11:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'CRITICAL',
    debtToIncomeRatio: null, // No income

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: null,
  }

  // Loan 1: Personal Loan 250K - 105 days overdue, sent to collections
  const loan1StartDate = logic.addMonths(now, -18)
  const loan1 = {
    loanId: 'LOAN_COLLECTION_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2021050001',

    principalAmount: 250000,
    disbursedAmount: 250000,
    interestRate: 18.0,
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(250000, 18.0, 24),

    status: 'IN_COLLECTION',
    accountStatus: 'SUSPENDED',
    suspensionDate: '2024-12-15',
    suspensionReason: 'OVERDUE_90_DAYS',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -30)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -15)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 24)),

    isModified: false,

    paymentSuccessRate: 38, // Paid 7 out of 18 due
    totalLatePayments: 5,
    consecutiveLatePayments: 11, // Last 11 installments problematic
    daysOverdue: 105,

    // Collection info
    collectionAgency: 'ABC Collections Co., Ltd.',
    collectionStartDate: '2024-12-15',
    collectionStatus: 'IN_PROGRESS',
    collectionAttempts: 8,
    lastContactDate: logic.formatDate(logic.addDays(now, -3)),
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 24,
    paymentDay: 1,
  })

  // Apply collection scenario: paid first 7 (some late), then stopped paying
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 0.40,
    lateDaysRange: [15, 45],
    partialPaymentRate: 0,
    missedPaymentIndices: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // Missed last 11 payments
    currentInstallmentIndex: 18,
  }, loan1)

  // Mark missed payments as OVERDUE with varying days
  for (let i = 7; i < 18; i++) {
    const monthsOverdue = 18 - i
    const daysOverdue = Math.min(105, monthsOverdue * 30)
    loan1InstallmentsPaid[i] = {
      ...loan1InstallmentsPaid[i],
      status: 'OVERDUE',
      daysLate: daysOverdue,
      isPaidOnTime: false,
      paymentDate: null,
      paidAmount: 0,
    }
  }

  const loan1Transactions = builder.generateTransactions(
    loan1InstallmentsPaid.filter(inst => inst.status === 'PAID'),
    loan1.loanId,
    userId
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
  }

  // Maximum late fees (capped)
  const lateFeeRecords = []
  for (let i = 7; i < 18; i++) {
    lateFeeRecords.push({
      lateFeeId: logic.generateLateFeeId(),
      loanId: loan1.loanId,
      installmentId: loan1InstallmentsPaid[i].installmentId,
      baseFee: 200,
      daysLate: Math.min(loan1InstallmentsPaid[i].daysLate - 5, 5), // Cap calculation
      calculatedFee: 1000,
      cappedFee: 1000,
      appliedFee: 1000,
      status: 'APPLIED',
      isWaived: false,
      assessedDate: logic.formatDate(logic.addDays(new Date(loan1InstallmentsPaid[i].dueDate), 10)),
    })
  }

  const lateFees = {
    [loan1.loanId]: lateFeeRecords,
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    // Suspension event
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'ACCOUNT',
      description: 'บัญชีถูกระงับ - ค้างชำระเกิน 90 วัน',
      oldValue: 'ACTIVE',
      newValue: 'SUSPENDED',
      metadata: { daysOverdue: 90, unpaidInstallments: 11 },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: '2024-12-15T09:00:00Z',
    },
    // Sent to collections
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'COLLECTION',
      description: 'ส่งบริษัทเก็บหนี้ ABC Collections',
      oldValue: 'DEFAULTED',
      newValue: 'IN_COLLECTION',
      metadata: { agency: 'ABC Collections Co., Ltd.', totalDebt: 285400 },
      actorId: 'ADMIN_002',
      actorType: 'ADMIN',
      occurredAt: '2024-12-15T14:00:00Z',
    },
    // Legal notice
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'LEGAL',
      description: 'ส่งหนังสือแจ้งเตือนทางกฎหมายครั้งที่ 1',
      oldValue: null,
      newValue: 'LEGAL_NOTICE_SENT',
      metadata: { noticeType: 'FIRST_WARNING', deadline: '2025-01-15' },
      actorId: 'LEGAL_DEPT',
      actorType: 'ADMIN',
      occurredAt: '2024-12-20T10:00:00Z',
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_COLLECTION_001',
      userId,
      type: 'CRITICAL',
      title: 'บัญชีถูกระงับ 🚫',
      message: 'ค้างชำระเกิน 90 วัน บัญชีถูกส่งบริษัทเก็บหนี้ กรุณาติดต่อด่วน 02-xxx-xxxx',
      isRead: false,
      createdAt: '2024-12-15T09:30:00Z',
      priority: 'CRITICAL',
    },
    {
      id: 'NOTIF_COLLECTION_002',
      userId,
      type: 'LEGAL',
      title: 'หนังสือแจ้งเตือนทางกฎหมาย',
      message: 'หากไม่ชำระภายใน 15 ม.ค. 2025 จะดำเนินการทางกฎหมาย',
      isRead: false,
      createdAt: '2024-12-20T10:30:00Z',
      priority: 'CRITICAL',
    },
    {
      id: 'NOTIF_COLLECTION_003',
      userId,
      type: 'INFO',
      title: 'ตัวเลือกการปรับโครงสร้างหนี้',
      message: 'เราเสนอแผนปรับโครงสร้างพิเศษ ชำระ 40% ของหนี้คงค้าง ติดต่อ collection@jeco.com',
      isRead: false,
      createdAt: '2024-12-22T14:00:00Z',
      priority: 'HIGH',
    },
  ]

  return {
    metadata: {
      scenarioId: 'IN_COLLECTION',
      scenarioName: 'ถูกติดตาม',
      icon: '📞',
      color: 'red',
      description: 'ว่างงาน 39 ปี ค้างชำระ 105 วัน สินเชื่อ 250K ถูกส่งบริษัทเก็บหนี้ บัญชีระงับ',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1],
    },
    user,
    loans: [loan1],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}
/**
 * Persona 6: Fraud Detection Flagged (วิภา ผิดปกติ) 🚨
 * - Age 26, Employment unclear, 22,000 THB/month (claimed)
 * - Credit Score: 540 (suspended for investigation)
 * - 1 Active Loan, 1 Rejected
 * - Payment Behavior: Inconsistent, suspicious activity
 * - Red Flags:
 *   - 3 payment cancellations (insufficient funds)
 *   - Logged in from 3 countries in 24 hours
 *   - KYC documents mismatch
 * - Status: FROZEN (pending investigation)
 * - Features: Fraud flags, security holds, investigation timeline
 */
export function createFraudFlagged() {
  const now = new Date()
  const userId = 'USR_FRAUD_001'

  const user = {
    userId,
    firstName: 'วิภา',
    lastName: 'ผิดปกติ',
    email: 'fraud.flagged@jeco.test',
    phoneNumber: '0812345006',
    dateOfBirth: '1997-12-03',
    age: 26,
    occupation: 'พนักงานบริษัท (ไม่ระบุ)',
    employer: 'ไม่ระบุ',
    monthlyIncome: 22000,

    creditScore: 540,
    creditRating: 'POOR',

    accountStatus: 'FROZEN',
    frozenDate: logic.formatDate(logic.addDays(now, -7)),
    frozenReason: 'FRAUD_INVESTIGATION',
    accountCreatedAt: '2024-01-15T16:00:00+07:00',
    kycStatus: 'UNDER_REVIEW',
    kycIssues: ['DOCUMENT_MISMATCH', 'ADDRESS_VERIFICATION_FAILED'],

    riskLevel: 'CRITICAL',
    debtToIncomeRatio: 0.45,

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'CREDIT_CARD',

    // Fraud flags
    fraudFlags: [
      {
        flagId: 'FRAUD_001',
        type: 'PAYMENT_REVERSAL',
        severity: 'HIGH',
        description: 'ยกเลิกการชำระ 3 ครั้ง - เงินไม่พอ',
        detectedAt: logic.formatDate(logic.addDays(now, -14)),
        status: 'UNDER_INVESTIGATION',
      },
      {
        flagId: 'FRAUD_002',
        type: 'SUSPICIOUS_LOCATION',
        severity: 'CRITICAL',
        description: 'เข้าระบบจาก 3 ประเทศใน 24 ชั่วโมง (TH, US, UK)',
        detectedAt: logic.formatDate(logic.addDays(now, -10)),
        status: 'UNDER_INVESTIGATION',
      },
      {
        flagId: 'FRAUD_003',
        type: 'KYC_MISMATCH',
        severity: 'HIGH',
        description: 'เอกสาร KYC ไม่ตรงกัน - ที่อยู่และรูปถ่าย',
        detectedAt: logic.formatDate(logic.addDays(now, -7)),
        status: 'PENDING_VERIFICATION',
      },
    ],
  }

  // Loan 1: Phone Loan 35K - Active but flagged
  const loan1StartDate = logic.addMonths(now, -6)
  const loan1 = {
    loanId: 'LOAN_FRAUD_001',
    userId,
    productId: 'PROD_PHONE_001',
    productName: 'สินเชื่อมือถือ JeCO Phone',
    contractNo: 'CONT2024010001',

    principalAmount: 35000,
    disbursedAmount: 35000,
    interestRate: 18.0, // Higher rate due to risk
    originalTerm: 12,
    currentTerm: 12,
    monthlyPayment: logic.calculateMonthlyPayment(35000, 18.0, 12),

    status: 'ACTIVE',
    accountStatus: 'FROZEN',
    frozenDate: logic.formatDate(logic.addDays(now, -7)),

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -10)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -5)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 12)),

    isModified: false,

    paymentSuccessRate: 66, // Inconsistent
    totalLatePayments: 2,
    consecutiveLatePayments: 0,
    daysOverdue: 0,

    // Payment reversals
    paymentReversals: 3,
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 12,
    paymentDay: 25,
  })

  // 6 installments due, 4 paid (2 late, 1 reversed), current one frozen
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 0.66,
    lateDaysRange: [3, 8],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 6,
  }, loan1)

  const loan1Transactions = builder.generateTransactions(
    loan1InstallmentsPaid.filter(inst => inst.status === 'PAID'),
    loan1.loanId,
    userId
  )

  // Add payment reversal transactions
  loan1Transactions.push(
    {
      transactionId: logic.generateTransactionId(),
      userId,
      loanId: loan1.loanId,
      installmentId: loan1InstallmentsPaid[2].installmentId,
      type: 'REVERSAL',
      amount: loan1InstallmentsPaid[2].totalAmount,
      appliedToPrincipal: 0,
      appliedToInterest: 0,
      appliedToLateFee: 0,
      appliedToOtherFees: 0,
      paymentMethod: 'CREDIT_CARD',
      paymentProvider: 'Bank Processor',
      status: 'REVERSED',
      referenceNo: `REV${Date.now() - 1000000}`,
      externalReference: null,
      isReversed: true,
      reversalDate: logic.formatDate(logic.addDays(now, -20)),
      reversalReason: 'INSUFFICIENT_FUNDS',
      reversalTransactionId: logic.generateTransactionId(),
      ipAddress: '203.113.45.67',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
      location: 'Bangkok, Thailand',
      initiatedAt: logic.formatDate(logic.addDays(now, -22)),
      completedAt: logic.formatDate(logic.addDays(now, -22)),
      createdAt: logic.formatDate(logic.addDays(now, -22)),
      updatedAt: logic.formatDate(logic.addDays(now, -20)),
    },
    {
      transactionId: logic.generateTransactionId(),
      userId,
      loanId: loan1.loanId,
      installmentId: loan1InstallmentsPaid[3].installmentId,
      type: 'REVERSAL',
      amount: loan1InstallmentsPaid[3].totalAmount,
      appliedToPrincipal: 0,
      appliedToInterest: 0,
      appliedToLateFee: 0,
      appliedToOtherFees: 0,
      paymentMethod: 'CREDIT_CARD',
      paymentProvider: 'Bank Processor',
      status: 'REVERSED',
      referenceNo: `REV${Date.now() - 500000}`,
      externalReference: null,
      isReversed: true,
      reversalDate: logic.formatDate(logic.addDays(now, -14)),
      reversalReason: 'INSUFFICIENT_FUNDS',
      reversalTransactionId: logic.generateTransactionId(),
      ipAddress: '103.55.141.23',
      userAgent: 'Mozilla/5.0 (iPhone)',
      location: 'London, UK',
      initiatedAt: logic.formatDate(logic.addDays(now, -16)),
      completedAt: logic.formatDate(logic.addDays(now, -16)),
      createdAt: logic.formatDate(logic.addDays(now, -16)),
      updatedAt: logic.formatDate(logic.addDays(now, -14)),
    }
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  // Loan 2: REJECTED Application (50K personal loan)
  const loan2 = {
    loanId: 'LOAN_FRAUD_002',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: null,

    principalAmount: 50000,
    disbursedAmount: 0,
    interestRate: 0,
    originalTerm: 18,
    currentTerm: 0,
    monthlyPayment: 0,

    status: 'REJECTED',
    accountStatus: 'CLOSED',
    rejectionReason: 'FRAUD_RISK_HIGH',
    rejectionDetails: 'Multiple fraud flags detected, KYC verification failed',

    applicationDate: logic.formatDate(logic.addDays(now, -5)),
    approvalDate: null,
    disbursementDate: null,
    firstDueDate: null,
    maturityDate: null,
    closedDate: logic.formatDate(logic.addDays(now, -3)),

    isModified: false,

    paymentSuccessRate: 0,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,

    remainingPrincipal: 0,
    remainingInterest: 0,
    totalRemaining: 0,
    totalPaid: 0,
    totalInstallments: 0,
    paidInstallments: 0,
  }

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
    [loan2.loanId]: [],
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
    [loan2.loanId]: [],
  }

  const lateFees = {
    [loan1.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan1.loanId,
        installmentId: loan1InstallmentsPaid[1].installmentId,
        baseFee: 200,
        daysLate: 3,
        calculatedFee: 600,
        cappedFee: 600,
        appliedFee: 600,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addDays(now, -140)),
      },
    ],
    [loan2.loanId]: [],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    // Fraud flags
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'FRAUD',
      description: 'ตรวจพบกิจกรรมน่าสงสัย - ยกเลิกชำระ 3 ครั้ง',
      oldValue: null,
      newValue: 'FRAUD_FLAG_RAISED',
      metadata: { flagType: 'PAYMENT_REVERSAL', count: 3 },
      actorId: 'FRAUD_DETECTION_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(logic.addDays(now, -14)),
    },
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: null,
      eventType: 'NOTE',
      eventCategory: 'FRAUD',
      description: 'ตรวจพบการเข้าระบบผิดปกติ - 3 ประเทศใน 24 ชม.',
      oldValue: null,
      newValue: 'LOCATION_FRAUD_FLAG',
      metadata: {
        locations: ['Bangkok, TH', 'Los Angeles, US', 'London, UK'],
        timeSpan: '24 hours',
      },
      actorId: 'FRAUD_DETECTION_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(logic.addDays(now, -10)),
    },
    // Account frozen
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: null,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'ACCOUNT',
      description: 'บัญชีถูกระงับ - ตรวจสอบการฉ้อโกง',
      oldValue: 'ACTIVE',
      newValue: 'FROZEN',
      metadata: { reason: 'FRAUD_INVESTIGATION', flags: 3 },
      actorId: 'FRAUD_TEAM',
      actorType: 'ADMIN',
      occurredAt: logic.formatDate(logic.addDays(now, -7)),
    },
    // Loan rejection
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan2.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'คำขอสินเชื่อถูกปฏิเสธ - ความเสี่ยงฉ้อโกงสูง',
      oldValue: 'APPLIED',
      newValue: 'REJECTED',
      metadata: { reason: 'FRAUD_RISK_HIGH', amount: 50000 },
      actorId: 'UNDERWRITING_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(logic.addDays(now, -3)),
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_FRAUD_001',
      userId,
      type: 'CRITICAL',
      title: 'บัญชีถูกระงับชั่วคราว 🚨',
      message: 'เราตรวจพบกิจกรรมน่าสงสัย บัญชีถูกระงับเพื่อตรวจสอบ กรุณาติดต่อ security@jeco.com',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -7)),
      priority: 'CRITICAL',
    },
    {
      id: 'NOTIF_FRAUD_002',
      userId,
      type: 'WARNING',
      title: 'การยืนยันตัวตนเพิ่มเติม',
      message: 'กรุณาส่งเอกสารยืนยันตัวตนใหม่ ภายใน 7 วัน',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -6)),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_FRAUD_003',
      userId,
      type: 'INFO',
      title: 'คำขอสินเชื่อถูกปฏิเสธ',
      message: 'คำขอ 50,000 บาท ถูกปฏิเสธเนื่องจากตรวจสอบความปลอดภัย',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -3)),
      priority: 'HIGH',
    },
  ]

  return {
    metadata: {
      scenarioId: 'FRAUD_FLAGGED',
      scenarioName: 'ถูกตรวจสอบการฉ้อโกง',
      icon: '🚨',
      color: 'red',
      description: '26 ปี มีกิจกรรมน่าสงสัย ยกเลิกชำระ 3 ครั้ง เข้าระบบจาก 3 ประเทศ KYC ไม่ตรง บัญชีระงับ',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2],
    },
    user,
    loans: [loan1, loan2],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 7: Loan Modification Success (สุดา ปรับปรุง) 🔄
 * - Age 45, Salaried Employee, 35,000 THB/month
 * - Credit Score: 670 (Fair to Good)
 * - 1 Loan with successful modification
 * - History:
 *   - Jan 2024: Borrowed 400K, 36 months @ 18%
 *   - Months 6-8: Had payment issues (3 late payments)
 *   - Aug 2024: Restructured → 48 months @ 16%
 *   - After modification: 6/6 payments on-time
 * - Features: Modification history, before/after comparison, goodwill credits
 */
export function createModifiedLoan() {
  const now = new Date()
  const userId = 'USR_MODIFIED_001'

  const user = {
    userId,
    firstName: 'สุดา',
    lastName: 'ปรับปรุง',
    email: 'modified.success@jeco.test',
    phoneNumber: '0812345007',
    dateOfBirth: '1978-06-18',
    age: 45,
    occupation: 'พนักงานประจำ',
    employer: 'บริษัท DEF จำกัด',
    monthlyIncome: 35000,

    creditScore: 670,
    creditRating: 'FAIR',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2024-01-05T08:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'MEDIUM',
    debtToIncomeRatio: 0.38, // 13,300 / 35,000

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'BANK_ACCOUNT',
  }

  // Loan 1: Personal Loan - Modified successfully
  const loanOriginalStartDate = logic.addMonths(now, -12) // Jan 2024
  const modificationDate = logic.addMonths(now, -6) // Aug 2024 (after 6 months of problems)

  const loan1 = {
    loanId: 'LOAN_MODIFIED_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2024010002',

    // Original terms
    principalAmount: 400000,
    disbursedAmount: 400000,

    // Current (modified) terms
    interestRate: 16.0, // Reduced from 18%
    originalTerm: 36,
    currentTerm: 48, // Extended from 36
    monthlyPayment: logic.calculateMonthlyPayment(320000, 16.0, 42), // Remaining principal, new rate, new term

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loanOriginalStartDate, -15)),
    approvalDate: logic.formatDate(logic.addDays(loanOriginalStartDate, -7)),
    disbursementDate: logic.formatDate(loanOriginalStartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loanOriginalStartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loanOriginalStartDate, 48)), // Extended

    // Modification info
    isModified: true,
    modificationDate: logic.formatDate(modificationDate),
    modificationReason: 'FINANCIAL_HARDSHIP',
    originalInterestRate: 18.0,
    originalMonthlyPayment: logic.calculateMonthlyPayment(400000, 18.0, 36),
    originalMaturityDate: logic.formatDate(logic.addMonths(loanOriginalStartDate, 36)),

    // Payment history improved after modification
    paymentSuccessRate: 75, // 9/12 paid (3 late before modification, 6/6 on-time after)
    totalLatePayments: 3,
    consecutiveLatePayments: 0,
    daysOverdue: 0,

    // Goodwill adjustments
    goodwillCredits: [
      {
        creditId: 'GOOD_001',
        amount: 1500,
        reason: 'Late fee waiver - successful modification',
        appliedDate: logic.formatDate(modificationDate),
      },
    ],
  }

  // Generate original installments (36 months)
  const originalInstallments = builder.generateInstallmentSchedule(
    {
      ...loan1,
      interestRate: 18.0,
      currentTerm: 36,
      monthlyPayment: logic.calculateMonthlyPayment(400000, 18.0, 36),
    },
    {
      startDate: loan1.firstDueDate,
      termMonths: 36,
      paymentDay: 10,
    }
  )

  // First 6 installments: 3 on-time, 3 late (months 4-6 had problems)
  const firstSixInstallments = builder.applyPaymentBehavior(originalInstallments.slice(0, 6), {
    onTimeRate: 0.50,
    lateDaysRange: [10, 20],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 6,
  }, loan1)

  // At month 6, loan was modified
  // Generate new schedule for remaining principal with new terms
  const remainingPrincipal = 320000 // Approximate after 6 payments
  const newInstallments = builder.generateInstallmentSchedule(
    {
      ...loan1,
      principalAmount: remainingPrincipal,
      interestRate: 16.0,
      currentTerm: 42, // 48 - 6 already paid
      monthlyPayment: logic.calculateMonthlyPayment(remainingPrincipal, 16.0, 42),
    },
    {
      startDate: logic.formatDate(logic.addMonths(new Date(loan1.firstDueDate), 6)),
      termMonths: 42,
      paymentDay: 10,
    }
  )

  // After modification: 6 payments, all on-time
  const newInstallmentsPaid = builder.applyPaymentBehavior(newInstallments, {
    onTimeRate: 1.0, // Perfect record after modification
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 6, // 6 paid, 36 remaining
  }, loan1)

  // Combine: First 6 (with problems) + New 6 (perfect) + Remaining (upcoming)
  const allInstallments = [...firstSixInstallments, ...newInstallmentsPaid]

  const loan1Transactions = builder.generateTransactions(
    allInstallments.filter(inst => inst.status === 'PAID'),
    loan1.loanId,
    userId
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, allInstallments)
  Object.assign(loan1, loan1Metrics)

  const installments = {
    [loan1.loanId]: allInstallments,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
  }

  // Late fees from before modification (waived as goodwill)
  const lateFees = {
    [loan1.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan1.loanId,
        installmentId: firstSixInstallments[3].installmentId,
        baseFee: 200,
        daysLate: 10,
        calculatedFee: 1000,
        cappedFee: 1000,
        appliedFee: 0, // Waived
        status: 'WAIVED',
        isWaived: true,
        waivedDate: logic.formatDate(modificationDate),
        waivedBy: 'ADMIN_003',
        waiverReason: 'GOODWILL_MODIFICATION',
        assessedDate: logic.formatDate(logic.addMonths(now, -7)),
      },
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan1.loanId,
        installmentId: firstSixInstallments[4].installmentId,
        baseFee: 200,
        daysLate: 8,
        calculatedFee: 600,
        cappedFee: 600,
        appliedFee: 0, // Waived
        status: 'WAIVED',
        isWaived: true,
        waivedDate: logic.formatDate(modificationDate),
        waivedBy: 'ADMIN_003',
        waiverReason: 'GOODWILL_MODIFICATION',
        assessedDate: logic.formatDate(logic.addMonths(now, -7)),
      },
    ],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, allInstallments),
    // Modification proposal
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'MODIFICATION',
      description: 'ลูกค้าขอปรับโครงสร้างหนี้ - ประสบปัญหาทางการเงินชั่วคราว',
      oldValue: null,
      newValue: 'MODIFICATION_REQUESTED',
      metadata: { reason: 'FINANCIAL_HARDSHIP' },
      actorId: userId,
      actorType: 'USER',
      occurredAt: logic.formatDate(logic.addDays(modificationDate, -10)),
    },
    // Modification approved
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'MODIFICATION',
      description: 'อนุมัติปรับโครงสร้าง: 36→48 เดือน, 18%→16%, งวดลด 3,500 บาท',
      oldValue: JSON.stringify({ term: 36, rate: 18.0, monthly: loan1.originalMonthlyPayment }),
      newValue: JSON.stringify({ term: 48, rate: 16.0, monthly: loan1.monthlyPayment }),
      metadata: {
        oldTerm: 36,
        newTerm: 48,
        oldRate: 18.0,
        newRate: 16.0,
        monthlyReduction: Math.round(loan1.originalMonthlyPayment - loan1.monthlyPayment),
      },
      actorId: 'ADMIN_003',
      actorType: 'ADMIN',
      occurredAt: logic.formatDate(modificationDate),
    },
    // Goodwill credits
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'FEE',
      description: 'ยกเว้นค่าปรับ 1,500 บาท - ปรับโครงสร้างสำเร็จ',
      oldValue: null,
      newValue: 'LATE_FEE_WAIVED',
      metadata: { amount: 1500, reason: 'GOODWILL' },
      actorId: 'ADMIN_003',
      actorType: 'ADMIN',
      occurredAt: logic.formatDate(modificationDate),
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_MODIFIED_001',
      userId,
      type: 'SUCCESS',
      title: 'ปรับโครงสร้างสำเร็จ! ✅',
      message: 'งวดลดจาก 14,856 เป็น 10,900 บาท ขยายเวลา 12 เดือน ยกเว้นค่าปรับ 1,500 บาท',
      isRead: false,
      createdAt: logic.formatDate(modificationDate),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_MODIFIED_002',
      userId,
      type: 'ACHIEVEMENT',
      title: 'ชำระตรงเวลา 6 งวดติดต่อกัน! 🎉',
      message: 'คุณทำได้ดีมาก! ต่อไปนี้อีก 36 งวด',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -3)),
      priority: 'LOW',
    },
    {
      id: 'NOTIF_MODIFIED_003',
      userId,
      type: 'INFO',
      title: 'คุณสมบัติวงเงินเพิ่ม',
      message: 'เนื่องจากชำระดีต่อเนื่อง คุณมีสิทธิ์กู้เพิ่ม 150,000 บาท อัตราพิเศษ 14%',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -7)),
      priority: 'MEDIUM',
    },
  ]

  return {
    metadata: {
      scenarioId: 'MODIFIED_LOAN',
      scenarioName: 'ปรับโครงสร้างหนี้สำเร็จ',
      icon: '🔄',
      color: 'teal',
      description: 'พนักงานประจำ 45 ปี มีปัญหาเดือน 6-8 ปรับโครงสร้างสำเร็จ (36→48 เดือน, 18%→16%) ชำระดีต่อเนื่อง 6 งวด',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1],
    },
    user,
    loans: [loan1],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}
/**
 * Persona 8: Multiple Active Loans (ชาย พอร์ตโฟลิโอ) 📊
 * - Age 52, Business Owner, 95,000 THB/month
 * - Credit Score: 740 (Good)
 * - 4 Active Loans running concurrently:
 *   - Personal Loan: 500K (12/36 paid)
 *   - Business Loan: 800K (8/24 paid)
 *   - Phone Loan: 45K (18/24 paid)
 *   - Education Loan: 200K (6/12 paid)
 * - Monthly Payment: 68,500 THB, 98% on-time rate (late 2 times in 44 installments)
 * - Features: Portfolio view, debt ratio tracking, consolidated payment
 */
export function createMultiLoan() {
  const now = new Date()
  const userId = 'USR_MULTI_001'

  const user = {
    userId,
    firstName: 'ชาย',
    lastName: 'พอร์ตโฟลิโอ',
    email: 'multi.loan@jeco.test',
    phoneNumber: '0812345008',
    dateOfBirth: '1971-03-25',
    age: 52,
    occupation: 'เจ้าของธุรกิจ',
    employer: 'บริษัท Portfolio Trading จำกัด',
    monthlyIncome: 95000,

    creditScore: 740,
    creditRating: 'GOOD',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2020-06-10T10:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'LOW',
    debtToIncomeRatio: 0.72, // 68,500 / 95,000 (high but manageable)

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: 'BANK_ACCOUNT',
  }

  // Loan 1: Personal Loan 500K - started 12 months ago
  const loan1StartDate = logic.addMonths(now, -12)
  const loan1 = {
    loanId: 'LOAN_MULTI_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: 'CONT2023010005',

    principalAmount: 500000,
    disbursedAmount: 500000,
    interestRate: 14.0,
    originalTerm: 36,
    currentTerm: 36,
    monthlyPayment: logic.calculateMonthlyPayment(500000, 14.0, 36),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -15)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -7)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 36)),

    isModified: false,

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 36,
    paymentDay: 5,
  })

  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 12,
  }, loan1)

  // Loan 2: Business Loan 800K - started 8 months ago
  const loan2StartDate = logic.addMonths(now, -8)
  const loan2 = {
    loanId: 'LOAN_MULTI_002',
    userId,
    productId: 'PROD_BUSINESS_001',
    productName: 'สินเชื่อธุรกิจ JeCO Business',
    contractNo: 'CONT2023050008',

    principalAmount: 800000,
    disbursedAmount: 800000,
    interestRate: 12.0,
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(800000, 12.0, 24),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan2StartDate, -20)),
    approvalDate: logic.formatDate(logic.addDays(loan2StartDate, -10)),
    disbursementDate: logic.formatDate(loan2StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan2StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan2StartDate, 24)),

    isModified: false,

    paymentSuccessRate: 87, // 1 late payment
    totalLatePayments: 1,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan2Installments = builder.generateInstallmentSchedule(loan2, {
    startDate: loan2.firstDueDate,
    termMonths: 24,
    paymentDay: 5,
  })

  const loan2InstallmentsPaid = builder.applyPaymentBehavior(loan2Installments, {
    onTimeRate: 0.87,
    lateDaysRange: [3, 7],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 8,
  }, loan2)

  // Loan 3: Phone Loan 45K - started 18 months ago, almost done
  const loan3StartDate = logic.addMonths(now, -18)
  const loan3 = {
    loanId: 'LOAN_MULTI_003',
    userId,
    productId: 'PROD_PHONE_001',
    productName: 'สินเชื่อมือถือ JeCO Phone',
    contractNo: 'CONT2022070012',

    principalAmount: 45000,
    disbursedAmount: 45000,
    interestRate: 10.0,
    originalTerm: 24,
    currentTerm: 24,
    monthlyPayment: logic.calculateMonthlyPayment(45000, 10.0, 24),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan3StartDate, -8)),
    approvalDate: logic.formatDate(logic.addDays(loan3StartDate, -3)),
    disbursementDate: logic.formatDate(loan3StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan3StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan3StartDate, 24)),

    isModified: false,

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan3Installments = builder.generateInstallmentSchedule(loan3, {
    startDate: loan3.firstDueDate,
    termMonths: 24,
    paymentDay: 5,
  })

  const loan3InstallmentsPaid = builder.applyPaymentBehavior(loan3Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 18,
  }, loan3)

  // Loan 4: Education Loan 200K (for children) - started 6 months ago
  const loan4StartDate = logic.addMonths(now, -6)
  const loan4 = {
    loanId: 'LOAN_MULTI_004',
    userId,
    productId: 'PROD_EDUCATION_001',
    productName: 'สินเชื่อการศึกษา JeCO Education',
    contractNo: 'CONT2023070015',

    principalAmount: 200000,
    disbursedAmount: 200000,
    interestRate: 8.0, // Lower rate for education
    originalTerm: 12,
    currentTerm: 12,
    monthlyPayment: logic.calculateMonthlyPayment(200000, 8.0, 12),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan4StartDate, -12)),
    approvalDate: logic.formatDate(logic.addDays(loan4StartDate, -5)),
    disbursementDate: logic.formatDate(loan4StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan4StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan4StartDate, 12)),

    isModified: false,

    paymentSuccessRate: 83, // 1 late payment
    totalLatePayments: 1,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan4Installments = builder.generateInstallmentSchedule(loan4, {
    startDate: loan4.firstDueDate,
    termMonths: 12,
    paymentDay: 5,
  })

  const loan4InstallmentsPaid = builder.applyPaymentBehavior(loan4Installments, {
    onTimeRate: 0.83,
    lateDaysRange: [4, 8],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 6,
  }, loan4)

  // Generate transactions and metrics for all loans
  const loan1Transactions = builder.generateTransactions(loan1InstallmentsPaid.filter(i => i.status === 'PAID'), loan1.loanId, userId)
  const loan2Transactions = builder.generateTransactions(loan2InstallmentsPaid.filter(i => i.status === 'PAID'), loan2.loanId, userId)
  const loan3Transactions = builder.generateTransactions(loan3InstallmentsPaid.filter(i => i.status === 'PAID'), loan3.loanId, userId)
  const loan4Transactions = builder.generateTransactions(loan4InstallmentsPaid.filter(i => i.status === 'PAID'), loan4.loanId, userId)

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  const loan2Metrics = builder.calculateLoanMetrics(loan2, loan2InstallmentsPaid)
  const loan3Metrics = builder.calculateLoanMetrics(loan3, loan3InstallmentsPaid)
  const loan4Metrics = builder.calculateLoanMetrics(loan4, loan4InstallmentsPaid)

  Object.assign(loan1, loan1Metrics)
  Object.assign(loan2, loan2Metrics)
  Object.assign(loan3, loan3Metrics)
  Object.assign(loan4, loan4Metrics)

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
    [loan2.loanId]: loan2InstallmentsPaid,
    [loan3.loanId]: loan3InstallmentsPaid,
    [loan4.loanId]: loan4InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
    [loan2.loanId]: loan2Transactions,
    [loan3.loanId]: loan3Transactions,
    [loan4.loanId]: loan4Transactions,
  }

  // Minimal late fees (2 late payments across 44 total installments)
  const lateFees = {
    [loan1.loanId]: [],
    [loan2.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan2.loanId,
        installmentId: loan2InstallmentsPaid[3].installmentId,
        baseFee: 200,
        daysLate: 2, // Only 7 days late - 5 grace = 2 days
        calculatedFee: 400,
        cappedFee: 400,
        appliedFee: 400,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addMonths(now, -4)),
      },
    ],
    [loan3.loanId]: [],
    [loan4.loanId]: [
      {
        lateFeeId: logic.generateLateFeeId(),
        loanId: loan4.loanId,
        installmentId: loan4InstallmentsPaid[2].installmentId,
        baseFee: 200,
        daysLate: 3, // 8 days late - 5 grace = 3 days
        calculatedFee: 600,
        cappedFee: 600,
        appliedFee: 600,
        status: 'APPLIED',
        isWaived: false,
        assessedDate: logic.formatDate(logic.addMonths(now, -3)),
      },
    ],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    ...builder.generateAuditEvents(loan2, loan2InstallmentsPaid),
    ...builder.generateAuditEvents(loan3, loan3InstallmentsPaid),
    ...builder.generateAuditEvents(loan4, loan4InstallmentsPaid),
  ]

  const notifications = [
    {
      id: 'NOTIF_MULTI_001',
      userId,
      type: 'INFO',
      title: 'พอร์ตสินเชื่อของคุณ',
      message: '4 สินเชื่อ มูลค่ารวม 1.545 ล้านบาท ชำระรายเดือน 68,500 บาท',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -2)),
      priority: 'LOW',
    },
    {
      id: 'NOTIF_MULTI_002',
      userId,
      type: 'SUCCESS',
      title: 'สินเชื่อมือถือใกล้ครบกำหนด',
      message: 'เหลืออีก 6 งวด (27,000 บาท) สินเชื่อจะครบกำหนดในอีก 6 เดือน',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -7)),
      priority: 'LOW',
    },
    {
      id: 'NOTIF_MULTI_003',
      userId,
      type: 'PROMOTION',
      title: 'วงเงินพิเศษสำหรับคุณ',
      message: 'คุณมีคุณสมบัติกู้เพิ่ม 2,000,000 บาท อัตราดอกเบี้ยพิเศษ 10%',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -14)),
      priority: 'MEDIUM',
    },
  ]

  return {
    metadata: {
      scenarioId: 'MULTI_LOAN',
      scenarioName: 'พอร์ตหลายสินเชื่อ',
      icon: '📊',
      color: 'purple',
      description: 'เจ้าของธุรกิจ 52 ปี มี 4 สินเชื่อพร้อมกัน (Personal 500K, Business 800K, Phone 45K, Education 200K) ชำระ 68,500/เดือน',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2, loan3, loan4],
    },
    user,
    loans: [loan1, loan2, loan3, loan4],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 9: New Borrower (น้อง มือใหม่) 🌱
 * - Age 23, Fresh Graduate, 18,000 THB/month
 * - Credit Score: 680 (No credit history + bonus points)
 * - 1 Loan: First loan, recently approved (2 months ago)
 * - Payment Behavior: 2 payments made, both on-time
 * - Features: First-time borrower guidance, credit building tips, payment reminders
 */
export function createNewBorrower() {
  const now = new Date()
  const userId = 'USR_NEW_001'

  const user = {
    userId,
    firstName: 'น้อง',
    lastName: 'มือใหม่',
    email: 'new.borrower@jeco.test',
    phoneNumber: '0812345009',
    dateOfBirth: '2001-08-12',
    age: 23,
    occupation: 'พนักงานบริษัท (จบใหม่)',
    employer: 'บริษัท StartupTech จำกัด',
    monthlyIncome: 18000,

    creditScore: 680,
    creditRating: 'GOOD', // New borrower bonus

    accountStatus: 'ACTIVE',
    accountCreatedAt: logic.formatDate(logic.addMonths(now, -3)),
    kycStatus: 'VERIFIED',

    riskLevel: 'MEDIUM',
    debtToIncomeRatio: 0.28, // 5,000 / 18,000

    autoPaymentEnabled: true, // Smart new borrower
    notificationsEnabled: true,
    preferredPaymentMethod: 'JWALLET',

    // First-time borrower flags
    isFirstTimeBorrower: true,
    creditHistoryMonths: 2,
  }

  // Loan 1: Phone Loan 60K - first loan ever
  const loan1StartDate = logic.addMonths(now, -2)
  const loan1 = {
    loanId: 'LOAN_NEW_001',
    userId,
    productId: 'PROD_PHONE_001',
    productName: 'สินเชื่อมือถือ JeCO Phone',
    contractNo: 'CONT2024100020',

    principalAmount: 60000,
    disbursedAmount: 60000,
    interestRate: 15.0, // Standard first-time rate
    originalTerm: 12,
    currentTerm: 12,
    monthlyPayment: logic.calculateMonthlyPayment(60000, 15.0, 12),

    status: 'ACTIVE',
    accountStatus: 'ACTIVE',

    applicationDate: logic.formatDate(logic.addDays(loan1StartDate, -10)),
    approvalDate: logic.formatDate(logic.addDays(loan1StartDate, -5)),
    disbursementDate: logic.formatDate(loan1StartDate),
    firstDueDate: logic.formatDate(logic.addMonths(loan1StartDate, 1)),
    maturityDate: logic.formatDate(logic.addMonths(loan1StartDate, 12)),

    isModified: false,
    isFirstLoan: true,

    paymentSuccessRate: 100,
    totalLatePayments: 0,
    consecutiveLatePayments: 0,
    daysOverdue: 0,
  }

  const loan1Installments = builder.generateInstallmentSchedule(loan1, {
    startDate: loan1.firstDueDate,
    termMonths: 12,
    paymentDay: 15,
  })

  // Only 2 payments made so far, both perfect
  const loan1InstallmentsPaid = builder.applyPaymentBehavior(loan1Installments, {
    onTimeRate: 1.0,
    lateDaysRange: [0, 0],
    partialPaymentRate: 0,
    missedPaymentIndices: [],
    currentInstallmentIndex: 2,
  }, loan1)

  const loan1Transactions = builder.generateTransactions(
    loan1InstallmentsPaid.filter(inst => inst.status === 'PAID'),
    loan1.loanId,
    userId
  )

  const loan1Metrics = builder.calculateLoanMetrics(loan1, loan1InstallmentsPaid)
  Object.assign(loan1, loan1Metrics)

  const installments = {
    [loan1.loanId]: loan1InstallmentsPaid,
  }

  const transactions = {
    [loan1.loanId]: loan1Transactions,
  }

  const lateFees = {
    [loan1.loanId]: [],
  }

  const events = [
    ...builder.generateAuditEvents(loan1, loan1InstallmentsPaid),
    // First loan milestone
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'MILESTONE',
      description: 'สินเชื่อแรกของคุณ - ยินดีต้อนรับสู่ JeCO!',
      oldValue: null,
      newValue: 'FIRST_LOAN',
      metadata: { amount: 60000, term: 12 },
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: loan1.disbursementDate,
    },
    // First payment success
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'NOTE',
      eventCategory: 'MILESTONE',
      description: 'ชำระงวดแรกสำเร็จ! เริ่มสร้างประวัติเครดิตที่ดี',
      oldValue: null,
      newValue: 'FIRST_PAYMENT_SUCCESS',
      metadata: {},
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: loan1InstallmentsPaid[0].paymentDate,
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_NEW_001',
      userId,
      type: 'SUCCESS',
      title: 'ยินดีต้อนรับสู่ JeCO! 🎉',
      message: 'สินเชื่อแรกของคุณอนุมัติแล้ว ชำระตรงเวลาเพื่อสร้างเครดิตที่ดี',
      isRead: true,
      createdAt: loan1.disbursementDate,
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_NEW_002',
      userId,
      type: 'ACHIEVEMENT',
      title: 'ชำระงวดแรกสำเร็จ! ✨',
      message: 'เยี่ยมมาก! คุณกำลังสร้างประวัติเครดิตที่ดี ต่อไปอีก 10 งวด',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -15)),
      priority: 'MEDIUM',
    },
    {
      id: 'NOTIF_NEW_003',
      userId,
      type: 'INFO',
      title: 'เคล็ดลับสร้างเครดิต',
      message: 'ชำระตรงเวลาทุกงวด = เพิ่มคะแนนเครดิต + ลดอัตราดอกเบี้ยในอนาคต',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -7)),
      priority: 'LOW',
    },
    {
      id: 'NOTIF_NEW_004',
      userId,
      type: 'PAYMENT_REMINDER',
      title: 'เตือนชำระงวดถัดไป',
      message: 'งวดที่ 3 ครบกำหนด 15 ก.พ. 2026 จำนวน 5,400 บาท',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(now, -5)),
      priority: 'MEDIUM',
    },
  ]

  return {
    metadata: {
      scenarioId: 'NEW_BORROWER',
      scenarioName: 'ผู้กู้มือใหม่',
      icon: '🌱',
      color: 'green',
      description: 'จบใหม่ 23 ปี สินเชื่อแรก 60K ชำระได้ 2 งวด ทั้ง 2 ตรงเวลา กำลังสร้างประวัติเครดิต',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1],
    },
    user,
    loans: [loan1],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}

/**
 * Persona 10: Loan Rejection Case (สมหมาย ปฏิเสธ) ❌
 * - Age 55, Informal Work, 12,000 THB/month (inconsistent)
 * - Credit Score: 520 (Poor)
 * - 0 Active Loans, 3 Rejections
 * - Rejection History:
 *   - Feb 2024: Rejected (income too low)
 *   - May 2024: Rejected (expense ratio 85%)
 *   - Sep 2024: Rejected (inconsistent income)
 * - Features: Detailed rejection reasons, improvement roadmap, alternative options
 */
export function createRejected() {
  const now = new Date()
  const userId = 'USR_REJECTED_001'

  const user = {
    userId,
    firstName: 'สมหมาย',
    lastName: 'ปฏิเสธ',
    email: 'rejected@jeco.test',
    phoneNumber: '0812345010',
    dateOfBirth: '1969-04-10',
    age: 55,
    occupation: 'อาชีพอิสระ',
    employer: 'ไม่มี',
    monthlyIncome: 12000,

    creditScore: 520,
    creditRating: 'POOR',

    accountStatus: 'ACTIVE',
    accountCreatedAt: '2024-02-01T14:00:00+07:00',
    kycStatus: 'VERIFIED',

    riskLevel: 'VERY_HIGH',
    debtToIncomeRatio: null, // No loans

    autoPaymentEnabled: false,
    notificationsEnabled: true,
    preferredPaymentMethod: null,

    // Rejection tracking
    totalApplications: 3,
    totalRejections: 3,
    totalApprovals: 0,
  }

  // Loan 1: REJECTED - Income too low
  const rejection1Date = logic.addMonths(now, -10) // Feb 2024
  const loan1 = {
    loanId: 'LOAN_REJECTED_001',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: null,

    principalAmount: 80000,
    disbursedAmount: 0,
    interestRate: 0,
    originalTerm: 18,
    currentTerm: 0,
    monthlyPayment: 0,

    status: 'REJECTED',
    accountStatus: 'CLOSED',

    rejectionReason: 'INCOME_TOO_LOW',
    rejectionDetails: 'รายได้ขั้นต่ำ 15,000 บาท/เดือน (รายได้ของคุณ: 12,000 บาท)',
    rejectionDate: logic.formatDate(rejection1Date),

    applicationDate: logic.formatDate(logic.addDays(rejection1Date, -5)),
    approvalDate: null,
    disbursementDate: null,
    firstDueDate: null,
    maturityDate: null,
    closedDate: logic.formatDate(rejection1Date),

    isModified: false,

    remainingPrincipal: 0,
    remainingInterest: 0,
    totalRemaining: 0,
    totalPaid: 0,
    totalInstallments: 0,
    paidInstallments: 0,
  }

  // Loan 2: REJECTED - Expense ratio too high
  const rejection2Date = logic.addMonths(now, -7) // May 2024
  const loan2 = {
    loanId: 'LOAN_REJECTED_002',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: null,

    principalAmount: 50000,
    disbursedAmount: 0,
    interestRate: 0,
    originalTerm: 12,
    currentTerm: 0,
    monthlyPayment: 0,

    status: 'REJECTED',
    accountStatus: 'CLOSED',

    rejectionReason: 'HIGH_EXPENSE_RATIO',
    rejectionDetails: 'รายจ่ายต่อรายได้ 85% (ควรต่ำกว่า 60%) เหลือเงินใช้จ่ายเพียง 1,800 บาท/เดือน',
    rejectionDate: logic.formatDate(rejection2Date),

    applicationDate: logic.formatDate(logic.addDays(rejection2Date, -7)),
    approvalDate: null,
    disbursementDate: null,
    firstDueDate: null,
    maturityDate: null,
    closedDate: logic.formatDate(rejection2Date),

    isModified: false,

    remainingPrincipal: 0,
    remainingInterest: 0,
    totalRemaining: 0,
    totalPaid: 0,
    totalInstallments: 0,
    paidInstallments: 0,
  }

  // Loan 3: REJECTED - Inconsistent income
  const rejection3Date = logic.addMonths(now, -3) // Sep 2024
  const loan3 = {
    loanId: 'LOAN_REJECTED_003',
    userId,
    productId: 'PROD_PERSONAL_001',
    productName: 'สินเชื่อส่วนบุคคล JeCO Plus',
    contractNo: null,

    principalAmount: 30000,
    disbursedAmount: 0,
    interestRate: 0,
    originalTerm: 12,
    currentTerm: 0,
    monthlyPayment: 0,

    status: 'REJECTED',
    accountStatus: 'CLOSED',

    rejectionReason: 'INCONSISTENT_INCOME',
    rejectionDetails: 'รายได้ไม่สม่ำเสมอ (แตกต่าง 40% ใน 3 เดือน) ต้องการสลิปเงินเดือน 6 เดือนที่คงที่',
    rejectionDate: logic.formatDate(rejection3Date),

    applicationDate: logic.formatDate(logic.addDays(rejection3Date, -8)),
    approvalDate: null,
    disbursementDate: null,
    firstDueDate: null,
    maturityDate: null,
    closedDate: logic.formatDate(rejection3Date),

    isModified: false,

    remainingPrincipal: 0,
    remainingInterest: 0,
    totalRemaining: 0,
    totalPaid: 0,
    totalInstallments: 0,
    paidInstallments: 0,
  }

  const installments = {
    [loan1.loanId]: [],
    [loan2.loanId]: [],
    [loan3.loanId]: [],
  }

  const transactions = {
    [loan1.loanId]: [],
    [loan2.loanId]: [],
    [loan3.loanId]: [],
  }

  const lateFees = {
    [loan1.loanId]: [],
    [loan2.loanId]: [],
    [loan3.loanId]: [],
  }

  const events = [
    // Rejection 1
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan1.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'คำขอสินเชื่อถูกปฏิเสธ - รายได้ต่ำกว่าเกณฑ์',
      oldValue: 'APPLIED',
      newValue: 'REJECTED',
      metadata: {
        reason: 'INCOME_TOO_LOW',
        requiredIncome: 15000,
        actualIncome: 12000,
      },
      actorId: 'UNDERWRITING_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(rejection1Date),
    },
    // Rejection 2
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan2.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'คำขอสินเชื่อถูกปฏิเสธ - อัตราส่วนรายจ่ายสูงเกินไป',
      oldValue: 'APPLIED',
      newValue: 'REJECTED',
      metadata: {
        reason: 'HIGH_EXPENSE_RATIO',
        expenseRatio: 0.85,
        maxAllowed: 0.60,
      },
      actorId: 'UNDERWRITING_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(rejection2Date),
    },
    // Rejection 3
    {
      eventId: logic.generateEventId(),
      userId,
      loanId: loan3.loanId,
      eventType: 'STATUS_CHANGE',
      eventCategory: 'LOAN',
      description: 'คำขอสินเชื่อถูกปฏิเสธ - รายได้ไม่สม่ำเสมอ',
      oldValue: 'APPLIED',
      newValue: 'REJECTED',
      metadata: {
        reason: 'INCONSISTENT_INCOME',
        incomeVariation: 0.40,
        maxVariation: 0.25,
      },
      actorId: 'UNDERWRITING_SYSTEM',
      actorType: 'SYSTEM',
      occurredAt: logic.formatDate(rejection3Date),
    },
  ]

  const notifications = [
    {
      id: 'NOTIF_REJECTED_001',
      userId,
      type: 'INFO',
      title: 'คำขอถูกปฏิเสธ - วิธีปรับปรุง',
      message: 'เราแนะนำ: 1) เพิ่มรายได้เป็น 15K+ 2) ลดรายจ่ายลง 3) ยื่นเอกสารรายได้เพิ่ม',
      isRead: false,
      createdAt: logic.formatDate(rejection3Date),
      priority: 'HIGH',
    },
    {
      id: 'NOTIF_REJECTED_002',
      userId,
      type: 'INFO',
      title: 'ทางเลือกอื่น',
      message: 'ลองสมัครสินเชื่อมือถือ (วงเงินต่ำกว่า 20K) หรือ หาผู้ค้ำประกัน',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(rejection3Date, 1)),
      priority: 'MEDIUM',
    },
    {
      id: 'NOTIF_REJECTED_003',
      userId,
      type: 'INFO',
      title: 'แผนปรับปรุงเครดิต',
      message: 'ปรับปรุงคะแนนเครดิต: ใช้บัตรเครดิตอย่างรับผิดชอบ, ชำระค่าใช้จ่ายตรงเวลา',
      isRead: false,
      createdAt: logic.formatDate(logic.addDays(rejection3Date, 7)),
      priority: 'LOW',
    },
  ]

  return {
    metadata: {
      scenarioId: 'REJECTED',
      scenarioName: 'ถูกปฏิเสธ',
      icon: '❌',
      color: 'gray',
      description: 'อาชีพอิสระ 55 ปี รายได้ 12K ถูกปฏิเสธ 3 ครั้ง (รายได้ต่ำ, รายจ่ายสูง, รายได้ไม่แน่นอน) มีแผนปรับปรุง',
      user: {
        age: user.age,
        monthlyIncome: user.monthlyIncome,
        creditScore: user.creditScore,
      },
      loans: [loan1, loan2, loan3],
    },
    user,
    loans: [loan1, loan2, loan3],
    installments,
    transactions,
    lateFees,
    events,
    notifications,
  }
}
