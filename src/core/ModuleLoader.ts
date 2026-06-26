import { IModuleLoader, IServiceContainer } from "./types";

export class ModuleLoader implements IModuleLoader {
  public readonly id = "ModuleLoader";

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializacao do carregador de modulos dinamicos
  }

  public async shutdown(): Promise<void> {
    // Descarregamento de modulos dinamicos
  }

  public async loadModuleDynamic(path: string): Promise<any> {
    try {
      // Dynamic import wrapper
      const module = await import(/* @vite-ignore */ path);
      return module;
    } catch (error) {
      console.error(`Failed to load module dynamically from "${path}":`, error);
      throw error;
    }
  }
}
