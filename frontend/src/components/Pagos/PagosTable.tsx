import React from 'react'
import { Table, Tag, Tooltip, Button, Space } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Pago } from '../../types'
import { formatCurrency } from '../../utils/currency'
import {
  getMetodoPagoColor,
  getMetodoPagoDisplay,
  getTipoPagoColor,
  getTipoPagoDisplay,
  getEstadoColor,
  getEstadoDisplay,
} from '../../utils/pagos/display'

interface PagosTableProps {
  pagos: Pago[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
  onPageChange: (page: number, pageSize?: number) => void
  canDeletePago: (pago: Pago) => boolean
  canEditPago: (pago: Pago) => boolean
  onView: (pago: Pago) => void
  onEdit: (pago: Pago) => void
  onDelete: (pago: Pago) => void
  onRestore: (pago: Pago) => void
}

export const PagosTable: React.FC<PagosTableProps> = ({
  pagos,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  canDeletePago,
  canEditPago,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
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
        <Tag color={getEstadoColor(record.estado)}>
          {getEstadoDisplay(record.estado)}
        </Tag>
      ),
      sorter: (a: Pago, b: Pago) => a.estado.localeCompare(b.estado),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: Pago) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>

          {canEditPago(record) && !record.deleted && (
            <Tooltip title="Editar">
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {canDeletePago(record) && !record.deleted && (
            <Tooltip title="Eliminar">
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          )}

          {canDeletePago(record) && record.deleted && (
            <Tooltip title="Restaurar">
              <Button
                type="default"
                icon={<UndoOutlined />}
                size="small"
                onClick={() => onRestore(record)}
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 150,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={pagos}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1200 }}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} de ${total} pagos`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      rowClassName={(record) => (record.deleted ? 'table-row-deleted' : '')}
    />
  )
}
