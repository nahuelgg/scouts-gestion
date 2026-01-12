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
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { clearError } from '../store/usuariosSlice'
import { User } from '../types'

// Hooks customizados
import { useUsuariosFilters } from '../hooks/useUsuariosFilters'
import { useUsuariosPermissions } from '../hooks/useUsuariosPermissions'
import { useUsuariosActions } from '../hooks/useUsuariosActions'

// Componentes especializados
import { UsuariosFiltersComponent } from '../components/Usuarios/UsuariosFilters'
import { UsuariosTable } from '../components/Usuarios/UsuariosTable'
import {
  DeleteUsuarioModal,
  RestoreUsuarioModal,
} from '../components/Usuarios/UsuariosModals'

const { Title } = Typography

const UsuariosList: React.FC = () => {
  const dispatch = useAppDispatch()

  // Redux state
  const { usuarios, isLoading, error } = useAppSelector(
    (state) => state.usuarios
  )
  const { user: currentUser } = useAppSelector((state) => state.auth)

  // Hooks customizados
  const permissions = useUsuariosPermissions(currentUser)
  const actions = useUsuariosActions()
  const { filters, updateFilters, clearFilters, hasFullAccess } =
    useUsuariosFilters(currentUser)

  // Estadísticas calculadas (basadas en datos de la página actual)
  const statistics = useMemo(() => {
    const usuariosActivos = usuarios.filter(
      (user) => !user.deleted && user.activo
    )
    const usuariosInactivos = usuarios.filter(
      (user) => !user.activo || user.deleted
    )
    const administradores = usuarios.filter(
      (user) => !user.deleted && user.rol?.nombre === 'administrador'
    )
    const educadores = usuarios.filter(
      (user) =>
        !user.deleted &&
        ['jefe de grupo', 'jefe de rama'].includes(user.rol?.nombre || '')
    )

    return {
      totalUsuarios: usuariosActivos.length,
      usuariosInactivos: usuariosInactivos.length,
      administradores: administradores.length,
      educadores: educadores.length,
    }
  }, [usuarios])

  // Efectos
  useEffect(() => {
    actions.loadRoles()
  }, [])

  useEffect(() => {
    actions.loadUsuarios({
      page: 1, // Resetear a página 1 cuando cambian los filtros
      search: filters.searchText,
      rol: filters.selectedRol,
      activo: filters.selectedStatus ? filters.selectedStatus === 'true' : undefined,
    })
  }, [filters])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Funciones con validación de permisos
  const handleDelete = (user: User) => {
    if (!permissions.canDeleteUser(user)) {
      message.error('No tienes permisos para eliminar este usuario')
      return
    }
    actions.handleDelete(user)
  }

  const handleRestore = (user: User) => {
    if (!permissions.canDeleteUser(user)) {
      message.error('No tienes permisos para restaurar este usuario')
      return
    }
    actions.handleRestore(user)
  }

  const handleEdit = (user: User) => {
    if (!permissions.canEditUser(user)) {
      message.error('No tienes permisos para editar este usuario')
      return
    }
    actions.handleEdit(user)
  }

  const handleChangePassword = (user: User) => {
    if (!permissions.canEditUser(user)) {
      message.error(
        'No tienes permisos para cambiar la contraseña de este usuario'
      )
      return
    }
    actions.handleChangePassword(user)
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Gestión de Usuarios
          </Title>
        </Col>
        <Col>
          <Space>
            {permissions.canCreateUser && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={actions.handleCreateNew}
              >
                Nuevo Usuario
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Card con filtros y tabla */}
      <Card>
        {/* Filtros */}
        <UsuariosFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          hasFullAccess={hasFullAccess}
          roles={actions.roles}
        />

        {/* Tabla */}
        <UsuariosTable
          usuarios={usuarios}
          loading={isLoading}
          currentPage={actions.currentPage}
          pageSize={actions.pageSize}
          total={actions.total}
          onPageChange={actions.handlePageChange}
          canDeleteUser={permissions.canDeleteUser}
          canEditUser={permissions.canEditUser}
          onView={actions.handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onChangePassword={handleChangePassword}
          currentUser={currentUser}
        />
      </Card>

      {/* Estadísticas */}
      {hasFullAccess && (
        <Card title="Estadísticas del Sistema" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Usuarios Activos"
                value={statistics.totalUsuarios}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Usuarios Inactivos"
                value={statistics.usuariosInactivos}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Administradores"
                value={statistics.administradores}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Educadores"
                value={statistics.educadores}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Modales */}
      <DeleteUsuarioModal
        visible={actions.deleteModalVisible}
        user={actions.userToDelete}
        onConfirm={actions.handleConfirmDelete}
        onCancel={actions.handleCancelDelete}
        loading={actions.actionLoading}
      />

      <RestoreUsuarioModal
        visible={actions.restoreModalVisible}
        user={actions.userToRestore}
        onConfirm={actions.handleConfirmRestore}
        onCancel={actions.handleCancelRestore}
        loading={actions.actionLoading}
      />
    </div>
  )
}

export default UsuariosList
