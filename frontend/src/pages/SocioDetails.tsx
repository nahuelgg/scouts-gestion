import React, { useEffect } from 'react'
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Spin,
  Typography,
  Divider,
} from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { fetchPersonaById, clearCurrentPersona } from '../store/personasSlice'
import dayjs from 'dayjs'

const { Title } = Typography

const SocioDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { currentPersona, isLoading } = useAppSelector(
    (state) => state.personas
  )
  const { user } = useAppSelector((state) => state.auth)

  const canManage = ['administrador', 'jefe_de_rama'].includes(
    user?.rol?.nombre || ''
  )

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonaById(id))
    }

    return () => {
      dispatch(clearCurrentPersona())
    }
  }, [id, dispatch])

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!currentPersona) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>Socio no encontrado</Title>
        <Button onClick={() => navigate('/socios')}>Volver a la lista</Button>
      </div>
    )
  }

  const ramaColors = {
    manada: 'brown',
    unidad: 'green',
    caminantes: 'yellow',
    rovers: 'purple',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/socios')}
          >
            Volver
          </Button>
          {canManage && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/socios/editar/${currentPersona._id}`)}
            >
              Editar Socio
            </Button>
          )}
        </Space>
      </div>

      {/* Información Personal */}
      <Card title="Información Personal" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="DNI" span={1}>
            {currentPersona.dni}
          </Descriptions.Item>
          <Descriptions.Item label="Estado" span={1}>
            <Tag color={currentPersona.activo ? 'success' : 'default'}>
              {currentPersona.activo ? 'Activo' : 'Inactivo'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Apellido" span={1}>
            {currentPersona.apellido}
          </Descriptions.Item>
          <Descriptions.Item label="Nombre" span={1}>
            {currentPersona.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Nacimiento" span={1}>
            {currentPersona.fechaNacimiento
              ? dayjs(currentPersona.fechaNacimiento).format('DD/MM/YYYY')
              : 'No especificada'}
          </Descriptions.Item>
          <Descriptions.Item label="Función" span={1}>
            <Tag>{currentPersona.funcion}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Información de Contacto */}
      <Card title="Información de Contacto" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Teléfono">
            {currentPersona.telefono}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {currentPersona.email || 'No especificado'}
          </Descriptions.Item>
          <Descriptions.Item label="Dirección">
            {`${currentPersona.direccion.calle} ${currentPersona.direccion.numero}, 
             ${currentPersona.direccion.ciudad}
             ${currentPersona.direccion.codigoPostal ? ` (${currentPersona.direccion.codigoPostal})` : ''}`}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Información Scout */}
      <Card title="Información Scout">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Rama">
            {currentPersona.rama ? (
              <Tag
                color={
                  ramaColors[
                    currentPersona.rama.nombre as keyof typeof ramaColors
                  ] || 'default'
                }
              >
                {currentPersona.rama.nombre.toUpperCase()}
              </Tag>
            ) : (
              'Sin rama asignada'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default SocioDetails
