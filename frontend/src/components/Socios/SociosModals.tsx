import React from 'react'
import { Modal } from 'antd'
import { Persona } from '../../types'

interface DeleteSocioModalProps {
  visible: boolean
  persona: Persona | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const DeleteSocioModal: React.FC<DeleteSocioModalProps> = ({
  visible,
  persona,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      title="Confirmar Eliminación"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Eliminar"
      cancelText="Cancelar"
      okType="danger"
      confirmLoading={loading}
    >
      <p>
        ¿Estás seguro de que deseas eliminar a{' '}
        <strong>
          {persona?.nombre} {persona?.apellido}
        </strong>{' '}
        (DNI: <strong>{persona?.dni}</strong>)?
      </p>
      <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
        Esta acción se puede revertir posteriormente. El socio se mantendrá en
        el historial del sistema.
      </p>
    </Modal>
  )
}

interface RestoreSocioModalProps {
  visible: boolean
  persona: Persona | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const RestoreSocioModal: React.FC<RestoreSocioModalProps> = ({
  visible,
  persona,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      title="Confirmar Restauración"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Restaurar"
      cancelText="Cancelar"
      confirmLoading={loading}
    >
      <p>
        ¿Estás seguro de que deseas restaurar a{' '}
        <strong>
          {persona?.nombre} {persona?.apellido}
        </strong>{' '}
        (DNI: <strong>{persona?.dni}</strong>)?
      </p>
      <p style={{ color: '#52c41a', fontSize: '14px' }}>
        El socio volverá a estar activo en el sistema.
      </p>
    </Modal>
  )
}
