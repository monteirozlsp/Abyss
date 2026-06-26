import { IEngine, IKernel } from "./types";
import { Kernel } from "./Kernel";
import { Scheduler } from "./Scheduler";
import { RuntimeManager } from "./RuntimeManager";

export class Engine implements IEngine {
  public readonly kernel: IKernel;
  private lastTime = 0;
  private frameId: number | null = null;
  private isPausedState = false;

  constructor() {
    this.kernel = new Kernel();
  }

  public async start(): Promise<void> {
    await this.kernel.boot();
    this.lastTime = performance.now();
    this.isPausedState = false;
    this.loop(this.lastTime);
  }

  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.kernel.shutdown();
  }

  public pause(): void {
    this.isPausedState = true;
    const runtime = this.kernel.container.get<RuntimeManager>("RuntimeManager");
    runtime.setEngineState("paused");
  }

  public resume(): void {
    this.isPausedState = false;
    this.lastTime = performance.now();
    const runtime = this.kernel.container.get<RuntimeManager>("RuntimeManager");
    runtime.setEngineState("running");
    this.loop(this.lastTime);
  }

  private loop = (time: number) => {
    if (this.isPausedState) {
      return;
    }

    const deltaTime = (time - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = time;

    // Se o delta for muito grande (Ex: aba inativa), estabiliza para evitar bugs de física
    const clampedDelta = Math.min(deltaTime, 0.1);

    const scheduler = this.kernel.container.get<Scheduler>("Scheduler");
    scheduler.runTick(clampedDelta);

    // Update all registered services dynamically if they have an update lifecycle method
    const services = this.kernel.container.getAllServices();
    for (const service of services) {
      if (service.id !== "Scheduler" && service.update) {
        service.update(clampedDelta);
      }
    }

    this.frameId = requestAnimationFrame(this.loop);
  };
}
