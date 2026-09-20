# ---- Single Stage: Production ----
FROM node:20-alpine

WORKDIR /app

# Instalar 'serve' globalmente para servir archivos estáticos
RUN npm install -g serve

# Copiar la carpeta compilada que subiste con git
COPY dist ./dist

# Exponer el puerto para el frontend
EXPOSE 3000

# Iniciar 'serve', sirviendo la carpeta dist, usando modo SPA (-s) para que soporte el enrutamiento de React, en el puerto 3000
CMD ["serve", "-s", "dist", "-l", "3000", "-c", "dist/serve.json"]
