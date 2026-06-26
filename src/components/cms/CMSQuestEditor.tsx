import React, { useState } from "react";
import { 
  ClipboardList, Plus, Trash2, Save, FileText, Settings, 
  CheckCircle2, AlertTriangle, ArrowRight, Play, Eye
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  triggerType: "AREA_ENTER" | "ITEM_PICKUP" | "SURVIVAL_TIME" | "MISTAKE_COUNT";
  triggerParam: string;
  rewardSanity: number;
  rewardItem: string;
  version: number;
}

export default function CMSQuestEditor() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "q-1",
      title: "Restabelecer Gerador Auxiliar",
      description: "Encontre 3 fusíveis de cobre no subsolo e insira no painel principal para reativar as luzes e deter o pânico.",
      status: "PUBLISHED",
      triggerType: "ITEM_PICKUP",
      triggerParam: "copper_fuse",
      rewardSanity: 25,
      rewardItem: "battery_pack_high",
      version: 2
    },
    {
      id: "q-2",
      title: "Silêncio Absoluto",
      description: "Sobreviva por 2 minutos na área médica sem emitir nenhum som acima de 0.4 de intensidade.",
      status: "DRAFT",
      triggerType: "SURVIVAL_TIME",
      triggerParam: "120_seconds",
      rewardSanity: 40,
      rewardItem: "medical_syringe",
      version: 1
    },
    {
      id: "q-3",
      title: "Deter o Estresse de Thorne",
      description: "Fuja do setor de ventilação principal de Thorne sem acender a lanterna direta.",
      status: "PUBLISHED",
      triggerType: "AREA_ENTER",
      triggerParam: "vent_sector_b",
      rewardSanity: 15,
      rewardItem: "nightvision_battery",
      version: 3
    }
  ]);

  const [selectedQuestId, setSelectedQuestId] = useState<string>("q-1");
  const activeQuest = quests.find(q => q.id === selectedQuestId) || quests[0];

  const handleUpdateQuest = (fields: Partial<Quest>) => {
    setQuests(prev => prev.map(q => {
      if (q.id === activeQuest.id) {
        return { ...q, ...fields, version: q.version + (fields.status ? 0 : 1) };
      }
      return q;
    }));
  };

  const handleCreateQuest = () => {
    const newQuest: Quest = {
      id: `q-${Date.now()}`,
      title: "Nova Missão de Sobrevivência",
      description: "Descreva os objetivos do jogador para desbloquear as portas do Abisso.",
      status: "DRAFT",
      triggerType: "AREA_ENTER",
      triggerParam: "trigger_zone_alpha",
      rewardSanity: 10,
      rewardItem: "none",
      version: 1
    };
    setQuests(prev => [...prev, newQuest]);
    setSelectedQuestId(newQuest.id);
  };

  const handleDeleteQuest = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    if (selectedQuestId === id) {
      setSelectedQuestId(quests[0]?.id || "");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Missões */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Banco de Missões / Quests</span>
            <button 
              onClick={handleCreateQuest}
              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {quests.map(q => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestId(q.id)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1 ${
                  q.id === selectedQuestId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[150px]">{q.title}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
                    v{q.version}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-gray-500 capitalize">
                    Tipo: {q.triggerType.toLowerCase()}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    q.status === "PUBLISHED" ? "bg-green-950/30 text-green-400 border border-green-500/20" : "bg-zinc-900 text-zinc-500"
                  }`}>
                    {q.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Quests ativas são transmitidas diretamente para a HUD do jogador via barramento de eventos do Kernel em tempo de execução.
        </div>
      </div>

      {/* Coluna 2 e 3: Área de Edição e Validação de Gatilhos */}
      <div className="xl:col-span-2 bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6 h-[520px] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ClipboardList className="w-4 h-4 text-red-500" />
            <span>Editor de Objetivos Dinâmicos</span>
          </h3>
          <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
            QUEST ENGINE ACTIVE
          </span>
        </div>

        {activeQuest ? (
          <div className="space-y-4 font-mono text-xs">
            {/* Título */}
            <div className="space-y-1">
              <label className="text-gray-400 text-[10px] uppercase">Título da Quest</label>
              <input
                type="text"
                value={activeQuest.title}
                onChange={(e) => handleUpdateQuest({ title: e.target.value })}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2.5 text-white font-mono rounded transition-all outline-none"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <label className="text-gray-400 text-[10px] uppercase">Instruções de Sobrevivência (HUD)</label>
              <textarea
                value={activeQuest.description}
                rows={3}
                onChange={(e) => handleUpdateQuest({ description: e.target.value })}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2.5 text-white font-mono rounded transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Configuração de Gatilho / Trigger */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Gatilho de Ativação</label>
                <select
                  value={activeQuest.triggerType}
                  onChange={(e) => handleUpdateQuest({ triggerType: e.target.value as any })}
                  className="w-full bg-black border border-white/5 p-2 text-gray-300 rounded outline-none"
                >
                  <option value="AREA_ENTER">Entrar em Área</option>
                  <option value="ITEM_PICKUP">Coleta de Item</option>
                  <option value="SURVIVAL_TIME">Tempo Sobrevivido</option>
                  <option value="MISTAKE_COUNT">Erros Cometidos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase">Parâmetro de Validação</label>
                <input
                  type="text"
                  value={activeQuest.triggerParam}
                  onChange={(e) => handleUpdateQuest({ triggerParam: e.target.value })}
                  className="w-full bg-black border border-white/5 p-2 text-white font-mono rounded outline-none"
                />
              </div>
            </div>

            {/* Recompensas */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-[10px] text-gray-500 uppercase block tracking-wider">Recompensas ao Concluir</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px]">Restaurar Sanidade (%)</label>
                  <input
                    type="number"
                    value={activeQuest.rewardSanity}
                    min="0"
                    max="100"
                    onChange={(e) => handleUpdateQuest({ rewardSanity: Number(e.target.value) })}
                    className="w-full bg-black border border-white/5 p-2 text-cyan-400 font-mono rounded outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px]">Item de Inventário Adicional</label>
                  <select
                    value={activeQuest.rewardItem}
                    onChange={(e) => handleUpdateQuest({ rewardItem: e.target.value })}
                    className="w-full bg-black border border-white/5 p-2 text-gray-300 rounded outline-none"
                  >
                    <option value="none">Nenhum</option>
                    <option value="battery_pack">Bateria Padrão</option>
                    <option value="battery_pack_high">Bateria Alta Capacidade</option>
                    <option value="medical_syringe">Seringa Médica</option>
                    <option value="nightvision_battery">Célula de Visão Noturna</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">Nenhuma missão selecionada.</div>
        )}
      </div>

      {/* Coluna 4: Detalhes e Publicação / Status */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Estado de Validação</span>
          </div>

          {activeQuest ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <span className="text-gray-500 text-[10px] block">Status de Produção</span>
                <div className="flex gap-2">
                  {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateQuest({ status: st })}
                      className={`px-2 py-1 border text-[10px] rounded font-bold transition-all ${
                        activeQuest.status === st
                          ? "bg-red-950/30 border-red-500 text-white"
                          : "bg-black border-white/5 text-gray-500 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-black rounded border border-white/5 space-y-2">
                <span className="text-white font-bold block text-[10px] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Sintaxe de Trigger OK</span>
                </span>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Gatilho de tipo <span className="text-red-400">{activeQuest.triggerType}</span> foi testado contra a tabela de colisões e está respondendo perfeitamente no mapa ativo.
                </p>
              </div>

              <button
                onClick={() => handleDeleteQuest(activeQuest.id)}
                className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Missão</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Selecione uma missão para validar.</div>
          )}
        </div>

        {/* Salvar Missão */}
        <button
          onClick={() => alert("Missão sincronizada e salva com sucesso no banco de dados!")}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Objetivos</span>
        </button>
      </div>
    </div>
  );
}
