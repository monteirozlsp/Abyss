import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Save, RotateCcw, Activity, Play, 
  Settings, Zap, Shield, HelpCircle, Eye
} from "lucide-react";

interface ParticleSystem {
  id: string;
  name: string;
  count: number;
  color: string;
  lifetime: number; // in seconds
  size: number; // in pixels
  speed: number;
  gravity: number; // -1 to 1
}

export default function CMSParticleEditor() {
  const [systems, setSystems] = useState<ParticleSystem[]>([
    { id: "p-1", name: "Neblina do Subsolo (Fog)", count: 120, color: "#455a64", lifetime: 6, size: 8, speed: 0.5, gravity: -0.05 },
    { id: "p-2", name: "Poeira Sob a Lanterna (Dust)", count: 150, color: "#ffd54f", lifetime: 3, size: 2, speed: 0.8, gravity: 0.02 },
    { id: "p-3", name: "Vapor de Alta Pressão (Steam)", count: 80, color: "#cfd8dc", lifetime: 2, size: 4, speed: 2.5, gravity: -0.2 },
    { id: "p-4", name: "Esporos de Mofo Negro (Abyss)", count: 200, color: "#1a0f2e", lifetime: 5, size: 3, speed: 1.2, gravity: 0.05 }
  ]);

  const [selectedSysId, setSelectedSysId] = useState<string>("p-1");
  const activeSystem = systems.find(s => s.id === selectedSysId) || systems[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update a system field
  const handleUpdateField = (fields: Partial<ParticleSystem>) => {
    setSystems(prev => prev.map(s => s.id === activeSystem.id ? { ...s, ...fields } : s));
  };

  // HTML5 Canvas Real-Time Particle Simulator! Beautiful craft!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particlesList: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = 300;
    };
    resizeCanvas();

    const createParticle = () => {
      // Spawn near bottom for rising particles (steam/fog), or scattered for dust
      const isRising = activeSystem.gravity < 0;
      return {
        x: isRising 
          ? Math.random() * canvas.width 
          : Math.random() * canvas.width,
        y: isRising 
          ? canvas.height + Math.random() * 20 
          : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * activeSystem.speed,
        vy: isRising 
          ? -Math.random() * activeSystem.speed * 1.5
          : (Math.random() - 0.5) * activeSystem.speed,
        life: 0,
        maxLife: activeSystem.lifetime * 60 * (0.8 + Math.random() * 0.4), // 60 FPS based
        size: activeSystem.size * (0.5 + Math.random() * 0.5),
        color: activeSystem.color
      };
    };

    // Prepopulate some particles
    for (let i = 0; i < activeSystem.count * 0.5; i++) {
      particlesList.push(createParticle());
      // offset their initial life
      particlesList[i].life = Math.random() * particlesList[i].maxLife;
      if (activeSystem.gravity < 0) {
        particlesList[i].y = Math.random() * canvas.height;
      }
    }

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)"; // Fade background trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add missing particles to maintain count
      while (particlesList.length < activeSystem.count) {
        particlesList.push(createParticle());
      }

      particlesList.forEach((p, index) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy + activeSystem.gravity * 2; // Apply gravity

        // Fade transparency based on life ratio
        const alpha = 1 - p.life / p.maxLife;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Convert hex/color to rgba representation
        ctx.fillStyle = p.color === "#1a0f2e" 
          ? `rgba(90, 20, 150, ${alpha * 0.7})` 
          : `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          
        ctx.fill();

        // Recycle particles that died or went out of bounds
        if (p.life >= p.maxLife || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 20) {
          particlesList[index] = createParticle();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSystem]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Sistemas */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Banco de Emissores (VFX)</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {systems.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSysId(s.id)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1 ${
                  s.id === selectedSysId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[150px]">{s.name}</span>
                  <span 
                    style={{ backgroundColor: s.color }}
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                  />
                </div>
                <div className="flex justify-between items-center w-full text-[10px] text-gray-500">
                  <span>Taxa: {s.count} partículas</span>
                  <span>Tam: {s.size}px</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Emissores de partículas criam a atmosfera densa do hospital, respondendo dinamicamente às correntes de vento e luzes da lanterna.
        </div>
      </div>

      {/* Coluna 2 e 3: Live Simulator Canvas (Real-Time Physics Rendering) */}
      <div className="xl:col-span-2 space-y-4">
        {/* Barra de título do visualizador */}
        <div className="p-3 bg-[#0c0c0c] border border-white/5 rounded flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Live Preview VFX Simulator (Canvas 2D)</span>
          <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
            PARTICLES STABLE
          </span>
        </div>

        {/* Dynamic Canvas element */}
        <div className="relative bg-black border border-white/5 rounded overflow-hidden h-[300px]">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          <div className="absolute top-2 left-2 text-[8px] font-mono text-gray-500 uppercase bg-black/80 border border-white/5 px-1.5 py-0.5 rounded">
            Simulador de Turbulência e Flutuação
          </div>
        </div>

        {/* Info Pannel */}
        <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded grid grid-cols-2 gap-4 font-mono text-[11px] text-gray-400">
          <div className="space-y-1">
            <span className="text-white font-bold block">Física de Colisão de Luz</span>
            <p className="leading-relaxed">As partículas do tipo "Poeira" ganham cintilação emissiva volumétrica sob contato de raycasts da lanterna do player.</p>
          </div>
          <div className="space-y-1">
            <span className="text-white font-bold block">Desempenho da GPU</span>
            <p className="leading-relaxed">A renderização utiliza pooling de vértices para garantir 60 FPS contínuos, mesmo com emissores de alta densidade.</p>
          </div>
        </div>
      </div>

      {/* Coluna 4: Sliders e Parametrização */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Parâmetros de Emissão</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Contagem Máxima</span>
                <span className="text-cyan-400 font-bold">{activeSystem.count} px</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={activeSystem.count}
                onChange={(e) => handleUpdateField({ count: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Particle color hex */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Cor das Partículas</span>
                <span style={{ color: activeSystem.color }} className="font-bold">{activeSystem.color}</span>
              </div>
              <div className="flex gap-2">
                {["#ffd54f", "#cfd8dc", "#455a64", "#ef5350", "#1a0f2e"].map(color => (
                  <button
                    key={color}
                    onClick={() => handleUpdateField({ color })}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded border ${activeSystem.color === color ? "border-red-500 scale-110" : "border-white/10"} transition-all`}
                  />
                ))}
              </div>
            </div>

            {/* Gravity */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Flutuabilidade (Gravidade)</span>
                <span className="text-cyan-400 font-bold">
                  {activeSystem.gravity < 0 ? `Subida (${activeSystem.gravity})` : `Descida (${activeSystem.gravity})`}
                </span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={activeSystem.gravity}
                onChange={(e) => handleUpdateField({ gravity: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tamanho Individual (px)</span>
                <span className="text-cyan-400 font-bold">{activeSystem.size}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={activeSystem.size}
                onChange={(e) => handleUpdateField({ size: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Velocidade do Vento/Turb.</span>
                <span className="text-cyan-400 font-bold">{activeSystem.speed} m/s</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.1"
                value={activeSystem.speed}
                onChange={(e) => handleUpdateField({ speed: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={() => alert("Emissores de partículas sincronizados com as coordenadas globais de luz da lanterna!")}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar VFX</span>
        </button>
      </div>
    </div>
  );
}
