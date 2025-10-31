import api from './baseApi'
import { UsuarioFormData, FetchUsuariosParams } from '../types'

// Servicios de usuarios
export const usuariosAPI = {
  getAll: async (params?: FetchUsuariosParams) => {
    const response = await api.get('/usuarios', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  create: async (data: UsuarioFormData) => {
    const response = await api.post('/usuarios', data)
    return response.data
  },

  update: async (id: string, data: Partial<UsuarioFormData>) => {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  },

  restore: async (id: string) => {
    const response = await api.patch(`/usuarios/${id}/restore`)
    return response.data
  },
}
