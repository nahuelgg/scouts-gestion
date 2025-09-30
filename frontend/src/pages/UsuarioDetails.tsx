import React, { useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  message,
} from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchUsuarioById,
  clearCurrentUsuario,
  clearError,
} from '../store/usuariosSlice'
import dayjs from 'dayjs'

const { Title } = Typography

const UsuarioDetails: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { currentUsuario, isLoading, error } = useAppSelector(
    (state) => state.usuarios
  )

  useEffect(() => {
    if (id) {
      dispatch(fetchUsuarioById(id))
    }

    return () => {
      dispatch(clearCurrentUsuario())
    }
  }, [id]) // Removido dispatch

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error]) // Removido dispatch

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Cargando detalles del usuario...</p>
      </div>
    )
  }

  if (!currentUsuario) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Usuario no encontrado</p>
        <Button onClick={() => navigate('/usuarios')}>Volver a la lista</Button>
      </div>
    )
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'red'
      case 'jefe de grupo':
        return 'orange'
      case 'jefe de rama':
        return 'blue'
      case 'socio':
        return 'green'
      default:
        return 'default'
    }
  }

  const getRolDisplay = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'Administrador'
      case 'jefe de grupo':
        return 'Jefe de Grupo'
      case 'jefe de rama':
        return 'Jefe de Rama'
      case 'socio':
        return 'Socio'
      default:
        return rol
    }
  }

  const getPermisosDisplay = (permisos: string[]) => {
    const permisosMap: { [key: string]: string } = {
      all: 'Acceso completo',
      read: 'Lectura',
      write: 'Escritura',
      delete: 'Eliminación',
    }

    return permisos.map((permiso) => (
      <Tag key={permiso} color="blue">
        {permisosMap[permiso] || permiso}
      </Tag>
    ))
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/usuarios')}
            >
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Detalles del Usuario
            </Title>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/usuarios/${currentUsuario._id}/editar`)}
          >
            Editar Usuario
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Información del Usuario */}
        <Col xs={24} lg={12}>
          <Card title="Información del Usuario" style={{ height: '100%' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Nombre de Usuario">
                <strong>{currentUsuario.username}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={currentUsuario.activo ? 'green' : 'red'}>
                  {currentUsuario.activo ? 'Activo' : 'Inactivo'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Último Login">
                {currentUsuario.ultimoLogin
                  ? dayjs(currentUsuario.ultimoLogin).format(
                      'DD/MM/YYYY HH:mm:ss'
                    )
                  : 'Nunca se ha conectado'}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Registro">
                No disponible
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización">
                No disponible
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información del Rol */}
        <Col xs={24} lg={12}>
          <Card title="Rol y Permisos" style={{ height: '100%' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Rol">
                <Tag color={getRolColor(currentUsuario.rol.nombre)}>
                  {getRolDisplay(currentUsuario.rol.nombre)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Descripción del Rol">
                {currentUsuario.rol.descripcion}
              </Descriptions.Item>
              <Descriptions.Item label="Permisos">
                <Space wrap>
                  {getPermisosDisplay(currentUsuario.rol.permisos)}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información Personal */}
        <Col xs={24}>
          <Card title="Información Personal">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Descriptions title="Datos Personales" column={1} bordered>
                  <Descriptions.Item label="Nombre Completo">
                    <strong>
                      {currentUsuario.persona.nombre}{' '}
                      {currentUsuario.persona.apellido}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="DNI">
                    {currentUsuario.persona.dni}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Nacimiento">
                    {currentUsuario.persona.fechaNacimiento
                      ? dayjs(currentUsuario.persona.fechaNacimiento).format(
                          'DD/MM/YYYY'
                        )
                      : 'No especificada'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Función en el Grupo">
                    <Tag color="purple">
                      {currentUsuario.persona.funcion
                        ? currentUsuario.persona.funcion
                            .charAt(0)
                            .toUpperCase() +
                          currentUsuario.persona.funcion.slice(1)
                        : 'No especificada'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              <Col xs={24} lg={12}>
                <Descriptions title="Contacto y Ubicación" column={1} bordered>
                  <Descriptions.Item label="Teléfono">
                    {currentUsuario.persona.telefono || 'No especificado'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {currentUsuario.persona.email || 'No especificado'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dirección">
                    {currentUsuario.persona.direccion ? (
                      <>
                        {currentUsuario.persona.direccion.calle}{' '}
                        {currentUsuario.persona.direccion.numero}
                        <br />
                        {currentUsuario.persona.direccion.ciudad}
                        {currentUsuario.persona.direccion.codigoPostal &&
                          ` (${currentUsuario.persona.direccion.codigoPostal})`}
                      </>
                    ) : (
                      'No especificada'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rama">
                    {currentUsuario.persona.rama ? (
                      <Tag color="green">
                        {currentUsuario.persona.rama.nombre
                          .charAt(0)
                          .toUpperCase() +
                          currentUsuario.persona.rama.nombre.slice(1)}{' '}
                        ({currentUsuario.persona.rama.edadMinima}-
                        {currentUsuario.persona.rama.edadMaxima} años)
                      </Tag>
                    ) : (
                      'Sin rama asignada'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UsuarioDetails
