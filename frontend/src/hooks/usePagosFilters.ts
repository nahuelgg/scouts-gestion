import { useState } from 'react'
import dayjs from 'dayjs'
import { User } from '../types'

export interface PagosFilters {
  searchText: string
  selectedMetodoPago: string
  selectedTipoPago: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
}

export const usePagosFilters = (user: User | null) => {
  const [filters, setFilters] = useState<PagosFilters>({
    searchText: '',
    selectedMetodoPago: '',
    selectedTipoPago: '',
    dateRange: null,
  })

  // Funciones helper para permisos
  const userRole = user?.rol?.nombre
  const canOnlyView = userRole === 'socio' || !userRole

  const updateFilters = (newFilters: Partial<PagosFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      searchText: '',
      selectedMetodoPago: '',
      selectedTipoPago: '',
      dateRange: null,
    })
  }

  return {
    filters,
    updateFilters,
    clearFilters,
    canOnlyView,
  }
}
