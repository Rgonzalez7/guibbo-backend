# Dockerfile (BackEnd, package.json dentro de /server)
FROM node:20-alpine

RUN apk add --no-cache bash

# Crea estructura
WORKDIR /app

# Copia solo los manifests primero (desde /server)
COPY server/package*.json /app/server/

# Instala deps dentro de /app/server (sin dev)
WORKDIR /app/server
RUN npm install --omit=dev

# Copia el resto del código de /server
COPY server/ /app/server/

# Variables de entorno y puerto
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Arranque (ajusta el entrypoint si es distinto)
# Asegúrate que tu server escuche process.env.PORT
CMD ["node", "index.js"]