import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  Tag,
  Modal,
  message,
  DatePicker,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchPagos,
  deletePago,
  restorePago,
  clearError,
} from '../store/pagosSlice'
import dayjs from 'dayjs'
import type { Pago } from '../types'
import { formatCurrency } from '../utils/currency'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const PagosList: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { pagos, isLoading, error, totalPages, currentPage, total } =
    useAppSelector((state) => state.pagos)
  const { user } = useAppSelector((state) => state.auth)

  const [searchText, setSearchText] = useState('')
  const [filteredPagos, setFilteredPagos] = useState<Pago[]>([])
  const [selectedMetodoPago, setSelectedMetodoPago] = useState('')
  const [selectedTipoPago, setSelectedTipoPago] = useState('')
  const [selectedMes, setSelectedMes] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  )
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [pagoToRestore, setPagoToRestore] = useState<Pago | null>(null)

  // Verificar permisos del usuario
  const userRole = user?.rol?.nombre
  const userRamaId = user?.persona?.rama?._id
  const userPersonaId = user?.persona?._id

  const canManageAll =
    userRole === 'administrador' || userRole === 'jefe de grupo'
  const canManageRama = userRole === 'jefe de rama'
  const canOnlyView = userRole === 'socio' || !userRole

  // Función para verificar si un pago pertenece a la rama del usuario
  const isPagoFromUserRama = (pago: any) => {
    return pago.socio?.rama?._id === userRamaId
  }

  // Función para verificar si un pago pertenece al usuario actual
  const isPagoFromUser = (pago: any) => {
    return pago.socio?._id === userPersonaId
  }

  // Función para verificar si el usuario puede eliminar un pago
  const canDeletePago = (pago: any) => {
    if (!user) return false

    const userRole = user.rol?.nombre

    // Administrador y jefe de grupo pueden eliminar cualquier pago
    if (['administrador', 'jefe de grupo'].includes(userRole)) {
      return true
    }

    // Jefe de rama puede eliminar pagos de su rama
    if (userRole === 'jefe de rama') {
      return isPagoFromUserRama(pago)
    }

    // Los socios NO pueden eliminar ningún pago
    return false
  }

  useEffect(() => {
    loadPagos()
  }, [])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    let filtered = pagos

    // FILTRO POR ROL: Los socios solo ven sus propios pagos
    if (canOnlyView) {
      filtered = filtered.filter((pago: Pago) => isPagoFromUser(pago))
    }

    // Filtrar por búsqueda de texto
    if (searchText) {
      filtered = filtered.filter(
        (pago: Pago) =>
          pago.socio?.nombre
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          pago.socio?.apellido
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          pago.socio?.dni?.includes(searchText) ||
          pago.mesCorrespondiente.includes(searchText) ||
          pago.metodoPago.toLowerCase().includes(searchText.toLowerCase()) ||
          pago.tipoPago.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Filtrar por método de pago
    if (selectedMetodoPago) {
      filtered = filtered.filter(
        (pago: Pago) => pago.metodoPago === selectedMetodoPago
      )
    }
    // Filtrar por tipo de pago
    if (selectedTipoPago) {
      filtered = filtered.filter(
        (pago: Pago) => pago.tipoPago === selectedTipoPago
      )
    }

    // Filtrar por mes
    if (selectedMes) {
      filtered = filtered.filter(
        (pago: Pago) => pago.mesCorrespondiente === selectedMes
      )
    }

    // Filtrar por rango de fechas
    if (dateRange) {
      const [start, end] = dateRange
      filtered = filtered.filter((pago: Pago) => {
        const fechaPago = dayjs(pago.fechaPago)
        return fechaPago.isAfter(start) && fechaPago.isBefore(end)
      })
    }

    setFilteredPagos(filtered)
  }, [
    pagos,
    searchText,
    selectedMetodoPago,
    selectedTipoPago,
    selectedMes,
    dateRange,
    canOnlyView,
    userPersonaId,
  ])

  const loadPagos = () => {
    dispatch(fetchPagos({ includeDeleted: true }))
  }

  const handleDelete = (pago: Pago) => {
    if (!canDeletePago(pago)) {
      message.error('No tienes permisos para eliminar este pago')
      return
    }

    setPagoToDelete(pago)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!pagoToDelete) return

    try {
      await dispatch(deletePago(pagoToDelete._id)).unwrap()
      message.success('Pago eliminado exitosamente')
      setDeleteModalVisible(false)
      setPagoToDelete(null)
      // Recargar la lista para actualizar la UI
      loadPagos()
    } catch (error) {
      console.error('Error eliminando pago:', error)
      message.error('Error eliminando pago')
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setPagoToDelete(null)
  }

  const handleRestore = (pago: Pago) => {
    if (!canDeletePago(pago)) {
      message.error('No tienes permisos para restaurar este pago')
      return
    }

    setPagoToRestore(pago)
    setRestoreModalVisible(true)
  }

  const handleConfirmRestore = async () => {
    if (!pagoToRestore) return

    try {
      await dispatch(restorePago(pagoToRestore._id)).unwrap()
      message.success('Pago restaurado exitosamente')
      setRestoreModalVisible(false)
      setPagoToRestore(null)
      // Recargar la lista para actualizar la UI
      loadPagos()
    } catch (error) {
      console.error('Error restaurando pago:', error)
      message.error('Error restaurando pago')
    }
  }

  const handleCancelRestore = () => {
    setRestoreModalVisible(false)
    setPagoToRestore(null)
  }

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'green'
      case 'transferencia':
        return 'blue'
      case 'tarjeta_debito':
        return 'orange'
      case 'tarjeta_credito':
        return 'purple'
      default:
        return 'default'
    }
  }

  const getMetodoPagoDisplay = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'Efectivo'
      case 'transferencia':
        return 'Transferencia'
      case 'tarjeta_debito':
        return 'Tarjeta Débito'
      case 'tarjeta_credito':
        return 'Tarjeta Crédito'
      default:
        return metodo
    }
  }

  const getTipoPagoColor = (tipo: string) => {
    switch (tipo) {
      case 'mensual':
        return 'blue'
      case 'afiliacion':
        return 'green'
      case 'campamento':
        return 'orange'
      case 'otro':
        return 'purple'
      default:
        return 'default'
    }
  }

  const getTipoPagoDisplay = (tipo: string) => {
    switch (tipo) {
      case 'mensual':
        return 'Mensual'
      case 'afiliacion':
        return 'Afiliación'
      case 'campamento':
        return 'Campamento'
      case 'otro':
        return 'Otro'
      default:
        return tipo
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'green'
      case 'pendiente':
        return 'orange'
      case 'rechazado':
        return 'red'
      default:
        return 'default'
    }
  }

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'Confirmado'
      case 'pendiente':
        return 'Pendiente'
      case 'rechazado':
        return 'Rechazado'
      default:
        return estado
    }
  }

  const columns = [
    {
      title: 'Socio',
      key: 'socio',
      render: (record: Pago) => (
        <div>
          <strong>
            {record.socio?.nombre} {record.socio?.apellido}
          </strong>
          <br />
          <small style={{ color: '#666' }}>DNI: {record.socio?.dni}</small>
        </div>
      ),
      sorter: (a: Pago, b: Pago) => {
        const aName = `${a.socio?.nombre} ${a.socio?.apellido}`
        const bName = `${b.socio?.nombre} ${b.socio?.apellido}`
        return aName.localeCompare(bName)
      },
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => (
        <strong style={{ color: '#52c41a' }}>{formatCurrency(monto)}</strong>
      ),
      sorter: (a: Pago, b: Pago) => a.monto - b.monto,
    },
    {
      title: 'Mes Correspondiente',
      dataIndex: 'mesCorrespondiente',
      key: 'mesCorrespondiente',
      sorter: (a: Pago, b: Pago) =>
        a.mesCorrespondiente.localeCompare(b.mesCorrespondiente),
    },
    {
      title: 'Fecha de Pago',
      dataIndex: 'fechaPago',
      key: 'fechaPago',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a: Pago, b: Pago) =>
        new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime(),
    },
    {
      title: 'Método de Pago',
      key: 'metodoPago',
      render: (record: Pago) => (
        <Tag color={getMetodoPagoColor(record.metodoPago)}>
          {getMetodoPagoDisplay(record.metodoPago)}
        </Tag>
      ),
      sorter: (a: Pago, b: Pago) => a.metodoPago.localeCompare(b.metodoPago),
    },
    {
      title: 'Tipo de Pago',
      key: 'tipoPago',
      render: (record: Pago) => (
        <Tag color={getTipoPagoColor(record.tipoPago)}>
          {getTipoPagoDisplay(record.tipoPago)}
        </Tag>
      ),
      sorter: (a: Pago, b: Pago) => a.tipoPago.localeCompare(b.tipoPago),
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (record: Pago) => (
        <Space direction="vertical" size="small">
          {record.deleted ? (
            <Tag color="red">Eliminado</Tag>
          ) : (
            <Tag color={getEstadoColor(record.estado)}>
              {getEstadoDisplay(record.estado)}
            </Tag>
          )}
          {record.deleted && record.deletedAt && (
            <small style={{ color: '#999' }}>
              {dayjs(record.deletedAt).format('DD/MM/YYYY')}
            </small>
          )}
        </Space>
      ),
      sorter: (a: Pago, b: Pago) => {
        if (a.deleted && !b.deleted) return 1
        if (!a.deleted && b.deleted) return -1
        return a.estado.localeCompare(b.estado)
      },
    },
    {
      title: 'Comprobante',
      key: 'comprobante',
      render: (record: Pago) =>
        record.comprobante ? (
          <Tag color="blue">Sí</Tag>
        ) : (
          <Tag color="default">No</Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: Pago) => {
        // Verificar permisos para este pago específico
        const canManageThisPago =
          canManageAll ||
          (canManageRama && record.socio?.rama?._id === userRamaId)

        // Los socios pueden ver detalles de sus propios pagos
        const canViewThisPago =
          canManageThisPago ||
          (canOnlyView && record.socio?._id === userPersonaId)

        return (
          <Space size="small">
            {/* Ver detalles - Admin/jefe: todos, jefe de rama: solo su rama, socios: solo sus propios pagos */}
            {canViewThisPago && (
              <Tooltip title="Ver detalles">
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/pagos/${record._id}`)}
                />
              </Tooltip>
            )}

            {/* Editar - Solo admin/jefe de grupo: todos, jefe de rama: solo su rama. Los socios NO pueden editar. */}
            {canManageThisPago && !record.deleted && (
              <Tooltip title="Editar">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/pagos/${record._id}/editar`)}
                />
              </Tooltip>
            )}

            {/* Eliminar - Según permisos específicos */}
            {!record.deleted && canDeletePago(record) && (
              <Tooltip title="Eliminar">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            )}

            {/* Restaurar - Solo para pagos eliminados */}
            {record.deleted && canDeletePago(record) && (
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
        )
      },
    },
  ]

  // Calcular estadísticas (excluyendo pagos eliminados)
  const pagosActivos = filteredPagos.filter((pago) => !pago.deleted)
  const totalMonto = pagosActivos.reduce((sum, pago) => sum + pago.monto, 0)
  const pagosPendientes = pagosActivos.filter(
    (pago) => pago.estado === 'pendiente'
  ).length
  const pagosConfirmados = pagosActivos.filter(
    (pago) => pago.estado === 'confirmado'
  ).length

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Gestión de Pagos</Title>
        </Col>
        <Col>
          {/* Solo mostrar botón crear para roles autorizados */}
          {(canManageAll || canManageRama) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/pagos/nuevo')}
            >
              Registrar Pago
            </Button>
          )}
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Buscar por socio, DNI o mes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Método de pago"
              value={selectedMetodoPago || null}
              onChange={setSelectedMetodoPago}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
              <Option value="tarjeta_debito">Tarjeta Débito</Option>
              <Option value="tarjeta_credito">Tarjeta Crédito</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Tipo de pago"
              value={selectedTipoPago || null}
              onChange={setSelectedTipoPago}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="mensual">Mensual</Option>
              <Option value="afiliacion">Afiliación</Option>
              <Option value="campamento">Campamento</Option>
              <Option value="otro">Otro</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Mes"
              value={selectedMes || null}
              onChange={setSelectedMes}
              style={{ width: '100%' }}
              allowClear
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = dayjs().month(i).format('YYYY-MM')
                return (
                  <Option key={month} value={month}>
                    {dayjs().month(i).format('MMMM YYYY')}
                  </Option>
                )
              })}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Fecha desde', 'Fecha hasta']}
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
              }
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          {/* <Col xs={24} sm={12} md={4}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                message.info('Funcionalidad de exportación en desarrollo')
              }
              style={{ width: '100%' }}
            >
              Exportar
            </Button>
          </Col> */}
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPagos}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} pagos`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Estadísticas */}
      <Card title="Estadísticas" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Total de Pagos"
              value={pagosActivos.length}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Monto Total"
              value={formatCurrency(totalMonto)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Pagos Confirmados"
              value={pagosConfirmados}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Pagos Pendientes"
              value={pagosPendientes}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Modal de confirmación para eliminar pago */}
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
          ¿Deseas eliminar el pago de {pagoToDelete?.socio?.nombre}{' '}
          {pagoToDelete?.socio?.apellido} del mes{' '}
          {pagoToDelete?.mesCorrespondiente}? El pago se mantendrá en el
          historial del sistema.
        </p>
      </Modal>

      {/* Modal de confirmación para restaurar pago */}
      <Modal
        title="¿Restaurar pago?"
        open={restoreModalVisible}
        onOk={handleConfirmRestore}
        onCancel={handleCancelRestore}
        okText="Sí, restaurar"
        cancelText="Cancelar"
        confirmLoading={isLoading}
      >
        <p>
          ¿Deseas restaurar el pago de {pagoToRestore?.socio?.nombre}{' '}
          {pagoToRestore?.socio?.apellido} del mes{' '}
          {pagoToRestore?.mesCorrespondiente}? Volverá a estar activo en el
          sistema.
        </p>
      </Modal>
    </div>
  )
}

export default PagosList
