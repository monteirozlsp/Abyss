# PROJECT ABYSS — HORROR GAMEPLAY FRAMEWORK (v2.4.0)
**Manual de Engenharia de Mecânicas de Horror, Movimentação Furtiva e Feedback Sensorial AAA**  
**Autores:** Lead Gameplay Engineer & Director of Horror Design  
**Status:** Especificação Técnica Aprovada para Implementação Core

---

## VISÃO GERAL DO HORROR GAMEPLAY FRAMEWORK
Este documento estabelece as especificações de design e engenharia para a camada de jogabilidade de horror da **AbyssEngine v2.4.0**. O framework coordena interações de movimentação de alta fidelidade física, sistemas adaptativos de perseguição e esconderijo, simulações sistêmicas de tensão cardiovascular e deformações procedurais de renderização voltadas para feedbacks sensoriais imersivos de pânico.

```
       +-------------------------------------------------------------------------------------------------+
       |                                   HORROR GAMEPLAY CORE INTERACTION                              |
       +-------------------------------------------------------------------------------------------------+
       |                                                                                                 |
       |  [Controle do Jogador] ----> [Hiding / Lean & Peek / Breath] ----> [Tension System (HeartRate)]  |
       |               |                                                            |                    |
       |               v                                                            v                    |
       |  [Chase / Adaptive AI] <=====> [Hallucinations / Reality Shifts] <=====> [Feedback / CameraFX]  |
       |                                                                                                 |
       +-------------------------------------------------------------------------------------------------+
```

---

## 1 — LOCOMOÇÃO AVANÇADA E MECÂNICAS FURTIVAS (MOVEMENT CONTROLS)

A movimentação física no *Project Abyss* expressa o peso e o estado de pânico do protagonista. Cada ação possui consequências acústicas propagadas diretamente pela malha de navegação (NavMesh).

### 1.1 Catálogo de Estados Físicos de Movimentação
* **Walk & Sprint (Caminhada e Corrida)**:
  * **Walk**: Velocidade base de 2.2 m/s. Produz um ruído acústico de baixa amplitude (raio de 4 metros de propagação).
  * **Sprint**: Velocidade máxima de 4.8 m/s. Consome stamina (fadiga) progressivamente e eleva o nível acústico para um raio de 18 metros.
* **Lean & Peek (Inclinação Lateral)**:
  * Permite ao jogador inclinar o tronco para a esquerda ou direita em até 45 graus mantendo o corpo oculto atrás de colunas ou cantos de corredores.
  * **Camera-Driven Alignment**: Inclinar-se não expõe o colisor de corpo (*Character Controller Capsule*) ao campo de visão visual dos sensores das IAs inimigas, permitindo observar rotas com risco de detecção minimizado.
* **Crouch & Slide (Postura Agachada e Deslize)**:
  * **Crouch**: Velocidade de 1.1 m/s. Silencia quase completamente a emissão de passos (raio de 1 metro). Permite passar por baixo de tubulações caídas na Usina ou frestas na Prisão.
  * **Slide (Deslize de Inércia)**: Se o jogador pressionar o botão de agachar enquanto corre em velocidade máxima, executa um deslizamento horizontal de 2 metros por inércia física, ideal para passar sob portas corta-fogo em fechamento acelerado durante perseguições.
* **Climb & Vault (Transposição e Escalada)**:
  * **Climb**: Escalada vertical de escadas metálicas ou beiradas de dutos de ventilação suspensos na Mina.
  * **Vault**: Pular rapidamente sobre obstáculos de baixa estatura (mesas de autópsia no Necrotério, muretas ou escombros de concreto) mantendo a inércia do movimento.
* **Slow Open vs. Fast Close (Interação Analógica de Portas)**:
  * **Slow Open (Abertura Lenta)**: Pressionar o botão de interação e arrastar o mouse lentamente abre a porta de forma gradual e silenciosa.
  * **Fast Close (Fechamento Violento/Bater)**: Toque rápido na tecla de interação fecha a porta instantaneamente de forma violenta, provocando um estrondo acústico alto (raio de 25 metros) que tranca a porta corta-fogo em um fecho de emergência por alguns segundos para atrasar perseguições.

---

## 2 — SISTEMA INTEGRADO DE ESCONDERIJOS (HIDING ENGINE)

O sistema de esconderijo gerencia a transição segura entre a exploração e a ocultação total do personagem da visão direta da IA.

```
       [Jogador] --- (Entrar em Esconderijo) ---> [Trava Controle / Alinha Câmera]
                                                           |
                                                           v
                                              [Breath Hold Mode (Interação)]
                                                           |
                                                           +---> [Falha]   -> Retirado à Força
                                                           +---> [Sucesso] -> Monstro passa direto
```

### 2.1 Locais de Ocultação e Características
* **Closets (Armários Verticais)**: Oferecem isolamento visual completo (360 graus). Contudo, limitam o campo de visão do jogador a apenas frestas horizontais da porta do armário.
* **Underbeds & Tables (Debaixo de Camas e Mesas)**: Oferecem ocultação parcial. Se o monstro entrar em estado de `HighSuspicion` na sala, ele irá realizar uma varredura visual no nível do solo, exigindo que o jogador se afaste fisicamente do plano de descida visual da criatura.
* **Cabinets & Vents (Móveis Baixos e Dutos)**: Dutos de ar condicionado suspensos fornecem caminhos de trânsito furtivos, mas geram ruídos metálicos se o jogador se mover rápido demais.
* **Dark Corners & Improvised Hiding (Cantos Escuros e Ocultação Improvisada)**:
  * Zonas de escuridão total onde a taxa de iluminação estática do cenário no colisor do jogador é de 0.0.
  * Se o jogador se agachar em um canto escuro e desligar sua lanterna, o sensor óptico do monstro sofre penalidade de detecção de até 90%, passando direto pelo jogador, desde que ele mantenha-se completamente imóvel e não cometa ruídos respiratórios.

### 2.2 Breath Hold Mechanics (Segurar a Respiração)
Ao entrar em esconderijos próximos à criatura, o jogador deve segurar a respiração para mitigar ruídos pulmonares:
* **Hold Breath Interaction**: O jogador deve manter o botão pressionado. O ritmo cardíaco e consumo de oxigênio sobem rapidamente.
* **Panic Threshold (Limite de Oxigênio)**: Se o jogador segurar a respiração por mais de 12 segundos, a tela sofre escurecimento periférico (*Tunnel Vision*) e ao soltar o botão, o protagonista solta um suspiro ofegante alto involuntário de recuperação pulmonar, disparando um evento de áudio alto que atrai a IA imediatamente ao esconderijo.

---

## 3 — MOTOR FISIOLÓGICO DE TENSÃO (TENSION ENGINE)

O `TensionSystem` quantifica em tempo real a reação física do protagonista diante das ameaças, alterando diretamente a simulação cardíaca e o manuseio de ferramentas.

```
       +---------------------------------------------------------------+
       |                         TENSION ENGINE                        |
       +---------------------------------------------------------------+
       |                                                               |
       |  Heartbeat (Sons 3D) <===> Adrenaline (Imunidade à Stamina)   |
       |                                                               |
       |  Stress (Tremores)   <===> Panic (Escurecimento Periférico)   |
       |                                                               |
       +---------------------------------------------------------------+
```

### 3.1 Variáveis e Reações Cardiovasculares
* **Heartbeat & Breathing (Batimento Cardíaco e Respiração)**:
  * O batimento cardíaco varia de 60 BPM (estado calmo) até 180 BPM (durante perseguições intensas ou visualização de anomalias).
  * À medida que o BPM sobe, o som das batidas cardíacas é amplificado diretamente nos fones do jogador, acompanhado pelo som de respiração ofegante, o que abafa ruídos sutis do ambiente (como os passos do monstro).
* **Panic Peaks & Exhaustion (Picos de Pânico e Exaustão)**:
  * Se o monstro quebrar uma porta ou realizar um jumpscare procedural, um `PanicPeak` é disparado, elevando o stress para 100% instantaneamente e induzindo tremores severos na câmera de jogo (*Camera Shake*).
  * **Mental Collapse (Colapso Mental)**: Ao atingir o limite crítico de stress combinado com sanidade abaixo de 10%, o jogador entra em um colapso temporário: sua velocidade de corrida cai pela metade, sua visão fica trêmula e turva, e o personagem solta soluços de pânico descontrolados que denunciam sua coordenada física exata.

---

## 4 — DINÂMICA DE PERSEGUIÇÃO E EVASÃO (CHASE SYSTEM)

O `ChaseSystem` é um loop ativo de gameplay de gato e rato, onde a IA persegue agressivamente o jogador enquanto a engine altera as dinâmicas de áudio e caminhos disponíveis.

```
       [Monstro avista Jogador] ---> [Inicia Chase Mode] ---> [Ativa Música Dinâmica]
                                                                     |
                                                                     v
                                                       [Cálculo de Rotas de Evasão]
                                                                     |
                                                                     +---> Obstáculos (Pulos/Salto)
                                                                     +---> Portas (Quebra/Contorno)
```

### 4.1 Comportamentos do Chase Core
* **Adaptive Pursuit & Obstacle Avoidance (Perseguição Adaptativa)**:
  * A IA do monstro calcula o caminho mais curto usando o NavMesh e prevê onde o jogador tentará cortar caminho.
  * O monstro não tranca em obstáculos físicos simples; ele pula sobre mesas, empurra cadeiras dinâmicas usando o motor de física do jogo e rasga barreiras improvisadas de madeira de forma destrutiva.
* **Door Interaction & Threat Scaling**:
  * Se o jogador fechar uma porta de carvalho pesada no rosto do monstro, a IA decide em frações de segundo entre: esmurrar e quebrar a porta se sua agressividade estiver > 80% (demora 3 segundos) ou desviar sua rota para um duto de ventilação adjacente para tentar flanquear o jogador por trás.
* **Dynamic Tension Music (Áudio Reativo de Caça)**:
  * O sistema de áudio altera as faixas de música de forma procedural. O volume de percussão e a agressividade dos sintetizadores aumentam à medida que o monstro se aproxima da coordenada física do esqueleto do jogador, recuando sutilmente se o jogador consegue quebrar a linha de visão por mais de 5 segundos.

---

## 5 — SISTEMA DE ALUCINAÇÕES E DISTORÇÕES DA REALIDADE (REALITY SHIFT)

O `HallucinationSystem` atua manipulando a renderização visual e a lógica do mapa para simular a decadência mental e paranoia do protagonista.

### 5.1 Catálogo de Distorções Psicológicas
* **Whispers & False Sounds (Vozes e Sussurros Binaurais)**:
  * Sussurros projetados em canais 3D nos fones do jogador. O sistema sussurra pistas falsas de puzzles ou o nome do jogador misturado a sons falsos de fechaduras abrindo atrás do jogador.
* **Fake Monsters & Mimics (Inimigos Fantasmas e Mímicos)**:
  * Clones fantasmas do monstro que surgem do breu total e correm em direção ao jogador, atravessando sua colisão física e evaporando em fumaça preta sem aplicar dano real de HP.
* **Mirrors & Reality Shifts (Espelhos e Corredores Flutuantes)**:
  * No Hospital Psiquiátrico, reflexos de espelho revelam o monstro parado atrás do jogador, mas ao girar a câmera física, a sala encontra-se completamente vazia.
  * **Reality Shift (Distorção Geométrica)**: Alteração procedural na matriz de projeção 3D do mundo. Corredores parecem esticar infinitamente ou salas perdem suas portas de saída se o jogador tentar voltar pelo mesmo caminho sob colapso mental ativo.

---

## 6 — CAMADA DE FEEDBACK DO JOGADOR (POST-PROCESSING EFFECTS)

Os sentimentos do protagonista são traduzidos em inputs de pós-processamento visual de alta fidelidade renderizados diretamente na viewport do navegador:

* **Chromatic Aberration (Aberração Cromática)**: Separação dos canais RGB da tela, intensificada nas bordas para simular o pânico óptico e o aumento da pressão arterial ocular sob perseguição agressiva.
* **Tunnel Vision & Vignette (Efeito de Visão de Túnel)**: Escurecimento gradual e circular das bordas periféricas da tela, limitando a visibilidade focada na zona central ao segurar a respiração ou sofrer exaustão severa de stamina.
* **Film Grain & Noise (Filtro de Ruído Digital/Analógico)**: Injeção de estática e grãos analógicos que reagem à proximidade eletromagnética das anomalias do Abismo, atuando como um sensor visual discreto de perigo.
* **Visual Blur & Screen Distortion (Embaçamento Óptico)**: Perda súbita de foco e embaçamento de profundidade de campo ao sofrer golpes, simulação física de tremores de lente ao sofrer picos severos de stress.

---

## 7 — MAPEAMENTO DO HORROR FRAMEWORK NO CMS DA ENGINE

A integração total do Horror Gameplay Framework com o CMS permite que os designers configurem toda a experiência e balanceamento de medo e interações de forma flexível:

| Parâmetro de Horror no CMS | Variável de Engenharia Mapeada | Evento Reativo / Efeito Prático no Jogo |
| :--- | :--- | :--- |
| **Padrão de Perseguição (AI Chase Mode)** | `MonsterEditor.chaseAgressiveRatio` | Altera a taxa de decisão do monstro de quebrar portas contra dar a volta por rotas alternativas. |
| **Fator de Tremores (Screen Shake Intensity)** | `SanityEditor.cameraShakeFrequency` | Ajusta a força física com que a câmera de jogo treme durante gritos ou perseguições do monstro. |
| **Duração do Segurar Respiração (Max Breath Hold)**| `MapEditor.maxBreathHoldDuration` | Define o tempo limite em segundos que o jogador pode segurar o ar no armário antes do colapso respiratório. |
| **Intensidade das Alucinações (Glitch Levels)** | `SanityEditor.hallucinationSpawnRate` | Determina a taxa de nascimento de clones fantasmas e distorções espaciais por minuto sob baixa sanidade. |

---
*Fim do Documento Técnico de Horror Gameplay. Todos os mecanismos de locomoção de furtividade, segurar respiração sob armários, e feedback ópticos de pânico estão consolidados e integrados no core de arquitetura da AbyssEngine.*
