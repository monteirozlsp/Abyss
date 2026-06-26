import React, { useState, useEffect } from "react";
import { 
  Users, Activity, AlertOctagon, Terminal, Server, Cpu, HardDrive, 
  Play, Square, RefreshCw, ChevronRight, FileText, CheckCircle2 
} from "lucide-react";
import { motion } from "motion/react";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
  source: string;
  message: string;
}

export default function CMSDashboard() {
  const [cpuUsage, setCpuUsage] = useState<number>(42);
  const [ramUsage, setRamUsage] = useState<number>(58);
  const [activeUsers, setActiveUsers] = useState<number>(1420);
  const [averageFps, setAverageFps] = useState<number>(59.4);
  const [serverStatus, setServerStatus] = useState<"ONLINE" | "MAINTENANCE" | "OFFLINE">("ONLINE");
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "14:42:10", level: "INFO", source: "GATEWAY", message: "Conexão de WebSocket estabelecida para user_9b1deb4" },
    { timestamp: "14:42:15", level: "WARN", source: "AUDIO_ENGINE", message: "Atraso de buffer detectado na Web Audio API (PannerNode)" },
    { timestamp: "14:42:22", level: "ERROR", source: "PHYSICS_ENGINE", message: "Colisão inválida detectada no Trigger Volume 'Hospital_Wing_G12_Secret'" },
    { timestamp: "14:42:30", level: "INFO", source: "DATABASE", message: "Sincronização de SaveGame concluída para usuário luizvanildo240" },
    { timestamp: "14:42:35", level: "CRITICAL", source: "ANTIGRAVITY", message: "Detecção de anomalia sináptica: Thorne se aproximando do jogador" }
  ]);

  // Efeito para oscilar métricas e criar um ar "vivo"
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 10) - 5;
        return Math.max(10, Math.min(95, prev + delta));
      });
      setRamUsage(prev => {
        const delta = Math.floor(Math.random() * 4) - 2;
        return Math.max(20, Math.min(90, prev + delta));
      });
      setActiveUsers(prev => {
        const delta = Math.floor(Math.random() * 8) - 4;
        return Math.max(100, prev + delta);
      });
      setAverageFps(prev => {
        const delta = (Math.random() * 1.6) - 0.8;
        return Math.max(30, Math.min(60, Number((prev + delta).toFixed(1))));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (level: "INFO" | "WARN" | "ERROR" | "CRITICAL", source: string, message: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [{ timestamp: time, level, source, message }, ...prev.slice(0, 9)]);
  };

  const handleSimulateError = () => {
    addLog("ERROR", "CLIENT_TELEMETRY", "Queda brusca de FPS (<15 FPS) detectada no navegador do usuário 'anon_32a1'");
  };

  const handleSimulateLoad = () => {
    setCpuUsage(92);
    addLog("WARN", "RESOURCES", "Uso de CPU atingiu limite de alerta crítico (92%) sob estresse sintético");
  };

  return (
    <div className="space-y-6">
      {/* Grid de Métricas Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USUÁRIOS ATIVOS */}
        <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Jogadores Conectados</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">{activeUsers}</span>
              <span className="text-xs text-green-500 font-mono">● LIVE</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <Users className="w-5 h-5 text-red-500" />
          </div>
        </div>

        {/* FPS MÉDIO */}
        <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Taxa de Quadros (Global)</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">{averageFps}</span>
              <span className="text-xs text-cyan-400 font-mono">FPS</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* STATUS SERVIDORES */}
        <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Status do Matchmaker</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold font-mono uppercase ${
                serverStatus === "ONLINE" ? "text-green-500" : serverStatus === "MAINTENANCE" ? "text-amber-500" : "text-red-500"
              }`}>{serverStatus}</span>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setServerStatus("ONLINE")}
                  className={`w-2.5 h-2.5 rounded-full ${serverStatus === "ONLINE" ? "bg-green-500" : "bg-green-950"} border border-green-500/30`} 
                />
                <button 
                  onClick={() => setServerStatus("MAINTENANCE")}
                  className={`w-2.5 h-2.5 rounded-full ${serverStatus === "MAINTENANCE" ? "bg-amber-500" : "bg-amber-950"} border border-amber-500/30`} 
                />
                <button 
                  onClick={() => setServerStatus("OFFLINE")}
                  className={`w-2.5 h-2.5 rounded-full ${serverStatus === "OFFLINE" ? "bg-red-500" : "bg-red-950"} border border-red-500/30`} 
                />
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <Server className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* ERROS ATIVOS */}
        <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Incidentes em Aberto</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-red-500">
                {logs.filter(l => l.level === "ERROR" || l.level === "CRITICAL").length}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Não Resolvidos</span>
            </div>
          </div>
          <div className="p-3 bg-red-950/20 rounded border border-red-500/10">
            <AlertOctagon className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Uso de Recursos de Hardware do Servidor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Consumo de Processador (CPU)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-bold">{cpuUsage}%</span>
          </div>

          <div className="space-y-3">
            <div className="h-2 bg-black rounded overflow-hidden border border-white/5">
              <div 
                className="h-full bg-cyan-500 transition-all duration-1000" 
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Clusters Ativos</span>
                <span className="text-white font-bold">8 / 8</span>
              </div>
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Clock Médio</span>
                <span className="text-white font-bold">3.8 GHz</span>
              </div>
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Temperatura</span>
                <span className="text-white font-bold">54 °C</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              <span>Memória RAM Alocada</span>
            </h3>
            <span className="text-xs font-mono text-red-400 font-bold">{ramUsage}%</span>
          </div>

          <div className="space-y-3">
            <div className="h-2 bg-black rounded overflow-hidden border border-white/5">
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: `${ramUsage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Buffer Alocado</span>
                <span className="text-white font-bold">12.4 GB</span>
              </div>
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Cache Redis</span>
                <span className="text-white font-bold">4.2 GB</span>
              </div>
              <div className="p-2 bg-black rounded border border-white/5">
                <span className="text-gray-500 block">Capacidade Max</span>
                <span className="text-white font-bold">32 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal de Logs e Ações Administrativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Ações Rápidas */}
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">Painel Administrativo CMS</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Use as ações administrativas abaixo para monitorar ou disparar estresses temporários para testes de infraestrutura no ecossistema do jogo.
            </p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={handleSimulateError}
              className="w-full py-2 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 hover:border-red-400 text-red-400 text-xs font-mono rounded flex items-center justify-between transition-all"
            >
              <span>Simular Queda de Performance</span>
              <AlertOctagon className="w-4 h-4" />
            </button>

            <button 
              onClick={handleSimulateLoad}
              className="w-full py-2 px-3 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 text-xs font-mono rounded flex items-center justify-between transition-all"
            >
              <span>Estressar CPU Sintético</span>
              <Cpu className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                setServerStatus("MAINTENANCE");
                addLog("WARN", "SYSTEM", "Servidores colocados sob estado de manutenção para deploy de Patch v1.4");
              }}
              className="w-full py-2 px-3 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 text-amber-400 text-xs font-mono rounded flex items-center justify-between transition-all"
            >
              <span>Agendar Manutenção Ativa</span>
              <Server className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-black rounded border border-white/5 flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span className="text-gray-400 leading-normal">
              Todos os microsserviços do cluster de dados respondendo perfeitamente.
            </span>
          </div>
        </div>

        {/* Console de Telemetria / Logs */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span>Console de Logs em Tempo Real</span>
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-mono font-bold">
              STREAMING ACTIVE
            </span>
          </div>

          <div className="bg-black/80 rounded border border-white/5 p-4 font-mono text-[11px] h-60 overflow-y-auto space-y-2 leading-relaxed">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-left">
                <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold shrink-0 ${
                  log.level === "CRITICAL" ? "text-red-500" :
                  log.level === "ERROR" ? "text-amber-500" :
                  log.level === "WARN" ? "text-yellow-400" : "text-cyan-400"
                }`}>[{log.level}]</span>
                <span className="text-gray-400 shrink-0">{log.source}:</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
