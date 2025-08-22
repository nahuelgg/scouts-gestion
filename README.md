# Sistema de Gestión Scout

Sistema web para la gestión de seccionales scout, desarrollado con tecnologías modernas para facilitar la administración de socios, pagos y actividades.

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**
- **MongoDB** con **Mongoose**
- **JWT** para autenticación
- **Multer** para subida de archivos
- **bcryptjs** para hash de contraseñas

### Frontend
- **React** con **TypeScript**
- **Ant Design** para UI/UX
- **Redux Toolkit** para gestión de estado
- **React Router** para navegación
- **Axios** para peticiones HTTP

## 📋 Funcionalidades

### Autenticación y Autorización
- Sistema de login seguro
- Roles de usuario (Administrador, Jefe de Rama, Jefe de Grupo, Socio)
- Protección de rutas según permisos

### Gestión de Socios
- ✅ Crear, editar, visualizar y eliminar socios
- ✅ Filtros por rama y búsqueda
- ✅ Gestión de datos personales y contacto
- ✅ Asignación a ramas (Manada, Unidad, Caminantes, Rovers)

### Gestión de Pagos
- 🚧 Registro de pagos mensuales
- 🚧 Subida de comprobantes
- 🚧 Seguimiento por socio y período
- 🚧 Diferentes métodos de pago

### Panel de Administración
- ✅ Dashboard con estadísticas
- 🚧 Gestión de usuarios del sistema
- 🚧 Configuración de ramas

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Node.js** (v16 o superior)
- **MongoDB** (local o remoto)
- **npm** o **yarn**

### Paso 1: Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd scouts-gestion
```

### Paso 2: Instalar dependencias
```bash
# Instalar dependencias del proyecto principal y subdirectorios
npm run install-all
```

### Paso 3: Configurar variables de entorno

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scouts_gestion
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
NODE_ENV=development
UPLOAD_PATH=./uploads
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Paso 4: Configurar MongoDB
1. Instalar y ejecutar MongoDB localmente, o usar MongoDB Atlas
2. La base de datos se creará automáticamente al ejecutar el script de inicialización

### Paso 5: Inicializar la base de datos
```bash
cd backend
npm run init-db
```

Este comando creará:
- 4 roles predefinidos
- 4 ramas (Manada, Unidad, Caminantes, Rovers)
- Usuario administrador por defecto:
  - **Usuario**: `admin`
  - **Contraseña**: `admin123`

### Paso 6: Ejecutar la aplicación

#### Desarrollo (ambos servidores en paralelo)
```bash
npm run dev
```

#### O ejecutar por separado:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📱 Uso del Sistema

### Login Inicial
1. Accede a http://localhost:3000
2. Usa las credenciales del administrador:
   - Usuario: `admin`
   - Contraseña: `admin123`

### Gestión de Socios
1. Ve a la sección "Socios"
2. Haz clic en "Nuevo Socio" para agregar un socio
3. Completa el formulario con los datos requeridos
4. Asigna una rama si corresponde

### Estructura de Roles

#### Administrador
- Acceso completo al sistema
- Gestión de usuarios y configuración
- Todas las funciones de jefe de rama

#### Jefe de Rama
- Gestión de socios
- Registro y gestión de pagos
- Visualización de reportes

#### Jefe de Grupo
- Visualización de reportes
- Acceso de solo lectura

#### Socio
- Acceso limitado (funcionalidad futura)

## 📂 Estructura del Proyecto

```
scouts-gestion/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores de la API
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── config/          # Configuración de DB
│   │   └── server.js        # Servidor principal
│   ├── uploads/             # Archivos subidos
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── store/          # Redux store y slices
│   │   ├── services/       # Servicios API
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── package.json
└── package.json            # Scripts principales
```

## 🔧 Scripts Disponibles

```bash
# Instalar todas las dependencias
npm run install-all

# Desarrollo (backend + frontend)
npm run dev

# Solo backend
npm run server

# Solo frontend
npm run client

# Build para producción
npm run build

# Inicializar base de datos
cd backend && npm run init-db
```

## 📈 Próximas Funcionalidades

- [ ] **Gestión completa de pagos**
  - [ ] Formulario de registro de pagos
  - [ ] Visualización de comprobantes
  - [ ] Reportes de pagos por período
  
- [ ] **Dashboard avanzado**
  - [ ] Gráficos de estadísticas
  - [ ] Alertas de pagos pendientes
  - [ ] Resumen por ramas

- [ ] **Gestión de actividades**
  - [ ] Registro de actividades y eventos
  - [ ] Control de asistencia
  - [ ] Planificación de actividades

- [ ] **Comunicación**
  - [ ] Sistema de mensajería
  - [ ] Notificaciones
  - [ ] Envío de recordatorios

- [ ] **Reportes y análisis**
  - [ ] Exportación de datos
  - [ ] Reportes personalizados
  - [ ] Análisis de tendencias

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

## ✍️ Contacto

Para dudas o sugerencias, puedes contactar al equipo de desarrollo.

---

**¡Siempre listos! 🏕️**
