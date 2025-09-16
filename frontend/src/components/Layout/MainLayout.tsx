import React, { useState } from 'react'
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Typography,
  MenuProps,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../utils/hooks'
import { logout } from '../../store/authSlice'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/configuracion'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ]

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/socios',
      icon: <TeamOutlined />,
      label: 'Socios',
      onClick: () => navigate('/socios'),
    },
    {
      key: '/pagos',
      icon: <DollarOutlined />,
      label: 'Pagos',
      onClick: () => navigate('/pagos'),
    },
  ]

  // Agregar elementos del menú según el rol
  if (user?.rol?.nombre === 'administrador') {
    menuItems.push({
      key: '/usuarios',
      icon: <SettingOutlined />,
      label: 'Usuarios',
      onClick: () => navigate('/usuarios'),
    })
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/socios')) return '/socios'
    if (path.startsWith('/pagos')) return '/pagos'
    if (path.startsWith('/usuarios')) return '/usuarios'
    return path
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: 16,
          }}
        >
          <Typography.Title
            level={4}
            style={{
              margin: 0,
              color: '#1890ff',
              fontSize: collapsed ? '16px' : '18px',
            }}
          >
            {collapsed ? 'S' : 'Scouts'}
          </Typography.Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space>
            <Text strong>
              {user?.persona?.nombre} {user?.persona?.apellido}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({user?.rol?.nombre?.replace('_', ' ')})
            </Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
