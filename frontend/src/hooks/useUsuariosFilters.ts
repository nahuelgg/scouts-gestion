import { useState, useMemo } from 'react'
import { User } from '../types'

export interface UsuariosFilters {
  searchText: string
  selectedRol: string
  selectedStatus: string
  showDeleted: boolean
}

export const useUsuariosFilters = (
  usuarios: User[],
  currentUser: User | null
) => {
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

  // Lógica de filtrado memoizada
  const filteredUsuarios = useMemo(() => {
    let filtered = usuarios

    // Filtrar usuarios eliminados si no se debe mostrar
    if (!filters.showDeleted) {
      filtered = filtered.filter((usuario) => !usuario.deleted)
    }

    // Filtrar por búsqueda de texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(
        (usuario) =>
          usuario.username.toLowerCase().includes(searchLower) ||
          (usuario.persona?.nombre &&
            usuario.persona.nombre.toLowerCase().includes(searchLower)) ||
          (usuario.persona?.apellido &&
            usuario.persona.apellido.toLowerCase().includes(searchLower)) ||
          (usuario.persona?.dni &&
            usuario.persona.dni.includes(filters.searchText))
      )
    }

    // Filtrar por rol
    if (filters.selectedRol) {
      filtered = filtered.filter(
        (usuario) => usuario.rol?.nombre === filters.selectedRol
      )
    }

    // Filtrar por estado
    if (filters.selectedStatus) {
      const isActive = filters.selectedStatus === 'activo'
      filtered = filtered.filter((usuario) => usuario.activo === isActive)
    }

    return filtered
  }, [usuarios, filters])

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
    filteredUsuarios,
    updateFilters,
    clearFilters,
    hasFullAccess,
  }
}
