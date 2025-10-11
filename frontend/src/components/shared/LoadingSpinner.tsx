import React from 'react'
import { Spin, Typography } from 'antd'

const { Title } = Typography

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  message?: string
  showTitle?: boolean
  style?: React.CSSProperties
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message = 'Cargando...',
  showTitle = false,
  style = { textAlign: 'center', padding: '50px' },
}) => {
  return (
    <div style={style}>
      <Spin size={size} />
      {showTitle && (
        <Title level={4} style={{ marginTop: 16 }}>
          {message}
        </Title>
      )}
    </div>
  )
}

export default LoadingSpinner
