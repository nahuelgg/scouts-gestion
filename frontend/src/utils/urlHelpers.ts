/**
 * Utilidades para manejo de URLs de archivos y endpoints
 */

// Obtener base URL de la API sin /api
const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL || 'http://localhost:3001'
}

// Construir URL para archivos de uploads
export const buildUploadUrl = (filePath: string): string => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}/uploads/${filePath}`
}

// Construir URL para endpoints de API
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}/api/${
    endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  }`
}

// Validar si una URL es accesible (para debugging)
export const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'development') {
    return true // No hacer checks en producción
  }

  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Configuración de URLs centralizadas
export const URL_CONFIG = {
  API_BASE: getApiBaseUrl(),
  UPLOADS_BASE: `${getApiBaseUrl()}/uploads`,
  API_ENDPOINTS: `${getApiBaseUrl()}/api`,

  // Helpers para endpoints específicos
  auth: {
    login: buildApiUrl('/auth/login'),
    profile: buildApiUrl('/auth/profile'),
    changePassword: buildApiUrl('/auth/change-password'),
  },

  uploads: {
    base: `${getApiBaseUrl()}/uploads`,
    comprobantes: (year: number) => `${getApiBaseUrl()}/uploads/${year}`,
    buildPath: (filePath: string) => buildUploadUrl(filePath),
  },
}

export default {
  buildUploadUrl,
  buildApiUrl,
  checkUrlAccessibility,
  URL_CONFIG,
}
