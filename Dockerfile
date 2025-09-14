# Dockerfile (BackEnd)
FROM node:20-alpine

# utilidades mínimas (opcional)
RUN apk add --no-cache bash

WORKDIR /app

# Instalar solo con package.json (sin lockfile)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

ENV NODE_ENV=production
# Fly enruta a PORT; tu server debe leer process.env.PORT
ENV PORT=8080
EXPOSE 8080

# Ajusta si tu entrypoint es otro archivo
CMD ["node", "index.js"]