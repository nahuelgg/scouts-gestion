import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { deletePago, restorePago, fetchPagos } from '../store/pagosSlice'
import { Pago, FetchPagosParams } from '../types'

export const usePagosActions = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentPage, totalPages, total } = useAppSelector(
    (state) => state.pagos
  )

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [pagoToRestore, setPagoToRestore] = useState<Pago | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pageSize, setPageSize] = useState(20)

  const loadPagos = useCallback(
    (params: FetchPagosParams = {}) => {
      const paginationParams: FetchPagosParams = {
        page: params.page || currentPage,
        limit: params.limit || pageSize,
        includeDeleted: true,
        ...params,
      }
      dispatch(fetchPagos(paginationParams))
    },
    [dispatch, currentPage, pageSize]
  )

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

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
      loadPagos({ page: 1, limit: newPageSize })
    } else {
      loadPagos({ page, limit: pageSize })
    }
  }

  return {
    // State
    deleteModalVisible,
    pagoToDelete,
    restoreModalVisible,
    pagoToRestore,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    total,

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
    handlePageChange,
  }
}
