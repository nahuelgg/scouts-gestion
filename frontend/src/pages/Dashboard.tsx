import React, { useEffect, useMemo, useCallback } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Table,
  Tag,
} from 'antd'
import {
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../utils/hooks'
import { fetchPersonas } from '../store/personasSlice'
import { Persona } from '../types'
import { fetchPagos } from '../store/pagosSlice'
import { formatCurrency } from '../utils/currency'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { personas, isLoading: personasLoading } = useAppSelector(
    (state) => state.personas
  )
  const { pagos, isLoading: pagosLoading } = useAppSelector(
    (state) => state.pagos
  )

  const loading = personasLoading || pagosLoading

  // Función para cargar los datos
  const loadDashboardData = useCallback(
    (force = false) => {
      // Solo cargar personas si no están cargadas o se fuerza la actualización
      if (force || personas.length === 0) {
        dispatch(fetchPersonas({ limit: 500 })) // Límite razonable para evitar problemas de performance
      }

      // Cargar pagos con eliminados incluidos para estadísticas precisas
      if (force || pagos.length === 0) {
        dispatch(
          fetchPagos({
            includeDeleted: true, // ✅ Incluir eliminados para estadísticas correctas
            limit: 200, // Límite optimizado
          })
        ).catch((error) => {
          console.error('Error cargando datos del Dashboard:', error)
          // En caso de error, intentar cargar sin filtro de mes
          dispatch(fetchPagos({ limit: 100, includeDeleted: true }))
        })
      }
    },
    [dispatch, personas.length, pagos.length]
  )

  useEffect(() => {
    // Cargar datos al Redux store cuando se monta el componente
    loadDashboardData()
  }, [loadDashboardData])

  // Detectar cuando se navega de vuelta al Dashboard y refrescar datos si es necesario
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      // Solo recargar si no hay datos
      const shouldReload = personas.length === 0 || pagos.length === 0
      if (shouldReload) {
        loadDashboardData()
      }
    }
  }, [location.pathname, loadDashboardData, personas.length, pagos.length])

  // Calcular estadísticas usando useMemo para optimizar rendimiento
  const stats = useMemo(() => {
    const totalSocios = personas.length
    const sociosActivos = personas.filter((persona) => persona.activo).length

    // Filtrar pagos activos (no eliminados) para estadísticas
    const pagosActivos = pagos.filter((pago) => !pago.deleted)

    // Para pagos del mes, usar solo pagos activos del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7)
    const pagosDelMes = pagosActivos.filter((pago) => {
      const fechaString =
        typeof pago.fechaPago === 'string'
          ? pago.fechaPago
          : new Date(pago.fechaPago).toISOString()
      return fechaString.startsWith(currentMonth)
    })

    const pagosEsteMes = pagosDelMes.length
    const totalRecaudado = pagosDelMes.reduce(
      (sum, pago) => sum + pago.monto,
      0
    )

    return {
      totalSocios,
      sociosActivos,
      pagosEsteMes,
      totalRecaudado,
    }
  }, [personas, pagos])

  // Obtener pagos recientes para la tabla (solo pagos activos)
  const recentPayments = useMemo(() => {
    const pagosActivos = pagos.filter((pago) => !pago.deleted)
    return [...pagosActivos]
      .sort((a, b) => {
        const dateA = new Date(a.fechaPago).getTime()
        const dateB = new Date(b.fechaPago).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [pagos])

  const paymentColumns = [
    {
      title: 'Socio',
      dataIndex: ['socio'],
      key: 'socio',
      render: (socio: Persona) => `${socio?.nombre} ${socio?.apellido}`,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => formatCurrency(monto),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPago',
      key: 'fechaPago',
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Método',
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      render: (metodo: string) => (
        <Tag color="blue">{metodo.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoPago',
      key: 'tipoPago',
      render: (tipo: string) => (
        <Tag color="green">{tipo.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
  ]

  const canManageSocios = [
    'administrador',
    'jefe de grupo',
    'jefe de rama',
  ].includes(user?.rol?.nombre || '')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={2}>Dashboard</Title>
            <Typography.Text type="secondary">
              Bienvenido, {user?.persona?.nombre}
            </Typography.Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadDashboardData(true)}
            loading={loading}
            type="default"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Socios"
              value={stats.totalSocios}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Socios Activos"
              value={stats.sociosActivos}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pagos Este Mes"
              value={stats.pagosEsteMes}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Recaudado"
              value={formatCurrency(stats.totalRecaudado)}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      {canManageSocios && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Acciones Rápidas">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/socios/nuevo')}
                >
                  Nuevo Socio
                </Button>
                <Button
                  icon={<DollarOutlined />}
                  onClick={() => navigate('/pagos/nuevo')}
                >
                  Registrar Pago
                </Button>
                <Button onClick={() => navigate('/socios')}>
                  Ver Todos los Socios
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Pagos recientes */}
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="Pagos Recientes"
            extra={
              <Button type="link" onClick={() => navigate('/pagos')}>
                Ver todos
              </Button>
            }
          >
            <Table
              columns={paymentColumns}
              dataSource={recentPayments}
              rowKey="_id"
              pagination={false}
              loading={loading}
              locale={{
                emptyText: 'No hay pagos registrados este mes',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
