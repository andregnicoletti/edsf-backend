
# EDUCATION DATA SCIENCE ON THE FARM (EDSF)

## Pré-requisitos

Certifique-se de que você tem o seguinte instalado em sua máquina:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração

### 1. Clonar o repositório

Primeiro, clone o repositório do projeto:

```bash
git clone ssh://git@bitbucket.cpqd.com.br:7999/edsf/jaentendi-edsf-backend.git

cd jaentendi-edsf-backend
```

### 2. Criar um arquivo .env
Criar arquivo `.env` a partir do arquivo `.env.example`
```bash
cp .env.example .env
```

### 3. Construir e rodar o projeto
```bash
docker compose up -d
```

### 4. Parar e remover containers
```bash
docker compose down
```

## Comandos úteis
 - Ver logs: `docker compose logs`
 - Ver containers: `docker compose ps`
 - Rebuild: `docker compose up --build`