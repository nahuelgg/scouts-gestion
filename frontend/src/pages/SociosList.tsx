import React, { useEffect, useMemo } from 'react'
import { Card, Row, Col, Typography, Space, Button, Statistic, message } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { clearError } from '../store/personasSlice'
import { Persona } from '../types'

// Hooks customizados
import { useSociosFilters } from '../hooks/useSociosFilters'
import { useSociosPermissions } from '../hooks/useSociosPermissions'
import { useSociosActions } from '../hooks/useSociosActions'

// Componentes especializados
import { SociosFiltersComponent } from '../components/Socios/SociosFilters'
import { SociosTable } from '../components/Socios/SociosTable'
import { DeleteSocioModal, RestoreSocioModal } from '../components/Socios/SociosModals'

// Utils
import { isPersonaMayor } from '../utils/socios/display'

const { Title } = Typography

const SociosList: React.FC = () => {
  const dispatch = useAppDispatch()

  // Redux state
  const { personas, isLoading, error } = useAppSelector((state) => state.personas)
  const { user } = useAppSelector((state) => state.auth)

  // Hooks customizados
  const { filters, filteredPersonas, updateFilters, clearFilters, hasFullAccess } = useSociosFilters(personas, user)
  const permissions = useSociosPermissions(user)
  const actions = useSociosActions()

  // Estadísticas calculadas
  const statistics = useMemo(() => {
    const sociosActivos = filteredPersonas.filter(persona => !persona.deleted && persona.activo)
    const sociosInactivos = filteredPersonas.filter(persona => !persona.deleted && !persona.activo)
    const mayoresDeEdad = filteredPersonas.filter(persona => !persona.deleted && isPersonaMayor(persona))
    const educadores = filteredPersonas.filter(persona => !persona.deleted && persona.funcion === 'educador')

    return {
      totalSocios: sociosActivos.length,
      sociosInactivos: sociosInactivos.length,
      mayoresDeEdad: mayoresDeEdad.length,
      educadores: educadores.length,
    }
  }, [filteredPersonas])

  // Efectos
  useEffect(() => {
    actions.loadRamas()
    actions.loadPersonas()
  }, [])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Funciones con validación de permisos
  const handleDelete = (persona: Persona) => {
    if (!permissions.canDeletePersona(persona)) {
      message.error('No tienes permisos para eliminar este socio')
      return
    }
    actions.handleDelete(persona)
  }

  const handleRestore = (persona: Persona) => {
    if (!permissions.canDeletePersona(persona)) {
      message.error('No tienes permisos para restaurar este socio')
      return
    }
    actions.handleRestore(persona)
  }

  const handleEdit = (persona: Persona) => {
    if (!permissions.canEditPersona(persona)) {
      message.error('No tienes permisos para editar este socio')
      return
    }
    actions.handleEdit(persona)
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Gestión de Socios
          </Title>
        </Col>
        <Col>
          <Space>
            {permissions.canCreateNew && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={actions.handleCreateNew}
              >
                Nuevo Socio
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Card con filtros y tabla */}
      <Card loading={actions.ramasLoading}>
        {/* Filtros */}
        <SociosFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          ramas={actions.ramas}
          hasFullAccess={hasFullAccess}
        />

        {/* Tabla */}
        <SociosTable
          personas={filteredPersonas}
          loading={isLoading}
          canDeletePersona={permissions.canDeletePersona}
          canEditPersona={permissions.canEditPersona}
          canManagePersona={permissions.canManagePersona}
          onView={actions.handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </Card>

      {/* Estadísticas */}
      {hasFullAccess && (
        <Card title="Estadísticas" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Socios Activos"
                value={statistics.totalSocios}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Socios Inactivos"
                value={statistics.sociosInactivos}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Mayores de Edad"
                value={statistics.mayoresDeEdad}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Educadores"
                value={statistics.educadores}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Modales */}
      <DeleteSocioModal
        visible={actions.deleteModalVisible}
        persona={actions.personaToDelete}
        onConfirm={actions.handleConfirmDelete}
        onCancel={actions.handleCancelDelete}
        loading={actions.actionLoading}
      />

      <RestoreSocioModal
        visible={actions.restoreModalVisible}
        persona={actions.personaToRestore}
        onConfirm={actions.handleConfirmRestore}
        onCancel={actions.handleCancelRestore}
        loading={actions.actionLoading}
      />
    </div>
  )
}

export default SociosList