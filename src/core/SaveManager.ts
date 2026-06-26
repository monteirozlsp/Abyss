import { ISaveManager, ISaveData, IServiceContainer } from "./types";

export class SaveManager implements ISaveManager {
  public readonly id = "SaveManager";

  public async init(container: IServiceContainer): Promise<void> {
    // Inicializacao do SaveManager (carrega configs de cookies, localstorage, etc)
  }

  public async shutdown(): Promise<void> {
    // Limpeza de cache de saves
  }

  public async saveGame(saveData: ISaveData): Promise<boolean> {
    try {
      const payload = JSON.stringify(saveData);
      localStorage.setItem(`abyss_save_${saveData.saveId}`, payload);
      return true;
    } catch (error) {
      console.error("Failed to write savegame delta:", error);
      return false;
    }
  }

  public async loadGame(saveId: string): Promise<ISaveData | null> {
    try {
      const data = localStorage.getItem(`abyss_save_${saveId}`);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as ISaveData;
    } catch (error) {
      console.error(`Failed to parse savegame ${saveId}:`, error);
      return null;
    }
  }

  public async deleteSave(saveId: string): Promise<boolean> {
    try {
      localStorage.removeItem(`abyss_save_${saveId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete savegame ${saveId}:`, error);
      return false;
    }
  }
}
