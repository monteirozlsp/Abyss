import { IPlayerController, IServiceContainer, IEventBus, IRenderer } from "./types";

export class PlayerController implements IPlayerController {
  public readonly id = "PlayerController";
  private container!: IServiceContainer;
  private eventBus!: IEventBus;

  // Physiological States
  public hp = 100;
  public sanity = 100;
  public stress = 0;
  public fatigue = 0;
  public heartbeat = 70; // BPM
  public breathIntensity = 0.2; // 0.0 to 1.0

  // Action States
  public crouchState = false;
  public sprintState = false;
  public leanState: "none" | "left" | "right" = "none";
  public hideState = false;
  public nightVisionActive = false;
  public flashlightActive = false;

  // Inventory System
  public inventory: string[] = [];

  // Internal Tick Accumulator
  private tickAccumulator = 0;

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;
    
    // Configurar escuta do EventBus se disponível
    if (this.container.has("EventBus")) {
      this.eventBus = this.container.get<IEventBus>("EventBus");
    }
    
    console.info("[PlayerController] Player simulation states initialized.");
  }

  public async shutdown(): Promise<void> {
    this.inventory = [];
    console.info("[PlayerController] Player simulation states shut down.");
  }

  // Update loop called by the scheduler tick
  public update(deltaTime: number): void {
    if (this.hideState) {
      // Escondido diminui estresse e cansaço lentamente
      this.stress = Math.max(0, this.stress - deltaTime * 5);
      this.fatigue = Math.max(0, this.fatigue - deltaTime * 8);
    } else {
      // Simulação padrão de estresse e sanidade
      if (this.sprintState) {
        this.fatigue = Math.min(100, this.fatigue + deltaTime * 15);
        this.stress = Math.min(100, this.stress + deltaTime * 2);
      } else {
        this.fatigue = Math.max(0, this.fatigue - deltaTime * 5);
      }

      // Estresse aumenta com lanterna apagada e em lugares escuros (Simulado)
      if (!this.flashlightActive && !this.nightVisionActive) {
        this.stress = Math.min(100, this.stress + deltaTime * 1.5);
      } else {
        this.stress = Math.max(0, this.stress - deltaTime * 1.0);
      }
    }

    // Se fadiga estiver máxima, o sprint é desativado à força
    if (this.fatigue >= 100 && this.sprintState) {
      this.setSprint(false);
    }

    // Batimento cardíaco é uma função direta de estresse, fadiga e HP baixo
    const baseHeartbeat = 70;
    const stressModifier = this.stress * 0.8;
    const fatigueModifier = this.fatigue * 0.5;
    const hpModifier = Math.max(0, (100 - this.hp) * 0.6);
    this.heartbeat = Math.floor(baseHeartbeat + stressModifier + fatigueModifier + hpModifier);

    // Intensidade da respiração acompanha os batimentos cardíacos
    this.breathIntensity = Math.min(1.0, 0.2 + (this.heartbeat - 70) / 110);

    // Sanidade decai se o estresse estiver muito alto (> 70)
    if (this.stress > 70) {
      this.sanity = Math.max(0, this.sanity - deltaTime * (this.stress / 50));
    } else {
      // Recuperação extremamente lenta de sanidade sob estresse zero
      this.sanity = Math.min(100, this.sanity + deltaTime * 0.1);
    }

    // Publicar atualizações fisiológicas periódicas
    this.tickAccumulator += deltaTime;
    if (this.tickAccumulator >= 0.5) {
      this.tickAccumulator = 0;
      this.publishVitals();
    }

    // Integrar efeitos com a câmera do renderizador (Câmera Bobbing & Shake)
    this.applyCameraEffects(deltaTime);
  }

  public setCrouch(enabled: boolean): void {
    this.crouchState = enabled;
    if (enabled) {
      this.sprintState = false; // Não é possível correr agachado
    }
    this.eventBus?.publish("player:crouch", { enabled });
    console.info(`[PlayerController] Crouch set to: ${enabled}`);
  }

  public setSprint(enabled: boolean): void {
    if (enabled && this.fatigue >= 90) {
      console.warn("[PlayerController] Player too fatigued to sprint.");
      return;
    }
    this.sprintState = enabled;
    if (enabled) {
      this.crouchState = false; // Não é possível correr agachado
      this.hideState = false; // Sair do esconderijo ao correr
    }
    this.eventBus?.publish("player:sprint", { enabled });
    console.info(`[PlayerController] Sprint set to: ${enabled}`);
  }

  public setLean(state: "none" | "left" | "right"): void {
    this.leanState = state;
    this.eventBus?.publish("player:lean", { state });
    console.info(`[PlayerController] Lean state set to: ${state.toUpperCase()}`);
  }

  public setHide(state: boolean): void {
    this.hideState = state;
    if (state) {
      this.sprintState = false;
      this.crouchState = true; // Força agachamento ao esconder-se
    }
    this.eventBus?.publish("player:hide", { state });
    console.info(`[PlayerController] Hiding state set to: ${state}`);
  }

  public toggleNightVision(): void {
    this.nightVisionActive = !this.nightVisionActive;
    if (this.nightVisionActive) {
      this.flashlightActive = false; // Desliga lanterna ao ligar visão noturna
    }
    this.eventBus?.publish("player:nightvision", { active: this.nightVisionActive });
    console.info(`[PlayerController] Night Vision toggled to: ${this.nightVisionActive}`);
  }

  public toggleFlashlight(): void {
    this.flashlightActive = !this.flashlightActive;
    if (this.flashlightActive) {
      this.nightVisionActive = false; // Desliga visão noturna ao acender lanterna
    }

    // Integração direta com o serviço Renderer se presente no container
    if (this.container.has("Renderer")) {
      const renderer = this.container.get<IRenderer>("Renderer");
      renderer.toggleFlashlight(this.flashlightActive);
    }

    this.eventBus?.publish("player:flashlight", { active: this.flashlightActive });
    console.info(`[PlayerController] Flashlight toggled to: ${this.flashlightActive}`);
  }

  public applyNoise(amount: number): void {
    // Ruídos propagados no ambiente para atrair inimigos abissais
    const adjustedNoise = this.crouchState ? amount * 0.3 : (this.sprintState ? amount * 1.8 : amount);
    this.eventBus?.publish("player:noise", { intensity: adjustedNoise });
  }

  public applyStress(amount: number): void {
    this.stress = Math.min(100, this.stress + amount);
    this.eventBus?.publish("player:stress", { value: this.stress });
  }

  public addItem(item: string): void {
    this.inventory.push(item);
    this.eventBus?.publish("inventory:add", { item, list: this.inventory });
    console.info(`[Inventory] Added item to pack: ${item}`);
  }

  public removeItem(item: string): boolean {
    const idx = this.inventory.indexOf(item);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.eventBus?.publish("inventory:remove", { item, list: this.inventory });
      console.info(`[Inventory] Removed item from pack: ${item}`);
      return true;
    }
    return false;
  }

  public hasItem(item: string): boolean {
    return this.inventory.includes(item);
  }

  private publishVitals(): void {
    this.eventBus?.publish("player:vitals", {
      hp: this.hp,
      sanity: this.sanity,
      stress: this.stress,
      fatigue: this.fatigue,
      heartbeat: this.heartbeat,
      breathIntensity: this.breathIntensity,
    });
  }

  private applyCameraEffects(deltaTime: number): void {
    if (!this.container.has("Renderer")) {
      return;
    }

    const renderer = this.container.get<IRenderer>("Renderer");
    const scene = renderer.getBabylonScene();
    if (!scene) {
      return;
    }

    const activeCamera = scene.activeCamera;
    if (activeCamera) {
      // 1. Batimentos cardíacos altos ou corrida causam chacoalhada de câmera (Panic Camera Shake)
      const shakeFactor = (this.heartbeat > 100 ? (this.heartbeat - 100) / 60 : 0) + (this.sprintState ? 0.3 : 0);
      if (shakeFactor > 0) {
        const time = performance.now() * 0.01;
        activeCamera.position.x += Math.sin(time * 2.0) * 0.03 * shakeFactor;
        activeCamera.position.y += Math.cos(time * 3.1) * 0.03 * shakeFactor;
      }

      // 2. Inclinação lateral de visualização (Lean camera roll)
      if (this.leanState === "left") {
        activeCamera.rotation.z = 0.15; // Ângulo para a esquerda
      } else if (this.leanState === "right") {
        activeCamera.rotation.z = -0.15; // Ângulo para a direita
      } else {
        activeCamera.rotation.z = 0; // Padrão reto
      }

      // 3. Ajuste de altura da câmera agachado (Crouch height adjust)
      const targetHeight = this.crouchState ? 1.0 : (this.hideState ? 0.8 : 1.8);
      activeCamera.position.y += (targetHeight - activeCamera.position.y) * deltaTime * 8;
    }
  }
}
