FROM node:18-alpine3.20

# Definir o timezone como America/Sao_Paulo
ENV TZ=America/Sao_Paulo

# Instalar a timezone (para sistemas baseados em Alpine Linux)
RUN apk add --no-cache tzdata

WORKDIR /usr/src/srv

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3333

# Gere o Prisma Client com base no schema
RUN npx prisma generate

# Comando de inicialização que inclui migrações e a execução da aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]