FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

# Instalar deps con cache
COPY package*.json ./
RUN npm install --omit=dev

# Copiar TODO el código
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Arranca tu servidor
CMD ["node", "server/index.js"]