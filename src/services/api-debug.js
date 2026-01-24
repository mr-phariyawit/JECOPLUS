// Enhanced API debug wrapper
// Add this temporarily to debug the issue

import api from './api'

// Intercept all requests and log them
const originalRequest = api.interceptors.request.handlers[0].fulfilled

api.interceptors.request.use(
  (config) => {
    console.log('[API DEBUG] Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!config.headers.Authorization,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error('[API DEBUG] Request Error:', error)
    return Promise.reject(error)
  }
)

// Intercept all responses
api.interceptors.response.use(
  (response) => {
    console.log('[API DEBUG] Response:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    })
    return response
  },
  (error) => {
    console.error('[API DEBUG] Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      errorCode: error.response?.data?.error?.code,
      errorMessage: error.response?.data?.error?.message,
      willRedirect: error.response?.status === 401
    })
    return Promise.reject(error)
  }
)

export default api
