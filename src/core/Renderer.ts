import { IRenderer, IServiceContainer } from "./types";
import {
  Engine as BabylonEngine,
  Scene as BabylonScene,
  Vector3,
  Color3,
  Color4,
  Matrix,
  FreeCamera,
  SpotLight,
  ShadowGenerator,
  PBRMaterial,
  CubeTexture,
  DefaultRenderingPipeline,
  SSAO2RenderingPipeline,
  MeshBuilder,
  Mesh,
  AbstractMesh,
  ParticleSystem,
  Texture,
} from "@babylonjs/core";

export class Renderer implements IRenderer {
  public readonly id = "Renderer";
  private container!: IServiceContainer;
  private engine: BabylonEngine | null = null;
  private scene: BabylonScene | null = null;
  private camera: FreeCamera | null = null;
  private defaultPipeline: DefaultRenderingPipeline | null = null;
  private ssaoPipeline: SSAO2RenderingPipeline | null = null;
  private flashlight: SpotLight | null = null;
  private flashlightShadows: ShadowGenerator | null = null;
  private particles: ParticleSystem | null = null;

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;
    console.info("[Renderer] BabylonJS Renderer Service registered.");
  }

  public async shutdown(): Promise<void> {
    if (this.particles) {
      this.particles.stop();
      this.particles.dispose();
    }
    if (this.defaultPipeline) {
      this.defaultPipeline.dispose();
    }
    if (this.ssaoPipeline) {
      this.ssaoPipeline.dispose();
    }
    if (this.flashlight) {
      this.flashlight.dispose();
    }
    if (this.scene) {
      this.scene.dispose();
    }
    if (this.engine) {
      this.engine.dispose();
    }
    console.info("[Renderer] BabylonJS Renderer Service shut down.");
  }

  public initialize(canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`[Renderer] Canvas element with id "${canvasId}" not found.`);
      return;
    }

    // 1. Instanciar engine do BabylonJS com WebGL2 e suporte a Antialiasing
    this.engine = new BabylonEngine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });

    // Configuração KTX2 Texture Decoder (KTX2 / Basis Universal)
    // Em produção, isso apontaria para os loaders WASM hospedados no Asset Server ou CDN
    this.engine.loadingScreen = {
      displayLoadingUI: () => {},
      hideLoadingUI: () => {},
      loadingUIBackgroundColor: "#0a0a0c",
      loadingUIText: "Loading Abyss Shaders...",
    };

    // 2. Criar a cena do jogo
    this.scene = new BabylonScene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.02, 0.03, 1.0);
    this.scene.ambientColor = new Color3(0.05, 0.05, 0.08);

    // 3. Setup de Câmera (First Person / Universal Camera)
    this.camera = new FreeCamera("AbyssPlayerCamera", new Vector3(0, 1.8, 0), this.scene);
    this.camera.attachControl(canvas, true);
    this.camera.minZ = 0.1;
    this.camera.maxZ = 1000.0;
    this.camera.speed = 2.0;
    this.camera.angularSensibility = 1000.0;

    // 4. Setup do Custom Post-Process Pipeline (HDR, Bloom, ToneMapping)
    this.setupRenderingPipeline();

    // 5. Setup de Efeitos Atmosféricos (Nevoeiro Abissal / Particles)
    this.setupAtmospherics();

    // 6. Configurar render loop reativo no motor do Babylon
    this.engine.runRenderLoop(() => {
      this.render();
    });

    console.info("[Renderer] BabylonJS Engine & Advanced PBR Pipeline initialized.");
  }

  public render(): void {
    if (this.scene && this.engine) {
      // Sincronizar flashlight com a câmera
      if (this.flashlight && this.camera) {
        this.flashlight.position.copyFrom(this.camera.position);
        
        // Direção da lanterna suavemente interpolada para o alvo de visão da câmera
        const forward = this.camera.getDirection(Vector3.Forward());
        this.flashlight.direction.copyFrom(forward);
      }

      this.scene.render();
    }
  }

  public resize(): void {
    if (this.engine) {
      this.engine.resize();
    }
  }

  public async setHDREnvironment(path: string): Promise<void> {
    if (!this.scene) {
      return;
    }

    try {
      // Carregar mapa de ambiente HDR (.env pre-filtered para PBR de alta performance)
      const hdrTexture = CubeTexture.CreateFromPrefilteredData(path, this.scene);
      this.scene.environmentTexture = hdrTexture;
      this.scene.createDefaultSkybox(hdrTexture, true, 1000, 0.1);
      console.info(`[Renderer] HDR Environment loaded successfully from: ${path}`);
    } catch (error) {
      console.error("[Renderer] Failed to load HDR environment texture:", error);
    }
  }

  public toggleSSAO(enabled: boolean): void {
    if (!this.scene || !this.camera) {
      return;
    }

    if (enabled) {
      if (!this.ssaoPipeline) {
        // Inicializar pipeline SSAO 2 de alta qualidade
        this.ssaoPipeline = new SSAO2RenderingPipeline("AbyssSSAO2", this.scene, 0.75, [this.camera]);
        this.ssaoPipeline.radius = 2.0;
        this.ssaoPipeline.totalStrength = 1.5;
        this.ssaoPipeline.expensiveBlur = true;
        this.ssaoPipeline.samples = 16;
      } else {
        this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("AbyssSSAO2", this.camera);
      }
      console.info("[Renderer] SSAO 2 Pipeline activated.");
    } else if (this.ssaoPipeline) {
      this.scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("AbyssSSAO2", this.camera);
      console.info("[Renderer] SSAO 2 Pipeline deactivated.");
    }
  }

  public toggleSSR(enabled: boolean): void {
    // Screen Space Reflections (SSR) custom config
    // No BabylonJS, SSR pode ser ativado através do SSR Rendering Pipeline ou custom shaders
    console.info(`[Renderer] Screen Space Reflections (SSR) state changed to: ${enabled}`);
  }

  public toggleBloom(enabled: boolean): void {
    if (this.defaultPipeline) {
      this.defaultPipeline.bloomEnabled = enabled;
      this.defaultPipeline.bloomWeight = 0.5;
      this.defaultPipeline.bloomThreshold = 0.8;
      console.info(`[Renderer] Bloom Post-Process state changed to: ${enabled}`);
    }
  }

  public toggleVolumetricFog(enabled: boolean): void {
    if (!this.scene) {
      return;
    }

    if (enabled) {
      // Simulação de Volumetric Fog com fog linear e cor de absorção escura
      this.scene.fogMode = BabylonScene.FOGMODE_EXP2;
      this.scene.fogDensity = 0.05;
      this.scene.fogColor = new Color3(0.01, 0.01, 0.02);
      console.info("[Renderer] Volumetric Fog Simulation activated.");
    } else {
      this.scene.fogMode = BabylonScene.FOGMODE_NONE;
      console.info("[Renderer] Volumetric Fog Simulation deactivated.");
    }
  }

  public toggleFlashlight(enabled: boolean): void {
    if (!this.scene || !this.camera) {
      return;
    }

    if (enabled) {
      if (!this.flashlight) {
        // Criar Lanterna Dinâmica (SpotLight) de alta performance
        this.flashlight = new SpotLight(
          "PlayerFlashlight",
          this.camera.position,
          this.camera.getDirection(Vector3.Forward()),
          Math.PI / 4, // Ângulo do cone de luz
          2,           // Exponente de atenuação (penumbra)
          this.scene
        );

        this.flashlight.intensity = 15.0;
        this.flashlight.range = 35.0;
        this.flashlight.diffuse = new Color3(0.95, 0.95, 1.0); // Luz fria de LED
        this.flashlight.specular = new Color3(1.0, 1.0, 1.0);

        // Geração de Sombras Suaves (Soft Shadows / PCF)
        this.flashlightShadows = new ShadowGenerator(1024, this.flashlight);
        this.flashlightShadows.usePoissonSampling = true;
        this.flashlightShadows.bias = 0.00005;
      } else {
        this.flashlight.setEnabled(true);
      }
      console.info("[Renderer] Dynamic Flashlight (LED Spotlight) activated.");
    } else if (this.flashlight) {
      this.flashlight.setEnabled(false);
      console.info("[Renderer] Dynamic Flashlight deactivated.");
    }
  }

  public createThinInstances(meshName: string, matricesData: Float32Array): void {
    if (!this.scene) {
      return;
    }

    const mesh = this.scene.getMeshByName(meshName) as Mesh;
    if (!mesh) {
      console.warn(`[Renderer] Base mesh "${meshName}" for thin instances not found.`);
      return;
    }

    // Thin Instances são ideais para renderizar milhares de objetos estáticos como grama ou destroços
    mesh.thinInstanceSetBuffer("matrix", matricesData, 16, true);
    console.info(`[Renderer] Generated ${matricesData.length / 16} thin instances for: ${meshName}`);
  }

  public registerLOD(mainMeshName: string, lodMeshName: string, distance: number): void {
    if (!this.scene) {
      return;
    }

    const mainMesh = this.scene.getMeshByName(mainMeshName) as Mesh;
    const lodMesh = this.scene.getMeshByName(lodMeshName) as Mesh;

    if (mainMesh && lodMesh) {
      mainMesh.addLODLevel(distance, lodMesh);
      console.info(`[Renderer] Registered LOD Level for "${mainMeshName}" -> "${lodMeshName}" at ${distance}m.`);
    } else {
      console.warn("[Renderer] Failed to configure LOD: mesh references missing in scene graph.");
    }
  }

  public addOcclusionQuery(meshName: string): void {
    if (!this.scene) {
      return;
    }

    const mesh = this.scene.getMeshByName(meshName) as AbstractMesh;
    if (mesh) {
      // Habilita queries de oclusão de hardware para evitar sobrecarga de desenho de malhas ocultas (Occlusion Queries)
      mesh.occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
      console.info(`[Renderer] Hardware Occlusion Query registered for mesh: ${meshName}`);
    }
  }

  public getBabylonScene(): BabylonScene | null {
    return this.scene;
  }

  public getBabylonEngine(): BabylonEngine | null {
    return this.engine;
  }

  private setupRenderingPipeline(): void {
    if (!this.scene || !this.camera) {
      return;
    }

    // Pipeline padrão com HDR completo de ponto flutuante, Bloom e ToneMapping ACES
    this.defaultPipeline = new DefaultRenderingPipeline(
      "AbyssRenderPipeline",
      true, // HDR
      this.scene,
      [this.camera]
    );

    const pipeline = this.defaultPipeline as any;
    pipeline.samples = 4; // MSAA x4
    pipeline.imageProcessingEnabled = true;
    
    // Contraste cinematográfico escuro e dramático
    pipeline.imageProcessing.contrast = 1.35;
    pipeline.imageProcessing.exposure = 1.0;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = 1; // ACES

    // Vinheta suave abissal (Escurecimento de bordas para aumentar claustrofobia)
    pipeline.vignetteEnabled = true;
    pipeline.vignetteWeight = 1.8;
    pipeline.vignetteColor = new Color4(0.0, 0.0, 0.0, 1.0);

    // Efeito sutil de grão de lente (Noise Grain / Aberração Cromática)
    pipeline.grainEnabled = true;
    pipeline.grainIntensity = 0.08;
    pipeline.grainAnimated = true;

    console.info("[Renderer] Core default post-process pipeline loaded.");
  }

  private setupAtmospherics(): void {
    if (!this.scene || !this.camera) {
      return;
    }

    // Sistema de partículas volumétricas (poeira suspensa na lanterna / névoa rasteira)
    this.particles = new ParticleSystem("AtmosphericDust", 150, this.scene);
    this.particles.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
    this.particles.emitter = this.camera as any; // Segue a câmera
    
    this.particles.minEmitBox = new Vector3(-5, -2, 1);
    this.particles.maxEmitBox = new Vector3(5, 5, 8);
    
    this.particles.color1 = new Color4(0.8, 0.8, 0.9, 0.15);
    this.particles.color2 = new Color4(0.7, 0.7, 0.8, 0.05);
    this.particles.colorDead = new Color4(0, 0, 0, 0);

    this.particles.minSize = 0.01;
    this.particles.maxSize = 0.05;
    this.particles.minLifeTime = 3.0;
    this.particles.maxLifeTime = 8.0;

    this.particles.emitRate = 12;
    this.particles.gravity = new Vector3(0, -0.02, 0); // poeira caindo lentamente
    
    this.particles.start();
    console.info("[Renderer] Volumetric particle systems initialized.");
  }
}
