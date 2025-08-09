import axios from 'axios'
import { User } from '@incentiva/shared'

const API_BASE_URL = '/api'

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data.data
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', profileData)
    return response.data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh')
    return response.data.data
  },

  // OAuth methods
  async googleLogin(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/google`
  },

  async microsoftLogin(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/microsoft`
  }
} 