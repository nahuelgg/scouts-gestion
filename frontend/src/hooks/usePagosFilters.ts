import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { Pago, User } from '../types'

export interface PagosFilters {
  searchText: string
  selectedMetodoPago: string
  selectedTipoPago: string
  selectedMes: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
}

export const usePagosFilters = (pagos: Pago[], user: User | null) => {
  const [filters, setFilters] = useState<PagosFilters>({
    searchText: '',
    selectedMetodoPago: '',
    selectedTipoPago: '',
    selectedMes: '',
    dateRange: null,
  })

  // Funciones helper para permisos
  const userRole = user?.rol?.nombre
  const userRamaId = user?.persona?.rama?._id
  const userPersonaId = user?.persona?._id

  const canOnlyView = userRole === 'socio' || !userRole

  const isPagoFromUser = (pago: Pago) => {
    return pago.socio?._id === userPersonaId
  }

  // Lógica de filtrado memoizada
  const filteredPagos = useMemo(() => {
    let filtered = pagos

    // FILTRO POR ROL: Los socios solo ven sus propios pagos
    if (canOnlyView) {
      filtered = filtered.filter((pago: Pago) => isPagoFromUser(pago))
    }

    // Filtrar por búsqueda de texto
    if (filters.searchText) {
      filtered = filtered.filter(
        (pago: Pago) =>
          pago.socio?.nombre
            ?.toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          pago.socio?.apellido
            ?.toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          pago.socio?.dni?.includes(filters.searchText) ||
          pago.mesCorrespondiente.includes(filters.searchText) ||
          pago.metodoPago
            .toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          pago.tipoPago.toLowerCase().includes(filters.searchText.toLowerCase())
      )
    }

    // Filtrar por método de pago
    if (filters.selectedMetodoPago) {
      filtered = filtered.filter(
        (pago: Pago) => pago.metodoPago === filters.selectedMetodoPago
      )
    }

    // Filtrar por tipo de pago
    if (filters.selectedTipoPago) {
      filtered = filtered.filter(
        (pago: Pago) => pago.tipoPago === filters.selectedTipoPago
      )
    }

    // Filtrar por mes
    if (filters.selectedMes) {
      filtered = filtered.filter(
        (pago: Pago) => pago.mesCorrespondiente === filters.selectedMes
      )
    }

    // Filtrar por rango de fechas
    if (filters.dateRange) {
      const [start, end] = filters.dateRange
      filtered = filtered.filter((pago: Pago) => {
        const fechaPago = dayjs(pago.fechaPago)
        return fechaPago.isAfter(start) && fechaPago.isBefore(end)
      })
    }

    return filtered
  }, [pagos, filters, canOnlyView, userPersonaId])

  const updateFilters = (newFilters: Partial<PagosFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      searchText: '',
      selectedMetodoPago: '',
      selectedTipoPago: '',
      selectedMes: '',
      dateRange: null,
    })
  }

  return {
    filters,
    filteredPagos,
    updateFilters,
    clearFilters,
  }
}
