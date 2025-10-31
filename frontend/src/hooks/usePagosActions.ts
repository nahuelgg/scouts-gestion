import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch } from '../utils/hooks'
import { deletePago, restorePago, fetchPagos } from '../store/pagosSlice'
import { Pago } from '../types'

export const usePagosActions = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [pagoToRestore, setPagoToRestore] = useState<Pago | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadPagos = () => {
    dispatch(fetchPagos({ includeDeleted: true }))
  }

  const handleView = (pago: Pago) => {
    navigate(`/pagos/${pago._id}`)
  }

  const handleEdit = (pago: Pago) => {
    navigate(`/pagos/${pago._id}/editar`)
  }

  const handleDelete = (pago: Pago) => {
    setPagoToDelete(pago)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!pagoToDelete) return

    setActionLoading(true)
    try {
      await dispatch(deletePago(pagoToDelete._id)).unwrap()
      message.success('Pago eliminado exitosamente')
      setDeleteModalVisible(false)
      setPagoToDelete(null)
      loadPagos()
    } catch (error) {
      console.error('Error eliminando pago:', error)
      message.error('Error eliminando pago')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setPagoToDelete(null)
  }

  const handleRestore = (pago: Pago) => {
    setPagoToRestore(pago)
    setRestoreModalVisible(true)
  }

  const handleConfirmRestore = async () => {
    if (!pagoToRestore) return

    setActionLoading(true)
    try {
      await dispatch(restorePago(pagoToRestore._id)).unwrap()
      message.success('Pago restaurado exitosamente')
      setRestoreModalVisible(false)
      setPagoToRestore(null)
      loadPagos()
    } catch (error) {
      console.error('Error restaurando pago:', error)
      message.error('Error restaurando pago')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelRestore = () => {
    setRestoreModalVisible(false)
    setPagoToRestore(null)
  }

  const handleCreateNew = () => {
    navigate('/pagos/nuevo')
  }

  return {
    // State
    deleteModalVisible,
    pagoToDelete,
    restoreModalVisible,
    pagoToRestore,
    actionLoading,

    // Actions
    loadPagos,
    handleView,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleRestore,
    handleConfirmRestore,
    handleCancelRestore,
    handleCreateNew,
  }
}
