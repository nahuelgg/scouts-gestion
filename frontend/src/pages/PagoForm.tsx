import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
  Upload,
  message,
  Space,
  InputNumber,
  Switch,
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  createPago,
  updatePago,
  fetchPagoById,
  clearCurrentPago,
  clearError,
} from '../store/pagosSlice'
import { personasAPI } from '../services/api'
import dayjs from 'dayjs'
import type { Persona, PagoFormData } from '../types'
import type { UploadFile } from 'antd/es/upload/interface'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const PagoForm: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { currentPago, isLoading, error } = useAppSelector(
    (state) => state.pagos
  )
  const { user } = useAppSelector((state) => state.auth)

  const [personas, setPersonas] = useState<Persona[]>([])
  const [loadingPersonas, setLoadingPersonas] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const isEditing = !!id

  // Verificar permisos del usuario
  const userRole = user?.rol?.nombre
  const canOnlyView = userRole === 'socio' || !userRole

  // Si es socio sin permisos de edición, redirigir
  useEffect(() => {
    if (canOnlyView) {
      message.error('No tienes permisos para acceder a esta página')
      navigate('/pagos')
      return
    }
  }, [canOnlyView, navigate])

  useEffect(() => {
    loadPersonas()

    if (isEditing && id) {
      dispatch(fetchPagoById(id))
    }

    return () => {
      dispatch(clearCurrentPago())
    }
  }, [id, isEditing, dispatch])

  useEffect(() => {
    if (currentPago && isEditing) {
      form.setFieldsValue({
        socio: currentPago.socio._id,
        monto: currentPago.monto,
        fechaPago: dayjs(currentPago.fechaPago),
        mesCorrespondiente: currentPago.mesCorrespondiente,
        metodoPago: currentPago.metodoPago,
        tipoPago: currentPago.tipoPago,
        observaciones: currentPago.observaciones,
        estado: currentPago.estado,
      })

      // Si hay comprobante, mostrarlo en la lista de archivos
      if (currentPago.comprobante) {
        setFileList([
          {
            uid: '-1',
            name: currentPago.comprobante.originalName,
            status: 'done',
            url: `${process.env.REACT_APP_API_URL}/uploads/${currentPago.comprobante.path}`,
          },
        ])
      }
    }
  }, [currentPago, form, isEditing])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadPersonas = async () => {
    try {
      setLoadingPersonas(true)
      const response = await personasAPI.getAll()
      let allPersonas = response.personas || response

      // Filtrar personas según el rol del usuario
      const userRole = user?.rol?.nombre
      const userRamaId = user?.persona?.rama?._id

      // Si es jefe de rama, solo mostrar personas de su rama
      if (userRole === 'jefe de rama' && userRamaId) {
        allPersonas = allPersonas.filter(
          (persona: any) => persona.rama?._id === userRamaId
        )
      }

      setPersonas(allPersonas)
    } catch (error) {
      message.error('Error cargando personas')
    } finally {
      setLoadingPersonas(false)
    }
  }

  const onFinish = async (values: any) => {
    const formData = new FormData()

    // Normalizar el monto: reemplazar comas por puntos y convertir a número
    const normalizedMonto = values.monto.toString().replace(/,/g, '.')
    const montoNumber = parseFloat(normalizedMonto)

    // Datos básicos del pago
    formData.append('socio', values.socio)
    formData.append('monto', montoNumber.toString())
    formData.append('fechaPago', values.fechaPago.toISOString())
    formData.append('mesCorrespondiente', values.mesCorrespondiente)
    formData.append('metodoPago', values.metodoPago)
    formData.append('tipoPago', values.tipoPago)

    if (values.observaciones) {
      formData.append('observaciones', values.observaciones)
    }

    if (values.estado) {
      formData.append('estado', values.estado)
    }

    // Agregar archivo si existe
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('comprobante', fileList[0].originFileObj)
    }

    try {
      if (isEditing && id) {
        await dispatch(updatePago({ id, data: formData })).unwrap()
        message.success('Pago actualizado exitosamente')
      } else {
        await dispatch(createPago(formData)).unwrap()
        message.success('Pago registrado exitosamente')
      }
      navigate('/pagos')
    } catch (error) {
      // El error ya se maneja en el useEffect
    }
  }

  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList]

    // Limitar a un solo archivo
    newFileList = newFileList.slice(-1)

    // Leer archivo como base64 para preview
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url
      }
      return file
    })

    setFileList(newFileList)
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Solo se pueden subir archivos de imagen')
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB')
      return false
    }

    return false // Prevenir upload automático
  }

  const handleCancel = () => {
    navigate('/pagos')
  }

  // Generar opciones para meses
  const getMesesOptions = () => {
    const meses = []
    const currentYear = dayjs().year()

    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        const mesValue = dayjs().year(year).month(month).format('YYYY-MM')
        const mesLabel = dayjs().year(year).month(month).format('MMMM YYYY')
        meses.push({ value: mesValue, label: mesLabel })
      }
    }

    return meses
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {isEditing ? 'Editar Pago' : 'Registrar Nuevo Pago'}
            </Title>
          </Space>
        </Col>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isLoading}
          initialValues={{
            fechaPago: dayjs(),
            mesCorrespondiente: dayjs().format('YYYY-MM'),
            metodoPago: 'efectivo',
            tipoPago: 'mensual',
            estado: 'confirmado',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="socio"
                label="Socio"
                rules={[
                  {
                    required: true,
                    message: 'Por favor selecciona un socio',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Selecciona un socio"
                  loading={loadingPersonas}
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const children = option?.children?.toString().toLowerCase()
                    return children
                      ? children.includes(input.toLowerCase())
                      : false
                  }}
                >
                  {personas.map((persona) => (
                    <Option key={persona._id} value={persona._id}>
                      {persona.nombre} {persona.apellido} - DNI: {persona.dni}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="monto"
                label="Monto"
                rules={[
                  {
                    required: true,
                    message: 'El monto es requerido',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error('El monto es requerido')
                        )
                      }

                      // Normalizar el valor: reemplazar comas por puntos para parseFloat
                      const normalizedValue = value
                        .toString()
                        .replace(/,/g, '.')
                      const num = parseFloat(normalizedValue)

                      if (isNaN(num)) {
                        return Promise.reject(
                          new Error('Debe ser un número válido')
                        )
                      }

                      if (num < 0.01) {
                        return Promise.reject(
                          new Error('El monto debe ser mayor a 0')
                        )
                      }

                      if (num > 99999999.99) {
                        return Promise.reject(
                          new Error('El monto no puede exceder 99,999,999.99')
                        )
                      }

                      // Verificar que no tenga más de 2 decimales
                      const decimalPart = normalizedValue.split('.')[1]
                      if (decimalPart && decimalPart.length > 2) {
                        return Promise.reject(
                          new Error('Solo se permiten hasta 2 decimales')
                        )
                      }

                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Ingresa el monto (ej: 1234.50 o 1234,50)"
                  prefix="$"
                  onChange={(e) => {
                    let value = e.target.value
                    // Permitir solo dígitos, puntos y comas
                    value = value.replace(/[^\d.,]/g, '')

                    // Limitar a un solo separador decimal
                    const parts = value.split(/[.,]/)
                    if (parts.length > 2) {
                      // Si hay más de un separador, mantener solo el primero
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }

                    // Limitar decimales a 2 dígitos
                    if (value.includes('.') || value.includes(',')) {
                      const separatorIndex = Math.max(
                        value.lastIndexOf('.'),
                        value.lastIndexOf(',')
                      )
                      const beforeSeparator = value.substring(0, separatorIndex)
                      const afterSeparator = value.substring(separatorIndex + 1)

                      if (afterSeparator.length > 2) {
                        value =
                          beforeSeparator + '.' + afterSeparator.substring(0, 2)
                      } else {
                        value = beforeSeparator + '.' + afterSeparator
                      }
                    }

                    // Actualizar el valor en el formulario
                    e.target.value = value
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fechaPago"
                label="Fecha de Pago"
                rules={[
                  {
                    required: true,
                    message: 'La fecha de pago es requerida',
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Selecciona la fecha de pago"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="mesCorrespondiente"
                label="Mes Correspondiente"
                rules={[
                  {
                    required: true,
                    message: 'El mes correspondiente es requerido',
                  },
                ]}
              >
                <Select placeholder="Selecciona el mes correspondiente">
                  {getMesesOptions().map((mes) => (
                    <Option key={mes.value} value={mes.value}>
                      {mes.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="metodoPago"
                label="Método de Pago"
                rules={[
                  {
                    required: true,
                    message: 'El método de pago es requerido',
                  },
                ]}
              >
                <Select placeholder="Selecciona el método de pago">
                  <Option value="efectivo">Efectivo</Option>
                  <Option value="transferencia">Transferencia</Option>
                  <Option value="tarjeta_debito">Tarjeta Débito</Option>
                  <Option value="tarjeta_credito">Tarjeta Crédito</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="tipoPago"
                label="Tipo de Pago"
                rules={[
                  {
                    required: true,
                    message: 'El tipo de pago es requerido',
                  },
                ]}
              >
                <Select placeholder="Selecciona el tipo de pago">
                  <Option value="mensual">Mensual</Option>
                  <Option value="afiliacion">Afiliación</Option>
                  <Option value="campamento">Campamento</Option>
                  <Option value="otro">Otro</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="estado" label="Estado del Pago">
                <Select placeholder="Selecciona el estado">
                  <Option value="confirmado">Confirmado</Option>
                  <Option value="pendiente">Pendiente</Option>
                  <Option value="rechazado">Rechazado</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="observaciones" label="Observaciones">
                <TextArea
                  rows={3}
                  placeholder="Observaciones adicionales sobre el pago (opcional)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Comprobante de Pago (Opcional)"
                help="Subir imagen del comprobante de pago (máximo 5MB)"
              >
                <Upload
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  accept="image/*"
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Seleccionar Imagen</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Información sobre el registro */}
          <Card
            size="small"
            title="Información del Registro"
            style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <p>
                  <strong>Registrado por:</strong> {user?.username}
                </p>
                <p>
                  <strong>Fecha de registro:</strong>{' '}
                  {dayjs().format('DD/MM/YYYY HH:mm')}
                </p>
              </Col>
              <Col xs={24} md={12}>
                <p>
                  <strong>Rol:</strong> {user?.rol?.nombre}
                </p>
                {user?.persona?.rama && (
                  <p>
                    <strong>Rama:</strong> {user.persona.rama.nombre}
                  </p>
                )}
              </Col>
            </Row>
          </Card>

          {/* Botones */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isLoading}
                size="large"
              >
                {isEditing ? 'Actualizar Pago' : 'Registrar Pago'}
              </Button>
              <Button onClick={handleCancel} size="large">
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default PagoForm
