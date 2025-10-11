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
  List,
  Alert,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
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
  const [newPassword, setNewPassword] = useState('')

  const isEditing = !!id

  // Validaciones para mostrar los requisitos de la contraseña
  const passwordRequirements = [
    {
      text: 'Al menos 6 caracteres',
      valid: newPassword.length >= 6,
    },
    {
      text: 'Al menos una letra minúscula',
      valid: /[a-z]/.test(newPassword),
    },
    {
      text: 'Al menos una letra mayúscula',
      valid: /[A-Z]/.test(newPassword),
    },
    {
      text: 'Al menos un número',
      valid: /\d/.test(newPassword),
    },
  ]

  const isValidPassword = passwordRequirements.every((req) => req.valid)

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

      // Si estamos creando un nuevo usuario, filtrar personas que ya tienen usuario
      // Si estamos editando, mostrar todas las personas
      const params = !isEditing ? { withoutUser: true } : {}

      const response = await personasAPI.getAll(params)
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/usuarios')}
            type="text"
          >
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Title>
        </Space>
      </div>

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
                        {
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
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
                        {
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
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
                  onChange={handlePasswordChange}
                />
              </Form.Item>

              {/* Mostrar requisitos de contraseña cuando el usuario esté escribiendo */}
              {newPassword && (newPassword.length > 0 || !isEditing) && (
                <Card size="small" style={{ marginTop: 8 }}>
                  <Typography.Text
                    strong
                    style={{ marginBottom: 8, display: 'block' }}
                  >
                    Requisitos de la contraseña:
                  </Typography.Text>
                  <List
                    size="small"
                    dataSource={passwordRequirements}
                    renderItem={(requirement) => (
                      <List.Item style={{ padding: '4px 0' }}>
                        <Space>
                          {requirement.valid ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          )}
                          <Typography.Text
                            style={{
                              color: requirement.valid ? '#52c41a' : '#ff4d4f',
                              fontSize: '12px',
                            }}
                          >
                            {requirement.text}
                          </Typography.Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                  {!isValidPassword && newPassword.length > 0 && (
                    <Alert
                      message="La contraseña no cumple con todos los requisitos"
                      type="warning"
                      style={{ marginTop: 8 }}
                    />
                  )}
                  {isValidPassword && newPassword.length > 0 && (
                    <Alert
                      message="¡Contraseña válida!"
                      type="success"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Card>
              )}

              {/* Información adicional para modo edición */}
              {/* {isEditing && !newPassword && (
                <Alert
                  message="Información"
                  description="Deja este campo vacío si no deseas cambiar la contraseña actual del usuario."
                  type="info"
                  style={{ marginTop: 8 }}
                />
              )} */}
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
