import api from './baseApi'
import { LoginCredentials } from '../types'

// Servicios de autenticación
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  },
}
