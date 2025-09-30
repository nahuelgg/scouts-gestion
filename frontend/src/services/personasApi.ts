import api from './baseApi'
import { PersonaFormData, FetchPersonasParams } from '../types'

// Servicios de personas
export const personasAPI = {
  getAll: async (params?: FetchPersonasParams) => {
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
}