# PROJECT ABYSS — ARQUITETURA TÉCNICA E ENGENHARIA DO SISTEMA (ETAPA 2)

Este documento estabelece as especificações de arquitetura para o **PROJECT ABYSS**, um jogo de terror psicológico WebGL de grande escala. O design foca em altíssima performance de renderização (60+ FPS constante em navegadores modernos), escalabilidade de microsserviços para orquestrar dados, inventário, salvamento e telemetria, além de uma base estruturada para suporte futuro a multiplayer cooperativo e modding.

---

## 1. VISÃO GERAL DA ARQUITETURA DE SISTEMAS

A arquitetura adota um modelo **Híbrido Distribuído**:
*   **Cliente (Client-Side):** Motorizado por **BabylonJS** e estruturado no padrão **ECS (Entity Component System)** sob TypeScript. A interface de UI é desacoplada, rodando em **React + Tailwind + Shadcn** sobreposta ao canvas WebGL, evitando re-renders custosos no canvas 3D.
*   **Servidor (Backend-Side):** Baseado em **Microsserviços orientados a eventos** utilizando **NestJS**, orquestrados via **Docker** e protegidos por **Cloudflare**. A comunicação em tempo real de baixíssima latência é efetuada via **Socket.IO (WebSockets)**, escalonada horizontalmente através de adaptadores **Redis Pub/Sub**.
*   **Camada de Dados:** Persistência relacional robusta com **PostgreSQL** através do ORM **Prisma**, com caching ultra-rápido de sessões e filas de mensagens estruturadas no **Redis**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE & CDN                           │
│     (WAF, DDoS Protection, DNS Routing & Asset Delivery via HTTP/3)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────┐                               ┌──────────────────┐
│  ASSET CDN       │                               │   WEB CLIENT     │
│  (S3 / Edge)     │                               │ (React, Tailwind │
│  .gltf, .bin,    │                               │  BabylonJS, ECS) │
│  Basis Textures  │                               └─────────┬────────┘
└────────┬─────────┘                                         │
         │                                                   │ HTTPS / WSS
         │ Get Assets                                        │ (JWT Auth)
         │                                                   ▼
         │                                         ┌──────────────────┐
         │                                         │ CLOUDFLARE WARP  │
         │                                         │ (Reverse Proxy)  │
         │                                         └─────────┬────────┘
         │                                                   │
         │                                                   ▼
         │                                         ┌──────────────────┐
         │                                         │  API GATEWAY /   │
         │                                         │ TRAEFIK BALANCER │
         │                                         └─────────┬────────┘
         │                                                   │
         │         ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
         │         ▼ (HTTP)                                  ▼ (WSS)                                   ▼ (HTTP)
         │  ┌──────────────┐                          ┌──────────────┐                          ┌──────────────┐
         │  │ AUTH SERVICE │                          │ GATEWAY &    │                          │ ANALYTICS &  │
         │  │  (NestJS)    │                          │ MULTIPLAYER  │                          │ LOG SERVICE  │
         │  │   JWT Auth   │                          │ (NestJS/WS)  │                          │  (NestJS)    │
         │  └──────┬───────┘                          └──────┬───────┘                          └──────┬───────┘
         │         │                                         │                                         │
         └─────────┼─────────────────────┐                   │                                         │
                   │                     │                   │                                         │
                   ▼                     ▼                   ▼                                         ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                      ┌──────────────────┐
         │    POSTGRESQL    │  │   REDIS CACHE    │  │  REDIS PUB/SUB   │                      │  ELASTICSEARCH / │
         │   (Prisma ORM)   │  │ (Session, State) │  │  (Message Bus)   │                      │    PROMETHEUS    │
         │ Persistent Data  │  │ Fast Key-Value   │  │ Scale WebSockets │                      │ Telemetry & Logs │
         └──────────────────┘  └──────────────────┘  └──────────────────┘                      └──────────────────┘
```

---

## 2. ESTRUTURA DE PASTAS E MODULARIZAÇÃO COMPLETA

Para garantir o desacoplamento, a manutenibilidade e o suporte a múltiplos desenvolvedores trabalhando em paralelo, o projeto adota uma estrutura de monorepo estruturada por domínios (`@abyss/client` e `@abyss/server`).

### 2.1 Estrutura do Cliente (WebGL & UI)
```
/apps/client
├── public/                     # Assets estáticos de inicialização rápida
│   ├── index.html
│   └── locales/
├── src/
│   ├── main.tsx                # Ponto de entrada do React
│   ├── App.tsx                 # Layout mestre, roteamento e sobreposições
│   ├── index.css               # Folha de estilo global de Tailwind
│   ├── core/                   # Núcleo da Engine WebGL (BabylonJS)
│   │   ├── Engine.ts           # Inicialização do renderizador e loops principais
│   │   ├── SceneManager.ts     # Carregador e orquestrador de cenas 3D
│   │   ├── EventBus.ts         # Central de eventos local e pub/sub
│   │   └── SaveSystem.ts       # Serializador de savegames e LocalStorage proxy
│   ├── ecs/                    # Arquitetura Entity Component System
│   │   ├── Entity.ts           # Identificador de entidades
│   │   ├── Component.ts        # Tipos base e definições de componentes puras
│   │   ├── System.ts           # Lógica do jogo (movimentação, detecção, física)
│   │   ├── components/         # Implementação de componentes
│   │   │   ├── TransformComponent.ts
│   │   │   ├── SoundEmitterComponent.ts
│   │   │   ├── AIStateComponent.ts
│   │   │   └── NetworkSyncComponent.ts
│   │   └── systems/            # Execução cíclica dos loops
│   │       ├── MovementSystem.ts
│   │       ├── RenderSystem.ts
│   │       ├── AISteeringSystem.ts
│   │       └── AudioAttenuationSystem.ts
│   ├── pipeline/               # Graphics Pipeline & Shaders Customizados
│   │   ├── RenderPipeline.ts   # Configuração de pós-processamento (Post-Process)
│   │   └── shaders/            # GLSL Custom Shaders (.vert / .frag)
│   │       ├── aberration.frag # Aberração cromática de stress
│   │       └── volumetric.vert # Iluminação volumétrica de lanterna
│   ├── subsystems/             # Subsistemas da Engine
│   │   ├── AudioSystem.ts      # Web Audio API 3D Spatial Sound
│   │   ├── InputSystem.ts      # Gerenciador físico de mouse/teclado/gamepad
│   │   ├── InventorySystem.ts  # Gerenciador de inventário e slots locais
│   │   └── AISystem.ts         # Redes neurais de comportamento, Pathfinding
│   ├── components/             # Componentes React (UIs de Dashboard, Editor)
│   │   ├── editor/             # Editor interno de cenários e spawns
│   │   │   ├── LevelEditor.tsx
│   │   │   └── AssetInspector.tsx
│   │   └── shared/             # Botões, inputs, painéis customizados (Shadcn)
│   └── types/                  # Tipagem TypeScript do Client
└── tsconfig.json
```

### 2.2 Estrutura do Servidor (NestJS & Microsserviços)
```
/apps/server
├── prisma/
│   ├── schema.prisma           # Modelagem de dados do PostgreSQL
│   └── migrations/
├── src/
│   ├── main.ts                 # Boot do NestJS
│   ├── app.module.ts           # Módulo raiz de conexões
│   ├── common/                 # Middlewares, guards de JWT, filtros de erro
│   ├── config/                 # Gerenciamento de variaveis de ambiente (.env)
│   └── modules/                # Módulos de domínio desacoplados
│       ├── auth/               # Autenticação JWT e segurança
│       │   ├── auth.controller.ts
│       │   └── auth.service.ts
│       ├── gateway/            # Módulo de WebSockets (Socket.IO)
│       │   ├── game.gateway.ts # Gateway principal de tráfego de rede do jogo
│       │   └── game.session.ts # Gerenciador de sessões ativas no Redis
│       ├── save/               # Sincronização e compressão de save-state
│       │   ├── save.controller.ts
│       │   └── save.service.ts
│       ├── inventory/          # Validador de inventário do jogador (Lógica Servidor)
│       │   ├── inventory.controller.ts
│       │   └── inventory.service.ts
│       ├── cms/                # Gerenciamento de Assets, Patches e Configs de Modding
│       │   ├── cms.controller.ts
│       │   └── cms.service.ts
│       └── analytics/          # Recebimento de Telemetria e Logs
│           ├── analytics.controller.ts
│           └── analytics.service.ts
└── docker-compose.yml          # Orquestração local de Postgres, Redis e Gateway
```

---

## 3. ARQUITETURA CLIENTE-SERVIDOR E FLUXO DE DADOS

A comunicação baseia-se em uma separação rígida de protocolos de acordo com a latência e confiabilidade requerida:

### 3.1 HTTP/3 (REST + TLS 1.3 via Cloudflare)
Utilizado para ações assíncronas transacionais, onde a confiabilidade é mandatória e a latência de milissegundos não afeta a jogabilidade direta.
*   **Ações:** Autenticação (JWT), Download de Manifestos de Assets, Upload/Download de Savegames Criptografados, Registro de Compras de Cosméticos/Modding, e envio em lote (Batch) de Logs e Telemetria de Bugs.

### 3.2 WebSockets (Socket.IO sobre TCP)
Utilizado para tráfego em tempo real, mantendo uma conexão persistente e bidirecional de baixa latência para o multiplayer futuro e para a sincronização de eventos de jogo mundiais persistentes.
*   **Ações:** Sincronização de posição espacial de jogadores (60 ticks/seg com interpolação e reconciliação no cliente), RPCs de interação física mútua, envio de status de voz posicional de proximidade e notificações de broadcast do servidor.

### 3.3 Fluxo de Conexão e Sessão
1.  **Handshake de Inicialização:**
    *   Cliente autentica-se via `/api/auth/login` e recebe um Token JWT assinado.
    *   Cliente solicita manifesto de jogo mais atual do CMS via `/api/cms/manifest`.
    *   O cliente faz o download dos assets correspondentes da CDN (Cloudflare Edge).
2.  **Estabelecimento do Canal de Tempo Real:**
    *   Cliente inicia conexão com o Gateway `Socket.IO` passando o JWT no header de autorização (`Authorization: Bearer <JWT>`).
    *   O NestJS Gateway valida o token no interceptor. Se válido, registra o Socket ID associado ao `userId` no Redis, mapeando a rota interna de dados.
    *   Caso ocorra perda de conexão, o Redis mantém o estado por até 120 segundos (Graceful Disconnection), permitindo reconexão instantânea do jogador sem perda de progresso da sala ou lobby.

---

## 4. PIPELINE DE ATIVOS (ASSET PIPELINE) DE ALTA ESCALA

Jogos WebGL falham se o tempo de carregamento inicial for longo ou se causarem estouros de memória RAM/VRAM de navegadores. Nosso pipeline automatizado é projetado para minimizar o overhead de rede e decodificação gráfica:

```
[Ativos Brutos (Maya, Blender, Substance)]
  - .fbx, .obj (Modelos 3D de alta contagem de polígonos)
  - .png, .tga (Texturas raw em 4K)
        │
        ▼ (Processo de Build Automatizado via Node.js + Gulp + Draco Compressor)
[Pipeline de Otimização e Conversão]
  - Redução de Polígonos (Decimação de malhas com preservação de silhueta)
  - Compressão Geométrica Draco (gLTF / GLB com compressão de vetores)
  - Conversão de Texturas para Basis Universal / KTX2 (Suporte nativo a GPU ASTC/ETC2)
  - Geração de LODs automática (Level of Detail: High, Medium, Low)
        │
        ▼ (Deployment automatizado para CDN)
[Armazenamento e Cache Inteligente]
  - Repositório S3 de Assets Gráficos
  - Cloudflare CDN (Edge Caching geolocalizado com compressão Brotli no transporte)
        │
        ▼ (Carregamento Dinâmico em Tempo de Execução no Navegador)
[Mecanismo de Streaming no Cliente]
  - BabylonJS AssetsManager (Carregamento progressivo e assíncrono por proximidade)
  - Liberação ativa de memória (Dispose de meshes ocultas da VRAM)
```

### 4.1 Compressão e Formatos em Detalhes
*   **Malhas (Geometry):** Modelos exportados estritamente em `.gltf` ou `.glb` comprimidos com **Draco Compression** (redução de até 85% do tamanho físico do arquivo).
*   **Texturas (GPU Compressed):** Texturas comprimidas em **Basis Universal (`.ktx2`)**. Diferente de arquivos `.png` ou `.jpeg` que precisam ser totalmente descompactados na RAM do sistema em formato bruto (RAW) antes de irem para a GPU (estourando a memória do navegador), o formato `.ktx2` permanece compactado na memória de vídeo (VRAM) e é decodificado por hardware em tempo de execução pela GPU.
*   **Carregador Assíncrono:** BabylonJS usa workers em paralelo para decodificar arquivos Draco e KTX2 sem congelar a thread de execução principal (evitando travamentos do frame rate durante a navegação).

---

## 5. MEMORY FOOTPRINT OTIMIZADO & GRAPHICS SYSTEM (60 FPS)

Para atingir a marca de **60+ FPS em WebGL**, o motor precisa ser implacável com alocações dinâmicas de memória para mitigar pausas de coleta de lixo (Garbage Collection do JavaScript).

### 5.1 Otimizações Críticas no BabylonJS
*   **Asset Pooling (Reutilização de Objetos):** É proibido instanciar malhas repetidamente (como balas, partículas ou decalques de lodo). O sistema cria pools estáticos durante a carga da cena e altera as posições espaciais ativamente.
    *   *Exemplo de fluxo:* O tiro ou o lodo escuro que se espalha utiliza `InstancedMesh` para compartilhar o mesmo buffer de vértices e materiais em uma única chamada de desenho (Single Draw Call).
*   **Sistemas de Culling (Ocultação Visual):**
    *   **Frustum Culling:** BabylonJS ignora objetos fora da visão da câmera por padrão.
    *   **Occlusion Queries:** Objetos escondidos atrás de paredes espessas de concreto da Estação ES7 são completamente removidos do pipeline de renderização antes que o processamento do fragment shader seja iniciado.
*   **Octree de Cena:** A Estação ES7 é espacialmente indexada usando uma estrutura de árvore Octree 3D. Isso acelera a detecção de colisões, testes de raio de visão e disparo de áudio em $O(\log N)$ em vez de comparadores lineares $O(N)$.
*   **Prevenção de Memory Leaks:** Cada vez que uma sala ou setor é descarregado, o `SceneManager` varre as listas e executa explicitamente o método `.dispose()` em todas as Geometrias, Materiais, Texturas e Buffers, forçando a desalocação imediata da VRAM da GPU.

### 5.2 Rendering Pipeline (Fluxo de Renderização)
O pipeline gráfico é dividido em três passes integrados:
1.  **Geometry Pass (Passe de Geometria):** Renderiza o mapa de profundidade (Depth Map), vetores de movimento e as malhas brutas sem iluminação.
2.  **Lighting & Custom Shaders Pass:**
    *   Cálculo de sombras suaves por mapas de sombra cascateados (Cascaded Shadow Maps).
    *   Projeção volumétrica da lanterna de Thomas via fragment shader customizado, que calcula a dispersão de luz em poeira simulada matematicamente com funções de ruído simplex (sem usar malhas extras).
3.  **Post-Processing Pipeline (Efeitos de Tela):**
    *   **Bloom & Glare:** Para o efeito das lâmpadas fluorescentes com defeito.
    *   **Color Grading / LUT:** Filtro cinematográfico dessaturado e cinzento para enfatizar a opressão industrial.
    *   **Aberração Cromática Dinâmica:** Vinculado diretamente ao nível de estresse do jogador. Quanto maior o stress (BPM alto no simulador), mais as bordas da tela sofrem refração de canal de cor (vermelho, verde, azul separados espacialmente), distorcendo a percepção de profundidade do jogador.

---

## 6. SAVE SYSTEM (SISTEMA DE SALVAMENTO DE ESTADO DO MUNDO)

O sistema de salvamento do **PROJECT ABYSS** é resiliente e híbrido: garante persistência local instantânea e sincronização em segundo plano assíncrona com o banco de dados PostgreSQL do servidor, sem bloquear a taxa de quadros (framerate) do jogo.

```
                  ┌────────────────────────────────────────┐
                  │           ESTADO DE JOGO (ECS)         │
                  │   - Posição (x, y, z) de Thomas        │
                  │   - Inventário (IDs, Slots, Usos)      │
                  │   - Status de Cenas, Objetivos         │
                  │   - Variáveis Mentais (Stress, Medo)   │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      SERIALIZADOR ECS     │
                        │  Serializa dados para JSON│
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      COMPRESSÃO LZW       │
                        │ Comprime string de dados  │
                        └─────────────┬─────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼ (Armazenamento Local Rápido)                  ▼ (Sincronização assíncrona HTTP/3)
┌──────────────────────────┐                    ┌──────────────────────────┐
│  LOCAL STORAGE PROXY     │                    │  API BACKEND (/api/save) │
│ Salva string comprimida  │                    │ Envia payload comprimido │
│  como backup de sessão   │                    │     e assinado com JWT   │
└──────────────────────────┘                    └─────────────┬────────────┘
                                                              │
                                                              ▼
                                                ┌──────────────────────────┐
                                                │        NESTS SERVER      │
                                                │ Descompacta e valida o   │
                                                │ hash para evitar fraudes │
                                                └─────────────┬────────────┘
                                                              │
                                                              ▼
                                                ┌──────────────────────────┐
                                                │   DATABASE (POSTGRESQL)  │
                                                │ Atualiza registro via    │
                                                │        Prisma ORM        │
                                                └──────────────────────────┘
```

### 6.1 Segurança e Integridade
*   **Garantia de Não-Falsificação:** Toda alteração ou sincronização de progresso enviada ao backend possui uma assinatura de hash (HMAC-SHA256) gerada com uma chave de integridade rotativa mantida em memória. Tentativas de alterar valores locais no LocalStorage (como adicionar munição ou itens chave do cenário de forma fraudulenta) serão rejeitadas pelo servidor na reconciliação de estado.
*   **Concorrência de Gravação:** Para evitar conflitos de gravação dupla de save no banco de dados, o backend gerencia o salvamento através de transações isoladas do Prisma, mantendo um número de versão serial incremental em cada Savegame (`save_version`). Caso o jogador tente enviar uma versão de salvamento inferior à presente no banco de dados, o envio é descartado (Prevenção de Race Conditions de conexões simultâneas).

---

## 7. SISTEMA DE EVENTOS LOCAL E GLOBAL (EVENT SYSTEM)

O fluxo operacional do jogo é puramente direcionado a eventos (Event-Driven Design). Isso remove o acoplamento entre os sistemas de Inteligência Artificial, Renderização de Gráficos e Áudio.

```
                          ┌───────────────────────┐
                          │   DISPARADORES / ECS  │
                          │   - Trigger de Proxim. │
                          │   - Interação Física  │
                          │   - Som de Thomas     │
                          └───────────┬───────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │    LOCAL EVENT BUS    │
                          │    (Client-Side)      │
                          └───────────┬───────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     AUDIO SYSTEM      │ │       AI SYSTEM       │ │    NETWORK SYSTEM     │
│  Toca efeito sonoro   │ │ Registra som e inicia │ │ Transmite evento via │
│ 3D e aplica reverber. │ │ busca ativa no local  │ │      Socket.IO        │
└───────────────────────┘ └───────────────────────┘ └───────────┬───────────┘
                                                                │
                                                                ▼
                                                    ┌───────────────────────┐
                                                    │    SOCKET.IO SERVER   │
                                                    │     (NestJS Gate)     │
                                                    └───────────┬───────────┘
                                                                │
                                                                ▼
                                                    ┌───────────────────────┐
                                                    │    REDIS PUB/SUB      │
                                                    │  Broadcast para todos │
                                                    │ os nós de servidores  │
                                                    └───────────────────────┘
```

### 7.1 Barramento de Eventos Local (Client Event Bus)
No cliente, o `EventBus` estende um padrão TypeScript fortemente tipado (`Emitter/Listener`). Os componentes ECS não buscam referências diretas uns dos outros.
*   *Exemplo:* Quando Thomas Cole corre no concreto úmido, o `InputSystem` gera o evento `PLAYER_MOVED` com a intensidade da velocidade. O `AudioSystem` escuta o evento e executa o som de passos úmidos 3D de forma espacializada. O `AISystem` também escuta o evento, calculando o vetor de ruído e alertando as entidades inimigas adjacentes através do `AISteeringSystem`.

### 7.2 Eventos de Rede Globais (Network Event Bus)
*   **Pub/Sub no Redis:** No backend, múltiplos microsserviços NestJS precisam sincronizar eventos de lobbies compartilhados. Ao invés de trafegar dados entre si diretamente por rotas HTTP, os nós publicam eventos estruturados no barramento Redis Pub/Sub. Isso permite que qualquer contêiner do Docker atenda qualquer jogador de forma transparente, garantindo escalabilidade ilimitada.

---

## 8. SISTEMA DE ÁUDIO 3D DINÂMICO (AUDIO SYSTEM)

No terror de sobrevivência, o som é a principal ferramenta de ambientação e jogabilidade. O sistema é baseado puramente na **Web Audio API** nativa de navegadores, proporcionando posicionamento acústico realista sem impacto no framerate.

```
                                  [Arquivos de Áudio Raw (.ogg / .mp3)]
                                                   │
                                                   ▼
                                         ┌──────────────────┐
                                         │ AUDIO CONTEXT    │
                                         │  (Filtros & EQ)  │
                                         └─────────┬────────┘
                                                   │
                                                   ▼
                                         ┌──────────────────┐
                                         │ BIO-SENSORY NODE │
                                         │  (Heartbeat EQ)  │
                                         └─────────┬────────┘
                                                   │
                     ┌─────────────────────────────┴─────────────────────────────┐
                     ▼ (Som 3D Dinâmico)                                         ▼ (Som Ambiente)
           ┌──────────────────┐                                        ┌──────────────────┐
           │   PANNER NODE    │                                        │ SUB-BASS DRONE   │
           │ (Posição 3D,     │                                        │ (Sintetizador    │
           │  Atenuação)      │                                        │ Analógico 43Hz)  │
           └─────────┬────────┘                                        └─────────┬────────┘
                     │                                                           │
                     ▼                                                           ▼
           ┌──────────────────┐                                                  │
           │  CONVOLVER NODE  │                                                  │
           │ (Reverberação de │                                                  │
           │    Cenário)      │                                                  │
           └─────────┬────────┘                                                  │
                     │                                                           │
                     └─────────────────────────────┬─────────────────────────────┘
                                                   ▼
                                         ┌──────────────────┐
                                         │  COMPRESSOR NODE │
                                         │  (Limitador de   │
                                         │   Saturação)     │
                                         └─────────┬────────┘
                                                   │
                                                   ▼
                                         [Alto-falantes / Fones]
```

### 8.1 Processamento Acústico por Hardware
1.  **AudioContext Centralizado:** Todas as fontes de som são canalizadas através de nós de controle de ganho estruturados, com filtragem passa-baixas (Low-Pass Filters) e reverberação convolucional baseada em respostas de impulso físicas de corredores industriais e túneis.
2.  **PannerNode 3D:** Cada som emitido por anomalias ou geradores danificados herda as coordenadas de mundo `(x, y, z)` de seu `TransformComponent`. O `PannerNode` do navegador calcula de forma nativa a atenuação linear com a distância, a diferença de tempo de chegada do som aos ouvidos esquerdo/direito (ITD), e os efeitos de atenuação de frequência das orelhas humanas (HRTF).
3.  **Atenuação de Obstáculos Dinâmica:** Um sistema periódico de raycasting 3D no cliente (gerido em intervalos de 150ms) verifica se existem obstáculos de concreto entre a câmera de Thomas e a anomalia agressora. Se o caminho estiver obstruído, o sistema aplica dinamicamente uma filtragem passa-baixas pesada e reduz o ganho (Gain), emulando perfeitamente a propagação física de som de baixa frequência através de paredes espessas.

---

## 9. INTELIGÊNCIA ARTIFICIAL E COMPORTAMENTO (AI SYSTEM)

A IA no **PROJECT ABYSS** precisa parecer imprevisível, aterrorizante e implacável. Para isso, o sistema é estruturado em uma arquitetura de tomada de decisão híbrida usando **Máquinas de Estado Finitas Hierárquicas (HFSM)** integradas a algoritmos de **Steering Behaviors** e mapas de navegação de alta fidelidade (**Navigation Meshes**).

```
                      ┌─────────────────────────────────┐
                      │    DETECÇÃO SENSORIAL DE ENTRADA │
                      │  - Audição (EventBus sônico)    │
                      │  - Visão (Raycast Cone 3D)      │
                      │  - Proximidade Física           │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │  MÁQUINA DE ESTADOS (HFSM)       │
                      │  Determina comportamento geral  │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼ (Se Estado: Patrulha)    ▼ (Se Estado: Alerta/Busca)▼ (Se Estado: Perseguição)
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│     ROTA PREESTAB.    │  │   PESQUISA ESPACIAL   │  │   PERSEGUIÇÃO ATIVA   │
│ Segue nós de patrulha │  │ Espalha buscas na     │  │ Traça rota mais curta │
│  gerados pelo editor  │  │ área do barulho       │  │ e acelera movimento   │
└───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │   NAVIGATION MESH (RECAST)      │
                      │ Calcula coordenadas viáveis     │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    STEERING BEHAVIORS           │
                      │ Suaviza aceleração e desvio     │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      [Movimentação no Transform da Entidade]
```

### 9.1 Sensor Humano Realista
As anomalias processam três canais sensoriais simultâneos:
*   **Cone de Visão 3D:** Raycasts poligonais são projetados dos olhos da anomalia. Se Thomas estiver dentro do ângulo de visão de até 120° horizontalmente e até uma distância máxima ajustada pela luz ambiente da sala, o stress e alerta sobem imediatamente. Se Thomas estiver sob luz forte (lanterna ligada), a velocidade de detecção é multiplicada por cinco.
*   **Sensor de Ruído Binaural:** Eventos acústicos disparados no local geram perturbações no mapa de navegação. A inteligência artificial calcula a intensidade do som residual e direciona seu foco de busca para as coordenadas de origem, mesmo se a visão estiver bloqueada por paredes.
*   **Navegação e Trajetórias Realistas:** O cálculo de caminho utiliza o algoritmo **A* (A-Star)** rodando nativamente sobre a Navigation Mesh do mapa compilado. Para evitar movimentos robóticos de 90°, o sistema utiliza **Steering Behaviors** de aproximação, desvio de obstáculos dinâmicos e perda de tração de forma suave e física.

---

## 10. INVENTÁRIO SEGURO E PERSISTÊNCIA (INVENTORY SYSTEM)

O inventário é estruturado sob o conceito de **Autoridade Absoluta do Servidor (Server-Authoritative Design)** para impossibilitar que trapaças no cliente dupliquem injetores químicos ou manipulem munições e chaves essenciais.

```
┌─────────────────────────────────┐                    ┌─────────────────────────────────┐
│         API CLIENTE             │                    │          NESTS BACKEND          │
│                                 │                    │                                 │
│  User tenta usar injetor químico│   HTTP/3 Request   │  Valida integridade do slot     │
│   (ID do item e Slot ID)        ├───────────────────►│  através de chave HMAC e estado │
│                                 │                    │  presente no Redis.             │
│  State bloqueia uso temporário  │◄───────────────────┤                                 │
│  aguardando aprovação remota.   │    JSON Response   │  Transação no PostgreSQL deduz  │
│                                 │                    │  01 unidade do item de forma ACID│
└─────────────────────────────────┘                    └─────────────────────────────────┘
```

### 10.1 Sincronização e Regras de Negócios
*   **Sincronização por Transações ACID:** Todas as modificações de inventário (coleta, descarte, uso) ocorrem por intermédio de transações ACID garantidas pelo Prisma no PostgreSQL. Isso evita duplicações por cliques simultâneos rápidos (Double Spending exploit).
*   **Estrutura de Armazenamento:** Itens de jogo possuem especificações base rígidas no CMS. O inventário do jogador armazena apenas referências em formato chave-estrangeira:
    *   `id`: UUID
    *   `userId`: UUID (Dono do inventário)
    *   `itemDefinitionId`: String (ID registrado do item, ex: `chem_injector_01`)
    *   `slotIndex`: Int (Índice visual do grid)
    *   `quantity`: Int (Contagem empilhada)
    *   `durability`: Float (Vida útil do item para desgaste gradual)

---

## 11. SUPORTE A MODDING E ARQUITETURA DE PLUGINS

Para garantir a longevidade do jogo, a arquitetura prevê suporte nativo à inclusão de modificações de comunidade (mods) no cliente e no servidor de forma segura e sandboxizada:

### 11.1 Sandbox de Execução de Scripts (Mods)
*   **Client Mods:** Extensões de lógica do cliente rodam dentro de um container isolado em JavaScript ou WebAssembly que não possui acesso direto à API global `window` ou ao token JWT de autenticação armazenado. Toda interação com o motor gráfico se dá por meio de um **Event Bridge** controlado. Os mods podem se registrar para escutar eventos locais (`ON_ENEMY_SPAWN`, `ON_AMBIENT_CHANGE`) e injetar novos comportamentos.
*   **Custom Asset Loading:** O motor de cena do BabylonJS suporta a montagem de novos modelos 3D em tempo de execução via drag-and-drop de arquivos gLTF externos. Esses arquivos são validados estruturalmente para evitar estouros de vértices (polígonos limitados por regras da engine) antes de serem submetidos ao pipeline de renderização local.

---

## 12. CMS, TELEMETRIA, MONITORAMENTO E MONITORING PIPELINE

Um jogo WebGL AAA operando na nuvem requer infraestrutura de observabilidade em tempo real para diagnóstico de travamentos no navegador do usuário e análise de performance:

```
┌─────────────────────────────────┐                    ┌─────────────────────────────────┐
│          METRICS CLIENT         │                    │        MONITORING CENTER        │
│                                 │                    │                                 │
│  - Captura FPS médio do usuário │     HTTP POST      │  Prometheus raspa métricas      │
│  - Registra falhas na GPU       ├───────────────────►│  dos servidores em tempo real. │
│  - Log de Erros não capturados  │   (Batch de Logs)  │                                 │
│  - Consumo estimado de memória │                    │  Grafana plota painel de saúde  │
│                                 │                    │  do servidor e latência WSS.    │
└─────────────────────────────────┘                    └─────────────────────────────────┘
```

### 12.1 Telemetria do Cliente
O cliente possui um subsistema leve de telemetria. Se a taxa de quadros (framerate) cair abaixo de 30 FPS por mais de 5 segundos seguidos, ou se houver um erro crítico de perda de contexto WebGL (`WebGLContextLost`), um payload compacto de diagnóstico é despachado em segundo plano para `/api/analytics/log`:
```json
{
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "clientPerformance": {
    "averageFps": 24.3,
    "allocatedMeshes": 342,
    "activeDrawCalls": 182,
    "vramUsageMb": 412.5,
    "browserEngine": "Chrome V120 - Blink"
  },
  "hardwareInfo": {
    "gpuRenderer": "WebGL 2.0 (NVIDIA GeForce RTX 3060/PCIe/SSE2)",
    "systemMemoryGb": 16,
    "logicalProcessors": 12
  },
  "gameplayContext": {
    "activeZone": "Hospital_Wing_G12",
    "activeQuest": "Elena_Signal_Intercept"
  }
}
```

### 12.2 Monitoramento do Servidor
*   **Métricas com Prometheus & Grafana:** Coleta taxas de requisições HTTP, latência de pacotes WebSockets, consumo de conexões do Redis e volume de CPU/Memória consumidos pelas réplicas do Docker.
*   **Alertas Automatizados:** Disparo de notificações no Slack / Discord caso a taxa de sucesso de conexões Socket.IO caia abaixo de 99.8% ou o banco de dados PostgreSQL ultrapasse 85% de IOPS disponível.

---

Este documento técnico de arquitetura estabelece todos os fluxos necessários para que a **ETAPA 2** do **PROJECT ABYSS** seja implementada de forma limpa, altamente otimizada para navegadores modernos e preparada para crescer de acordo com a escala de acessos e a inclusão de novas features futuras.
