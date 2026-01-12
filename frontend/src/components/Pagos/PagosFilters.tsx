import React from 'react'
import { Input, Select, DatePicker, Row, Col, Space, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { PagosFilters } from '../../hooks/usePagosFilters'
import { METODOS_PAGO, TIPOS_PAGO } from '../../utils/pagos/display'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

interface PagosFiltersComponentProps {
  filters: PagosFilters
  onFiltersChange: (filters: Partial<PagosFilters>) => void
  onClearFilters: () => void
}

export const PagosFiltersComponent: React.FC<PagosFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Search
          placeholder="Buscar por socio, DNI, método..."
          value={filters.searchText}
          onChange={(e) => onFiltersChange({ searchText: e.target.value })}
          style={{ width: '100%' }}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} md={8} lg={6}>
        <Select
          placeholder="Método de pago"
          value={filters.selectedMetodoPago || undefined}
          onChange={(value) =>
            onFiltersChange({ selectedMetodoPago: value || '' })
          }
          style={{ width: '100%' }}
          allowClear
        >
          {METODOS_PAGO.map((metodo) => (
            <Option key={metodo.value} value={metodo.value}>
              {metodo.label}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={8} lg={6}>
        <Select
          placeholder="Tipo de pago"
          value={filters.selectedTipoPago || undefined}
          onChange={(value) =>
            onFiltersChange({ selectedTipoPago: value || '' })
          }
          style={{ width: '100%' }}
          allowClear
        >
          {TIPOS_PAGO.map((tipo) => (
            <Option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={16} lg={12}>
        <Space>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onFiltersChange({ dateRange: [dates[0], dates[1]] })
              } else {
                onFiltersChange({ dateRange: null })
              }
            }}
            placeholder={['Fecha inicio', 'Fecha fin']}
            format="DD/MM/YYYY"
          />
          <Button onClick={onClearFilters}>Limpiar filtros</Button>
        </Space>
      </Col>
    </Row>
  )
}
