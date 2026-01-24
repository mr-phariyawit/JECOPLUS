import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import * as dataService from '@/services/dataService'

export const useLoansStore = defineStore('loans', () => {
    // State
    const loans = ref([])
    const selectedLoan = ref(null)
    const installments = ref([])
    const isLoading = ref(false)

    // Getters
    const activeLoans = computed(() => {
        return loans.value.filter(l => l.status === 'ACTIVE')
    })

    const totalBalance = computed(() => {
        return loans.value.reduce((sum, l) => sum + l.remainingBalance, 0)
    })

    const pendingInstallments = computed(() => {
        return installments.value.filter(i => i.status === 'PENDING')
    })

    const selectedInstallment = computed(() => {
        return (installmentId) => installments.value.find(i => i.installmentId === installmentId)
    })

    // Actions
    const fetchLoans = async () => {
        isLoading.value = true
        try {
            loans.value = await dataService.getUserLoans()
        } catch (error) {
            console.error('Failed to fetch loans:', error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchLoanDetail = async (loanId) => {
        isLoading.value = true
        try {
            selectedLoan.value = await dataService.getLoanById(loanId)
            installments.value = await dataService.getInstallments(loanId)
        } catch (error) {
            console.error('Failed to fetch loan detail:', error)
        } finally {
            isLoading.value = false
        }
    }

    const selectLoan = (loanId) => {
        selectedLoan.value = loans.value.find(l => l.loanId === loanId)
    }

    const markInstallmentPaid = (installmentId) => {
        const installment = installments.value.find(i => i.installmentId === installmentId)
        if (installment) {
            installment.status = 'PAID'
            installment.paidDate = new Date().toISOString().split('T')[0]

            // Update loan stats
            if (selectedLoan.value) {
                selectedLoan.value.paidInstallments += 1
                selectedLoan.value.remainingBalance -= installment.principal
            }
        }
    }

    // Listen for scenario changes
    if (typeof window !== 'undefined') {
        window.addEventListener('scenario:changed', () => {
            console.log('Loans store: Scenario changed, refreshing loans')
            fetchLoans()
            if (selectedLoan.value) {
                fetchLoanDetail(selectedLoan.value.loanId)
            }
        })
    }

    return {
        loans,
        selectedLoan,
        installments,
        isLoading,
        activeLoans,
        totalBalance,
        pendingInstallments,
        selectedInstallment,
        fetchLoans,
        fetchLoanDetail,
        selectLoan,
        markInstallmentPaid
    }
})
