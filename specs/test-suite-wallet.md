# Test Suite: Wallet System

## Overview

Test suite defining validation scenarios for Wallet Management (WL-001), including balance tracking, top-ups, withdrawals, and transaction history.

**Tech Stack:**
- Backend: Jest + Supertest
- Frontend: Vitest + Pinia Testing

---

## 1. Backend Unit Tests

### 1.1 Wallet Service Tests

```javascript
// tests/unit/services/walletService.test.js

describe('WalletService', () => {
    describe('getBalance', () => {
        it('should return current wallet balance for valid user', async () => {
            const userId = 'user-uuid-123'
            const balance = await walletService.getBalance(userId)
            expect(balance).toHaveProperty('amount')
            expect(balance).toHaveProperty('currency', 'THB')
            expect(balance).toHaveProperty('points')
        })

        it('should throw error for non-existent user', async () => {
            await expect(walletService.getBalance('invalid-id'))
                .rejects.toThrow('USER_NOT_FOUND')
        })
    })

    describe('topUp', () => {
        it('should increase balance correctly', async () => {
            const userId = 'user-uuid-123'
            const initialBalance = 1000
            const amount = 500
            
            const result = await walletService.topUp(userId, amount, 'PROMPTPAY')
            
            expect(result.newBalance).toBe(initialBalance + amount)
            expect(result.transactionId).toBeDefined()
            expect(result.status).toBe('COMPLETED')
        })

        it('should validate minimum top-up amount (100 THB)', async () => {
            const userId = 'user-uuid-123'
            await expect(walletService.topUp(userId, 50, 'PROMPTPAY'))
                .rejects.toThrow('MINIMUM_AMOUNT_100')
        })
    })

    describe('withdraw', () => {
        it('should decrease balance correctly', async () => {
            const userId = 'user-uuid-123'
            const initialBalance = 2000
            const amount = 500
            const fee = 15
            
            const result = await walletService.withdraw(userId, amount, 'BANK-001')
            
            expect(result.newBalance).toBe(initialBalance - amount - fee)
            expect(result.fee).toBe(fee)
            expect(result.status).toBe('PENDING') // Asynchronous processing
        })

        it('should fail if insufficient funds', async () => {
            const userId = 'user-uuid-123'
            const amount = 1000000 // Exceeds balance
            
            await expect(walletService.withdraw(userId, amount, 'BANK-001'))
                .rejects.toThrow('INSUFFICIENT_FUNDS')
        })

        it('should validate minimum withdrawal amount (500 THB)', async () => {
            const userId = 'user-uuid-123'
            await expect(walletService.withdraw(userId, 100, 'BANK-001'))
                .rejects.toThrow('MINIMUM_AMOUNT_500')
        })
    })
})
```

## 2. Frontend Unit Tests

### 2.1 Wallet Store Tests (Pinia)

```javascript
// src/stores/__tests__/wallet.spec.js

import { setActivePinia, createPinia } from 'pinia'
import { useWalletStore } from '../wallet'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API service
vi.mock('../../services/api', () => ({
    get: vi.fn(),
    post: vi.fn()
}))

describe('Wallet Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('initializes with default state', () => {
        const store = useWalletStore()
        expect(store.balance).toBe(0)
        expect(store.points).toBe(0)
        expect(store.transactions).toEqual([])
        expect(store.loading).toBe(false)
    })

    describe('fetchBalance', () => {
        it('updates balance state on success', async () => {
            const store = useWalletStore()
            
            // Mock API response
            const mockData = { amount: 5000.00, points: 120 }
            vi.mocked(api.get).mockResolvedValue({ data: mockData })
            
            await store.fetchBalance()
            
            expect(store.balance).toBe(5000.00)
            expect(store.points).toBe(120)
            expect(store.loading).toBe(false)
        })
        
        it('handles error state correctly', async () => {
            const store = useWalletStore()
             vi.mocked(api.get).mockRejectedValue(new Error('Network Error'))
             
             await expect(store.fetchBalance()).rejects.toThrow()
             expect(store.error).toBeDefined()
        })
    })

    describe('topUp', () => {
        it('calls API and refreshes balance', async () => {
            const store = useWalletStore()
            vi.mocked(api.post).mockResolvedValue({ data: { status: 'SUCCESS' } })
            
            // Spy on fetchBalance to ensure it's called after topup
            const fetchSpy = vi.spyOn(store, 'fetchBalance')
            
            await store.topUp(1000, 'PROMPTPAY')
            
            expect(api.post).toHaveBeenCalledWith('/wallet/topup', { 
                amount: 1000, 
                method: 'PROMPTPAY' 
            })
            expect(fetchSpy).toHaveBeenCalled()
        })
    })
})
```
