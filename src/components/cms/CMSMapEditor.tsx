import React, { useState } from "react";
import { 
  MapPin, Lightbulb, Volume2, DoorClosed, Users, Sparkles, Shield, 
  Layers, Plus, Trash2, Save, Copy, Share2, Info, Eye
} from "lucide-react";

interface MapElement {
  id: string;
  type: "spawn" | "light" | "sound" | "door" | "npc" | "secret" | "trigger" | "particle";
  x: number;
  y: number;
  label: string;
}

interface GameMap {
  id: string;
  name: string;
  version: number;
  isPublished: boolean;
  elements: MapElement[];
}

export default function CMSMapEditor() {
  const [maps, setMaps] = useState<GameMap[]>([
    {
      id: "map-1",
      name: "Subsolo do Asilo Sanatório",
      version: 3,
      isPublished: true,
      elements: [
        { id: "e-1", type: "spawn", x: 40, y: 50, label: "Ponto de Entrada" },
        { id: "e-2", type: "light", x: 120, y: 80, label: "Luz Trêmula Vermelha" },
        { id: "e-3", type: "npc", x: 220, y: 150, label: "O Cirurgião Patologista" },
        { id: "e-4", type: "trigger", x: 300, y: 220, label: "Gatilho de Queda de Grade" }
      ]
    },
    {
      id: "map-2",
      name: "Complexo de Pesquisa Aetheris",
      version: 1,
      isPublished: false,
      elements: [
        { id: "e-5", type: "spawn", x: 60, y: 80, label: "Ponto de Partida" },
        { id: "e-6", type: "door", x: 150, y: 140, label: "Porta Blindada Setor C" }
      ]
    }
  ]);

  const [selectedMapId, setSelectedMapId] = useState<string>("map-1");
  const [activeTool, setActiveTool] = useState<"spawn" | "light" | "sound" | "door" | "npc" | "secret" | "trigger" | "particle">("spawn");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const activeMap = maps.find(m => m.id === selectedMapId) || maps[0];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const newElement: MapElement = {
      id: `e-${Date.now()}`,
      type: activeTool,
      x,
      y,
      label: `Novo ${activeTool.toUpperCase()}`
    };

    setMaps(prev => prev.map(m => {
      if (m.id === activeMap.id) {
        return {
          ...m,
          elements: [...m.elements, newElement]
        };
      }
      return m;
    }));
    setSelectedElementId(newElement.id);
  };

  const updateElementLabel = (id: string, newLabel: string) => {
    setMaps(prev => prev.map(m => {
      if (m.id === activeMap.id) {
        return {
          ...m,
          elements: m.elements.map(el => el.id === id ? { ...el, label: newLabel } : el)
        };
      }
      return m;
    }));
  };

  const deleteElement = (id: string) => {
    setMaps(prev => prev.map(m => {
      if (m.id === activeMap.id) {
        return {
          ...m,
          elements: m.elements.filter(el => el.id !== id)
        };
      }
      return m;
    }));
    setSelectedElementId(null);
  };

  const handlePublishToggle = () => {
    setMaps(prev => prev.map(m => {
      if (m.id === activeMap.id) {
        return { ...m, isPublished: !m.isPublished };
      }
      return m;
    }));
  };

  const handleDuplicateMap = () => {
    const newMap: GameMap = {
      id: `map-${Date.now()}`,
      name: `${activeMap.name} (Cópia)`,
      version: 1,
      isPublished: false,
      elements: [...activeMap.elements]
    };
    setMaps(prev => [...prev, newMap]);
    setSelectedMapId(newMap.id);
  };

  const handleCreateNewMap = () => {
    const newMap: GameMap = {
      id: `map-${Date.now()}`,
      name: "Novo Mapa do Abismo",
      version: 1,
      isPublished: false,
      elements: []
    };
    setMaps(prev => [...prev, newMap]);
    setSelectedMapId(newMap.id);
  };

  const getToolIcon = (type: string) => {
    switch (type) {
      case "spawn": return <MapPin className="w-4 h-4 text-green-500" />;
      case "light": return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "sound": return <Volume2 className="w-4 h-4 text-cyan-400" />;
      case "door": return <DoorClosed className="w-4 h-4 text-amber-500" />;
      case "npc": return <Users className="w-4 h-4 text-red-500" />;
      case "secret": return <Eye className="w-4 h-4 text-pink-500" />;
      case "trigger": return <Layers className="w-4 h-4 text-purple-400" />;
      case "particle": return <Sparkles className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Mapas e Versões */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Mapas Cadastrados</span>
            <button 
              onClick={handleCreateNewMap}
              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {maps.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMapId(m.id);
                  setSelectedElementId(null);
                }}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col justify-between gap-1.5 ${
                  m.id === selectedMapId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[150px]">{m.name}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
                    v{m.version}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-gray-500">
                    {m.elements.length} entidades cadastradas
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    m.isPublished ? "bg-green-950/30 text-green-400 border border-green-500/20" : "bg-zinc-900 text-zinc-500"
                  }`}>
                    {m.isPublished ? "PUBLICADO" : "RASCUNHO"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Para posicionar entidades no mapa, selecione uma ferramenta acima do grid à direita e clique sobre o mapa.
        </div>
      </div>

      {/* Coluna 2 e 3: Área de Edição e Grid do Mapa */}
      <div className="xl:col-span-2 space-y-4">
        {/* Barra de Ferramentas de Inserção */}
        <div className="p-3 bg-[#0c0c0c] border border-white/5 rounded flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Inserir:</span>
            <div className="flex flex-wrap gap-1">
              {(["spawn", "light", "sound", "door", "npc", "secret", "trigger", "particle"] as const).map(tool => (
                <button
                  key={tool}
                  onClick={() => setActiveTool(tool)}
                  className={`px-2.5 py-1 rounded text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                    activeTool === tool
                      ? "bg-red-950/30 border-red-500 text-white"
                      : "bg-black border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {getToolIcon(tool)}
                  <span className="capitalize">{tool}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas de Edição 2D */}
        <div className="relative bg-black border border-white/5 rounded h-[440px] overflow-hidden group select-none cursor-crosshair">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "radial-gradient(circle, #ff3333 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Canvas Click Area */}
          <div className="absolute inset-0" onClick={handleCanvasClick} />

          {/* Elementos Renderizados */}
          {activeMap.elements.map(el => (
            <div
              key={el.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(el.id);
              }}
              style={{ left: el.x - 16, top: el.y - 16 }}
              className={`absolute p-2 rounded-full cursor-pointer transition-all border ${
                selectedElementId === el.id
                  ? "bg-red-500/30 border-red-500 scale-125 z-20 shadow-lg shadow-red-500/20"
                  : "bg-black/80 border-white/20 hover:border-white/60 z-10 hover:scale-110"
              }`}
            >
              {getToolIcon(el.type)}
            </div>
          ))}

          {/* Informações da Posição */}
          <div className="absolute bottom-3 left-3 bg-black/80 border border-white/5 px-2 py-1 rounded text-[10px] font-mono text-gray-400 z-10">
            Resolução: 1024x1024 | Grade: 24px
          </div>
        </div>
      </div>

      {/* Coluna 4: Detalhes do Elemento Selecionado */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Configuração CMS</span>
            <h4 className="text-xs font-mono font-bold text-white uppercase mt-0.5">Propriedades do Nó</h4>
          </div>

          {selectedElementId ? (
            (() => {
              const el = activeMap.elements.find(e => e.id === selectedElementId);
              if (!el) return <span className="text-xs text-gray-500 font-mono">Erro ao ler elemento</span>;
              return (
                <div className="space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-500 text-[10px] block">Tipo de Entidade</span>
                    <span className="text-white capitalize font-bold flex items-center space-x-1.5">
                      {getToolIcon(el.type)}
                      <span>{el.type}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-500 text-[10px] block">Identificador ID</span>
                    <span className="text-gray-400 text-[10px] bg-black p-1.5 rounded block border border-white/5">
                      {el.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 text-[10px] block">Nome/Etiqueta do Elemento</label>
                    <input
                      type="text"
                      value={el.label}
                      onChange={(e) => updateElementLabel(el.id, e.target.value)}
                      className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2 text-white font-mono text-xs rounded transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-1">
                      <span className="text-gray-500">Eixo X (Colisão)</span>
                      <span className="bg-black p-1.5 rounded block border border-white/5 text-gray-300">
                        {el.x}px
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500">Eixo Y (Colisão)</span>
                      <span className="bg-black p-1.5 rounded block border border-white/5 text-gray-300">
                        {el.y}px
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteElement(el.id)}
                    className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Deletar do Mapa</span>
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12 space-y-2">
              <Info className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-xs text-gray-400">Selecione uma entidade no mapa para editar suas propriedades.</p>
            </div>
          )}
        </div>

        {/* Ações Gerais do Mapa */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <button
            onClick={handlePublishToggle}
            className={`w-full py-2 px-3 border text-xs font-mono rounded font-bold transition-all flex items-center justify-between ${
              activeMap.isPublished
                ? "bg-green-950/10 border-green-500 text-green-400 hover:bg-green-950/20"
                : "bg-red-950/10 border-red-500 text-red-400 hover:bg-red-950/20"
            }`}
          >
            <span>{activeMap.isPublished ? "Despublicar Mapa" : "Publicar Mapa"}</span>
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDuplicateMap}
            className="w-full py-2 px-3 bg-black hover:bg-white/5 border border-white/5 text-gray-300 text-xs font-mono rounded flex items-center justify-between transition-all"
          >
            <span>Duplicar Mapa</span>
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
