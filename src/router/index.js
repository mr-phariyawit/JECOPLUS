import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const routes = [
    {
        path: '/',
        redirect: '/splash'
    },
    {
        path: '/splash',
        name: 'Splash',
        component: () => import('../views/SplashView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/otp',
        name: 'OTP',
        component: () => import('../views/OTPView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue')
    },
    {
        path: '/loans',
        name: 'Loans',
        component: () => import('../views/LoansView.vue')
    },
    {
        path: '/loan/:loanId',
        name: 'LoanDetail',
        component: () => import('../views/LoanDetailView.vue')
    },
    {
        path: '/pay/:loanId/:installmentId',
        name: 'PaymentMethods',
        component: () => import('../views/PaymentMethodsView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/pay/jwallet/:loanId/:installmentId',
        name: 'PayJWallet',
        component: () => import('../views/PayJWalletView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/pay/card/:loanId/:installmentId',
        name: 'PayCard',
        component: () => import('../views/PayCardView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/pay/bank/:loanId/:installmentId',
        name: 'PayBank',
        component: () => import('../views/PayBankView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/payment-result/:status',
        name: 'PaymentResult',
        component: () => import('../views/PaymentResultView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/payment-settings',
        name: 'PaymentSettings',
        component: () => import('../views/PaymentSettingsView.vue')
    },
    {
        path: '/notifications',
        name: 'Notifications',
        component: () => import('../views/NotificationsView.vue')
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue')
    },
    {
        path: '/support',
        name: 'Support',
        component: () => import('../views/SupportView.vue')
    },
    {
        path: '/ecosystem',
        name: 'Ecosystem',
        component: () => import('../views/EcosystemView.vue')
    },
    {
        path: '/apply',
        name: 'ApplyLoan',
        component: () => import('../views/ApplyLoanView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/apply/success',
        name: 'ApplySuccess',
        component: () => import('../views/ApplySuccessView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/apply/:loanId',
        name: 'ApplyLoanForm',
        component: () => import('../views/ApplyLoanFormView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/bills',
        name: 'BillPayment',
        component: () => import('../views/BillPaymentView.vue'),
        meta: { hideNavBar: true }
    },
    // Wallet Routes
    {
        path: '/wallet',
        name: 'Wallet',
        component: () => import('../views/WalletView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/wallet/topup',
        name: 'WalletTopUp',
        component: () => import('../views/TopUpView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/wallet/withdraw',
      name: 'withdraw',
      component: () => import('../views/WalletWithdrawView.vue'),
      meta: { hideNavBar: true }
    },
    {
      path: '/wallet/banks',
      name: 'banks',
      component: () => import('../views/BankAccountView.vue'),
      meta: { hideNavBar: true }
    },
    {
      path: '/loan/statement-upload',
      name: 'statement-upload',
      component: () => import('../views/BankStatementUploadView.vue'),
      meta: { hideNavBar: true }
    },
    {
      path: '/loan/score',
      name: 'credit-score',
      component: () => import('../views/CreditScoreResultView.vue'),
      meta: { hideNavBar: true }
    },
    // New AI & Demo Routes
    {
        path: '/ai-scoring',
        name: 'AICreditScoring',
        component: () => import('../views/AICreditScoringView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/business-impact',
        name: 'BusinessImpact',
        component: () => import('../views/BusinessImpactView.vue'),
        meta: { hideNavBar: true }
    },
    {
        path: '/architecture',
        name: 'SystemArchitecture',
        component: () => import('../views/SystemArchitectureView.vue'),
        meta: { hideNavBar: true }
    },
    // KYC Routes
    {
        path: '/kyc',
        name: 'KYC',
        component: () => import('../views/kyc/KYCStartView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/id-card',
        name: 'KYCIDCard',
        component: () => import('../views/kyc/KYCIDCardView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/ocr-confirm',
        name: 'KYCOCRConfirm',
        component: () => import('../views/kyc/KYCOCRConfirmView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/selfie',
        name: 'KYCSelfie',
        component: () => import('../views/kyc/KYCSelfieView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/liveness',
        name: 'KYCLiveness',
        component: () => import('../views/kyc/KYCLivenessView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/ndid',
        name: 'KYCNDID',
        component: () => import('../views/kyc/KYCNDIDView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    {
        path: '/kyc/result/:status',
        name: 'KYCResult',
        component: () => import('../views/kyc/KYCResultView.vue'),
        meta: { hideNavBar: true, requiresAuth: true }
    },
    // ============================================
    // Marketplace Routes
    // ============================================
    {
        path: '/marketplace',
        name: 'Marketplace',
        component: () => import('../views/MarketplaceView.vue')
    },
    {
        path: '/marketplace/product/:productId',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetailView.vue')
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('../views/CartView.vue')
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: () => import('../views/CheckoutView.vue')
    },
    {
        path: '/order-success/:orderId',
        name: 'OrderSuccess',
        component: () => import('../views/OrderSuccessView.vue'),
        meta: { hideNavBar: true }
    },
    // ============================================
    // Admin Routes
    // ============================================
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('../views/admin/AdminLoginView.vue'),
        meta: { isAdmin: true, requiresAdminAuth: false, hideNavBar: true }
    },
    {
        path: '/admin',
        component: () => import('../components/admin/AdminLayout.vue'),
        meta: { isAdmin: true, requiresAdminAuth: true, hideNavBar: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: () => import('../views/admin/AdminDashboardView.vue')
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/AdminUsersView.vue')
            },
            {
                path: 'users/:userId',
                name: 'AdminUserDetail',
                component: () => import('../views/admin/AdminUserDetailView.vue')
            },
            {
                path: 'kyc',
                name: 'AdminKYC',
                component: () => import('../views/admin/AdminKYCListView.vue')
            },
            {
                path: 'kyc/:sessionId',
                name: 'AdminKYCReview',
                component: () => import('../views/admin/AdminKYCReviewView.vue')
            },
            {
                path: 'loans',
                name: 'AdminLoans',
                component: () => import('../views/admin/AdminLoansView.vue')
            },
            {
                path: 'loans/:loanId',
                name: 'AdminLoanReview',
                component: () => import('../views/admin/AdminLoanReviewView.vue')
            },
            {
                path: 'logs',
                name: 'AdminLogs',
                component: () => import('../views/admin/AdminActivityLogsView.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
    // Check if route requires admin auth
    if (to.meta.requiresAdminAuth) {
        const adminStore = useAdminStore()

        // Initialize admin session if not already done
        if (!adminStore.isAuthenticated) {
            adminStore.initSession()
        }

        // If still not authenticated, redirect to admin login
        if (!adminStore.isAuthenticated) {
            next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
            return
        }
    }

    // If already logged in as admin and trying to access login page
    if (to.name === 'AdminLogin') {
        const adminStore = useAdminStore()
        adminStore.initSession()

        if (adminStore.isAuthenticated) {
            next({ name: 'AdminDashboard' })
            return
        }
    }

    next()
})

export default router
