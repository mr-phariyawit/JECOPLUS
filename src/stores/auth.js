import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '../services/authService'
import * as userService from '../services/userService'
import { getAccessToken, clearTokens } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const phone = ref('')
    const otpSessionId = ref('')
    const devOtp = ref('') // <--- For testing
    const isLoggedIn = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    // Getters
    const fullName = computed(() => {
        if (!user.value) return ''
        return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
    })

    const isKycVerified = computed(() => {
        return user.value?.kycStatus === 'VERIFIED'
    })

    // Actions

    /**
     * Set phone number
     */
    const setPhone = (phoneNumber) => {
        phone.value = phoneNumber
    }

    /**
     * Send OTP to phone number
     * @param {string} phoneNumber - Thai phone number (10 digits)
     */
    const sendOTP = async (phoneNumber) => {
        isLoading.value = true
        error.value = null

        try {
            const data = await authService.requestOtp(phoneNumber)
            phone.value = phoneNumber
            otpSessionId.value = data.sessionId

            return {
                success: true,
                sessionId: data.sessionId,
                expiresIn: data.expiresIn,
                maskedPhone: data.maskedPhone,
                // Development mode: show OTP hint
                ...(data.devOtp && { devOtp: data.devOtp }),
            }
            // Save devOtp to state for UI display
            if (data.devOtp) {
                devOtp.value = data.devOtp
            }
            return result
        } catch (err) {
            const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่'
            error.value = errorMessage
            return { success: false, error: errorMessage }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Verify OTP code
     * @param {string} otp - 6-digit OTP code
     */
    const verifyOTP = async (otp) => {
        if (!otpSessionId.value) {
            return { success: false, error: 'กรุณาขอรหัส OTP ก่อน' }
        }

        isLoading.value = true
        error.value = null

        try {
            const data = await authService.verifyOtp(otpSessionId.value, otp)

            user.value = {
                id: data.user.id,
                phone: data.user.phone,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                email: data.user.email,
                kycStatus: data.user.kycStatus,
                isNewUser: data.user.isNewUser,
            }
            isLoggedIn.value = true
            otpSessionId.value = ''

            return { success: true, isNewUser: data.user.isNewUser }
        } catch (err) {
            const errorData = err.response?.data?.error || {}
            const errorMessage = errorData.message || 'รหัส OTP ไม่ถูกต้อง'
            error.value = errorMessage

            return {
                success: false,
                error: errorMessage,
                code: errorData.code,
                details: errorData.details,
            }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Fetch user profile from API
     */
    const fetchProfile = async () => {
        if (!getAccessToken()) return

        isLoading.value = true
        error.value = null

        try {
            const profile = await userService.getProfile()
            user.value = profile
            isLoggedIn.value = true
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            // If token is invalid, clear session
            if (err.response?.status === 401) {
                clearTokens()
                user.value = null
                isLoggedIn.value = false
            }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Check and restore session from stored tokens
     */
    const checkAuth = async () => {
        const token = getAccessToken()
        if (token) {
            await fetchProfile()
        }
    }

    /**
     * Logout user
     * @param {boolean} allDevices - Logout from all devices
     */
    const logout = async (allDevices = false) => {
        isLoading.value = true

        try {
            await authService.logout(allDevices)
        } catch (err) {
            console.warn('Logout error:', err)
        } finally {
            user.value = null
            phone.value = ''
            otpSessionId.value = ''
            isLoggedIn.value = false
            isLoading.value = false
            error.value = null
        }
    }

    /**
     * Update user profile
     * @param {object} data - Profile data to update
     */
    const updateProfile = async (data) => {
        isLoading.value = true
        error.value = null

        try {
            const updated = await userService.updateProfile(data)
            user.value = { ...user.value, ...updated }
            return { success: true }
        } catch (err) {
            const errorMessage = err.response?.data?.error?.message || 'ไม่สามารถอัพเดทข้อมูลได้'
            error.value = errorMessage
            return { success: false, error: errorMessage }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Clear error state
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // State
        user,
        phone,
        otpSessionId,
        isLoggedIn,
        isLoading,
        error,

        // Getters
        fullName,
        isKycVerified,

        // Actions
        setPhone,
        sendOTP,
        verifyOTP,
        fetchProfile,
        checkAuth,
        logout,
        updateProfile,
        clearError,
        devOtp, // <--- Export it
    }
})
