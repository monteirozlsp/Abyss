# PROJECT ABYSS — EDITOR SUITE ARCHITECTURE (v2.4.0)
**Manual de Engenharia de Ferramentas Editoriais e Suíte Visual de Desenvolvimento AAA**  
**Autores:** Lead Tooling Engineer & Lead Engine UX Architect  
**Status:** Especificação Técnica Aprovada para Desenvolvimento de Suíte Integrada

---

## VISÃO GERAL DO EDITOR SUITE (ABYSSSTUDIO)
O **AbyssStudio** é a suíte integrada de edição visual da **AbyssEngine**, projetada para permitir a modificação de 100% da lógica, assets, comportamentos, iluminação e design narrativo do jogo de forma 100% visual e sem a necessidade de tocar em código-fonte. O sistema opera baseado em uma arquitetura de cliente-servidor reativa (via WebSocket e conexões síncronas de RAM), garantindo que modificações feitas na interface web do CMS/Editor reflitam instantaneamente no jogo rodando em modo sandbox de teste (*Hot Reload* e *Live Editing*).

```
+---------------------------------------------------------------------------------------------------------+
|                                    ABYSSSTUDIO VISUAL DEVELOPER SUITE                                   |
+---------------------------------------------------------------------------------------------------------+
|  [Map Editor]  <--->  [Behavior Tree Editor]  <--->  [Material Editor]  <--->  [Director/Sanity Editor]  |
+---------------------------------------------------------------------------------------------------------+
|                                    EDITOR TRANSACTIONS & REPLICATION                                    |
|                                                                                                         |
|  [Undo/Redo Engine] ---------> [Transaction Manager (Command Pattern)] ---------> [History & Branching]  |
|                                                                                                         |
|  [Asset Pipeline] ------------> [DDS/KTX Textures / WebGPU Buffers] ------------> [Hot Reload Module]   |
+---------------------------------------------------------------------------------------------------------+
|                                     COLLABORATION & ENGINE CONTROL                                      |
|  [Permission System]    [Live Collaboration Server]    [Playtest Mode (Sandbox)]    [Publish & Rollback]|
+---------------------------------------------------------------------------------------------------------+
|                                           HYBRID ECS RUNTIME                                            |
|                                  [WebGPU Canvas / Simulation Context]                                   |
+---------------------------------------------------------------------------------------------------------+
```

---

## 1 — ARQUITETURA DOS EDITORES INTEGRADOS (EDITOR CATALOUGE)

### 1.1 Map Editor (Editor de Cenários)
O **Map Editor** é uma ferramenta de manipulação espacial 3D em tempo real baseada em WebGL2/WebGPU. Ele herda o pipeline de renderização da engine para permitir modificações instantâneas na estrutura dos mapas.
* **Gizmos de Manipulação Tridimensional (Translate, Rotate, Scale)**: Permite alinhar malhas estáticas e dinâmicas nos eixos X, Y e Z com precisão sub-métrica e suporte a snapping dinâmico à grade do mundo (*WorldGrid*).
* **Brush-Based Placement & Decal Painting**: Pincéis para esculpir e pintar o solo da Mina ou Floresta, aplicar poças de sangue decorativas e decorações procedurais de ferrugem em paredes metálicas.
* **Octree Visualizer**: Exibe as caixas de colisão da árvore octree em tempo real para ajudar o designer a evitar gargalos de oclusão e colisões cruzadas.

### 1.2 Monster Editor (Editor de Ameaças)
Permite criar, modificar e calibrar criaturas agressivas como a anomalia principal `Thorne`.
* **Parameter Tuning**: Sliders intuitivos para definir a velocidade de caminhada, audição acústica, acuidade visual de cones e coeficientes de fúria e agressividade por segundo.
* **Skeleton Overlay**: Exibe a armadura de articulações e ossos do monstro, permitindo vincular sensores físicos em partes específicas do corpo (ex: adicionar um colisor de dano de garra no osso `RightHandFingerBase`).

### 1.3 Behavior Tree Editor (Editor de Lógica de IA)
Um editor visual de grafos para diagramação e estruturação da árvore de decisão da inteligência artificial.
* **Node Graph Connection**: O designer arrasta e conecta nós de **Seletores**, **Sequenciadores**, **Ações** e **Decoradores** de forma semelhante ao Unreal Engine.
* **Live Node Debugging**: Durante o modo playtest, os caminhos ativos da árvore de comportamento são destacados com cores brilhantes na tela de edição (ex: nós executando com sucesso piscam em verde, nós falhando em vermelho), facilitando o rastreamento da tomada de decisão da IA em tempo real.

### 1.4 Quest Editor & Dialogue Editor (Roteirização e Diálogos)
* **Quest Editor**: Editor estruturado para conectar metas de jogo de forma sequencial ou ramificada (ex: missão `Restaurar Energia Usina` exige preencher 3 condições: `Coletar Fusível`, `Válvula de Pressão em 80%`, `Ligar Chave Geral`).
* **Dialogue Editor**: Grafo visual ramificado de árvores de conversação. Suporta a injeção de condicionais baseadas em inventário do jogador (ex: mostrar linha de diálogo de interrogação apenas se o jogador carregar `Prancheta Psiquiátrica 04` na mochila).

### 1.5 Animation Editor (Linha do Tempo e Blend Trees)
Controla a reprodução e transição das sequências dinâmicas de movimentação 3D.
* **Keyframe Timeline**: Controle preciso de frames de animação com suporte a inserção de eventos customizados em frames exatos (*Animation Events*, como disparar o som acústico de pegada exatamente no frame 12 da caminhada do monstro).
* **Blend Trees Controller**: Gráficos bidimensionais que misturam animações baseados em variáveis de velocidade (ex: interpolar de forma contínua e suave a postura do monstro de caminhada lenta para corrida furiosa com base no valor de `speed`).

### 1.6 Material Editor & Particle Editor (Visual e Efeitos)
* **Material Editor**: Editor de shaders baseado em nós (*Node-Based Shader Editor*). Permite misturar parâmetros de texturas PBR (Albedo, Normal, Roughness, Metallic, Height e Emissive) para criar materiais complexos de carne apodrecida ou ferro enferrujado sem programar linhas de código WGSL ou GLSL.
* **Particle Editor**: Simulador de partículas em tempo real na GPU. Permite desenhar fumaça vulgânica, vapor vazando de canos químicos, poeira de anomalia trêmula e respingos de faíscas de curto-circuito com controle de forças físicas como gravidade, vento e turbulência orbital.

### 1.7 Lighting Editor & NavMesh Editor (Iluminação e Movimento da IA)
* **Lighting Editor**: Permite criar e posicionar fontes de luz dinâmicas de holofote, pontuais ou direcionais de sol. Possui ferramentas de controle visual para bias de sombra, intensidades luminosas em lúmens e cores baseadas em temperatura Kelvin.
* **NavMesh Editor**: Ferramenta de rasterização de caminhos da IA. Gera e exibe o polígono plano verde de navegação sobre superfícies horizontais e inclinadas com base em limites físicos de ângulo de rampa e largura do diâmetro das cápsulas dos monstros.

### 1.8 Audio Editor, Sanity Editor & Fear Editor (Atmosfera Psicológica)
* **Audio Editor**: Permite posicionar fontes de som ambiente 3D, configurar coeficientes de absorção e ganho de reverberação de filtros de ambiente físico.
* **Sanity & Fear Editor**: Ferramentas visuais baseadas em curvas que determinam as transições de pós-processamento, nascimento de alucinações de monstros falsos e distorções sonoras de forma escalonável com base nas variáveis biológicas do protagonista.

### 1.9 Director Editor & Inventory Editor (Ritmo e Economia de Sobrevivência)
* **Director Editor**: Permite desenhar as curvas matemáticas de desgaste emocional e fadiga de pânico controladas pelo **Horror Director**. O designer define o tempo mínimo e máximo das fases de descanso (`Reprieve`) e intensidade de pico de caça (`PeakState`).
* **Inventory Editor**: Permite criar novos itens de sobrevivência, cadastrar pesos, durabilidade, taxas de stack máximas de slots, texturas de ícone radial e descrições de lore.

### 1.10 Cutscene Editor, Streaming Editor, Achievement, Localization (Ferramentas de Entrega)
* **Cutscene Editor**: Linha do tempo de controle multicâmera para encenação de trechos narrativos fechados.
* **Streaming Editor**: Visualizador tridimensional de grade das células do *World Partition*. O designer pode inspecionar e definir quais coordenadas do mapa de grade devem persistir na RAM e quais são descarregadas preditivamente.
* **Achievement & Localization Editors**: Gerenciamento integrado de conquistas na plataforma e central de tradução de múltiplos idiomas com suporte a tradução instantânea delta de strings do jogo.

---

## 2 — SUITE DE FUNCIONALIDADES E COLABORAÇÃO (COLLABORATION ENGINE)

Para atender a equipes AAA de desenvolvimento distribuído, o AbyssStudio incorpora uma camada robusta de controle de transações, sincronização segura e testes em tempo real.

```
                  +-----------------------------------+
                  |   TRANSACTION ENGINE (COMMAND)   |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
  +-------------------+                           +-------------------+
  |   LOCAL MEMORY    |                           |     CLOUD SYNC    |
  |  (Undo/Redo Pile) |                           | (Realtime Sockets)|
  +-------------------+                           +-------------------+
            |                                               |
  +-------------------+                           +-------------------+
  | VERSIONING/BRANCH |                           | PLAYTEST SANDBOX  |
  | (Delta Saves/Git) |                           | (Hot Reload RAM)  |
  +-------------------+                           +-------------------+
```

### 2.1 Undo, Redo e Command History Pipeline
Todas as modificações de editores são representadas internamente sob a forma do padrão de design **Command Pattern** no `TransactionManager`:
* **Ações Reversíveis**: Mover uma parede, alterar a cor de uma luz ou deletar uma IA do mapa gera uma classe de comando serializada que é adicionada a uma pilha estática de transações locais.
* **Pilha Infinita de Histórico**: Permite ao desenvolvedor executar comandos de `Undo` ou `Redo` ilimitados sem risco de inconsistência de ponteiros de memória de cena.

### 2.2 Versioning, Branching e Cloud Sync
* **Versioning (Controle de Versão por Delta)**: O estado do mapa não é gravado em arquivos massivos e proprietários fechados. Ele é persistido sob a forma de coleções estruturadas delta organizadas de forma hierárquica em JSON/YAML. Isso permite que sistemas de versionamento como o Git façam mesclagem de alterações de múltiplos desenvolvedores sob a mesma célula espacial sem conflitos insolúveis.
* **Cloud Sync (Sincronização Ativa em Nuvem)**: Todas as alterações salvas localmente no navegador são sincronizadas em segundo plano para servidores seguros na nuvem em frações de segundo através de canais de streaming de dados.

### 2.3 Playtest Mode, Hot Reload e Live Editing
* **Sandbox Playtest Mode**: Com um único clique na barra de ferramentas do editor (`Play Button`), o contexto do WebGPU canvas transiciona de forma instantânea para o modo de simulação ativa do jogo, sem telas de carregamento intermediárias.
* **Hot Reload & Live Editing**: Se o playtest está rodando em tela dividida, o designer pode arrastar fisicamente a coordenada de patrulha do monstro em tempo real no mapa e ver a criatura desviar seu trajeto no exato instante no simulador do jogo, sem reiniciar a sessão ativa.
* **Asset Replacement**: Permite arrastar um novo arquivo de textura `.DDS` comprimido diretamente da pasta do sistema operacional para cima do visualizador do material e ver todas as malhas que usam aquele material trocarem de revestimento instantaneamente, acelerando as iterações artísticas em 10 vezes.

### 2.4 Collaboration, Permission, Moderation e Rollback
* **Live Collaboration (Edição Compartilhada)**: Suporte para múltiplos desenvolvedores trabalharem na mesma cena espacial simultaneamente. A posição das câmeras e gizmos de outros colaboradores é representada na tela através de avatares com nomes identificadores.
* **Permission System (Gestão de Acesso por Perfil)**: Dita privilégios e papéis específicos para o time de desenvolvimento (ex: artistas de material têm acesso bloqueado para modificar rotas de NavMesh ou roteiros de diálogos para evitar quebras acidentais de build).
* **Rollback Recovery**: Se um artista publicar um pacote de iluminação ou materiais corrompidos que impeçam o build estável do jogo, o sistema administrativo do CMS permite realizar o rollback completo da versão do projeto para qualquer carimbo de data anterior (*safe states*) com um único clique.

---

## 3 — MAPEAMENTO DE FERRAMENTAS NO CMS INTEGRADO DA ENGINE

Todas as sub-interfaces de edição visual descritas acima mapeiam-se de forma direta para variáveis estruturadas que alimentam os loops de runtime do ECS Híbrido, mantendo perfeita coerência e facilidade de depuração operacional:

| Aba Editorial no CMS / AbyssStudio | Objeto de Dados Serializado Gerado | Componente ou Sistema de Destino no ECS |
| :--- | :--- | :--- |
| **Map/Level Editor** | `gridCellsPayload.json`<br>`staticColliders.bin` | `StreamingComponent` / `PhysicsSystem` / `WorldPartition` |
| **Behavior Tree Designer** | `aiDecisionTreePayload.json` | `AIComponent` / `AISystem` |
| **Material / Shader Editor** | `pbrMaterialUniforms.json` | `RenderComponent` / `RenderSystem` (WebGPU G-Buffer) |
| **Lighting Editor** | `lightProbeData.json` | `LightComponent` / `LightingSystem` |
| **Sanity & Fear Designer** | `degradationCurves.json` | `SanityComponent` / `SanitySystem` / `HallucinationSystem` |

---
*Fim da Especificação do Editor Suite (AbyssStudio). Todos os módulos visuais, sistemas de transações de undo/redo, pipelines de colaboração ativa e sandbox instantâneo estão unificados na arquitetura de core da AbyssEngine.*
