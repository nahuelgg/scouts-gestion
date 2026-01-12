import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchUsuarios,
  deleteUsuario,
  restoreUsuario,
} from '../store/usuariosSlice'
import { rolesAPI } from '../services/api'
import { User, FetchUsuariosParams, Rol } from '../types'

export const useUsuariosActions = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentPage, totalPages, total } = useAppSelector(
    (state) => state.usuarios
  )

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [userToRestore, setUserToRestore] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageSize, setPageSize] = useState(20)

  const loadUsuarios = useCallback(
    (params: FetchUsuariosParams = {}) => {
      const paginationParams: FetchUsuariosParams = {
        page: params.page || currentPage,
        limit: params.limit || pageSize,
        includeDeleted: true,
        ...params,
      }
      dispatch(fetchUsuarios(paginationParams))
    },
    [dispatch, currentPage, pageSize]
  )

  const handleView = (user: User) => {
    navigate(`/usuarios/${user._id}`)
  }

  const handleEdit = (user: User) => {
    navigate(`/usuarios/${user._id}/editar`)
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    setActionLoading(true)
    try {
      await dispatch(deleteUsuario(userToDelete._id)).unwrap()
      message.success('Usuario eliminado exitosamente')
      setDeleteModalVisible(false)
      setUserToDelete(null)
      loadUsuarios()
    } catch (error) {
      message.error('Error eliminando usuario')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setUserToDelete(null)
  }

  const handleRestore = (user: User) => {
    setUserToRestore(user)
    setRestoreModalVisible(true)
  }

  const handleConfirmRestore = async () => {
    if (!userToRestore) return

    setActionLoading(true)
    try {
      await dispatch(restoreUsuario(userToRestore._id)).unwrap()
      message.success('Usuario restaurado exitosamente')
      setRestoreModalVisible(false)
      setUserToRestore(null)
      loadUsuarios()
    } catch (error) {
      message.error('Error restaurando usuario')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelRestore = () => {
    setRestoreModalVisible(false)
    setUserToRestore(null)
  }

  const handleCreateNew = () => {
    navigate('/usuarios/nuevo')
  }

  const handleChangePassword = (user: User) => {
    navigate(`/usuarios/${user._id}/change-password`)
  }

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
      loadUsuarios({ page: 1, limit: newPageSize })
    } else {
      loadUsuarios({ page, limit: pageSize })
    }
  }

  const [roles, setRoles] = useState<Rol[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  const loadRoles = useCallback(async () => {
    setRolesLoading(true)
    try {
      const response = await rolesAPI.getAll()
      setRoles(response)
    } catch (error) {
      message.error('Error cargando roles')
    } finally {
      setRolesLoading(false)
    }
  }, [])

  return {
    // State
    deleteModalVisible,
    userToDelete,
    restoreModalVisible,
    userToRestore,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    total,
    roles,
    rolesLoading,

    // Actions
    loadUsuarios,
    loadRoles,
    handleView,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleRestore,
    handleConfirmRestore,
    handleCancelRestore,
    handleCreateNew,
    handleChangePassword,
    handlePageChange,
  }
}
