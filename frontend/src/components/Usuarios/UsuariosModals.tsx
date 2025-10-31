import React from 'react'
import { Modal } from 'antd'
import { User } from '../../types'
import { getUserDisplayInfo } from '../../utils/usuarios/display'

interface DeleteUsuarioModalProps {
  visible: boolean
  user: User | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const DeleteUsuarioModal: React.FC<DeleteUsuarioModalProps> = ({
  visible,
  user,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const userInfo = user ? getUserDisplayInfo(user) : { name: '', subtitle: '' }

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
        ¿Estás seguro de que deseas eliminar al usuario{' '}
        <strong>{userInfo.name}</strong> (<strong>@{user?.username}</strong>)?
      </p>
      {user?.rol && (
        <p>
          <strong>Rol:</strong> {user.rol.nombre}
        </p>
      )}
      <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
        Esta acción se puede revertir posteriormente. El usuario se mantendrá en
        el historial del sistema.
      </p>
    </Modal>
  )
}

interface RestoreUsuarioModalProps {
  visible: boolean
  user: User | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const RestoreUsuarioModal: React.FC<RestoreUsuarioModalProps> = ({
  visible,
  user,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const userInfo = user ? getUserDisplayInfo(user) : { name: '', subtitle: '' }

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
        ¿Estás seguro de que deseas restaurar al usuario{' '}
        <strong>{userInfo.name}</strong> (<strong>@{user?.username}</strong>)?
      </p>
      {user?.rol && (
        <p>
          <strong>Rol:</strong> {user.rol.nombre}
        </p>
      )}
      <p style={{ color: '#52c41a', fontSize: '14px' }}>
        El usuario volverá a estar activo en el sistema y podrá iniciar sesión
        nuevamente.
      </p>
    </Modal>
  )
}
