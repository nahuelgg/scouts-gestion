import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Table,
  Tag,
} from 'antd';
import {
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import { personasAPI, pagosAPI } from '../services/api';

const { Title } = Typography;

interface DashboardStats {
  totalSocios: number;
  sociosActivos: number;
  pagosEsteMes: number;
  totalRecaudado: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalSocios: 0,
    sociosActivos: 0,
    pagosEsteMes: 0,
    totalRecaudado: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas de socios
      const personasResponse = await personasAPI.getAll({ limit: 1000 });
      const socios = personasResponse.personas || [];
      
      // Cargar pagos recientes
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const pagosResponse = await pagosAPI.getAll({ 
        limit: 5,
        mes: currentMonth 
      });
      
      setStats({
        totalSocios: socios.length,
        sociosActivos: socios.filter((s: any) => s.activo).length,
        pagosEsteMes: pagosResponse.total || 0,
        totalRecaudado: pagosResponse.pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0,
      });
      
      setRecentPayments(pagosResponse.pagos || []);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentColumns = [
    {
      title: 'Socio',
      dataIndex: ['socio'],
      key: 'socio',
      render: (socio: any) => `${socio?.nombre} ${socio?.apellido}`,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => `$${monto.toLocaleString()}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPago',
      key: 'fechaPago',
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Método',
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      render: (metodo: string) => (
        <Tag color="blue">
          {metodo.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
  ];

  const canManageSocios = ['administrador', 'jefe_de_rama'].includes(user?.rol?.nombre || '');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Typography.Text type="secondary">
          Bienvenido, {user?.persona?.nombre}
        </Typography.Text>
      </div>

      {/* Estadísticas principales */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Socios"
              value={stats.totalSocios}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Socios Activos"
              value={stats.sociosActivos}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pagos Este Mes"
              value={stats.pagosEsteMes}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Recaudado"
              value={stats.totalRecaudado}
              prefix="$"
              precision={0}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas */}
      {canManageSocios && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Acciones Rápidas">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/socios/nuevo')}
                >
                  Nuevo Socio
                </Button>
                <Button
                  icon={<DollarOutlined />}
                  onClick={() => navigate('/pagos/nuevo')}
                >
                  Registrar Pago
                </Button>
                <Button
                  onClick={() => navigate('/socios')}
                >
                  Ver Todos los Socios
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Pagos recientes */}
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="Pagos Recientes"
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/pagos')}
              >
                Ver todos
              </Button>
            }
          >
            <Table
              columns={paymentColumns}
              dataSource={recentPayments}
              rowKey="_id"
              pagination={false}
              loading={loading}
              locale={{
                emptyText: 'No hay pagos registrados este mes'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
