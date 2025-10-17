import { Persona, User } from '../types'

export interface SociosPermissions {
  canManageAll: boolean
  canManageRama: boolean
  canOnlyView: boolean
  canDeletePersona: (persona: Persona) => boolean
  canEditPersona: (persona: Persona) => boolean
  canManagePersona: (persona: Persona) => boolean
  canCreateNew: boolean
}

export const useSociosPermissions = (user: User | null): SociosPermissions => {
  const userRole = user?.rol?.nombre
  const userRamaId = user?.persona?.rama?._id

  const canManageAll = ['administrador', 'jefe de grupo'].includes(
    userRole || ''
  )
  const canManageRama = userRole === 'jefe de rama'
  const canOnlyView = !userRole || userRole === 'socio'

  // Función para verificar si puede eliminar una persona
  const canDeletePersona = (persona: Persona) => {
    if (!user) return false

    // Solo administrador y jefe de grupo pueden eliminar
    return ['administrador', 'jefe de grupo'].includes(userRole || '')
  }

  // Función para verificar si puede gestionar una persona específica
  const canManagePersona = (persona: Persona) => {
    if (!user) return false

    // Administrador y Jefe de Grupo pueden gestionar cualquier persona
    if (['administrador', 'jefe de grupo'].includes(userRole || '')) {
      return true
    }

    // Jefe de Rama solo puede gestionar personas de su rama asignada
    if (userRole === 'jefe de rama') {
      // Si el jefe de rama no tiene persona asignada con rama, no puede gestionar nada
      if (!user.persona?.rama) {
        return false
      }

      // Si la persona no tiene rama asignada, no puede ser gestionada por jefe de rama
      if (!persona.rama) {
        return false
      }

      // Verificar que la rama de la persona coincida con la rama del jefe
      return persona.rama._id === user.persona.rama._id
    }

    return false
  }

  // Función para verificar si puede editar una persona
  const canEditPersona = (persona: Persona) => {
    if (!user) return false

    // Los mismos permisos que para gestionar
    return canManagePersona(persona)
  }

  // Función para verificar si puede crear nuevos socios
  const canCreateNew = () => {
    if (!user) return false

    // Administrador, jefe de grupo y jefe de rama pueden crear
    return ['administrador', 'jefe de grupo', 'jefe de rama'].includes(
      userRole || ''
    )
  }

  return {
    canManageAll,
    canManageRama,
    canOnlyView,
    canDeletePersona,
    canEditPersona,
    canManagePersona,
    canCreateNew: canCreateNew(),
  }
}
