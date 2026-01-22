import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userProfile } from '../services/mockData'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const phone = ref('')
    const isLoggedIn = ref(false)
    const isLoading = ref(false)

    // Getters
    const fullName = computed(() => {
        if (!user.value) return ''
        return `${user.value.firstName} ${user.value.lastName}`
    })

    // Actions
    const setPhone = (phoneNumber) => {
        phone.value = phoneNumber
    }

    const sendOTP = async (phoneNumber) => {
        isLoading.value = true
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        phone.value = phoneNumber
        isLoading.value = false
        return true
    }

    const verifyOTP = async (otp) => {
        isLoading.value = true
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        if (otp === '123456') { // Mock OTP
            user.value = userProfile
            isLoggedIn.value = true
            isLoading.value = false
            return { success: true }
        }

        isLoading.value = false
        return { success: false, error: 'รหัส OTP ไม่ถูกต้อง' }
    }

    const logout = () => {
        user.value = null
        phone.value = ''
        isLoggedIn.value = false
    }

    return {
        user,
        phone,
        isLoggedIn,
        isLoading,
        fullName,
        setPhone,
        sendOTP,
        verifyOTP,
        logout
    }
})
