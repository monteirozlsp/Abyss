# DOCUMENTAÇÃO ARQUITETURAL DE SISTEMAS CORE: ABYSSENGINE (V2.4.0)
**Autor:** Lead Engine Architect — PROJECT ABYSS (Etapa 5.5)
**Status da Especificação:** Aprovada para Implementação / WebGPU Ready

---

## VISÃO GERAL DA ARQUITETURA DE SUBSISTEMAS
A **AbyssEngine v2.4.0** é projetada como uma engine de alto desempenho voltada especificamente para experiências de horror psicológico, exploração de grandes ambientes, streaming de ativos contínuo e modding nativo. Esta especificação detalha a evolução de seus sistemas de core para um padrão AAA equivalente ao *Decima*, *RE Engine*, *Unreal Engine 5 (Nanite/World Partition)* e *Flecs*.

```
+---------------------------------------------------------------------------------------------------------+
|                                        ABYSS ENGINE CLIENT LAYER                                        |
+---------------------------------------------------------------------------------------------------------+
|  [ScriptRuntime / NodeGraphs]  <--->  [CMS Editor / Live Sockets]  <--->  [Modding Sandbox / Workshop]  |
+---------------------------------------------------------------------------------------------------------+
|                                           HYBRID ECS WORLD                                              |
|                                                                                                         |
|  [EntityManager] -----------> [Archetypes / contiguous Memory Chunks] <---------- [ComponentManager]    |
|                                                                                                         |
|  [SystemScheduler] ---------> [DAG Execution Nodes / Priority Queues] <---------- [TaskScheduler]        |
+---------------------------------------------------------------------------------------------------------+
|                                          CORE SUBSYSTEMS                                                |
+-------------------------+-------------------------+-------------------------+---------------------------+
|     HORROR DIRECTOR     |     SANITY DIRECTOR     |     WORLD PARTITION     |    PERFORMANCE & TELEMETRY|
|  (Pacing/Stress/Tension)|  (Hallucinations/Visual)|  (Streaming Grid/Cells) |  (FrameProfiler/GPU/VRAM) |
+-------------------------+-------------------------+-------------------------+---------------------------+
|                                        MEMORY MANAGEMENT                                                |
|  [HeapMonitor]    [ResourceTracker]    [Arena/Frame/Pool Allocators]    [VRAM Cache / Texture Streamer] |
+---------------------------------------------------------------------------------------------------------+
|                                        HARDWARE HAL & DRIVERS                                           |
|       [WebGPU Context / WebGL2 Fallback]       |       [Web Audio API]       |       [Worker Threads]   |
+---------------------------------------------------------------------------------------------------------+
```

---

## 1 — ECS HÍBRIDO (HYBRID ECS)

Para evitar os gargalos tradicionais de herança orientada a objetos (OOP) e maximizar a localidade de cache de CPU e eficiência de envio de chamadas de desenho de GPU, a AbyssEngine utiliza uma arquitetura **ECS Híbrida** inspirada no *Flecs* e no *Unity DOTS*.

### 1.1 Arquitetura e Orquestração
O sistema é dividido em três classes fundamentais, orquestradas sob um `WorldContext` unificado:

1. **EntityManager**: Responsável por alocarIDs numéricos de 64 bits para entidades. Entidades são representadas puramente por IDs únicos integrados com máscara de bits (bitmask) correspondente à sua composição de componentes.
2. **ComponentManager**: Gerencia tabelas de arrays homogêneos e densos para cada tipo de componente. Utiliza armazenamento baseado em **Arquétipos (Archetypes)** — estruturas que agrupam todas as entidades que compartilham a mesma composição exata de componentes em blocos de memória contíguos (`Chunks` de 16KB).
3. **SystemScheduler**: Um escalonador baseado em **Grafos Direcionados Acíclicos (DAG)** que determina a ordem de execução dos sistemas com base em suas assinaturas de leitura/escrita de componentes.

```
       [Entidade A] -> (Transform, Render, Light) \
                                                    ---> Arquétipo [Transform, Render, Light] (Chunk 1)
       [Entidade B] -> (Transform, Render, Light) /
       
       [Entidade C] -> (Transform, AI, Sanity)    -----> Arquétipo [Transform, AI, Sanity]    (Chunk 2)
```

### 1.2 Declaração de Componentes (Data-Only Structs)
Nenhum componente possui lógica; são estruturas de dados limpas para maximizar o cache-line:

* **TransformComponent**: `Vector3 position`, `Quaternion rotation`, `Vector3 scale`, `Matrix worldMatrix`.
* **RenderComponent**: `AssetID meshID`, `MaterialID materialID`, `uint32_t instancingID`, `uint8_t shadowCastingMode`.
* **PhysicsComponent**: `Vector3 velocity`, `Vector3 acceleration`, `float mass`, `float drag`, `uint32_t rigidBodyType`.
* **ColliderComponent**: `BoundingBox localBounds`, `CollisionLayer layer`, `CollisionMask mask`, `uint32_t solverPhase`.
* **AudioComponent**: `AssetID sfxID`, `float volume`, `float pitch`, `uint8_t spatialized`, `PannerNodeConfig spatialParams`.
* **AnimationComponent**: `AssetID skeletonID`, `uint32_t activeClipIndex`, `float playbackSpeed`, `float blendTime`, `float weight`.
* **InteractionComponent**: `float interactionRadius`, `InteractionType type`, `Bitmask preRequisites`, `uint8_t isTriggerActive`.
* **AIComponent**: `BehaviorState state`, `float alarmLevel`, `Vector3 lastKnownTargetPos`, `float pathfindingCooldown`.
* **InventoryComponent**: `ItemID items[32]`, `uint16_t itemQuantities[32]`, `uint16_t activeSlot`.
* **QuestComponent**: `QuestID activeQuestID`, `uint16_t objectiveProgress`, `QuestState state`.
* **HealthComponent**: `float currentHp`, `float maxHp`, `uint8_t invulnerabilityFrames`.
* **SanityComponent**: `float level` (0-100), `float degradationRate`, `float recoveryCooldown`.
* **StressComponent**: `float currentStress`, `float accumulationSpeed`, `float recoveryThreshold`.
* **FearComponent**: `float fearIntensity`, `float adrenalineBoost`, `uint32_t activeFearModifiers`.
* **VisibilityComponent**: `uint8_t isVisible`, `float cullingRadius`, `uint32_t occlusionQueryID`.
* **LODComponent**: `uint8_t currentLOD`, `float distanceOverride`, `float lodThresholds[4]`.
* **StreamingComponent**: `GridCoord cellCoord`, `uint8_t streamPriority`, `StreamingState state`.
* **NetworkComponent**: `uint32_t networkID`, `uint8_t replicationType`, `float interpolationDelay`.
* **SaveComponent**: `Bitmask dirtyFields`, `uint8_t serializationPriority`.
* **LightComponent**: `LightType type`, `Color color`, `float intensity`, `float range`, `float shadowBias`.
* **ParticleComponent**: `AssetID systemID`, `uint32_t maxParticles`, `float emissionRate`, `ParticleEmitterShape shape`.
* **CinematicComponent**: `AssetID sequenceID`, `float sequenceTime`, `uint8_t cameraFocusEntity`.
* **DialogueComponent**: `DialogueID activeTreeID`, `uint32_t currentNodeIndex`, `float textCharRate`.
* **MetadataComponent**: `char entityName[32]`, `uint32_t categoryTag`, `uint32_t editorUUID`.

### 1.3 Catálogo de Sistemas Core
* **RenderSystem**: Envia e atualiza instâncias de malhas de renderização, lê `RenderComponent` e `TransformComponent`, calcula oclusão e submete dados para o buffer da GPU.
* **AISystem**: Executa árvores de decisão em paralelo, atualiza estados comportamentais em `AIComponent`.
* **PhysicsSystem**: Resolve equações de movimento linear, detecção de colisões de AABB/OBB de forma asíncrona em blocos contíguos de memória.
* **InventorySystem**: Processa a validação de uso, ordenação e acoplagem de itens em `InventoryComponent`.
* **InteractionSystem**: Executa varreduras espaciais baseadas em octree para interações próximas ao jogador.
* **AudioSystem**: Modula fontes de som baseadas no posicionamento 3D no `AudioComponent`.
* **AnimationSystem**: Realiza blending e deformações de esqueletos via shaders na GPU, lendo `AnimationComponent`.
* **QuestSystem**: Valida o progresso de conquistas, metas do roteiro e progresso de diários.
* **EventSystem**: Dispara ações baseadas em mudanças de horários globais e gatilhos lógicos sazonais.
* **StreamingSystem**: Carrega e descarrega pedaços (`chunks`) de mapas com base no deslocamento.
* **LightingSystem**: Recalcula volumes de iluminação estática e altera propriedades de luzes dinâmicas.
* **SanitySystem**: Monitora e degrada a sanidade do jogador com base em fatores de luz e exposição visual de entidades assustadoras.
* **FearSystem**: Altera o batimento cardíaco físico e ruídos respiratórios e reduz velocidade de corrida.
* **HallucinationSystem**: Injeta falsas entidades dinâmicas ao redor do jogador e deforma geometria e renderização de shaders de pós-processamento.
* **SaveSystem**: Serializa dados de forma delta (apenas campos alterados/dirty) para armazenamento de estado de salvamento.
* **NetworkSystem**: Replica estados locais de entidades prioritárias (quando habilitado).
* **AnalyticsSystem**: Coleta métricas operacionais silenciosas e incidentes críticos de performance.
* **PerformanceSystem**: Monitora budgets de frames e gerencia o nível de detalhamento (LOD) dinâmico global.
* **CinematicSystem**: Trava os controles e deforma trajetórias de câmera baseadas em splines para trechos narrativos do jogo.

### 1.4 Benefícios de Cache, Agendamento e Paralelização
* **Cache Locality**: Como os dados dos componentes são salvos em arrays densos em vez de coleções esparsas referenciadas por ponteiros, os sistemas leem dados sequencialmente na memória RAM física. Isso reduz o índice de *L1/L2 cache misses* a quase zero.
* **DAG Scheduler**: O escalonador valida sistemas com dependências de gravação de dados idênticas. Se o `PhysicsSystem` escreve em `TransformComponent` e o `AISystem` lê de `TransformComponent`, o scheduler os encadeia sequencialmente. Sistemas sem dependências diretas (ex: `AudioSystem` e `QuestSystem`) são executados em paralelo em diferentes threads (Web Workers).
* **Worker Compatibility**: A engine distribui a carga pesada de cálculo matricial para *Web Workers*, tirando a concorrência direta com a thread principal de renderização.

---

## 2 — GERENCIAMENTO DE MEMÓRIA (MEMORY MANAGEMENT)

A AbyssEngine é projetada para ser completamente estável e livre de flutuações de performance causadas pelo *Garbage Collector* (GC) em aplicações JavaScript/TypeScript WebGL ou WebGPU.

```
       +-------------------------------------------------------------+
       |                        MEMORY MANAGER                       |
       +-------------------------------------------------------------+
       |   [Arena Allocator] -> Usado para dados de carregamento     |
       |   [Frame Allocator] -> Alocações temporárias limpas por frame|
       |   [Pool Allocator]  -> Reaproveita Entities, Particles, SFX |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                      RESOURCE MONITOR                       |
       +-------------------------------------------------------------+
       |   * Heap Monitor        * CPU Fragmentation Heatmap         |
       |   * VRAM GPU Tracker    * Background GC Mitigation          |
       +-------------------------------------------------------------+
```

### 2.1 Allocators Especializados (Zero-GC Pattern)
* **ArenaAllocator**: Aloca blocos massivos de memória contígua durante o carregamento de fases para todas as malhas, áudios e texturas da cena. Nenhuma liberação individual de memória ocorre na Arena; todo o bloco é liberado de uma só vez apenas durante a transição de mapas de jogo.
* **FrameAllocator (Double-Buffered)**: Alocadores de pilha lineares e alternados de frame a frame. Usados para todas as strings temporárias, vetores de cálculo dinâmico e arrays de partículas de curta duração. No final de cada frame de processamento, o ponteiro de alocação volta a zero sem o acionamento do GC.
* **StackAllocator**: Utilizado para gerenciar a pilha de estados de jogo, menus, telas e contexto de roteiros.
* **LinearAllocator**: Aloca dados sequenciais simples que têm vida útil estritamente atrelada ao tempo de execução de uma missão curta específica.
* **PoolAllocator**: Coleções de tamanho fixo inicializadas na inicialização da engine. Objetos inativos não são deletados, eles são desativados com flag booleana e redefinidos para reuso imediato.

### 2.2 Pools Estruturados de Objetos Core (Recycle Engines)
* **EntityPool**: Pool fixo de 2.048 IDs de entidades prontas para reuso.
* **ParticlePool**: Pool estático de 25.000 partículas físicas alocadas na memória de shaders da GPU de forma fixa.
* **MonsterPool**: Limite de 32 monstros ativos/em patrulha em memória de simulação simultânea.
* **AudioPool**: Buffer dinâmico de 64 canais da Web Audio API reciclados.
* **ColliderPool**: Buffer contíguo com 1.024 colisores estáticos e dinâmicos para prevenção de alocações na física.
* **AnimationPool**: Buffer de matrizes de esqueletos de deformação 3D.
* **QuestPool**: Estruturas de monitoramento de progresso pré-alocadas.

### 2.3 Métricas, Fragmentação e Monitoramento de VRAM
O `MemoryManager` opera um loop de auditoria contínua que rastreia:
* **CPU Heap Analytics**: Medição de taxa de alocação por milissegundo. Aciona alertas visuais de aviso se a taxa exceder 50KB por frame.
* **VRAM Monitor**: Rastreia texturas e geometries ativas em GPU, operando descarte do pool se o limite máximo da placa do usuário for atingido.
* **Fragmentation Heatmaps**: Gera dados analíticos visuais de blocos livres vs blocos ocupados no heap e realiza auto-limpeza em segundo plano (`Background Cleanup`) em momentos de baixa atividade do jogador.

---

## 3 — WORLD PARTITION & STREAMING

Inspirado no sistema de *World Partition* do Unreal Engine 5 e nas técnicas de streaming espacial do *Decima Engine*, a AbyssEngine divide o mundo tridimensional em uma grade de coordenadas lógica de alta eficiência.

```
       +-----------------------------------------------+
       |             WORLD PARTITION GRID              |
       +-----------------------------------------------+
       |  Cell (X:0, Y:1)  |  Cell (X:1, Y:1)  |  ...  |
       |  [Active/Loaded]  |  [Predictive Load]|       |
       |-------------------+-------------------+-------|
       |  Cell (X:0, Y:0)  |  Cell (X:1, Y:0)  |  ...  |
       |  [Player Position]|  [Cached Static]  |       |
       +-----------------------------------------------+
                               |
                               v
       [Background Worker] -> Carrega dados .GLB/.DDS via cache offline 
       [LOD Dynamic Switch] -> Alterna resoluções baseado na distância
```

### 3.1 Estrutura de Divisão e Células
* **WorldGrid**: Divisão bidimensional ou tridimensional infinita em células quadradas de 64 metros (células de grade ajustáveis por mapa).
* **StreamingCells**: Unidade lógica que contém todas as entidades estáticas, geometrias de terreno, decorações procedurais e pontos de interesse estáticos daquela célula espacial.
* **StreamingVolumes**: Regiões espaciais desenhadas manualmente que, se cruzadas, forçam o carregamento de células associadas mesmo fora do raio de visão do jogador (ex: túneis fechados, portas de acesso de transição).
* **ChunkManager**: Consolida dados estruturados em pacotes compactados binários de fácil download e descompactação em threads separadas.
* **SectorManager & RegionManager**: Níveis hierárquicos superiores que ditam as atmosferas, regras climáticas e de iluminação dos ambientes.

### 3.2 Predictive Streaming e Gestão de Cache
A engine rastreia a velocidade linear do jogador e seu vetor de olhar (*view frustum*). Usando essa telemetria, o `PredictiveStreaming` calcula a probabilidade do jogador cruzar os limites das células de grade vizinhas nos próximos 5 a 10 segundos, ordenando o carregamento assíncrono antecipado dessas células em prioridade (`BackgroundStreaming`).
* **DynamicChunkActivation**: Se o jogador corre rápido, a engine aumenta a velocidade de varredura e prioriza o download de malhas de colisão críticas sobre texturas de alto detalhe.
* **CellCaching**: Células visitadas recentemente continuam armazenadas no pool de memória por até 45 segundos após a saída do jogador para evitar fenômenos de "flickering" se o jogador andar de trás para frente rapidamente.

---

## 4 — HORROR DIRECTOR (DIRETOR DE TERROR)

Inspirado no aclamado sistema de IA comportamental de *Alien Isolation* e no Pacing Director de *Left 4 Dead*, o `HorrorDirector` monitora constantemente a experiência emocional e a fadiga do jogador para ditar a frequência e a intensidade de sustos, barulhos e encontros.

### 4.1 Telemetria e Monitoramento de Tensão
O Diretor de Horror coleta dados do `WorldContext` de forma ininterrupta:
* **Tempo no escuro**: Rastreia se a lanterna do jogador está ligada ou se o jogador está em penumbra total.
* **Proximidade de ameaças**: Mede a distância entre a entidade do monstro (`Thorne`) e o jogador.
* **Sanidade e Stress**: Lê as propriedades de `SanityComponent` e `StressComponent` do jogador.
* **Estilo de jogo**: Detecta se o jogador usa muito esconderijos (armários/embaixo de camas), se corre excessivamente ou se comete erros frequentes de inventário ou navegação.
* **Ruídos produzidos**: Intensidade de passos e derrubada de objetos.

### 4.2 Estados do Loop de Ritmo (Pacing Loop SM)
```
          +------------+        Tensão Máxima        +------------+
          |  BUILD-UP  | --------------------------> | PEAK STATE |
          +------------+                             +------------+
                ^                                           |
                | Tempo sem Eventos                         | Perseguição Concluída
                |                                           v
          +------------+                             +------------+
          |  REPRIEVE  | <-------------------------- | FADE STATE |
          +------------+        Fase de Descanso     +------------+
```

1. **Build-Up (Construção)**: O Diretor de Horror injeta barulhos esporádicos, faz portas rangerem, lâmpadas piscarem e move o monstro para áreas adjacentes à posição do jogador para criar a sensação de "ameaça invisível".
2. **Peak (Pico)**: A tensão atinge o limite máximo projetado. O monstro é direcionado explicitamente à posição do jogador, provocando um momento tenso de busca ou perseguição direta.
3. **Fade (Arrefecimento)**: Após a fuga do jogador ou um esconderijo bem-sucedido, o Diretor retira a presença agressiva do monstro, guiando-o para dutos de ventilação distantes ou corredores de outro setor.
4. **Reprieve (Descanso)**: Uma fase de calma absoluta de 60 a 120 segundos, onde o jogador pode ler documentos, reorganizar o inventário e explorar sem o perigo iminente de morte. Isso previne o esgotamento da experiência do jogador.

### 4.3 Gatilhos Procedurais de Terror
* **Ações Indiretas**: Ativação de pequenos tremores físicos em objetos de física dinâmicos, quebra de canos com vapor, abertura forçada de armários distantes.
* **Manipulação Ambiental**: Apagamento de luzes em setores inteiros, travamento procedural temporário de portas que antes estavam destrancadas.
* **Efeitos de Áudio Fantasmas**: Injeção de sussurros distantes nas paredes e som artificial de passos atrás do jogador que desaparecem quando ele olha para trás.

---

## 5 — SANITY DIRECTOR (DIRETOR DE SANIDADE)

O `SanityDirector` gerencia a deterioração mental do jogador sob um prisma de horror psicológico, alterando diretamente a fidelidade geométrica, paleta de cores e renderização gráfica da engine de forma procedural.

```
       +-----------------------------------------------------------+
       |                      SANITY DIRECTOR                      |
       +-----------------------------------------------------------+
       |   NÍVEL 1: ESTÁVEL    -> Sem efeitos visuais              |
       |   NÍVEL 2: ANSIOSO    -> Sussurros sutis nas bordas       |
       |   NÍVEL 3: PERTURBADO -> Geometria se deforma levemente   |
       |   NÍVEL 4: INSTÁVEL   -> Alucinações de monstros fantasmas|
       |   NÍVEL 5: PANIC/COLLAPSE -> Perda total de cores/Sombra   |
       +-----------------------------------------------------------+
```

### 5.1 Estados da Escala de Sanidade
* **Estável (90% - 100%)**: Renderização e áudio perfeitamente limpos e nítidos.
* **Ansioso (70% - 89%)**: As bordas da tela começam a perder saturação cromática. Efeitos de aberração cromática e respiração de câmera são aplicados sutilmente na viewport.
* **Perturbado (40% - 69%)**: Injeção de áudios binaurais aleatórios nos fones do jogador (passos que copiam seu tempo de caminhada, sussurros sussurrando o nome do jogador). Objetos e retratos nos cenários sofrem mutações visuais temporárias se observados em ângulos oblíquos.
* **Instável (15% - 39%)**: Portas fantasmagóricas aparecem no cenário, sumindo quando o jogador se aproxima. Corredores podem parecer esticar de forma procedural com a distorção do FOV de câmera (*Vertigo Effect*). Bonecos anatômicos ou manequins giram a cabeça em direção ao jogador se ele piscar a lanterna.
* **Colapso Mental / Pânico (0% - 14%)**: Sombra profunda limita a visão do jogador a apenas 3 metros ao redor. monstros falsos (que cruzam paredes e não causam dano real, mas induzem reações físicas de medo) correm na direção do jogador de forma agressiva. A tela perde completamente a cor, restando apenas pretos contrastados e um canal vermelho sangue vívido.

### 5.2 Efeitos Procedurais e Shaders Psicológicos
* **Lens Distortion & Vignette Shaders**: Modula a distorção óptica simulando taquicardia e desespero.
* **Temporal Geometrical Jitter**: Aplica uma oscilação na matriz de projeção 3D dos objetos, fazendo com que paredes e portas pareçam "respirar" ou tremer levemente.

---

## 6 — TASK SCHEDULER & WORKER POOL

Para obter uma renderização fluida e de baixa latência em navegadores modernos, a AbyssEngine executa um modelo de computação concorrente usando a técnica de **Work-Stealing Task Scheduler** e micro-alocações em múltiplos núcleos de CPU via *Web Workers*.

```
       [Main Render Thread] (60 FPS / Budget de 16.6ms)
              |
              +---> [TaskScheduler] --- (Work-Stealing Queue)
                         |
                         +---> [AI Worker Thread]
                         +---> [Streaming Worker Thread]
                         +---> [Physics/Colision Worker]
                         +---> [Audio/Analytics Worker]
```

### 6.1 Distribuição de Workers Dedicados
* **AI Workers**: Calculam de forma asíncrona os caminhos (*A* Pathfinding*) das entidades através da malha de navegação (NavMesh) e atualizam estados de comportamento das IAs sem travar o loop visual.
* **Streaming Workers**: Fazem o download assíncrono de dados, parse de arquivos `.GLB`, descompactação de malhas binárias e compressão de texturas `.DDS`.
* **Physics/Collision Workers**: Executam a simulação dinâmica de corpos rígidos e varreduras espaciais de colisão em segundo plano.
* **Audio/Analytics Workers**: Processam equalizações avançadas de canais da Web Audio API e agrupam pacotes de telemetria para envio seguro em segundo plano.

### 6.2 Frame Budgeting (Microsecond Allocation)
A engine reserva estritamente orçamentos de tempo para cada fase do frame da thread principal (com base em um frame completo de 16.6ms para renderizar em 60 FPS estáveis):
* **Física & Colisão**: Max 2.5ms por frame.
* **Lógica ECS & Sistemas**: Max 3.0ms por frame.
* **Animações (Skeletons)**: Max 1.5ms por frame.
* **Renderização (Draw Calls Submission & Occlusion)**: Max 5.5ms por frame.
* **Reservado para Sistema Operacional/Navegador**: 4.1ms.

Se a execução de um sistema específico ultrapassar seu budget alocado, o `TaskScheduler` suspende a execução daquela tarefa não-essencial, guardando seu estado para ser finalizado no início do próximo frame do ciclo, evitando quedas de frames bruscas (*stutters*).

---

## 7 — PERFORMANCE MONITOR & TELEMETRIA

O `PerformanceMonitor` é responsável pelo rastreio detalhado e telemetria profunda da engine em tempo real. Ele gera insights cruciais exibidos diretamente na aba do painel administrativo do CMS.

```
       +-----------------------------------------------------------+
       |                      TELEMETRY DASHBOARD                  |
       +-----------------------------------------------------------+
       |   FPS: 59.8 | FrameTime: 16.2ms | VRAM Alloc: 1.2 GB/2.0GB|
       |   Occluded Meshes: 1,420 | Active DrawCalls: 124          |
       |   -----------------------------------------------------   |
       |   [Frame Spike Warning] -> Bloqueio de 4ms detectado no   |
       |   carregamento assíncrono de 'Asylum_EastWing_C3'         |
       +-----------------------------------------------------------+
```

### 7.1 Métricas de Captura e Profilers
* **FrameProfiler & FrameTime Graph**: Mede a variação exata entre frames em microssegundos. Identifica spikes de renderização de forma instantânea.
* **GPUProfiler & Draw Call Counters**: Rastreia a quantidade de primitivas desenhadas, triângulos processados e texturas ativas em cache de render.
* **MemoryGraph**: Exibe as curvas dinâmicas de consumo de CPU Heap e o consumo estimado de VRAM da placa de vídeo de forma gráfica na viewport.
* **BenchmarkMode & Stress Testing**: Executa rotinas sintéticas repetitivas (disparando spawns de 1.000 partículas físicas e movimentando 20 monstros de IA ao mesmo tempo) para analisar a estabilidade da máquina do jogador no nível máximo suportado de estresse computacional.

---

## 8 — SCRIPTING SYSTEM (GRAFO DE ROTEIRIZAÇÃO)

A AbyssEngine adota um modelo de execução de roteiros baseados em dados estruturados (JSON/YAML) interpretados por uma máquina de estados virtual interna (`ScriptRuntime`), dispensando a compilação ou injeção perigosa de código JavaScript direto no navegador.

```
       +---------------------------------------------------------------+
       |                      SCRIPT RUNTIME GRAPH                     |
       +---------------------------------------------------------------+
       |                                                               |
       |  [Gatilho: Porta Trancada] ---> (Se Chave_Azul em Inventário) |
       |                                           |                   |
       |                                           +--> [Sim] -> Abrir |
       |                                           +--> [Não] -> Fala  |
       |                                                               |
       +---------------------------------------------------------------+
```

### 8.1 Representações Gráficas Estruturadas
O roteiro do jogo é completamente editável no CMS e gerado sob a forma de grafos que conectam nós de decisão, condicionais e de ação:
* **BehaviorGraphs**: Determinam os pesos de reação e tomada de decisão das IAs do jogo.
* **DialogueGraphs**: Grafos ramificados com condicionais de inventário para diálogos textuais.
* **EventGraphs**: Controlam as sequências procedurais de luzes, ativação de gatilhos físicos e monstros baseadas em progresso do jogador.

### 8.2 Hot Reloading e Runtime Patching
Como os arquivos de script são lidos de forma reativa pelo interpretador da engine, mudanças salvas no CMS refletem instantaneamente no jogo rodando em tempo real. Se o designer altera as probabilidades de drop de uma caixa de ferramentas, a engine altera o valor em memória no exato instante da edição, sem reiniciar o sandbox de simulação em execução do cliente.

---

## 9 — MODDING FRAMEWORK (SISTEMA DE MODS)

Projetado de forma nativa e segura para permitir que criadores de conteúdo expandam o jogo com novos assets, mapas, monstros e roteiros originais sem alterar o núcleo de arquivos estáticos da engine.

### 9.1 Asset Override & Sandbox de Execução
O `ModManager` opera em um sistema de camadas de montagem de arquivos virtualizado. Quando um Mod está habilitado:
1. Ele registra um dicionário de rotas com mapeamento de `AssetIDs`.
2. Se a engine tenta carregar a textura `textures/monsters/thorne_skin.dds`, o `AssetOverride` desvia a requisição do arquivo original do jogo para apontar para a textura modificada correspondente no pacote de Mod instalado pelo criador.
3. **SecuritySandbox**: Os scripts e roteiros dos mods passam por validações sintáticas rígidas para impedir chamadas nativas ao navegador, como acesso a cookies, injeções de HTML perigosas ou chamadas HTTP externas sem permissão, isolando as permissões da engine com o host de forma segura.

---

## 10 — PREPARAÇÃO DE ARQUITETURA MULTIPLAYER (DESABILITADA)

**IMPORTANTE:** O multiplayer está completamente desabilitado e inativo no build de produção atual, mas a engine possui todos os esqueletos estruturais criados para garantir compatibilidade futura simples.

```
       +------------------------------------------------------------+
       |                  NETWORK REPLICATION LAYER                 |
       +------------------------------------------------------------+
       |   [ReplicationGraph]  -> Otimiza rotas de sincronia        |
       |   [PredictionLayer]   -> Interpolação local para suavizar  |
       |   [LagCompensation]   -> Rollback de frames para latência  |
       +------------------------------------------------------------+
       |                   * MULTIPLAYER DISABLED *                 |
       +------------------------------------------------------------+
```

### 10.1 Esqueleto Arquitetural Preparatório
* **NetworkLayer**: Gerenciador que decodifica pacotes estruturados que trafegam em canais de transporte WebRTC/WebSocket de baixíssima latência.
* **ReplicationManager & ReplicationGraph**: Agrupa entidades que compartilham o `NetworkComponent` e decide quais parâmetros devem ser enviados de forma prioritária baseado na proximidade visual entre as conexões.
* **PredictionLayer & Rollback Support**: Permite a execução local e imediata de movimentos do jogador local, resolvendo divergências vindas do servidor de forma suave por interpolação em segundo plano.

---

## 11 — INTEGRAÇÃO TOTAL COM O CMS (V2.4.0)

A AbyssEngine é projetada para ser completamente controlada sem a edição de código de programação. Abaixo está detalhado como cada módulo exposto no CMS (Etapa 4) mapeia diretamente para variáveis de controle da Engine (Etapa 5):

| Módulo do CMS (Etapa 4) | Variáveis e Componentes Mapeados na Engine (Etapa 5) | Evento em Tempo Real / Efeito Prático na Engine |
| :--- | :--- | :--- |
| **Monster Editor** | `AIComponent.aggressiveness`<br>`AIComponent.speed`<br>`AudioComponent.screechSfx`<br>`AudioComponent.footstepSfx`<br>`AIComponent.behaviorNodes` | Altera instantaneamente os pesos de decisão do inimigo e troca o arquivo de áudio carregado no player 3D na Web Audio API em tempo de execução. |
| **Skin Editor** | `RenderComponent.materialID`<br>`LODComponent.lodThresholds`<br>`PBRMaterialProperties.roughness`<br>`PBRMaterialProperties.metallic`<br>`PBRMaterialProperties.emissiveIntensity` | Altera os inputs numéricos dos uniformes do shader PBR dinamicamente na GPU, recarregando novos mapas de relevo ou texturas. |
| **Map Editor** | `WorldPartition.WorldGrid`<br>`ColliderComponent.bounds`<br>`TransformComponent.position`<br>`LightComponent.range`<br>`LightComponent.intensity`| Cria entidades de spawn, volumes físicos de gatilho, portas e luzes de cena. O mapa recalcula sua octree local de forma síncrona. |
| **Audio Editor** | `AudioComponent.volume`<br>`EqualizerNodeBands.bass`<br>`EqualizerNodeBands.mid`<br>`EqualizerNodeBands.treble`<br>`MasterVolume` | Ajusta as propriedades de ganho e filtro de frequência do nó central da Web Audio API em tempo real. |
| **Event Editor** | `EventSystem.activeSeasonalEventID`<br>`QuestComponent.lootModifier`<br>`QuestComponent.lootTable` | Altera a rotina de drop de itens no jogo em tempo real através da aplicação de multiplicadores estáticos nas tabelas de probabilidade. |

---

## 12 — RENDER PIPELINE & OTIMIZAÇÕES AVANÇADAS

Para entregar visuais tridimensionais fidedignos em navegadores de computadores portáteis e desktops antigos, o pipeline de renderização da AbyssEngine é estruturado da seguinte forma:

```
    [Geometria / Modelos 3D] 
              |
              v
    [Frustum Culling & Octree Sweep] -> Ignora o que está atrás da câmera
              |
              v
    [Hardware Occlusion Queries] -> Oculta modelos obstruídos por paredes
              |
              v
    [GPU Instancing Merge] -> Combina elementos idênticos em uma única Draw Call
              |
              v
    [Defered Rendering / G-Buffer] -> Renderiza buffers (Color, Normal, Depth)
              |
              v
    [Post-Processing & Custom Shaders] (CRT Filter, Sanity Vignette, Film Grain)
              |
              v
    [Submissão do Frame Final para Viewport]
```

### 12.1 Tecnologias de Renderização e WebGPU Readiness
* **Deferred Rendering Pipeline (WebGL2 / WebGPU Native)**: Separa os passes de renderização de geometria da iluminação. Isso permite que a cena possua mais de 100 fontes de luz ativas, já que o custo computacional de iluminação é calculado por pixel em espaço de tela (*screen-space*), em vez de ser calculado por objeto.
* **GPU Instancing**: Itens idênticos repetidos em massa nos cenários (cadeiras, canos, lâmpadas, portas, detritos metálicos) são mesclados automaticamente para serem desenhados em uma única chamada de desenho (*Draw Call*), eliminando gargalos de comunicação entre a CPU e a GPU do navegador.
* **Asset Streaming Compression Pipeline**: Texturas são convertidas e transmitidas no formato binário comprimido nativo das placas de vídeo (KTI/DDS/ETC2). Isso reduz o uso de largura de banda de rede para downloads em 75% e permite o upload direto da textura para a placa de vídeo de forma instantânea, sem a necessidade de descompactar texturas em formato PNG/JPG no processador do usuário.
* **Occlusion Culling (Hardware Queries)**: Paredes grossas ou salas inteiras que estão localizadas atrás de portas fechadas ou paredes opostas têm suas malhas e geometrias ignoradas da renderização antes do início do frame, poupando poder de processamento vital da GPU do usuário.

---
*Fim da Especificação de Engenharia Core. Todos os subsistemas mapeiam-se de forma direta com o sistema de interface atualizado e o painel de visualização e telemetria do CMS da AbyssEngine.*
