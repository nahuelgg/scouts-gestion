import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Pago, FetchPagosParams, ApiError } from '../types'
import { pagosAPI } from '../services/api'

interface PagosState {
  pagos: Pago[]
  currentPago: Pago | null
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  total: number
}

const initialState: PagosState = {
  pagos: [],
  currentPago: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
}

// Async thunks
export const fetchPagos = createAsyncThunk(
  'pagos/fetchPagos',
  async (params: FetchPagosParams | undefined, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.getAll(params)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo pagos'
      )
    }
  }
)

export const fetchPagoById = createAsyncThunk(
  'pagos/fetchPagoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.getById(id)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo pago'
      )
    }
  }
)

export const createPago = createAsyncThunk(
  'pagos/createPago',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.create(data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error creando pago'
      )
    }
  }
)

export const updatePago = createAsyncThunk(
  'pagos/updatePago',
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.update(id, data)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error actualizando pago'
      )
    }
  }
)

export const deletePago = createAsyncThunk(
  'pagos/deletePago',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.delete(id)
      return { id, deletedPago: response.pago }
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error eliminando pago'
      )
    }
  }
)

export const restorePago = createAsyncThunk(
  'pagos/restorePago',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pagosAPI.restore(id)
      return response.pago
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error restaurando pago'
      )
    }
  }
)

export const fetchResumenPagosSocio = createAsyncThunk(
  'pagos/fetchResumenPagosSocio',
  async (
    { socioId, año }: { socioId: string; año?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await pagosAPI.getResumenSocio(socioId, año)
      return response
    } catch (error: unknown) {
      const apiError = error as ApiError
      return rejectWithValue(
        apiError.response?.data?.message || 'Error obteniendo resumen de pagos'
      )
    }
  }
)

const pagosSlice = createSlice({
  name: 'pagos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPago: (state) => {
      state.currentPago = null
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    clearAllPagos: (state) => {
      // Resetear completamente el estado al hacer logout
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    // Fetch Pagos
    builder
      .addCase(fetchPagos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPagos.fulfilled, (state, action) => {
        state.isLoading = false
        state.pagos = action.payload.pagos
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.total = action.payload.total
      })
      .addCase(fetchPagos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Pago By ID
    builder
      .addCase(fetchPagoById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPagoById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPago = action.payload
      })
      .addCase(fetchPagoById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Pago
    builder
      .addCase(createPago.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPago.fulfilled, (state, action) => {
        state.isLoading = false
        const newPago = action.payload.pago || action.payload
        state.pagos.unshift(newPago)
        state.total += 1
      })
      .addCase(createPago.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Pago
    builder
      .addCase(updatePago.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePago.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedPago = action.payload.pago || action.payload
        const index = state.pagos.findIndex((p) => p._id === updatedPago._id)
        if (index !== -1) {
          state.pagos[index] = updatedPago
        }
        state.currentPago = updatedPago
      })
      .addCase(updatePago.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Pago
    builder
      .addCase(deletePago.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePago.fulfilled, (state, action) => {
        state.isLoading = false
        const { deletedPago } = action.payload
        if (deletedPago) {
          const index = state.pagos.findIndex((p) => p._id === deletedPago._id)
          if (index !== -1) {
            state.pagos[index] = deletedPago
          }
        }
        if (state.currentPago?._id === action.payload.id) {
          state.currentPago = deletedPago || null
        }
      })
      .addCase(deletePago.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Restore Pago
    builder
      .addCase(restorePago.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(restorePago.fulfilled, (state, action) => {
        state.isLoading = false
        const restoredPago = action.payload
        const index = state.pagos.findIndex((p) => p._id === restoredPago._id)
        if (index !== -1) {
          state.pagos[index] = restoredPago
        }
        if (state.currentPago?._id === restoredPago._id) {
          state.currentPago = restoredPago
        }
      })
      .addCase(restorePago.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Resumen Pagos Socio
    builder
      .addCase(fetchResumenPagosSocio.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchResumenPagosSocio.fulfilled, (state, action) => {
        state.isLoading = false
        // El resumen se puede manejar por separado o agregarse a currentPago según necesidades
      })
      .addCase(fetchResumenPagosSocio.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentPago, setCurrentPage, clearAllPagos } =
  pagosSlice.actions
export default pagosSlice.reducer
