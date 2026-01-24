import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mockDataService from '@/services/mockDataService'

/**
 * Scenario Store - Production-Ready Demo System
 * Manages 10 user personas with complete lifecycle data
 */
export const useScenarioStore = defineStore('scenario', () => {
  // ============================================
  // State
  // ============================================

  const currentScenarioId = ref(mockDataService.getCurrentScenarioId())
  const isLoading = ref(false)
  const error = ref(null)

  // Track when scenario was last switched
  const lastSwitchedAt = ref(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('jeco_scenario_switched_at')
      : null
  )

  // ============================================
  // Getters / Computed
  // ============================================

  /**
   * Get current scenario data
   */
  const currentScenario = computed(() => {
    return mockDataService.getCurrentScenario()
  })

  /**
   * Check if using legacy mock data
   */
  const isLegacyMode = computed(() => {
    return currentScenarioId.value === 'DEFAULT' || !currentScenario.value
  })

  /**
   * Get all available scenarios
   */
  const availableScenarios = computed(() => {
    return mockDataService.getAvailableScenarios()
  })

  /**
   * Get current scenario metadata
   */
  const currentScenarioInfo = computed(() => {
    const scenarios = availableScenarios.value
    return scenarios.find((s) => s.id === currentScenarioId.value) || scenarios[0]
  })

  /**
   * Get current scenario icon
   */
  const currentIcon = computed(() => {
    return currentScenarioInfo.value?.icon || '📦'
  })

  /**
   * Get current scenario name
   */
  const currentName = computed(() => {
    return currentScenarioInfo.value?.name || 'Legacy Mock Data'
  })

  /**
   * Get current scenario color
   */
  const currentColor = computed(() => {
    return currentScenarioInfo.value?.color || 'gray'
  })

  /**
   * Get scenario description (from metadata)
   */
  const scenarioDescription = computed(() => {
    if (isLegacyMode.value) {
      return 'Using original mock data (2 users, 2 loans)'
    }

    const metadata = mockDataService.getScenarioMetadata(currentScenarioId.value)
    if (!metadata) return ''

    const { user, loans } = metadata
    return `${user.age} ปี, รายได้ ${user.monthlyIncome.toLocaleString()} บาท/เดือน, Credit Score: ${user.creditScore}, สินเชื่อ ${loans.length} รายการ`
  })

  /**
   * Get scenario story/summary
   */
  const scenarioStory = computed(() => {
    if (isLegacyMode.value) {
      return 'Original demo data with basic loan information'
    }

    const metadata = mockDataService.getScenarioMetadata(currentScenarioId.value)
    return metadata?.description || ''
  })

  /**
   * Check if scenario banner should be shown
   */
  const shouldShowBanner = computed(() => {
    return !isLegacyMode.value
  })

  /**
   * Get user profile for current scenario
   */
  const userProfile = computed(() => {
    return mockDataService.getUserProfile()
  })

  /**
   * Get user loans for current scenario
   */
  const userLoans = computed(() => {
    return mockDataService.getUserLoans()
  })

  /**
   * Get active loans count
   */
  const activeLoansCount = computed(() => {
    return mockDataService.getActiveLoans().length
  })

  /**
   * Get pending installments count
   */
  const pendingInstallmentsCount = computed(() => {
    return mockDataService.getPendingInstallments().length
  })

  /**
   * Get unpaid late fees total
   */
  const totalUnpaidLateFees = computed(() => {
    const fees = mockDataService.getUnpaidLateFees()
    return fees.reduce((sum, f) => sum + f.appliedFee, 0)
  })

  /**
   * Get overall payment status for current scenario
   */
  const paymentStatus = computed(() => {
    const loans = userLoans.value
    if (!loans || loans.length === 0) return 'NO_LOANS'

    const hasOverdue = loans.some((l) => l.daysOverdue > 0)
    const hasActive = loans.some((l) => l.status === 'ACTIVE')
    const allPaid = loans.every((l) => l.status === 'PAID_OFF' || l.status === 'CLOSED')
    const hasSuspended = loans.some(
      (l) => l.status === 'SUSPENDED' || l.accountStatus === 'SUSPENDED'
    )

    if (hasSuspended) return 'SUSPENDED'
    if (allPaid) return 'ALL_PAID'
    if (hasOverdue) return 'OVERDUE'
    if (hasActive) return 'ACTIVE'

    return 'UNKNOWN'
  })

  /**
   * Get payment status display info
   */
  const paymentStatusInfo = computed(() => {
    const status = paymentStatus.value
    const statusMap = {
      NO_LOANS: { label: 'ไม่มีสินเชื่อ', color: 'gray', icon: '💤' },
      ALL_PAID: { label: 'ชำระครบถ้วน', color: 'green', icon: '✅' },
      ACTIVE: { label: 'ใช้งานปกติ', color: 'blue', icon: '✓' },
      OVERDUE: { label: 'ค้างชำระ', color: 'orange', icon: '⚠️' },
      SUSPENDED: { label: 'ระงับบัญชี', color: 'red', icon: '🚫' },
      UNKNOWN: { label: 'ไม่ทราบสถานะ', color: 'gray', icon: '❓' },
    }

    return statusMap[status] || statusMap.UNKNOWN
  })

  /**
   * Get scenario statistics for dashboard
   */
  const scenarioStats = computed(() => {
    const loans = userLoans.value
    const user = userProfile.value

    if (!loans || !user) {
      return {
        totalLoans: 0,
        activeLoans: 0,
        totalBorrowed: 0,
        totalRemaining: 0,
        totalPaid: 0,
        creditScore: 0,
      }
    }

    return {
      totalLoans: loans.length,
      activeLoans: activeLoansCount.value,
      totalBorrowed: loans.reduce((sum, l) => sum + l.principalAmount, 0),
      totalRemaining: loans.reduce((sum, l) => sum + l.totalRemaining, 0),
      totalPaid: loans.reduce((sum, l) => sum + l.totalPaid, 0),
      creditScore: user.creditScore || 0,
      pendingInstallments: pendingInstallmentsCount.value,
      unpaidLateFees: totalUnpaidLateFees.value,
    }
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Switch to a different scenario
   */
  const switchScenario = async (scenarioId) => {
    if (scenarioId === currentScenarioId.value) {
      console.log('Already in this scenario')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Use mockDataService to switch
      mockDataService.switchScenario(scenarioId)

      // Update local state
      currentScenarioId.value = scenarioId
      lastSwitchedAt.value = new Date().toISOString()

      console.log(`Switched to scenario: ${scenarioId}`)
    } catch (err) {
      error.value = err.message || 'Failed to switch scenario'
      console.error('Error switching scenario:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset to default (legacy) scenario
   */
  const resetToDefault = async () => {
    await switchScenario('DEFAULT')
  }

  /**
   * Reload current scenario data
   */
  const reloadScenario = () => {
    mockDataService.clearCaches()

    // Emit event for other stores to refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('scenario:reloaded', {
          detail: { scenarioId: currentScenarioId.value },
        })
      )
    }
  }

  /**
   * Get loan by ID (convenience method)
   */
  const getLoanById = (loanId) => {
    return mockDataService.getLoanById(loanId)
  }

  /**
   * Get installments for a loan (convenience method)
   */
  const getInstallments = (loanId) => {
    return mockDataService.getInstallments(loanId)
  }

  /**
   * Get transactions for a loan (convenience method)
   */
  const getTransactions = (loanId) => {
    return mockDataService.getTransactions(loanId)
  }

  /**
   * Get all transactions (convenience method)
   */
  const getAllTransactions = () => {
    return mockDataService.getAllTransactions()
  }

  /**
   * Get late fees for a loan (convenience method)
   */
  const getLateFees = (loanId) => {
    return mockDataService.getLateFees(loanId)
  }

  /**
   * Get audit events (convenience method)
   */
  const getAuditEvents = (loanId = null) => {
    return mockDataService.getAuditEvents(loanId)
  }

  /**
   * Calculate early repayment (convenience method)
   */
  const calculateEarlyRepayment = (loanId) => {
    return mockDataService.calculateEarlyRepayment(loanId)
  }

  /**
   * Create modification request (convenience method)
   */
  const createModificationRequest = (loanId, proposedChanges) => {
    return mockDataService.createModificationRequest(loanId, proposedChanges)
  }

  /**
   * Validate loan data (convenience method)
   */
  const validateLoan = (loanId) => {
    return mockDataService.validateLoan(loanId)
  }

  /**
   * Validate dates (convenience method)
   */
  const validateDates = (loanId) => {
    return mockDataService.validateDates(loanId)
  }

  // ============================================
  // Lifecycle - Listen to scenario changes
  // ============================================

  if (typeof window !== 'undefined') {
    window.addEventListener('scenario:changed', (event) => {
      const { scenarioId } = event.detail
      currentScenarioId.value = scenarioId
      lastSwitchedAt.value = new Date().toISOString()
    })
  }

  // ============================================
  // Return Store Interface
  // ============================================

  return {
    // State
    currentScenarioId,
    isLoading,
    error,
    lastSwitchedAt,

    // Computed
    currentScenario,
    isLegacyMode,
    availableScenarios,
    currentScenarioInfo,
    currentIcon,
    currentName,
    currentColor,
    scenarioDescription,
    scenarioStory,
    shouldShowBanner,
    userProfile,
    userLoans,
    activeLoansCount,
    pendingInstallmentsCount,
    totalUnpaidLateFees,
    paymentStatus,
    paymentStatusInfo,
    scenarioStats,

    // Actions
    switchScenario,
    resetToDefault,
    reloadScenario,
    getLoanById,
    getInstallments,
    getTransactions,
    getAllTransactions,
    getLateFees,
    getAuditEvents,
    calculateEarlyRepayment,
    createModificationRequest,
    validateLoan,
    validateDates,
  }
})
