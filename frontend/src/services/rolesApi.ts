import api from './baseApi'

// Servicios de roles
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },
}
