import { IAssetManager, IAsset, IServiceContainer } from "./types";

export class AssetManager implements IAssetManager {
  public readonly id = "AssetManager";
  private cache = new Map<string, IAsset>();

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializa carregadores
  }

  public async shutdown(): Promise<void> {
    this.cache.clear();
  }

  public async load<T>(id: string, path: string, type: IAsset["type"]): Promise<T> {
    if (this.cache.has(id)) {
      const cached = this.cache.get(id)!;
      cached.refCount++;
      return cached.data as T;
    }

    try {
      let data: any;

      if (type === "json" || type === "shader") {
        const response = await fetch(path);
        data = type === "json" ? await response.json() : await response.text();
      } else {
        // Mocking binary loading logic (e.g. Image, Web Audio Buffer or fetch arrayBuffer)
        data = { path, type, loadedAt: Date.now() };
      }

      const asset: IAsset = {
        id,
        type,
        data,
        refCount: 1,
      };

      this.cache.set(id, asset);
      return data as T;
    } catch (error) {
      console.error(`Failed to load asset from ${path}:`, error);
      throw error;
    }
  }

  public unload(id: string): void {
    const asset = this.cache.get(id);
    if (asset) {
      asset.refCount--;
      if (asset.refCount <= 0) {
        this.cache.delete(id);
      }
    }
  }

  public getAsset<T>(id: string): T | null {
    const asset = this.cache.get(id);
    return asset ? (asset.data as T) : null;
  }
}
