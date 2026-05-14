import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Authentication API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  uploadReport: (formData, config = {}) => {
    return api.post('/upload-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  },
  analyzeReport: (data) => api.post('/analyze-report', data),

  // Report history
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  getReportTrends: () => api.get('/reports/trends'),


  // User / membership
  getProfile: () => api.get('/user/profile'),
  upgradeToPro: () => api.post('/user/upgrade'),
  resetPro: () => api.get('/user/reset-pro'),
  requestConsultation: (data) => api.post('/user/consultation', data),
  getConsultations: () => api.get('/user/consultations'),

  // Video consultation
  requestVideoConsultation: () => api.post('/user/video-consultation'),

  // Diet Tracker
  analyzeDietPhoto: (formData) => api.post('/diet/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDietLogs: () => api.get('/diet/logs'),
  getDietSummary: (days = 7) => api.get(`/diet/summary?days=${days}`),
}

export default api
