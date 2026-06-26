/**
 * @file NetworkLayer.ts
 * @description Implementação da Camada de Rede (NetworkLayer) de baixo nível da AbyssEngine.
 * Atua como abstração de WebRTC/WebSockets, mantendo-se desabilitado no modo offline.
 */

import { NetworkState, NetworkConfig, NetworkPacket } from "./NetworkDefinitions";

export class NetworkLayer {
  private static instance: NetworkLayer | null = null;
  private state: NetworkState = NetworkState.OFFLINE;
  private config: NetworkConfig | null = null;
  private socket: any = null; // WebSocket ou instância WebRTC simulada
  private rtcConnection: any = null;
  private receivedBytes: number = 0;
  private sentBytes: number = 0;

  private constructor() {
    // Inicialização passiva
  }

  public static getInstance(): NetworkLayer {
    if (!NetworkLayer.instance) {
      NetworkLayer.instance = new NetworkLayer();
    }
    return NetworkLayer.instance;
  }

  /**
   * Inicializa a camada de rede com as configurações fornecidas.
   * Por padrão, permanece inativo (modo offline).
   */
  public initialize(config: NetworkConfig): void {
    this.config = config;
    this.state = NetworkState.OFFLINE;
    console.log("[AbyssEngine] NetworkLayer preparado e inicializado no modo offline.");
  }

  /**
   * Força a ativação da conexão física com o servidor de jogos.
   * Mantido desabilitado nas builds atuais de produção singleplayer.
   */
  public connect(): Promise<boolean> {
    if (!this.config) {
      return Promise.resolve(false);
    }

    console.warn("[AbyssEngine] Tentativa de conexão iniciada. Flag multiplayer ativa.");
    this.state = NetworkState.CONNECTING;

    return new Promise((resolve) => {
      // Simulação rápida de handshake que se mantém desativada ou retorna sucesso
      setTimeout(() => {
        this.state = NetworkState.CONNECTED;
        console.log("[AbyssEngine] NetworkLayer conectado ao servidor de simulação.");
        resolve(true);
      }, 100);
    });
  }

  /**
   * Desconecta o cliente e limpa os recursos de rede em execução.
   */
  public disconnect(): void {
    this.state = NetworkState.OFFLINE;
    this.socket = null;
    this.rtcConnection = null;
    console.log("[AbyssEngine] NetworkLayer desconectado com sucesso.");
  }

  /**
   * Envia um pacote binário compactado para o servidor.
   */
  public sendPacket(packet: NetworkPacket): void {
    if (this.state !== NetworkState.CONNECTED) {
      return; // Silencioso se offline
    }
    this.sentBytes += packet.payload.byteLength;
    // Lógica física de envio WebRTC/WS omitida em conformidade com o singleplayer
  }

  /**
   * Retorna o estado atual de conexões da engine.
   */
  public getState(): NetworkState {
    return this.state;
  }

  /**
   * Retorna métricas de tráfego de rede para exibição de Analytics.
   */
  public getNetworkMetrics(): { receivedBytes: number; sentBytes: number; pingMs: number } {
    return {
      receivedBytes: this.receivedBytes,
      sentBytes: this.sentBytes,
      pingMs: this.state === NetworkState.CONNECTED ? 45 : 0
    };
  }
}
