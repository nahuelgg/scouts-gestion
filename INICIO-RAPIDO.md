# 🏕️ Sistema de Gestión Scout - Guía de Inicio Rápido

## ✅ Sistema Configurado y Funcionando

¡Felicidades! Tu sistema de gestión para scouts ya está funcionando correctamente.

### 🌐 URLs de Acceso
- **Frontend (App Web)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 🔐 Credenciales de Acceso

#### Usuario Administrador (Creado automáticamente)
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### 📋 Primeros Pasos

1. **Accede al sistema**: Ve a http://localhost:3000
2. **Inicia sesión** con las credenciales del administrador
3. **Explora el dashboard** para ver las estadísticas
4. **Crea tu primer socio**: Ve a "Socios" → "Nuevo Socio"

### 🏗️ Funcionalidades Implementadas

#### ✅ Autenticación
- Login seguro con JWT
- Protección de rutas
- Roles y permisos

#### ✅ Gestión de Socios
- Crear, editar, ver y eliminar socios
- Búsqueda y filtros
- Asignación a ramas
- Datos personales completos

#### ✅ Dashboard
- Estadísticas en tiempo real
- Acciones rápidas
- Vista general del sistema

#### ✅ Sistema de Ramas
- 4 ramas predefinidas:
  - **Manada** (6-8 años)
  - **Unidad** (9-14 años) 
  - **Caminantes** (15-17 años)
  - **Rovers** (18-21 años)

### 🚧 Funcionalidades Pendientes (Próximas implementaciones)

- **Gestión de Pagos**: Registro de cuotas con comprobantes
- **Reportes Avanzados**: Estadísticas detalladas
- **Gestión de Usuarios**: Crear usuarios del sistema
- **Configuración Avanzada**: Personalizar el sistema

### 👥 Roles del Sistema

#### 🔑 Administrador
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del sistema
- Todas las funciones

#### 👨‍🏫 Jefe de Rama
- Gestión de socios de su rama
- Registro de pagos
- Visualización de reportes

#### 👥 Jefe de Grupo
- Visualización de reportes
- Acceso de solo lectura

#### 👤 Socio
- Acceso limitado (funcionalidad futura)

### 🛠️ Comandos Útiles

```bash
# Parar los servidores: Ctrl+C en la terminal

# Reiniciar la base de datos (¡CUIDADO: Borra todos los datos!)
cd backend
npm run init-db

# Solo backend
cd backend
npm run dev

# Solo frontend  
cd frontend
npm start

# Ambos servidores (desde la raíz)
npm run dev
```

### 📊 Probando el Sistema

#### Crear Socios de Ejemplo
Te recomiendo crear algunos socios de prueba:

1. **Juan Pérez** (Manada)
   - DNI: 12345678
   - Teléfono: +54 9 11 1234-5678
   - Dirección: Av. Libertador 1234, Buenos Aires

2. **María González** (Unidad)
   - DNI: 87654321  
   - Teléfono: +54 9 11 8765-4321
   - Dirección: Belgrano 567, Buenos Aires

3. **Carlos López** (Caminantes)
   - DNI: 11223344
   - Teléfono: +54 9 11 1122-3344
   - Dirección: San Martín 890, Buenos Aires

### 🔧 Solución de Problemas

#### Frontend no carga
- Verifica que el puerto 3000 esté libre
- Revisa la consola del navegador

#### Backend no conecta
- Verifica que MongoDB esté ejecutándose
- Revisa el archivo `.env` del backend

#### Base de datos vacía
- Ejecuta `npm run init-db` desde el directorio backend

### 📞 Próximos Pasos

1. **Familiarízate** con la gestión de socios
2. **Crea algunos socios** de prueba
3. **Explora** las diferentes secciones
4. **¡Espera las próximas actualizaciones!** 🚀

---

**¡El sistema está listo para usar! 🏕️**

Cualquier duda o problema, revisa el README.md principal o contacta al equipo de desarrollo.
