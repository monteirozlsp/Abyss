import { IWorldManager, IWorldCell, IServiceContainer } from "./types";

export class WorldManager implements IWorldManager {
  public readonly id = "WorldManager";
  private entities = new Map<string, { x: number; y: number }>();
  private grid = new Map<string, IWorldCell>();

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializa grade do mundo
  }

  public async shutdown(): Promise<void> {
    this.entities.clear();
    this.grid.clear();
  }

  public registerEntity(entityId: string, cellX: number, cellY: number): void {
    this.entities.set(entityId, { x: cellX, y: cellY });
    const cellKey = `${cellX},${cellY}`;

    if (!this.grid.has(cellKey)) {
      this.grid.set(cellKey, {
        x: cellX,
        y: cellY,
        entities: [],
        isLoaded: false,
      });
    }

    const cell = this.grid.get(cellKey)!;
    if (!cell.entities.includes(entityId)) {
      cell.entities.push(entityId);
    }
  }

  public unregisterEntity(entityId: string): void {
    const coord = this.entities.get(entityId);
    if (coord) {
      const cellKey = `${coord.x},${coord.y}`;
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.entities = cell.entities.filter((id) => id !== entityId);
      }
      this.entities.delete(entityId);
    }
  }

  public async streamCells(playerX: number, playerY: number, radius: number): Promise<void> {
    const minX = Math.floor(playerX) - radius;
    const maxX = Math.floor(playerX) + radius;
    const minY = Math.floor(playerY) - radius;
    const maxY = Math.floor(playerY) + radius;

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const cellKey = `${x},${y}`;
        const cell = this.grid.get(cellKey);
        if (cell && !cell.isLoaded) {
          // Carregamento assincrono de dados de objetos na célula (Streaming)
          cell.isLoaded = true;
        }
      }
    }
  }

  public getEntitiesInRadius(x: number, y: number, radius: number): string[] {
    const result: string[] = [];
    const minX = Math.floor(x) - radius;
    const maxX = Math.floor(x) + radius;
    const minY = Math.floor(y) - radius;
    const maxY = Math.floor(y) + radius;

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const cellKey = `${cx},${cy}`;
        const cell = this.grid.get(cellKey);
        if (cell && cell.isLoaded) {
          result.push(...cell.entities);
        }
      }
    }

    return result;
  }
}
