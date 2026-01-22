import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as walletService from '@/services/walletService'

export const useWalletStore = defineStore('wallet', () => {
    // State
    const balance = ref(0)
    const points = ref(0)
    const transactions = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Actions
    const fetchBalance = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await walletService.getBalance()
            balance.value = data.amount
            points.value = data.points
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const topUp = async (amount, method) => {
        loading.value = true
        error.value = null
        try {
            await walletService.topUp(amount, method)
            await fetchBalance()
            await fetchTransactions() // Refresh transactions
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const withdraw = async (amount, bankId) => {
        loading.value = true
        error.value = null
        try {
            await walletService.withdraw(amount, bankId)
            await fetchBalance()
            await fetchTransactions()
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchTransactions = async (filters) => {
        // Don't set global loading here to avoid full page spinner if just refreshing list?
        // But for initial load it's fine.
        try {
            const data = await walletService.getTransactions(filters)
            transactions.value = data
        } catch (err) {
            console.error(err)
        }
    }

    const bankAccounts = ref([])
    
    // Bank Actions
    const fetchBankAccounts = async () => {
        try {
            const data = await walletService.getBankAccounts()
            bankAccounts.value = data
        } catch (err) {
            console.error(err)
        }
    }

    const addBankAccount = async (account) => {
        loading.value = true
        try {
            await walletService.addBankAccount(account)
            await fetchBankAccounts()
        } catch (err) {
            throw err
        } finally {
            loading.value = false
        }
    }

    const uploadStatement = async (file) => {
        loading.value = true
        try {
            return await walletService.uploadStatement(file)
        } catch (err) {
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        balance,
        points,
        transactions,
        loading,
        error,
        fetchBalance,
        topUp,
        withdraw,
        fetchTransactions,
        bankAccounts,
        fetchBankAccounts,
        addBankAccount,
        uploadStatement
    }
})
