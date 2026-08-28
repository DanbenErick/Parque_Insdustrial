# ---- Stage 1: Build ----
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar el frontend (React/Vite) para producción
# Para Vite el resultado suele ir a la carpeta /dist
RUN npm run build

# ---- Stage 2: Serve ----
FROM node:20-alpine AS production

WORKDIR /app

# Instalar 'serve' globalmente para servir archivos estáticos
RUN npm install -g serve

# Copiar la carpeta compilada desde la etapa anterior
COPY --from=build /app/dist ./dist

# Exponer el puerto para el frontend
EXPOSE 3000

# Iniciar 'serve', sirviendo la carpeta dist, usando modo SPA (-s) para que soporte el enrutamiento de React, en el puerto 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
