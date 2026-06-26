# PROJECT ABYSS — VERTICAL SLICE IMPLEMENTATION PLAN (v1.0.0)
**Documento de Especificação Técnica e Direção de Implementação para Fatia Vertical**  
**Autor:** Technical Director & Lead Producer  
**Status:** Aprovado para Produção Ativa (Vertical Slice Kickoff)  
**Público-Alvo:** Programadores de Engine, Designers de IA, Level Designers, Sound Designers e Artistas de Cenário

---

## VISÃO GERAL DO PROJETO (VERTIAL SLICE)
O **Vertical Slice (VS)** do *Project Abyss* representa um marco de fidelidade máxima de 20 minutos de jogabilidade ininterrupta, ambientado no **Laboratório Experimental**. Este plano detalha todas as fundações arquitetônicas, a esteira de ativos (assets), a inteligência artificial preditiva da criatura **THORNE**, os sistemas de áudio processados em tempo real, as metas de desempenho de hardware e o plano de marcos cronológicos de produção.

---

## 1 — ARQUITETURA DE PASTAS E REPOSITÓRIO (DIRECTORY SYSTEM)

O repositório do projeto adota uma estrutura modular estrita para garantir o desenvolvimento desacoplado dos componentes e facilidade de empacotamento:

```
/
├── assets/                     # Binários e Recursos de Arte Estáticos
│   ├── models/                 # Modelos 3D (.glb/.gltf)
│   │   ├── characters/         # Malhas do Thorne e do Protagonista
│   │   ├── modular_lab/        # Paredes, portas, tetos e canos brutas
│   │   └── props/              # Móveis, computadores, gavetas, itens de sobrevivência
│   ├── textures/               # Arquivos .ktx2 comprimidos com ASTC/BC7
│   ├── audio/                  # Arquivos .ogg em baixa latência (48kHz, Opus)
│   │   ├── dynamic_music/      # Faixas interativas do Horror Director
│   │   ├── ambient_3d/         # Sons posicionais de poços de vento, eletricidade, gotas
│   │   └── voice_lines/        # Sussurros binaurais e diálogos de rádio
│   └── shaders/                # Shaders WebGPU (.wgsl) para pós-processamento e luzes
├── docs/                       # Documentação Técnica e de Design (GDD/TDD/EDD)
├── src/                        # Código Fonte TypeScript (Hybrid ECS)
│   ├── main.tsx                # Ponto de entrada do aplicativo
│   ├── core/                   # Núcleo da Engine
│   │   ├── ecs/                # Gerenciador de Entidades, Componentes e Registros
│   │   ├── memory/             # ArrayBuffers e Pools Estáticos de Memória
│   │   ├── task_scheduler/     # Divisão de threads para cálculo paralelo
│   │   └── physics/            # Colisores rígidos, gravidade e inércia
│   ├── render/                 # Pipeline de Renderização WebGPU
│   │   ├── deferred_renderer.ts# G-Buffer, luzes dinâmicas, oclusões e sombras
│   │   └── post_processing.ts  # Shaders de pânico, visão de túnel, grão, aberração
│   ├── streaming/              # Gerenciador de World Partition
│   │   └── spatial_grid.ts     # Carregador assíncrono de células de cena
│   ├── components/             # Estruturas POD de Componentes do ECS
│   ├── systems/                # Sistemas do ECS (Lógica)
│   │   ├── ai/                 # Comportamento de Thorne (GOAP, HFSM, Visão, Audição)
│   │   ├── survival/           # Inventário, Lanternas, Bateria, Medicamentos
│   │   ├── horror/             # Horror Director, Sanity Director, Alucinações
│   │   └── interaction/        # Portas, Chaves, Interruptores e Puzzles
│   ├── cms/                    # Conector e Gerenciador de Dados Web (JSON Gateway)
│   └── App.tsx                 # Interface e Fluxos de Inicialização de HUD
└── index.html                  # Arquivo HTML principal do navegador
```

---

## 2 — MAPA: LABORATÓRIO EXPERIMENTAL (2500 - 3500 m²)

O cenário é estruturado como um labirinto interconectado de salas industriais brutalistas e laboratórios estéreis, projetados com rotas alternativas circulares para maximizar a dinâmica de esconde-esconde e navegação tática:

```
               [ RECPÇÃO ]  --- (Porta Corta-Fogo) ---> [ CORREDOR PRINCIPAL ]
                    |                                           |
           +--------+--------+                         +--------+--------+
           |                 |                         |                 |
     [ S. SEGURANÇA ]  [ S. ARQUIVOS ]           [ LOBBY LAB ]     [ AL. PSIQUIÁTRICA ]
                                                       |                 |
                                                 [ LAB EXP ]             |
                                                       |                 |
                                                [ S. CONTROLE ]   [ NECROTÉRIO ]
                                                       |                 |
                                                       +--------+--------+
                                                                |
                                                          [ SUBSOLO / ELEVADOR ]
                                                                |
                                                          [ S. GERADORES ]
```

### 2.1 Setorização e Características de Tensão do Mapa
1. **Recepção (Entrada - Safe Zone)**: Área inicial iluminada por lâmpadas halógenas amareladas estáveis. Menor nível de pânico, sem presença de Thorne.
2. **Corredor Principal (Unsafe Zone)**: Eixo de trânsito longo e alto com canos de ventilação no teto. Thorne utiliza o duto para movimentar-se de forma invisível.
3. **Sala de Segurança & Sala de Arquivos (Panic/Puzzle Zones)**: Contém terminais eletrônicos que destrancam a porta do Laboratório Principal. Possui armários metálicos altos para esconderijo rápido.
4. **Laboratório Experimental (Puzzle Zone)**: Sala de grandes proporções com mesas cirúrgicas destruídas e reagentes químicos estourados no piso. Apresenta o quebra-cabeça de reagentes biológicos.
5. **Ala Psiquiátrica & Necrotério (Panic Zones)**: Corredores estreitos com azulejos verdes quebrados e macas bloqueando o caminho. O teto está parcialmente desmoronado, com fiação elétrica solta gerando faíscas.
6. **Subsolo & Área de Geradores (Panic/Puzzle Zones - Escuridão Máxima)**: Setor inferior inundado por água rasa de 5cm, amplificando o ruído acústico de passos de quem transita na área. Contém o quebra-cabeça elétrico de ativação de força geral da área.

---

## 3 — LISTA COMPLETA DE RECURSOS E ATIVOS (ASSET SUITE)

### 3.1 Ativos Tridimensionais (Models & Thin Instances)
* **Modelos de Personagem**:
  * `CH_Protagonist_Body.glb`: Malha em primeira pessoa focando nas pernas, braços e mãos físicas segurando os equipamentos.
  * `CH_Thorne_Stalker.glb`: Malha detalhada da criatura Thorne, com texturas de carne escura corroída por anomalias pretas e dedos de garras alongadas.
* **Módulos Estruturais (Modular Environment)**:
  * `MOD_Wall_Brutalist_4x4.glb`, `MOD_Floor_Metal_Grid.glb`, `MOD_Ceiling_Vent_Shaft.glb`.
  * `MOD_Door_Security_Card.glb`, `MOD_Door_Wood_Damaged.glb`.
* **Móveis e Objetos Cenográficos (Props)**:
  * `PR_Metal_Closet.glb` (Armário com persianas para visualização em fresta), `PR_Medical_Stretcher.glb` (Maca cirúrgica), `PR_Terminal_CRT.glb` (Computador antigo), `PR_Electrical_Breaker_Box.glb` (Caixa de fusíveis).

### 3.2 Ativos Acústicos (Sons de Tensão)
* **Foley & Passos (Acoustic Footsteps)**:
  * `SFX_Step_Metal_Bare_01.ogg` a `06` (Passos descalços do monstro sobre metal).
  * `SFX_Step_Concrete_Boot_01.ogg` a `06` (Passos de bota do jogador em piso de concreto).
  * `SFX_Step_Water_Splash_01.ogg` a `06` (Passos em água rasa).
* **Respiração e Batimentos Cardíacos (Fisiológicos)**:
  * `SFX_Breath_Normal_Loop.ogg`, `SFX_Breath_Heavy_Panicking.ogg` (Respiração ofegante sob stress).
  * `SFX_Heartbeat_Sway_Loop.ogg` (Batimentos do coração que aumentam a frequência dinamicamente).
* **Sons de Ambiente e Distração (Atmosféricos)**:
  * `SFX_Screech_Metal_Pipe.ogg` (Cano rangendo sob pressão).
  * `SFX_Blackout_Fuse_Blow.ogg` (Curto-circuito e corte abrupto de eletricidade).
  * `SFX_Radio_Static_Walkie_Loop.ogg` (Chiado analógico de rádio que intensifica perto do perigo).

---

## 4 — COMPORTAMENTO DINÂMICO DA CRIATURA THORNE (AI SPECS)

Thorne opera como uma presença assustadora constante, utilizando uma árvore de decisão híbrida (**HFSM** para estados gerais de humor, **GOAP** para metas dinâmicas e **A\* Pathfinding** no NavMesh).

```
                 +-------------------------------------------------------+
                 |                 THORNE HFSM STATE ENGINE              |
                 +-------------------------------------------------------+
                 |                                                       |
                 |      +-----------+     Barulho Alto     +-----------+ |
                 |  +-->|  PATROL   |--------------------->| INVESTIG. | |
                 |  |   +-----------+                      +-----------+ |
                 |  |         |                                  |       |
                 |  |   Linha de Visão                       Jogador Foge|
                 |  |         v                                  |       |
                 |  |   +-----------+                            v       |
                 |  +---|   CHASE   |<---------------------------+       |
                 |      +-----------+                                    |
                 +-------------------------------------------------------+
```

### 4.1 Comportamentos Detalhados de Thorne
* **Patrulha Cega (Patrol State)**: Percorre caminhos de ronda de forma lenta e errática, emitindo pequenos estalidos bucais que servem de pista direcional acústica para o jogador.
* **Investigação Dinâmica (Investigate State)**: Se o jogador faz barulho (como correr ou bater uma porta), Thorne desvia de sua patrulha e corre até a coordenada exata do som, realizando uma varredura visual de 360 graus na área por até 8 segundos antes de retomar a patrulha.
* **Caça e Perseguição Ativa (Chase State)**: Ao avistar o jogador, Thorne emite um guincho metálico de pânico acústico e inicia uma corrida implacável de perseguição de 4.8 m/s. Se o jogador dobra uma curva cega, Thorne calcula a trajetória de fuga provável com base na última linha de visão visível.
* **Investigação de Esconderijos (Search Logic)**: Se o jogador some em uma sala com armários, Thorne inspeciona os armários próximos de forma física, abrindo as portas de forma violenta um por um se sua agressividade estiver em nível crítico.

---

## 5 — FLUXOGRAMA DE JOGABILIDADE E METAS DE GAMEPLAY (ETAPAS 5 & 6)

```
[ INÍCIO ] ---> Recepção: Coleta Lanterna e Bateria (Safe Zone)
     |
     v
Corredor Principal: Porta do Laboratório lacrada sem força
     |
     v
Desvio para Ala Psiquiátrica: Primeiro susto procedural (Corpo cai do duto)
     |
     v
Necrotério: Coleta Fusível e o Cartão de Acesso Clase-1
     |
     v
Primeiro Blackout: Luzes apagam de forma permanente no Necrotério
     |
     v
Primeira Aparição de THORNE: Thorne desce do duto à frente do jogador
     |
     v
Primeira Perseguição: Jogador corre e esconde-se no armário da S. Segurança
     |
     v
Segurar Respiração (Mini-game): Thorne passa arrastando garras ao lado do armário
     |
     v
Descida para o Subsolo: Reativação dos Geradores (Puzzle dos Fusíveis)
     |
     v
Reativação de Força: Escapes e rotas de escape do Laboratório abrem
     |
     v
Corrida para Extração: Fuga rápida até o Elevador de Carga enquanto Thorne persegue
     |
     v
[ VITÓRIA / EXTRAÇÃO ]
```

---

## 6 — MÓDULO DE DEFORMAÇÃO E FEEDBACK SENSORIAL (RENDER BUDG)

Para intensificar a imersão sem poluentes na HUD clássica bidimensional, o Renderizador do *Project Abyss* emprega os seguintes efeitos gráficos na GPU:

* **Pós-processamento de Pânico**: Aberração cromática controlada pelo BPM do jogador (se o coração estiver a 180 BPM, os canais RGB se afastam nas bordas da tela de forma extrema).
* **Filtro de Ruído Eletromagnético (CRT Glitch)**: Grãos de filme e pequenas interferências de linhas horizontais que sibilam e piscam síncronas com a proximidade tridimensional de Thorne, simulando perturbação eletromagnética em contato com a criatura.
* **Distorção de Visão de Túnel (Vignette)**: Uma máscara circular preta translúcida que se fecha reduzindo a visibilidade focada do jogador ao segurar a respiração ou ao sofrer um ataque crítico.

---

## 7 — CRONOGRAMA, MARCOS DE ENTREGA E DEPENDÊNCIAS (ETAPAS 14 & 15)

O desenvolvimento da Vertical Slice está estruturado em **4 Milestones** fundamentais, distribuídos ao longo de um ciclo ágil e enxuto de 6 meses de produção:

```
+---------------------------------------------------------------------------------------------------------+
|                                    PRODUCTION MARCOS & WORKLOAD SYSTEM                                  |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ M1: Core Foundation ] -------> [ M2: Content Setup ] -------> [ M3: AI & System Lock ] -------> [ M4] |
|  * ECS Registry Mount              * Conclusão de Malhas GLB      * Thorne Patrulha/Busca/Fuga     * Pol|
|  * WebGPU deferred render ativo    * Configuração de Áudio 3D     * Puzzle de Fusíveis integrado   * QA |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 7.1 Detalhamento de Marcos (Milestones)
* **Milestone 1: Core Foundation & Memory (Mês 1 & 2)**:
  * Inicialização e validação estável do `HybridECSRegistry` e pools estáticos de memória em ArrayBuffers.
  * Integração da câmera em primeira pessoa e controladores de movimentação física padrão (*Lean*, *Crouch*, *Vault*).
  * Renderizador adiado WebGPU configurado e gerando G-Buffer estável com sombras e iluminação pontual básica.
* **Milestone 2: Content & Level Setup (Mês 3)**:
  * Importação e alinhamento modular das malhas 3D da recepção, corredores, salas de segurança e subsolo.
  * Configuração dos filtros acústicos binaurais de HRTF e emissores de som de ambiente 3D.
  * Implementação da lógica de inventário funcional, incluindo Lanterna com foco dinâmico e consumo de pilhas.
* **Milestone 3: AI & Systems Integration (Mês 4 & 5)**:
  * Thorne integrado ao mapa com NavMesh compilado, executando de forma autônoma rondas e reações a ruídos.
  * Integração do quebra-cabeça elétrico de reativação de força dos geradores.
  * Ativação dos gatilhos do Horror Director para blackouts procedurais e alucinações de mirrors.
* **Milestone 4: Polish, QA & Sign-off (Mês 6)**:
  * Correções exaustivas de colisões físicas do jogador e furos no NavMesh de Thorne.
  * Refinamento fino e calibração dos efeitos gráficos de pós-processamento de pânico e tremores de tela.
  * Envio estável de dados analíticos de mortes e progressão de checkpoint para o gateway do CMS.
  * Homologação e empacotamento da compilação final estável da Vertical Slice a 60 FPS estáveis.

---

## 8 — CHECKLIST DE PRODUÇÃO TÉCNICA (PRE-RELEASE EXCELLENCE)

Este checklist determina as etapas finais obrigatórias de validação de qualidade antes de publicar e homologar o pacote de Vertical Slice do *Project Abyss*:

### 8.1 Performance e Renderização
- [ ] Validar taxa de quadros estável mínima de 60 FPS em computadores de especificações domésticas intermediárias na resolução nativa de `1920x1080p`.
- [ ] Certificar que todos os materiais do Laboratório usem texturas comprimidas em formato `.ktx2` com codificação BC7 para poupar o consumo de largura de banda de VRAM.
- [ ] Validar a ativação dos pipelines de oclusão de malhas ocultas (*Occlusion Culling*) e níveis de detalhamento (*LOD*) para evitar renderizações desnecessárias da GPU fora do ângulo de visão da câmera do jogador.

### 8.2 Inteligência Artificial e Gameplay
- [ ] Certificar que Thorne seja capaz de abrir portas e rastejar por dutos sem travamento ou loops de colisão de malhas.
- [ ] Validar o mini-jogo rítmico de segurar a respiração nos armários, garantindo que a falha atrai a IA de forma coerente e imediata ao esconderijo correspondente.
- [ ] Validar que todos os colecionáveis de anotações físicas e fitas de áudio carregados da mochila exibam descrições lógicas e áudio espacializado corretos.

### 8.3 Integração e Sincronização de Dados (CMS & Saves)
- [ ] Certificar que a reativação de checkpoints grave de forma compactada o estado de sobrevivência do jogador (HP, Baterias, Fusíveis coletados) no CMS de rede.
- [ ] Confirmar o envio correto e assíncrono do payload analítico de telemetria sem engasgos ou travamentos de frame no loop de simulação física ativo.

---
*Fim do Documento de Implementação da Vertical Slice. Todas as metas de game design, especificações da inteligência de Thorne, sistemas de áudio interativos e checklists técnicos estão consolidados e prontos para guiar o ciclo de produção ativa da AbyssEngine.*
