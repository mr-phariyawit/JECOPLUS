import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loanAccounts, getInstallments, getLoanById } from '../services/mockData'

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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        loans.value = loanAccounts
        isLoading.value = false
    }

    const fetchLoanDetail = async (loanId) => {
        isLoading.value = true
        await new Promise(resolve => setTimeout(resolve, 300))

        selectedLoan.value = getLoanById(loanId)
        installments.value = getInstallments(loanId)

        isLoading.value = false
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
