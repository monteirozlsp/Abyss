/**
 * PROJECT ABYSS — CORE SYSTEM TYPES & INTERFACES (v1.0.0)
 * Definicoes estritas de tipos para a AbyssEngine Core.
 */

export interface IService {
  readonly id: string;
  init(container: IServiceContainer): Promise<void>;
  shutdown(): Promise<void>;
  update?(deltaTime: number): void;
}

export interface IServiceContainer {
  register<T extends IService>(id: string, service: T): void;
  get<T extends IService>(id: string): T;
  has(id: string): boolean;
  getAllServices(): IService[];
}

export type EventCallback<T = any> = (payload: T) => void;

export interface IEventBus extends IService {
  subscribe<T = any>(event: string, callback: EventCallback<T>): () => void;
  unsubscribe<T = any>(event: string, callback: EventCallback<T>): void;
  publish<T = any>(event: string, payload: T): void;
}

export interface ITask {
  id: string;
  priority: number;
  execute(deltaTime: number): void | Promise<void>;
}

export interface IScheduler extends IService {
  scheduleTask(task: ITask): void;
  unscheduleTask(taskId: string): void;
  runTick(deltaTime: number): Promise<void>;
}

export interface IMemoryManager extends IService {
  allocateBuffer(size: number): ArrayBuffer;
  freeBuffer(buffer: ArrayBuffer): void;
  getPool<T>(type: string): T[];
  releasePool(type: string): void;
}

export interface IResourceManager extends IService {
  acquireGPUContext(canvasId: string): any;
  releaseGPUContext(): void;
}

export interface IAsset {
  id: string;
  type: "model" | "texture" | "audio" | "shader" | "json";
  data: any;
  refCount: number;
}

export interface IAssetManager extends IService {
  load<T>(id: string, path: string, type: IAsset["type"]): Promise<T>;
  unload(id: string): void;
  getAsset<T>(id: string): T | null;
}

export interface IScene {
  readonly name: string;
  load(container: IServiceContainer): Promise<void>;
  unload(): Promise<void>;
  update?(deltaTime: number): void;
}

export interface ISceneManager extends IService {
  readonly activeScene: IScene | null;
  changeScene(scene: IScene): Promise<void>;
}

export interface IWorldCell {
  x: number;
  y: number;
  entities: string[];
  isLoaded: boolean;
}

export interface IWorldManager extends IService {
  registerEntity(entityId: string, cellX: number, cellY: number): void;
  unregisterEntity(entityId: string): void;
  streamCells(playerX: number, playerY: number, radius: number): Promise<void>;
  getEntitiesInRadius(x: number, y: number, radius: number): string[];
}

export interface ISaveData {
  saveId: string;
  timestamp: number;
  sectorId: string;
  playerState: {
    hp: number;
    sanity: number;
    stress: number;
    inventory: any;
    position: [number, number, number];
  };
  checkpoints: Record<string, boolean>;
}

export interface ISaveManager extends IService {
  saveGame(saveData: ISaveData): Promise<boolean>;
  loadGame(saveId: string): Promise<ISaveData | null>;
  deleteSave(saveId: string): Promise<boolean>;
}

export interface ITelemetryEvent {
  id: string;
  eventType: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface IAnalyticsManager extends IService {
  trackEvent(eventType: string, data: Record<string, any>): void;
  flushEvents(): Promise<void>;
}

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  install(container: IServiceContainer): Promise<void>;
  uninstall(): Promise<void>;
}

export interface IPluginManager extends IService {
  loadPlugin(plugin: IPlugin): Promise<void>;
  unloadPlugin(name: string): Promise<void>;
  getPlugins(): IPlugin[];
}

export interface IModuleLoader extends IService {
  loadModuleDynamic(path: string): Promise<any>;
}

export interface IRuntimeManager extends IService {
  getEngineState(): "idle" | "running" | "paused" | "error";
  setEngineState(state: "idle" | "running" | "paused" | "error"): void;
}

export interface IWorkerTask {
  id: string;
  scriptPath: string;
  data: any;
}

export interface IWorkerManager extends IService {
  postTask<R = any>(task: IWorkerTask): Promise<R>;
  activeWorkerCount(): number;
}

export interface IPlayerController extends IService {
  hp: number;
  sanity: number;
  stress: number;
  fatigue: number;
  heartbeat: number;
  breathIntensity: number;
  crouchState: boolean;
  sprintState: boolean;
  leanState: "none" | "left" | "right";
  hideState: boolean;
  nightVisionActive: boolean;
  flashlightActive: boolean;
  inventory: string[];
  
  setCrouch(enabled: boolean): void;
  setSprint(enabled: boolean): void;
  setLean(state: "none" | "left" | "right"): void;
  setHide(state: boolean): void;
  toggleNightVision(): void;
  toggleFlashlight(): void;
  applyNoise(amount: number): void;
  applyStress(amount: number): void;
  addItem(item: string): void;
  removeItem(item: string): boolean;
  hasItem(item: string): boolean;
}

export interface IRenderer extends IService {
  initialize(canvasId: string): void;
  render(): void;
  resize(): void;
  setHDREnvironment(path: string): Promise<void>;
  toggleSSAO(enabled: boolean): void;
  toggleSSR(enabled: boolean): void;
  toggleBloom(enabled: boolean): void;
  toggleVolumetricFog(enabled: boolean): void;
  toggleFlashlight(enabled: boolean): void;
  createThinInstances(meshName: string, matricesData: Float32Array): void;
  registerLOD(mainMeshName: string, lodMeshName: string, distance: number): void;
  addOcclusionQuery(meshName: string): void;
  getBabylonScene(): any;
  getBabylonEngine(): any;
}

export interface IDirectorMetrics {
  fear: number;
  stress: number;
  progression: number;
  exploration: number;
  darknessRatio: number;
  chaseState: boolean;
  sanity: number;
  resourcesRatio: number;
  deathsCount: number;
  mistakesCount: number;
  playerBehavior: "stealthy" | "reckless" | "panicked" | "normal";
}

export interface IDirectorDecision {
  type: "spawn" | "sound" | "blackout" | "entity_spawn" | "illusion" | "object_flicker" | "event_trigger";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  payload?: any;
}

export interface IHorrorDirector extends IService {
  readonly metrics: IDirectorMetrics;
  tensionLevel: number;
  pacingState: "calm" | "build-up" | "peak" | "fading";
  
  incrementMistakes(): void;
  recordDeath(): void;
  registerExplorationDelta(amount: number): void;
  evaluateSituation(): IDirectorDecision[];
}

export interface IThorneAI extends IService {
  state: "patrol" | "investigate" | "hunt" | "ambush" | "flee";
  position: { x: number; y: number; z: number };
  targetLastKnownPosition: { x: number; y: number; z: number } | null;
  perception: {
    sightRange: number;
    hearingRange: number;
    detectedPlayerFlashlight: boolean;
    detectedPlayerSounds: boolean;
  };
  memory: Array<{
    eventId: string;
    position: { x: number; y: number; z: number };
    type: "noise" | "visual" | "light";
    timestamp: number;
    weight: number;
  }>;
  aggression: number; // 0.0 to 1.0
  fear: number; // 0.0 to 1.0
  learningMultiplier: number; // adaptation factor
  
  tickAI(deltaTime: number): void;
  registerPerceptionEvent(type: "noise" | "visual" | "light", position: { x: number; y: number; z: number }, intensity: number): void;
  getGOAPPlan(): string[];
  getCurrentBehaviorTreeState(): string;
  updateMonsterSettings(settings: {
    baseAggression?: number;
    baseFear?: number;
    sightRange?: number;
    hearingRange?: number;
    learningMultiplier?: number;
  }): void;
}

export interface IKernel {
  readonly container: IServiceContainer;
  boot(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IEngine {
  readonly kernel: IKernel;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
}
