# PROJECT ABYSS — HORROR AI DIRECTOR ARCHITECTURE (v1.0.0)
**Documento de Especificação de Controle de Tensão Dinâmica, Ritmo, Métricas Comportamentais e Tomada de Decisão do Diretor**  
**Autor:** Principal AI Architect & Systems Designer  
**Status:** Implementado & Aprovado para Simulação (Production Ready)

---

## 1 — MODELO DE FLUXO DA IA DO DIRETOR DE HORROR

O `HorrorDirector` do **Project Abyss** monitora continuamente as ações, falhas, ambientes e o estado biológico do jogador para modular dinamicamente o nível de medo, tensão e ritmo da experiência de jogo. Ele replica o conceito clássico de *AI Director* adaptado estritamente para o suspense psicológico de alta fidelidade.

```
                   ┌───────────────────────────────────────┐
                   │    Player Controller Physiological    │
                   │    - Stress, Sanity, Heartbeat        │
                   └──────────────────┬────────────────────┘
                                      │ Coleta Dados de Simulação
                                      ▼
                   ┌───────────────────────────────────────┐
                   │        AI Director Input Layer        │
                   │  - Exploration Rate, Darkness Ratio   │
                   │  - Recent Noises, Mistakes Count      │
                   └──────────────────┬────────────────────┘
                                      │
         ┌────────────────────────────┴────────────────────────────┐
         ▼                                                         ▼
┌──────────────────┐                                      ┌──────────────────┐
│ Behavior Profile │                                      │ Pacing Engine    │
│  - Stealthy      │                                      │  - Calm State    │
│  - Reckless      │                                      │  - Build-up      │
│  - Panicked      │                                      │  - Peak Terror   │
│  - Normal        │                                      │  - Fading Out    │
└────────┬─────────┘                                      └────────┬─────────┘
         │                                                         │
         └────────────────────────────┬────────────────────────────┘
                                      │ Avalia Situação & Ritmo
                                      ▼
                   ┌───────────────────────────────────────┐
                   │      Horror Director Decisions        │
                   └──────────────────┬────────────────────┘
                                      │
         ┌──────────────┬─────────────┼──────────────┬─────────────┐
         ▼              ▼             ▼              ▼             ▼
  ┌──────────┐   ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐
  │  Spawn   │   │  Sons    │  │ Apagões  │   │Entidades │  │ Ilusões  │
  │ Recursos │   │ Ambientais│ │ (Power)  │   │  Reais   │  │ Visuais  │
  └──────────┘   └──────────┘  └──────────┘   └──────────┘  └──────────┘
```

---

## 2 — DETALHAMENTO DE MÉTRICAS E TOMADA DE DECISÃO

### 2.1 — MONITORAMENTO DE MÉTRICAS COMPORTAMENTAIS (INPUTS)
O Diretor processa as seguintes métricas em tempo real a cada atualização do ciclo de ticks:
* **Fear (Medo)**: Um índice integrado calculado dinamicamente correlacionando o tempo cumulativo na escuridão completa, estresse fisiológico do player, batimentos cardíacos elevados e erros acumulados.
* **Darkness Ratio (Proporção de Escuridão)**: Relação percentual entre o tempo que o player passou na escuridão sem lanterna ou visão noturna ativa e o tempo de jogo total.
* **Mistakes & Noise Tracker (Registro de Erros)**: Rastreia ruídos bruscos gerados pelo jogador ao correr desnecessariamente ou colidir com elementos do cenário.
* **Player Behavior Profiler (Perfil Comportamental)**:
  * **Stealthy (Furtivo)**: Movimentação silenciosa, agachado e pouca propagação de ondas de ruído.
  * **Reckless (Imprudente)**: Corridas contínuas, alto ruído e lanterna ligada o tempo todo.
  * **Panicked (Em Pânico)**: Batimentos acima de 140 BPM, alto estresse e oscilações caóticas de movimento.

### 2.2 — MÁQUINA DE ESTADOS DE PACING (CURVA DE TENSÃO)
A curva de tensão do Diretor de Horror alterna entre quatro estados estratégicos para evitar a fadiga de adrenalina do usuário e maximizar o impacto do suspense:
1. **Calm (Calmaria)**: Período de exploração segura e coleta de recursos básicos. A tensão cai gradualmente.
2. **Build-up (Acúmulo de Tensão)**: Sinais sutis de terror começam a surgir (lâmpadas piscando, sons de arrastado, portas abrindo devagar).
3. **Peak (Ápice do Terror)**: Clímax de medo. Interações agressivas, apagões totais de fusíveis, e perseguição ativa por stalkers reais ou ilusões físicas.
4. **Fading (Descompressão)**: O perigo recua. Entidades são despachadas silenciosamente e o jogador ganha fôlego para restabelecer seus vitais.

### 2.3 — SISTEMA DE DECISÕES DO DIRETOR (OUTPUTS)
A partir do estado de pacing, o Diretor escolhe e publica no barramento global de eventos (`EventBus`) as seguintes ações reativas:
* `spawn`: Criação física e procedural de munições ou baterias de lanterna se o jogador estiver à beira de ficar sem luz.
* `sound`: Geração de sons dinâmicos 3D (sussurros misteriosos, batidas no encanamento, passos no teto).
* `blackout`: Sobrecarga elétrica que desliga circuitos de luz e drena temporariamente a potência de lanternas.
* `entity_spawn`: Liberação de criaturas abissais reais próximas ao jogador para perseguições táticas.
* `illusion`: Projeção de vultos, sombras fantasmagóricas rápidas nos limites da visão do jogador que desaparecem ao focar a lanterna.

---

## 3 — REGRAS DE INTEGRAÇÃO E RITMO DE DESEMPENHO

O serviço `HorrorDirector` é acoplado diretamente ao `PlayerController` e ao `Renderer` através do container central. Toda decisão é balanceada de acordo com as constantes de pacing descritas para garantir um ciclo de gameplay imersivo, estável e livre de sobrecarga de memória na GPU e CPU.
