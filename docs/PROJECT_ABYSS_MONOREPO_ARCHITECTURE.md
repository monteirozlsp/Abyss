# PROJECT ABYSS — MONOREPO & INFRASTRUCTURE ARCHITECTURE (v1.0.0)
**Documento de Especificação de Engenharia de Sistemas, Infraestrutura de Nuvem, CI/CD e Monorepo AAA**  
**Autor:** Principal DevOps Architect & Technical Director  
**Status:** Aprovado para Implementação e Provisionamento de Ambientes (Production Ready)

---

## 1 — ESTRUTURA COMPLETA DO REPOSITÓRIO (MONOREPO DIRECTORY TREE)

O ecossistema do **Project Abyss** adota o padrão **Monorepo** orquestrado via **pnpm Workspaces** e **TurboRepo**, centralizando todas as frentes de engenharia cliente, administrativa, backend, rede e ferramentas em um único repositório otimizado.

```
/
├── .github/
│   └── workflows/
│       └── pipeline.yml         # CI/CD Pipeline principal (Turbo, Lint, Build, Deploy)
├── apps/                        # Aplicações Core do Ecossistema
│   ├── game-client/             # Executável do Jogo Web (React/Vite/WebGPU)
│   ├── admin-panel/             # Painel de Controle de Operações/CMS (Next.js)
│   ├── editor-suite/            # AbyssStudio (Editor de Cenários WebGL2/WebGPU)
│   ├── backend-api/             # API Rest Principal (Node.js/Express/Prisma)
│   │   ├── Dockerfile
│   │   └── src/
│   ├── asset-server/            # CDN / Servidor de Texturas e Modelos (Go/Rust/Node)
│   ├── analytics-service/       # Barramento de Coleta de Telemetria (Fastify/ClickHouse)
│   ├── websocket-server/        # Orquestrador de Redes de Replicação e Voz (WebRTC/Socket.io)
│   ├── launcher/                # Desktop Wrapper nativo (Electron/Tauri)
│   └── modding-sdk/             # Kit de ferramentas de compilação pública para Mods (CLI)
├── packages/                    # Bibliotecas e Configurações Compartilhadas (Internal Packages)
│   ├── tsconfig/                # Configurações TypeScript Base
│   ├── eslint-config/           # Padronizações de Linting Estritas
│   ├── database/                # Prisma Client unificado e migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma    # Modelo de dados PostgreSQL
│   │   └── package.json
│   ├── network-protocol/        # Definições de payloads binários (ProtoBuf/FlatBuffers)
│   └── ui-core/                 # Componentes compartilhados de interface (Tailwind/Radix)
├── docker/                      # Arquivos de Containerização Auxiliares
│   ├── Dockerfile.backend
│   ├── Dockerfile.websocket
│   └── Dockerfile.asset
├── nginx/                       # Configurações do Servidor de Ingress / Proxy Reverso
│   └── nginx.conf
├── .env.example                 # Exemplo de variáveis globais de ambiente
├── docker-compose.yml           # Orquestração local de infraestrutura e simuladores
├── pnpm-workspace.yaml          # Definição do escopo do pnpm monorepo
├── turbo.json                   # Configuração de Cache e Execuções Paralelas do Turborepo
└── package.json                 # Manifesto raiz do Monorepo
```

---

## 2 — CONFIGURAÇÕES RAÍZ DO MONOREPO (CORE WORKSPACE CONFIGS)

### 2.1 `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2.2 Raíz `package.json`
```json
{
  "name": "project-abyss-monorepo",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md,yml}\"",
    "db:migrate": "pnpm --filter @abyss/database db:migrate",
    "db:generate": "pnpm --filter @abyss/database db:generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.4.0",
    "eslint": "^8.56.0"
  },
  "packageManager": "pnpm@9.1.0"
}
```

### 2.3 Raíz `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", ".env.*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "env": [
        "DATABASE_URL",
        "JWT_SECRET",
        "NEXT_PUBLIC_API_URL",
        "VITE_WS_SERVER_URL",
        "NODE_ENV"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### 2.4 TSConfig Base (`packages/tsconfig/base.json`)
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Abyss TSConfig Base",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  },
  "exclude": ["node_modules"]
}
```

### 2.5 ESLint Config (`packages/eslint-config/index.js`)
```javascript
module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  },
  ignorePatterns: ["dist", "node_modules", ".next"]
};
```

---

## 3 — CONECTORES E SCHEMA PRISMA (`packages/database`)

### 3.1 `packages/database/prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  username      String         @unique
  role          UserRole       @default(PLAYER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  saves         SaveGame[]
  matchHistory  MatchPlayer[]
  modifications Modification[]

  @@map("users")
}

enum UserRole {
  PLAYER
  ADMIN
  MODERATOR
  CREATOR
}

model SaveGame {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sectorId   String
  hp         Float
  sanity     Float
  stress     Float
  inventory  Json     // Payload estruturado em grade
  checkpoints Json    // Pontos de salvamento geográficos
  updatedAt  DateTime @updatedAt

  @@map("save_games")
}

model MatchPlayer {
  id         String       @id @default(uuid())
  userId     String
  user       User         @relation(fields: [userId], references: [id])
  matchId    String
  match      MatchSession @relation(fields: [matchId], references: [id], onDelete: Cascade)
  ping       Int
  isEscaped  Boolean      @default(false)
  deathCause String?

  @@map("match_players")
}

model MatchSession {
  id          String        @id @default(uuid())
  serverHost  String
  status      SessionStatus @default(LOBBY)
  mapId       String
  durationSec Int           @default(0)
  players     MatchPlayer[]
  createdAt   DateTime      @default(now())

  @@map("match_sessions")
}

enum SessionStatus {
  LOBBY
  IN_GAME
  COMPLETED
  CRASHED
}

model Modification {
  id          String   @id @default(uuid())
  title       String
  description String
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  downloadUrl String
  fileHash    String   // Segurança MD5/SHA256
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("modifications")
}

model TelemetryLog {
  id          String   @id @default(uuid())
  matchId     String
  entityId    String   // Identificador no ECS
  coordinateX Float
  coordinateY Float
  coordinateZ Float
  eventType   String   // DEATH, BLACKOUT, ENCOUNTER
  timestamp   DateTime @default(now())

  @@map("telemetry_logs")
}
```

---

## 4 — INFRAESTRUTURA LOCAIS E CONTAINERIZAÇÃO (DOCKER & ORCHESTRATION)

### 4.1 `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: abyss_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_database_password_99
      POSTGRES_DB: project_abyss_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - abyss_network

  redis:
    image: redis:7-alpine
    container_name: abyss_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - abyss_network

  nginx:
    image: nginx:1.25-alpine
    container_name: abyss_nginx
    ports:
      - "3000:3000"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend-api
      - game-client
    networks:
      - abyss_network

  backend-api:
    build:
      context: .
      dockerfile: ./docker/Dockerfile.backend
    container_name: abyss_backend
    environment:
      DATABASE_URL: postgresql://postgres:secure_database_password_99@postgres:5432/project_abyss_db?schema=public
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dynamic_ultra_secure_jwt_token_abyss
      NODE_ENV: development
    depends_on:
      - postgres
      - redis
    networks:
      - abyss_network

  game-client:
    image: node:20-alpine
    container_name: abyss_client
    working_dir: /app
    volumes:
      - .:/app
    command: pnpm --filter game-client dev
    networks:
      - abyss_network

volumes:
  postgres_data:
  redis_data:

networks:
  abyss_network:
    driver: bridge
```

### 4.2 `docker/Dockerfile.backend`
```dockerfile
# Stage 1: Build Workspace
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/backend-api ./apps/backend-api

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=backend-api

# Stage 2: Production Execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/apps/backend-api/package.json ./apps/backend-api/package.json
COPY --from=builder /app/apps/backend-api/dist ./apps/backend-api/dist
COPY --from=builder /app/packages/database ./packages/database

RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3001
CMD ["node", "apps/backend-api/dist/server.js"]
```

### 4.3 `nginx/nginx.conf`
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    upstream client_stream {
        server game-client:3000;
    }

    upstream api_stream {
        server backend-api:3001;
    }

    server {
        listen 3000;
        server_name localhost;

        # WebSockets Ingress (HMR and Game Sync)
        location /socket.io/ {
            proxy_pass http://api_stream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # API Gateway Route
        location /api/ {
            proxy_pass http://api_stream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Static Assets and Client Application
        location / {
            proxy_pass http://client_stream;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## 5 — ESTREIRA DE DEPLOY E VALIDAÇÃO (CI/CD INTEGRATION)

### 5.1 GitHub Actions Workflow (`.github/workflows/pipeline.yml`)
```yaml
name: Project Abyss Core CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  validate-and-build:
    name: Lint, Test & Compiler Compile
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm Package Manager
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup TurboRepo Cache
        uses: dtinth/setup-github-actions-caching-for-turbo@v1

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Database Schemas (Prisma)
        run: pnpm db:generate

      - name: Lint Validation Checks
        run: pnpm lint

      - name: Execute Workspace Unit Tests
        run: pnpm test

      - name: Compile and Build All Packages and Apps
        run: pnpm build

  deploy-production:
    name: Container Registry & Deploy (Production)
    needs: validate-and-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Configure AWS/GCP/Cloud Credentials
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Docker Ingress & Build Image
        run: |
          gcloud auth configure-docker us-east1-docker.pkg.dev
          docker build -t us-east1-docker.pkg.dev/project-abyss/production/backend-api:latest -f docker/Dockerfile.backend .
          docker push us-east1-docker.pkg.dev/project-abyss/production/backend-api:latest

      - name: Cloud Run Ingress Deployment Trigger
        run: |
          gcloud run deploy abyss-backend-api \
            --image us-east1-docker.pkg.dev/project-abyss/production/backend-api:latest \
            --region us-east1 \
            --platform managed \
            --port 3001 \
            --allow-unauthenticated
```

---

## 6 — CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE (`.env.example`)

O arquivo `.env.example` documenta de forma estrita todas as dependências funcionais exigidas pelas frentes de desenvolvimento e nuvem:

```env
# ==============================================================================
# PROJECT ABYSS — ENVIRONMENT VARIABLES REGISTRY (EXAMPLE)
# ==============================================================================

# Node Runtime Configuration
NODE_ENV=development
PORT=3000

# Database Persistence (PostgreSQL)
# Prisma-compliant relational connections string
DATABASE_URL=postgresql://postgres:secure_database_password_99@localhost:5432/project_abyss_db?schema=public

# In-Memory Cache and Pub/Sub (Redis)
REDIS_URL=redis://localhost:6379

# Cryptography and Tokenization
JWT_SECRET=dynamic_ultra_secure_jwt_token_abyss_signing_key_99
SESSION_EXPIRATION_LIMIT=86400

# AWS S3 / Cloudflare R2 / Object Storage
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=project-abyss-assets-production
S3_ENDPOINT=https://cloudflare-r2-endpoint-abyss.com

# Analytics ClickHouse Node (High Intensity Telemetry)
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=

# Client Public Facing Environment Variables (Prefix VITE_ & NEXT_PUBLIC_)
VITE_WS_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 7 — CONVENÇÕES DE CONTROLE DE VERSÃO E COMMITS (POLICIES)

Para assegurar que o histórico de modificações do monrepo permaneça limpo, rastreável e auditável sob as premissas de uma produção AAA, foram definidas as seguintes políticas estritas:

### 7.1 Padrão de Commits (Conventional Commits)
Todas as mensagens de commits enviadas ao repositório devem seguir rigorosamente a sintaxe:
`<tipo>(<escopo>): <descrição curta e objetiva em minúsculas>`

* **Tipos Permitidos**:
  * `feat`: Implementação de nova funcionalidade (Ex: `feat(client): add dynamic lens grain shader`).
  * `fix`: Correção de falhas e bugs lógicos (Ex: `fix(engine): resolve infinite loop in GOAP planner`).
  * `docs`: Modificações estritamente em arquivos de documentação (Ex: `docs(monorepo): document build steps`).
  * `refactor`: Alteração de código que não altera comportamento final ou conserta falhas.
  * `ci`: Modificações em scripts e configurações de CI/CD pipelines.

### 7.2 Estratégia de Branching (Trunk-Based Development)
O desenvolvimento colaborativo adota a filosofia de **Trunk-Based Development** para mitigar conflitos de mesclagem complexos de fim de ciclo:
* **Trunk (Branch principal: `main`)**: Representa a linha estável de produção. Todo push para a `main` dispara pipelines de validação completa e deploys automatizados em ambientes estáveis de staging/produção.
* **Branches Efêmeras de Funcionalidade (`feature/*`, `bugfix/*`)**: Ramificações de curtíssima duração criadas para resolver tarefas isoladas. Devem ser reintegradas à branch principal em menos de 48 horas mediante validação de pull requests por revisores.

---
*Fim da Especificação Técnica do Monorepo e Infraestrutura. Toda a arquitetura de pacotes e aplicações orquestradas por Turborepo, conexões de banco de dados Prisma, ambientes conteinerizados por Docker-Compose, pipelines do Github Actions e convenções de commit estão consolidadas e aprovadas para provisão ativa.*
Encoding: UTF-8. All operations completed successfully.
Files in monorepo, dependencies, databases, environments, dockerization, and pipelines have been created and consolidated.
