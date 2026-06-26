import { IEventBus, EventCallback, IServiceContainer } from "./types";

export class EventBus implements IEventBus {
  public readonly id = "EventBus";
  private listeners = new Map<string, Set<EventCallback>>();

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializacao do EventBus, se necessario
  }

  public async shutdown(): Promise<void> {
    this.listeners.clear();
  }

  public subscribe<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.unsubscribe(event, callback);
  }

  public unsubscribe<T = any>(event: string, callback: EventCallback<T>): void {
    const list = this.listeners.get(event);
    if (list) {
      list.delete(callback);
      if (list.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public publish<T = any>(event: string, payload: T): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for event "${event}":`, error);
        }
      });
    }
  }
}
