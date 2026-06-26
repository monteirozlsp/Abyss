import { IHorrorDirector, IDirectorMetrics, IDirectorDecision, IServiceContainer, IEventBus, IPlayerController } from "./types";

export class HorrorDirector implements IHorrorDirector {
  public readonly id = "HorrorDirector";
  private container!: IServiceContainer;
  private eventBus: IEventBus | null = null;

  // Active Director pacing & global states
  public tensionLevel = 10; // Starts with base calm tension
  public pacingState: "calm" | "build-up" | "peak" | "fading" = "calm";

  // Detailed Internal Metrics Tracking
  public metrics: IDirectorMetrics = {
    fear: 0,
    stress: 0,
    progression: 0,
    exploration: 10,
    darknessRatio: 0,
    chaseState: false,
    sanity: 100,
    resourcesRatio: 1.0,
    deathsCount: 0,
    mistakesCount: 0,
    playerBehavior: "normal",
  };

  // Internal time accumulators to balance pacing
  private stateTimer = 0;
  private timeInDarkness = 0;
  private totalPlaytime = 0;
  private noiseTracker: number[] = [];
  private decisionHistory: IDirectorDecision[] = [];

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;

    if (this.container.has("EventBus")) {
      this.eventBus = this.container.get<IEventBus>("EventBus");
      this.setupSubscriptions();
    }

    console.info("[HorrorDirector] AI Horror Director initialized and collecting vitals.");
  }

  public async shutdown(): Promise<void> {
    this.decisionHistory = [];
    console.info("[HorrorDirector] AI Horror Director suspended.");
  }

  public update(deltaTime: number): void {
    this.totalPlaytime += deltaTime;
    this.stateTimer += deltaTime;

    if (!this.container.has("PlayerController")) {
      return;
    }

    const player = this.container.get<IPlayerController>("PlayerController");

    // 1. Sincronizar métricas estritas de simulação corporal do Player
    this.metrics.stress = player.stress;
    this.metrics.sanity = player.sanity;

    // 2. Track Darkness Duration
    if (!player.flashlightActive && !player.nightVisionActive) {
      this.timeInDarkness += deltaTime;
      this.metrics.darknessRatio = Math.min(1.0, this.timeInDarkness / Math.max(1, this.totalPlaytime));
    } else {
      this.timeInDarkness = Math.max(0, this.timeInDarkness - deltaTime * 0.5);
    }

    // 3. Dynamic Fear calculation based on multi-variable inputs
    this.calculateFear(player);

    // 4. Analisar comportamento comportamental (Behavior AI Profiling)
    this.analyzePlayerBehavior(player, deltaTime);

    // 5. Atualizar máquina de estados de ritmo (Tension/Pacing State Machine)
    this.updatePacingState(deltaTime);

    // 6. Despachar decisões de direção aleatórias/controladas de tempos em tempos
    if (this.stateTimer >= this.getPacingInterval()) {
      this.stateTimer = 0;
      const decisions = this.evaluateSituation();
      if (decisions.length > 0) {
        this.dispatchDecisions(decisions);
      }
    }
  }

  public incrementMistakes(): void {
    this.metrics.mistakesCount++;
    this.eventBus?.publish("director:mistake", { total: this.metrics.mistakesCount });
    console.warn(`[HorrorDirector] Player made a survival mistake. Count: ${this.metrics.mistakesCount}`);
  }

  public recordDeath(): void {
    this.metrics.deathsCount++;
    this.eventBus?.publish("director:death", { total: this.metrics.deathsCount });
    console.info(`[HorrorDirector] Death logged in telemetry. Total deaths: ${this.metrics.deathsCount}`);
  }

  public registerExplorationDelta(amount: number): void {
    this.metrics.exploration = Math.min(100, this.metrics.exploration + amount);
    // Progresso simulado a partir de exploração geral
    this.metrics.progression = Math.min(1.0, this.metrics.exploration / 100);
  }

  public evaluateSituation(): IDirectorDecision[] {
    const decisions: IDirectorDecision[] = [];

    // Tomada de Decisão com base no Estado de Pacing e Nível de Tensão
    switch (this.pacingState) {
      case "calm":
        // Dar um pequeno susto ou recurso se a tensão estiver excessivamente baixa
        if (this.tensionLevel < 15 && Math.random() < 0.3) {
          decisions.push({
            type: "sound",
            severity: "low",
            description: "Subtle abyssal scratch or distant pipe echo to remind player of isolation.",
            payload: { soundType: "ambient_scratch", volume: 0.35 }
          });
        }
        // Spawn de recursos se estiver zerado de baterias
        if (this.metrics.resourcesRatio < 0.2 && Math.random() < 0.5) {
          decisions.push({
            type: "spawn",
            severity: "low",
            description: "Spawn medical syringe or high-capacity battery nearby.",
            payload: { item: "battery_pack" }
          });
        }
        break;

      case "build-up":
        // Tensão aumentando. Interações fantasmagóricas começam.
        if (Math.random() < 0.6) {
          decisions.push({
            type: "object_flicker",
            severity: "medium",
            description: "Surrounding electric lights flicker and doors creep open slowly.",
            payload: { intensity: 0.8, flickerSpeed: 12 }
          });
        }
        if (Math.random() < 0.4) {
          decisions.push({
            type: "sound",
            severity: "medium",
            description: "Unsettling sound of water dripping combined with human whispering.",
            payload: { soundType: "whispers", pan: Math.random() > 0.5 ? -1 : 1 }
          });
        }
        break;

      case "peak":
        // Ápice do medo. Susto direto, blackouts totais ou spawn de inimigos reais.
        if (this.metrics.fear > 70 && Math.random() < 0.5) {
          decisions.push({
            type: "blackout",
            severity: "critical",
            description: "Complete power failure in current sector. Lights blown entirely.",
            payload: { durationSeconds: 8 }
          });
        }
        if (Math.random() < 0.7) {
          // Spawn de uma ameaça ou ilusão abissal terrível
          const isReal = this.metrics.sanity > 40 && this.metrics.deathsCount < 3;
          decisions.push({
            type: isReal ? "entity_spawn" : "illusion",
            severity: "high",
            description: isReal 
              ? "Instantiate a real Abyssal Stalker crawling in close proximity corridors."
              : "Generate phantom shadowy figure running through the hallway.",
            payload: { entityId: isReal ? "stalker" : "phantom_shadow", distance: 12 }
          });
        }
        break;

      case "fading":
        // Recuperação. Eventos de calmaria, sons confortáveis distantes.
        decisions.push({
          type: "event_trigger",
          severity: "low",
          description: "Despawn active stalker and restore minor lights to let the player breathe.",
          payload: { action: "stabilize" }
        });
        break;
    }

    return decisions;
  }

  private calculateFear(player: IPlayerController): void {
    // Medo é uma correlação de escuro, estresse, fadiga corporal e quantidade de erros cometidos
    const darknessFactor = this.metrics.darknessRatio * 35;
    const stressFactor = player.stress * 0.4;
    const heartbeatFactor = Math.max(0, (player.heartbeat - 70) * 0.3);
    const mistakesFactor = Math.min(15, this.metrics.mistakesCount * 3);

    this.metrics.fear = Math.min(100, Math.floor(darknessFactor + stressFactor + heartbeatFactor + mistakesFactor));
  }

  private analyzePlayerBehavior(player: IPlayerController, deltaTime: number): void {
    // Coletar amostragem de barulho recente
    const currentNoise = player.sprintState ? 1.0 : (player.crouchState ? 0.1 : 0.4);
    this.noiseTracker.push(currentNoise);
    if (this.noiseTracker.length > 20) {
      this.noiseTracker.shift();
    }

    const averageNoise = this.noiseTracker.reduce((a, b) => a + b, 0) / this.noiseTracker.length;

    // Categorizar perfil comportamental
    if (player.stress > 80 && player.heartbeat > 140) {
      this.metrics.playerBehavior = "panicked";
    } else if (averageNoise > 0.75) {
      this.metrics.playerBehavior = "reckless";
    } else if (player.crouchState && averageNoise < 0.25) {
      this.metrics.playerBehavior = "stealthy";
    } else {
      this.metrics.playerBehavior = "normal";
    }
  }

  private updatePacingState(deltaTime: number): void {
    // Máquina de estados baseada em limite de tempo e comportamento
    switch (this.pacingState) {
      case "calm":
        // Transiciona para build-up se o estresse subir ou após 45 segundos de tédio
        this.tensionLevel = Math.max(10, this.tensionLevel - deltaTime * 0.8);
        if (this.metrics.stress > 40 || this.stateTimer > 45 || this.metrics.mistakesCount > 2) {
          this.pacingState = "build-up";
          this.stateTimer = 0;
          this.eventBus?.publish("director:pacing_change", { state: "build-up", tension: this.tensionLevel });
          console.info("[HorrorDirector] Pacing transitioned to BUILD-UP. Stress rising.");
        }
        break;

      case "build-up":
        this.tensionLevel = Math.min(75, this.tensionLevel + deltaTime * 2.5);
        if (this.tensionLevel >= 70 || this.stateTimer > 35) {
          this.pacingState = "peak";
          this.stateTimer = 0;
          this.eventBus?.publish("director:pacing_change", { state: "peak", tension: this.tensionLevel });
          console.info("[HorrorDirector] Pacing transitioned to PEAK. Pure intense horror.");
        }
        break;

      case "peak":
        this.tensionLevel = Math.min(100, this.tensionLevel + deltaTime * 1.5);
        // Peak dura no máximo 25 segundos para evitar fadiga mental real do usuário (Left 4 Dead Director theory)
        if (this.stateTimer > 25) {
          this.pacingState = "fading";
          this.stateTimer = 0;
          this.eventBus?.publish("director:pacing_change", { state: "fading", tension: this.tensionLevel });
          console.info("[HorrorDirector] Pacing transitioned to FADING. Monster retreating.");
        }
        break;

      case "fading":
        this.tensionLevel = Math.max(10, this.tensionLevel - deltaTime * 4.5);
        if (this.tensionLevel <= 20 || this.stateTimer > 20) {
          this.pacingState = "calm";
          this.stateTimer = 0;
          // Limpa alguns erros acumulados como misericórdia do diretor
          this.metrics.mistakesCount = Math.max(0, this.metrics.mistakesCount - 2);
          this.eventBus?.publish("director:pacing_change", { state: "calm", tension: this.tensionLevel });
          console.info("[HorrorDirector] Pacing transitioned back to CALM. Temporary safety.");
        }
        break;
    }
  }

  private getPacingInterval(): number {
    switch (this.pacingState) {
      case "calm": return 15.0;      // Decisões espaçadas
      case "build-up": return 8.0;   // Começa a acelerar micro-eventos
      case "peak": return 4.0;       // Caos de sustos e sons consecutivos
      case "fading": return 10.0;
    }
  }

  private setupSubscriptions(): void {
    // Ouvir barulhos ou interações do jogador para registrar falhas/erros dinâmicos
    this.eventBus?.subscribe("player:noise", (data) => {
      if (data.intensity > 1.2 && this.pacingState === "calm") {
        // Correr gera barulho e pode atrair monstro fora da hora
        this.incrementMistakes();
      }
    });

    this.eventBus?.subscribe("player:stress", (data) => {
      if (data.value > 90) {
        this.metrics.fear = Math.min(100, this.metrics.fear + 10);
      }
    });
  }

  private dispatchDecisions(decisions: IDirectorDecision[]): void {
    for (const decision of decisions) {
      this.decisionHistory.push(decision);
      if (this.decisionHistory.length > 50) {
        this.decisionHistory.shift();
      }

      // Publicar no barramento central de eventos reativos da engine
      this.eventBus?.publish("director:decision", decision);
      console.info(`[HorrorDirector Decision] Type: ${decision.type.toUpperCase()} | Severity: ${decision.severity.toUpperCase()} | Info: ${decision.description}`);
    }
  }
}
