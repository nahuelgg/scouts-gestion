import { useState } from 'react'
import { User } from '../types'

export interface UsuariosFilters {
  searchText: string
  selectedRol: string
  selectedStatus: string
  showDeleted: boolean
}

export const useUsuariosFilters = (currentUser: User | null) => {
  const [filters, setFilters] = useState<UsuariosFilters>({
    searchText: '',
    selectedRol: '',
    selectedStatus: '',
    showDeleted: false,
  })

  // Funciones helper para permisos
  const userRole = currentUser?.rol?.nombre
  const hasFullAccess = ['administrador', 'jefe de grupo'].includes(
    userRole || ''
  )

  const updateFilters = (newFilters: Partial<UsuariosFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      searchText: '',
      selectedRol: '',
      selectedStatus: '',
      showDeleted: false,
    })
  }

  return {
    filters,
    updateFilters,
    clearFilters,
    hasFullAccess,
  }
}
