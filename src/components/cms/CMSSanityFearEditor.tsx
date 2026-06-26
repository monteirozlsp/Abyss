import React, { useState } from "react";
import { 
  Heart, AlertCircle, Save, Sliders, Activity, Sparkles, 
  Settings, Zap, Shield, RotateCcw, Info, Volume2
} from "lucide-react";

export default function CMSSanityFearEditor() {
  // Sanity Settings State
  const [sanityDecayDark, setSanityDecayDark] = useState<number>(0.8);
  const [stressEncounterThorne, setStressEncounterThorne] = useState<number>(2.5);
  const [sanityRecuperationLight, setSanityRecuperationLight] = useState<number>(1.2);
  const [hallucinationThreshold, setHallucinationThreshold] = useState<number>(40);
  const [audioHallucinationVolume, setAudioHallucinationVolume] = useState<number>(50);

  // Fear Settings State
  const [adrenalineSpikeNoise, setAdrenalineSpikeNoise] = useState<number>(1.5);
  const [maxHeartrateBpm, setMaxHeartrateBpm] = useState<number>(180);
  const [flashlightFlickerProb, setFlashlightFlickerProb] = useState<number>(30);
  const [panickedSpeedPenalty, setPanickedSpeedPenalty] = useState<number>(15);

  const [simulationTime, setSimulationTime] = useState<number>(0);

  const handleResetDefaults = () => {
    setSanityDecayDark(0.8);
    setStressEncounterThorne(2.5);
    setSanityRecuperationLight(1.2);
    setHallucinationThreshold(40);
    setAudioHallucinationVolume(50);
    setAdrenalineSpikeNoise(1.5);
    setMaxHeartrateBpm(180);
    setFlashlightFlickerProb(30);
    setPanickedSpeedPenalty(15);
  };

  const handleSyncSettings = () => {
    alert("Parâmetros do Sanity & Fear Editor enviados em tempo real para a simulação ativa!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1 e 2: Sanity Editor (Aesthetics, Sliders) */}
      <div className="xl:col-span-2 bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-4 h-[520px] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-xs font-mono font-bold text-gray-400 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Editor de Sanidade Mental (Sanity)</span>
          </h3>
          <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
            PBR SYSTEM
          </span>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Configure as taxas de depleção e recuperação de integridade neurológica do jogador baseadas em ambientes e contatos agressivos.
          </p>

          {/* Decay rate in darkness */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Taxa de Decaimento no Escuro (%/s)</span>
              <span className="text-cyan-400 font-bold">{sanityDecayDark}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={sanityDecayDark}
              onChange={(e) => setSanityDecayDark(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Stress Multiplier Thorne */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Multiplicador ao Ver Thorne (x)</span>
              <span className="text-cyan-400 font-bold">{stressEncounterThorne}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={stressEncounterThorne}
              onChange={(e) => setStressEncounterThorne(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Sanity Recovery Light */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Recuperação Próximo a Luzes (%/s)</span>
              <span className="text-cyan-400 font-bold">{sanityRecuperationLight}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={sanityRecuperationLight}
              onChange={(e) => setSanityRecuperationLight(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Hallucination Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Gatilho de Ilusões / Vultos (%)</span>
              <span className="text-yellow-500 font-bold">Abaixo de {hallucinationThreshold}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="70"
              step="5"
              value={hallucinationThreshold}
              onChange={(e) => setHallucinationThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Audio Hallucination Vol */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Volume de Sussurros Auditivos (%)</span>
              <span className="text-cyan-400 font-bold">{audioHallucinationVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={audioHallucinationVolume}
              onChange={(e) => setAudioHallucinationVolume(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Coluna 3: Fear Editor (Adrenaline, Heartrate, Mechanics) */}
      <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-4 h-[520px] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-xs font-mono font-bold text-gray-400 flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Editor de Medo / Fisiologia</span>
          </h3>
          <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
            BIOMETRICS
          </span>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Configure as reações reflexas imediatas do personagem quando surpreendido por Thorne ou em estado de pânico prolongado.
          </p>

          {/* Adrenaline Spike */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ganho de Adrenalina por Som (x)</span>
              <span className="text-red-400 font-bold">{adrenalineSpikeNoise}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={adrenalineSpikeNoise}
              onChange={(e) => setAdrenalineSpikeNoise(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          {/* Max Heartrate BPM */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Frequência Cardíaca Máx (BPM)</span>
              <span className="text-red-400 font-bold">{maxHeartrateBpm} BPM</span>
            </div>
            <input
              type="range"
              min="120"
              max="220"
              step="5"
              value={maxHeartrateBpm}
              onChange={(e) => setMaxHeartrateBpm(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          {/* Flashlight Flicker Prob */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cintilação de Lanterna (%)</span>
              <span className="text-red-400 font-bold">{flashlightFlickerProb}% prob</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={flashlightFlickerProb}
              onChange={(e) => setFlashlightFlickerProb(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          {/* Panicked Speed Penalty */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Penalidade de Velocidade (%)</span>
              <span className="text-red-400 font-bold">-{panickedSpeedPenalty}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={panickedSpeedPenalty}
              onChange={(e) => setPanickedSpeedPenalty(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>
      </div>

      {/* Coluna 4: Telemetry Monitor / Sincronismo */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Monitor em Tempo Real</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Heartbeat Wave Simulator */}
            <div className="bg-black border border-white/5 p-3 rounded h-24 relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-2 left-2 text-[8px] text-gray-500 uppercase font-bold">Monitor Cardíaco (ECG)</div>
              
              <div className="flex items-end space-x-0.5 w-full h-12 px-2">
                {Array.from({ length: 32 }).map((_, i) => {
                  // Simulate heartbeat peaks
                  const isPeak = i % 8 === 0;
                  const height = isPeak ? "h-10 bg-red-500" : "h-2 bg-red-950/40";
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-t transition-all ${height}`}
                    />
                  );
                })}
              </div>
              <span className="absolute bottom-1 right-2 text-[10px] text-red-500 font-bold">142 BPM</span>
            </div>

            <div className="p-3 bg-black rounded border border-white/5 space-y-2 text-[10px] leading-relaxed text-gray-400">
              <span className="text-white font-bold block flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Integração de Sobrevivência</span>
              </span>
              <p>
                A alteração destes parâmetros influencia diretamente o tom do renderizador (vinheta escura de pânico) e os mixers da Web Audio API.
              </p>
            </div>

            <button
              onClick={handleResetDefaults}
              className="w-full py-1.5 bg-black hover:bg-white/5 border border-white/5 text-gray-300 text-[11px] rounded flex items-center justify-center space-x-1.5 transition-all font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncSettings}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Física</span>
        </button>
      </div>
    </div>
  );
}
