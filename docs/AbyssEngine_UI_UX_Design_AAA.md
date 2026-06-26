# PROJECT ABYSS — UI/UX DESIGN SPECIFICATION (v2.4.0)
**Documento de Design de Interface, Experiência do Usuário e Direção Artística de HUD AAA**  
**Autores:** Lead UI/UX Designer, Principal Technical Artist & Director of Experience  
**Status da Especificação:** Aprovada para Implementação de Layouts, Shaders de Tela e Mapeamento de Controles

---

## 1 — DIREÇÃO ESTÉTICA E IDENTIDADE VISUAL (ARTISTIC DIRECTION)

A interface de *Project Abyss* é guiada pelo conceito de **Imersão Opressiva**. Em vez de sobrecarregar o jogador com elementos bidimensionais flutuantes artificiais (*meta-UI*), o design utiliza interfaces **diegéticas** (integradas ao mundo do jogo) e **físicas** (com peso e tempo de interação realista), garantindo que a tensão nunca seja interrompida.

```
+---------------------------------------------------------------------------------------------------------+
|                                    UI ARCHITECTURAL HYBRID SPECTRUM                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   [Diegetic (100% no mundo)] <=====> [Meta-UI (Filtros de Visão)] <=====> [Minimalist (HUD e Menus)]     |
|   * Indicadores em Equipamentos      * Aberração Cromática                * Grade de Inventário         |
|   * Hologramas de Mapa 3D            * Visão de Túnel (Stress)            * Subtítulos de Acessibilidade |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 1.1 Referências de Design e Fusão Estética
* **Dead Space (Interface Diegética)**: Hologramas tridimensionais projetados no espaço físico do jogo pela câmera ou óculos do protagonista, que se alinham com a iluminação do cenário.
* **Alien Isolation (Retro-Futurismo CRT de 1980)**: Telas com linhas de varredura (*scanlines*), tremeliques estáticos, aberração cromática nas bordas dos painéis industriais e paleta monocromática de fósforo verde e âmbar.
* **Outlast (Interface de Lente e Registros)**: O visor da câmera infravermelha atua como a interface de sobrevivência primária, incorporando níveis de bateria digitalizados, zoom analógico e medidores de ganho de som.
* **Resident Evil & The Last of Us (Minimalismo de Sobrevivência)**: Telas de gerenciamento de inventário limpas, modernas, de alto contraste, utilizando grades simétricas fáceis de navegar no controle analógico ou mouse.

### 1.2 Paleta de Cores de Interface (Color Palette)

| Amostra de Cor | Código Hexadecimal | Significado Técnico na Interface | Aplicação Prática no HUD / Menus |
| :---: | :--- | :--- | :--- |
| ![#030712](https://placehold.co/15x15/030712/030712.png) | `#030712` | **Preto Abissal** | Fundo de menus, painéis de inventário e vinhetas periféricas. |
| ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | **Chapa Slate** | Placas de diálogo, cabeçalhos de tabelas e botões neutros. |
| ![#ef4444](https://placehold.co/15x15/ef4444/ef4444.png) | `#ef4444` | **Vermelho Pânico** | Indicador de vida crítica, sangramento, perseguição ativa e erros. |
| ![#eab308](https://placehold.co/15x15/eab308/eab308.png) | `#eab308` | **Ambar Alerta** | Nível de energia baixo, avisos de sistema, missões secundárias. |
| ![#10b981](https://placehold.co/15x15/10b981/10b981.png) | `#10b981` | **Verde Estável** | Safe Zones ativos, vida cheia, recarga completa e confirmações. |
| ![#06b6d4](https://placehold.co/15x15/06b6d4/06b6d4.png) | `#06b6d4` | **Ciano Elétrico** | Scanner ativo, hologramas de mapas, frequência de rádio Walkie. |

### 1.3 Tipografia (Typography System)
* **Fonte Primária (Geral & Textos de Lore): Inter (Sans-serif)**
  * *Uso*: Textos descritivos, relatórios científicos, legendas de áudio e diálogos. Altamente legível em telas de baixa definição e monitores portáteis (como o Steam Deck).
* **Fonte de Destaque (Títulos & HUD Técnico): Space Grotesk**
  * *Uso*: Títulos de menus principais, avisos de sistema, cabeçalhos de seções e marcas de capítulos de história.
* **Fonte Mono (Terminais & Dados): JetBrains Mono**
  * *Uso*: Terminais de computador CRT no Laboratório, códigos de cofres, medidores de bateria, BPM do batimento cardíaco e logs de depuração do CMS.

---

## 2 — MENUS PRINCIPAIS E PAINÉIS DE NAVEGAÇÃO (MENUS & LOBBY UI)

Os menus principais e telas de transição estabelecem a atmosfera do jogo antes mesmo do jogador carregar o cenário 3D.

```
       +-----------------------------------------------------------+
       |               PROJECT ABYSS - MAIN LAUNCHER               |
       +-----------------------------------------------------------+
       |                                                           |
       |  [ SINGLE PLAYER CAMPAIGN ] -> Novo Jogo / Carregar Save  |
       |  [ CO-OP MULTIPLAYER ]      -> Server Browser / Host      |
       |  [ SYSTEM SETTINGS ]        -> Video, Audio, Accessibility|
       |  [ COLLECTIBLE ARCHIVES ]   -> Documentos e Áudios Coletad|
       |  [ EXIT TO SYSTEM ]                                       |
       |                                                           |
       +-----------------------------------------------------------+
       | v2.4.0-Beta | Ping: 24ms | Conexão: AbyssCloud Online     |
       +-----------------------------------------------------------+
```

### 2.1 Menu Principal (Main Menu UI)
* **Fundo de Atmosfera Dinâmico**: Renderização tridimensional em tempo real do corredor escuro do Hospital, com lâmpadas piscando em intervalos aleatórios programados e sombras móveis projetadas.
* **Composição de Som**: Um som ambiente industrial de baixa frequência (*drone*) combinado com sussurros binaurais que se deslocam suavemente entre os canais estéreo esquerdo e direito.
* **Transições Visuais (Efeito Glitch)**: Selecionar botões do menu provoca pequenas franjas de aberração cromática e perda momentânea de sinal de fósforo na fonte do texto, imitando uma fita VHS se desgastando.

### 2.2 Navegador de Servidores e Painel Party (Lobby UI)
* **Server Browser Grid**:
  * Tabela limpa listando as salas cooperativas públicas ativas. Filtros rápidos para ordenar por: *Ping*, *Vagas (1/4)*, *Dificuldade* e *Setor Atual (Ex: Hospital)*.
* **Party Panel (Membros do Grupo)**:
  * Exibe os avatares tridimensionais dos até 4 sobreviventes posicionados lado a lado em uma sala de recepção industrial escura.
  * Mostra o indicador de ping de cada jogador em tempo real e se o microfone está detectando ruído acústico através de um indicador de onda de rádio animado ao lado de seu apelido.

### 2.3 Tela de Pause (Pause Menu)
* **Single Player (Pausa Real)**: Interrompe completamente o loop de simulação física do jogo. Oferece botões rápidos para: `Retomar`, `Reiniciar Checkpoint`, `Layout de Controles`, `Configurações` e `Sair para o Menu Principal`.
* **Co-op Multiplayer (Sem Pausa)**: Abrir o menu de pausa **não congela o jogo**. A tela é sobreposta em formato de visor semi-transparente fosco à esquerda, enquanto o monstro pode continuar caçando o jogador em tempo real no fundo, mantendo a tensão inquebrável.

---

## 3 — INTERFACE DENTRO DO JOGO (INGAME DIEGETIC HUD)

O HUD do *Project Abyss* reduz a poluição visual a zero. Não existem barras de vida verdes flutuantes ou números de stamina flutuando na tela de exploração.

```
+---------------------------------------------------------------------------------------------------------+
|                                    DIEGETIC CAMERA OVERLAY VIEWPORT                                     |
+---------------------------------------------------------------------------------------------------------+
|  [REC] 🔴 00:14:26                                                           BATERIA: [IIII.  ] 72%     |
|  ZOOM: 1.0x                                                                                             |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|                                            ( FEIXE LANTERNA )                                           |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|  AUDIO: _/\__/\_ 12dB                                                          SYS: STABLE [ 74 BPM ]   |
+---------------------------------------------------------------------------------------------------------+
```

### 3.1 Camadas do Visor da Câmera (Outlast / Camcorder View)
Quando o jogador ativa o gravador de vídeo (Câmera), a viewport exibe elementos simulados de lente técnica:
* **Indicador REC**: Um círculo vermelho brilhante piscando no canto superior esquerdo acompanhado do carimbo de data e hora simulado do sistema.
* **Grid de Bateria (Battery Meter)**: No canto superior direito, segmentado em 4 barras horizontais e um percentual numérico (ex: `72%`). Quando resta apenas 1 barra, o ícone pisca em Ambar Alerta, e abaixo de 10% em Vermelho Pânico.
* **Espectrograma de Áudio Direcional**: No canto inferior esquerdo, uma barra horizontal síncrona com o volume de áudio acústico captado nos arredores, oscilando em ondas senoidais realistas (*waveform*).
* **BPM Heart Rate Monitor**: Integrado à câmera, exibe a frequência cardíaca biológica do protagonista sob a forma de dados digitais em tempo real (ex: `[ 74 BPM ]`). A cor transiciona de verde (calmo) para amarelo (alerta) e vermelho pulsante (stress severo/perseguição ativa).

### 3.2 Indicadores Biológicos Não-Diegéticos (Post-Processing Vignettes)
Quando a câmera está guardada, o estado físico do jogador é comunicado por alterações periféricas na própria tela:
* **Vinheta de Sangramento (Bleeding Overlays)**: Pulsações carmistas e viscosas nas bordas externas da tela síncronas com o BPM do coração.
* **Visão de Túnel de Exaustão (Stamina Vignette)**: Escurecimento fosco e borrado que se fecha em direção ao centro da tela ao correr exaustivamente ou segurar a respiração de forma prolongada.
* **Distorções de Sanidade (Sanity Aberration)**: Pequenos surtos de aberração cromática, perda de saturação de cor que deixa o ambiente momentaneamente acinzentado e grãos de poeira estáticos flutuantes que surgem quando a sanidade despenca abaixo de 40%.

---

## 4 — DESIGN DA GRADE DE INVENTÁRIO (INVENTORY MATRIX & CONTAINERS)

A tela de inventário é desenhada em formato de painel tático moderno de grade simétrica de alto contraste, otimizado para navegação ultra-veloz.

```
+---------------------------------------------------------------------------------------------------------+
|                                        TACTICAL INVENTORY SCREEN                                        |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   🎒 MOCHILA EXPANDIDA ( 5 / 8 SLOTS )                                🔍 INSPEÇÃO DE ITEM (3D)          |
|   +---------------+---------------+---------------+                   +-----------------------------+   |
|   | 📹 CAMERA     | 🔋 BATERIA x3 | 🩹 GAZE MED.  |                   |                             |   |
|   | (1.2kg - 94%) | (0.3kg - STK) | (0.4kg - STK) |                   |          [ MALHA 3D ]       |   |
|   +---------------+---------------+---------------+                   |          [ ROTATIVA ]       |   |
|   | 🔦 LANTERNA   | 🟥 SINALIZADOR| [ BLOQUEADO ] |                   |                             |   |
|   | (0.8kg - 45%) | (0.2kg - STK) |               |                   |                             |   |
|   +---------------+---------------+---------------+                   +-----------------------------+   |
|                                                                       | Cartão de Acesso Bunker     |   |
|   PESO TOTAL: 2.9 / 10.0 kg (Sem Sobrecarga)                          | Nível de Segurança: Classe 3|   |
|                                                                       | "Uso restrito ao subsolo."  |   |
+---------------------------------------------------------------------------------------------------------+
```

### 4.1 Organização de Painéis e Telas
* **Painel Esquerdo (Mochila de Slots)**:
  * Exibe a grade de caixas com bordas finas de 1 pixel e cor neutra Slate.
  * Cada slot possui uma barra de progresso horizontal em miniatura indicando a durabilidade do item ou carga energética restante.
* **Painel Direito (Inspeção 3D de Items)**:
  * Ao selecionar um item, uma versão tridimensional rotativa do objeto é renderizada em tempo real no painel à direita.
  * O jogador pode rotacionar a malha do item usando o mouse ou analógico para inspecionar marcas gravadas (como números de série de chaves ou pistas escritas atrás de fotos coletadas).
  * Exibe a ficha técnica com massa (kg), tipo de stack, descrição narrativa de lore e receitas de crafting compatíveis.
* **Split Container UI (Baús e Armários de Compartilhamento)**:
  * Ao interagir com uma Safebox em uma *Safe Zone*, a tela se divide simetricamente: à esquerda exibe-se a Mochila do Jogador, e à direita o inventário de armazenamento do Baú, permitindo a transferência rápida de itens arrastando-os com o cursor ou com o toque de um botão rápido (`Transfer Item Shortcut`).

### 4.2 Menu Radial de Acesso Rápido (Quick Access Radial Menu)
* Mantendo pressionada a tecla de atalho rápido (ex: `TAB` ou `LB`), o jogo desacelera a simulação em 80% (apenas em Single Player) e projeta um menu circular elegante centralizado na tela.
* Dividido em 4 quadrantes principais (Norte, Sul, Leste, Oeste), permitindo selecionar e equipar instantaneamente: *Lanterna*, *Câmera de Visão*, *Walkie Talkie* ou *Injetores de Cura*.

---

## 5 — TELA DE MAPA E ROTEIRO DE MISSÕES (MAP SCREEN & JOURNAL)

### 5.1 O Mapa Holográfico 3D (The Diegetic Holomap)
O mapa não é uma imagem 2D plana opaca na tela. Inspirado em *Dead Space*, ele é projetado física e volumetricamente à frente do jogador:
* **Projeção de Linha de Grade**: Renderizado como um modelo de grade wireframe tridimensional flutuante e de cor Ciano Elétrico translúcida.
* **Dynamic Alignment**: A projeção do mapa move-se suavemente junto com a respiração física do peito do personagem. Se o jogador sofrer um ataque ou correr repentinamente, o holograma do mapa pisca, sofre estática digital e fecha-se de forma abrupta.
* **Representação de Status**: Corredores seguros são destacados em linhas verdes fracas; caminhos de portas lacradas ou sem fusível de força brilham em Vermelho Pânico.

### 5.2 Roteiro de Missões e Colecionáveis (Quest Tracker & Lore Logs)
* **Quest Tracker (Painel de Metas Ativas)**:
  * Slide-in elegante localizado discretamente no canto superior direito da tela sempre que uma nova meta é adicionada ou atualizada.
  * Consiste em uma caixa de texto minimalista com caixas de verificação (*checkboxes*) simples que se preenchem com uma animação de corte de traço rápido ao completar sub-etapas (ex: `[x] Ligar Válvula de Água`).
* **Lore Journal (Diários Coletados)**:
  * Aba dedicada no menu principal contendo todos os diários de texto coletados, fotos históricas e fitas de áudio do Abismo.
  * **Audio Player Integrado**: Permite reproduzir fitas cassetes em segundo plano enquanto o jogador continua explorando o cenário. Apresenta controles de rebobinar, avançar e um espectrógrafo de fita analógica decorativo se movendo.

---

## 6 — TELAS DE MORTE E CARREGAMENTO (DEATH & LOADING SYSTEMS)

### 6.1 Tela de Morte (Death Screen UI)
A transição para a morte do protagonista no Abismo evita cortes bruscos, estendendo a atmosfera melancólica de horror:
* **Sequência de Morte**: Quando a saúde do jogador atinge zero, a câmera tomba fisicamente em direção ao solo com aceleração gravitacional e a tela perde saturação, tornando-se monocromática preta e branca.
* **Visual EKG cardíaco**: Uma linha de monitor cardíaco verde no centro da tela começa a bater devagar e de forma instável até se transformar em uma linha contínua horizontal (*flatline*) acompanhada de um bip constante abafado.
* **Citações Psicológicas**: Frases curtas e paranoicas sobre o Abismo surgem de forma fade-in e lenta no centro da tela (ex: *"As paredes ouvem o seu desespero. O silêncio era a única saída legítima."*).
* **Painel de Opções**: Botões sutis de transição surgem na escuridão: `Tentar Novamente` (recarrega o último checkpoint de forma ultra-veloz em 1 segundo), `Carregar SaveGame` e `Sair para o Menu`.

### 6.2 Tela de Carregamento (Loading Screen CRT)
* **Estética de Boot de Computador Industrial**: O carregamento simula a tela de inicialização do sistema DOS de um computador antigo da Usina de 1980.
* **Logs Interativos**: Linhas de texto digitam-se de forma procedural na tela, simulando a checagem de integridade de núcleos do reator e sistemas de ar comprimido:
  `SYS_CHECK: REACTOR CORE PRESSURE [ OK ]`  
  `SYS_CHECK: BIO-WASTE CONTRAINMENT [ HAZARD DETECTED ]`  
  `SYS_CHECK: SANITY ENGINE [ EXHAUSTION OVERFLOW ]`
* **Dicas de Gameplay**: Linhas de logs pintadas em âmbar alerta exibem pistas lógicas e táticas de sobrevivência de forma discreta (ex: *"DICA_04: O monstro Thorne tem audição aguçada; correr ou bater portas corta-fogo revela sua coordenada instantaneamente."*).

---

## 7 — ACESSIBILIDADE, LOCALIZAÇÃO E SUPORTE DE PLATAFORMAS (ACCESSIBILITY)

Para garantir que a experiência aterrorizante de *Project Abyss* seja universal e confortável para todos os perfis de jogadores, a engine inclui uma suíte completa de recursos de acessibilidade e customização de interface.

```
       +---------------------------------------------------------------+
       |                   ACCESSIBILITY ENGINE GRID                   |
       +---------------------------------------------------------------+
       |                                                               |
       |  Subtitles (CC & Direcional)   <===> HUD Scale (80% - 140%)   |
       |                                                               |
       |  ColorBlind (Pro/Deu/Tri)      <===> Haptic Vibration Profiles|
       |                                                               |
       +---------------------------------------------------------------+
```

### 7.1 Sistema Avançado de Legendas (Subtitle Engine)
* **Closed Captions (CC completo)**: Além das falas de diálogos de rádio, as legendas traduzem efeitos sonoros críticos no ambiente (ex: `[Passos pesados no duto de ventilação acima]`, `[Vapor pressurizado vazando ao longe]`).
* **Indicadores Direcionais**: Legendas importantes incluem pequenas setas direcionais em suas bordas laterais que apontam para a origem tridimensional da fonte do som no espaço 3D (ex: `<- [Gemido de dor abafado]`).
* **Personalização Completa**: Painel de configurações dedicado permite ajustar:
  * **Tamanho de Fonte**: De 14px a 28px.
  * **Fundo de Opacidade**: Um retângulo preto semi-transparente atrás do texto com opacidade configurável de 0% (invisível) a 100% (sólido) para maximizar o contraste.
  * **Bordas e Sombras**: Sombra projetada de 2 pixels de espessura para garantir leitura legível sobre fundos muito claros ou focos de luz da lanterna.

### 7.2 Modos de Daltonismo e Contraste (Color Blind Modes)
* **Filtros de Simulação por Shader**: Aplicação em nível de WebGPU/WebGL de filtros matemáticos de correção cromática para os três tipos de daltonismo mais comuns:
  * **Protanopia** (Dificuldade com vermelho).
  * **Deuteranopia** (Dificuldade com verde).
  * **Tritanopia** (Dificuldade com azul/amarelo).
* **Ajuste de Intensidade**: Slider dinâmico que calibra a taxa de saturação e mistura do shader de daltonismo de 0% a 100%.
* **Interface Simbólica Alternativa**: Em painéis de puzzles de fiação elétrica e conectores químicos, cores repetidas são acompanhadas por marcações geométricas e símbolos unificados (ex: fios vermelhos possuem pequenas ranhuras verticais, fios amarelos possuem marcas triangulares).

### 7.3 Reduções de Desconforto e Motion Sickness
* **Camera Shake Control**: Slider que permite reduzir ou desativar completamente os tremores de câmera agressivos disparados por perseguições ou picos de pânico, atenuando vertigens causadas por movimentação caótica de viewport.
* **Motion Blur Toggle**: Chave liga/desliga para efeitos de desfoque por velocidade e distorções periféricas de visão de túnel.

### 7.4 Suporte de Controles e Otimização Steam Deck
* **Full Controller Mapping & Glyph Adaptors**:
  * Mapeamento nativo para gamepads padrões de Xbox, DualSense (PlayStation) e Nintendo Switch.
  * Os glifos de botões representados na tela de inventário e avisos mudam de forma reativa e automática dependendo do último input físico de hardware detectado pelo sistema de jogo.
* **Steam Deck Verification Ready**:
  * **Dynamic Font Scaling (Modo Portátil)**: Ao detectar a resolução padrão de `1280x800` da tela integrada do Steam Deck, a interface ativa automaticamente o perfil de interface *HighDensityUI*, aumentando em 20% a escala de todas as fontes textuais e expandindo o tamanho físico das caixas dos slots do inventário para garantir leitura confortável em painéis portáteis de 7 polegadas.
  * **Haptic Vibration Curves**: Uso das faixas de vibração de motores hápticos precisos nos gatilhos dos controles analógicos para comunicar o batimento cardíaco biológico do personagem e vibrações magnéticas ao se aproximar de anomalias espaciais.

---

## 8 — MAPEAMENTO DA SUÍTE DE UI/UX NO CMS DA ENGINE

A integração total do UI/UX Framework com o CMS permite calibrar a renderização visual e suportes de plataforma de forma modular e centralizada:

| Configuração Editorial no CMS | Parâmetro de Sistema Mapeado | Evento no Jogo / Comportamento de Renderização |
| :--- | :--- | :--- |
| **Idioma Padrão (Localization)** | `SystemSettings.defaultLanguage` | Carrega e traduz todas as strings de diários, menus e legendas com base no arquivo JSON correspondente. |
| **Escala Global do HUD** | `SystemSettings.hudScaleMultiplier`| Multiplicador de viewport que redimensiona dinamicamente caixas de bateria, espectrografia de áudio e indicadores do visor. |
| **Sensibilidade de Vibrar** | `SystemSettings.hapticStrength` | Multiplicador de amplitude para efeitos de curvas e impulsos hápticos transmitidos ao controle do jogador. |
| **Opacidade de Fundo (CC)** | `AccessibilitySettings.subtitleBgAlpha`| Define a taxa de transparência alfa do retângulo preto que envolve as Closed Captions de diálogos e sons ambientes. |

---
*Fim da Especificação de UI/UX e Direção Artística de Interface. Todas as diretrizes de visores de câmera infravermelhos, mapas tridimensionais holográficos de grade, e suportes adaptativos para Steam Deck e acessibilidade para daltonismo estão consolidadas e prontas para integração na AbyssEngine.*
Encoding: UTF-8. All operations completed successfully.
