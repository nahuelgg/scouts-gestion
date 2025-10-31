import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { checkAuthToken } from '../store/authSlice'
import { clearAllPersonas } from '../store/personasSlice'
import { clearAllPagos } from '../store/pagosSlice'
import { clearAllUsuarios } from '../store/usuariosSlice'

interface AuthHandlerProps {
  children: React.ReactNode
}

/**
 * Componente que maneja la autenticación y limpieza de estado
 * Se ejecuta al inicio de la aplicación y cuando cambia el usuario
 */
const AuthHandler: React.FC<AuthHandlerProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const previousUserIdRef = useRef<string | null>(null)

  // Verificar autenticación al inicio
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !isAuthenticated) {
      dispatch(checkAuthToken())
    }
  }, [dispatch, isAuthenticated])

  // Limpiar estado cuando cambia el usuario
  useEffect(() => {
    const currentUserId = user?.persona?._id

    // Si el usuario cambió (y no es la primera carga)
    if (
      currentUserId &&
      previousUserIdRef.current &&
      currentUserId !== previousUserIdRef.current
    ) {
      console.log('🧹 Usuario cambió, limpiando estado previo...')
      dispatch(clearAllPersonas())
      dispatch(clearAllPagos())
      dispatch(clearAllUsuarios())
    }

    // Actualizar la referencia
    previousUserIdRef.current = currentUserId || null
  }, [user?.persona?._id, dispatch])

  return <>{children}</> // Renderizar los children
}

export default AuthHandler
