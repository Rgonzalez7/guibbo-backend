# Dockerfile (BackEnd/Dockerfile)
FROM node:20-alpine

RUN apk add --no-cache bash

# Trabajamos dentro de /app/server
WORKDIR /app/server

# 1) Copiamos SOLO los package*.json desde server/ para aprovechar caché
COPY server/package*.json ./

# 2) Instalamos dependencias de prod
RUN npm install --omit=dev

# 3) Copiamos el resto del código del servidor
#    (ajusta si tienes más carpetas necesarias)
COPY server/. .


#4) ffmpeg para transcripcion de sesion
RUN apt-get update && apt-get install -y ffmpeg

# Variables y puerto
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Arranque
CMD ["node", "index.js"]