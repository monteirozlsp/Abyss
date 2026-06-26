# DOCUMENTAÇÃO ARQUITETURAL DE MULTIPLAYER (PREPARATION STATE)
**AbyssEngine v2.4.0 — Módulos de Rede e Sincronização Desabilitados**  
**Autor:** Lead Network Architect / Core Developer  
**Status:** Prontos para Ativação Futura (Zero Refactoring Pipeline)

---

## VISÃO GERAL DA ARQUITETURA MULTIPLAYER
Esta documentação descreve o design técnico e a preparação dos módulos de rede da **AbyssEngine**. Todos os sistemas foram arquitetados seguindo padrões AAA modernos (*Unreal Engine Replication Graph*, *Source 2 Network Layer*, *Decima Network Layer*), porém permanecem **completamente inertes/desativados** em tempo de execução para garantir que o jogo funcione perfeitamente no modo Single-Player Offline sem carregar bibliotecas externas de sockets ou criar latências de processamento.

```
       +---------------------------------------------------------------------------------------------------------+
       |                                   ABYSS ENGINE NETWORK TOPOLOGY (FUTURE)                                |
       +---------------------------------------------------------------------------------------------------------+
       |                                                                                                         |
       |  [AntiCheat] ----> [NetworkLayer (WebSockets / WebRTC)] <----> [Dedicated Server / Matchmaking]          |
       |                           |                                                                             |
       |                           v                                                                             |
       |                 [ReplicationSystem]  =================>  [SessionManager]                               |
       |                 (Entity Replication Graph)               (Sync States & Game Modes)                      |
       |                           |                                                                             |
       |                           v                                                                             |
       |                 [Lobby & Party System] <-------------> [VoiceChat (Binaural WebRTC)]                     |
       |                                                                                                         |
       +---------------------------------------------------------------------------------------------------------+
```

---

## 1 — FLUXOS E INTEGRAÇÃO DE COMPONENTES CORE

Todos os sistemas herdam interfaces genéricas de rede da engine de modo que o seu acoplamento com o **ECS Híbrido** e com o **SystemScheduler** ocorra através de polimorfismo limpo.

### 1.1 NetworkLayer (Camada de Baixo Nível)
* **Responsabilidade**: Abstrair o transporte físico de rede usando canais mistos:
  * **WebRTC DataChannels**: Para transmissão de dados não-confiáveis e urgentes (coordenadas de posição, velocidades de física, rotação de esqueleto). Equivale ao transporte UDP clássico.
  * **WebSockets / Secure WebSockets**: Para ações críticas e transações seguras de estado (uso de itens no inventário, progressão de missões, transição de salas, login de jogador). Equivale ao transporte TCP.
* **Fluxo Interno**:
  * O `NetworkLayer` gerencia a serialização de mensagens binárias altamente compactadas através de buffers pré-alocados de array (`ArrayBuffer`).
  * Ele opera em um loop isolado através do `NetworkWorkerThread` para nunca bloquear a linha de renderização principal de 60 FPS da CPU.

### 1.2 ReplicationSystem (Replicação de Entidades e Componentes)
* **Responsabilidade**: Sincronizar o estado de componentes pertencentes a entidades marcadas com o `NetworkComponent` entre todos os clientes conectados e o servidor autoritativo.
* **Mecanismos Planejados**:
  * **Replication Graph**: Otimiza a frequência de sincronização de entidades baseada na proximidade espacial do jogador. Entidades a menos de 5 metros de distância são sincronizadas a 30Hz; monstros em outros setores do mapa são sincronizados a apenas 2Hz ou são temporariamente excluídos do grafo de replicação para economizar banda física.
  * **Prediction & Rollback (Previsão Local)**: O cliente local executa de forma imediata o movimento do avatar do jogador e tenta prever a colisão com objetos físicos. Se o servidor enviar uma correção de posicionamento, o sistema interpola o esqueleto do jogador de forma suave de volta ao ponto autoritativo em frações de milissegundo.

### 1.3 LobbySystem & PartySystem (Social & Matchmaking)
* **LobbySystem**: Gerencia salas de espera virtuais de jogadores, troca de avatares/skins PBR preparadas no CMS, status de prontidão (*Ready check*) e transmissão de mensagens textuais locais.
* **PartySystem**: Gerencia grupos permanentes ou temporários de jogadores amigos. Permite que o líder do grupo arraste todos os membros da party de forma automática para uma nova partida ou transição de mapa do servidor.

### 1.4 FriendsSystem, Guilds & VoiceChat (Sistemas Sociais Integrados)
* **FriendsSystem**: Integrado ao barramento de microsserviços. Consulta status online, sessões ativas com possibilidade de join imediato se houver vagas no lobby.
* **Guilds (Clãs / Facções)**: Suporte para agrupamento durável de jogadores sob uma mesma bandeira conceitual, com logs de atividades compartilhadas e progressão cumulativa de conquistas do clã.
* **VoiceChat (WebRTC Binaural)**:
  * Sistema de comunicação por voz de alta definição com suporte de renderização espacial 3D em tempo real.
  * A voz dos parceiros de co-op passa por filtros de panner da Web Audio API de modo que ela seja atenuada por paredes físicas do cenário e ganhe efeitos de eco/reverberação apropriados ao tamanho da sala tridimensional em que o avatar do amigo está localizado.
  * Se o jogador se afastar e entrar no esgoto, sua voz ganha efeitos metálicos e de oclusão de esgoto de forma dinâmica.

### 1.2 DedicatedServers, Crossplay & CloudSave
* **DedicatedServers**: Estruturas de orquestração preparadas para se comunicarem com instâncias dedicadas na nuvem, lidando com sessões dinâmicas criadas em clusters de servidores em microsserviços do Kubernetes.
* **Crossplay Framework**: Camada de normalização de dados que garante que jogadores em diferentes plataformas ou navegadores (Chrome, Safari, Firefox, desktops vs dispositivos portáteis) possuam o mesmo modelo de precisão matemática na física e replicação de tempo.
* **CloudSave**: Serializador assíncrono que faz o upload de arquivos `SaveGame` delta compactados para o cluster de nuvem de tempos em tempos de forma transparente.

### 1.3 AntiCheat, SessionManager, Leaderboard & Ranking
* **AntiCheat Framework**: Sistema de validação de assinaturas de estado local. Compara a velocidade atual do jogador com o limite absoluto definido em `TransformComponent` para barrar hacks de velocidade (*SpeedHacks*). Valida também as transições espaciais de coordenadas para evitar teleportes impossíveis de física.
* **SessionManager**: Controla o ciclo de vida da partida (carregamento do mapa, sincronização de jogadores antes do início da jogabilidade ativa, encerramento por vitória ou morte e envio de relatórios pós-partida).
* **Leaderboards & Ranking**: Tabelas de classificação globais e sazonais integradas diretamente aos eventos especiais (Halloween/Natal) cadastrados no CMS.
* **Analytics Multiplayer**: Captura incidentes de desconexão física (disconnects), taxas de latência (ping), taxas de perda de pacotes e tempos médios de fila de matchmaking para exibição em tempo real na aba de controle do CMS.

---

## 2 — TABELA DE ATIVAÇÃO ZERO-REFATORAÇÃO
Abaixo está detalhado o protocolo de montagem arquitetural que permite ativar todos os recursos de multiplayer do jogo alterando apenas uma única flag central no CMS de produção:

| Variável / Interface Desabilitada | Valor em Estado Offline (Inerte) | Comportamento Reativo com Flag Multiplayer Ativada | Impacto de Refatoração de Código |
| :--- | :--- | :--- | :--- |
| `NetworkLayer.isActive` | `false` | Inicializa conexões de WebRTC/WebSocket e abre canais de escuta físicos. | **Zero** — Todos os subsistemas já consultam a flag dinamicamente. |
| `ReplicationSystem.isSinking` | `false` | Varre entidades com `NetworkComponent` e submete dados de estado para o buffer de rede em frames sequenciais. | **Zero** — Métodos já existem de forma stub/esqueleto não-operacional. |
| `LobbySystem.activeLobbyID` | `null` | Redireciona a renderização do menu principal para a sala de matchmaking e seleção de skins. | **Zero** — Painéis de interface social herdam o padrão do CMS. |
| `VoiceChat.isEnabled` | `false` | Solicita permissões de microfone do navegador e monta o grafo de áudio espacial 3D. | **Zero** — Integrado de forma passiva à Web Audio API da engine. |
| `AntiCheat.activeVerification` | `false` | Dispara verificações de velocidade, checagens de integridade de buffers de colisão e relata anomalias. | **Zero** — Atua puramente como um sistema paralelo no SystemScheduler. |

---
*Fim da Especificação de Preparação de Rede. Todos os métodos e hooks para o multiplayer do futuro já estão estruturados e integrados de forma limpa na base de dados da AbyssEngine.*
