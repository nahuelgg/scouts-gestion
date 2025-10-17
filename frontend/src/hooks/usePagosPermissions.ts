import { Pago, User } from '../types'

export interface PagosPermissions {
  canManageAll: boolean
  canManageRama: boolean
  canOnlyView: boolean
  canDeletePago: (pago: Pago) => boolean
  canEditPago: (pago: Pago) => boolean
  isPagoFromUserRama: (pago: Pago) => boolean
  isPagoFromUser: (pago: Pago) => boolean
}

export const usePagosPermissions = (user: User | null): PagosPermissions => {
  const userRole = user?.rol?.nombre
  const userRamaId = user?.persona?.rama?._id
  const userPersonaId = user?.persona?._id

  const canManageAll =
    userRole === 'administrador' || userRole === 'jefe de grupo'
  const canManageRama = userRole === 'jefe de rama'
  const canOnlyView = userRole === 'socio' || !userRole

  // Función para verificar si un pago pertenece a la rama del usuario
  const isPagoFromUserRama = (pago: Pago) => {
    return pago.socio?.rama?._id === userRamaId
  }

  // Función para verificar si un pago pertenece al usuario actual
  const isPagoFromUser = (pago: Pago) => {
    return pago.socio?._id === userPersonaId
  }

  // Función para verificar si el usuario puede eliminar un pago
  const canDeletePago = (pago: Pago) => {
    if (!user) return false

    const userRole = user.rol?.nombre

    // Administrador y jefe de grupo pueden eliminar cualquier pago
    if (['administrador', 'jefe de grupo'].includes(userRole)) {
      return true
    }

    // Jefe de rama puede eliminar pagos de su rama
    if (userRole === 'jefe de rama') {
      return isPagoFromUserRama(pago)
    }

    // Los socios NO pueden eliminar ningún pago
    return false
  }

  // Función para verificar si el usuario puede editar un pago
  const canEditPago = (pago: Pago) => {
    if (!user) return false

    const userRole = user.rol?.nombre

    // Administrador y jefe de grupo pueden editar cualquier pago
    if (['administrador', 'jefe de grupo'].includes(userRole)) {
      return true
    }

    // Jefe de rama puede editar pagos de su rama
    if (userRole === 'jefe de rama') {
      return isPagoFromUserRama(pago)
    }

    // Los socios NO pueden editar pagos
    return false
  }

  return {
    canManageAll,
    canManageRama,
    canOnlyView,
    canDeletePago,
    canEditPago,
    isPagoFromUserRama,
    isPagoFromUser,
  }
}
