// Tipos para la configuración de la API
export interface ApiConfig {
  API_BASE_URL: string
  API_TIMEOUT: number
  ENABLE_RETRY: boolean
  MAX_RETRIES: number
  TOKEN_STORAGE_KEY: string
  USER_STORAGE_KEY: string
  LOGIN_REDIRECT: string
}

// Tipos para errores de API
export interface ApiError {
  response?: {
    status: number
    data?: {
      message?: string
      error?: string
    }
  }
  code?: string
  message: string
}

// Constantes de la aplicación
export const APP_CONSTANTS = {
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  ERROR_CODES: {
    NETWORK_ERROR: 'ECONNABORTED',
    CONNECTION_REFUSED: 'ECONNREFUSED',
    TIMEOUT: 'TIMEOUT',
  },
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
  },
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    SOCIOS: '/socios',
    PAGOS: '/pagos',
  },
} as const

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success?: boolean
}

// Tipos para paginación
export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

// Helper para validar configuración
export const validateConfig = (config: Partial<ApiConfig>): boolean => {
  const requiredFields: (keyof ApiConfig)[] = [
    'API_BASE_URL',
    'API_TIMEOUT',
    'TOKEN_STORAGE_KEY',
    'USER_STORAGE_KEY',
  ]

  return requiredFields.every((field) => config[field] !== undefined)
}
