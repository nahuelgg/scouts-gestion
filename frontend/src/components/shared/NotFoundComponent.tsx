import React from 'react'
import { Button, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title } = Typography

interface NotFoundComponentProps {
  title?: string
  backText?: string
  onBack?: () => void
  style?: React.CSSProperties
}

const NotFoundComponent: React.FC<NotFoundComponentProps> = ({
  title = 'Recurso no encontrado',
  backText = 'Volver',
  onBack,
  style = { textAlign: 'center', padding: '50px' },
}) => {
  return (
    <div style={style}>
      <Title level={4}>{title}</Title>
      {onBack && (
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          {backText}
        </Button>
      )}
    </div>
  )
}

export default NotFoundComponent
