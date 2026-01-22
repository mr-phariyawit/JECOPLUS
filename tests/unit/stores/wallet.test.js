import { setActivePinia, createPinia } from 'pinia'
import { useWalletStore } from '@/stores/wallet'
import * as walletService from '@/services/walletService'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock services
vi.mock('@/services/walletService', () => ({
  getBalance: vi.fn(),
  topUp: vi.fn(),
  withdraw: vi.fn(),
  getTransactions: vi.fn()
}))

describe('Wallet Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useWalletStore()
    expect(store.balance).toBe(0)
    expect(store.points).toBe(0)
    expect(store.transactions).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  describe('fetchBalance', () => {
    it('updates balance state on success', async () => {
        const store = useWalletStore()
        
        // Mock API response
        const mockData = { amount: 5000.00, points: 120, currency: 'THB' }
        walletService.getBalance.mockResolvedValue(mockData)
        
        await store.fetchBalance()
        
        expect(store.balance).toBe(5000.00)
        expect(store.points).toBe(120)
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
    })
    
    it('handles error state correctly', async () => {
        const store = useWalletStore()
         walletService.getBalance.mockRejectedValue(new Error('Network Error'))
         
         await store.fetchBalance()
         
         expect(store.error).toBe('Network Error')
         expect(store.loading).toBe(false)
    })
  })

  describe('topUp', () => {
    it('calls API and refreshes balance', async () => {
        const store = useWalletStore()
        walletService.topUp.mockResolvedValue({ status: 'SUCCESS', transactionId: 'txn_123' })
        
        // Mock getBalance for the refresh call
        walletService.getBalance.mockResolvedValue({ amount: 6000.00, points: 120, currency: 'THB' })

        await store.topUp(1000, 'PROMPTPAY')
        
        expect(walletService.topUp).toHaveBeenCalledWith(1000, 'PROMPTPAY')
        expect(walletService.getBalance).toHaveBeenCalled()
        expect(store.balance).toBe(6000.00)
    })
  })
})
