import axios from 'axios'

// Determine API URL with proper fallback for production
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`
  }

  // If we're in production (deployed), use production backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://lingohub-backend.vercel.app/api'
  }

  // Development fallback
  return 'http://localhost:4000/api'
}

const API_BASE_URL = getApiBaseUrl()

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL)
  console.log('ENV Variable:', process.env.NEXT_PUBLIC_API_URL)
  console.log('Hostname:', window.location.hostname)
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lingohub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lingohub_token')
        localStorage.removeItem('lingohub_user')
        // Redirect to login or show login modal
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
}

// Problems API
export const problemsApi = {
  getAll: (filters?: Record<string, any>) =>
    api.get('/problems', { params: filters }),
  
  getById: (id: string) =>
    api.get(`/problems/${id}`),
  
  getStats: () =>
    api.get('/problems/stats/overview'),
}

// Solutions API
export const solutionsApi = {
  getByProblem: (problemId: string, sortBy?: string) =>
    api.get(`/solutions/problem/${problemId}`, { params: { sortBy } }),
  
  submit: (problemId: string, content: string) =>
    api.post('/solutions', { problemId, content }),
  
  vote: (solutionId: string, vote: number) =>
    api.post(`/solutions/${solutionId}/vote`, { vote }),
  
  delete: (solutionId: string) =>
    api.delete(`/solutions/${solutionId}`),
}

// Discussions API
export const discussionsApi = {
  getByProblem: (problemId: string, sortBy?: string) =>
    api.get(`/discussions/problem/${problemId}`, { params: { sortBy } }),
  
  create: (problemId: string, title: string, content: string) =>
    api.post('/discussions', { problemId, title, content }),
  
  getById: (id: string) =>
    api.get(`/discussions/${id}`),
}

// Users API
export const usersApi = {
  getProfile: (id: string) =>
    api.get(`/users/${id}/profile`),
  
  getProgress: (id: string) =>
    api.get(`/users/${id}/progress`),
  
  updateProgress: (id: string, problemId: string, status: string) =>
    api.patch(`/users/${id}/progress/${problemId}`, { status }),
}

export default api