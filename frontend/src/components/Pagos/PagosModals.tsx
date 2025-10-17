import React from 'react'
import { Modal } from 'antd'
import { Pago } from '../../types'

interface DeletePagoModalProps {
  visible: boolean
  pago: Pago | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const DeletePagoModal: React.FC<DeletePagoModalProps> = ({
  visible,
  pago,
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
        ¿Estás seguro de que deseas eliminar el pago de{' '}
        <strong>
          {pago?.socio?.nombre} {pago?.socio?.apellido}
        </strong>{' '}
        por <strong>${pago?.monto}</strong> correspondiente a{' '}
        <strong>{pago?.mesCorrespondiente}</strong>?
      </p>
      <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
        Esta acción se puede revertir posteriormente.
      </p>
    </Modal>
  )
}

interface RestorePagoModalProps {
  visible: boolean
  pago: Pago | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const RestorePagoModal: React.FC<RestorePagoModalProps> = ({
  visible,
  pago,
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
        ¿Estás seguro de que deseas restaurar el pago de{' '}
        <strong>
          {pago?.socio?.nombre} {pago?.socio?.apellido}
        </strong>{' '}
        por <strong>${pago?.monto}</strong> correspondiente a{' '}
        <strong>{pago?.mesCorrespondiente}</strong>?
      </p>
      <p style={{ color: '#52c41a', fontSize: '14px' }}>
        El pago volverá a estar visible en la lista principal.
      </p>
    </Modal>
  )
}
