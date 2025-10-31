import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch } from '../utils/hooks'
import {
  fetchPersonas,
  deletePersona,
  restorePersona,
} from '../store/personasSlice'
import { ramasAPI } from '../services/api'
import { Persona, Rama } from '../types'

export const useSociosActions = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null)
  const [restoreModalVisible, setRestoreModalVisible] = useState(false)
  const [personaToRestore, setPersonaToRestore] = useState<Persona | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ramas, setRamas] = useState<Rama[]>([])
  const [ramasLoading, setRamasLoading] = useState(false)

  const loadPersonas = useCallback(
    (params = {}) => {
      dispatch(fetchPersonas({ ...params, includeDeleted: true }))
    },
    [dispatch]
  )

  const loadRamas = useCallback(async () => {
    setRamasLoading(true)
    try {
      const response = await ramasAPI.getAll()
      setRamas(response)
    } catch (error) {
      console.error('Error cargando ramas:', error)
      message.error('Error cargando ramas')
    } finally {
      setRamasLoading(false)
    }
  }, [])

  const handleView = (persona: Persona) => {
    navigate(`/socios/${persona._id}`)
  }

  const handleEdit = (persona: Persona) => {
    navigate(`/socios/${persona._id}/editar`)
  }

  const handleDelete = (persona: Persona) => {
    setPersonaToDelete(persona)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!personaToDelete) return

    setActionLoading(true)
    try {
      await dispatch(deletePersona(personaToDelete._id)).unwrap()
      message.success('Socio eliminado exitosamente')
      setDeleteModalVisible(false)
      setPersonaToDelete(null)
      // Recargar la lista
      loadPersonas()
    } catch (error) {
      console.error('Error eliminando socio:', error)
      message.error('Error eliminando socio')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setPersonaToDelete(null)
  }

  const handleRestore = (persona: Persona) => {
    setPersonaToRestore(persona)
    setRestoreModalVisible(true)
  }

  const handleConfirmRestore = async () => {
    if (!personaToRestore) return

    setActionLoading(true)
    try {
      await dispatch(restorePersona(personaToRestore._id)).unwrap()
      message.success('Socio restaurado exitosamente')
      setRestoreModalVisible(false)
      setPersonaToRestore(null)
      // Recargar la lista
      loadPersonas()
    } catch (error) {
      console.error('Error restaurando socio:', error)
      message.error('Error restaurando socio')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelRestore = () => {
    setRestoreModalVisible(false)
    setPersonaToRestore(null)
  }

  const handleCreateNew = () => {
    navigate('/socios/nuevo')
  }

  return {
    // State
    deleteModalVisible,
    personaToDelete,
    restoreModalVisible,
    personaToRestore,
    actionLoading,
    ramas,
    ramasLoading,

    // Actions
    loadPersonas,
    loadRamas,
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
