import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import personasReducer from './personasSlice'
import usuariosReducer from './usuariosSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    personas: personasReducer,
    usuarios: usuariosReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
