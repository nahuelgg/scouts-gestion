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
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchPersonas,
  deletePersona,
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

  const canManage = ['administrador', 'jefe_de_rama'].includes(
    user?.rol?.nombre || ''
  )
  const canDelete = user?.rol?.nombre === 'administrador'

  useEffect(() => {
    loadRamas()
  }, [])

  useEffect(() => {
    loadPersonas()
  }, [searchText, selectedRama, page, pageSize, dispatch])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

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

    if (searchText) {
      params.search = searchText
    }

    if (selectedRama) {
      params.rama = selectedRama
    }

    dispatch(fetchPersonas(params))
  }, [dispatch, page, pageSize, searchText, selectedRama])

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
      width: 100,
      render: (activo: boolean) => (
        <Tag color={activo ? 'success' : 'default'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',

      width: 150,
      render: (_: any, record: Persona) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/socios/${record._id}`)}
            />
          </Tooltip>
          {canManage && (
            <Tooltip title="Editar">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/socios/editar/${record._id}`)}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Eliminar">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
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
        {/* Filtros */}
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
    </div>
  )
}

export default SociosList
