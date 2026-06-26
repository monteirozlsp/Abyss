import { ISceneManager, IScene, IServiceContainer } from "./types";

export class SceneManager implements ISceneManager {
  public readonly id = "SceneManager";
  private currentScene: IScene | null = null;
  private container!: IServiceContainer;

  public get activeScene(): IScene | null {
    return this.currentScene;
  }

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;
  }

  public async shutdown(): Promise<void> {
    if (this.currentScene) {
      await this.currentScene.unload();
      this.currentScene = null;
    }
  }

  public async changeScene(scene: IScene): Promise<void> {
    if (this.currentScene) {
      await this.currentScene.unload();
    }

    this.currentScene = scene;
    await this.currentScene.load(this.container);
  }

  public update(deltaTime: number): void {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(deltaTime);
    }
  }
}
