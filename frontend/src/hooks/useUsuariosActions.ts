import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch } from '../utils/hooks'
import {
  fetchUsuarios,
  deleteUsuario,
  restoreUsuario,
} from '../store/usuariosSlice'
import { User } from '../types'

export const useUsuariosActions = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [userToRestore, setUserToRestore] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadUsuarios = () => {
    dispatch(fetchUsuarios({ includeDeleted: true }))
  }

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
      // Recargar la lista
      loadUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
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
      // Recargar la lista
      loadUsuarios()
    } catch (error) {
      console.error('Error restaurando usuario:', error)
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

  return {
    // State
    deleteModalVisible,
    userToDelete,
    restoreModalVisible,
    userToRestore,
    actionLoading,

    // Actions
    loadUsuarios,
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
  }
}
