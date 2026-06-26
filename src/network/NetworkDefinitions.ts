/**
 * @file NetworkDefinitions.ts
 * @description Definições de tipos, enums e interfaces para a arquitetura de rede da AbyssEngine.
 * Todos os sistemas estão preparados para ativação futura de forma modular.
 */

export enum NetworkState {
  OFFLINE = "OFFLINE",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR"
}

export enum PacketType {
  PING = 0,
  PONG = 1,
  HANDSHAKE = 2,
  CLIENT_STATE = 3,
  SERVER_UPDATE = 4,
  RPC_CALL = 5,
  ENTITY_SPAWN = 6,
  ENTITY_DESPAWN = 7,
  VOICE_DATA = 8,
  CHAT_MESSAGE = 9
}

export interface NetworkConfig {
  serverUrl: string;
  useWebRTC: boolean;
  tickRate: number;
  enablePrediction: boolean;
  enableLagCompensation: boolean;
}

export interface NetworkPacket {
  type: PacketType;
  sequence: number;
  timestamp: number;
  payload: ArrayBuffer;
}

export interface NetworkEntityState {
  entityId: string;
  components: { [componentName: string]: any };
}
