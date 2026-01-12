import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Descriptions,
  Tag,
  Image,
  Spin,
  message,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  fetchPagoById,
  clearCurrentPago,
  clearError,
} from '../store/pagosSlice'
import dayjs from 'dayjs'
import { formatCurrency } from '../utils/currency'

const { Title } = Typography

const PagoDetails: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { currentPago, isLoading, error } = useAppSelector(
    (state) => state.pagos
  )
  const { user } = useAppSelector((state) => state.auth)
  const userRole = user?.rol?.nombre
  const userPersonaId = user?.persona?._id
  const userRamaId = user?.persona?.rama?._id

  const canManageAll =
    userRole === 'administrador' || userRole === 'jefe de grupo'
  const canManageRama = userRole === 'jefe de rama'
  const isOwnerPago = currentPago?.socio?._id === userPersonaId
  const isFromUserRama = currentPago?.socio?.rama?._id === userRamaId
  const canEditThisPago = canManageAll || (canManageRama && isFromUserRama)

  useEffect(() => {
    if (id) {
      dispatch(fetchPagoById(id))
    }

    return () => {
      dispatch(clearCurrentPago())
    }
  }, [id, dispatch])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Cargando detalles del pago...</p>
      </div>
    )
  }

  if (!currentPago) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Pago no encontrado</p>
        <Button onClick={() => navigate('/pagos')}>Volver a la lista</Button>
      </div>
    )
  }

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'green'
      case 'transferencia':
        return 'blue'
      case 'tarjeta_debito':
        return 'orange'
      case 'tarjeta_credito':
        return 'purple'
      default:
        return 'default'
    }
  }

  const getMetodoPagoDisplay = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'Efectivo'
      case 'transferencia':
        return 'Transferencia'
      case 'tarjeta_debito':
        return 'Tarjeta Débito'
      case 'tarjeta_credito':
        return 'Tarjeta Crédito'
      default:
        return metodo
    }
  }

  const getTipoPagoColor = (tipo: string) => {
    switch (tipo) {
      case 'mensual':
        return 'blue'
      case 'afiliacion':
        return 'green'
      case 'campamento':
        return 'orange'
      case 'otro':
        return 'purple'
      default:
        return 'default'
    }
  }

  const getTipoPagoDisplay = (tipo: string) => {
    switch (tipo) {
      case 'mensual':
        return 'Mensual'
      case 'afiliacion':
        return 'Afiliación'
      case 'campamento':
        return 'Campamento'
      case 'otro':
        return 'Otro'
      default:
        return tipo
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'green'
      case 'pendiente':
        return 'orange'
      case 'rechazado':
        return 'red'
      default:
        return 'default'
    }
  }

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'Confirmado'
      case 'pendiente':
        return 'Pendiente'
      case 'rechazado':
        return 'Rechazado'
      default:
        return estado
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadComprobante = () => {
    if (currentPago.comprobante) {
      const url = `${process.env.REACT_APP_API_URL}/uploads/${currentPago.comprobante.path}`
      const link = document.createElement('a')
      link.href = url
      link.download = currentPago.comprobante.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/pagos')}
            >
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Detalles del Pago
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Imprimir
            </Button>
            {/* Solo mostrar botón editar para usuarios con permisos de gestión */}
            {canEditThisPago && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/pagos/${currentPago._id}/editar`)}
              >
                Editar Pago
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Información del Pago */}
        <Col xs={24} lg={12}>
          <Card title="Información del Pago" style={{ height: '100%' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Monto">
                {formatCurrency(currentPago.monto)}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Pago">
                {dayjs(currentPago.fechaPago).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Mes Correspondiente">
                <strong>{currentPago.mesCorrespondiente}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Método de Pago">
                <Tag color={getMetodoPagoColor(currentPago.metodoPago)}>
                  {getMetodoPagoDisplay(currentPago.metodoPago)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Pago">
                <Tag color={getTipoPagoColor(currentPago.tipoPago)}>
                  {getTipoPagoDisplay(currentPago.tipoPago)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={getEstadoColor(currentPago.estado)}>
                  {getEstadoDisplay(currentPago.estado)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Registro">
                {dayjs(currentPago.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              {currentPago.updatedAt &&
                currentPago.updatedAt !== currentPago.createdAt && (
                  <Descriptions.Item label="Última Actualización">
                    {dayjs(currentPago.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
            </Descriptions>
          </Card>
        </Col>

        {/* Información del Socio */}
        <Col xs={24} lg={12}>
          <Card title="Información del Socio" style={{ height: '100%' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Nombre Completo">
                <strong>
                  {currentPago.socio.nombre} {currentPago.socio.apellido}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="DNI">
                {currentPago.socio.dni}
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">
                {currentPago.socio.telefono || 'No especificado'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {currentPago.socio.email || 'No especificado'}
              </Descriptions.Item>
              <Descriptions.Item label="Dirección">
                {currentPago.socio.direccion
                  ? `${currentPago.socio.direccion.calle} ${
                      currentPago.socio.direccion.numero
                    }, ${currentPago.socio.direccion.ciudad}${
                      currentPago.socio.direccion.codigoPostal
                        ? ` (${currentPago.socio.direccion.codigoPostal})`
                        : ''
                    }`
                  : 'No especificada'}
              </Descriptions.Item>
              {currentPago.socio.rama && (
                <Descriptions.Item label="Rama">
                  <Tag color="blue">{currentPago.socio.rama.nombre}</Tag>
                </Descriptions.Item>
              )}
              {currentPago.socio.funcion && (
                <Descriptions.Item label="Función">
                  <Tag color="purple">{currentPago.socio.funcion}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Observaciones */}
        {currentPago.observaciones && (
          <Col xs={24}>
            <Card title="Observaciones">
              <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {currentPago.observaciones}
              </p>
            </Card>
          </Col>
        )}

        {/* Comprobante */}
        {currentPago.comprobante && (
          <Col xs={24}>
            <Card
              title="Comprobante de Pago"
              extra={
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadComprobante}
                >
                  Descargar
                </Button>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Nombre Original">
                      {currentPago.comprobante.originalName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tamaño">
                      {(currentPago.comprobante.size / 1024 / 1024).toFixed(2)}{' '}
                      MB
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo">
                      {currentPago.comprobante.mimetype}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      width={200}
                      src={`${process.env.REACT_APP_API_URL}/uploads/${currentPago.comprobante.path}`}
                      alt="Comprobante de pago"
                      placeholder={
                        <div style={{ padding: '20px' }}>
                          <Spin />
                        </div>
                      }
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Información del Registro */}
        <Col xs={24}>
          <Card title="Información del Registro">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Registrado por">
                <strong>
                  {currentPago.registradoPor?.persona
                    ? `${currentPago.registradoPor.persona.nombre} ${currentPago.registradoPor.persona.apellido}`
                    : currentPago.registradoPor?.username}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Registro">
                {dayjs(currentPago.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              {currentPago.updatedAt &&
                currentPago.updatedAt !== currentPago.createdAt && (
                  <>
                    <Descriptions.Item label="Última Modificación">
                      {dayjs(currentPago.updatedAt).format(
                        'DD/MM/YYYY HH:mm:ss'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Modificado por">
                      <strong>
                        {currentPago.modificadoPor
                          ? currentPago.modificadoPor.persona
                            ? `${currentPago.modificadoPor.persona.nombre} ${currentPago.modificadoPor.persona.apellido}`
                            : currentPago.modificadoPor.username
                          : 'Información no disponible'}
                      </strong>
                    </Descriptions.Item>
                  </>
                )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Sección de impresión oculta */}
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1>Comprobante de Pago</h1>
            <p>Grupo Scout</p>
          </div>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <h3>Información del Pago</h3>
              <p>
                <strong>Monto:</strong> {formatCurrency(currentPago.monto)}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {dayjs(currentPago.fechaPago).format('DD/MM/YYYY')}
              </p>
              <p>
                <strong>Mes:</strong> {currentPago.mesCorrespondiente}
              </p>
              <p>
                <strong>Método:</strong>{' '}
                {getMetodoPagoDisplay(currentPago.metodoPago)}
              </p>
              <p>
                <strong>Tipo:</strong>{' '}
                <Tag color="green">
                  {currentPago.tipoPago.replace('_', ' ').toUpperCase()}
                </Tag>
              </p>
              <p>
                <strong>Estado:</strong> {getEstadoDisplay(currentPago.estado)}
              </p>
            </Col>
            <Col span={12}>
              <h3>Información del Socio</h3>
              <p>
                <strong>Nombre:</strong> {currentPago.socio.nombre}{' '}
                {currentPago.socio.apellido}
              </p>
              <p>
                <strong>DNI:</strong> {currentPago.socio.dni}
              </p>
              <p>
                <strong>Teléfono:</strong>{' '}
                {currentPago.socio.telefono || 'No especificado'}
              </p>
              {currentPago.socio.rama && (
                <p>
                  <strong>Rama:</strong> {currentPago.socio.rama.nombre}
                </p>
              )}
            </Col>
          </Row>

          {currentPago.observaciones && (
            <>
              <Divider />
              <h3>Observaciones</h3>
              <p>{currentPago.observaciones}</p>
            </>
          )}

          <Divider />
          <p style={{ fontSize: '12px', color: '#666' }}>
            Registrado por:{' '}
            {currentPago.registradoPor?.persona
              ? `${currentPago.registradoPor.persona.nombre} ${currentPago.registradoPor.persona.apellido}`
              : currentPago.registradoPor?.username}{' '}
            - {dayjs(currentPago.createdAt).format('DD/MM/YYYY HH:mm')}
            {currentPago.modificadoPor && (
              <>
                {' '}
                | Modificado por:{' '}
                {currentPago.modificadoPor.persona
                  ? `${currentPago.modificadoPor.persona.nombre} ${currentPago.modificadoPor.persona.apellido}`
                  : currentPago.modificadoPor.username}{' '}
                - {dayjs(currentPago.updatedAt).format('DD/MM/YYYY HH:mm')}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .ant-layout,
          .ant-layout-content,
          .ant-card,
          .ant-row,
          .ant-col {
            box-shadow: none !important;
            border: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-only,
          .print-only * {
            visibility: visible;
          }
          
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default PagoDetails
