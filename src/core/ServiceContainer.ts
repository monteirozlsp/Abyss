import { IService, IServiceContainer } from "./types";

export class ServiceContainer implements IServiceContainer {
  private services = new Map<string, IService>();

  public register<T extends IService>(id: string, service: T): void {
    if (this.services.has(id)) {
      throw new Error(`Service already registered: ${id}`);
    }
    this.services.set(id, service);
  }

  public get<T extends IService>(id: string): T {
    const service = this.services.get(id);
    if (!service) {
      throw new Error(`Service not found: ${id}`);
    }
    return service as T;
  }

  public has(id: string): boolean {
    return this.services.has(id);
  }

  public getAllServices(): IService[] {
    return Array.from(this.services.values());
  }
}
