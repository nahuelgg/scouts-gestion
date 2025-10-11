import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  Persona,
  PersonaFormData,
  FetchPersonasParams,
  ApiError,
} from '../types'
import { personasAPI } from '../services/api'

interface PersonasState {
  personas: Persona[]
  currentPersona: Persona | null
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  total: number
}

const initialState: PersonasState = {
  personas: [],
  currentPersona: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
}

// Async thunks
export const fetchPersonas = createAsyncThunk(
  'personas/fetchPersonas',
  async (params: FetchPersonasParams = {}, { rejectWithValue }) => {
    try {
      const response = await personasAPI.getAll(params)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo personas'
      )
    }
  }
)

export const fetchPersonaById = createAsyncThunk(
  'personas/fetchPersonaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await personasAPI.getById(id)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo persona'
      )
    }
  }
)

export const createPersona = createAsyncThunk(
  'personas/createPersona',
  async (data: PersonaFormData, { rejectWithValue }) => {
    try {
      const response = await personasAPI.create(data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error creando persona'
      )
    }
  }
)

export const updatePersona = createAsyncThunk(
  'personas/updatePersona',
  async (
    { id, data }: { id: string; data: PersonaFormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await personasAPI.update(id, data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error actualizando persona'
      )
    }
  }
)

export const deletePersona = createAsyncThunk(
  'personas/deletePersona',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await personasAPI.delete(id)
      return { id, deletedPersona: response.persona }
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error eliminando persona'
      )
    }
  }
)

export const restorePersona = createAsyncThunk(
  'personas/restorePersona',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await personasAPI.restore(id)
      return response.persona
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error restaurando persona'
      )
    }
  }
)

const personasSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPersona: (state) => {
      state.currentPersona = null
    },
    clearAllPersonas: (state) => {
      // Resetear completamente el estado al hacer logout
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    // Fetch Personas
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.isLoading = false
        state.personas = action.payload.personas
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.total = action.payload.total
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Persona By ID
    builder
      .addCase(fetchPersonaById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPersonaById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPersona = action.payload
      })
      .addCase(fetchPersonaById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Persona
    builder
      .addCase(createPersona.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.isLoading = false
        state.personas.unshift(action.payload.persona)
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Persona
    builder
      .addCase(updatePersona.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.personas.findIndex(
          (p) => p._id === action.payload.persona._id
        )
        if (index !== -1) {
          state.personas[index] = action.payload.persona
        }
        state.currentPersona = action.payload.persona
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Persona
    builder
      .addCase(deletePersona.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.isLoading = false
        const { deletedPersona } = action.payload
        if (deletedPersona) {
          const index = state.personas.findIndex(
            (p) => p._id === deletedPersona._id
          )
          if (index !== -1) {
            state.personas[index] = deletedPersona
          }
        }
        if (state.currentPersona?._id === action.payload.id) {
          state.currentPersona = deletedPersona || null
        }
      })
      .addCase(deletePersona.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Restore Persona
    builder
      .addCase(restorePersona.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(restorePersona.fulfilled, (state, action) => {
        state.isLoading = false
        const restoredPersona = action.payload
        const index = state.personas.findIndex(
          (p) => p._id === restoredPersona._id
        )
        if (index !== -1) {
          state.personas[index] = restoredPersona
        }
        if (state.currentPersona?._id === restoredPersona._id) {
          state.currentPersona = restoredPersona
        }
      })
      .addCase(restorePersona.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentPersona, clearAllPersonas } =
  personasSlice.actions
export default personasSlice.reducer
