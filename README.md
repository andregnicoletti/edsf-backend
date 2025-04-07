
# EDSF

## Pré-requisitos

Certifique-se de que você tem o seguinte instalado em sua máquina:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração

### 1. Criar um arquivo .env
Criar arquivo `.env` a partir do arquivo `.env.example`
```bash
cp .env.example .env
```

### 2. Construir e rodar o projeto
```bash
docker compose up -d
```

### 3. Parar e remover containers
```bash
docker compose down
```

## Comandos úteis
 - Ver logs: `docker compose logs`
 - Ver containers: `docker compose ps`
 - Rebuild: `docker compose up --build`
