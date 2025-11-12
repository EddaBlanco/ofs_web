FROM node:22-alpine as build-stage

WORKDIR /src

# Copiar package files primero
COPY package*.json ./

# Instalar Angular CLI globalmente y dependencias
RUN npm install -g @angular/cli@latest
RUN npm ci

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npx ng build --configuration=production

# Etapa de producción
FROM nginx:alpine
COPY --from=build-stage /src/dist/ofs_web/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
