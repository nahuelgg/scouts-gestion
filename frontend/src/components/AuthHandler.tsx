import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { checkAuthToken } from '../store/authSlice'
import { clearAllPersonas } from '../store/personasSlice'
import { clearAllPagos } from '../store/pagosSlice'
import { clearAllUsuarios } from '../store/usuariosSlice'

interface AuthHandlerProps {
  children: React.ReactNode
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const previousUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !isAuthenticated) {
      dispatch(checkAuthToken())
    }
  }, [dispatch, isAuthenticated])
  useEffect(() => {
    const currentUserId = user?.persona?._id

    // Si el usuario cambió (y no es la primera carga)
    if (
      currentUserId &&
      previousUserIdRef.current &&
      currentUserId !== previousUserIdRef.current
    ) {
      dispatch(clearAllPersonas())
      dispatch(clearAllPagos())
      dispatch(clearAllUsuarios())
    }
    previousUserIdRef.current = currentUserId || null
  }, [user?.persona?._id, dispatch])

  return <>{children}</> // Renderizar los children
}

export default AuthHandler
