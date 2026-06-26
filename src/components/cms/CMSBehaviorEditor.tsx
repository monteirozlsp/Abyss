import React, { useState } from "react";
import { 
  GitFork, GitMerge, Settings, Save, Plus, Trash2, 
  Activity, Zap, Info, Play, RefreshCw, Layers
} from "lucide-react";

interface BehaviorNode {
  id: string;
  name: string;
  type: "Selector" | "Sequence" | "Action" | "Condition";
  status: "success" | "failure" | "running" | "idle";
  desc: string;
}

export default function CMSBehaviorEditor() {
  const [nodes, setNodes] = useState<BehaviorNode[]>([
    { id: "bn-1", name: "Root Selector", type: "Selector", status: "running", desc: "Nó de seleção prioritário de Thorne" },
    { id: "bn-2", name: "IsFearHigh", type: "Condition", status: "failure", desc: "Checa se o medo de Thorne passou de 0.6" },
    { id: "bn-3", name: "FindVentExit", type: "Action", status: "idle", desc: "Busca saída de ventilação para fuga" },
    { id: "bn-4", name: "IsTargetInSight", type: "Condition", status: "success", desc: "Checa se o jogador está na linha de visão direta" },
    { id: "bn-5", name: "ChargeTarget", type: "Action", status: "running", desc: "Inicia aproximação violenta na direção do jogador" },
    { id: "bn-6", name: "HasSuspiciousTarget", type: "Condition", status: "idle", desc: "Verifica se há ruídos não resolvidos na pilha" },
    { id: "bn-7", name: "MoveToLastKnown", type: "Action", status: "idle", desc: "Navega até a última coordenada conhecida" }
  ]);

  const [activeFSMState, setActiveFSMState] = useState<"patrol" | "investigate" | "hunt" | "ambush" | "flee">("hunt");
  const [patrolSpeed, setPatrolSpeed] = useState<number>(3.2);
  const [searchSpeed, setSearchSpeed] = useState<number>(4.8);
  const [chaseSpeed, setChaseSpeed] = useState<number>(7.5);
  const [ambushTime, setAmbushTime] = useState<number>(15);

  const [selectedNodeId, setSelectedNodeId] = useState<string>("bn-5");
  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const handleUpdateNode = (id: string, fields: Partial<BehaviorNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...fields } : n));
  };

  const handleCreateNode = () => {
    const newNode: BehaviorNode = {
      id: `bn-${Date.now()}`,
      name: "Novo Nó Condicional",
      type: "Condition",
      status: "idle",
      desc: "Descreva a nova condição ou ação para acoplamento na inteligência artificial de Thorne."
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(nodes[0]?.id || "");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista e Hierarquia de Nós (Behavior Tree) */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Behavior Tree Stack</span>
            <button 
              onClick={handleCreateNode}
              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {nodes.map(n => (
              <button
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`w-full p-2.5 rounded text-left border text-xs font-mono transition-all flex items-center justify-between gap-1.5 ${
                  n.id === selectedNodeId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="space-y-1">
                  <span className="font-bold block truncate max-w-[140px]">{n.name}</span>
                  <span className="text-[9px] text-gray-500 uppercase">{n.type}</span>
                </div>
                
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  n.status === "running" ? "bg-cyan-950/30 text-cyan-400 border border-cyan-500/20" :
                  n.status === "success" ? "bg-green-950/30 text-green-400 border border-green-500/20" :
                  n.status === "failure" ? "bg-red-950/30 text-red-400 border border-red-500/20" : "bg-zinc-900 text-zinc-500"
                }`}>
                  {n.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Nós da Árvore de Comportamento decidem as reações imediatas físicas por ciclo de ticks de física de Thorne.
        </div>
      </div>

      {/* Coluna 2 e 3: Editor de Estados FSM e Velocidades de Thorne */}
      <div className="xl:col-span-2 space-y-4">
        {/* Editor de Estados HFSM */}
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-red-500" />
              <span>Hierarchical Finite State Machine (HFSM)</span>
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
              HFSM ACTIVE
            </span>
          </div>

          {/* Active State Grid */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
            {(["patrol", "investigate", "hunt", "ambush", "flee"] as const).map(state => (
              <button
                key={state}
                onClick={() => setActiveFSMState(state)}
                className={`p-3 rounded border transition-all ${
                  activeFSMState === state
                    ? "bg-red-950/20 border-red-500 text-white font-bold"
                    : "bg-black border-white/5 text-gray-500 hover:text-white"
                }`}
              >
                <div className="capitalize font-bold">{state}</div>
                <div className="text-[8px] text-gray-500 mt-1">
                  {state === activeFSMState ? "Ativo" : "Espera"}
                </div>
              </button>
            ))}
          </div>

          {/* Speed Modulators */}
          <div className="space-y-4 font-mono text-xs border-t border-white/5 pt-4">
            <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Moduladores de Velocidade Máxima</span>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Patrol speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Velocidade Patrulha (m/s)</span>
                  <span className="text-cyan-400 font-bold">{patrolSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={patrolSpeed}
                  onChange={(e) => setPatrolSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Search speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Velocidade Investigação (m/s)</span>
                  <span className="text-cyan-400 font-bold">{searchSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="6.0"
                  step="0.1"
                  value={searchSpeed}
                  onChange={(e) => setSearchSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Chase Speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Velocidade de Caça (m/s)</span>
                  <span className="text-red-400 font-bold">{chaseSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="12.0"
                  step="0.1"
                  value={chaseSpeed}
                  onChange={(e) => setChaseSpeed(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Ambush wait time */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tempo de Emboscada Máx. (s)</span>
                  <span className="text-cyan-400 font-bold">{ambushTime}s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={ambushTime}
                  onChange={(e) => setAmbushTime(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer flow */}
        <div className="bg-black border border-white/5 rounded p-4 h-28 relative overflow-hidden flex items-center justify-center">
          <div className="text-[9px] font-mono text-gray-500 uppercase absolute top-2 left-3">Visualizador de Grafo de Decisão</div>
          <div className="flex items-center space-x-6 font-mono text-[10px]">
            <span className="p-1.5 bg-green-950/30 text-green-400 border border-green-500/20 rounded">Patrol Sector</span>
            <span className="text-gray-500">→</span>
            <span className="p-1.5 bg-yellow-950/30 text-yellow-400 border border-yellow-500/20 rounded animate-pulse">Evaluate Sound</span>
            <span className="text-gray-500">→</span>
            <span className="p-1.5 bg-red-950/30 text-red-400 border border-red-500/20 rounded">Pursue Target</span>
          </div>
        </div>
      </div>

      {/* Coluna 4: Nós de Ação & Salvar */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Propriedades do Nó</span>
          </div>

          {activeNode ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 text-[10px] block">Tipo de Nó</span>
                <span className="text-white capitalize font-bold flex items-center space-x-1.5">
                  <GitMerge className="w-4 h-4 text-cyan-400" />
                  <span>{activeNode.type}</span>
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 text-[10px] block">Nome de Execução</label>
                <input
                  type="text"
                  value={activeNode.name}
                  onChange={(e) => handleUpdateNode(activeNode.id, { name: e.target.value })}
                  className="w-full bg-black border border-white/5 p-2 text-white font-mono rounded outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 text-[10px] block">Função / Algoritmo</label>
                <textarea
                  value={activeNode.desc}
                  rows={3}
                  onChange={(e) => handleUpdateNode(activeNode.id, { desc: e.target.value })}
                  className="w-full bg-black border border-white/5 p-2 text-gray-400 font-mono text-[11px] rounded outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={() => handleDeleteNode(activeNode.id)}
                className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir do Comportamento</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Selecione um nó para parametrizar.</div>
          )}
        </div>

        {/* Salvar Arvore de Decisão */}
        <button
          onClick={() => alert("Árvore de Comportamento e HFSM salvas e sincronizadas para Thorne!")}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Cérebro (IA)</span>
        </button>
      </div>
    </div>
  );
}
