# PROJECT ABYSS — MULTIPLAYER ARCHITECTURE DOCUMENT (v2.4.0)
**Especificação Técnica AAA de Sistemas de Rede, Sincronização e Jogabilidade Cooperativa**  
**Autor:** Lead Network Engineer & Principal Multiplayer Systems Designer  
**Status da Especificação:** Aprovada para Implementação de Fase Co-op ( GTFO / Lethal Company / Phasmophobia / R.E.P.O. Ready )

---

## VISÃO GERAL DO SUBSISTEMA MULTIPLAYER (CO-OP HORROR)
A arquitetura multiplayer da **AbyssEngine v2.4.0** foi projetada sob o paradigma **Servidor-Autoritativo com Previsão do Cliente** (*Server-Authoritative with Client-Side Prediction*), com foco absoluto em cooperação tática, comunicação dielógica reativa e replicação de altíssima fidelidade com baixas tolerâncias de latência. O sistema é estruturado para suportar sessões cooperativas de 1 a 4 jogadores, garantindo escalabilidade de desempenho em redes residenciais padrão através de compressão extrema de payload binário e zoneamento espacial de replicação (*Replication Graph*).

```
+---------------------------------------------------------------------------------------------------------+
|                                    ABYSS CO-OP MULTIPLAYER FRAMEWORK                                    |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [Lobby & Server Browser] <===> [VoiceChat (Binaural WebRTC)] <===> [Co-op Systems (Shared Objectives)]  |
|             |                                                                 |                         |
|             v                                                                 v                         |
|    [NetworkLayer (WebRTC)] <===> [Replication & Physics Sync] <===> [Lag Compensation / Predictor]       |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
|                                        AUTHORITATIVE SERVER HOST                                        |
|             [Replication Graph]  <--->  [Anti-Cheat Filter]  <--->  [Dedicated Server Controller]        |
+---------------------------------------------------------------------------------------------------------+
```

---

## 1 — LOBBY, MATCHMAKING E SERVIDORES DEDICADOS (LOBBY ENGINE)

O sistema de gerenciamento de sessões do *Project Abyss* lida com o ciclo de vida das partidas, desde a formação do grupo inicial no menu principal até a alocação de hardware dedicado na nuvem.

```
       +---------------------------------------------------------------+
       |                     LOBBY SELECTION FLOW                      |
       +---------------------------------------------------------------+
       |                                                               |
       |  [Player Group] ----> [Matchmaking / Quick Match]             |
       |                             |                                 |
       |                             v                                 |
       |  [Server Allocation] -> [Dedicated Server (Kubernetes)]       |
       |                             |                                 |
       |                             v                                 |
       |  [Join Session] ------> [Active Co-op Lobby Instance]         |
       |                                                               |
       +---------------------------------------------------------------+
```

### 1.1 Party System, Friends e Invites (Estrutura de Grupos)
* **Party Manager (Líder da Party)**:
  * Gerencia o agrupamento local de avatares. O líder da party possui autoridade sobre a seleção do mapa, ativação de mods permitidos na sessão e transição global do grupo.
  * O estado da party é replicado para todos os membros em tempo real usando mensagens estruturadas leves de JSON sobre canais estáveis TCP (WebSockets).
* **Friends & Invites Layer (Abstração de API)**:
  * Camada de interface comum projetada para aceitar integrações com plataformas como Steamworks, Epic Online Services (EOS) ou sistemas de convite direto por URL de navegador (*Deep Linking*).
  * Enviar um convite gera um payload encriptado contendo o ID exclusivo do servidor dedicado e o token de autorização temporária da sala:
    `abyss-invite://session_id=UUID&region=us-east&token=SECURE_HASH`

### 1.2 Private Rooms, Public Rooms e Quick Match (Matchmaking)
* **Public & Private Lobbies**:
  * **Salas Públicas**: São registradas ativamente no catálogo global de sessões, acompanhadas de dados analíticos essenciais como latência (ping), progresso da missão de campanha e status do host.
  * **Salas Privadas**: Ocultadas do catálogo global. O ingresso é restrito a convites diretos ou inserção manual de códigos alfanuméricos gerados no CMS da engine.
* **Quick Match (Matchmaking Engine)**:
  * Agrupa jogadores com base em três filtros de peso decrescente:
    1. **Filtro de Latência / Ping** (Tolerância máxima de 100ms para garantir a integridade da detecção de colisões da IA física).
    2. **Filtro de Idioma / Região** (Para otimização da experiência com bate-papo de voz binaural).
    3. **Filtro de Progresso de Campanha** (Para evitar spoilers ou incompatibilidade de níveis de equipamentos e arsenal com o design de puzzles do setor).
* **Server Browser**:
  * Tabela dinâmica de listagem de sessões ativas com paginação assíncrona. O browser permite ordenar por ping, número de jogadores atuais (1/4) e dificuldade parametrizada.

### 1.3 Dedicated Servers (Orquestração headless)
* **Headless Server Infrastructure**:
  * Para sessões altamente responsivas e prevenção de vantagens indevidas de ping para o host, a engine suporta a execução de builds de servidores "headless" (consolidados em contêineres Docker leves de 60Hz de taxa de simulação).
  * O servidor dedicado executa estritamente a simulação do **ECS Híbrido** (física, pathfinding de IA, lógica de sobrevivência, e validação de triggers), enviando apenas snapshots compactados de transformações de rede para os clientes conectados.

---

## 2 — REPLICAÇÃO E FRAMEWORK DE SINCRONIZAÇÃO (REPLICATION SUITE)

Para garantir que a movimentação do monstro principal e os efeitos procedurais de colisão física operem de forma idêntica para todos os sobreviventes do grupo, a engine emprega uma suíte robusta de replicação de estados.

```
       +---------------------------------------------------------------------+
       |                        REPLICATION GRAPH PIPELINE                   |
       +---------------------------------------------------------------------+
       |                                                                     |
       |  [ECS Authority State] ----> [Dirty Bits Check (Delta Compresion)]   |
       |                                           |                         |
       |                                           v                         |
       |  [Network Buffer (60Hz)] <---> [Replication Priority / Distance]    |
       |                                           |                         |
       |                                           v                         |
       |  [Client Viewports] <========= [Hermite Spline Interpolation]       |
       |                                                                     |
       +---------------------------------------------------------------------+
```

### 2.1 Entity Sync & State Synchronization (Sincronização Autorizativa)
* **Dirty Bit Optimization (Otimização de Largura de Banda)**:
  * Componentes anexados ao `NetworkComponent` de uma entidade possuem uma máscara de bits de controle de modificação (*Dirty Bits*).
  * Se apenas a posição da lanterna no `LightComponent` mudar durante um frame, apenas os bits correspondentes à intensidade e rotação são transmitidos via WebRTC no próximo tick de rede, poupando a transmissão repetida do restante de dados estáticos de cor ou sombras do componente.
* **Replication Graph**:
  * Classifica entidades em grupos de importância visual e espacial em relação à câmera de cada jogador.
  * O monstro `Thorne` em perseguição ativa recebe prioridade máxima (60 updates de estado por segundo); barulhos secundários e portas em outros andares recebem atualizações esporádicas de baixa prioridade (3 a 5 updates por segundo).

### 2.2 Prediction, Lag Compensation e Rollback (Compensação de Latência)
* **Client-Side Prediction (Previsão do Cliente)**:
  * Ao mover-se, o cliente local simula imediatamente as equações físicas de velocidade e aceleração no `PhysicsComponent`, movendo a câmera de forma instantânea sem aguardar a confirmação de ida e volta do servidor.
* **Lag Compensation (Reconciliação e Rollback do Servidor)**:
  * O servidor armazena um buffer circular com os últimos 1000 milissegundos de transformações físicas de todas as entidades da sessão.
  * Se o jogador executa uma ação de fechamento de porta rápida sobre o monstro, o servidor "retrocede" a física do monstro no tempo para o timestamp exato do envio do clique do jogador local. Se a ação for confirmada como fisicamente viável naquele segundo do passado, o servidor valida o travamento da porta e replica a reconciliação oficial.
* **Hermite Spline Interpolation (Interpolação de Posições)**:
  * Para evitar pulos bruscos no posicionamento de outros sobreviventes na viewport do cliente causados por variações na entrega de pacotes de rede (jitter), a engine aplica interpolação de curvas de Hermite de terceira ordem sobre os últimos três snapshots recebidos da rede.

### 2.3 Physics Replication & Authority Model (Física Autoritativa de Rede)
* **Server-Authoritative Physics**:
  * O servidor físico simula todos os colisores rígidos e dinâmicos ativos no cenário. Objetos pesados de física que o jogador pode empurrar ou derrubar (como barris e armários de arquivos) herdam autoridade de rede do servidor.
  * **Temporary Client Ownership**: Para reduzir lags de resposta imediata, quando o jogador chuta ou arremessa um objeto pequeno de distração (como uma lata de refrigerante), o servidor concede de forma temporária a "autoridade de física" daquele item para o cliente que executou o arremesso por 3 segundos, reassumindo o controle assim que o item colidir com o solo e repousar.

---

## 3 — ENGENHO DE COMUNICAÇÃO DE VOZ E SINALIZAÇÃO CO-OP (AUDIO ENGINE)

A comunicação por voz é uma mecânica central e tangível de gameplay. O som emitido pelas cordas vocais dos jogadores nos microfones é captado fisicamente pelo sensor de audição da IA do monstro.

```
       [Jogador fala no Microfone] ---> [Capturado via WebRTC AudioStream]
                                                    |
                                                    +---> [Filtro de Áudio Espacial 3D] -> Fone do Amigo
                                                    +---> [Medidor de Decibéis (dB)] ----> NavMesh Acoustic Wave
                                                                                                 |
                                                                                                 v
                                                                                   [IA do Monstro ouve e ataca]
```

### 3.1 Proximity Voice Chat (Áudio Espacial e HRTF)
* **HRTF (Head-Related Transfer Function)**:
  * A voz dos parceiros de co-op é processada em tempo real pela Web Audio API usando funções de panner binaural tridimensional de alta fidelidade baseadas em física acústica real.
  * **Occlusion & Obstruction Filters (Filtros de Parede)**: Se um amigo fala do outro lado de uma parede de concreto espessa na Prisão, a engine aplica um filtro de atenuação de passa-baixas (*Low-Pass Filter*) que abafa as altas frequências de sua voz, simulando a dispersão física real de ondas sonoras por superfícies densas.

### 3.2 Walkie Talkie & Radio Effects (Efeito de Rádio Dielógico)
* **Push-to-Talk (PTT) Radio Channel**:
  * Se os jogadores se afastam além do alcance da voz espacial (mais de 20 metros), devem ativar o Walkie Talkie para manter a comunicação ativa.
* **Radio Distortion DSP (Efeitos de Frequência de Rádio)**:
  * O sinal de voz do Walkie Talkie passa por um processador de sinal digital (DSP) que insere ruído estático estocástico de fundo, estalos de clique de início de transmissão (*Squelch*) e distorção passa-banda típica de transceptores de rádio portáteis de 1980.
  * **Signal Degradation**: Se um jogador entra muito fundo nos túneis escavados da Mina ou atrás das paredes de metal blindadas da Usina, a clareza de sua voz no rádio diminui progressivamente até se transformar em pura estática incompreensível, intensificando a sensação de isolamento.

### 3.3 Text Chat & Ping System (Sinalização Contextual)
* **Ping / Marker System ( GTFO and Phasmophobia Inspired )**:
  * O jogador pode apontar a câmera e disparar pings contextuais de sinalização espacial rápida.
  * A engine analisa o objeto colidido pelo feixe central da mira do jogador e gera um marcador visual 3D temporário reativo para os demais membros do grupo:
    * *Colisão com Caixa de Bateria* -> Ícone de **RECURSO ENCONTRADO** (Pinga "Baterias aqui").
    * *Colisão com a Criatura Thorne* -> Ícone de **PERIGO IMINENTE** (Pinga "Monstro avistado!").
    * *Colisão com Porta Trancada* -> Ícone de **OBSTÁCULO/BLOQUEADO** (Pinga "Porta exige Chave de Prisão").

---

## 4 — SISTEMA DE JOGABILIDADE COOPERATIVA SISTÊMICA (COOP SYSTEM)

O cooperativo do *Project Abyss* exige divisão tática de trabalho de sobrevivência, cooperação mútua em puzzles e salvamento de membros feridos sob perseguição ativa.

```
       +-------------------------------------------------------------+
       |                      CO-OP SYSTEMS PANEL                    |
       +-------------------------------------------------------------+
       |   1. SHARED INVENTORY  -> Negociação física de recursos     |
       |   2. SHARED OBJECTIVES -> Máquina de estados sincronizada   |
       |   3. RESCUE / CPR      -> Reanimação física sob perseguição |
       |   4. EXTRACTION LOCKS  -> Coesão de grupo para escape      |
       +-----------------------------------------------------------+
```

### 4.1 Shared Inventory & Shared Objectives (Inventário e Metas Compartilhadas)
* **Network Lockers & Item Trading**:
  * Os jogadores podem trocar suprimentos diretamente abrindo uma janela de interação mútua segura (*Player Trading Panel*), ou depositando itens físicos em gavetas de armazenamento que sincronizam seus estados deltas via rede.
  * Um sistema de travas de concorrência de memória (*Mutex Locks*) garante que dois jogadores não possam clicar e coletar o mesmo fusível ou seringa de adrenalina da mesa ao mesmo tempo, prevenindo duplicações de recursos na rede.
* **Shared Quest State Machine**:
  * O avanço das metas de campanha é síncrono. O `QuestSystem` multiplayer avalia as condições de progresso globais do grupo (ex: o jogador 1 segura o *Cartão de Acesso Administrativo*, o jogador 2 ativa o painel do gerador a 30 metros, completando a meta combinada de abertura do portão do Bunker).

### 4.2 Rescue & Revive System (Reanimação de Sobreviventes)
* **Mental Collapse Recovery (Recuperação de Paranoia)**:
  * Se um amigo cai no estado crítico de pânico total com sanidade zerada devido à perseguição do monstro, os companheiros podem se aproximar física e confortavelmente e executar a ação de **Acalmar Companheiro**, reduzindo os tremores de sua câmera e ruídos respiratórios.
* **Revive Mechanics (Reanimação CPR & Desfibriladores)**:
  * Se um sobrevivente é golpeado e entra em estado de incapacitação de vida (*Down But Not Out — DBNO*), ele cai no chão de metal e começa a sangrar rapidamente.
  * Outro jogador pode se aproximar e realizar reanimação cardiovascular manual (CPR, que exige vencer um mini-jogo rítmico de barra de tempo sob perseguição) ou consumir um *Desfibrilador Lendário* para reanimar o amigo ferido instantaneamente.

### 4.3 Extraction System, Loot Sharing & Progression
* **Extraction Sychronization**:
  * A abertura da saída de emergência do setor (como as comportas pesadas do Bunker ou o elevador vertical da Mina) exige a presença física e o acionamento sincronizado de interruptores de segurança localizados em lados opostos do salão.
  * **Cohesion Check**: O cronômetro de início de subida do elevador de extração só inicia se todos os jogadores sobreviventes ativos estiverem localizados dentro da caixa física do colisor espacial da cabine de transporte.
* **Loot Sharing & Persistence Profiler**:
  * Conquistas, recursos valiosos de materiais coletados e progressão de diários desbloqueados durante a partida co-op são distribuídos equitativamente para o perfil de persistência na nuvem de todos os sobreviventes ativos que cruzaram com sucesso os portões de extração daquela sessão do Abismo.

---

## 5 — INTEGRAÇÃO COM CMS E MONITORAMENTO MULTIPLAYER (TELEMETRY)

Todas as propriedades comportamentais e métricas de conexão da camada cooperativa multiplayer são controladas e visualizadas diretamente nos painéis do CMS da AbyssEngine:

| Parâmetro de Controle de Rede | Atributo Mapeado no CMS | Efeito em Tempo Real / Simulação Ativa |
| :--- | :--- | :--- |
| **Tickrate do Servidor Dedicado** | `LobbySystem.serverTickrate` | Define a taxa de simulação física e lógica por segundo da instância headless (ex: 30Hz ou 60Hz). |
| **Sensibilidade do Microfone (dB)**| `VoiceChat.microphoneThreshold`| Determina a intensidade de barulho mínima do microfone do usuário para que o sensor acústico da IA capte o som. |
| **Tolerância Máxima de Ping** | `LobbySystem.maxAllowedPing` | Filtro limitador de pareamento de jogadores em Quick Matches regionais. |
| **Progresso Co-op (Loot Table)** | `MapEditor.coopLootMultiplier` | Multiplicador que aumenta progressivamente a densidade de baterias e medicamentos gerados com base na quantidade de sobreviventes na sala. |

---
*Fim do Documento de Arquitetura de Redes e Sistemas Cooperativos Multiplayer. Todos os esqueletos, payloads binários comprimidos de mensagens, e DSP de áudio com simulação de atenuação de paredes estão prontos para montagem sistêmica na AbyssEngine.*
