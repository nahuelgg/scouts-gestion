import { lazy } from 'react'

// Lazy loading de páginas principales
export const Dashboard = lazy(() => import('../pages/Dashboard'))
export const Login = lazy(() => import('../pages/Login'))

// Lazy loading de páginas de socios
export const SociosList = lazy(() => import('../pages/SociosList'))
export const SocioForm = lazy(() => import('../pages/SocioForm'))
export const SocioDetails = lazy(() => import('../pages/SocioDetails'))

// Lazy loading de páginas de usuarios
export const UsuariosList = lazy(() => import('../pages/UsuariosList'))
export const UsuarioForm = lazy(() => import('../pages/UsuarioForm'))
export const UsuarioDetails = lazy(() => import('../pages/UsuarioDetails'))

// Lazy loading de páginas de pagos
export const PagosList = lazy(() => import('../pages/PagosList'))
export const PagoForm = lazy(() => import('../pages/PagoForm'))
export const PagoDetails = lazy(() => import('../pages/PagoDetails'))

// Lazy loading de componentes específicos
export const ChangePassword = lazy(() => import('../pages/ChangePassword'))
export const MainLayout = lazy(() => import('../components/Layout/MainLayout'))

// Preloaders para componentes críticos
export const preloadDashboard = () => import('../pages/Dashboard')
export const preloadSociosList = () => import('../pages/SociosList')
export const preloadPagosList = () => import('../pages/PagosList')
