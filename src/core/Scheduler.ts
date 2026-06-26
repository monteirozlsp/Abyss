import { IScheduler, ITask, IServiceContainer } from "./types";

export class Scheduler implements IScheduler {
  public readonly id = "Scheduler";
  private tasks: ITask[] = [];

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializacao do Scheduler
  }

  public async shutdown(): Promise<void> {
    this.tasks = [];
  }

  public scheduleTask(task: ITask): void {
    if (this.tasks.some((t) => t.id === task.id)) {
      return;
    }
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority); // Ordenacao decrescente de prioridade
  }

  public unscheduleTask(taskId: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
  }

  public async runTick(deltaTime: number): Promise<void> {
    for (const task of this.tasks) {
      try {
        await task.execute(deltaTime);
      } catch (error) {
        console.error(`Error executing task "${task.id}":`, error);
      }
    }
  }
}
