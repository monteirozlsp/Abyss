# PROJECT ABYSS — DESIGN DE BANCO DE DADOS (ETAPA 3)

Este documento estabelece as especificações completas de engenharia de banco de dados para o **PROJECT ABYSS**, um ecossistema de jogo WebGL de grande escala com suporte a milhões de registros, multiplayer futuro, versionamento de ativos, CMS interno, editor de níveis e ecossistema de mods.

O motor de banco de dados escolhido é o **PostgreSQL**, modelado através do ORM **Prisma**, com caching de baixa latência via **Redis** e estratégias de particionamento e indexação avançadas para lidar com alta taxa de gravação e consulta.

---

## 1. ENTITY-RELATIONSHIP DIAGRAM (ERD)

Abaixo está o diagrama lógico do banco de dados (gerado em formato Mermaid), dividido por domínios funcionais para garantir modularização e legibilidade.

### 1.1 Domínio 1: Autenticação, Controle de Acesso e Perfis
```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string passwordHash
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    Profile {
        uuid id PK
        uuid userId FK
        string username UK
        string avatarUrl
        int level
        int xp
        datetime createdAt
        datetime updatedAt
    }
    Role {
        uuid id PK
        string name UK
        string description
    }
    Permission {
        uuid id PK
        string name UK
        string description
    }
    Session {
        uuid id PK
        uuid userId FK
        string token UK
        string ipAddress
        string userAgent
        datetime expiresAt
        datetime createdAt
    }
    Ban {
        uuid id PK
        uuid userId FK
        string reason
        datetime expiresAt
        uuid createdById FK
        datetime createdAt
    }

    User ||--|| Profile : "possui"
    User ||--oY Session : "inicia"
    User ||--oY Ban : "recebe"
    User }o--oY Role : "UserRoles"
    Role }o--oY Permission : "RolePermissions"
```

### 1.2 Domínio 2: CMS, Editor Interno, Ativos (Assets) e Modding
```mermaid
erDiagram
    Map {
        uuid id PK
        string name
        string description
        json data
        int version
        uuid createdById FK
        datetime createdAt
    }
    Asset {
        uuid id PK
        string name UK
        string type
        uuid fileId FK
        json metadata
        int version
        datetime createdAt
    }
    Texture {
        uuid id PK
        uuid assetId FK
        string resolution
        string format
        uuid fileId FK
    }
    AudioFile {
        uuid id PK
        uuid assetId FK
        float duration
        string format
        uuid fileId FK
    }
    Monster {
        uuid id PK
        string name
        float baseHealth
        float baseSpeed
        uuid assetId FK
        json behaviorTree
    }
    Animation {
        uuid id PK
        uuid assetId FK
        string name
        float duration
    }
    Upload {
        uuid id PK
        string fileName
        string mimeType
        int sizeBytes
        string s3Key
        datetime createdAt
    }
    Mod {
        uuid id PK
        string name UK
        string description
        string version
        uuid authorId FK
        uuid fileId FK
        boolean isApproved
        datetime createdAt
    }
    Skin {
        uuid id PK
        string name
        uuid assetId FK
        int costCredits
        datetime createdAt
    }

    Asset ||--o| Texture : "especializa"
    Asset ||--o| AudioFile : "especializa"
    Asset ||--oY Animation : "possui"
    Asset ||--oY Monster : "representa"
    Asset }o--|| Upload : "armazena"
    Mod }o--|| User : "desenvolvido_por"
    Mod ||--|| Upload : "contém_arquivo"
    Skin }o--|| Asset : "visual_de"
```

### 1.3 Domínio 3: Gameplay, Inventário, Lore e Progresso
```mermaid
erDiagram
    SaveGame {
        uuid id PK
        uuid userId FK
        uuid mapId FK
        int version
        string checksum
        bytes compressedState
        datetime createdAt
    }
    Inventory {
        uuid id PK
        uuid userId FK
        int capacity
        datetime updatedAt
    }
    Item {
        uuid id PK
        string name UK
        string type
        json staticData
        uuid assetId FK
    }
    InventoryItem {
        uuid id PK
        uuid inventoryId FK
        uuid itemId FK
        int slotIndex
        int quantity
        float durability
    }
    Lore {
        uuid id PK
        string title UK
        string code UK
        string content
        uuid mediaId FK
    }
    Document {
        uuid id PK
        string title UK
        string category
        string content
        uuid decryptKeyId FK
    }
    Achievement {
        uuid id PK
        string name UK
        string description
        int points
        uuid badgeAssetId FK
    }
    UserAchievement {
        uuid id PK
        uuid userId FK
        uuid achievementId FK
        datetime unlockedAt
    }
    Event {
        uuid id PK
        string name
        string type
        datetime startsAt
        datetime endsAt
        json rewardData
    }

    User ||--oY SaveGame : "grava"
    User ||--|| Inventory : "possui"
    Inventory ||--oY InventoryItem : "contém"
    Item ||--oY InventoryItem : "instanciado_em"
    Lore }o--o| Media : "ilustrado_por"
    User ||--oY UserAchievement : "desbloqueia"
    Achievement ||--oY UserAchievement : "associado_a"
```

### 1.4 Domínio 4: Telemetria, Analytics e Auditoria
```mermaid
erDiagram
    Analytics {
        uuid id PK
        uuid userId FK
        string eventType
        json payload
        datetime timestamp
    }
    Log {
        uuid id PK
        string level
        string source
        string message
        string stackTrace
        datetime timestamp
    }
    Report {
        uuid id PK
        uuid reporterId FK
        uuid reportedUserId FK
        string reason
        string status
        datetime createdAt
    }
    Notification {
        uuid id PK
        uuid userId FK
        string title
        string content
        boolean isRead
        datetime createdAt
    }
    Media {
        uuid id PK
        string type
        uuid uploadId FK
        datetime createdAt
    }
    Statistic {
        uuid id PK
        uuid userId FK
        int gamesPlayed
        int totalPlaytime
        int totalTokensCollected
        datetime updatedAt
    }

    User ||--oY Analytics : "gera"
    User ||--oY Report : "registra/recebe"
    User ||--oY Notification : "recebe"
    User ||--|| Statistic : "possui"
    Media ||--|| Upload : "origina_de"
```

---

## 2. PRISMA SCHEMA COMPLETO E PROFISSIONAL

Abaixo está o arquivo `schema.prisma` com todas as 30 tabelas descritas, utilizando tipos nativos do PostgreSQL, chaves UUID v4, relacionamentos bem definidos e índices estrategicamente posicionados.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// 1. DOMÍNIO DE SEGURANÇA E USUÁRIO
// ==========================================

model User {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email        String        @unique @db.VarChar(255)
  passwordHash String        @db.VarChar(255)
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now()) @db.Timestamptz(6)
  updatedAt    DateTime      @updatedAt @db.Timestamptz(6)
  deletedAt    DateTime?     @db.Timestamptz(6)

  profile      Profile?
  sessions     Session[]
  bansReceived Ban[]         @relation("BannedUser")
  bansIssued   Ban[]         @relation("BannerAdmin")
  roles        UserRole[]
  saveGames    SaveGame[]
  inventory    Inventory?
  mods         Mod[]
  reportsFiled Report[]      @relation("Reporter")
  reportsAbout Report[]      @relation("ReportedUser")
  notifications Notification[]
  statistics   Statistic?
  analytics    Analytics[]
  achievements UserAchievement[]

  @@index([email])
  @@map("users")
}

model Profile {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @unique @db.Uuid
  username  String   @unique @db.VarChar(50)
  avatarUrl String?  @db.VarChar(500)
  level     Int      @default(1) @db.Integer
  xp        Int      @default(0) @db.Integer
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([username])
  @@map("profiles")
}

model Role {
  id          String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String           @unique @db.VarChar(50)
  description String?          @db.VarChar(255)
  permissions RolePermission[]
  users       UserRole[]

  @@map("roles")
}

model Permission {
  id          String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String           @unique @db.VarChar(100)
  description String?          @db.VarChar(255)
  roles       RolePermission[]

  @@map("permissions")
}

model UserRole {
  userId String @db.Uuid
  roleId String @db.Uuid

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

model RolePermission {
  roleId       String @db.Uuid
  permissionId String @db.Uuid

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model Session {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  token     String   @unique @db.VarChar(500)
  ipAddress String?  @db.VarChar(45)
  userAgent String?  @db.VarChar(500)
  expiresAt DateTime @db.Timestamptz(6)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model Ban {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String    @db.Uuid
  reason      String    @db.VarChar(500)
  expiresAt   DateTime? @db.Timestamptz(6)
  createdById String    @db.Uuid
  createdAt   DateTime  @default(now()) @db.Timestamptz(6)

  user        User      @relation("BannedUser", fields: [userId], references: [id], onDelete: Cascade)
  createdBy   User      @relation("BannerAdmin", fields: [createdById], references: [id], onDelete: Restrict)

  @@index([userId])
  @@map("bans")
}


// ==========================================
// 2. DOMÍNIO DE ARQUIVOS, CMS E ATIVOS 3D
// ==========================================

model Upload {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fileName  String   @db.VarChar(255)
  mimeType  String   @db.VarChar(100)
  sizeBytes Int      @db.Integer
  s3Key     String   @unique @db.VarChar(500)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  assets     Asset[]
  mods       Mod[]
  media      Media[]

  @@map("uploads")
}

model Media {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  type      String   @db.VarChar(50) // e.g., "IMAGE", "VIDEO", "DOCUMENT"
  uploadId  String   @db.Uuid
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  upload    Upload   @relation(fields: [uploadId], references: [id], onDelete: Cascade)
  loreItems Lore[]

  @@map("media")
}

model Map {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  data        Json     @db.JsonB // Armazena a árvore de nós de colisão/entidades do editor
  version     Int      @default(1) @db.Integer
  createdById String   @db.Uuid
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  saveGames   SaveGame[]

  @@map("maps")
}

model Asset {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @unique @db.VarChar(150)
  type      String   @db.VarChar(50) // "TEXTURE", "AUDIO", "MESH", "ANIMATION", "MONSTER"
  fileId    String   @db.Uuid
  metadata  Json     @default("{}") @db.JsonB
  version   Int      @default(1) @db.Integer
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  file       Upload      @relation(fields: [fileId], references: [id], onDelete: Restrict)
  textures   Texture[]
  audioFiles AudioFile[]
  animations Animation[]
  monsters   Monster[]
  skins      Skin[]
  items      Item[]
  achievements Achievement[]

  @@index([type])
  @@map("assets")
}

model Texture {
  id         String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assetId    String @db.Uuid
  resolution String @db.VarChar(20) // e.g., "1024x1024", "2048x2048"
  format     String @db.VarChar(20) // e.g., "KTX2", "PNG"
  fileId     String @db.Uuid

  asset      Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@map("textures")
}

model AudioFile {
  id       String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assetId  String @db.Uuid
  duration Float  @db.Real
  format   String @db.VarChar(20) // e.g., "OGG", "WAV"

  asset    Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@map("audio_files")
}

model Monster {
  id           String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String @db.VarChar(100)
  baseHealth   Float  @default(100) @db.Real
  baseSpeed    Float  @default(5.0) @db.Real
  assetId      String @db.Uuid
  behaviorTree Json   @db.JsonB // Árvore de tomada de decisão estruturada para o HFSM

  asset        Asset  @relation(fields: [assetId], references: [id], onDelete: Restrict)

  @@map("monsters")
}

model Animation {
  id       String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  assetId  String @db.Uuid
  name     String @db.VarChar(100) // e.g., "RUN", "ATTACK", "IDLE"
  duration Float  @db.Real

  asset    Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@map("animations")
}

model Mod {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @unique @db.VarChar(150)
  description String?  @db.VarChar(1000)
  version     String   @db.VarChar(30)
  authorId    String   @db.Uuid
  fileId      String   @db.Uuid
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  file        Upload   @relation(fields: [fileId], references: [id], onDelete: Restrict)

  @@index([authorId])
  @@index([isApproved])
  @@map("mods")
}

model Skin {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @db.VarChar(100)
  assetId     String   @db.Uuid
  costCredits Int      @default(0) @db.Integer
  createdAt   DateTime @default(now()) @db.Timestamptz(6)

  asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Restrict)

  @@map("skins")
}


// ==========================================
// 3. DOMÍNIO DE GAMEPLAY E SALVAMENTO (SAVE/INVENTÁRIO)
// ==========================================

model SaveGame {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @db.Uuid
  mapId           String   @db.Uuid
  version         Int      @default(1) @db.Integer
  checksum        String   @db.VarChar(64) // HMAC-SHA256 para checagem contra trapaças
  compressedState Bytes    @db.ByteA // Estado binário completo do jogo comprimido via LZW
  createdAt       DateTime @default(now()) @db.Timestamptz(6)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  map             Map      @relation(fields: [mapId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@map("save_games")
}

model Inventory {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @unique @db.Uuid
  capacity  Int      @default(16) @db.Integer
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     InventoryItem[]

  @@map("inventories")
}

model Item {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String   @unique @db.VarChar(100)
  type       String   @db.VarChar(50) // e.g., "WEAPON", "CONSUMABLE", "KEY"
  staticData Json     @db.JsonB // Dados como peso, poder de dano, etc.
  assetId    String?  @db.Uuid

  asset          Asset?          @relation(fields: [assetId], references: [id], onDelete: SetNull)
  inventoryItems InventoryItem[]

  @@map("items")
}

model InventoryItem {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventoryId String @db.Uuid
  itemId      String @db.Uuid
  slotIndex   Int    @db.Integer
  quantity    Int    @default(1) @db.Integer
  durability  Float  @default(1.0) @db.Real // Entre 0.0 e 1.0

  inventory   Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  item        Item      @relation(fields: [itemId], references: [id], onDelete: Restrict)

  @@unique([inventoryId, slotIndex])
  @@map("inventory_items")
}

model Lore {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String   @unique @db.VarChar(150)
  code      String   @unique @db.VarChar(50) // Código único para indexação rápida (ex: "LORE_01")
  content   String   @db.Text
  mediaId   String?  @db.Uuid

  media     Media?   @relation(fields: [mediaId], references: [id], onDelete: SetNull)

  @@map("lore_items")
}

model Document {
  id           String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title        String  @unique @db.VarChar(150)
  category     String  @db.VarChar(100) // "MILITARY", "MEDICAL", "AETHERIS_INC"
  content      String  @db.Text
  decryptKeyId String? @db.Uuid // Referência para item chave necessário para abrir o doc

  @@map("documents")
}

model Achievement {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String   @unique @db.VarChar(100)
  description  String   @db.VarChar(500)
  points       Int      @default(10) @db.Integer
  badgeAssetId String?  @db.Uuid

  badgeAsset   Asset?   @relation(fields: [badgeAssetId], references: [id], onDelete: SetNull)
  users        UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @db.Uuid
  achievementId String   @db.Uuid
  unlockedAt    DateTime @default(now()) @db.Timestamptz(6)

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model Event {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String   @db.VarChar(100)
  type       String   @db.VarChar(50) // "SEASONAL", "WEEKLY", "PROMOTIONAL"
  startsAt   DateTime @db.Timestamptz(6)
  endsAt     DateTime @db.Timestamptz(6)
  rewardData Json     @db.JsonB

  @@index([startsAt, endsAt])
  @@map("events")
}


// ==========================================
// 4. DOMÍNIO DE TELEMETRIA, METRICAS, SETTINGS E LOGS
// ==========================================

model Settings {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String   @unique @db.Uuid
  graphicsPreset String   @default("HIGH") @db.VarChar(20) // "LOW", "MEDIUM", "HIGH", "ULTRA"
  audioVolume    Float    @default(0.8) @db.Real
  fov            Int      @default(75) @db.Integer
  keyBindings    Json     @db.JsonB
  updatedAt      DateTime @updatedAt @db.Timestamptz(6)

  @@map("settings")
}

model Analytics {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String?  @db.Uuid
  eventType String   @db.VarChar(100) // e.g., "FPS_DROP", "LEVEL_COMPLETED", "DEATH_BY_MONSTER"
  payload   Json     @db.JsonB // Dados dinâmicos do log do cliente
  timestamp DateTime @default(now()) @db.Timestamptz(6)

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([eventType])
  @@index([timestamp])
  @@map("analytics")
}

model Log {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  level      String   @db.VarChar(15) // "DEBUG", "INFO", "WARN", "ERROR", "FATAL"
  source     String   @db.VarChar(100) // e.g., "GATEWAY_SERVICE", "AUTH_CONTROLLER"
  message    String   @db.Text
  stackTrace String?  @db.Text
  timestamp  DateTime @default(now()) @db.Timestamptz(6)

  @@index([level])
  @@index([timestamp])
  @@map("logs")
}

model Report {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  reporterId     String   @db.Uuid
  reportedUserId String   @db.Uuid
  reason         String   @db.VarChar(500)
  status         String   @default("PENDING") @db.VarChar(20) // "PENDING", "INVESTIGATING", "RESOLVED"
  createdAt      DateTime @default(now()) @db.Timestamptz(6)

  reporter       User     @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  reportedUser   User     @relation("ReportedUser", fields: [reportedUserId], references: [id], onDelete: Cascade)

  @@index([status])
  @@map("reports")
}

model Notification {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  title     String   @db.VarChar(150)
  content   String   @db.VarChar(1000)
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

model Statistic {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                String   @unique @db.Uuid
  gamesPlayed           Int      @default(0) @db.Integer
  totalPlaytime         Int      @default(0) @db.Integer // em segundos
  totalTokensCollected  Int      @default(0) @db.Integer
  updatedAt             DateTime @updatedAt @db.Timestamptz(6)

  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("statistics")
}
```

---

## 3. ESTRATÉGIAS DE OTIMIZAÇÃO E INDEXAÇÃO

Para suportar **milhões de registros simultâneos** e **concorrência pesada de escritas**, o design físico aplica as seguintes técnicas de otimização:

### 3.1 Índices Estratégicos (B-Tree & GIN)
*   **B-Tree Indexes:** Aplicados por padrão para chaves primárias, estrangeiras e colunas textuais exatas usadas em filtros frequentes (ex: `User.email`, `Session.token`, `Profile.username`).
*   **Composite Indexes (Índices Compostos):** Criados em colunas comumente requisitadas juntas. Por exemplo:
    ```prisma
    @@index([userId, isRead]) // Otimiza a renderização rápida do feed de notificações não lidas
    @@index([startsAt, endsAt]) // Otimiza a consulta de eventos/temporadas ativas
    ```
*   **GIN Indexes (Generalized Inverted Index):** Recomendado no PostgreSQL para consultar eficientemente campos estruturados como `Json` (`JsonB`). No nosso caso, é essencial configurar índices GIN no PostgreSQL nativo para:
    *   `Map.data`: Consultar entidades, pontos de spawn e tipos de colisão.
    *   `Item.staticData`: Buscar itens por propriedades dinâmicas de atributos (ex: munição, poder, peso).
    *   `Analytics.payload`: Consultar métricas complexas de telemetria enviadas pelo cliente.
    *(Nota: os índices GIN podem ser aplicados via migrações personalizadas SQL brutas geradas pelo Prisma).*

### 3.2 Otimizações de Concorrência e Gravação
1.  **ByteA / Byte Array para Saves:** A coluna `SaveGame.compressedState` armazena os dados brutos compactados em formato binário (`bytea`). Isso consome até 10 vezes menos espaço de banco do que converter os dados do estado para JSON/Texto e reduz sensivelmente o tráfego de rede I/O.
2.  **No N+1 Queries:** Forçar o uso de relacionamentos "select-in" ou joins restritos através do Prisma ao puxar dados do inventário e sessões para evitar múltiplas conexões pequenas.

---

## 4. PARTICIONAMENTO DE TABELAS (TABLE PARTITIONING)

Consultas e gravações de grandes volumes de dados degradam a performance do banco ao longo do tempo. Aplicaremos o **particionamento de tabela declarativo do PostgreSQL** nas tabelas de escrita massiva:

### 4.1 Tabela `Analytics` (Particionamento por Faixa de Tempo - Range)
A tabela `Analytics` recebe milhares de inserções por minuto durante picos de jogabilidade.
*   **Estratégia:** Particionada mensalmente com base na coluna `timestamp`.
*   **Resultados:**
    *   Leitura rápida de estatísticas mensais sem realizar scans completos.
    *   Descarte ultra-rápido de dados antigos de auditoria através da execução de `DROP PARTITION` em vez de deletar linhas individualmente (o que bloqueia a tabela e fragmenta o banco).

### 4.2 Tabela `Logs` (Particionamento por Faixa de Tempo - Range)
*   **Estratégia:** Particionada semanalmente ou quinzenalmente de acordo com o volume gerado em produção baseando-se na coluna `timestamp`.
*   **Resultados:** Isola logs transientes antigos, permitindo o arquivamento simples de tabelas de histórico compactadas para armazenamento a frio (Cold Storage - S3).

---

## 5. ESTRATÉGIA DE CACHE COM REDIS

O banco PostgreSQL é protegido por uma camada de cache de latência de sub-milissegundo com o **Redis**:

```
                       [Requisição do Cliente]
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │       API GATEWAY        │
                    │   (Filtra Autenticação)  │
                    └─────────────┬────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │    REDIS CACHE LAYER     │  Existe no cache?
                    └──────┬─────────────┬─────┘
                           │             │
                    Sim (1ms)           Não (Fallthrough)
                           ▼             ▼
                 [Retorna Resposta] ┌──────────┐
                                    │ POSTGRES │  Busca do banco e
                                    └────┬─────┘  atualiza o Redis
                                         │
                                         ▼
                               [Retorna Resposta]
```

### 5.1 Dados em Cache (Estratégias de Invalidação)
*   **Sessões do Usuário (Sessions):** Salvas como strings chave-valor (`session:<token>`) com TTL (Time-To-Live) idêntico ao vencimento do JWT. O banco PostgreSQL só é atingido em caso de falha no cache.
*   **Status de Jogadores Ativos:** Salvos no Redis em estruturas `Hash` rápidas para atualizações constantes de lobbies e servidores Socket.IO.
*   **Manifesto de Assets e CMS:** Armazenado em cache estático por tempo indeterminado. Quando o CMS atualiza um mapa ou pacote de texturas, o servidor executa um evento que limpa a chave correspondente no Redis (`DEL static:assets:manifest`).

---

## 6. ESTRATÉGIAS DE BACKUP E ALTA DISPONIBILIDADE

Para mitigar a perda de dados críticos de usuários e garantir conformidade operacional:

### 6.1 Backups Automatizados
1.  **Backup Contínuo (Point-in-Time Recovery - PITR):** Configurar replicação física baseada em Write-Ahead Logging (WAL) enviando os logs de escrita em tempo de execução para um bucket S3. Permite restaurar o banco para qualquer segundo específico em caso de desastre.
2.  **Backups Diários (Dump):** Exportação comprimida das tabelas estáticas de configuração, itens, mapas e lore executadas em horários de menor tráfego de rede (ex: 03:00 UTC).

### 6.2 Alta Disponibilidade (HA)
*   **Arquitetura Multi-AZ (Active-Passive):** Um nó mestre rodando escritas e leituras replicando assincronamente os commits em tempo real para um nó de réplica secundário em outra Zona de Disponibilidade da nuvem. Em caso de colapso do nó principal, o roteamento da nuvem faz failover automático promovendo a réplica a mestre em menos de 30 segundos.

---

Este design de engenharia de dados garante que a infraestrutura do **PROJECT ABYSS** seja capaz de operar sob carga severa mantendo consistência absoluta nas transações de inventário, agilidade extrema no streaming de ativos e observabilidade completa através da telemetria particionada.
