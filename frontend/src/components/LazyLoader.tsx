import React, { Suspense } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

// Componente de carga optimizado
const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%',
    }}
  >
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      tip="Cargando..."
      size="large"
    />
  </div>
)

// HOC para lazy loading con manejo de errores
export const withLazyLoading = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return React.memo((props: P) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  ))
}

// Hook para precargar componentes
export const usePreloadComponent = (componentLoader: () => Promise<any>) => {
  React.useEffect(() => {
    // Precargar después de que la página esté idle
    const preload = () => {
      componentLoader().catch(() => {
        // Ignorar errores de precarga
      })
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload)
    } else {
      setTimeout(preload, 100)
    }
  }, [componentLoader])
}

export default LoadingSpinner
