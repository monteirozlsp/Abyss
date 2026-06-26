import { IWorkerManager, IWorkerTask, IServiceContainer } from "./types";

export class WorkerManager implements IWorkerManager {
  public readonly id = "WorkerManager";
  private activeWorkers = new Set<Worker>();

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializa Web Workers se necessario
  }

  public async shutdown(): Promise<void> {
    this.activeWorkers.forEach((worker) => worker.terminate());
    this.activeWorkers.clear();
  }

  public async postTask<R = any>(task: IWorkerTask): Promise<R> {
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(task.scriptPath, { type: "module" });
        this.activeWorkers.add(worker);

        worker.onmessage = (event) => {
          worker.terminate();
          this.activeWorkers.delete(worker);
          resolve(event.data);
        };

        worker.onerror = (error) => {
          worker.terminate();
          this.activeWorkers.delete(worker);
          reject(error);
        };

        worker.postMessage(task.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  public activeWorkerCount(): number {
    return this.activeWorkers.size;
  }
}
