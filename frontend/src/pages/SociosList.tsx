import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  message,
  Tag,
  Tooltip,
} from 'antd'
import { ExclamationCircleOutlined, UndoOutlined } from '@ant-design/icons'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchPersonas,
  deletePersona,
  restorePersona,
  clearError,
} from '../store/personasSlice'
import { ramasAPI } from '../services/api'
import { Persona, Rama } from '../types'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const SociosList: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { personas, isLoading, error, currentPage, total } = useAppSelector(
    (state) => state.personas
  )
  const { user } = useAppSelector((state) => state.auth)

  const [searchText, setSearchText] = useState('')
  const [selectedRama, setSelectedRama] = useState<string>('')
  const [ramas, setRamas] = useState<Rama[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [personaToRestore, setPersonaToRestore] = useState<Persona | null>(null)

  const canManage = ['administrador', 'jefe de grupo', 'jefe de rama'].includes(
    user?.rol?.nombre || ''
  )
  const canDelete = ['administrador', 'jefe de grupo'].includes(
    user?.rol?.nombre || ''
  )

  // Función para validar si puede eliminar/restaurar una persona
  const canDeletePersona = (persona: Persona) => {
    return ['administrador', 'jefe de grupo'].includes(user?.rol?.nombre || '')
  }

  // Función para verificar si puede gestionar una persona específica
  const canManagePersona = (persona: Persona) => {
    // Administrador y Jefe de Grupo pueden gestionar cualquier persona
    if (['administrador', 'jefe de grupo'].includes(user?.rol?.nombre || '')) {
      return true
    }

    // Jefe de Rama solo puede gestionar personas de su rama asignada
    if (user?.rol?.nombre === 'jefe de rama') {
      // Si el jefe de rama no tiene persona asignada con rama, no puede gestionar nada
      if (!user.persona?.rama) {
        return false
      }

      // Si la persona no tiene rama asignada, no puede ser gestionada por jefe de rama
      if (!persona.rama) {
        return false
      }

      // Verificar que la rama de la persona coincida con la rama del jefe
      return persona.rama._id === user.persona.rama._id
    }

    return false
  }

  useEffect(() => {
    loadRamas()
  }, [])

  useEffect(() => {
    loadPersonas()
  }, [searchText, selectedRama, page, pageSize]) // Removido dispatch

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error]) // Removido dispatch

  const loadRamas = async () => {
    try {
      const response = await ramasAPI.getAll()
      setRamas(response)
    } catch (error) {
      console.error('Error cargando ramas:', error)
    }
  }

  const loadPersonas = React.useCallback(() => {
    const params: any = {
      page,
      limit: pageSize,
    }

    const userRole = user?.rol?.nombre
    const fullAccessRoles = ['administrador', 'jefe de grupo', 'jefe de rama']

    // Para usuarios con acceso restringido, filtrar automáticamente por su DNI
    if (!userRole || !fullAccessRoles.includes(userRole)) {
      if (user?.persona?.dni) {
        params.dni = user.persona.dni
      }
    } else {
      // Para roles con acceso completo, aplicar filtros normales
      if (searchText) {
        params.search = searchText
      }

      if (selectedRama) {
        params.rama = selectedRama
      }
    }

    dispatch(fetchPersonas({ ...params, includeDeleted: true }))
  }, [
    page,
    pageSize,
    searchText,
    selectedRama,
    user?.rol?.nombre,
    user?.persona?.dni,
  ])

  const handleDelete = (persona: Persona) => {
    setPersonaToDelete(persona)
    setDeleteModalVisible(true)
  }

  const confirmDelete = () => {
    if (personaToDelete) {
      dispatch(deletePersona(personaToDelete._id))
      setDeleteModalVisible(false)
      setPersonaToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalVisible(false)
    setPersonaToDelete(null)
  }

  const handleRestore = (persona: Persona) => {
    setPersonaToRestore(persona)
    setRestoreModalVisible(true)
  }

  const confirmRestore = async () => {
    if (personaToRestore) {
      try {
        await dispatch(restorePersona(personaToRestore._id)).unwrap()
        message.success('Socio restaurado exitosamente')
        setRestoreModalVisible(false)
        setPersonaToRestore(null)
      } catch (error) {
        message.error('Error restaurando socio')
      }
    }
  }

  const cancelRestore = () => {
    setRestoreModalVisible(false)
    setPersonaToRestore(null)
  }

  const columns = [
    {
      title: 'DNI',
      dataIndex: 'dni',
      key: 'dni',
      width: 120,
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
      sorter: true,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: true,
    },

    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 130,
    },
    {
      title: 'Rama',
      dataIndex: ['rama', 'nombre'],
      key: 'rama',
      width: 120,
      render: (rama: string) => {
        if (!rama) return '-'
        const colors: { [key: string]: string } = {
          manada: 'brown',
          unidad: 'green',
          caminantes: 'yellow',
          rovers: 'purple',
        }
        return <Tag color={colors[rama] || 'default'}>{rama.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 120,
      render: (activo: boolean, record: Persona) => (
        <Space>
          {record.deleted ? (
            <Tag color="red">Eliminado</Tag>
          ) : (
            <Tag color={activo ? 'success' : 'default'}>
              {activo ? 'Activo' : 'Inactivo'}
            </Tag>
          )}
          {record.deleted && record.deletedAt && (
            <small style={{ color: '#999' }}>
              {dayjs(record.deletedAt).format('DD/MM/YYYY')}
            </small>
          )}
        </Space>
      ),
      sorter: (a: Persona, b: Persona) => {
        if (a.deleted && !b.deleted) return 1
        if (!a.deleted && b.deleted) return -1
        return 0
      },
    },
    {
      title: 'Acciones',
      key: 'actions',

      width: 150,
      render: (_: any, record: Persona) => (
        <Space size="small">
          {canManagePersona(record) && (
            <Tooltip title="Ver detalles">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/socios/${record._id}`)}
              />
            </Tooltip>
          )}
          {canManagePersona(record) && !record.deleted && (
            <Tooltip title="Editar">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/socios/${record._id}/editar`)}
              />
            </Tooltip>
          )}
          {!record.deleted && canDeletePersona(record) && (
            <Tooltip title="Eliminar">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
          {record.deleted && canDeletePersona(record) && (
            <Tooltip title="Restaurar">
              <Button
                type="text"
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
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2}>Gestión de Socios</Title>
        {canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/socios/nuevo')}
          >
            Nuevo Socio
          </Button>
        )}
      </div>

      <Card>
        {/* Filtros - Solo visible para roles con acceso completo */}
        {(() => {
          const userRole = user?.rol?.nombre
          const fullAccessRoles = [
            'administrador',
            'jefe de grupo',
            'jefe de rama',
          ]
          return userRole && fullAccessRoles.includes(userRole)
        })() && (
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              <Search
                placeholder="Buscar por nombre o DNI"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={loadPersonas}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />

              <Select
                placeholder="Filtrar por rama"
                style={{ width: 150 }}
                allowClear
                value={selectedRama}
                onChange={setSelectedRama}
              >
                <Option key="todas" value="">
                  Todas las ramas
                </Option>
                {ramas.map((rama) => (
                  <Option key={rama._id} value={rama._id}>
                    {rama.nombre.charAt(0).toUpperCase() + rama.nombre.slice(1)}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>
        )}

        {/* Tabla */}
        <Table
          columns={columns}
          dataSource={personas}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} socios`,
            onChange: (page, size) => {
              setPage(page)
              if (size !== pageSize) {
                setPageSize(size)
              }
            },
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal de confirmación para eliminar */}
      <Modal
        title="Confirmar eliminación"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Sí, eliminar"
        cancelText="Cancelar"
        okType="danger"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined
            style={{ color: '#faad14', fontSize: '22px' }}
          />
          <div>
            <p>¿Estás seguro de que deseas eliminar a:</p>
            <strong>
              {personaToDelete?.nombre} {personaToDelete?.apellido}
            </strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para restaurar */}
      <Modal
        title="Confirmar restauración"
        open={restoreModalVisible}
        onOk={confirmRestore}
        onCancel={cancelRestore}
        okText="Sí, restaurar"
        cancelText="Cancelar"
        okType="primary"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UndoOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
          <div>
            <p>¿Estás seguro de que deseas restaurar a:</p>
            <strong>
              {personaToRestore?.nombre} {personaToRestore?.apellido}
            </strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              El socio volverá a estar disponible en el sistema.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SociosList
