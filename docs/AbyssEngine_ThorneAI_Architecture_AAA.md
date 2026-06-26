# PROJECT ABYSS — THORNE PREDATOR AI CORE ARCHITECTURE (v1.0.0)
**Documento de Especificação de Inteligência Artificial Adaptativa de Alto Nível (HFSM, GOAP, Árvore de Comportamentos e Percepção)**  
**Autor:** Principal AI Engineer & Principal Gameplay Architect  
**Status:** Implementado & Totalmente Integrado (Production Ready)

---

## 1 — ARQUITETURA MULTI-CAMADA DA IA DO PREDADOR (THORNE)

O predador central do **Project Abyss**, codinome **THORNE**, adota um ecossistema de inteligência artificial de última geração com decisões em três camadas distintas para ditar a navegação tática, agressão adaptativa e horror psicológico contra o jogador.

```
                           ┌─────────────────────────────────┐
                           │      World / Player Stimuli      │
                           │ Sight, Noise, Lantern Intensity │
                           └────────────────┬────────────────┘
                                            │ Capturado pela Percepção
                                            ▼
                           ┌─────────────────────────────────┐
                           │      Sensory Perception         │
                           │ Sight Range, Hearing Sensitivity│
                           └────────────────┬────────────────┘
                                            │ Grava no Buffer
                                            ▼
                           ┌─────────────────────────────────┐
                           │         Memory Logging          │
                           │ Decay Tracker & Route Predictor │
                           └────────────────┬────────────────┘
                                            │ Alimenta Decisões
                                            ▼
                           ┌─────────────────────────────────┐
                           │   HFSM State Machine (Status)   │
                           │ Patrol, Investigate, Hunt, Flee │
                           └────────────────┬────────────────┘
                                            │ Define Metas Gerais
                                            ▼
                           ┌─────────────────────────────────┐
                           │      GOAP Planner (Goals)       │
                           │ Actions: Travel, Track, Attack  │
                           └────────────────┬────────────────┘
                                            │ Escolhe Ação Concreta
                                            ▼
                           ┌─────────────────────────────────┐
                           │ Behavior Tree Execution (Ticks) │
                           │ Selector & Sequence Check Nodes │
                           └─────────────────────────────────┘
```

---

## 2 — DETALHAMENTO DOS COMPONENTES DE IA DE "THORNE"

### 2.1 — MODELO DE SENSORIAMENTO E PERCEPÇÃO (PERCEPTION LAYER)
THORNE possui receptores de estimulação contínua integrados ao loop principal do jogo:
* **Audio Detection (Audição Direta)**: Capta ruídos emitidos pelo jogador em um raio dinâmico de até 30 metros. Movimentos agachados reduzem a captação drástica de sons, enquanto sprints disparam alarmes imediatos na percepção.
* **Light Detection (Receptor de Fótons)**: Se o jogador apontar o feixe da lanterna em direção a THORNE, ele registrará o feixe imediatamente na memória, alterando seus estados de estresse e gerando respostas táticas (como fugir se estiver ferido ou preparar uma emboscada).
* **Direct Sight (Linha de Visão)**: Raycasts de visão cônica com base na iluminação do local. Lugares completamente escuros mitigam a percepção visual do predador, incentivando o jogador a desligar sua lanterna.

### 2.2 — MEMÓRIA ATIVA E PREDIÇÃO DE CAMINHO (MEMORY & PREDICTION)
* **Memory Decay (Decaimento Temporal)**: Cada estímulo capturado é gravado na pilha de memória do predador contendo ID único, tipo de estímulo, peso de relevância e coordenada tridimensional. Esses estímulos decaem lentamente e desaparecem após 45 segundos.
* **Predictive AI Engine (Motor de Predição)**: Permite a THORNE estimar a rota futura do player extrapolando o histórico de suas últimas coordenadas na pilha de memória recente. Com isso, THORNE não corre simplesmente para onde o jogador está, mas sim para onde ele *provavelmente* estará.

### 2.3 — MÁQUINA DE ESTADOS HIERÁRQUICA (HFSM)
Organização linear de alto nível de THORNE que gerencia as prioridades globais do predador:
1. **Patrol (Patrulha Dinâmica)**: Rota de patrulha não-linear pelos setores para monitorar sinais de intrusão.
2. **Investigate (Investigação)**: Ativado ao capturar ruídos ou vislumbrar feixes de luz. Ele move-se sorrateiramente até o ponto exato da perturbação.
3. **Hunt (Perseguição)**: Perseguição de alto risco focada no jogador com aceleração gradativa e ruídos metálicos assustadores.
4. **Ambush (Emboscada)**: THORNE se esconde em dutos ou cantos escuros próximos a pontos de alta probabilidade de passagem do player com base no motor de predição.
5. **Flee (Fuga)**: Recuo estratégico para dutos de ventilação se o player utilizar itens de defesa ou se a lanterna direta ofuscar sua visão sob estresse/medo alto.

### 2.4 — GOAP (GOAL-ORIENTED ACTION PLANNING)
Com base no estado do HFSM, o planejador GOAP gera planos flexíveis compostos por cadeias de ações atômicas. Se THORNE estiver cansado (`isTired`), o plano GOAP recalcula dinamicamente para priorizar `retreat_to_vent` e `rest_recover`, em vez de perseguir tolamente o jogador.

### 2.5 — ÁRVORE DE COMPORTAMENTOS (BEHAVIOR TREE)
Responsável por orquestrar a física, velocidade e caminhos na cena. Seus nós estruturados em seletores e sequências tomam as decisões finais de Tick a cada ciclo:
* **IsFearHigh** $\to$ **FindVentExit**
* **IsTargetInSight** $\to$ **ChargeTarget**
* **HasSuspiciousTarget** $\to$ **MoveToLastKnown**
* **Default** $\to$ **PerformWanderPatrol**

---

## 3 — INTEGRAÇÃO COM O MONSTER EDITOR (CMS)

A arquitetura se conecta de forma bidirecional ao **Monster Editor** do CMS através de eventos reativos (`abyss:monster_settings_changed`). Ao alterar e salvar os parâmetros de agressividade, velocidade ou audição na interface de administração, as propriedades da simulação da IA do predador em tempo de jogo são recalibradas em tempo de execução sem requerer reinicialização da engine.
