import React, { useState } from "react";
import { 
  GitBranch, RefreshCw, UploadCloud, RotateCcw, Play, 
  Settings, CheckCircle2, AlertTriangle, PlayCircle, Eye, 
  Terminal, Server, CalendarDays, ShieldAlert
} from "lucide-react";

interface PatchVersion {
  id: string;
  tag: string;
  title: string;
  releasedAt: string;
  releasedBy: string;
  status: "ACTIVE" | "STABLE" | "DEPRECATED";
  releaseNotes: string;
}

export default function CMSPublishingEditor() {
  const [versions, setVersions] = useState<PatchVersion[]>([
    {
      id: "v-1",
      tag: "v2.4.0-production",
      title: "Hotfix Thorne AI & Sanity Balance",
      releasedAt: "2026-06-26 14:20",
      releasedBy: "luizvanildo240@gmail.com",
      status: "ACTIVE",
      releaseNotes: "Ajustada a sensibilidade acústica de Thorne de 30m para 24m para favorecer movimentação agachada silenciosa. Reduzida depleção de sanidade."
    },
    {
      id: "v-2",
      tag: "v2.3.9-production",
      title: "Ajuste de Luzes e Colisões do Hospital",
      releasedAt: "2026-06-25 11:15",
      releasedBy: "luizvanildo240@gmail.com",
      status: "STABLE",
      releaseNotes: "Correção de vazamento de luz volumétrica através da parede do hospital de campanha e otimização de colisões nas portas corrediças."
    },
    {
      id: "v-3",
      tag: "v2.3.8-production",
      title: "Audio Mixer PBR & Ambush Setup",
      releasedAt: "2026-06-20 09:40",
      releasedBy: "luizvanildo240@gmail.com",
      status: "STABLE",
      releaseNotes: "Introduzido suporte nativo a decaimento de ondas acústicas no Web Audio API e comportamento de emboscada para Thorne."
    }
  ]);

  const [selectedVerId, setSelectedVerId] = useState<string>("v-1");
  const activeVersion = versions.find(v => v.id === selectedVerId) || versions[0];

  const [newTitle, setNewTitle] = useState<string>("");
  const [newNotes, setNewNotes] = useState<string>("");
  const [isHotReloadEnabled, setIsHotReloadEnabled] = useState<boolean>(true);
  const [deployLogs, setDeployLogs] = useState<string[]>([
    "[SYSTEM] Inicializada conexão com os servidores de CDN de baixa latência.",
    "[COMPILER] Compilação estática de mapas de colisão concluída (142 KB).",
    "[ENGINE] Todos os pacotes de áudio OGG Vorbis validados contra metadados.",
    "[DEPLOY] Deploy realizado com sucesso para cluster 'us-east-1-abyss-prod'."
  ]);

  const handlePublishNewVersion = () => {
    if (!newTitle || !newNotes) {
      alert("Por favor, preencha o título e as notas de lançamento para publicar.");
      return;
    }

    const nextTag = `v2.4.${versions.length - 1}-production`;
    const newVer: PatchVersion = {
      id: `v-${Date.now()}`,
      tag: nextTag,
      title: newTitle,
      releasedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      releasedBy: "luizvanildo240@gmail.com",
      status: "ACTIVE",
      releaseNotes: newNotes
    };

    // Deprecate previous active
    setVersions(prev => [
      newVer,
      ...prev.map(v => v.status === "ACTIVE" ? { ...v, status: "STABLE" as const } : v)
    ]);
    setSelectedVerId(newVer.id);
    setNewTitle("");
    setNewNotes("");

    // Log the hot reload and deployment success
    const time = new Date().toTimeString().split(' ')[0];
    setDeployLogs(prev => [
      `[${time}] [HOT RELOAD] Configurações de jogo recarregadas na sessão ativa!`,
      `[${time}] [DEPLOY] Patch de versão ${nextTag} distribuído globalmente via Edge CDN.`,
      ...prev
    ]);

    alert(`Versão ${nextTag} publicada e injetada com sucesso em tempo de jogo (Hot Reload)!`);
  };

  const handleRollback = (targetVer: PatchVersion) => {
    const confirmation = window.confirm(`Deseja realizar o ROLLBACK de segurança do servidor de produção para a versão ${targetVer.tag}?`);
    if (confirmation) {
      setVersions(prev => prev.map(v => {
        if (v.id === targetVer.id) return { ...v, status: "ACTIVE" as const };
        if (v.status === "ACTIVE") return { ...v, status: "STABLE" as const };
        return v;
      }));
      setSelectedVerId(targetVer.id);

      const time = new Date().toTimeString().split(' ')[0];
      setDeployLogs(prev => [
        `[${time}] [ROLLBACK] Revertendo configurações do banco central para ${targetVer.tag}.`,
        `[${time}] [HOT RELOAD] Notificados todos os clientes em partida sobre restauração de versão.`,
        ...prev
      ]);
      alert(`Servidores revertidos com sucesso para a versão estável ${targetVer.tag}.`);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Lista de Versões / Branchs */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400 font-bold">Histórico de Deploy / Versões</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {versions.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVerId(v.id)}
                className={`w-full p-3 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1.5 ${
                  v.id === selectedVerId
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold truncate max-w-[150px]">{v.title}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
                    v.status === "ACTIVE" ? "bg-red-950/30 text-red-400 border border-red-500/20" : "bg-zinc-900 text-zinc-500"
                  }`}>
                    {v.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-500">
                  <span>{v.tag}</span>
                  <span>{v.releasedAt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Clique em qualquer versão do histórico para consultar os Release Notes ou acionar um rollback de segurança instantâneo.
        </div>
      </div>

      {/* Coluna 2 e 3: Live Preview & Publicador de Nova Versão */}
      <div className="xl:col-span-2 space-y-4">
        {/* Controle do Live Preview & Hot Reload */}
        <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded flex items-center justify-between font-mono text-xs">
          <div className="space-y-0.5">
            <span className="text-white font-bold block flex items-center space-x-1">
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isHotReloadEnabled ? "animate-spin" : ""}`} />
              <span>Hot Reloading Ativo</span>
            </span>
            <p className="text-[10px] text-gray-500">Alterações no CMS são refletidas no jogo ativo sem fechar o cliente.</p>
          </div>
          
          <button
            onClick={() => setIsHotReloadEnabled(!isHotReloadEnabled)}
            className={`px-3 py-1.5 border font-bold rounded transition-all ${
              isHotReloadEnabled 
                ? "bg-green-950/30 border-green-500 text-green-400" 
                : "bg-zinc-950 border-zinc-500 text-zinc-500"
            }`}
          >
            {isHotReloadEnabled ? "ATIVADO" : "DESATIVADO"}
          </button>
        </div>

        {/* Form para Publicação de Novo Patch */}
        <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-xs font-mono font-bold text-white flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-red-500" />
              <span>Publicar Novo Patch de Configuração</span>
            </h3>
            <span className="text-[9px] bg-red-950 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
              CDN TARGET
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 text-[10px]">Título da Atualização / Descritor</label>
              <input
                type="text"
                placeholder="Ex: Ajuste de Dano e Luzes"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2 text-white font-mono rounded outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-[10px]">Release Notes (Registro de Alterações)</label>
              <textarea
                placeholder="O que foi alterado nos parâmetros de IA, áudio ou física?"
                value={newNotes}
                rows={3}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-black border border-white/5 hover:border-white/20 focus:border-red-500/50 p-2 text-white font-mono rounded outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handlePublishNewVersion}
              className="w-full py-2.5 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 hover:border-red-400 text-red-400 rounded flex items-center justify-center space-x-2 transition-all font-bold"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Publicar e Aplicar (Hot Reload)</span>
            </button>
          </div>
        </div>

        {/* Console de logs de distribuição CDN */}
        <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Deployment Terminal Logs</span>
          <div className="bg-black/80 rounded p-3 border border-white/5 h-24 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-1">
            {deployLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna 4: Detalhes da Versão Selecionada & Rollback */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Metadata do Patch</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-gray-500 text-[9px] block">Versão Selecionada</span>
              <span className="text-white font-bold">{activeVersion.tag}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-gray-500 text-[9px] block">Publicado em</span>
              <span className="text-gray-300">{activeVersion.releasedAt}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-gray-500 text-[9px] block">Autor do Deploy</span>
              <span className="text-cyan-400">{activeVersion.releasedBy}</span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 text-[9px] block">Notas de Lançamento</span>
              <p className="text-gray-400 bg-black/50 border border-white/5 p-2 rounded text-[10px] leading-relaxed max-h-[140px] overflow-y-auto">
                {activeVersion.releaseNotes}
              </p>
            </div>

            {activeVersion.status !== "ACTIVE" ? (
              <button
                onClick={() => handleRollback(activeVersion)}
                className="w-full py-2 bg-yellow-950/20 hover:bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 rounded flex items-center justify-center space-x-1.5 transition-all text-[11px] font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback para esta Versão</span>
              </button>
            ) : (
              <div className="p-3 bg-red-950/10 border border-red-500/15 rounded text-[10px] text-red-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Esta é a versão ativa em produção.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live System Ingress Status */}
        <div className="p-3 bg-black rounded border border-white/5 flex items-center space-x-3 text-[10px] font-mono text-gray-500">
          <Server className="w-4 h-4 text-green-500 shrink-0" />
          <span>Ingress Controller: <span className="text-white font-bold">100% OK</span></span>
        </div>
      </div>
    </div>
  );
}
