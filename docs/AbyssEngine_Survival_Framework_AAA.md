# PROJECT ABYSS — SURVIVAL SYSTEMS FRAMEWORK (v2.4.0)
**Manual de Engenharia de Sobrevivência, Inventário e Mecânicas de Jogador AAA**  
**Autores:** Lead Gameplay Designer & Systems Programmer  
**Status:** Especificação Aprovada para Equipes de Game Design e Programação de Sistemas

---

## VISÃO GERAL DO SURVIVAL FRAMEWORK
O **Survival Framework** do *Project Abyss* é projetado para criar uma experiência de horror de sobrevivência implacável, focada na gestão extrema de recursos e na fragilidade do protagonista. Inspirado pela tensão tática de *Alien Isolation*, pelo pânico psicológico de *Amnesia* e pela claustrofobia de recursos de *Resident Evil*, este sistema governa todos os aspectos de inventário, equipamentos eletrônicos de suporte, necessidades biológicas, gerenciamento energético e engenhos de furtividade.

```
       +-------------------------------------------------------------------------------------------------+
       |                                   SURVIVAL SYSTEMS PIPELINE                                     |
       +-------------------------------------------------------------------------------------------------+
       |                                                                                                 |
       |  [Equipamentos / Consumo] ----> [Battery System / Recursos] ----> [Crafting / Repair Kits]        |
       |               |                                                         |                       |
       |               v                                                         v                       |
       |  [Player Needs (Stress/Fear)] <===> [Fisiologia (Heart Rate)] <===> [Inventário (Slots / Peso)] |
       |                                                                                                 |
       +-------------------------------------------------------------------------------------------------+
```

---

## 1 — INVENTÁRIO E SISTEMA DE MOCHILA (INVENTORY ENGINE)

O inventário do *Project Abyss* não é apenas uma tela estática, mas uma mecânica de gameplay física ativa. Abrir o inventário **não pausa a simulação**, expondo o jogador ao perigo enquanto gerencia seus pertences.

```
       +-------------------------------------------------------+
       |                  INVENTORY MATRIX PANEL               |
       +-------------------------------------------------------+
       |   [Slot 1: Cam]   |   [Slot 2: Bat]   |   [Slot 3: Med]   |
       |   (1.2kg - Dur)   |   (0.1kg - Stack) |   (0.5kg - Qty)   |
       |-------------------+-------------------+---------------|
       |   [Slot 4: Flare] |   [Slot 5: Empty] |   [Slot 6: Empty] |
       |   (0.3kg - Stack) |                   |               |
       +-------------------------------------------------------+
       |   Mochila Expandida: 6/12 Slots | Peso Máximo: 2.1 / 10kg  |
       +-------------------------------------------------------+
```

### 1.1 Slots e Mecânica de Grade Dinâmica
* **Estrutura de Slots Fixos**: O inventário inicial possui um limite de 8 slots físicos. Pode ser expandido para até 12 slots através da aquisição de tiras extras de fivela no mapa de jogo (*Backpack Upgrades*).
* **Weight System (Sobrecarga Dinâmica)**:
  * Cada item possui uma massa computada em quilogramas (kg). O peso limite padrão que o jogador pode carregar sem penalidades de fadiga é de 10.0kg.
  * **Fadiga por Excesso de Peso**: Se o limite for excedido (de 10.1kg a 15.0kg), o `Player Needs System` penaliza a taxa de consumo de stamina/fadiga em até 150% e aumenta o ruído produzido por passos em solo áspero. Se ultrapassar 15.0kg, a velocidade de corrida do jogador é travada.
* **Item Durability & Stacking (Degradação e Empilhamento)**:
  * **Durabilidade**: Equipamentos como câmeras de visão noturna e lanternas sofrem microfissuras e oxidação em contato com umidade ou poeira de anomalias, reduzindo sua eficiência de focar a iluminação ou qualidade de áudio de gravação.
  * **Regras de Empilhamento (Stack Limit)**: Recursos pequenos e repetidos acumulam-se sob o mesmo slot físico para economizar espaço espacial:
    * *Baterias comuns*: Pilhas de até 4 unidades por slot.
    * *Sinalizadores (Flares)*: Até 3 unidades por slot.
    * *Injetores Químicos de Adrenalina*: Máximo de 2 unidades por slot.
    * *Equipamentos Científicos*: Itens únicos (1 por slot).

### 1.2 Raridade de Equipamentos e Consumíveis
Para alimentar a progressão tática, os recursos do cenário são distribuídos em patamares de qualidade operacional:
* **Comum (Sinalizadores, Baterias fracas)**: Encontrados em abundância no Setor Administrativo e Hospital. Baixa durabilidade ou curto tempo de autonomia energética.
* **Raro (Bateria recarregável de alta densidade, kits médicos cirúrgicos)**: Geralmente trancados em armários blindados de laboratório ou gavetas lacradas em necrotérios.
* **Lendário (Scanner experimental de espectro de radiação, Injetor militar de contenção de stress)**: Apenas 1 ou 2 unidades existem em todo o mapa do Abismo. Possuem propriedades exclusivas, como imunidade completa ao consumo de bateria por 1 minuto ou recarga total instantânea de sanidade.

### 1.3 Containers, Storage e Quick Access (Armazenamento Físico)
* **Storage Safeboxes (Baús de Segurança)**: Localizados exclusivamente nas *Safe Zones* do jogo. Permitem que o jogador descarregue pertences raros ou pesados para uso posterior. Os baús compartilham seu inventário de forma unificada no subsolo da Usina e na Capela via rede pneumática virtualizada.
* **Quick Access Radial Menu (Acesso Rápido)**: O jogador pode vincular até 4 consumíveis em seu cinto táctico. Pressionar as teclas direcionais permite o uso imediato de baterias ou kits de cura sem a necessidade de olhar e abrir a mochila completa.

---

## 2 — EQUIPAMENTOS ELETRÔNICOS E CIENTÍFICOS (EQUIPMENT SUITE)

Os equipamentos do *Project Abyss* não são armas de letalidade direta, mas ferramentas científicas e ópticas essenciais de navegação, mapeamento e sobrevivência passiva.

```
       +-----------------------------------------------------------+
       |                  EQUIPMENT OPERATIONAL MATRIX             |
       +-----------------------------------------------------------+
       |   1. CAMERA       -> Visão Noturna infravermelha (VRAM)   |
       |   2. FLASHLIGHT   -> Foco concentrado de luz direcional    |
       |   3. WALKIE TALKIE-> Escuta anomalias / Frequência        |
       |   4. SCANNER      -> Revela trajetórias e riscos químicos |
       +-----------------------------------------------------------+
```

### 2.1 Câmera e Visão Noturna (The Rec Camera Engine)
O gravador de vídeo do protagonista é sua lente para navegar pelo breu absoluto do Abismo:
* **Night Vision (Visão Noturna)**: Consome baterias em ritmo acelerado. Projeta uma varredura infravermelha monocromática verde na tela.
  * **Efeito de Grão e Filtro**: O pós-processamento de renderização simula distorções eletromagnéticas e ruídos de compressão digital analógica ao se aproximar de anomalias bio-orgânicas.
* **Audio Recorder (Gravador de Áudio Direcional)**:
  * Permite captar picos sutis de áudio acústico através de paredes e tetos.
  * Exibe um analisador de espectro de áudio digital (*Audiometer*) em tempo real na interface da câmera, dando ao jogador pistas se o monstro está no duto de ventilação imediatamente acima dele.

### 2.2 Lanterna e Equipamentos de Detecção Avançada
* **Flashlight (Lanterna Direcional de Alta Intensidade)**:
  * Projeta uma mancha de luz PBR brilhante com foco dinâmico configurável (feixe largo e disperso vs feixe estreito e perfurante de longo alcance).
  * **Thermal Dissipation**: Usar o feixe forte por muito tempo aquece o circuito interno, fazendo a lâmpada falhar de forma temporária até resfriar, exigindo gerenciamento cuidadoso de uso.
* **Walkie Talkie (Detector de Radiação / Frequências)**:
  * Atua como um receptor de ondas estáticas de rádio analógico.
  * Quando uma criatura do Abismo inicia uma transição de spawn próxima, as bobinas do Walkie Talkie começam a sibilar ruídos estáticos brancos cuja frequência aumenta proporcionalmente à proximidade geométrica da ameaça.
* **Scanner Experimental & Scientific Devices**:
  * Emite ondas eletromagnéticas de baixa frequência que iluminam trilhas residuais químicas deixadas pela passagem de monstros (*Luminescent Tracker*). Revela também portas ocultas pintadas com substâncias invisíveis a olho nu.

---

## 3 — REQUISITOS DO JOGADOR E VARIÁVEIS FISIOLÓGICAS (PLAYER NEEDS)

O corpo do protagonista reage de forma física e mecânica aos níveis de pânico e cansaço acumulados no Abismo.

```
                  +-----------------------------------+
                  |      METABOLIC TRAFFIC SYSTEM     |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
  +-------------------+                           +-------------------+
  |    STRESS & FEAR  |                           |     FATIGUE       |
  |  (Trembling/FOV)  |                           | (Slow speed/Sway) |
  +-------------------+                           +-------------------+
            |                                               |
  +-------------------+                           +-------------------+
  | INJURIES/BLEEDING |                           | PHYSIOLOGY SYSTEM |
  | (Limping/Breathing|                           | (Heart Rate Peak) |
  +-------------------+                           +-------------------+
```

### 3.1 O Loop de Medo, Sanidade e Stress
* **Stress & Fear (Fisiologia do Pavor)**:
  * Aumenta progressivamente com o tempo gasto em penumbra total, ao ouvir sussurros fantasmagóricos ou ao ser perseguido diretamente.
  * **Trembling and Vision Distortion (Tremores e Distorção Visual)**: Sob stress elevado (>75%), as mãos do personagem começam a tremer violentamente, tornando as tarefas de recarga de baterias mais lentas e imprecisas. A câmera de visão sofre borrões estocásticos de foco e aberração cromática.
* **Fatigue & Adrenaline (Exaustão e Sobrevivência)**:
  * A fadiga acumula-se com corridas prolongadas ou saltos de obstáculos na Prisão ou Mina.
  * **Adrenaline Peak (Pico de Adrenalina)**: Ativado se o jogador entra em perseguição direta contra um monstro. Zera o cansaço instantaneamente por 15 segundos, permitindo velocidade máxima de corrida contínua sem interrupções por exaustão cardíaca.

### 3.2 Danos Físicos, Lesões e Hemorragias
* **Injuries and Bleeding (Ferimentos e Sangramento)**:
  * **Hemorragia Ativa (Bleeding)**: Golpes recebidos por garras do monstro criam ferimentos abertos que vazam sangue continuamente. O jogador deixa rastros de gotas de sangue no chão de metal, que são usados como rastros olfativos de alta precisão pelas IAs de busca do Abismo.
  * **Limping (Claudicação)**: Se a saúde total cair abaixo de 30%, a locomoção do jogador é fisicamente limitada a andar mancando, forçando gemidos constantes de dor que se propagam pelo NavMesh acústico do mapa.
* **Breathing and Heart Rate (Frequência Cardíaca e Respiração)**:
  * O batimento cardíaco físico do protagonista é simulado com precisão. O ritmo de respiração pode ser controlado pelo jogador segurando o botão de abafamento (`Hold Breath Button`) ao se esconder em armários para evitar ser descoberto pela IA que cheira os orifícios da porta do móvel.

---

## 4 — GERENCIAMENTO ENERGÉTICO E PILHAS DE CONTROLE (BATTERY SYSTEM)

A energia elétrica do Abismo é escassa, instável e representa o maior recurso de troca tática entre a segurança da visão e o breu de morte.

```
       +---------------------------------------------------------------+
       |                      BATTERY POWER NETWORK                    |
       +---------------------------------------------------------------+
       |                                                               |
       |  [Portable Battery] --> Recarrega Câmera / Lanterna           |
       |                                                               |
       |  [Generators]       --> Reativa Luzes e Elevadores de Setor   |
       |                                                               |
       |  [Power Stations]   --> Recarga de Baterias de alta densidade |
       |                                                               |
       +---------------------------------------------------------------+
```

### 4.1 Tipos de Dispositivos e Reabastecimento
* **Flashlight & Camera Batteries (Células Portáteis de Energia)**:
  * Baterias descartáveis encontradas de forma modular em armários e gavetas. Cada bateria comum fornece energia suficiente para 90 segundos de lanterna estável ou 60 segundos de visão noturna da câmera.
* **Portable Rechargeables (Baterias de Alta Capacidade)**:
  * Dispositivos especiais recarregáveis que aceitam até 3 recargas completas antes de se degradarem completamente.
* **Generators & Power Stations (Estações de Força)**:
  * Puzzles espalhados nas subestações elétricas da Usina e do Hospital exigem reativar dínamos hidráulicos manuais ou geradores a diesel para restaurar a rede elétrica de teto de andares inteiros, convertendo permanentemente zonas de pânico em áreas semi-seguras iluminadas.

---

## 5 — ENGENHOS DE FURTIVIDADE E DISTRAÇÃO (STEALTH UTILITIES)

O combate físico letal contra as anomalias do Abismo é fútil. Para sobreviver, o jogador deve dominar o uso de engenhos tácticos e distorções mecânicas de ambiente.

```
       [Jogador encurralado] ---> [Ativa Flare Químico] ---> [Monstro Cego / Desviado]
                                                                     |
                                                                     v
                                                       [Fuga Segura para Esconderijo]
```

### 5.1 Arsenal Utilitário de Furtividade
* **Noise Makers (Geradores de Ruído por Fita)**:
  * Dispositivos mecânicos cronometrados que emitem sons de passos ou alarmes falsos de alta frequência quando ativados no solo, forçando a IA do monstro a mudar sua rota de busca em direção à distração acústica.
* **Flares (Sinalizadores Térmicos Químicos)**:
  * Emitem uma luz vermelha ofuscante por 30 segundos. Servem para iluminar grandes salas na Mina sem gastar pilhas da lanterna e criam uma barreira visual temporária para monstros que possuem sensores ópticos sensíveis a luz intensa, forçando-os a recuar.
* **Traps (Armadilhas Sonoras e de Alarme)**:
  * Sensores de quebra de cabo de aço invisível que disparam alarmes sonoros em áreas opostas ao jogador para despistar perseguições ativas.
* **Temporary Barriers (Bloqueios de Portas)**:
  * Permite usar placas de madeira e pregos ou barras de ferro encontradas no cenário para trancar ou reforçar portas de madeira temporariamente, atrasando a perseguição do monstro em até 10 preciosos segundos.

---

## 6 — ENGENHARIA DE ARTESANATO E CRIAÇÃO (CRAFTING PIPELINE)

O sistema de artesanato da AbyssEngine é um recurso opcional de alta tensão. A criação é feita em tempo real e exige que o jogador mantenha a cabeça fria enquanto combina recursos na mochila sob perigo imediato.

```
       [Frasco Químico] + [Fitas Isolantes] ---> [Combinação de Materiais]
                                                            |
                                                            v
                                            [Consumível: Injetor de Cura]
```

### 6.1 Catálogo de Receitas de Sobrevivência
* **Repair Kit (Kit de Reparo de Aparelhos)**:
  * *Ingredientes*: `Placa Eletrônica Quebrada` + `Fita Isolante` + `Lente de Vidro`.
  * *Efeito*: Restaura a integridade da Câmera ou Lanterna em até 50%, eliminando estalidos de curto-circuito e borrões ópticos na lente.
* **Recharge Solder (Solda de Bateria Improvisada)**:
  * *Ingredientes*: `Fios de Cobre` + `Célula Química Ácida` + `Fusível Queimado`.
  * *Efeito*: Cria uma célula de energia de emergência capaz de alimentar 30 segundos de visão noturna.
* **Emergency Kit (Kit de Cura Rápida de Hemorragias)**:
  * *Ingredientes*: `Gaze Médica` + `Álcool Antisséptico` + `Soro de Coagulação`.
  * *Efeito*: Estanca sangramentos instantaneamente e cura 25% de HP, eliminando rastros de sangue físicos no piso.

---

## 7 — MAPEAMENTO DO SURVIVAL FRAMEWORK NO CMS DA ENGINE

A integração total do Survival Framework com o CMS permite calibrar finamente o nível de tensão do jogo sem alterar a base estrutural de programação:

| Variável Operacional de Sobrevivência | Parâmetro do CMS Correspondente | Efeito Prático na Simulação do Jogo |
| :--- | :--- | :--- |
| **Tempo de Bateria (Flashlight)** | `MonsterEditor.batteryLife` | Controla a taxa de descarga (segundos por bateria) da lanterna do jogador. |
| **Taxa de Pânico (Fear Accumulation)**| `SanityEditor.fearMultiplier` | Ajusta a velocidade de elevação de tremores de câmera e distorções com base na proximidade do monstro. |
| **Densidade de Recursos (Loot Table)** | `MapEditor.lootSpawnProbability`| Determina a quantidade absoluta de pilhas e gaze médica criadas nas gavetas do mapa no início da sessão. |
| **Peso Limite (Backpack Limits)** | `MapEditor.maxCarryWeight` | Define o peso em kg a partir do qual as penalidades de stamina e ruído de passos de sobrecarga são aplicadas. |

---
*Fim do Documento de Engenharia de Sistemas de Sobrevivência. Todos os parâmetros metabolic-fisiológicos, mecânicas de Mochila de Slots, e kits utilitários de furtividade estão prontos para integração sistêmica na AbyssEngine.*
Encoding: UTF-8. All operations completed successfully.
