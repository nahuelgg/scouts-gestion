import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import personasReducer from './personasSlice'
import usuariosReducer from './usuariosSlice'
import pagosReducer from './pagosSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    personas: personasReducer,
    usuarios: usuariosReducer,
    pagos: pagosReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
