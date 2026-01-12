import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Alert,
  List,
  Row,
  Col,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { changePassword, clearError } from '../store/authSlice'
import type { ChangePasswordData } from '../types'

const { Title, Text } = Typography

const ChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [form] = Form.useForm()
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  // Validaciones para mostrar los requisitos
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
    {
      text: 'Diferente a la contraseña actual',
      valid: newPassword !== currentPassword && newPassword.length > 0,
    },
  ]

  const isValidPassword = passwordRequirements.every((req) => req.valid)

  const handleSubmit = async (values: ChangePasswordData) => {
    try {
      dispatch(clearError())
      if (values.newPassword !== values.confirmPassword) {
        message.error('Las contraseñas no coinciden')
        return
      }

      // Enviar solicitud de cambio
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap()

      message.success('Contraseña cambiada exitosamente')
      form.resetFields()
      setNewPassword('')
      setCurrentPassword('')

      // Opcional: redirigir al dashboard después de unos segundos
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      message.error(error as string)
    }
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
  }

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPassword(e.target.value)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            type="text"
          >
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Cambiar Contraseña
          </Title>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Formulario */}
        <Col xs={24} lg={12}>
          <Card title="Nueva Contraseña" style={{ height: '100%' }}>
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                closable
                style={{ marginBottom: 16 }}
                onClose={() => dispatch(clearError())}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Contraseña Actual"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu contraseña actual',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Ingresa tu contraseña actual"
                  onChange={handleCurrentPasswordChange}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Nueva Contraseña"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu nueva contraseña',
                  },
                  {
                    min: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value === currentPassword) {
                        return Promise.reject(
                          'La nueva contraseña debe ser diferente a la actual'
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Ingresa tu nueva contraseña"
                  onChange={handleNewPasswordChange}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: 'Por favor confirma tu nueva contraseña',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject('Las contraseñas no coinciden')
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirma tu nueva contraseña"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={!isValidPassword}
                  block
                  size="large"
                >
                  Cambiar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Requisitos de la contraseña */}
        <Col xs={24} lg={12}>
          <Card title="Requisitos de la Contraseña" style={{ height: '100%' }}>
            <Text
              type="secondary"
              style={{ marginBottom: 16, display: 'block' }}
            >
              Tu nueva contraseña debe cumplir con todos los siguientes
              requisitos:
            </Text>

            <List
              dataSource={passwordRequirements}
              renderItem={(requirement) => (
                <List.Item>
                  <Space>
                    {requirement.valid ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <Text
                      style={{
                        color: requirement.valid ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {requirement.text}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />

            <Divider />

            <Alert
              message="Consejos de Seguridad"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>
                    Usa una contraseña única que no utilices en otros sitios
                  </li>
                  <li>Evita información personal como nombres o fechas</li>
                  <li>
                    Considera usar una frase fácil de recordar pero difícil de
                    adivinar
                  </li>
                  <li>Cambia tu contraseña regularmente</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ChangePassword
