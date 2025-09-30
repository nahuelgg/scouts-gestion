import api from './baseApi'
import { RamaFormData } from '../types'

// Servicios de ramas
export const ramasAPI = {
  getAll: async () => {
    const response = await api.get('/ramas')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/ramas/${id}`)
    return response.data
  },

  create: async (data: RamaFormData) => {
    const response = await api.post('/ramas', data)
    return response.data
  },

  update: async (id: string, data: RamaFormData) => {
    const response = await api.put(`/ramas/${id}`, data)
    return response.data
  },
}