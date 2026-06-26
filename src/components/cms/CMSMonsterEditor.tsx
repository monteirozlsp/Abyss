import React, { useState, useEffect } from "react";
import { 
  Users, Sliders, Shield, Volume2, Sparkles, Terminal, Save, AlertCircle, Play, Pause, ChevronRight 
} from "lucide-react";

interface BehaviorNode {
  id: string;
  name: string;
  type: "ACTION" | "SELECTOR" | "SEQUENCE";
  status: "SUCCESS" | "FAILURE" | "RUNNING" | "READY";
}

interface MonsterData {
  id: string;
  name: string;
  aggressiveness: number;
  speed: number;
  hearingRadius: number;
  selectedSkin: string;
  footstepSfx: string;
  screechSfx: string;
  behaviorNodes: BehaviorNode[];
}

export default function CMSMonsterEditor() {
  const [monsters, setMonsters] = useState<MonsterData[]>([
    {
      id: "m-1",
      name: "Thorne (O Cirurgião Patologista)",
      aggressiveness: 85,
      speed: 4.8,
      hearingRadius: 18,
      selectedSkin: "biohazard_suit.glb",
      footstepSfx: "heavy_boots_echo.wav",
      screechSfx: "surgical_drill_scream.wav",
      behaviorNodes: [
        { id: "n-1", name: "Selecione Alvo", type: "SELECTOR", status: "SUCCESS" },
        { id: "n-2", name: "Patrulhar Corredores", type: "SEQUENCE", status: "RUNNING" },
        { id: "n-3", name: "Perseguir Jogador", type: "ACTION", status: "READY" },
        { id: "n-4", name: "Ataque Cortante", type: "ACTION", status: "READY" }
      ]
    },
    {
      id: "m-2",
      name: "Paciente Cego (Anomalia Zero-Três)",
      aggressiveness: 60,
      speed: 3.2,
      hearingRadius: 30,
      selectedSkin: "blind_patient_bandaged.glb",
      footstepSfx: "shuffling_slippers.wav",
      screechSfx: "throat_raspy_pant.wav",
      behaviorNodes: [
        { id: "n-5", name: "Ouvir Sons", type: "SELECTOR", status: "RUNNING" },
        { id: "n-6", name: "Investigar Ruído", type: "SEQUENCE", status: "READY" },
        { id: "n-7", name: "Ataque Surpresa", type: "ACTION", status: "READY" }
      ]
    }
  ]);

  const [selectedMonsterId, setSelectedMonsterId] = useState<string>("m-1");
  const [aggressiveness, setAggressiveness] = useState<number>(85);
  const [speed, setSpeed] = useState<number>(4.8);
  const [hearing, setHearing] = useState<number>(18);
  const [selectedSkin, setSelectedSkin] = useState<string>("biohazard_suit.glb");
  const [footstep, setFootstep] = useState<string>("heavy_boots_echo.wav");
  const [screech, setScreech] = useState<string>("surgical_drill_scream.wav");

  const [simRunning, setSimRunning] = useState<boolean>(true);
  const [simLogs, setSimLogs] = useState<string[]>([
    "Thorne inicializou com sucesso no Setor de Isolamento Clínico.",
    "Comportamento: Iniciando Patrulha Corredores com peso 0.8"
  ]);

  const activeMonster = monsters.find(m => m.id === selectedMonsterId) || monsters[0];

  const handleApplyPreset = (m: MonsterData) => {
    setSelectedMonsterId(m.id);
    setAggressiveness(m.aggressiveness);
    setSpeed(m.speed);
    setHearing(m.hearingRadius);
    setSelectedSkin(m.selectedSkin);
    setFootstep(m.footstepSfx);
    setScreech(m.screechSfx);
  };

  // Efeito para criar logs de simulação da IA em execução
  useEffect(() => {
    if (!simRunning) return;

    const interval = setInterval(() => {
      const actions = [
        `Executando nó de comportamento "${activeMonster.behaviorNodes[Math.floor(Math.random() * activeMonster.behaviorNodes.length)].name}"`,
        `Thorne avaliou ruído ambiente. Nível de alerta atual: ${(aggressiveness * 0.7).toFixed(0)}%`,
        `Velocidade de navegação ajustada para ${speed.toFixed(1)} m/s devido ao estado de alerta`,
        `Frequência cardíaca do monstro: ${Math.floor(Math.random() * 30 + 110)} BPM`,
        `Carregando áudio sfx de passos: "${footstep}"`
      ];

      setSimLogs(prev => [actions[Math.floor(Math.random() * actions.length)], ...prev.slice(0, 5)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [simRunning, activeMonster, aggressiveness, speed, footstep]);

  const handleSaveMonster = () => {
    setMonsters(prev => prev.map(m => {
      if (m.id === selectedMonsterId) {
        return {
          ...m,
          aggressiveness,
          speed,
          hearingRadius: hearing,
          selectedSkin,
          footstepSfx: footstep,
          screechSfx: screech
        };
      }
      return m;
    }));
    setSimLogs(prev => [`[CMS] Salvas alterações da IA de ${activeMonster.name}`, ...prev]);

    // Dispatch custom window event to notify the core simulation (ThorneAI)
    if (typeof window !== "undefined") {
      const event = new CustomEvent("abyss:monster_settings_changed", {
        detail: {
          aggressiveness,
          hearingRange: hearing,
          speed,
          selectedSkin,
          footstep,
          screech,
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Entidades Monstro */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Modelos de IA Cadastrados</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {monsters.map(m => (
              <button
                key={m.id}
                onClick={() => handleApplyPreset(m)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1.5 ${
                  m.id === selectedMonsterId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[150px]">{m.name}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Vel: {m.speed} m/s</span>
                  <span>Agressão: {m.aggressiveness}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Defina as regras de tomada de decisão do HFSM (Hierarchical Finite State Machine) de cada inimigo para ditar sua IA.
        </div>
      </div>

      {/* Coluna 2 e 3: Árvore de Comportamento Interativa (Behavior Tree) */}
      <div className="xl:col-span-2 space-y-4">
        {/* Simulação em Tempo Real HUD */}
        <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block tracking-wider">Simulação de Comportamento</span>
            <span className="text-xs font-bold text-white font-mono flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${simRunning ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
              <span>{simRunning ? "EXECUTANDO SINTETIZADOR DE COMPORTAMENTOS" : "SIMULAÇÃO PAUSADA"}</span>
            </span>
          </div>

          <button
            onClick={() => setSimRunning(!simRunning)}
            className={`px-3 py-1 bg-black hover:bg-white/5 border border-white/5 text-xs font-mono rounded flex items-center space-x-1.5 transition-all ${
              simRunning ? "text-amber-400" : "text-green-400"
            }`}
          >
            {simRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simRunning ? "Pausar Simulação" : "Executar Simulação"}</span>
          </button>
        </div>

        {/* Visualizador da Árvore de Decisão */}
        <div className="bg-black border border-white/5 rounded p-6 h-[360px] flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider border-b border-white/5 pb-1">
              Árvore de Comportamento (Behavior Tree Editor)
            </div>

            {/* Renderização dos nós fictícios com status da execução */}
            <div className="space-y-2 font-mono">
              <div className="p-2.5 bg-[#0a0a0a] border border-white/10 rounded-md flex justify-between items-center text-xs">
                <span className="text-white font-bold flex items-center space-x-1.5">
                  <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-500/20 px-1 rounded font-mono">ROOT</span>
                  <span>Árvore de Decisão Principal</span>
                </span>
                <span className="text-gray-500 text-[10px]">TIPO: SELECTOR</span>
              </div>

              <div className="pl-6 border-l border-white/10 space-y-2">
                {activeMonster.behaviorNodes.map((node) => (
                  <div key={node.id} className="p-2 bg-black rounded border border-white/5 flex justify-between items-center text-xs">
                    <span className="text-gray-300 flex items-center space-x-2">
                      <span className={`text-[9px] px-1 rounded ${
                        node.type === "SELECTOR" ? "bg-purple-950 text-purple-400" :
                        node.type === "SEQUENCE" ? "bg-cyan-950 text-cyan-400" : "bg-red-950 text-red-400"
                      }`}>{node.type}</span>
                      <span>{node.name}</span>
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      node.status === "SUCCESS" ? "bg-green-950 text-green-400" :
                      node.status === "RUNNING" ? "bg-cyan-950 text-cyan-400 animate-pulse" : "bg-zinc-900 text-zinc-500"
                    }`}>{node.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log de IA do Monstro */}
          <div className="p-3 bg-black/60 rounded border border-white/5 font-mono text-[10px] text-gray-400 h-24 overflow-y-auto space-y-1 text-left leading-relaxed">
            {simLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-1">
                <span className="text-red-500 font-bold">▶</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna 4: Sliders e Parâmetros */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Modificadores Globais</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Agressividade Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Nível de Agressividade</span>
                <span className="text-red-400 font-bold">{aggressiveness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={aggressiveness}
                onChange={(e) => setAggressiveness(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Velocidade Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Velocidade de Deslocamento</span>
                <span className="text-red-400 font-bold">{speed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.2"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Raio de Audição Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Raio de Sensibilidade Auditiva</span>
                <span className="text-red-400 font-bold">{hearing} metros</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={hearing}
                onChange={(e) => setHearing(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Sound Effects Assigner */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="space-y-1">
                <label className="text-gray-500 text-[9px] uppercase">Grito/Rosnado Ativo (SFX)</label>
                <select
                  value={screech}
                  onChange={(e) => setScreech(e.target.value)}
                  className="w-full bg-black border border-white/5 text-xs text-white p-2 rounded outline-none"
                >
                  <option value="surgical_drill_scream.wav">Surgical Drill Scream (Padrão)</option>
                  <option value="demon_gutural_groan.wav">Demon Gutural Groan</option>
                  <option value="electric_buzz_screech.wav">Electric Buzz Screech</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 text-[9px] uppercase">Passos Ativo (SFX)</label>
                <select
                  value={footstep}
                  onChange={(e) => setFootstep(e.target.value)}
                  className="w-full bg-black border border-white/5 text-xs text-white p-2 rounded outline-none"
                >
                  <option value="heavy_boots_echo.wav">Heavy Boots Echo (Padrão)</option>
                  <option value="claw_scrape_stone.wav">Claw Scrape Stone</option>
                  <option value="flesh_squish_wet.wav">Flesh Squish Wet</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Salvar Configurações da IA */}
        <button
          onClick={handleSaveMonster}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Árvore de Decisão</span>
        </button>
      </div>
    </div>
  );
}
