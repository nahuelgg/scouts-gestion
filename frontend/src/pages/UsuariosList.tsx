import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
  Modal,
  message,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchUsuarios,
  deleteUsuario,
  restoreUsuario,
  clearError,
} from '../store/usuariosSlice'
import { User } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const UsuariosList: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { usuarios, isLoading, error } = useAppSelector(
    (state) => state.usuarios
  )
  const { user } = useAppSelector((state) => state.auth)

  const [searchText, setSearchText] = useState('')
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([])
  const [selectedRol, setSelectedRol] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [userToRestore, setUserToRestore] = useState<User | null>(null)

  useEffect(() => {
    loadUsuarios()
  }, [])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error]) // Removido dispatch

  useEffect(() => {
    let filtered = usuarios

    // Filtrar por búsqueda de texto
    if (searchText) {
      filtered = filtered.filter(
        (usuario) =>
          usuario.username.toLowerCase().includes(searchText.toLowerCase()) ||
          (usuario.persona?.nombre &&
            usuario.persona.nombre
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          (usuario.persona?.apellido &&
            usuario.persona.apellido
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          (usuario.persona?.dni && usuario.persona.dni.includes(searchText))
      )
    }

    // Filtrar por rol
    if (selectedRol) {
      filtered = filtered.filter(
        (usuario) => usuario.rol?.nombre === selectedRol
      )
    }

    // Filtrar por estado
    if (selectedStatus) {
      const isActive = selectedStatus === 'activo'
      filtered = filtered.filter((usuario) => usuario.activo === isActive)
    }

    setFilteredUsuarios(filtered)
  }, [usuarios, searchText, selectedRol, selectedStatus])

  const loadUsuarios = () => {
    dispatch(fetchUsuarios())
  }

  const canDeleteUser = (targetUser: User) => {
    if (!user) return false

    // Solo administrador y jefe de grupo pueden eliminar usuarios
    const allowedRoles = ['administrador', 'jefe de grupo']
    const userRole = user.rol?.nombre

    if (!allowedRoles.includes(userRole)) {
      return false
    }

    // No puede eliminarse a sí mismo
    if (user._id === targetUser._id) {
      return false
    }

    // Administrador puede eliminar cualquier usuario excepto otros administradores
    if (userRole === 'administrador') {
      return targetUser.rol?.nombre !== 'administrador'
    }

    // Jefe de grupo solo puede eliminar socios
    if (userRole === 'jefe de grupo') {
      return targetUser.rol?.nombre === 'socio'
    }

    return false
  }

  const handleDelete = (usuario: User) => {
    if (!canDeleteUser(usuario)) {
      message.error('No tienes permisos para eliminar este usuario')
      return
    }

    setUserToDelete(usuario)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await dispatch(deleteUsuario(userToDelete._id)).unwrap()
      message.success('Usuario eliminado exitosamente')
      setDeleteModalVisible(false)
      setUserToDelete(null)
    } catch (error) {
      message.error(error?.toString() || 'Error eliminando usuario')
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setUserToDelete(null)
  }

  const handleRestore = (usuario: User) => {
    if (!canDeleteUser(usuario)) {
      message.error('No tienes permisos para restaurar este usuario')
      return
    }

    setUserToRestore(usuario)
    setRestoreModalVisible(true)
  }

  const handleConfirmRestore = async () => {
    if (!userToRestore) return

    try {
      await dispatch(restoreUsuario(userToRestore._id)).unwrap()
      message.success('Usuario restaurado exitosamente')
      setRestoreModalVisible(false)
      setUserToRestore(null)
    } catch (error) {
      message.error('Error restaurando usuario')
    }
  }

  const handleCancelRestore = () => {
    setRestoreModalVisible(false)
    setUserToRestore(null)
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

  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      sorter: (a: User, b: User) => a.username.localeCompare(b.username),
    },
    {
      title: 'Persona',
      key: 'persona',
      render: (record: User) => (
        <div>
          {record.persona ? (
            <>
              <strong>
                {record.persona.nombre} {record.persona.apellido}
              </strong>
              <br />
              <small style={{ color: '#666' }}>DNI: {record.persona.dni}</small>
            </>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>
              Sin persona asociada
            </span>
          )}
        </div>
      ),
      sorter: (a: User, b: User) => {
        const aName = a.persona
          ? `${a.persona.nombre} ${a.persona.apellido}`
          : ''
        const bName = b.persona
          ? `${b.persona.nombre} ${b.persona.apellido}`
          : ''
        return aName.localeCompare(bName)
      },
    },
    {
      title: 'Rol',
      key: 'rol',
      render: (record: User) => (
        <Tag color={getRolColor(record.rol?.nombre || '')}>
          {getRolDisplay(record.rol?.nombre || 'Sin rol')}
        </Tag>
      ),
      sorter: (a: User, b: User) => {
        const aRol = a.rol?.nombre || ''
        const bRol = b.rol?.nombre || ''
        return aRol.localeCompare(bRol)
      },
    },
    {
      title: 'Estado',
      key: 'activo',
      render: (record: User) => (
        <Space>
          {record.deleted ? (
            <Tag color="red">Eliminado</Tag>
          ) : record.activo ? (
            <Tag color="green">Activo</Tag>
          ) : (
            <Tag color="orange">Inactivo</Tag>
          )}
          {record.deleted && record.deletedAt && (
            <small style={{ color: '#999' }}>
              {dayjs(record.deletedAt).format('DD/MM/YYYY')}
            </small>
          )}
        </Space>
      ),
      sorter: (a: User, b: User) => {
        if (a.deleted && !b.deleted) return 1
        if (!a.deleted && b.deleted) return -1
        return a.activo === b.activo ? 0 : a.activo ? -1 : 1
      },
    },
    {
      title: 'Último Login',
      key: 'ultimoLogin',
      render: (record: User) =>
        record.ultimoLogin
          ? dayjs(record.ultimoLogin).format('DD/MM/YYYY HH:mm')
          : 'Nunca',
      sorter: (a: User, b: User) => {
        if (!a.ultimoLogin && !b.ultimoLogin) return 0
        if (!a.ultimoLogin) return 1
        if (!b.ultimoLogin) return -1
        return (
          new Date(b.ultimoLogin).getTime() - new Date(a.ultimoLogin).getTime()
        )
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: User) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/usuarios/${record._id}/detalles`)}
            />
          </Tooltip>

          {!record.deleted && (
            <>
              <Tooltip title="Editar">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/usuarios/${record._id}/editar`)}
                />
              </Tooltip>
              {canDeleteUser(record) && (
                <Tooltip title="Eliminar">
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                  />
                </Tooltip>
              )}
            </>
          )}

          {record.deleted && canDeleteUser(record) && (
            <Tooltip title="Restaurar">
              <Button
                type="link"
                style={{ color: '#52c41a' }}
                icon={<UndoOutlined />}
                onClick={() => handleRestore(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Usuarios</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Nuevo Usuario
          </Button>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Buscar por usuario, nombre, apellido o DNI"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filtrar por rol"
              allowClear
              value={selectedRol}
              onChange={setSelectedRol}
              style={{ width: '100%' }}
            >
              <Option value="">Todos los roles</Option>
              <Option value="administrador">Administrador</Option>
              <Option value="jefe de grupo">Jefe de Grupo</Option>
              <Option value="jefe de rama">Jefe de Rama</Option>
              <Option value="socio">Socio</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filtrar por estado"
              allowClear
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="">Todos los estados</Option>
              <Option value="activo">Activos</Option>
              <Option value="inactivo">Inactivos</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsuarios}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} usuarios`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Estadísticas rápidas */}
      <Card title="Estadísticas" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {usuarios.length}
              </Title>
              <p style={{ margin: 0, color: '#666' }}>Total Usuarios</p>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {usuarios.filter((u) => u.activo).length}
              </Title>
              <p style={{ margin: 0, color: '#666' }}>Activos</p>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                {usuarios.filter((u) => !u.activo).length}
              </Title>
              <p style={{ margin: 0, color: '#666' }}>Inactivos</p>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {
                  usuarios.filter((u) => u.rol?.nombre === 'administrador')
                    .length
                }
              </Title>
              <p style={{ margin: 0, color: '#666' }}>Administradores</p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Modal de confirmación para eliminar usuario */}
      <Modal
        title="¿Estás seguro?"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Sí, eliminar"
        cancelText="Cancelar"
        okType="danger"
        confirmLoading={isLoading}
      >
        <p>
          ¿Deseas eliminar el usuario "{userToDelete?.username}"? El usuario se
          mantendrá en el historial del sistema pero no podrá acceder.
        </p>
      </Modal>

      {/* Modal de confirmación para restaurar usuario */}
      <Modal
        title="¿Restaurar usuario?"
        open={restoreModalVisible}
        onOk={handleConfirmRestore}
        onCancel={handleCancelRestore}
        okText="Sí, restaurar"
        cancelText="Cancelar"
        confirmLoading={isLoading}
      >
        <p>
          ¿Deseas restaurar el usuario "{userToRestore?.username}"? Volverá a
          tener acceso al sistema.
        </p>
      </Modal>
    </div>
  )
}

export default UsuariosList
