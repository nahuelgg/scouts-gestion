// Importaciones optimizadas de Ant Design
// Solo importa los componentes que realmente usamos

// Componentes de layout - importación correcta
import { Layout } from 'antd'
const { Sider, Header, Content, Footer } = Layout

export { Layout, Sider, Header, Content, Footer }

// Componentes de navegación
export { Menu, Breadcrumb, Pagination, Steps } from 'antd'

// Componentes de entrada de datos
export {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Upload,
  Switch,
  Radio,
  Checkbox,
} from 'antd'

// Componentes de visualización de datos
export {
  Table,
  List,
  Card,
  Descriptions,
  Empty,
  Statistic,
  Tag,
  Badge,
  Avatar,
  Tooltip,
} from 'antd'

// Componentes de feedback
export {
  Alert,
  message,
  notification,
  Spin,
  Progress,
  Result,
  Skeleton,
} from 'antd'

// Componentes de navegación
export { Drawer, Modal, Popover, Dropdown } from 'antd'

// Utilidades
export { ConfigProvider, Space, Divider, Typography, Row, Col } from 'antd'

// Iconos más usados - importación optimizada
export {
  UserOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
  HomeOutlined,
  FileOutlined,
  BellOutlined,
} from '@ant-design/icons'
