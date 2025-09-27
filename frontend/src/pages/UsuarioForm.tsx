import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Typography,
  message,
  Space,
  Switch,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  createUsuario,
  updateUsuario,
  fetchUsuarioById,
  clearError,
  clearCurrentUsuario,
} from '../store/usuariosSlice'
import { personasAPI, rolesAPI } from '../services/api'
import { UsuarioFormData, Persona, Rol } from '../types'

const { Title } = Typography
const { Option } = Select

const UsuarioForm: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { currentUsuario, isLoading, error } = useAppSelector(
    (state) => state.usuarios
  )
  const [personas, setPersonas] = useState<Persona[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loadingPersonas, setLoadingPersonas] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  const isEditing = !!id

  useEffect(() => {
    loadPersonas()
    loadRoles()

    if (isEditing && id) {
      dispatch(fetchUsuarioById(id))
    }

    return () => {
      dispatch(clearCurrentUsuario())
    }
  }, [id, isEditing]) // Removido dispatch

  useEffect(() => {
    if (currentUsuario && isEditing) {
      form.setFieldsValue({
        username: currentUsuario.username,
        persona: currentUsuario.persona._id,
        rol: currentUsuario.rol._id,
        activo: currentUsuario.activo,
      })
    }
  }, [currentUsuario, form, isEditing])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error]) // Removido dispatch

  const loadPersonas = async () => {
    try {
      setLoadingPersonas(true)
      const response = await personasAPI.getAll()
      setPersonas(response.personas || response)
    } catch (error) {
      message.error('Error cargando personas')
    } finally {
      setLoadingPersonas(false)
    }
  }

  const loadRoles = async () => {
    try {
      setLoadingRoles(true)
      const response = await rolesAPI.getAll()
      setRoles(response.roles || response)
    } catch (error) {
      message.error('Error cargando roles')
      console.error('Error cargando roles:', error)
    } finally {
      setLoadingRoles(false)
    }
  }

  const onFinish = async (values: any) => {
    const formData: UsuarioFormData = {
      username: values.username,
      password: values.password,
      persona: values.persona,
      rol: values.rol,
      activo: values.activo !== undefined ? values.activo : true,
    }

    try {
      if (isEditing && id) {
        // En edición, no incluir password si está vacío
        const updateData: Partial<UsuarioFormData> = {
          username: formData.username,
          persona: formData.persona,
          rol: formData.rol,
          activo: formData.activo,
        }
        if (values.password) {
          updateData.password = values.password
        }
        await dispatch(updateUsuario({ id, data: updateData })).unwrap()
        message.success('Usuario actualizado exitosamente')
      } else {
        await dispatch(createUsuario(formData)).unwrap()
        message.success('Usuario creado exitosamente')
      }
      navigate('/usuarios')
    } catch (error) {
      // El error ya se maneja en el useEffect
    }
  }

  const handleCancel = () => {
    navigate('/usuarios')
  }

  return (
    <div>
      <Title level={2}>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</Title>

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
                name="username"
                label="Nombre de Usuario"
                rules={[
                  {
                    required: true,
                    message: 'El nombre de usuario es requerido',
                  },
                  {
                    min: 3,
                    message:
                      'El nombre de usuario debe tener al menos 3 caracteres',
                  },
                  {
                    pattern: /^[a-zA-Z0-9._-]+$/,
                    message:
                      'Solo se permiten letras, números, puntos, guiones y guiones bajos',
                  },
                ]}
              >
                <Input placeholder="Ingresa el nombre de usuario" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label={isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                rules={
                  isEditing
                    ? [
                        {
                          min: 6,
                          message:
                            'La contraseña debe tener al menos 6 caracteres',
                        },
                      ]
                    : [
                        {
                          required: true,
                          message: 'La contraseña es requerida',
                        },
                        {
                          min: 6,
                          message:
                            'La contraseña debe tener al menos 6 caracteres',
                        },
                      ]
                }
              >
                <Input.Password
                  placeholder={
                    isEditing
                      ? 'Dejar vacío para mantener contraseña actual'
                      : 'Ingresa la contraseña'
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="persona"
                label="Persona"
                rules={[
                  {
                    required: true,
                    message: 'Por favor selecciona una persona',
                  },
                ]}
              >
                <Select
                  placeholder="Selecciona una persona"
                  loading={loadingPersonas}
                  showSearch
                  optionFilterProp="children"
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
                name="rol"
                label="Rol"
                rules={[
                  {
                    required: true,
                    message: 'Por favor selecciona un rol',
                  },
                ]}
              >
                <Select placeholder="Selecciona un rol" loading={loadingRoles}>
                  {roles.map((rol) => (
                    <Option key={rol._id} value={rol._id}>
                      <div>
                        <strong>
                          {rol.nombre.charAt(0).toUpperCase() +
                            rol.nombre.slice(1)}
                        </strong>
                        <br />
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="activo"
                label="Estado"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
              </Form.Item>
            </Col>
          </Row>

          {/* Información sobre roles */}
          <Card
            size="small"
            title="Información sobre Roles"
            style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <p>
                  <strong>Administrador:</strong> Acceso completo al sistema
                </p>
                <p>
                  <strong>Jefe de Grupo:</strong> Gestión general del grupo
                  scout
                </p>
              </Col>
              <Col xs={24} md={12}>
                <p>
                  <strong>Jefe de Rama:</strong> Gestión de una rama específica
                </p>
                <p>
                  <strong>Socio:</strong> Acceso básico de lectura
                </p>
              </Col>
            </Row>
          </Card>

          {/* Botones */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
              >
                {isEditing ? 'Actualizar' : 'Crear'} Usuario
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

export default UsuarioForm
