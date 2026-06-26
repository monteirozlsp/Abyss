import { IMemoryManager, IServiceContainer } from "./types";

export class MemoryManager implements IMemoryManager {
  public readonly id = "MemoryManager";
  private activeBuffers = new Set<ArrayBuffer>();
  private pools = new Map<string, any[]>();

  public async init(container: IServiceContainer): Promise<void> {
    // Aloca pools de entidades ou arrays estaticos se necessario
  }

  public async shutdown(): Promise<void> {
    this.activeBuffers.clear();
    this.pools.clear();
  }

  public allocateBuffer(size: number): ArrayBuffer {
    const buffer = new ArrayBuffer(size);
    this.activeBuffers.add(buffer);
    return buffer;
  }

  public freeBuffer(buffer: ArrayBuffer): void {
    this.activeBuffers.delete(buffer);
  }

  public getPool<T>(type: string): T[] {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }
    return this.pools.get(type) as T[];
  }

  public releasePool(type: string): void {
    this.pools.delete(type);
  }
}
