# Multi-stage build optimizado para producción
# Etapa 1: Build de React con optimizaciones
FROM node:18-alpine AS builder

# Instalar dumb-init para mejor manejo de procesos
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instalar dependencias incluyendo devDependencies para el build
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Variables de entorno para optimizar el build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_BUILD_PATH=/static/

# Build de producción optimizado
RUN npm run build

# Comprimir archivos estáticos
RUN apk add --no-cache brotli gzip \
    && find /app/build -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) \
       -exec gzip -9 -k {} \; \
    && find /app/build -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) \
       -exec brotli -q 11 -k {} \;

# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nginx-scouts
RUN adduser -S frontend -u 1001 -G nginx-scouts

# Copiar build desde etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Configuración nginx optimizada para React SPA
COPY nginx.conf /etc/nginx/nginx.conf

# Cambiar ownership
RUN chown -R frontend:nginx-scouts /usr/share/nginx/html
RUN chown -R frontend:nginx-scouts /var/cache/nginx
RUN chown -R frontend:nginx-scouts /var/log/nginx
RUN chown -R frontend:nginx-scouts /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R frontend:nginx-scouts /var/run/nginx.pid

# Cambiar a usuario no-root
USER frontend

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]