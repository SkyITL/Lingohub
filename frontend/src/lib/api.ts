import axios from 'axios'
import { logger } from './logger'

// Determine API URL with proper fallback for production
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api`
    logger.info('Using API URL from environment variable', { url })
    return url
  }

  // If we're in production (deployed), use production backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    const url = 'https://lingohub-backend.vercel.app/api'
    logger.info('Detected production environment, using production backend', {
      url,
      hostname: window.location.hostname
    })
    return url
  }

  // Development fallback
  const url = 'http://localhost:4000/api'
  logger.info('Using development backend', { url })
  return url
}

const API_BASE_URL = getApiBaseUrl()

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token and log requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lingohub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      logger.debug('Added auth token to request', {
        url: config.url,
        method: config.method,
        hasToken: true
      })
    } else {
      logger.debug('No auth token available', {
        url: config.url,
        method: config.method
      })
    }

    // Log the request
    logger.apiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      `${config.baseURL}${config.url}`,
      config.data
    )
  }
  return config
}, (error) => {
  logger.apiError('REQUEST', 'INTERCEPTOR', error)
  return Promise.reject(error)
})

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      `${response.config.baseURL}${response.config.url}`,
      response.status,
      response.data
    )
    return response
  },
  (error) => {
    // Log errors
    logger.apiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      `${error.config?.baseURL}${error.config?.url}` || 'UNKNOWN',
      error
    )

    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        logger.warn('Authentication failed, clearing tokens and redirecting to login')
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

  viewSolution: (id: string) =>
    api.post(`/problems/${id}/view-solution`),
}

// Solutions API
export const solutionsApi = {
  getAllSubmissions: (userId?: string) =>
    api.get('/solutions/submissions', { params: userId ? { userId } : {} }),

  getByProblem: (problemId: string, sortBy?: string) =>
    api.get(`/solutions/problem/${problemId}`, { params: { sortBy } }),

  submit: (problemId: string, content: string, files?: File[]) => {
    const formData = new FormData()
    formData.append('problemId', problemId)
    formData.append('content', content)

    // Add files if present
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file)
      })
    }

    return api.post('/solutions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  edit: (solutionId: string, content: string, files?: File[]) => {
    const formData = new FormData()
    formData.append('content', content)

    // Add files if present
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file)
      })
    }

    return api.put(`/solutions/${solutionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

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