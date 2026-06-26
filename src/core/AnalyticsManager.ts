import { IAnalyticsManager, ITelemetryEvent, IServiceContainer } from "./types";

export class AnalyticsManager implements IAnalyticsManager {
  public readonly id = "AnalyticsManager";
  private eventBuffer: ITelemetryEvent[] = [];
  private readonly bufferLimit = 50;

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializa buffers e timers de envio
  }

  public async shutdown(): Promise<void> {
    await this.flushEvents();
  }

  public trackEvent(eventType: string, data: Record<string, any>): void {
    const event: ITelemetryEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      eventType,
      timestamp: Date.now(),
      data,
    };

    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.bufferLimit) {
      this.flushEvents();
    }
  }

  public async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const payload = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Mock gateway upload or local console logging in development
      console.info(`[Analytics] Uploading ${payload.length} telemetry logs to ClickHouse.`);
    } catch (error) {
      console.error("Failed to flush telemetry logs payload:", error);
      // Retorna logs para o buffer em caso de falha de rede para reenvio
      this.eventBuffer.push(...payload);
    }
  }
}
