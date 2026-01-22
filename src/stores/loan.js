import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api' // Assuming we use direct API or a service wrapper

export const useLoanStore = defineStore('loan', () => {
    const score = ref(null)
    const status = ref(null) // APPROVED, REJECTED
    const factors = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Mock API call for now since we don't have full backend connected in Dev mode usually
    // But we should aim to use real service structure
    
    const calculateScore = async (data) => {
        loading.value = true
        error.value = null
        try {
            // In real app: const res = await api.post('/credit-score/calculate', data)
            // score.value = res.data.data.score ...
            
            // Mocking logic to match Backend for Frontend-only dev if needed
            // But let's try to assume we might hit the backend or at least mock the delay
            await new Promise(r => setTimeout(r, 1500))

            // Mock Response based on input (Frontend simulation)
            // If expense ratio > 0.7 -> Rejected
            const expenseRatio = data.expenses / data.income
            const isApproved = expenseRatio < 0.7 && data.income > 15000

            const mockScore = isApproved ? 
                720 + Math.floor(Math.random() * 100) : 
                500 + Math.floor(Math.random() * 150)

            score.value = mockScore
            status.value = isApproved ? 'APPROVED' : 'REJECTED'
            factors.value = {
                income: data.income,
                expenses: data.expenses,
                ratio: expenseRatio.toFixed(2)
            }
            
            return { score: score.value, status: status.value }
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        score,
        status,
        factors,
        loading,
        error,
        calculateScore
    }
})
