// Re-exportar todos los servicios desde sus archivos modulares
export { authAPI } from './authApi'
export { personasAPI } from './personasApi'
export { pagosAPI } from './pagosApi'
export { ramasAPI } from './ramasApi'
export { usuariosAPI } from './usuariosApi'
export { rolesAPI } from './rolesApi'

// Exportar la instancia base de axios
export { default as api } from './baseApi'

// Exportar por defecto para compatibilidad
export { default } from './baseApi'
