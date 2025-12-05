import { useState } from 'react'
import { Persona, User } from '../types'

export interface SociosFilters {
  searchText: string
  selectedRama: string
  selectedFuncion: string
  selectedEstado: string
  showOnlyMayores: boolean
}

export const useSociosFilters = (user: User | null) => {
  const [filters, setFilters] = useState<SociosFilters>({
    searchText: '',
    selectedRama: '',
    selectedFuncion: '',
    selectedEstado: '',
    showOnlyMayores: false,
  })

  // Funciones helper para permisos
  const userRole = user?.rol?.nombre
  const userRamaId = user?.persona?.rama?._id

  const hasFullAccess = ['administrador', 'jefe de grupo'].includes(
    userRole || ''
  )

  const isJefeDeRama = userRole === 'jefe de rama'
  const isRestrictedUser = !userRole || (!hasFullAccess && !isJefeDeRama)

  const updateFilters = (newFilters: Partial<SociosFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      searchText: '',
      selectedRama: '',
      selectedFuncion: '',
      selectedEstado: '',
      showOnlyMayores: false,
    })
  }

  return {
    filters,
    updateFilters,
    clearFilters,
    hasFullAccess,
    isJefeDeRama,
    isRestrictedUser,
    userRamaId,
  }
}
