import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import type { ApiConfig, ApiError } from '../types/api'
import { APP_CONSTANTS, validateConfig } from '../types/api'
import { showFrontendConfigStatus } from '../utils/configValidator'

// Mostrar estado de configuración en desarrollo
if (process.env.NODE_ENV === 'development') {
  showFrontendConfigStatus()
}

// Configuración centralizada
const CONFIG: ApiConfig = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  ENABLE_RETRY: process.env.REACT_APP_ENABLE_RETRY === 'true',
  MAX_RETRIES: parseInt(process.env.REACT_APP_MAX_RETRIES || '3'),
  TOKEN_STORAGE_KEY: APP_CONSTANTS.STORAGE_KEYS.TOKEN,
  USER_STORAGE_KEY: APP_CONSTANTS.STORAGE_KEYS.USER,
  LOGIN_REDIRECT: APP_CONSTANTS.ROUTES.LOGIN,
}

// Validar configuración al inicializar
if (!validateConfig(CONFIG)) {
  console.error('Configuración de API inválida:', CONFIG)
}

const API_URL = `${CONFIG.API_BASE_URL}/api`

// Función helper para manejo de tokens
const getAuthToken = (): string | null => {
  return localStorage.getItem(CONFIG.TOKEN_STORAGE_KEY)
}

// Función helper para limpiar sesión
const clearSession = (): void => {
  localStorage.removeItem(CONFIG.TOKEN_STORAGE_KEY)
  localStorage.removeItem(CONFIG.USER_STORAGE_KEY)
}

// Función helper para redirección de login
const redirectToLogin = (): void => {
  window.location.href = CONFIG.LOGIN_REDIRECT
}

// Función helper para configurar headers de autenticación
const setAuthHeader = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = getAuthToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

// Crear instancia de axios con configuración centralizada
const api = axios.create({
  baseURL: API_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    return setAuthHeader(config)
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
  (error: ApiError) => {
    // Manejo de errores de autenticación
    if (error.response?.status === APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
      // Token expirado o inválido
      clearSession()
      redirectToLogin()
      return Promise.reject(
        new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      )
    }

    // Manejo de errores de permisos
    if (error.response?.status === APP_CONSTANTS.HTTP_STATUS.FORBIDDEN) {
      return Promise.reject(
        new Error('No tienes permisos para realizar esta acción.')
      )
    }

    // Manejo de errores de red
    if (error.code === APP_CONSTANTS.ERROR_CODES.NETWORK_ERROR) {
      return Promise.reject(
        new Error('Tiempo de espera agotado. Verifica tu conexión.')
      )
    }

    if (error.code === APP_CONSTANTS.ERROR_CODES.CONNECTION_REFUSED) {
      return Promise.reject(
        new Error('No se puede conectar al servidor. Verifica tu conexión.')
      )
    }

    // Manejo de errores del servidor
    if (
      error.response?.status &&
      error.response.status >= APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR
    ) {
      return Promise.reject(
        new Error('Error interno del servidor. Inténtalo más tarde.')
      )
    }

    // Manejo de errores específicos de la API
    const apiMessage =
      error.response?.data?.message || error.response?.data?.error
    if (apiMessage) {
      return Promise.reject(new Error(apiMessage))
    }

    return Promise.reject(error)
  }
)

// Exportar configuración para uso en otros módulos
export { CONFIG as apiConfig }

export default api
