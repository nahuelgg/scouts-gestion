import React from 'react'
import { Input, Select, Row, Col, Space, Button, Checkbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { UsuariosFilters } from '../../hooks/useUsuariosFilters'
import { ROLES, ESTADOS_USUARIO } from '../../utils/usuarios/display'

const { Search } = Input
const { Option } = Select

interface UsuariosFiltersComponentProps {
  filters: UsuariosFilters
  onFiltersChange: (filters: Partial<UsuariosFilters>) => void
  onClearFilters: () => void
  hasFullAccess: boolean
}

export const UsuariosFiltersComponent: React.FC<
  UsuariosFiltersComponentProps
> = ({ filters, onFiltersChange, onClearFilters, hasFullAccess }) => {
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
          {ROLES.map((rol) => (
            <Option key={rol.value} value={rol.value}>
              {rol.label}
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
        <Space>
          {hasFullAccess && (
            <Checkbox
              checked={filters.showDeleted}
              onChange={(e) =>
                onFiltersChange({ showDeleted: e.target.checked })
              }
            >
              Mostrar eliminados
            </Checkbox>
          )}
        </Space>
      </Col>

      <Col xs={24} sm={12} md={4}>
        <Button onClick={onClearFilters} style={{ width: '100%' }}>
          Limpiar filtros
        </Button>
      </Col>
    </Row>
  )
}
