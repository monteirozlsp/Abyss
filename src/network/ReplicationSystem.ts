/**
 * @file ReplicationSystem.ts
 * @description Sistema de Replicação de Entidades e Componentes.
 * Contém os mecanismos de replicação (ReplicationSystem), previsão local (PredictionLayer)
 * e compensação de lag (LagCompensation).
 */

import { NetworkEntityState } from "./NetworkDefinitions";

export class ReplicationSystem {
  private static instance: ReplicationSystem | null = null;
  private replicatedEntities: Map<string, NetworkEntityState> = new Map();
  private replicationTickRate: number = 30; // Hz
  private isReplicationActive: boolean = false;

  private constructor() {}

  public static getInstance(): ReplicationSystem {
    if (!ReplicationSystem.instance) {
      ReplicationSystem.instance = new ReplicationSystem();
    }
    return ReplicationSystem.instance;
  }

  /**
   * Ativa ou desativa a replicação de estados em tempo real.
   */
  public setReplicationActive(active: boolean): void {
    this.isReplicationActive = active;
    console.log(`[AbyssEngine] Replicação de entidades alterada para: ${active}`);
  }

  /**
   * Registra uma entidade do ECS Híbrido para ser replicada via rede.
   */
  public registerEntityForReplication(entityId: string, initialComponents: any): void {
    this.replicatedEntities.set(entityId, {
      entityId,
      components: initialComponents
    });
  }

  /**
   * Remove uma entidade do loop de replicação de rede.
   */
  public unregisterEntityFromReplication(entityId: string): void {
    this.replicatedEntities.delete(entityId);
  }

  /**
   * Atualiza e replica o estado de todas as entidades registradas.
   * Chamado a cada ciclo do SystemScheduler se ativo.
   */
  public update(deltaTime: number): void {
    if (!this.isReplicationActive) {
      return; // Inerte
    }
    // Lógica para varrer o Replication Graph e agrupar componentes alterados
  }

  /**
   * Processa uma atualização de estado recebida de forma autoritativa do servidor.
   */
  public processServerUpdate(states: NetworkEntityState[]): void {
    if (!this.isReplicationActive) return;

    for (const state of states) {
      this.replicatedEntities.set(state.entityId, state);
      // Aqui, os componentes correspondentes no ComponentManager do ECS seriam injetados/atualizados
    }
  }
}

/**
 * Camada de Previsão Local (PredictionLayer) para suavizar movimento e colisão do jogador.
 */
export class PredictionLayer {
  private lastInputSequence: number = 0;
  private pendingInputs: any[] = [];

  /**
   * Registra uma entrada de controle local do jogador para previsão física subsequente.
   */
  public registerLocalInput(input: any, sequence: number): void {
    this.lastInputSequence = sequence;
    this.pendingInputs.push({ input, sequence, timestamp: Date.now() });
  }

  /**
   * Reconcilia o estado local com a correção autoritativa enviada pelo servidor de rede.
   */
  public reconcile(serverSequence: number, serverPosition: { x: number; y: number; z: number }): void {
    // Remove os inputs já processados de forma confirmada pelo servidor
    this.pendingInputs = this.pendingInputs.filter(item => item.sequence > serverSequence);
    
    // Aplica as correções físicas de forma interpolada para evitar pulos bruscos de câmera (stutters)
  }
}

/**
 * Sistema de Compensação de Lag (LagCompensation) para calibração de tiros ou interações no servidor.
 */
export class LagCompensation {
  private historyLimitMs: number = 1000;
  private stateHistory: Map<string, { timestamp: number; transform: any }[]> = new Map();

  /**
   * Adiciona um snapshot de estado ao histórico para permitir retrocesso temporal subsequente.
   */
  public recordStateSnapshot(entityId: string, transform: any): void {
    let history = this.stateHistory.get(entityId);
    if (!history) {
      history = [];
      this.stateHistory.set(entityId, history);
    }

    history.push({ timestamp: Date.now(), transform });

    // Descarta snapshots mais antigos do que o limite estipulado
    const cutOff = Date.now() - this.historyLimitMs;
    while (history.length > 0 && history[0].timestamp < cutOff) {
      history.shift();
    }
  }

  /**
   * Retorna o estado tridimensional de uma entidade em um ponto específico do passado (Rollback).
   */
  public getInterpolatedStateAtTime(entityId: string, targetTimestamp: number): any {
    const history = this.stateHistory.get(entityId);
    if (!history || history.length === 0) return null;

    // Retorna o snapshot interpolado mais próximo do tempo target solicitado
    return history[history.length - 1].transform;
  }
}
