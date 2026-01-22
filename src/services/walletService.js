import api from './api'

const MOCK_DELAY = 500

const mockBalance = { 
    amount: 5240.00, 
    points: 850, 
    currency: 'THB',
    lastUpdated: new Date().toISOString()
}

const mockTransactions = [
    { id: 'txn_1', type: 'TOPUP', amount: 1000, status: 'COMPLETED', date: '2026-01-20T10:30:00Z', title: 'เติมเงินผ่าน PROMPTPAY' },
    { id: 'txn_3', type: 'WITHDRAW', amount: -500, status: 'PENDING', date: '2026-01-18T09:15:00Z', title: 'ถอนเงินเข้าบัญชี' }
]

const mockBankAccounts = [
    { id: 'bank_1', bankName: 'SCB', accountName: 'นาย สมชาย ใจดี', accountNumber: '123-4-56789-0', isPrimary: true },
    { id: 'bank_2', bankName: 'KBANK', accountName: 'นาย สมชาย ใจดี', accountNumber: '987-6-54321-0', isPrimary: false }
]

export const getBalance = async () => {
    // In real app: return (await api.get('/wallet/balance')).data.data
    // For now, mock it
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    return mockBalance
}

export const topUp = async (amount, method) => {
    // In real app: return (await api.post('/wallet/topup', { amount, method })).data.data
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    if (amount < 100) throw new Error('MINIMUM_AMOUNT_100')
    
    mockBalance.amount += parseFloat(amount)
    return { status: 'COMPLETED', transactionId: `txn_${Date.now()}` }
}

export const withdraw = async (amount, bankId) => {
    // In real app: return (await api.post('/wallet/withdraw', { amount, bankId })).data.data
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    if (amount < 500) throw new Error('MINIMUM_AMOUNT_500')
    if (amount > mockBalance.amount) throw new Error('INSUFFICIENT_FUNDS')
    
    mockBalance.amount -= parseFloat(amount)
    return { status: 'PENDING', transactionId: `txn_${Date.now()}`, fee: 15 }
}

export const getTransactions = async (filters) => {
    // In real app: return (await api.get('/wallet/transactions', { params: filters })).data.data
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    return mockTransactions
}

export const getBankAccounts = async () => {
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    return mockBankAccounts
}

export const addBankAccount = async (account) => {
    await new Promise(r => setTimeout(r, MOCK_DELAY))
    const newAccount = { 
        id: `bank_${Date.now()}`, 
        ...account, 
        accountNumber: account.accountNumber.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4'), // Basic format mock
        isPrimary: mockBankAccounts.length === 0 
    }
    mockBankAccounts.push(newAccount)
    return newAccount
}

export const uploadStatement = async (file) => {
    await new Promise(r => setTimeout(r, MOCK_DELAY * 2))
    // Simulate parsing
    return {
        status: 'SUCCESS',
        extractedData: {
            transactions: 12,
            income: 45000,
            expenses: 32000
        }
    }
}
