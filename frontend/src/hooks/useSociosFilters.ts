import { useState, useMemo } from 'react'
import { Persona, User } from '../types'

export interface SociosFilters {
  searchText: string
  selectedRama: string
  selectedFuncion: string
  selectedEstado: string
  showOnlyMayores: boolean
}

export const useSociosFilters = (personas: Persona[], user: User | null) => {
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
  const userPersonaId = user?.persona?._id

  const hasFullAccess = [
    'administrador',
    'jefe de grupo',
    'jefe de rama',
  ].includes(userRole || '')
  const isRestrictedUser = !userRole || !hasFullAccess

  // Lógica de filtrado memoizada
  const filteredPersonas = useMemo(() => {
    let filtered = personas

    // FILTRO POR ROL: Los usuarios restringidos solo ven su propia información
    if (isRestrictedUser) {
      filtered = filtered.filter(
        (persona: Persona) => persona._id === userPersonaId
      )
    }

    // Filtrar por búsqueda de texto
    if (filters.searchText && hasFullAccess) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(
        (persona: Persona) =>
          persona.nombre?.toLowerCase().includes(searchLower) ||
          persona.apellido?.toLowerCase().includes(searchLower) ||
          persona.dni?.includes(filters.searchText) ||
          persona.email?.toLowerCase().includes(searchLower) ||
          persona.telefono?.includes(filters.searchText)
      )
    }

    // Filtrar por rama
    if (filters.selectedRama && hasFullAccess) {
      filtered = filtered.filter(
        (persona: Persona) => persona.rama?._id === filters.selectedRama
      )
    }

    // Filtrar por función
    if (filters.selectedFuncion) {
      filtered = filtered.filter(
        (persona: Persona) => persona.funcion === filters.selectedFuncion
      )
    }

    // Filtrar por estado
    if (filters.selectedEstado) {
      const isActive = filters.selectedEstado === 'true'
      filtered = filtered.filter(
        (persona: Persona) => persona.activo === isActive
      )
    }

    // Filtrar solo mayores de edad
    if (filters.showOnlyMayores) {
      filtered = filtered.filter((persona: Persona) => {
        if (!persona.fechaNacimiento) return false
        const today = new Date()
        const birthDate = new Date(persona.fechaNacimiento)
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18
        }

        return age >= 18
      })
    }

    return filtered
  }, [personas, filters, hasFullAccess, isRestrictedUser, userPersonaId])

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
    filteredPersonas,
    updateFilters,
    clearFilters,
    hasFullAccess,
    isRestrictedUser,
  }
}
