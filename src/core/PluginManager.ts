import { IPluginManager, IPlugin, IServiceContainer } from "./types";

export class PluginManager implements IPluginManager {
  public readonly id = "PluginManager";
  private plugins = new Map<string, IPlugin>();
  private container!: IServiceContainer;

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;
  }

  public async shutdown(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.uninstall();
    }
    this.plugins.clear();
  }

  public async loadPlugin(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin already loaded: ${plugin.name}`);
    }

    await plugin.install(this.container);
    this.plugins.set(plugin.name, plugin);
    console.info(`[Plugins] Plugin "${plugin.name}" v${plugin.version} loaded successfully.`);
  }

  public async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.uninstall();
      this.plugins.delete(name);
      console.info(`[Plugins] Plugin "${name}" unloaded.`);
    }
  }

  public getPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }
}
