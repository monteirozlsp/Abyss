import { IResourceManager, IServiceContainer } from "./types";

export class ResourceManager implements IResourceManager {
  public readonly id = "ResourceManager";
  private canvasElement: HTMLCanvasElement | null = null;
  private glContext: WebGL2RenderingContext | null = null;

  public async init(container: IServiceContainer): Promise<void> {
    // Inicialização do gerenciador de recursos de renderização (GPU / Canvas)
  }

  public async shutdown(): Promise<void> {
    this.releaseGPUContext();
  }

  public acquireGPUContext(canvasId: string): WebGL2RenderingContext | null {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.warn(`[ResourceManager] Canvas element "${canvasId}" not found.`);
      return null;
    }

    this.canvasElement = canvas;
    this.glContext = canvas.getContext("webgl2");

    if (!this.glContext) {
      console.error("[ResourceManager] WebGL2 context is not supported on this platform.");
    } else {
      console.info("[ResourceManager] WebGL2 rendering context acquired successfully.");
    }

    return this.glContext;
  }

  public releaseGPUContext(): void {
    this.glContext = null;
    this.canvasElement = null;
    console.info("[ResourceManager] GPU context and Canvas reference released.");
  }
}
