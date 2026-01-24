import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as dataService from '@/services/dataService'

export const usePaymentStore = defineStore('payment', () => {
    // State
    const methods = ref([])
    const cards = ref([])
    const banks = ref([])
    const selectedMethod = ref(null)
    const selectedCard = ref(null)
    const selectedBank = ref(null)
    const isProcessing = ref(false)
    const lastTransaction = ref(null)

    // Actions
    const fetchPaymentMethods = async () => {
        try {
            methods.value = await dataService.getPaymentMethods()
            cards.value = await dataService.getLinkedCards()
            banks.value = await dataService.getLinkedBanks()
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
        }
    }

    const selectMethod = (methodType) => {
        selectedMethod.value = methods.value.find(m => m.type === methodType)
    }

    const selectCard = (cardId) => {
        selectedCard.value = cards.value.find(c => c.cardId === cardId)
    }

    const selectBank = (bankId) => {
        selectedBank.value = banks.value.find(b => b.bankId === bankId)
    }

    const payWithJWallet = async (loanId, installmentId, amount) => {
        isProcessing.value = true
        // Simulate J Wallet payment
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 90% success rate for demo
        const success = Math.random() > 0.1

        lastTransaction.value = {
            method: 'JWALLET',
            loanId,
            installmentId,
            amount,
            status: success ? 'SUCCESS' : 'FAILED',
            timestamp: new Date().toISOString(),
            reference: `JW${Date.now()}`
        }

        isProcessing.value = false
        return { success, transaction: lastTransaction.value }
    }

    const payWithCard = async (loanId, installmentId, amount, cardId) => {
        isProcessing.value = true
        await new Promise(resolve => setTimeout(resolve, 2500))

        const success = Math.random() > 0.1

        lastTransaction.value = {
            method: 'CREDIT_CARD',
            loanId,
            installmentId,
            amount,
            cardId,
            status: success ? 'SUCCESS' : 'FAILED',
            timestamp: new Date().toISOString(),
            reference: `CC${Date.now()}`
        }

        isProcessing.value = false
        return { success, transaction: lastTransaction.value }
    }

    const payWithBank = async (loanId, installmentId, amount, bankId) => {
        isProcessing.value = true
        await new Promise(resolve => setTimeout(resolve, 2000))

        const success = Math.random() > 0.1

        lastTransaction.value = {
            method: 'BANK_ACCOUNT',
            loanId,
            installmentId,
            amount,
            bankId,
            status: success ? 'SUCCESS' : 'FAILED',
            timestamp: new Date().toISOString(),
            reference: `BA${Date.now()}`
        }

        isProcessing.value = false
        return { success, transaction: lastTransaction.value }
    }

    const addCard = async (cardData) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newCard = {
            cardId: `CARD${Date.now()}`,
            ...cardData,
            isDefault: cards.value.length === 0
        }
        cards.value.push(newCard)
        return newCard
    }

    const removeCard = (cardId) => {
        cards.value = cards.value.filter(c => c.cardId !== cardId)
    }

    const addBank = async (bankData) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newBank = {
            bankId: `BANK${Date.now()}`,
            ...bankData,
            isDefault: banks.value.length === 0
        }
        banks.value.push(newBank)
        return newBank
    }

    const removeBank = (bankId) => {
        banks.value = banks.value.filter(b => b.bankId !== bankId)
    }

    // Listen for scenario changes
    if (typeof window !== 'undefined') {
        window.addEventListener('scenario:changed', () => {
            console.log('Payment store: Scenario changed, refreshing payment methods')
            fetchPaymentMethods()
        })
    }

    return {
        methods,
        cards,
        banks,
        selectedMethod,
        selectedCard,
        selectedBank,
        isProcessing,
        lastTransaction,
        fetchPaymentMethods,
        selectMethod,
        selectCard,
        selectBank,
        payWithJWallet,
        payWithCard,
        payWithBank,
        addCard,
        removeCard,
        addBank,
        removeBank
    }
})
