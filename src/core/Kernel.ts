import { IKernel, IServiceContainer } from "./types";
import { ServiceContainer } from "./ServiceContainer";
import { EventBus } from "./EventBus";
import { Scheduler } from "./Scheduler";
import { MemoryManager } from "./MemoryManager";
import { ResourceManager } from "./ResourceManager";
import { AssetManager } from "./AssetManager";
import { SceneManager } from "./SceneManager";
import { WorldManager } from "./WorldManager";
import { SaveManager } from "./SaveManager";
import { AnalyticsManager } from "./AnalyticsManager";
import { PluginManager } from "./PluginManager";
import { ModuleLoader } from "./ModuleLoader";
import { RuntimeManager } from "./RuntimeManager";
import { WorkerManager } from "./WorkerManager";
import { Renderer } from "./Renderer";
import { PlayerController } from "./PlayerController";
import { HorrorDirector } from "./HorrorDirector";
import { ThorneAI } from "./ThorneAI";

export class Kernel implements IKernel {
  public readonly container: IServiceContainer;

  constructor() {
    this.container = new ServiceContainer();
  }

  public async boot(): Promise<void> {
    console.info("[Kernel] Starting AbyssEngine Core Bootstrapping...");

    // 1. Registrar servicos no container de Injecao de Dependencia
    this.container.register("EventBus", new EventBus());
    this.container.register("Scheduler", new Scheduler());
    this.container.register("MemoryManager", new MemoryManager());
    this.container.register("ResourceManager", new ResourceManager());
    this.container.register("Renderer", new Renderer());
    this.container.register("PlayerController", new PlayerController());
    this.container.register("HorrorDirector", new HorrorDirector());
    this.container.register("ThorneAI", new ThorneAI());
    this.container.register("AssetManager", new AssetManager());
    this.container.register("SceneManager", new SceneManager());
    this.container.register("WorldManager", new WorldManager());
    this.container.register("SaveManager", new SaveManager());
    this.container.register("AnalyticsManager", new AnalyticsManager());
    this.container.register("PluginManager", new PluginManager());
    this.container.register("ModuleLoader", new ModuleLoader());
    this.container.register("RuntimeManager", new RuntimeManager());
    this.container.register("WorkerManager", new WorkerManager());

    // 2. Inicializar os servicos em sequencia ordenada (Dependency Order)
    const servicesToInit = [
      "EventBus",
      "Scheduler",
      "MemoryManager",
      "ResourceManager",
      "Renderer",
      "PlayerController",
      "HorrorDirector",
      "ThorneAI",
      "AssetManager",
      "SceneManager",
      "WorldManager",
      "SaveManager",
      "AnalyticsManager",
      "PluginManager",
      "ModuleLoader",
      "RuntimeManager",
      "WorkerManager",
    ];

    for (const serviceId of servicesToInit) {
      const service = this.container.get(serviceId);
      console.info(`[Kernel] Initializing system service: ${serviceId}...`);
      await service.init(this.container);
    }

    const runtime = this.container.get<RuntimeManager>("RuntimeManager");
    runtime.setEngineState("running");

    console.info("[Kernel] AbyssEngine Core Boot sequence completed successfully.");
  }

  public async shutdown(): Promise<void> {
    console.info("[Kernel] Initiating AbyssEngine Core shutdown sequence...");

    const runtime = this.container.get<RuntimeManager>("RuntimeManager");
    runtime.setEngineState("idle");

    const services = this.container.getAllServices();
    // Desliga em ordem reversa
    for (let i = services.length - 1; i >= 0; i--) {
      const service = services[i];
      console.info(`[Kernel] Shutting down service: ${service.id}...`);
      await service.shutdown();
    }

    console.info("[Kernel] AbyssEngine Core shutdown complete.");
  }
}
