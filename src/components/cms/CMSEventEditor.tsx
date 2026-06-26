import React, { useState } from "react";
import { 
  Calendar, Gift, Sliders, Play, Plus, Trash2, Save, 
  Sparkles, ShieldAlert, CheckCircle2, RefreshCw, Info 
} from "lucide-react";

interface GameEvent {
  id: string;
  name: string;
  type: "SEASONAL" | "DAILY" | "PROMOTIONAL" | "SECRET";
  startDate: string;
  endDate: string;
  isActive: boolean;
  lootModifier: number; // multiplier
}

interface LootItem {
  id: string;
  name: string;
  chance: number; // percentage
  tier: "COMMON" | "RARE" | "LEGENDARY";
}

export default function CMSEventEditor() {
  const [events, setEvents] = useState<GameEvent[]>([
    {
      id: "e-1",
      name: "Halloween Sinistro (Névoa da Morte)",
      type: "SEASONAL",
      startDate: "2026-10-25",
      endDate: "2026-11-05",
      isActive: false,
      lootModifier: 1.5
    },
    {
      id: "e-2",
      name: "Solstício de Aetheris (Token Duplicado)",
      type: "PROMOTIONAL",
      startDate: "2026-06-20",
      endDate: "2026-06-30",
      isActive: true,
      lootModifier: 2.0
    },
    {
      id: "e-3",
      name: "Invasão no Isolamento (Evento Secreto)",
      type: "SECRET",
      startDate: "2026-12-24",
      endDate: "2026-12-26",
      isActive: false,
      lootModifier: 3.0
    }
  ]);

  const [lootTable, setLootTable] = useState<LootItem[]>([
    { id: "l-1", name: "Filtro Máscara Química Biohazard", chance: 45, tier: "COMMON" },
    { id: "l-2", name: "Bisturi Cirúrgico Enferrujado", chance: 20, tier: "RARE" },
    { id: "l-3", name: "Frasco Purificado de Aetheris", chance: 5, tier: "LEGENDARY" },
    { id: "l-4", name: "Fita Gravada Clínica - Registro 12", chance: 30, tier: "COMMON" }
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string>("e-2");
  const [lootResult, setLootResult] = useState<string>("");

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleToggleEventState = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));
  };

  const handleSimulateLootRoll = () => {
    // Basic weighted probability roll
    const rand = Math.random() * 100;
    let accumulated = 0;
    let chosen: LootItem | null = null;

    // Apply modifier if active
    const finalLootTable = lootTable.map(item => ({
      ...item,
      chance: item.tier === "LEGENDARY" ? item.chance * activeEvent.lootModifier : item.chance
    }));

    // Normalize chances to 100% total
    const totalChance = finalLootTable.reduce((acc, curr) => acc + curr.chance, 0);
    const rolledValue = (rand / 100) * totalChance;

    for (const item of finalLootTable) {
      accumulated += item.chance;
      if (rolledValue <= accumulated) {
        chosen = item;
        break;
      }
    }

    if (chosen) {
      setLootResult(`[ROLL SUCCESS] Drop Concluído: "${chosen.name}" (${chosen.tier}) | Multiplicador de Sorte Ativo: x${activeEvent.lootModifier.toFixed(1)}`);
    } else {
      setLootResult("[ROLL FAILURE] Falha ao computar drop. Tente novamente.");
    }
  };

  const handleCreateNewEvent = () => {
    const newEvent: GameEvent = {
      id: `e-${Date.now()}`,
      name: "Novo Evento do Abismo",
      type: "DAILY",
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      isActive: false,
      lootModifier: 1.0
    };
    setEvents(prev => [...prev, newEvent]);
    setSelectedEventId(newEvent.id);
  };

  const handleSaveEvents = () => {
    alert("Lista de eventos temporários sincronizada com os servidores mundiais!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Eventos Cadastrados */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Linha do Tempo de Campanhas</span>
            <button 
              onClick={handleCreateNewEvent}
              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {events.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEventId(e.id)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1.5 ${
                  e.id === selectedEventId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[140px]">{e.name}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    e.isActive ? "bg-green-950/40 text-green-400 border border-green-500/20 animate-pulse" : "bg-zinc-900 text-zinc-500"
                  }`}>
                    {e.isActive ? "ATIVO" : "DESLIGADO"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Mod: x{e.lootModifier.toFixed(1)} Drops</span>
                  <span>{e.startDate}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Eventos sazonais alteram os pesos de probabilidade de drops de loots, multiplicadores de XP e decoração procedural de mapas de jogo.
        </div>
      </div>

      {/* Coluna 2 e 3: Loot Table Editor & Simulador de Rolar Loot */}
      <div className="xl:col-span-2 space-y-4">
        {/* Editor de Tabela de Drops */}
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Gift className="w-4 h-4 text-red-500" />
              <span>Configuração da Tabela de Recompensas (Loot Table)</span>
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
              LOOT CONFIG ACTIVE
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Ajuste a probabilidade padrão de drops de itens raros ou lendários ao completar o mapa selecionado.
          </p>

          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {lootTable.map(item => (
              <div key={item.id} className="p-2.5 bg-black rounded border border-white/5 flex justify-between items-center text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.tier === "LEGENDARY" ? "bg-amber-500" : item.tier === "RARE" ? "bg-cyan-400" : "bg-gray-400"
                  }`} />
                  <span className="text-gray-300 font-bold">{item.name}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Chance:</span>
                    <input
                      type="number"
                      value={item.chance}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(100, Number(e.target.value)));
                        setLootTable(prev => prev.map(it => it.id === item.id ? { ...it, chance: val } : it));
                      }}
                      className="w-12 bg-[#0c0c0c] border border-white/10 p-1 text-center rounded text-white"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <span className={`text-[9px] px-1 rounded ${
                    item.tier === "LEGENDARY" ? "bg-amber-950 text-amber-400 border border-amber-500/20" :
                    item.tier === "RARE" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/20" : "bg-zinc-900 text-zinc-500"
                  }`}>{item.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulador de Drops Weighted Loop */}
        <div className="bg-black border border-white/5 rounded p-6 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-gray-500 uppercase block tracking-wider">Simulador de Random Number Generator (RNG)</span>
            <button
              onClick={handleSimulateLootRoll}
              className="py-1 px-3 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-mono font-bold rounded flex items-center space-x-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Simular Teste de Drop</span>
            </button>
          </div>

          <div className="p-4 bg-black border border-red-500/20 font-mono text-xs text-red-400 rounded flex-1 flex items-center justify-center text-center mt-3">
            {lootResult || "Clique em 'Simular Teste de Drop' para processar o algoritmo weighted random..."}
          </div>
        </div>
      </div>

      {/* Coluna 4: Detalhes do Evento & Inputs */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Modificar Campanha</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-gray-500 text-[10px] block">Nome da Campanha</label>
              <input
                type="text"
                value={activeEvent.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, name: val } : ev));
                }}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2 text-white font-mono text-xs rounded transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="space-y-1">
                <span className="text-gray-500 block">Início da Campanha</span>
                <input
                  type="date"
                  value={activeEvent.startDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, startDate: val } : ev));
                  }}
                  className="w-full bg-black border border-white/5 p-1.5 rounded text-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 block">Término da Campanha</span>
                <input
                  type="date"
                  value={activeEvent.endDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, endDate: val } : ev));
                  }}
                  className="w-full bg-black border border-white/5 p-1.5 rounded text-white"
                />
              </div>
            </div>

            {/* XP and Loot Multiplier Sliders */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Multiplicador de Loot Sorte</span>
                <span className="text-red-400 font-bold">x{activeEvent.lootModifier.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={activeEvent.lootModifier}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, lootModifier: val } : ev));
                }}
                className="w-full accent-red-500"
              />
            </div>

            {/* Campaign State Trigger */}
            <div className="space-y-1.5 pt-2">
              <span className="text-gray-500 text-[10px]">Estado Ativo</span>
              <button
                onClick={() => handleToggleEventState(activeEvent.id)}
                className={`w-full py-1.5 rounded border text-center font-bold text-xs transition-all ${
                  activeEvent.isActive
                    ? "bg-green-950/20 border-green-500 text-green-400 hover:bg-green-950/40"
                    : "bg-red-950/20 border-red-500 text-red-400 hover:bg-red-950/40"
                }`}
              >
                {activeEvent.isActive ? "ATIVO EM PRODUÇÃO" : "INATIVO (DRAFT)"}
              </button>
            </div>
          </div>
        </div>

        {/* Salvar Campanha */}
        <button
          onClick={handleSaveEvents}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Eventos</span>
        </button>
      </div>
    </div>
  );
}
