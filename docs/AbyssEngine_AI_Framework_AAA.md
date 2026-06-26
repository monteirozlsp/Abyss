# PROJECT ABYSS — ARTIGOS DE ENGENHARIA DE IA (v2.4.0)
**Documento de Especificação Técnica AAA: Framework de IA da AbyssEngine**  
**Autor:** Lead AI Programmer / Engine Architect  
**Aprovado para Implementação:** Sim — WebGPU/Multithread Ready

---

## 1 — ARQUITETURA DO SISTEMA DE PERCEPÇÃO (PERCEPTION SYSTEM)

O sistema de percepção da AbyssEngine opera através de um pipeline de múltiplos sensores assíncronos que convertem estímulos físicos do mundo 3D em pacotes de telemetria assimiláveis pelos sistemas de tomada de decisão.

```
       [Jogador] --- (Ruídos/Passos) ---> [Sensor Acústico (NavMesh propagation)] ---\
       [Jogador] --- (Lanterna/Linha) ---> [Sensor de Visão (Frustum/Raycast)] --------+---> [Perception Pipeline] ---> [Blackboard]
       [Cenário] --- (Porta Aberta) ------> [Sensor de Mudança de Estado] -----------/
```

### 1.1 Sensor de Visão (Vision)
A detecção visual do jogador pelas IAs da AbyssEngine baseia-se em um modelo piramidal de zonas de visibilidade (Frustum Cone) acoplado a verificações de obstrução física via raycasting dinâmico.

* **Zonas de Visibilidade**:
  * **Zona de Reação Instantânea (Inner Cone — 45°)**: Detecção visual instantânea do jogador, independente de seu nível de iluminação ou postura (stealth).
  * **Zona Periférica (Outer Cone — 110°)**: Detecção gradual baseada em fatores multiplicadores (iluminação ambiente, velocidade de movimento, postura agachada).
  * **Zona de Silhueta / Penumbra (Extended Cone — 140°)**: O monstro detecta apenas variações de movimento brusco ou feixes de lanterna apontados em sua direção geral.
* **Raycasting Ray-Sweep (GPU Accelerated)**:
  * Para determinar se há obstrução física (paredes, móveis, esconderijos), o sistema dispara raios direcionados às articulações do esqueleto do jogador (`Head`, `Chest`, `Left_Hand`, `Right_Hand`, `Feet`).
  * **Occlusion Masking**: Se mais de 3 articulações estiverem cobertas por geometrias estáticas, o monstro perde a linha de visão direta, ativando o cronômetro de persistência de memória.

### 1.2 Detecção de Áudio e Propagação de Ruído (Audio Detection & Noise Propagation)
Diferente da simples verificação de distância euclidiana, o sistema de áudio da AbyssEngine calcula a atenuação física do som através da malha de navegação (NavMesh pathfinding propagation).

* **Acoustic Path Propagation**:
  * Quando o jogador corre, derruba um objeto física ou dispara um sinal acústico, um evento de ruído é propagado a partir do ponto de origem através do NavMesh.
  * O som contorna esquinas, viaja por dutos de ventilação abertos e perde decibéis específicos dependendo do material da superfície de colisão (metais refletem som com baixa perda, concreto absorve de forma moderada, cortinas de plástico isolam sutilmente).
* **Noise Thresholds e Alerta do Monstro**:
  * O `Audio Detection Component` do monstro capta a intensidade final (dB) que chega à sua coordenada de audição. Se o ruído ultrapassar o limite atual de tolerância acústica do monstro (que diminui proporcionalmente ao seu estado de **Suspeita**), o monstro atualiza sua Blackboard com um vetor de perturbação espacial (`SuspiciousNoiseLocation`).

### 1.3 Propagação de Luz (Light Propagation & Flashlight Tracking)
O feixe da lanterna do jogador é um elemento ativo de gameplay de stealth.
* **Ray-Cone Collision with Monster**: O feixe volumétrico da lanterna é representado por um cone de colisão virtual. Se o cone colidir com a malha do monstro, as variáveis de agressividade e percepção do monstro aumentam exponencialmente em frações de segundo.
* **Bounced Light Tracking**: Se o jogador aponta a lanterna para uma parede próxima ao monstro, o reflexo de luz (*diffuse bounce*) é monitorado pelo sensor de percepção, induzindo o monstro a olhar e investigar a parede refletora.

---

## 2 — SISTEMA DE MEMÓRIA E ESTADOS EMOCIONAIS (MEMORY & EMOTION SYSTEM)

```
        +-------------------------------------------------------+
        |                 MONSTER EMOTIONAL STATE               |
        +-------------------------------------------------------+
        |  [SUSPICION]   --> Investigação orgânica do cenário    |
        |  [FEAR]        --> Coesão de grupo / recuo tático      |
        |  [AGGRESSION]  --> Velocidade máxima e ataques pesados |
        +-------------------------------------------------------+
```

### 2.1 Estrutura de Memória de Curto e Longo Prazo
O `Memory Component` do monstro previne o comportamento artificial de "esquecimento instantâneo" comum em jogos simplistas.
* **Short-Term Memory (STM — Memória de Trabalho)**:
  * Mantém dados temporários e voláteis do frame anterior como a última posição conhecida do jogador (*Last Known Position — LKP*), coordenadas de ruídos recentes e direção de impactos.
  * O STM possui um tempo de decaimento dinâmico de 10 a 20 segundos. Se nenhum estímulo subsequente for recebido, a confiança na informação decai e a IA retorna ao estado de patrulha.
* **Long-Term Memory (LTM — Memória Estrutural)**:
  * Armazena dados históricos de toda a sessão de jogo: esconderijos mais utilizados pelo jogador (armários, debaixo de mesas), rotas que o jogador costuma preferir para fugir e quantidade de vezes que o jogador foi encurralado em determinado quadrante.
  * O LTM é persistido diretamente no arquivo de savegame do jogo para que o monstro "lembre" das táticas preferidas do usuário mesmo em sessões de gameplay futuras.

### 2.2 Vetor Emocional de Três Eixos (The Emotional Triad)
A IA de cada monstro do Abismo é guiada por um equilíbrio de três estados dinâmicos (0.0 a 1.0):

1. **Suspicion (Suspeita)**:
   * Aumenta com ruídos sutis, luzes trêmulas e portas encontradas abertas.
   * Modifica a postura do monstro de caminhada rápida padrão para uma postura de varredura furtiva (diminui ruído de passos do próprio monstro e aumenta a sensibilidade auditiva).
2. **Aggression (Agressividade)**:
   * Elevada pela proximidade visual com o jogador, falhas de stealth repetitivas e sons extremos.
   * Aumenta a velocidade máxima de locomoção, força de ataque física, reduz a probabilidade de hesitação e altera o áudio emitido para gritos e rosnados agudos.
3. **Fear (Medo / Sobrevivência)**:
   * Acionado se o monstro for exposto a armas de contenção química, áreas de luz ultravioleta intensa ou ao se afastar do grupo (para monstros com comportamento em matilha).
   * Força a IA a procurar rotas alternativas ou a bater em retirada temporária (*Tactical Retreat*) para tubulações ou escuridão total.

---

## 3 — PATRULHAMENTO, PREDIÇÃO E APRENDIZADO ADAPTATIVO

```
     [Exploração do Jogador] ---> [Monitor de Esconderijos] ---> [Previsão de Esconderijo]
                                                                        |
                                                                        v
                                                             [Busca Direcionada da IA]
```

### 3.1 Navegação Preditiva (Prediction System)
Inspirado em *Alien Isolation*, se o jogador desaparece do campo de visão do monstro durante uma perseguição, a IA não corre diretamente para a última posição onde viu o jogador. Em vez disso, ela projeta um algoritmo de busca preditiva:
* **Fugue Search Vector**: A IA calcula as possíveis rotas que o jogador poderia ter percorrido em stealth considerando sua velocidade média de caminhada (ou corrida) multiplicada pelo tempo de perda de linha de visão.
* **Hiding Spot Prediction**: Cruzando dados com a Memória de Longo Prazo (LTM), se o jogador usou o mesmo armário nos últimos 3 minutos, a IA eleva em 85% a prioridade de busca física direta daquele esconderijo específico, mesmo sem evidências visuais ou sonoras diretas.

### 3.2 Aprendizado Adaptativo (Adaptive Learning)
Para manter a tensão alta em partidas longas, a IA aprende e pune táticas repetitivas do jogador de forma orgânica:
* **Countermeasures Pipeline**:
  * Se o jogador atrai o monstro usando repetidamente objetos de distração (como sinalizadores químicos ou fita cassete com sons), a IA atribui um "fator de desconfiança" ao ruído específico daquele objeto.
  * Na terceira distração com sinalizador, o monstro ignora completamente a origem do barulho e, em vez disso, inicia uma varredura visual em arco nas redondezas, procurando o ponto de arremesso do objeto (coordenada em que o jogador se encontra escondido).

---

## 4 — ARQUITETURAS DE DECISÃO (DECISION MAKING ARCHITECTURE)

Para dar à AbyssEngine a flexibilidade dramática dos jogos mais complexos, a lógica das IAs adota um modelo híbrido contendo camadas de **GOAP**, **HFSM**, **Behavior Trees** e **Utility AI** coordenadas.

```
       +---------------------------------------------------------------------------------------+
       |                                   AI BRAIN LAYER                                      |
       +---------------------------------------------------------------------------------------+
       |   [GOAP Planner]      --> Define os objetivos estratégicos de longo prazo             |
       |   [Utility AI]        --> Avalia a prioridade de desejos baseados em variáveis        |
       |   [HFSM State Machine]--> Gerencia os macro-estados gerais (Patrol, Search, Chase, Flee) |
       |   [Behavior Tree]     --> Executa a micro-lógica detalhada passo a passo de cada ação |
       +---------------------------------------------------------------------------------------+
```

### 4.1 GOAP (Goal-Oriented Action Planning)
Utilizado para formular estratégias dinâmicas em monstros com múltiplos recursos.
* **Nós de Ação**: Cada ação disponível para a IA possui pré-requisitos lógicos e custos (ex: ação `AtacarJogador` custa 1, pré-requisito: `JogadorVisivel == true`; ação `ApagarGeradorEletrico` custa 3, pré-requisito: `GeradorAtivo == true`).
* **Planner Engine**: O planejador realiza uma busca reversa a partir de um estado alvo desejado (ex: `JogadorMorto == true`) para encontrar a sequência de ações de menor custo global. Se o jogador trancar uma porta, o planejador cria um novo plano dinâmico instantâneo: `ProcurarDutoVentilacao` -> `RastejarNoTeto` -> `CairAtrasDoJogador`.

### 4.2 HFSM (Hierarchical Finite State Machine)
Gerencia os estados de macro-comportamento do monstro com transições rígidas e limpas:
* **Estado 1: Idle/Patrol**: Movimentação por caminhos predefinidos ou gerados aleatoriamente em busca de anomalias.
* **Estado 2: Investigation**: Busca detalhada de perturbações, ruídos ou rastros de fumaça.
* **Estado 3: Hunt/Chase**: Perseguição agressiva do alvo.
* **Estado 4: Retreat/Regen**: Fuga para escuridão total para recuperação de HP ou para arrefecimento de fadiga emocional do jogador.

### 4.3 Behavior Trees (BT) & Blackboards
A árvore de comportamento executa os comandos refinados de cada estado da HFSM:
* **Blackboard**: Contém variáveis de ambiente atualizadas em tempo real pelos sensores percepção, como `TargetPlayerEntity`, `LastKnownLKP`, `IsLightSourceActive`, `CurrentAILightLevel`.
* **Nodes Comuns**: Seletores, Sequenciadores, Condicionais e Decoradores executam as varreduras de colisão, reprodução de animações e movimentação com prioridades controladas.

### 4.4 Utility AI (Desejos Dinâmicos)
Usado para ditar a escolha de qual objetivo a IA deve focar com base em curvas matemáticas de utilidade:
* **Curva de Nutrição**: Se o monstro não se alimenta de carne humana há mais de 10 minutos de jogo, o valor de desejo por `Alimentar` sobe exponencialmente, sobrepondo o desejo de `Patrulhar` defensivamente.
* **Curva de Autopreservação**: Se o monstro recebe danos repetidos de fontes UV do jogador, a utilidade de `Recuar` ganha prioridade absoluta no escalonador.

---

## 5 — PROCEDURAL HORROR & HALLUCINATION SYSTEM

O `HallucinationSystem` atua como o braço executor do **Sanity Director** na manipulação direta das ilusões ópticas e táticas de terror na viewport do jogador.

```
       [Jogador: Sanidade < 30%] ---> [Sanity Director] ---> [Hallucination System]
                                                                    |
                                                                    +---> [Spawn Inimigo Fantasma]
                                                                    +---> [Mover Paredes / Shaders]
                                                                    +---> [Sussurros 3D Binaurais]
```

### 5.1 Geração de Alucinações Dinâmicas (Mental Degradation Actions)
Quando a sanidade do jogador diminui abaixo de 40%, o sistema começa a simular perturbações ambientais exclusivas para aquele jogador:
* **Phantom Clones (Inimigos Fantasmas)**:
  * Instancia e renderiza cópias idênticas do monstro principal (`Thorne`) nos cantos escuros da sala.
  * O clone finge carregar um comportamento de ataque surpresa, corre na direção do jogador e se dissolve em fumaça negra ou poeira química a 2 metros de distância do jogador local, disparando um pico repentino de ruído binaural nos canais do fone.
* **Corredores Infinitos Procedurais**:
  * Manipula a matriz de world-transform das salas. Se o jogador entra em um corredor sob efeito de dissociação mental profunda, a engine replica o mesmo módulo de corredor sequencialmente em tempo real, impedindo o jogador de alcançar a porta de saída até que ele encontre e olhe diretamente para um objeto âncora de realidade (ex: uma lâmpada estroboscópica).
* **Mutações Geométricas Ocultas**:
  * Retratos de parede transformam suas texturas em rostos distorcidos apenas se o ângulo de visão do jogador com o plano do retrato for inferior a 15 graus. Se o jogador olhar de frente, a textura retorna ao estado limpo clássico.

### 5.2 Dynamic Spawn Director (Diretor de Spawns Invisíveis)
Para garantir que o monstro principal esteja sempre próximo do jogador para manter a tensão — mas nunca de forma injusta ou visível — a engine opera o `DynamicSpawn Director`:
* **Frustum Culling Safe Spawn**:
  * O Diretor calcula as áreas de escuridão total e as posições físicas de armários que estão completamente fora do feixe de visão (`Frustum Cone`) e da luz da lanterna do jogador.
  * O monstro é spawnado fisicamente de forma silenciosa nesses pontos limpos, simulando que saiu de uma tubulação oculta próxima.
  * **Spawn Anti-Camping**: Se o jogador fica escondido em um armário por mais de 90 segundos sem se mover, o Diretor força o nascimento silencioso do monstro em um duto exatamente acima daquele armário para forçar a movimentação do jogador.

---

## 6 — COMPORTAMENTO SOCIAL, COORDENAÇÃO DE MATILHA E INVESTIGAÇÃO

```
       [Monstro Líder (Alpha)] --- (Coordena Flanco) ---> [Monstro Flanqueador (Beta)]
                                                                    |
                                                                    v
                                                       [Jogador Encurralado]
```

### 6.1 Comportamentos em Grupo e Matilha (Pack Behaviors)
Para criaturas menores ou de horda (como as anomalias secundárias do Abismo), a engine opera um sistema de inteligência coletiva baseada em agentes coordenados (*Boids* e coordenadores táticos):
* **Flanking Maneuver Coordinator**:
  * As IAs registram-se em um barramento de dados compartilhado de matilha (`PackCommsBroker`).
  * Se o monstro líder (*Alpha*) inicia uma perseguição direta contra o jogador em um corredor, o broker sinaliza aos monstros secundários (*Betas*) para que tomem rotas paralelas, circulando o quarteirão para fechar e bloquear as duas saídas de emergência opostas do setor, cercando o jogador.
* **Collective Suspicion Threshold**:
  * O nível de alerta de todos os monstros da matilha é compartilhado. Se um monstro localiza uma poça de sangue do jogador ou ouve um barulho e aumenta seu nível de alerta para `Investigating`, toda a matilha muda sua patrulha em direção àquele quadrante específico do mapa.

### 6.2 Comportamentos Investigativos Orgânicos
IAs AAA não ignoram alterações físicas do cenário feitas pelo jogador.
* **Environmental Perturbation Tracker**:
  * A IA armazena a posição estática inicial de portas, gavetas, interruptores de luz e armários em sua rota de patrulha.
  * Se o monstro passa por uma porta e percebe que ela foi aberta (ou que um armário de arquivos foi vasculhado e deixado aberto), ele para, entra no estado `Suspicious`, cheira as bordas da gaveta aberta e inicia uma busca em espiral nas redondezas de 10 metros, ciente de que o jogador passou por ali recentemente.

---

## 7 — INTEGRAÇÃO COM CMS E MONSTER EDITOR (FLOW DE DADOS)

O framework de IA é diretamente mapeado ao **Monster Editor** do CMS da AbyssEngine, permitindo alterações em tempo real de toda a simulação sem compilar ou editar código de baixo nível.

```
       +-------------------------------------------------------------+
       |                         CMS ENGINE                          |
       +-------------------------------------------------------------+
       |   Monster Editor    |   Agressividade Slider (85%)          |
       |   (Interface Web)   |   Velocidade Máxima (4.8 m/s)         |
       |                     |   Comportamento Ativo (PATROL_HUNT)   |
       +-------------------------------------------------------------+
                                      |
                                      v (Reactive JSON Sockets)
       +-------------------------------------------------------------+
       |                      ABYSS ENGINE CLIENT                    |
       +-------------------------------------------------------------+
       |   AIComponent       |   aggressiveness: 0.85                |
       |   (Canais de RAM)   |   speed: 4.8                          |
       |                     |   activeBehavior: HFSM_State_Hunt     |
       +-------------------------------------------------------------+
```

### 7.1 Mapeamento e Sincronização de Atributos do CMS
Quando o designer altera parâmetros no painel visual do CMS, os dados são compactados em formato reativo e injetados de forma segura na memória RAM do cliente de simulação:

* **Slider de Agressividade (Aggressiveness)**: Mapeia para `AIComponent.aggressiveness`. Altera instantaneamente a taxa de acumulação de alerta quando o monstro vislumbra o jogador em zonas de penumbra e reduz o tempo de hesitação antes de quebrar portas de madeira.
* **Slider de Velocidade (Speed)**: Mapeia para `AIComponent.speed` e `AnimationComponent.playbackSpeed`. Ajusta a velocidade limite do agente de pathfinding no NavMesh e acelera os ciclos de animação de corrida para garantir perfeita sincronia visual (*no foot-sliding*).
* **Nós de Comportamento (Behavior Trees Designer)**: Permite que o designer habilite ou desabilite nós específicos da árvore de decisão no editor de grafos do CMS (ex: desativar nó `QuebrarPortas` força o monstro a sempre buscar rotas alternativas se encontrar portas trancadas pelo jogador).

### 7.2 Analytics, Telemetria e Tuning em Tempo Real
A engine envia continuamente logs de performance comportamental para a aba de Analytics do CMS:
* **Tuning de Curvas**: O designer pode visualizar um gráfico de tempo de vida médio do jogador vs taxa de fúria do monstro. Se os jogadores estiverem morrendo muito rápido nas estatísticas globais de telemetria, o designer pode ajustar remotamente a duração de repouso do `HorrorDirector` (`ReprieveDuration`) de 60 para 120 segundos, aplicando um hot-patch imediato em todos os servidores do jogo de forma transparente.

---
*Fim do Artigo de Engenharia de IA. Todos os sistemas, desde percepção à coordenação de matilhas, estão perfeitamente documentados de forma complementar à especificação principal da AbyssEngine.*
