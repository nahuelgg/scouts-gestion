import api from './baseApi'
import {
  PersonaFormData,
  FetchPersonasParams,
  PaginatedPersonasResponse,
} from '../types'

// Servicios de personas
export const personasAPI = {
  getAll: async (
    params?: FetchPersonasParams
  ): Promise<PaginatedPersonasResponse> => {
    const response = await api.get('/personas', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/personas/${id}`)
    return response.data
  },

  create: async (data: PersonaFormData) => {
    const response = await api.post('/personas', data)
    return response.data
  },

  update: async (id: string, data: PersonaFormData) => {
    const response = await api.put(`/personas/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/personas/${id}`)
    return response.data
  },

  restore: async (id: string) => {
    const response = await api.patch(`/personas/${id}/restore`)
    return response.data
  },
}
