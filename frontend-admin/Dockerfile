# Etapa 1: Construcción de la aplicación
FROM node:18-alpine AS build
WORKDIR /app

# Copiamos los archivos de configuración e instalamos las dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y generamos el build de producción
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine
# Copiamos el build generado en la etapa anterior al directorio que usa Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos nuestro archivo de configuración personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el puerto por defecto de Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
