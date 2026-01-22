// Mock Data for JECO+ App

// Loan Products
export const loanProducts = [
  {
    productId: 'PERSONAL',
    name: 'สินเชื่อส่วนบุคคล',
    description: 'สินเชื่อเงินสด อนุมัติไว',
    minAmount: 10000,
    maxAmount: 500000,
    interestRate: 18,
    maxTerm: 36
  },
  {
    productId: 'PHONE',
    name: 'สินเชื่อผ่อนมือถือ',
    description: 'ผ่อน 0% นานสูงสุด 24 เดือน',
    minAmount: 5000,
    maxAmount: 100000,
    interestRate: 0,
    maxTerm: 24
  }
]

// User's Loan Accounts
export const loanAccounts = [
  {
    loanId: 'LN001',
    productId: 'PERSONAL',
    productName: 'สินเชื่อส่วนบุคคล',
    contractNo: 'JM-2024-001234',
    principalAmount: 50000,
    remainingBalance: 35420,
    interestRate: 18,
    totalInstallments: 12,
    paidInstallments: 5,
    monthlyPayment: 4580,
    nextDueDate: '2025-01-15',
    nextDueAmount: 4580,
    status: 'ACTIVE',
    createdAt: '2024-08-15'
  },
  {
    loanId: 'LN002',
    productId: 'PHONE',
    productName: 'สินเชื่อผ่อนมือถือ',
    contractNo: 'JM-2024-005678',
    principalAmount: 45900,
    remainingBalance: 22950,
    interestRate: 0,
    totalInstallments: 10,
    paidInstallments: 5,
    monthlyPayment: 4590,
    nextDueDate: '2025-01-20',
    nextDueAmount: 4590,
    status: 'ACTIVE',
    createdAt: '2024-09-01'
  }
]

// Installments for LN001
export const installmentsLN001 = [
  { installmentId: 'INS001', loanId: 'LN001', no: 1, dueDate: '2024-09-15', amount: 4580, principal: 3580, interest: 1000, status: 'PAID', paidDate: '2024-09-14' },
  { installmentId: 'INS002', loanId: 'LN001', no: 2, dueDate: '2024-10-15', amount: 4580, principal: 3620, interest: 960, status: 'PAID', paidDate: '2024-10-15' },
  { installmentId: 'INS003', loanId: 'LN001', no: 3, dueDate: '2024-11-15', amount: 4580, principal: 3660, interest: 920, status: 'PAID', paidDate: '2024-11-14' },
  { installmentId: 'INS004', loanId: 'LN001', no: 4, dueDate: '2024-12-15', amount: 4580, principal: 3700, interest: 880, status: 'PAID', paidDate: '2024-12-12' },
  { installmentId: 'INS005', loanId: 'LN001', no: 5, dueDate: '2025-01-15', amount: 4580, principal: 3740, interest: 840, status: 'PENDING', paidDate: null },
  { installmentId: 'INS006', loanId: 'LN001', no: 6, dueDate: '2025-02-15', amount: 4580, principal: 3780, interest: 800, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS007', loanId: 'LN001', no: 7, dueDate: '2025-03-15', amount: 4580, principal: 3820, interest: 760, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS008', loanId: 'LN001', no: 8, dueDate: '2025-04-15', amount: 4580, principal: 3860, interest: 720, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS009', loanId: 'LN001', no: 9, dueDate: '2025-05-15', amount: 4580, principal: 3900, interest: 680, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS010', loanId: 'LN001', no: 10, dueDate: '2025-06-15', amount: 4580, principal: 3940, interest: 640, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS011', loanId: 'LN001', no: 11, dueDate: '2025-07-15', amount: 4580, principal: 3980, interest: 600, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS012', loanId: 'LN001', no: 12, dueDate: '2025-08-15', amount: 4580, principal: 4020, interest: 560, status: 'UPCOMING', paidDate: null }
]

// Installments for LN002
export const installmentsLN002 = [
  { installmentId: 'INS101', loanId: 'LN002', no: 1, dueDate: '2024-10-20', amount: 4590, principal: 4590, interest: 0, status: 'PAID', paidDate: '2024-10-18' },
  { installmentId: 'INS102', loanId: 'LN002', no: 2, dueDate: '2024-11-20', amount: 4590, principal: 4590, interest: 0, status: 'PAID', paidDate: '2024-11-20' },
  { installmentId: 'INS103', loanId: 'LN002', no: 3, dueDate: '2024-12-20', amount: 4590, principal: 4590, interest: 0, status: 'PAID', paidDate: '2024-12-19' },
  { installmentId: 'INS104', loanId: 'LN002', no: 4, dueDate: '2025-01-20', amount: 4590, principal: 4590, interest: 0, status: 'PENDING', paidDate: null },
  { installmentId: 'INS105', loanId: 'LN002', no: 5, dueDate: '2025-02-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS106', loanId: 'LN002', no: 6, dueDate: '2025-03-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS107', loanId: 'LN002', no: 7, dueDate: '2025-04-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS108', loanId: 'LN002', no: 8, dueDate: '2025-05-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS109', loanId: 'LN002', no: 9, dueDate: '2025-06-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null },
  { installmentId: 'INS110', loanId: 'LN002', no: 10, dueDate: '2025-07-20', amount: 4590, principal: 4590, interest: 0, status: 'UPCOMING', paidDate: null }
]

// Payment Methods
export const paymentMethods = [
  {
    type: 'JWALLET',
    displayName: 'J Wallet',
    description: 'ชำระผ่าน J Wallet',
    icon: 'wallet',
    enabled: true,
    needsLink: false
  },
  {
    type: 'CREDIT_CARD',
    displayName: 'บัตรเครดิต / เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: 'card',
    enabled: true,
    needsLink: true
  },
  {
    type: 'BANK_ACCOUNT',
    displayName: 'บัญชีธนาคาร',
    description: 'หักบัญชีอัตโนมัติ',
    icon: 'bank',
    enabled: true,
    needsLink: true
  }
]

// User's Linked Cards
export const linkedCards = [
  {
    cardId: 'CARD001',
    brand: 'VISA',
    last4: '4242',
    expiry: '12/27',
    holderName: 'SOMCHAI T',
    isDefault: true
  }
]

// User's Linked Bank Accounts
export const linkedBanks = [
  {
    bankId: 'BANK001',
    bankCode: 'KBANK',
    bankName: 'ธนาคารกสิกรไทย',
    accountNo: 'xxx-x-xx123-4',
    holderName: 'นายสมชาย ทดสอบ',
    isDefault: true
  }
]

// Banks List
export const banksList = [
  { code: 'KBANK', name: 'ธนาคารกสิกรไทย', color: '#138F2D' },
  { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', color: '#4E2A82' },
  { code: 'KTB', name: 'ธนาคารกรุงไทย', color: '#1BA5E0' },
  { code: 'BBL', name: 'ธนาคารกรุงเทพ', color: '#1E4598' },
  { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา', color: '#FEC43B' },
  { code: 'TMB', name: 'ธนาคารทหารไทยธนชาต', color: '#1279BE' }
]

// User Profile
export const userProfile = {
  userId: 'U001',
  phone: '0891234567',
  firstName: 'สมชาย',
  lastName: 'ทดสอบ',
  email: 'somchai@example.com',
  idCard: 'x-xxxx-xxxxx-12-3',
  kycStatus: 'VERIFIED',
  createdAt: '2024-01-15'
}

// Notifications
export const notifications = [
  {
    id: 'N001',
    type: 'PAYMENT_DUE',
    title: 'ใกล้ถึงวันชำระค่างวด',
    message: 'งวดที่ 5 สินเชื่อส่วนบุคคล จำนวน ฿4,580 ครบกำหนด 15 ม.ค. 68',
    createdAt: '2025-01-10T10:00:00Z',
    read: false
  },
  {
    id: 'N002',
    type: 'PAYMENT_SUCCESS',
    title: 'ชำระค่างวดสำเร็จ',
    message: 'งวดที่ 4 สินเชื่อส่วนบุคคล จำนวน ฿4,580 ชำระเรียบร้อย',
    createdAt: '2024-12-12T14:30:00Z',
    read: true
  },
  {
    id: 'N003',
    type: 'PROMO',
    title: 'โปรโมชั่นพิเศษ!',
    message: 'รับแต้ม J Point 2 เท่า เมื่อชำระผ่าน J Wallet',
    createdAt: '2024-12-01T09:00:00Z',
    read: true
  }
]

// Helper functions
export const getInstallments = (loanId) => {
  if (loanId === 'LN001') return installmentsLN001
  if (loanId === 'LN002') return installmentsLN002
  return []
}

export const getLoanById = (loanId) => {
  return loanAccounts.find(l => l.loanId === loanId)
}

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0'
  return new Intl.NumberFormat('th-TH').format(amount)
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  })
}
