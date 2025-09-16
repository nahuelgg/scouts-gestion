import axios from 'axios'
import { LoginCredentials, User } from '../types'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las requests
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

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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

// Servicios de personas
export const personasAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/personas', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/personas/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/personas', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/personas/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/personas/${id}`)
    return response.data
  },
}

// Servicios de pagos
export const pagosAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/pagos', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/pagos/${id}`)
    return response.data
  },

  create: async (data: FormData) => {
    const response = await api.post('/pagos', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id: string, data: FormData) => {
    const response = await api.put(`/pagos/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pagos/${id}`)
    return response.data
  },

  getResumenSocio: async (socioId: string, año?: number) => {
    const response = await api.get(`/pagos/resumen/${socioId}`, {
      params: { año },
    })
    return response.data
  },
}

// Servicios de ramas
export const ramasAPI = {
  getAll: async () => {
    const response = await api.get('/ramas')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/ramas/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/ramas', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/ramas/${id}`, data)
    return response.data
  },
}

// Servicios de usuarios
export const usuariosAPI = {
  getAll: async () => {
    const response = await api.get('/usuarios')
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/usuarios', data)
    return response.data
  },
}

export default api
