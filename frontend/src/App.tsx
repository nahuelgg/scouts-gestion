import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { store } from './store'
import { useAppSelector } from './utils/hooks'
import AuthHandler from './components/AuthHandler'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SociosList from './pages/SociosList'
import SocioForm from './pages/SocioForm'
import SocioDetails from './pages/SocioDetails'
import UsuariosList from './pages/UsuariosList'
import UsuarioForm from './pages/UsuarioForm'
import UsuarioDetails from './pages/UsuarioDetails'
import PagosList from './pages/PagosList'
import PagoForm from './pages/PagoForm'
import PagoDetails from './pages/PagoDetails'
import ChangePassword from './pages/ChangePassword'
import 'antd/dist/reset.css'

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para redirección inteligente basada en rol
const SmartRedirect: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)

  const userRole = user?.rol?.nombre
  const fullAccessRoles = ['administrador', 'jefe de grupo', 'jefe de rama']

  // Si el usuario no tiene rol con acceso completo, redirigir a socios
  if (!userRole || !fullAccessRoles.includes(userRole)) {
    return <Navigate to="/socios" replace />
  }

  // Si tiene acceso completo, redirigir al dashboard
  return <Navigate to="/dashboard" replace />
}
// Componente para rutas con restricción de rol
const RoleRestrictedRoute: React.FC<{
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}> = ({ children, allowedRoles = [], redirectTo = '/socios' }) => {
  const { user } = useAppSelector((state) => state.auth)

  // Si no hay restricciones de rol, permitir acceso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Verificar si el usuario tiene un rol permitido
  const userRole = user?.rol?.nombre
  const hasPermission = !userRole || allowedRoles.includes(userRole)

  return hasPermission ? <>{children}</> : <Navigate to={redirectTo} replace />
}

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

const AppContent: React.FC = () => {
  return (
    <Router>
      <AuthHandler>
        <Routes>
          {/* Ruta pública de login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirección inteligente basada en rol */}
            <Route index element={<SmartRedirect />} />

            {/* Dashboard - Solo para roles con acceso completo */}
            <Route
              path="dashboard"
              element={
                <RoleRestrictedRoute
                  allowedRoles={[
                    'administrador',
                    'jefe de grupo',
                    'jefe de rama',
                  ]}
                >
                  <Dashboard />
                </RoleRestrictedRoute>
              }
            />

            {/* Socios - Accesible para todos los usuarios autenticados */}
            <Route path="socios" element={<SociosList />} />
            <Route path="socios/nuevo" element={<SocioForm />} />
            <Route path="socios/:id" element={<SocioDetails />} />
            <Route path="socios/:id/editar" element={<SocioForm />} />

            {/* Pagos - Accesible para todos los usuarios autenticados */}
            <Route path="pagos" element={<PagosList />} />
            <Route path="pagos/nuevo" element={<PagoForm />} />
            <Route path="pagos/:id" element={<PagoDetails />} />
            <Route path="pagos/:id/editar" element={<PagoForm />} />

            {/* Cambio de contraseña - Accesible para todos los usuarios autenticados */}
            <Route path="cambio-contrasena" element={<ChangePassword />} />

            {/* Usuarios - Solo para admin y jefe de grupo */}
            <Route
              path="usuarios"
              element={
                <RoleRestrictedRoute
                  allowedRoles={['administrador', 'jefe de grupo']}
                >
                  <UsuariosList />
                </RoleRestrictedRoute>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <RoleRestrictedRoute
                  allowedRoles={['administrador', 'jefe de grupo']}
                >
                  <UsuarioForm />
                </RoleRestrictedRoute>
              }
            />
            <Route
              path="usuarios/:id"
              element={
                <RoleRestrictedRoute
                  allowedRoles={['administrador', 'jefe de grupo']}
                >
                  <UsuarioDetails />
                </RoleRestrictedRoute>
              }
            />
            <Route
              path="usuarios/:id/editar"
              element={
                <RoleRestrictedRoute
                  allowedRoles={['administrador', 'jefe de grupo']}
                >
                  <UsuarioForm />
                </RoleRestrictedRoute>
              }
            />
          </Route>

          {/* Catch all - redirigir a inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthHandler>
    </Router>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AppContent />
      </ConfigProvider>
    </Provider>
  )
}

export default App
