import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User, UsuarioFormData, ApiError } from '../types'
import { usuariosAPI } from '../services/api'

interface UsuariosState {
  usuarios: User[]
  currentUsuario: User | null
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  total: number
}

const initialState: UsuariosState = {
  usuarios: [],
  currentUsuario: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
}

// Async thunks
export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchUsuarios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usuariosAPI.getAll()
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo usuarios'
      )
    }
  }
)

export const fetchUsuarioById = createAsyncThunk(
  'usuarios/fetchUsuarioById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usuariosAPI.getById(id)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo usuario'
      )
    }
  }
)

export const createUsuario = createAsyncThunk(
  'usuarios/createUsuario',
  async (data: UsuarioFormData, { rejectWithValue }) => {
    try {
      const response = await usuariosAPI.create(data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error creando usuario'
      )
    }
  }
)

export const updateUsuario = createAsyncThunk(
  'usuarios/updateUsuario',
  async (
    { id, data }: { id: string; data: Partial<UsuarioFormData> },
    { rejectWithValue }
  ) => {
    try {
      const response = await usuariosAPI.update(id, data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error actualizando usuario'
      )
    }
  }
)

export const deleteUsuario = createAsyncThunk(
  'usuarios/deleteUsuario',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usuariosAPI.delete(id)
      return { id, deletedUsuario: response.usuario }
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error eliminando usuario'
      )
    }
  }
)

export const restoreUsuario = createAsyncThunk(
  'usuarios/restoreUsuario',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usuariosAPI.restore(id)
      return response.usuario
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error restaurando usuario'
      )
    }
  }
)

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUsuario: (state) => {
      state.currentUsuario = null
    },
    clearAllUsuarios: (state) => {
      // Resetear completamente el estado al hacer logout
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    // Fetch Usuarios
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.isLoading = false
        state.usuarios = action.payload.usuarios || action.payload
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Usuario By ID
    builder
      .addCase(fetchUsuarioById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsuarioById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUsuario = action.payload
      })
      .addCase(fetchUsuarioById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Usuario
    builder
      .addCase(createUsuario.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUsuario.fulfilled, (state, action) => {
        state.isLoading = false
        state.usuarios.unshift(action.payload.usuario || action.payload)
      })
      .addCase(createUsuario.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Usuario
    builder
      .addCase(updateUsuario.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUsuario.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedUsuario = action.payload.usuario || action.payload
        const index = state.usuarios.findIndex(
          (u) => u._id === updatedUsuario._id
        )
        if (index !== -1) {
          state.usuarios[index] = updatedUsuario
        }
        state.currentUsuario = updatedUsuario
      })
      .addCase(updateUsuario.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Usuario
    builder
      .addCase(deleteUsuario.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUsuario.fulfilled, (state, action) => {
        state.isLoading = false
        const { deletedUsuario } = action.payload
        if (deletedUsuario) {
          const index = state.usuarios.findIndex(
            (u) => u._id === deletedUsuario._id
          )
          if (index !== -1) {
            state.usuarios[index] = deletedUsuario
          }
        }
      })
      .addCase(deleteUsuario.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Restore Usuario
    builder
      .addCase(restoreUsuario.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(restoreUsuario.fulfilled, (state, action) => {
        state.isLoading = false
        const restoredUsuario = action.payload
        const index = state.usuarios.findIndex(
          (u) => u._id === restoredUsuario._id
        )
        if (index !== -1) {
          state.usuarios[index] = restoredUsuario
        }
      })
      .addCase(restoreUsuario.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentUsuario, clearAllUsuarios } =
  usuariosSlice.actions
export default usuariosSlice.reducer
