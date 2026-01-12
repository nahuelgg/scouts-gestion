import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  message,
  Space,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  createPersona,
  updatePersona,
  fetchPersonaById,
  clearError,
  clearCurrentPersona,
} from '../store/personasSlice'
import { ramasAPI } from '../services/api'
import {
  Persona,
  PersonaFormData,
  Rama,
  SocioFormValues, // ← Nueva interfaz agregada
} from '../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const SocioForm: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { currentPersona, isLoading, error } = useAppSelector(
    (state) => state.personas
  )
  const { user } = useAppSelector((state) => state.auth)
  const [ramas, setRamas] = useState<Rama[]>([])
  const [loadingRamas, setLoadingRamas] = useState(false)

  const isEditing = !!id
  const isJefeDeRama = user?.rol?.nombre === 'jefe de rama'
  const userRamaId = user?.persona?.rama?._id

  useEffect(() => {
    loadRamas()

    if (isEditing && id) {
      dispatch(fetchPersonaById(id))
    } else if (isJefeDeRama && userRamaId) {
      // Si es jefe de rama y está creando una nueva persona, pre-seleccionar su rama
      form.setFieldsValue({
        rama: userRamaId,
      })
    }

    return () => {
      dispatch(clearCurrentPersona())
    }
  }, [id, isEditing, isJefeDeRama, userRamaId]) // Removido dispatch

  useEffect(() => {
    if (currentPersona && isEditing) {
      form.setFieldsValue({
        nombre: currentPersona.nombre,
        apellido: currentPersona.apellido,
        dni: currentPersona.dni,
        calle: currentPersona.direccion.calle,
        numero: currentPersona.direccion.numero,
        ciudad: currentPersona.direccion.ciudad,
        codigoPostal: currentPersona.direccion.codigoPostal,
        telefono: currentPersona.telefono,
        email: currentPersona.email,
        fechaNacimiento: currentPersona.fechaNacimiento
          ? dayjs(currentPersona.fechaNacimiento)
          : null,
        rama: currentPersona.rama?._id,
        funcion: currentPersona.funcion,
      })
    }
  }, [currentPersona, form, isEditing])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error]) // Removido dispatch

  const loadRamas = async () => {
    try {
      setLoadingRamas(true)
      const response = await ramasAPI.getAll()
      setRamas(response)
    } catch (error) {
      message.error('Error cargando ramas')
    } finally {
      setLoadingRamas(false)
    }
  }

  const onFinish = async (values: SocioFormValues) => {
    const formData: PersonaFormData = {
      nombre: values.nombre,
      apellido: values.apellido,
      dni: values.dni,
      direccion: {
        calle: values.calle,
        numero: values.numero,
        ciudad: values.ciudad,
        codigoPostal: values.codigoPostal,
      },
      telefono: values.telefono,
      email: values.email,
      fechaNacimiento: values.fechaNacimiento
        ? values.fechaNacimiento.toDate()
        : undefined,
      rama: values.rama,
      funcion: values.funcion,
    }

    try {
      if (isEditing && id) {
        await dispatch(updatePersona({ id, data: formData })).unwrap()
        message.success('Socio actualizado exitosamente')
      } else {
        await dispatch(createPersona(formData)).unwrap()
        message.success('Socio creado exitosamente')
      }
      navigate('/socios')
    } catch (error) {
      // El error ya se maneja en el useEffect
    }
  }

  const handleCancel = () => {
    navigate('/socios')
  }

  return (
    <div>
      <Title level={2}>{isEditing ? 'Editar Socio' : 'Nuevo Socio'}</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isLoading}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  {
                    min: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                ]}
              >
                <Input placeholder="Ingresa el nombre" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[
                  { required: true, message: 'El apellido es requerido' },
                  {
                    min: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                ]}
              >
                <Input placeholder="Ingresa el apellido" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="dni"
                label="DNI"
                rules={[
                  { required: true, message: 'El DNI es requerido' },
                  {
                    pattern: /^\d{7,8}$/,
                    message: 'DNI debe tener 7 u 8 dígitos',
                  },
                ]}
              >
                <Input placeholder="Ingresa el DNI" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="telefono"
                label="Teléfono"
                rules={[
                  { required: true, message: 'El teléfono es requerido' },
                ]}
              >
                <Input placeholder="Ej: +54 9 11 1234-5678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email no válido' }]}
              >
                <Input placeholder="Ingresa el email (opcional)" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="fechaNacimiento" label="Fecha de Nacimiento">
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Selecciona la fecha"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="funcion"
                label="Función"
                rules={[
                  {
                    required: true,
                    message: 'Por favor selecciona una función',
                  },
                ]}
              >
                <Select placeholder="Selecciona una función" allowClear>
                  <Option value="">Seleccione una opcion</Option>
                  <Option value="ayudante">Ayudante</Option>
                  <Option value="beneficiario">Beneficiario</Option>
                  <Option value="educador">Educador</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="rama" label="Rama">
                <Select
                  placeholder="Selecciona una rama"
                  loading={loadingRamas}
                  allowClear={!isJefeDeRama}
                  disabled={isJefeDeRama}
                >
                  {ramas
                    .filter((rama) => !isJefeDeRama || rama._id === userRamaId)
                    .map((rama) => (
                      <Option key={rama._id} value={rama._id}>
                        {rama.nombre.charAt(0).toUpperCase() +
                          rama.nombre.slice(1)}
                        ({rama.edadMinima}-{rama.edadMaxima} años)
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Dirección */}
          <Title level={4}>Dirección</Title>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="calle"
                label="Calle"
                rules={[{ required: true, message: 'La calle es requerida' }]}
              >
                <Input placeholder="Ingresa la calle" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="numero"
                label="Número"
                rules={[{ required: true, message: 'El número es requerido' }]}
              >
                <Input placeholder="Número" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ciudad"
                label="Ciudad"
                rules={[{ required: true, message: 'La ciudad es requerida' }]}
              >
                <Input placeholder="Ingresa la ciudad" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="codigoPostal" label="Código Postal">
                <Input placeholder="Código postal (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Botones */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
              >
                {isEditing ? 'Actualizar' : 'Crear'} Socio
              </Button>

              <Button size="large" onClick={handleCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SocioForm
