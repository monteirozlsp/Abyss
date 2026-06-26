import React, { useState } from "react";
import { 
  MessageSquare, Plus, Trash2, Save, Play, FileText, 
  Settings, CheckCircle2, Volume2, Sparkles, User
} from "lucide-react";

interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  audioTrack: string;
  duration: number; // in seconds
  subtitleSize: "SMALL" | "NORMAL" | "LARGE";
  triggerSource: "STRESS_SPIKE" | "AREA_ENTER" | "ITEM_PICKUP";
  version: number;
}

export default function CMSDialogueEditor() {
  const [dialogues, setDialogues] = useState<Dialogue[]>([
    {
      id: "d-1",
      speaker: "Dr. Albert (Rádio)",
      text: "Se você puder ouvir isso... mantenha a lanterna desligada. Ele responde diretamente à luz de alta frequência. E, pelo amor de Deus, não corra.",
      audioTrack: "radio_transmission_01.wav",
      duration: 8,
      subtitleSize: "NORMAL",
      triggerSource: "AREA_ENTER",
      version: 1
    },
    {
      id: "d-2",
      speaker: "Alucinação Sináptica",
      text: "Ele sabe que você está aqui. O abismo respira por suas feridas.",
      audioTrack: "whisper_hallucination_04.wav",
      duration: 5,
      subtitleSize: "LARGE",
      triggerSource: "STRESS_SPIKE",
      version: 2
    },
    {
      id: "d-3",
      speaker: "Computador Central",
      text: "Alerta: Fusível de potência do setor médico ejetado por sobrecarga térmica.",
      audioTrack: "sys_alarm_potency.wav",
      duration: 6,
      subtitleSize: "SMALL",
      triggerSource: "ITEM_PICKUP",
      version: 1
    }
  ]);

  const [selectedDiagId, setSelectedDiagId] = useState<string>("d-1");
  const activeDialogue = dialogues.find(d => d.id === selectedDiagId) || dialogues[0];

  const handleUpdateDialogue = (fields: Partial<Dialogue>) => {
    setDialogues(prev => prev.map(d => {
      if (d.id === activeDialogue.id) {
        return { ...d, ...fields, version: d.version + 1 };
      }
      return d;
    }));
  };

  const handleCreateDialogue = () => {
    const newDiag: Dialogue = {
      id: `d-${Date.now()}`,
      speaker: "Sobrevivente",
      text: "Insira a linha narrativa ou sussurro que o jogador ouvirá em seu rádio ou psiquismo.",
      audioTrack: "silence.wav",
      duration: 4,
      subtitleSize: "NORMAL",
      triggerSource: "AREA_ENTER",
      version: 1
    };
    setDialogues(prev => [...prev, newDiag]);
    setSelectedDiagId(newDiag.id);
  };

  const handleDeleteDialogue = (id: string) => {
    setDialogues(prev => prev.filter(d => d.id !== id));
    if (selectedDiagId === id) {
      setSelectedDiagId(dialogues[0]?.id || "");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Diálogos e Narrações */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Linhas Narrativas / Diálogos</span>
            <button 
              onClick={handleCreateDialogue}
              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {dialogues.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDiagId(d.id)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1 ${
                  d.id === selectedDiagId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[140px]">{d.speaker}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
                    v{d.version}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-gray-500 truncate max-w-[130px]">
                    "{d.text}"
                  </span>
                  <span className="text-[9px] text-red-400 uppercase font-bold text-[8px]">
                    {d.triggerSource}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Diálogos e sussurros são carregados e disparados dinamicamente com base nas interações de linha de visão do jogador.
        </div>
      </div>

      {/* Coluna 2 e 3: Editor de Diálogos / Legendas */}
      <div className="xl:col-span-2 bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6 h-[520px] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-red-500" />
            <span>Editor de Roteiro Narrativo</span>
          </h3>
          <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
            DIALOGUE ENGINE ACTIVE
          </span>
        </div>

        {activeDialogue ? (
          <div className="space-y-4 font-mono text-xs">
            {/* Orador / Speaker */}
            <div className="space-y-1">
              <label className="text-gray-400 text-[10px] uppercase flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-red-500" />
                <span>Orador / Canal do Áudio</span>
              </label>
              <input
                type="text"
                value={activeDialogue.speaker}
                onChange={(e) => handleUpdateDialogue({ speaker: e.target.value })}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2.5 text-white font-mono rounded transition-all outline-none"
              />
            </div>

            {/* Texto de Legenda */}
            <div className="space-y-1">
              <label className="text-gray-400 text-[10px] uppercase">Texto de Legenda / Roteiro</label>
              <textarea
                value={activeDialogue.text}
                rows={4}
                onChange={(e) => handleUpdateDialogue({ text: e.target.value })}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2.5 text-white font-mono rounded transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Arquivo de Áudio Vinculado e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Trilha de Áudio Vinculada</label>
                <select
                  value={activeDialogue.audioTrack}
                  onChange={(e) => handleUpdateDialogue({ audioTrack: e.target.value })}
                  className="w-full bg-black border border-white/5 p-2 text-gray-300 rounded outline-none"
                >
                  <option value="radio_transmission_01.wav">radio_transmission_01.wav</option>
                  <option value="whisper_hallucination_04.wav">whisper_hallucination_04.wav</option>
                  <option value="sys_alarm_potency.wav">sys_alarm_potency.wav</option>
                  <option value="silence.wav">silence.wav (Apenas Legendas)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Duração das Legendas (s)</label>
                <input
                  type="number"
                  value={activeDialogue.duration}
                  min="1"
                  max="30"
                  onChange={(e) => handleUpdateDialogue({ duration: Number(e.target.value) })}
                  className="w-full bg-black border border-white/5 p-2 text-white font-mono rounded outline-none"
                />
              </div>
            </div>

            {/* Fonte de Disparo & Estilo de Fonte */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Origem de Disparo</label>
                <select
                  value={activeDialogue.triggerSource}
                  onChange={(e) => handleUpdateDialogue({ triggerSource: e.target.value as any })}
                  className="w-full bg-black border border-white/5 p-2 text-gray-300 rounded outline-none"
                >
                  <option value="AREA_ENTER">Entrar em Área narrativa</option>
                  <option value="STRESS_SPIKE">Pico de Estresse (Fisiologia)</option>
                  <option value="ITEM_PICKUP">Coleta de Item Chave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Tamanho das Legendas</label>
                <select
                  value={activeDialogue.subtitleSize}
                  onChange={(e) => handleUpdateDialogue({ subtitleSize: e.target.value as any })}
                  className="w-full bg-black border border-white/5 p-2 text-gray-300 rounded outline-none"
                >
                  <option value="SMALL">Pequena (Sussurros)</option>
                  <option value="NORMAL">Normal (Diálogos/Rádio)</option>
                  <option value="LARGE">Grande (Terror Psicológico)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">Nenhum diálogo selecionado.</div>
        )}
      </div>

      {/* Coluna 4: Preview e Sincronismo */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Simulador de Legenda</span>
          </div>

          {activeDialogue ? (
            <div className="space-y-4 font-mono text-xs">
              {/* Box de simulação visual de legenda */}
              <div className="bg-black/80 border border-white/5 p-4 rounded min-h-[140px] flex flex-col justify-end items-center relative overflow-hidden text-center">
                <span className="absolute top-2 left-2 text-[8px] text-gray-600 uppercase font-bold">Preview HUD no Jogo</span>
                
                <div className="space-y-2 max-w-xs">
                  <span className="text-red-500 font-bold text-[9px] block uppercase tracking-wide">
                    {activeDialogue.speaker}
                  </span>
                  <p className={`text-gray-200 leading-normal ${
                    activeDialogue.subtitleSize === "SMALL" ? "text-[10px]" :
                    activeDialogue.subtitleSize === "LARGE" ? "text-sm font-bold text-red-400" : "text-xs"
                  }`}>
                    {activeDialogue.text}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-black rounded border border-white/5 space-y-2">
                <span className="text-white font-bold block text-[10px] flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Áudio Sincronizado</span>
                </span>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Ao carregar essa legenda, a Web Audio API disparará automaticamente a faixa <span className="text-cyan-400">{activeDialogue.audioTrack}</span> com compressão PBR.
                </p>
              </div>

              <button
                onClick={() => handleDeleteDialogue(activeDialogue.id)}
                className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Diálogo</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Selecione um diálogo para ver a legenda.</div>
          )}
        </div>

        {/* Salvar Linha de Diálogo */}
        <button
          onClick={() => alert("Diálogos e roteiros narratives sincronizados em tempo real!")}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Diálogos</span>
        </button>
      </div>
    </div>
  );
}
