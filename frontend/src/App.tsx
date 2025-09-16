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
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SociosList from './pages/SociosList'
import SocioForm from './pages/SocioForm'
import SocioDetails from './pages/SocioDetails'
import 'antd/dist/reset.css'

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  )
}

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Rutas de socios */}
          <Route path="socios" element={<SociosList />} />
          <Route path="socios/nuevo" element={<SocioForm />} />
          <Route path="socios/editar/:id" element={<SocioForm />} />
          <Route path="socios/:id" element={<SocioDetails />} />

          {/* Rutas de pagos */}
          <Route
            path="pagos"
            element={<div>Lista de pagos (por implementar)</div>}
          />
          <Route
            path="pagos/nuevo"
            element={<div>Nuevo pago (por implementar)</div>}
          />

          {/* Rutas de administración */}
          <Route
            path="usuarios"
            element={<div>Gestión de usuarios (por implementar)</div>}
          />
          <Route
            path="configuracion"
            element={<div>Configuración (por implementar)</div>}
          />
          <Route
            path="perfil"
            element={<div>Perfil de usuario (por implementar)</div>}
          />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
