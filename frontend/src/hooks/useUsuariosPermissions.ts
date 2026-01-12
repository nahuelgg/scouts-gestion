import { User } from '../types'

export interface UsuariosPermissions {
  canManageAll: boolean
  canManageUsers: boolean
  canOnlyView: boolean
  canDeleteUser: (targetUser: User) => boolean
  canEditUser: (targetUser: User) => boolean
  canCreateUser: boolean
  canChangeUserRole: (targetUser: User, newRole: string) => boolean
}

export const useUsuariosPermissions = (
  currentUser: User | null
): UsuariosPermissions => {
  const userRole = currentUser?.rol?.nombre

  const canManageAll = userRole === 'administrador'
  const canManageUsers = ['administrador', 'jefe de grupo'].includes(
    userRole || ''
  )
  const canOnlyView = !canManageUsers
  const canDeleteUser = (targetUser: User) => {
    if (!currentUser) return false

    // Solo administrador y jefe de grupo pueden eliminar usuarios
    const allowedRoles = ['administrador', 'jefe de grupo']
    const currentRole = currentUser.rol?.nombre

    if (!allowedRoles.includes(currentRole)) {
      return false
    }

    // No puede eliminarse a sí mismo
    if (currentUser._id === targetUser._id) {
      return false
    }

    // Administrador puede eliminar cualquier usuario excepto otros administradores
    if (currentRole === 'administrador') {
      return targetUser.rol?.nombre !== 'administrador'
    }

    // Jefe de grupo solo puede eliminar socios
    if (currentRole === 'jefe de grupo') {
      return targetUser.rol?.nombre === 'socio'
    }

    return false
  }
  const canEditUser = (targetUser: User) => {
    if (!currentUser) return false

    // Puede editar si tiene permisos similares a eliminar, pero con más flexibilidad
    const currentRole = currentUser.rol?.nombre

    // Administrador puede editar cualquier usuario excepto otros administradores
    if (currentRole === 'administrador') {
      return (
        targetUser.rol?.nombre !== 'administrador' ||
        currentUser._id === targetUser._id
      )
    }

    // Jefe de grupo puede editar socios y jefes de rama
    if (currentRole === 'jefe de grupo') {
      return ['socio', 'jefe de rama'].includes(targetUser.rol?.nombre || '')
    }

    // Jefe de rama solo puede editar su propio perfil
    if (currentRole === 'jefe de rama') {
      return currentUser._id === targetUser._id
    }

    // Socio solo puede editar su propio perfil
    if (currentRole === 'socio') {
      return currentUser._id === targetUser._id
    }

    return false
  }
  const canCreateUser = () => {
    if (!currentUser) return false

    // Solo administrador y jefe de grupo pueden crear usuarios
    return ['administrador', 'jefe de grupo'].includes(userRole || '')
  }
  const canChangeUserRole = (targetUser: User, newRole: string) => {
    if (!currentUser) return false

    const currentRole = currentUser.rol?.nombre

    // Solo administrador puede cambiar roles
    if (currentRole !== 'administrador') {
      return false
    }

    // No puede cambiar su propio rol a un rol inferior
    if (currentUser._id === targetUser._id && newRole !== 'administrador') {
      return false
    }

    // No puede hacer administrador a otro usuario (solo puede haber uno)
    if (newRole === 'administrador' && currentUser._id !== targetUser._id) {
      return false
    }

    return true
  }

  return {
    canManageAll,
    canManageUsers,
    canOnlyView,
    canDeleteUser,
    canEditUser,
    canCreateUser: canCreateUser(),
    canChangeUserRole,
  }
}
