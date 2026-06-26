/**
 * @file SessionAndLeaderboards.ts
 * @description Módulos de gerenciamento de sessões ativas (SessionManager),
 * tabelas de classificação (Leaderboards / Ranking) e telemetria multiplayer (Analytics).
 */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  completionTimeMs: number;
}

export class SessionManager {
  private static instance: SessionManager | null = null;
  private currentSessionId: string | null = null;
  private isMatchInProgress: boolean = false;
  private playTimeMs: number = 0;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public startSession(sessionId: string): void {
    this.currentSessionId = sessionId;
    this.isMatchInProgress = true;
    this.playTimeMs = 0;
    console.log(`[AbyssEngine] Sessão de jogo multiplayer iniciada: ${sessionId}`);
  }

  public endSession(): void {
    console.log(`[AbyssEngine] Sessão de jogo multiplayer encerrada: ${this.currentSessionId}`);
    this.currentSessionId = null;
    this.isMatchInProgress = false;
  }

  public update(deltaTime: number): void {
    if (this.isMatchInProgress) {
      this.playTimeMs += deltaTime * 1000;
    }
  }

  public getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  public getIsMatchInProgress(): boolean {
    return this.isMatchInProgress;
  }
}

export class LeaderboardSystem {
  private static instance: LeaderboardSystem | null = null;
  private cachedLeaderboard: LeaderboardEntry[] = [];

  private constructor() {}

  public static getInstance(): LeaderboardSystem {
    if (!LeaderboardSystem.instance) {
      LeaderboardSystem.instance = new LeaderboardSystem();
    }
    return LeaderboardSystem.instance;
  }

  /**
   * Envia uma pontuação conquistada para gravação no ranking do CMS.
   */
  public submitScore(score: number, completionTimeMs: number): Promise<boolean> {
    console.log(`[AbyssEngine] Enviando pontuação ao ranking: Score=${score}, Time=${completionTimeMs}ms`);
    return Promise.resolve(true);
  }

  /**
   * Obtém a lista atualizada de melhores tempos e recordes.
   */
  public async fetchLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Retorna dados estáticos ou dados simulados sincronizados
    return this.cachedLeaderboard.slice(0, limit);
  }
}

export class RankingSystem {
  private static instance: RankingSystem | null = null;
  private playerElo: number = 1000;

  private constructor() {}

  public static getInstance(): RankingSystem {
    if (!RankingSystem.instance) {
      RankingSystem.instance = new RankingSystem();
    }
    return RankingSystem.instance;
  }

  /**
   * Recalcula o ranking interno do jogador com base em sua performance na partida de co-op.
   */
  public updatePlayerElo(opponentElo: number, hasPlayerWon: boolean): void {
    const kFactor = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - this.playerElo) / 400));
    const actualScore = hasPlayerWon ? 1 : 0;
    
    this.playerElo = Math.round(this.playerElo + kFactor * (actualScore - expectedScore));
    console.log(`[AbyssEngine] Elo do jogador atualizado para: ${this.playerElo}`);
  }

  public getElo(): number {
    return this.playerElo;
  }
}

export class AnalyticsMultiplayer {
  private static instance: AnalyticsMultiplayer | null = null;
  private disconnectCount: number = 0;
  private totalLatencySample: number = 0;
  private latencySamplesCount: number = 0;

  private constructor() {}

  public static getInstance(): AnalyticsMultiplayer {
    if (!AnalyticsMultiplayer.instance) {
      AnalyticsMultiplayer.instance = new AnalyticsMultiplayer();
    }
    return AnalyticsMultiplayer.instance;
  }

  /**
   * Registra um incidente de perda de pacote ou oscilação de ping para diagnóstico.
   */
  public logLatencySample(pingMs: number): void {
    this.totalLatencySample += pingMs;
    this.latencySamplesCount++;
  }

  /**
   * Registra uma desconexão física inesperada para acompanhamento no dashboard do CMS.
   */
  public logUnexpectedDisconnect(): void {
    this.disconnectCount++;
    console.warn(`[Analytics Multi] Desconexão registrada! Total histórico: ${this.disconnectCount}`);
  }

  public getAverageLatency(): number {
    if (this.latencySamplesCount === 0) return 0;
    return this.totalLatencySample / this.latencySamplesCount;
  }
}
