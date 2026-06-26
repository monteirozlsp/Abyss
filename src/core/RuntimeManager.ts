import { IRuntimeManager, IServiceContainer } from "./types";

export class RuntimeManager implements IRuntimeManager {
  public readonly id = "RuntimeManager";
  private state: "idle" | "running" | "paused" | "error" = "idle";

  public async init(container: IServiceContainer): Promise<void> {
    this.state = "idle";
  }

  public async shutdown(): Promise<void> {
    this.state = "idle";
  }

  public getEngineState(): "idle" | "running" | "paused" | "error" {
    return this.state;
  }

  public setEngineState(state: "idle" | "running" | "paused" | "error"): void {
    this.state = state;
    console.info(`[Runtime] Engine state changed to: ${state.toUpperCase()}`);
  }
}
