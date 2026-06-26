import React, { useState } from "react";
import { 
  Upload, Layers, Settings, Eye, RefreshCw, Save, CheckCircle2, 
  Trash2, Sliders, Play, Plus, Sparkles, FileText, ChevronRight 
} from "lucide-react";

interface SkinMaterial {
  roughness: number;
  metallic: number;
  emissiveIntensity: number;
  emissiveColor: string;
  baseColor: string;
}

interface SkinVersion {
  id: string;
  version: string;
  fileName: string;
  fileSize: string;
  createdAt: string;
  material: SkinMaterial;
}

export default function CMSSkinEditor() {
  const [skins, setSkins] = useState<SkinVersion[]>([
    {
      id: "skin-1",
      version: "v1.2 (Padrão)",
      fileName: "thor_biohazard_suit.glb",
      fileSize: "14.2 MB",
      createdAt: "2026-06-25 10:20",
      material: {
        roughness: 0.35,
        metallic: 0.8,
        emissiveIntensity: 1.5,
        emissiveColor: "#ff0000",
        baseColor: "#1a1a1a"
      }
    },
    {
      id: "skin-2",
      version: "v1.0 (Natal)",
      fileName: "thor_cyber_santa.fbx",
      fileSize: "18.5 MB",
      createdAt: "2026-06-26 09:15",
      material: {
        roughness: 0.2,
        metallic: 0.9,
        emissiveIntensity: 2.0,
        emissiveColor: "#00ff33",
        baseColor: "#8b0000"
      }
    }
  ]);

  const [selectedSkinId, setSelectedSkinId] = useState<string>("skin-1");
  const [roughness, setRoughness] = useState<number>(0.35);
  const [metallic, setMetallic] = useState<number>(0.8);
  const [emissive, setEmissive] = useState<number>(1.5);
  const [emissiveColor, setEmissiveColor] = useState<string>("#ff0000");
  const [baseColor, setBaseColor] = useState<string>("#1a1a1a");
  const [activeLayer, setActiveLayer] = useState<"base" | "metallic" | "roughness" | "emissive">("base");

  const activeSkin = skins.find(s => s.id === selectedSkinId) || skins[0];

  const handleApplyPreset = (skin: SkinVersion) => {
    setSelectedSkinId(skin.id);
    setRoughness(skin.material.roughness);
    setMetallic(skin.material.metallic);
    setEmissive(skin.material.emissiveIntensity);
    setEmissiveColor(skin.material.emissiveColor);
    setBaseColor(skin.material.baseColor);
  };

  const handleSaveVersion = () => {
    const nextVer = `v1.${skins.length + 1}`;
    const newSkin: SkinVersion = {
      id: `skin-${Date.now()}`,
      version: `${nextVer} (Customizado)`,
      fileName: activeSkin.fileName,
      fileSize: activeSkin.fileSize,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      material: {
        roughness,
        metallic,
        emissiveIntensity: emissive,
        emissiveColor,
        baseColor
      }
    };
    setSkins(prev => [newSkin, ...prev]);
    setSelectedSkinId(newSkin.id);
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const newSkin: SkinVersion = {
        id: `skin-${Date.now()}`,
        version: "v1.0 (Upload)",
        fileName: file.name,
        fileSize: sizeStr,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        material: {
          roughness: 0.4,
          metallic: 0.5,
          emissiveIntensity: 1.0,
          emissiveColor: "#ffaa00",
          baseColor: "#4a4a4a"
        }
      };
      setSkins(prev => [newSkin, ...prev]);
      setSelectedSkinId(newSkin.id);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Modelos e Upload */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Modelos 3D Carregados</span>
          </div>

          {/* Upload Area */}
          <label className="border border-dashed border-white/10 hover:border-red-500/30 rounded p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 bg-black/40 group">
            <Upload className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-all" />
            <span className="text-xs text-gray-300 font-mono">Upload GLB, FBX, OBJ</span>
            <span className="text-[10px] text-gray-500 font-mono">Máx. 50MB</span>
            <input type="file" className="hidden" accept=".glb,.fbx,.obj" onChange={handleFileUploadMock} />
          </label>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {skins.map(s => (
              <button
                key={s.id}
                onClick={() => handleApplyPreset(s)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1.5 ${
                  s.id === selectedSkinId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[140px]">{s.fileName}</span>
                  <span className="text-[9px] bg-red-950/20 text-red-400 border border-red-500/20 px-1 py-0.5 rounded">
                    {s.version}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Tam: {s.fileSize}</span>
                  <span>{s.createdAt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Para ver os canais de textura em tempo real, use os controles deslizantes ao lado para modular o renderizador PBR.
        </div>
      </div>

      {/* Coluna 2 e 3: Visualizador 3D Interativo (Render PBR) */}
      <div className="xl:col-span-2 space-y-4">
        {/* Abas de Canais */}
        <div className="p-3 bg-[#0c0c0c] border border-white/5 rounded flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Canais PBR:</span>
            <div className="flex gap-1">
              {(["base", "metallic", "roughness", "emissive"] as const).map(layer => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                    activeLayer === layer
                      ? "bg-red-950/30 border-red-500 text-white"
                      : "bg-black border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="capitalize">{layer} map</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Simulation Mesh Render */}
        <div className="relative bg-black border border-white/5 rounded h-[440px] flex items-center justify-center overflow-hidden">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          {/* Rotating Mesh Representation */}
          <div className="relative w-64 h-64 flex items-center justify-center animate-spin" style={{ animationDuration: "25s" }}>
            <svg viewBox="0 0 100 100" className="w-56 h-56 transition-all duration-300">
              <defs>
                <radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={baseColor} />
                  <stop offset="60%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#050505" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Sphere representing mesh */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="url(#meshGradient)" 
                stroke={emissiveColor}
                strokeWidth={emissive * 0.8}
                filter={emissive > 0.5 ? "url(#glow)" : undefined}
                style={{
                  opacity: 0.9,
                  transition: "all 0.3s ease"
                }}
              />

              {/* Grid Overlays */}
              <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.1" strokeDasharray="2,2" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.1" strokeDasharray="3,1" />

              {/* PBR reflection simulation */}
              <ellipse 
                cx="42" 
                cy="42" 
                rx="8" 
                ry="4" 
                fill="white" 
                style={{
                  opacity: 1 - roughness,
                  transition: "all 0.3s ease",
                  filter: "blur(2px)"
                }}
              />
            </svg>
          </div>

          {/* PBR HUD Info Overlay */}
          <div className="absolute top-4 left-4 font-mono text-[10px] space-y-1 text-gray-500 p-2 bg-black/80 rounded border border-white/5">
            <span className="text-white block font-bold">MONITOR DE RENDERIZADOR</span>
            <div>Cor Base: <span className="text-white">{baseColor}</span></div>
            <div>Brilho Emissivo: <span className="text-white">{(emissive * 10).toFixed(0)} nits</span></div>
            <div>Reflexo PBR: <span className="text-white">{((1 - roughness) * 100).toFixed(0)}%</span></div>
          </div>
        </div>
      </div>

      {/* Coluna 4: Detalhes do Canal & Sliders */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Parâmetros de Material</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Base Color Picker */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Base Color</span>
                <span className="text-white">{baseColor}</span>
              </div>
              <div className="flex gap-2">
                {["#1a1a1a", "#8b0000", "#004d40", "#ff6d00", "#12005e"].map(color => (
                  <button
                    key={color}
                    onClick={() => setBaseColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded border ${baseColor === color ? "border-red-500 scale-110" : "border-white/10"} hover:scale-105 transition-all`}
                  />
                ))}
              </div>
            </div>

            {/* Roughness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Roughness (Rugosidade)</span>
                <span className="text-cyan-400 font-bold">{(roughness * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={roughness}
                onChange={(e) => setRoughness(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Metallic Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Metallic (Metalicidade)</span>
                <span className="text-cyan-400 font-bold">{(metallic * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={metallic}
                onChange={(e) => setMetallic(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Emissive Power */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Intensidade Emissiva</span>
                <span className="text-cyan-400 font-bold">{(emissive * 10).toFixed(0)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={emissive}
                onChange={(e) => setEmissive(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Emissive Color Selection */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Cor Emissiva</span>
                <span style={{ color: emissiveColor }}>{emissiveColor}</span>
              </div>
              <div className="flex gap-2">
                {["#ff0000", "#00ff33", "#00ffff", "#ffff00", "#ff00ff"].map(color => (
                  <button
                    key={color}
                    onClick={() => setEmissiveColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border ${emissiveColor === color ? "border-white scale-110" : "border-white/10"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Salvar Versão do Modelo */}
        <button
          onClick={handleSaveVersion}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Nova Versão</span>
        </button>
      </div>
    </div>
  );
}
