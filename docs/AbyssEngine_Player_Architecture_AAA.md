# PROJECT ABYSS — PLAYER CONTROLLER & PHYSIOLOGICAL CORE (v1.0.0)
**Documento de Especificação de Mecânicas de Sobrevivência, Movimento, Fatores Biológicos e Integração de Câmera**  
**Autor:** Principal Gameplay Designer & Lead Systems Architect  
**Status:** Implementado & Aprovado para Simulação (Production Ready)

---

## 1 — ARQUITETURA DE SIMULAÇÃO TÉCNICA DO PLAYER

O `PlayerController` do **Project Abyss** orquestra todas as mecânicas corporais, estados de estresse psicológico e reações fisiológicas reativas em tempo real. Ele simula como o terror do abismo afeta o corpo do personagem de forma física direta (chacoalhada da câmera, respiração pesada, colapso de sanidade).

```
                             ┌──────────────────┐
                             │  Tick (DeltaT)   │
                             └────────┬─────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ Movement States  │         │ Environment Feed │         │ Inventory & Eq.  │
│ - Walk / Sprint  │         │ - Dark Rooms     │         │ - Flashlight Bat │
│ - Crouch / Hide  │         │ - Screams / Noise│         │ - Night Vision   │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │ Calcula Loops Biológicos
                                      ▼
                             ┌──────────────────┐
                             │  Stress Monitor  │
                             └────────┬─────────┘
                                      │ Altera Variações
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Heartbeat      │         │ Breath Intensity │         │ Sanity Depletion │
│ (Base: 70 -> 180)│         │ (Heavy Breathing)│         │ (Visual Noise)   │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │ Converte em Efeitos Físicos
                                      ▼
                             ┌──────────────────┐
                             │ Camera Modifiers │
                             │ - Shake / Bob    │
                             │ - Lean (Lateral) │
                             │ - Crouch Height  │
                             └──────────────────┘
```

---

## 2 — DETALHAMENTO DE SISTEMAS BIOLÓGICOS (VITAL LOOPS)

### 2.1 — HEARTBEAT ENGINE (BATIMENTOS CARDÍACOS)
Os batimentos cardíacos são calculados dinamicamente com base nas interações diretas de estresse, fadiga corporal e deterioração de vida (HP).
$$\text{Heartbeat (BPM)} = \text{Base (70)} + (\text{Estresse} \times 0.8) + (\text{Fadiga} \times 0.5) + ((100 - \text{HP}) \times 0.6)$$
* **Impactos de Alto Batimento (> 100 BPM)**:
  * Desencadeia respiração pesada e audível (propaga som que atrai inteligências artificiais abissais).
  * Adiciona tremores senoidais caóticos na câmera (Camera Shake) para simular pânico e tremores nas mãos do jogador segurando equipamentos.

### 2.2 — STRESS & SANITY SYSTEMS (ESTRESSE E SANIDADE)
* **Estresse**:
  * Aumenta exponencialmente em ambientes escuros quando a lanterna e a visão noturna estão desligadas.
  * Sprints continuados ou ruídos de metal arrastado disparam picos de adrenalina (estresse adicional).
  * Diminui de forma controlada ao esconder-se em armários, dutos ou ao reacender fontes de luz.
* **Sanidade**:
  * Decai gradualmente se o estresse do personagem permanecer acima de 70%.
  * A deterioração extrema da sanidade causa distorções de renderização, aumento do grão de ruído estático na lente e alucinações sonoras em tempo de jogo.

### 2.3 — MOVEMENT MODES & HIDDEN BUFFER
* **Crouch (Agachamento)**:
  * Diminui a altura física da câmera do jogador suavemente de 1.8m para 1.0m de forma interpolada.
  * Reduz a propagação de ruídos de passos em 70%, permitindo infiltrações silenciosas.
* **Sprint (Corrida)**:
  * Consome energia física gerando fadiga acumulada. Ao atingir o limite crítico (100%), o jogador entra em exaustão, sendo impedido de correr até que seus batimentos estabilizem.
* **Lean (Inclinação Lateral)**:
  * Permite inclinar a câmera em $\pm 0.15$ radianos para as laterais (Q / E) para visualizar cantos e corredores sem expor o corpo do personagem a ameaças.
* **Hide (Esconder-se)**:
  * Isola o personagem do ambiente (esconderijos fixos). Diminui drasticamente o estresse e o cansaço do jogador, zerando a emissão de ruídos de movimento.

### 2.4 — INVENTORY & SURVIVAL EQUIPMENT
Compartimento de armazenamento linear para gerenciar fusíveis, chaves de segurança e itens vitais de sobrevivência.
* **Flashlight (Lanterna LED)**: Fornece cone de iluminação limpa e atenua a taxa de acúmulo de estresse na escuridão, mas pode revelar a localização exata do jogador se apontada para ameaças ativas.
* **Night Vision (Visão Noturna)**: Filtro monocromático amplificador de luz que permite movimentação tática no escuro sem projetar luz física no cenário, contudo, drena baterias do inventário e adiciona distorção visual.

---

## 3 — VALIDAÇÃO DE COMPILAÇÃO E TIPOS

O serviço `PlayerController` está totalmente implementado na AbyssEngine com interface estrita `IPlayerController` e registrado no ciclo de bootstrapping global no Kernel, garantindo compilação automatizada impecável e zero sobrecarga de Garbage Collection em tempo de execução.
