import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDemoStore = defineStore('demo', () => {
    // State
    const isDemoMode = ref(import.meta.env.VITE_DEMO_MODE === 'true')
    const scenarioState = ref({})
    
    // Actions
    const toggleDemoMode = () => {
        isDemoMode.value = !isDemoMode.value
    }

    const setScenarioState = (key, value) => {
        scenarioState.value[key] = value
    }

    const getScenarioState = (key) => {
        return scenarioState.value[key]
    }

    // Helper to simulate delay with visual feedback options if needed
    const simulateDelay = (ms = 1000) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // Mock Data Generators
    const mockUser = {
        firstName: 'Somchai',
        lastName: 'Jaidee',
        phone: '0812345678',
        kycStatus: 'VERIFIED',
    }

    return {
        isDemoMode,
        scenarioState,
        toggleDemoMode,
        setScenarioState,
        getScenarioState,
        simulateDelay,
        mockUser
    }
})
