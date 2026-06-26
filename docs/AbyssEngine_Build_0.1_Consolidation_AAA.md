# PROJECT ABYSS — MASTER CONSOLIDATION & BUILD 0.1 SPECIFICATION
**Documento Consolidado de Especificações Técnicas, Ciclo de Gameplay de 20 Minutos e Suíte do CMS**  
**Autor:** Principal Systems Architect & Gameplay Director  
**Status:** Build 0.1 Homologada para Produção (60 FPS Target)

---

## 1 — DIAGRAMA DE FLUXO GERAL DA BUILD 0.1 (PLAYABLE SYSTEM)

O fluxo a seguir mapeia a integração de todos os microsserviços integrados no `Kernel` (Core), respondendo de forma reativa a cada decisão do `HorrorDirector` e ao processamento de estados de **THORNE** (`ThorneAI`):

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      NÚCLEO CENTRAL (ABYSS KERNEL)                     │
 │  - Instancia todos os microsserviços do ServiceContainer               │
 │  - Controla o loop principal de simulação e batimento (60 Ticks/s)      │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ PlayerController │       │ HorrorDirector   │       │ ThorneAI         │
│  - HP, Stamina   │       │  - Medo, Estresse│       │  - HFSM / GOAP   │
│  - Sanity (ECG)  │       │  - Curva Pacing  │       │  - Percepção BT  │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EVENT BUS (BARRAMENTO GLOBAL)                    │
│  - Transmite eventos assíncronos: barulho, picos de luz, batimentos     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUÍTE CMS (LIVE VIEWPORT)                       │
│  - Hot Reload em tempo real de mapas, diálogos e IA                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2 — OBJETIVOS DA BUILD 0.1 CONSOLIDADOS

### 2.1 — 20 MINUTOS JOGÁVEIS (GAMEPLAY LOOP)
* **Escopo Temporal**: Estruturação de uma curva progressiva de tensão tática que se inicia na calmaria do subsolo do hospital e progride até a fuga pelos dutos de ventilação.
* **Progressão Psicológica**: O primeiro terço (0-7min) foca em ambientação e busca por fusíveis. O segundo terço (7-14min) inicia o comportamento investigativo de Thorne (sons de passos, lâmpadas queimando). O terço final (14-20min) ativa o chase-mode contínuo com depleção crítica de sanidade e pânico total.

### 2.2 — 1 CRIATURA (THORNE)
* **Status**: Codinome THORNE totalmente ativo.
* **Inteligência**: Equipado com o sistema integrado de Árvore de Comportamento (Behavior Tree) para decisões imediatas e GOAP para planejamento de longo prazo baseados em fadiga e agressividade dinâmica.

### 2.3 — 1 MAPA (SANATORIUM SECTOR SEVEN)
* **Status**: Mapa modular gerado e editável em tempo real no CMS.
* **Características**: Contém zonas de sombra total, dutos de ventilação para deslocamento de Thorne, 3 salas de puzzles de fiação elétrica e uma sala de controle trancada.

### 2.4 — 1 PERSEGUIÇÃO (DYNAMIC CHASE MODE)
* **Mecanismo**: Desparado quando Thorne obtém contato visual direto. A música acelera gradativamente utilizando a Web Audio API, e as luzes ao redor começam a piscar caoticamente. O jogador precisa se agachar atrás de objetos, desligar a lanterna e controlar seu ritmo de batimentos cardíacos.

### 2.5 — 1 PUZZLE (FUSÍVEL DO GERADOR PRINCIPAL)
* **Lógica**: Três fusíveis de cobre espalhados pelas salas médicas de forma procedural. O jogador deve encontrá-los e inseri-los no console central sob a escuridão absoluta para religar o circuito de força e abrir a saída de emergência.

### 2.6 — 1 SAVE SYSTEM (ESTADO LOCAL SEGURO)
* **Persistência**: Gravação instantânea do progresso do jogador (itens do inventário, missões ativas, nível de estresse e vida restante) em estado persistente e redundante no local de simulação.

### 2.7 — 1 ALUCINAÇÃO (SHADOW PHANTOM)
* **Mecanismo**: Ativado quando a Sanidade do jogador cai abaixo de 40%. Vultos rápidos cruzam os corredores e sussurros ecoam aleatoriamente nos canais estéreo de som (3D Audio Panning) para desestabilizar a navegação do usuário.

### 2.8 — 1 BLACKOUT TOTAL
* **Mecanismo**: Decisão crítica despachada pelo `HorrorDirector` no estado de Pacing Peak. Desliga todas as lâmpadas estáticas do setor, drena a bateria da lanterna do jogador instantaneamente e força o uso cauteloso das células de Visão Noturna.

### 2.9 — CMS FUNCIONAL (CONTEÚDO COMPLETO)
* **Integração**: Painel de Administração contendo:
  * **Map Editor**: Desenho bidirecional de layouts.
  * **Quest Editor**: Criação e monitoramento de objetivos.
  * **Sanity & Fear Editor**: Configuração milimétrica da fadiga corporal.
  * **Behavior Editor**: Controle das árvores de decisão e HFSM.
  * **Dialogue Editor**: Roteiros e legendas de rádio sincronizadas.
  * **Particle Editor**: Simulador de neblina e poeira em tempo de execução via Canvas 2D.
  * **Audio Editor**: Moduladores de volume e efeitos especiais de reverberação.
  * **Publishing & Versões**: Controle de deploy global em CDN e rollback instantâneo de segurança.

### 2.10 — PERFORMANCE DE DESEMPENHO (60 FPS TARGET)
* **Estratégia de Otimização**:
  * Utilização estrita de **Vertex Pooling** e buffers estáticos no renderizador de partículas para evitar overhead de Garbage Collection.
  * Desacoplamento da simulação de IA de Thorne do loop de renderização (IA roda em frequência controlada de ticks táticos).
  * Redução drástica de chamadas desnecessárias à DOM utilizando o React puramente para gerenciar painéis reativos do CMS.

---

## 3 — CHECKLIST DA ETAPA 24 (CONSOLIDAÇÃO)

- [x] Sincronização estrita de todos os microsserviços (`ThorneAI`, `HorrorDirector`, `PlayerController`) no Kernel global.
- [x] Conexão bidirecional entre o **CMS Monster/Behavior Editor** e o cérebro físico de Thorne através de eventos de janela (`CustomEvent`).
- [x] Implementação do layout de 11 abas do painel administrativo do CMS com design de alta fidelidade e paleta monocromática Slate Dark.
- [x] Criação de simulações físicas integradas no CMS (Monitor Cardíaco ECG e simulador de partículas Canvas 2D).
- [x] Homologação estrita de todos os tipos e interfaces do TypeScript no arquivo centralizado `/src/core/types.ts`.
- [x] Compilação limpa do ecossistema do aplicativo e testes de linter aprovados com sucesso.

---

## 4 — PLANO ALPHA (FASE DE TESTES INTERNOS)

O Plano Alpha visa consolidar as sessões fechadas de teste para calibragem das variáveis biológicas de medo antes da distribuição pública:
1. **Calibragem do Diretor**: Simulação de 100 partidas automatizadas (bots) para ajustar o decaimento de sanidade nas áreas de ventilação.
2. **Stress Test de CPU**: Verificar o impacto do processamento de predição de rotas de Thorne ao rodar em computadores de baixo desempenho (garantir limite inferior de 50 FPS).
3. **Validação Narrativa**: Ajustar a duração de exibição de legendas nas salas de puzzles para evitar corte de áudio do rádio.

---

## 5 — ROADMAP BETA (PRÓXIMOS PASSOS NARRATIVOS)

Após a estabilização da Build 0.1, a Etapa 25 iniciará os preparativos da fase Beta do **Project Abyss**:

```
 ┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
 │      MARÇO / 2026      │      │      ABRIL / 2026      │      │       MAIO / 2026      │
 │  - Multiplayer Co-op   │ ───► │  - Sound Propagation   │ ───► │  - Procedural Maps v2  │
 │  - Sincronismo EventBus│      │  - Raytraced Acoustics │      │  - Final Launch (v1.0) │
 └────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

1. **Procedural Maps v2**: Algoritmo de geração de mapas baseado em ruído perlin para criar layouts de corredores que mudam a cada morte do jogador.
2. **Raytraced Acoustics**: Propagação de som realista pelas curvas das salas de ventilação, permitindo que o jogador ouça Thorne arranhar o metal de direções precisas no ambiente.
3. **Multiplayer Co-op**: Suporte a 2 sobreviventes compartilhando o mesmo barramento de batimentos cardíacos, forçando um a manter a calma enquanto o outro restabelece a fiação elétrica.
