import React from 'react'
import { Input, Select, Row, Col, Space, Button, Checkbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { SociosFilters } from '../../hooks/useSociosFilters'
import { FUNCIONES, ESTADOS } from '../../utils/socios/display'
import { Rama } from '../../types'

const { Search } = Input
const { Option } = Select

interface SociosFiltersComponentProps {
  filters: SociosFilters
  onFiltersChange: (filters: Partial<SociosFilters>) => void
  onClearFilters: () => void
  ramas: Rama[]
  hasFullAccess: boolean
  isJefeDeRama?: boolean
}

export const SociosFiltersComponent: React.FC<SociosFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  ramas,
  hasFullAccess,
  isJefeDeRama = false,
}) => {
  const canSearch = hasFullAccess || isJefeDeRama

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {canSearch && (
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Buscar por nombre, DNI, email..."
            value={filters.searchText}
            onChange={(e) => onFiltersChange({ searchText: e.target.value })}
            style={{ width: '100%' }}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
      )}

      {hasFullAccess && (
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Rama"
            value={filters.selectedRama || undefined}
            onChange={(value) => onFiltersChange({ selectedRama: value || '' })}
            style={{ width: '100%' }}
            allowClear
          >
            {ramas.map((rama) => (
              <Option key={rama._id} value={rama._id}>
                {rama.nombre.charAt(0).toUpperCase() + rama.nombre.slice(1)}
              </Option>
            ))}
          </Select>
        </Col>
      )}

      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Función"
          value={filters.selectedFuncion || undefined}
          onChange={(value) =>
            onFiltersChange({ selectedFuncion: value || '' })
          }
          style={{ width: '100%' }}
          allowClear
        >
          {FUNCIONES.map((funcion) => (
            <Option key={funcion.value} value={funcion.value}>
              {funcion.label}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Estado"
          value={filters.selectedEstado || undefined}
          onChange={(value) => onFiltersChange({ selectedEstado: value || '' })}
          style={{ width: '100%' }}
          allowClear
        >
          {ESTADOS.map((estado) => (
            <Option key={estado.value} value={estado.value}>
              {estado.label}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Space>
          <Checkbox
            checked={filters.showOnlyMayores}
            onChange={(e) =>
              onFiltersChange({ showOnlyMayores: e.target.checked })
            }
          >
            Solo mayores de edad
          </Checkbox>
          <Button onClick={onClearFilters}>Limpiar filtros</Button>
        </Space>
      </Col>
    </Row>
  )
}
