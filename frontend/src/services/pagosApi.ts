import api from './baseApi'
import { FetchPagosParams } from '../types'

// Servicios de pagos
export const pagosAPI = {
  getAll: async (params?: FetchPagosParams) => {
    const response = await api.get('/pagos', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/pagos/${id}`)
    return response.data
  },

  create: async (data: FormData) => {
    const response = await api.post('/pagos', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id: string, data: FormData) => {
    const response = await api.put(`/pagos/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pagos/${id}`)
    return response.data
  },

  getResumenSocio: async (socioId: string, año?: number) => {
    const response = await api.get(`/pagos/resumen/${socioId}`, {
      params: { año },
    })
    return response.data
  },
}