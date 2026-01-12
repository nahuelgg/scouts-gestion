import React, { useEffect, useMemo, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Statistic,
  message,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { clearError } from '../store/pagosSlice'
import { formatCurrency } from '../utils/currency'
import { Pago } from '../types'

// Hooks customizados
import { usePagosFilters } from '../hooks/usePagosFilters'
import { usePagosPermissions } from '../hooks/usePagosPermissions'
import { usePagosActions } from '../hooks/usePagosActions'

// Componentes especializados
import { PagosFiltersComponent } from '../components/Pagos/PagosFilters'
import { PagosTable } from '../components/Pagos/PagosTable'
import {
  DeletePagoModal,
  RestorePagoModal,
} from '../components/Pagos/PagosModals'

const { Title } = Typography

const PagosList: React.FC = () => {
  const dispatch = useAppDispatch()

  // Redux state
  const { pagos, isLoading, error } = useAppSelector((state) => state.pagos)
  const { user } = useAppSelector((state) => state.auth)

  // Hooks customizados
  const permissions = usePagosPermissions(user)
  const actions = usePagosActions()
  const { filters, updateFilters, clearFilters, canOnlyView } =
    usePagosFilters(user)

  // Estadísticas calculadas (basadas en datos de la página actual)
  const statistics = useMemo(() => {
    const pagosActivos = pagos.filter((pago) => !pago.deleted)
    const totalMonto = pagosActivos.reduce((sum, pago) => sum + pago.monto, 0)
    const pagosConfirmados = pagosActivos.filter(
      (pago) => pago.estado === 'confirmado'
    ).length
    const pagosPendientes = pagosActivos.filter(
      (pago) => pago.estado === 'pendiente'
    ).length

    return {
      totalPagos: pagosActivos.length,
      totalMonto,
      pagosConfirmados,
      pagosPendientes,
    }
  }, [pagos])

  // Efectos
  useEffect(() => {
    const startDate = filters.dateRange?.[0]?.toISOString()
    const endDate = filters.dateRange?.[1]?.toISOString()

    actions.loadPagos({
      page: 1, // Resetear a página 1 cuando cambian los filtros
      metodoPago: filters.selectedMetodoPago || undefined,
      tipoPago: filters.selectedTipoPago || undefined,
      socio: filters.searchText || undefined,
      startDate,
      endDate,
    })
  }, [filters])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])
  const handleDelete = (pago: Pago) => {
    if (!permissions.canDeletePago(pago)) {
      message.error('No tienes permisos para eliminar este pago')
      return
    }
    actions.handleDelete(pago)
  }

  const handleRestore = (pago: Pago) => {
    if (!permissions.canDeletePago(pago)) {
      message.error('No tienes permisos para restaurar este pago')
      return
    }
    actions.handleRestore(pago)
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Gestión de Pagos
          </Title>
        </Col>
        <Col>
          <Space>
            {!permissions.canOnlyView && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={actions.handleCreateNew}
              >
                Nuevo Pago
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Card con filtros y tabla */}
      <Card>
        {/* Filtros */}
        <PagosFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Tabla */}
        <PagosTable
          pagos={pagos}
          loading={isLoading}
          currentPage={actions.currentPage}
          pageSize={actions.pageSize}
          total={actions.total}
          onPageChange={actions.handlePageChange}
          canDeletePago={permissions.canDeletePago}
          canEditPago={permissions.canEditPago}
          onView={actions.handleView}
          onEdit={actions.handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </Card>

      {/* Estadísticas */}
      <Card title="Estadísticas" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Total de Pagos"
              value={statistics.totalPagos}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Monto Total"
              value={formatCurrency(statistics.totalMonto)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Pagos Confirmados"
              value={statistics.pagosConfirmados}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Statistic
              title="Pagos Pendientes"
              value={statistics.pagosPendientes}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Modales */}
      <DeletePagoModal
        visible={actions.deleteModalVisible}
        pago={actions.pagoToDelete}
        onConfirm={actions.handleConfirmDelete}
        onCancel={actions.handleCancelDelete}
        loading={actions.actionLoading}
      />

      <RestorePagoModal
        visible={actions.restoreModalVisible}
        pago={actions.pagoToRestore}
        onConfirm={actions.handleConfirmRestore}
        onCancel={actions.handleCancelRestore}
        loading={actions.actionLoading}
      />
    </div>
  )
}

export default PagosList
