import { User } from '../../types'

// Utilidades para mostrar información de usuarios con colores y formato

export const getRolColor = (rol: string): string => {
  switch (rol) {
    case 'administrador':
      return 'red'
    case 'jefe de grupo':
      return 'purple'
    case 'jefe de rama':
      return 'blue'
    case 'socio':
      return 'green'
    default:
      return 'default'
  }
}

export const getRolDisplay = (rol: string): string => {
  switch (rol) {
    case 'administrador':
      return 'Administrador'
    case 'jefe de grupo':
      return 'Jefe de Grupo'
    case 'jefe de rama':
      return 'Jefe de Rama'
    case 'socio':
      return 'Socio'
    default:
      return rol
  }
}

export const getEstadoColor = (activo: boolean): string => {
  return activo ? 'green' : 'red'
}

export const getEstadoDisplay = (activo: boolean): string => {
  return activo ? 'Activo' : 'Inactivo'
}

export const formatLastLogin = (
  lastLogin: string | Date | undefined
): string => {
  if (!lastLogin) return 'Nunca'

  const date = new Date(lastLogin)
  const now = new Date()
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  )

  if (diffInHours < 1) return 'Hace menos de 1 hora'
  if (diffInHours < 24) return `Hace ${diffInHours} horas`
  if (diffInHours < 48) return 'Ayer'

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatUserFullName = (user: User): string => {
  if (!user.persona) return user.username
  return `${user.persona.nombre} ${user.persona.apellido}`
}

export const getUserDisplayInfo = (
  user: User
): { name: string; subtitle: string } => {
  const name = user.persona
    ? `${user.persona.nombre} ${user.persona.apellido}`
    : user.username
  const subtitle = user.persona ? `@${user.username}` : 'Sin persona asignada'

  return { name, subtitle }
}

// Constantes para opciones de filtros
export const ROLES = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'jefe de grupo', label: 'Jefe de Grupo' },
  { value: 'jefe de rama', label: 'Jefe de Rama' },
  { value: 'socio', label: 'Socio' },
]

export const ESTADOS_USUARIO = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

// Funciones de validación
export const canUserAccessRole = (
  userRole: string,
  targetRole: string
): boolean => {
  const hierarchy = {
    administrador: 4,
    'jefe de grupo': 3,
    'jefe de rama': 2,
    socio: 1,
  }

  const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0
  const targetLevel = hierarchy[targetRole as keyof typeof hierarchy] || 0

  return userLevel >= targetLevel
}

export const getRoleHierarchyLevel = (rol: string): number => {
  const hierarchy = {
    administrador: 4,
    'jefe de grupo': 3,
    'jefe de rama': 2,
    socio: 1,
  }

  return hierarchy[rol as keyof typeof hierarchy] || 0
}

export const isUserSuperior = (
  userRole: string,
  targetRole: string
): boolean => {
  return getRoleHierarchyLevel(userRole) > getRoleHierarchyLevel(targetRole)
}
