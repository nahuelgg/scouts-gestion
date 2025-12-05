import React from 'react'
import { Input, Select, Row, Col, Space, Button, Checkbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { UsuariosFilters } from '../../hooks/useUsuariosFilters'
import { ROLES, ESTADOS_USUARIO } from '../../utils/usuarios/display'

import { Rol } from '../../types'

const { Search } = Input
const { Option } = Select

interface UsuariosFiltersComponentProps {
  filters: UsuariosFilters
  onFiltersChange: (filters: Partial<UsuariosFilters>) => void
  onClearFilters: () => void
  hasFullAccess: boolean
  roles: Rol[]
}

export const UsuariosFiltersComponent: React.FC<
  UsuariosFiltersComponentProps
> = ({ filters, onFiltersChange, onClearFilters, hasFullAccess, roles }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={8}>
        <Search
          placeholder="Buscar por usuario, nombre, DNI..."
          value={filters.searchText}
          onChange={(e) => onFiltersChange({ searchText: e.target.value })}
          style={{ width: '100%' }}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Rol"
          value={filters.selectedRol || undefined}
          onChange={(value) => onFiltersChange({ selectedRol: value || '' })}
          style={{ width: '100%' }}
          allowClear
        >
          {roles.map((rol) => (
            <Option key={rol._id} value={rol._id}>
              {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Estado"
          value={filters.selectedStatus || undefined}
          onChange={(value) => onFiltersChange({ selectedStatus: value || '' })}
          style={{ width: '100%' }}
          allowClear
        >
          {ESTADOS_USUARIO.map((estado) => (
            <Option key={estado.value} value={estado.value}>
              {estado.label}
            </Option>
          ))}
        </Select>
      </Col>



      <Col xs={24} sm={12} md={4}>
        <Button onClick={onClearFilters} style={{ width: '100%' }}>
          Limpiar filtros
        </Button>
      </Col>
    </Row>
  )
}
