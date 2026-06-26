/**
 * @file VoiceAndMedia.ts
 * @description Sistema de Comunicação por Voz em Tempo Real (VoiceChat)
 * com suporte planejado para posicionamento e filtros espaciais 3D na Web Audio API.
 */

export class VoiceChat {
  private static instance: VoiceChat | null = null;
  private isVoiceEnabled: boolean = false;
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private pannerNodes: Map<string, PannerNode> = new Map();

  private constructor() {}

  public static getInstance(): VoiceChat {
    if (!VoiceChat.instance) {
      VoiceChat.instance = new VoiceChat();
    }
    return VoiceChat.instance;
  }

  /**
   * Ativa o subsistema de voz e solicita permissão de microfone do usuário.
   * Por padrão, mantido desligado no build principal offline.
   */
  public async enableVoiceChat(): Promise<boolean> {
    this.isVoiceEnabled = true;
    console.log("[AbyssEngine] VoiceChat habilitado na engine.");

    try {
      // Pré-inicialização de contexto sem forçar chamada direta a permissões no modo inativo
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return true;
    } catch (e) {
      console.error("[AbyssEngine] Erro ao instanciar AudioContext de Voz:", e);
      return false;
    }
  }

  /**
   * Desativa o Voice Chat e limpa fluxos de microfone ativos.
   */
  public disableVoiceChat(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.isVoiceEnabled = false;
    this.pannerNodes.clear();
    console.log("[AbyssEngine] VoiceChat desligado e recursos de microfone liberados.");
  }

  /**
   * Cria um nó de posicionamento espacial 3D para renderizar a voz de um parceiro co-op.
   */
  public registerPeerAudioNode(peerId: string, audioSourceNode: AudioNode): void {
    if (!this.audioContext) return;

    // Configura o panner de áudio espacial 3D
    const panner = this.audioContext.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 1;
    panner.maxDistance = 30;
    panner.rolloffFactor = 1;

    audioSourceNode.connect(panner);
    panner.connect(this.audioContext.destination);

    this.pannerNodes.set(peerId, panner);
  }

  /**
   * Atualiza a posição da fonte de voz 3D de um parceiro co-op na viewport tridimensional.
   */
  public updatePeerVoicePosition(peerId: string, x: number, y: number, z: number): void {
    const panner = this.pannerNodes.get(peerId);
    if (panner) {
      if (panner.positionX) {
        panner.positionX.value = x;
        panner.positionY.value = y;
        panner.positionZ.value = z;
      } else {
        // Fallback de browsers antigos
        panner.setPosition(x, y, z);
      }
    }
  }

  public getIsVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }
}
