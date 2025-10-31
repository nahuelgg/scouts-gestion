import React from 'react'
import { Table, Tag, Tooltip, Button, Space } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Persona } from '../../types'
import {
  getFuncionColor,
  getFuncionDisplay,
  getRamaColor,
  getEstadoColor,
  getEstadoDisplay,
  formatAge,
  formatAddress,
} from '../../utils/socios/display'

interface SociosTableProps {
  personas: Persona[]
  loading: boolean
  canDeletePersona: (persona: Persona) => boolean
  canEditPersona: (persona: Persona) => boolean
  canManagePersona: (persona: Persona) => boolean
  onView: (persona: Persona) => void
  onEdit: (persona: Persona) => void
  onDelete: (persona: Persona) => void
  onRestore: (persona: Persona) => void
}

export const SociosTable: React.FC<SociosTableProps> = ({
  personas,
  loading,
  canDeletePersona,
  canEditPersona,
  canManagePersona,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const columns = [
    {
      title: 'Nombre Completo',
      key: 'nombre',
      render: (record: Persona) => (
        <div>
          <strong>
            {record.nombre} {record.apellido}
          </strong>
          <br />
          <small style={{ color: '#666' }}>DNI: {record.dni}</small>
        </div>
      ),
      sorter: (a: Persona, b: Persona) => {
        const aName = `${a.nombre} ${a.apellido}`
        const bName = `${b.nombre} ${b.apellido}`
        return aName.localeCompare(bName)
      },
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (record: Persona) => (
        <div>
          <div>📧 {record.email || 'Sin email'}</div>
          <div>📱 {record.telefono || 'Sin teléfono'}</div>
        </div>
      ),
    },
    {
      title: 'Edad',
      key: 'edad',
      render: (record: Persona) => (
        <span>
          {record.fechaNacimiento ? formatAge(record.fechaNacimiento) : 'N/A'}
        </span>
      ),
      sorter: (a: Persona, b: Persona) => {
        if (!a.fechaNacimiento || !b.fechaNacimiento) return 0
        return (
          new Date(a.fechaNacimiento).getTime() -
          new Date(b.fechaNacimiento).getTime()
        )
      },
    },
    {
      title: 'Rama',
      key: 'rama',
      render: (record: Persona) =>
        record.rama ? (
          <Tag color={getRamaColor(record.rama.nombre)}>
            {record.rama.nombre.charAt(0).toUpperCase() +
              record.rama.nombre.slice(1)}
          </Tag>
        ) : (
          <Tag color="default">Sin rama</Tag>
        ),
      sorter: (a: Persona, b: Persona) => {
        const aRama = a.rama?.nombre || ''
        const bRama = b.rama?.nombre || ''
        return aRama.localeCompare(bRama)
      },
    },
    {
      title: 'Función',
      key: 'funcion',
      render: (record: Persona) => (
        <Tag color={getFuncionColor(record.funcion)}>
          {getFuncionDisplay(record.funcion)}
        </Tag>
      ),
      sorter: (a: Persona, b: Persona) => a.funcion.localeCompare(b.funcion),
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (record: Persona) => (
        <Tag color={getEstadoColor(record.activo)}>
          {getEstadoDisplay(record.activo)}
        </Tag>
      ),
      sorter: (a: Persona, b: Persona) => Number(b.activo) - Number(a.activo),
    },
    {
      title: 'Dirección',
      key: 'direccion',
      render: (record: Persona) => (
        <Tooltip title={formatAddress(record)}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.direccion?.ciudad || 'Sin dirección'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: Persona) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>

          {canEditPersona(record) && !record.deleted && (
            <Tooltip title="Editar">
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {canDeletePersona(record) && !record.deleted && (
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

          {canDeletePersona(record) && record.deleted && (
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
      dataSource={personas}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1200 }}
      pagination={{
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} de ${total} socios`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
      }}
      rowClassName={(record) => (record.deleted ? 'table-row-deleted' : '')}
    />
  )
}
