import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import personasReducer from './personasSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    personas: personasReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
