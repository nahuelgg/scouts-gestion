import React from 'react'
import { Table, Tag, Tooltip, Button, Space, Avatar } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { User } from '../../types'
import {
  getRolColor,
  getRolDisplay,
  getEstadoColor,
  getEstadoDisplay,
  formatLastLogin,
  getUserDisplayInfo,
} from '../../utils/usuarios/display'

interface UsuariosTableProps {
  usuarios: User[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
  onPageChange: (page: number, pageSize?: number) => void
  canDeleteUser: (user: User) => boolean
  canEditUser: (user: User) => boolean
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onRestore: (user: User) => void
  onChangePassword: (user: User) => void
  currentUser: User | null
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  canDeleteUser,
  canEditUser,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onChangePassword,
  currentUser,
}) => {
  const columns = [
    {
      title: 'Usuario',
      key: 'usuario',
      render: (record: User) => {
        const { name, subtitle } = getUserDisplayInfo(record)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
                backgroundColor: record.activo ? '#1890ff' : '#d9d9d9',
                color: 'white',
              }}
            />
            <div>
              <strong>{name}</strong>
              {currentUser?._id === record._id && (
                <Tag color="blue" style={{ marginLeft: 4, fontSize: '10px' }}>
                  Tú
                </Tag>
              )}
              <br />
              <small style={{ color: '#666' }}>{subtitle}</small>
            </div>
          </div>
        )
      },
      sorter: (a: User, b: User) => {
        const aName = getUserDisplayInfo(a).name
        const bName = getUserDisplayInfo(b).name
        return aName.localeCompare(bName)
      },
    },
    {
      title: 'DNI',
      key: 'dni',
      render: (record: User) => <span>{record.persona?.dni || 'Sin DNI'}</span>,
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: User) => (
        <span>{record.persona?.email || 'Sin email'}</span>
      ),
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
      key: 'estado',
      render: (record: User) => (
        <Tag color={getEstadoColor(record.activo)}>
          {getEstadoDisplay(record.activo)}
        </Tag>
      ),
      sorter: (a: User, b: User) => Number(b.activo) - Number(a.activo),
    },
    {
      title: 'Último Login',
      key: 'ultimoLogin',
      render: (record: User) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {formatLastLogin(record.ultimoLogin)}
        </span>
      ),
      sorter: (a: User, b: User) => {
        if (!a.ultimoLogin || !b.ultimoLogin) return 0
        return (
          new Date(b.ultimoLogin).getTime() - new Date(a.ultimoLogin).getTime()
        )
      },
    },
    {
      title: 'Rama',
      key: 'rama',
      render: (record: User) =>
        record.persona?.rama ? (
          <Tag color="blue">
            {record.persona.rama.nombre.charAt(0).toUpperCase() +
              record.persona.rama.nombre.slice(1)}
          </Tag>
        ) : (
          <Tag color="default">Sin rama</Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: User) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>

          {canEditUser(record) && !record.deleted && (
            <Tooltip title="Editar">
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {/* {canEditUser(record) && !record.deleted && (
            <Tooltip title="Cambiar contraseña">
              <Button
                type="default"
                icon={<KeyOutlined />}
                size="small"
                onClick={() => onChangePassword(record)}
              />
            </Tooltip>
          )} */}

          {canDeleteUser(record) && !record.deleted && (
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

          {canDeleteUser(record) && record.deleted && (
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
      width: 200,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={usuarios}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1400 }}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} de ${total} usuarios`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      rowClassName={(record) => (record.deleted ? 'table-row-deleted' : '')}
    />
  )
}
