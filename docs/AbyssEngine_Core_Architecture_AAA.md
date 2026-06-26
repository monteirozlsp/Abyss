# PROJECT ABYSS — ABYSSENGINE CORE ARCHITECTURE (v1.0.0)
**Documento de Especificação de Arquitetura, Kernels, Sistemas de Gerenciamento e Ciclos de Vida da Engine AAA**  
**Autor:** Principal Engine Architect & Tech Lead  
**Status:** Implementado & Aprovado para Código (Production Ready)

---

## 1 — ARQUITETURA DE SISTEMAS DA ABYSSENGINE CORE

A **AbyssEngine Core** é projetada como um microkernel altamente desacoplado, utilizando o padrão de **Injeção de Dependências (DI)** e um barramento central de eventos (**EventBus**) para orquestração de subsistemas. Isso garante máximo desempenho de CPU e prevenção de Garbage Collection (GC) sob intensidade crítica de quadros.

```
                  ┌─────────────────────────────────┐
                  │          AbyssEngine            │
                  └────────────────┬────────────────┘
                                   │ Orquestra
                  ┌────────────────▼────────────────┐
                  │          Kernel (Core)          │
                  └────────────────┬────────────────┘
                                   │ Inicializa em Ordem
                  ┌────────────────▼────────────────┐
                  │   ServiceContainer (DI Registry)│
                  └────────┬───────┬────────┬───────┘
                           │       │        │
      ┌────────────────────┘       │        └─────────────────────┐
      ▼                            ▼                              ▼
┌──────────────┐             ┌──────────────┐              ┌──────────────┐
│   EventBus   │             │  Scheduler   │              │MemoryManager │
│  (Pub/Sub)   │             │ (Task Loop)  │              │ (GC Blocker) │
└──────────────┘             └──────────────┘              └──────────────┘
      │                            │                              │
      ▼                            ▼                              ▼
┌──────────────┐             ┌──────────────┐              ┌──────────────┐
│ AssetManager │             │ SceneManager │              │ WorldManager │
│ (CDN Cache)  │             │ (Scene Stack)│              │ (Part Grid)  │
└──────────────┘             └──────────────┘              └──────────────┘
      │                            │                              │
      ▼                            ▼                              ▼
┌──────────────┐             ┌──────────────┐              ┌──────────────┐
│ SaveManager  │             │AnalyticsMgr  │              │ PluginManager│
│ (Encryption) │             │ (Telemetry)  │              │ (Sandboxes)  │
└──────────────┘             └──────────────┘              └──────────────┘
                           ┌────────────────┐
                           │ WorkerManager  │
                           │  (Off-thread)  │
                           └────────────────┘
```

---

## 2 — ESPECIFICAÇÕES TÉCNICAS DOS SUBSISTEMAS CORE

### 2.1 — KERNEL & SERVICE CONTAINER (DI & BOOTSTRAP)
O `Kernel` é o coração inicializador da engine. Ele instancia o `ServiceContainer` que serve como o registro centralizado de dependências, permitindo que qualquer subsistema se comunique sem acoplamento estático direto.
* **Ciclo de Vida**:
  1. O container registra as classes concretas que implementam as interfaces sob ids unificados.
  2. O Kernel dispara o método assíncrono `.init()` de cada serviço em ordem exata de dependência topológica.
  3. No encerramento, o Kernel reverte a ordem chamando `.shutdown()` para garantir persistência limpa de buffers.

### 2.2 — EVENT BUS (EVENT REPLICATION BAR)
Barramento de eventos com assinaturas reativas baseado no padrão Pub/Sub de altíssima performance. Permite que componentes de jogabilidade como danos, interações e iluminação publiquem feeds sem acoplamento com managers de som ou conquistas.
* **Segurança**: Retorna funções de fechamento de escopo (Closures) de unsubscription automáticas para evitar vazamentos de memória (Memory Leaks).

### 2.3 — SCHEDULER (TICK SYSTEM)
Substitui loops genéricos e múltiplos `setInterval` por uma fila de tarefas ordenada por **prioridade estrita**.
* Executa micro-tarefas sob demanda de ticks estáveis.
* Clampa deltas de tempo em abas suspensas para mitigar quebras de colisões e física.

### 2.4 — MEMORY MANAGER (PRE-ALLOCATED POOLS)
O maior inimigo de jogos rodando em WebGL2/WebGPU é a pausa para coleta de lixo (Garbage Collection). O `MemoryManager` soluciona isso implementando:
* Pre-alocação de `ArrayBuffers` brutos de memória para estruturas binárias.
* Reaproveitamento de objetos em Pools estáveis por tipo de entidade (Ex: partículas, projéteis).

### 2.5 — ASSET MANAGER (STREAMING CACHE)
Gerenciador assíncrono encarregado do carregamento e contagem de referências de geometrias, texturas (KTX2) e arquivos de áudio espacializados.
* Implementa carregamento preguiçoso (*lazy loading*).
* Controle de contagem de referências (`refCount`). Libera o objeto da VRAM e RAM quando a contagem atinge zero.

### 2.6 — SCENE MANAGER (SCENE STACK)
Gerencia transições de estados globais (Menu Principal, Cutscenes, Níveis do Abyss).
* Garante limpeza estrita de memórias do nível anterior antes de iniciar o carregamento assíncrono dos novos shaders e geometrias.

### 2.7 — WORLD MANAGER (PARTITIONING & STREAMING GRID)
Divisão espacial do mapa do jogo em uma grade bidimensional ou tridimensional (Grid de Células).
* Realiza o streaming assíncrono em tempo real de objetos 3D e colisões conforme a posição de coordenadas polares do jogador.
* Limita queries de física e IA apenas para as células ativas carregadas no raio de ação do player.

### 2.8 — SAVE MANAGER (STATE DELTAS)
Gerenciador encarregado de sincronizar e salvar estados como HP, sanidade, nível de estresse e posições geográficas de inventários em payloads compactos de JSON no LocalStorage ou via conexões de banco de dados na Cloud.

### 2.9 — ANALYTICS MANAGER (TELEMETRY BUFFER)
Fila local de telemetria otimizada para conexões de baixa latência. Agrupa logs em lotes (*batching*) e despacha no formato de buffer binário ou texto de alta densidade diretamente para o gateway analítico de banco de dados do ClickHouse.

### 2.10 — PLUGIN & MODULE LOADER (MODDING SANDBOX)
Permite a modificação profunda do jogo via injeção dinâmica de scripts Javascript/TypeScript (*ES Modules*) em ambientes controlados.
* Isolamento de escopo e instalação limpa de sistemas terceiros em tempo de execução sem requerer novas compilações do código core.

### 2.11 — RUNTIME & WORKER MANAGER (OFF-THREAD PROCESSING)
Executa operações pesadas da engine fora da thread principal de renderização da UI (CPU Main Thread), delegando tarefas para um pool otimizado de **Web Workers** rodando em paralelo em threads nativas de hardware.
* **Tarefas delegadas**: Geração de NavMesh estático, algoritmos de detecção de caminho (A* Pathfinding), descompressão de patches e decodificação de áudio ambiente abissal.

---

## 3 — REGRAS DE INTEGRAÇÃO DO PROCESSO DE COMPILAÇÃO

Todos os arquivos de código implementados no diretório `/src/core/` estão 100% integrados à estrutura do monorepo, utilizando tipos estritos de TypeScript para eliminação precoce de erros em tempo de build, garantindo compatibilidade multiplataforma nativa.
