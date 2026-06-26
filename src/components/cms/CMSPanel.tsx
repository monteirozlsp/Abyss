import React, { useState } from "react";
import { 
  Database, LayoutDashboard, Map, Paintbrush, ShieldAlert, 
  Volume2, CalendarDays, Key, Settings, AlertCircle,
  ClipboardList, Heart, GitFork, MessageSquare, Sparkles, UploadCloud, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CMSDashboard from "./CMSDashboard";
import CMSMapEditor from "./CMSMapEditor";
import CMSSkinEditor from "./CMSSkinEditor";
import CMSMonsterEditor from "./CMSMonsterEditor";
import CMSAudioEditor from "./CMSAudioEditor";
import CMSEventEditor from "./CMSEventEditor";

// New components imported for Etapa 23
import CMSQuestEditor from "./CMSQuestEditor";
import CMSSanityFearEditor from "./CMSSanityFearEditor";
import CMSBehaviorEditor from "./CMSBehaviorEditor";
import CMSDialogueEditor from "./CMSDialogueEditor";
import CMSParticleEditor from "./CMSParticleEditor";
import CMSPublishingEditor from "./CMSPublishingEditor";

type CMSTab = 
  | "dashboard" 
  | "map" 
  | "quest" 
  | "sanity_fear" 
  | "behavior" 
  | "dialogue" 
  | "particle" 
  | "audio" 
  | "skin" 
  | "event" 
  | "publishing";

export default function CMSPanel() {
  const [activeSubTab, setActiveSubTab] = useState<CMSTab>("dashboard");

  const getTabLabel = (tab: CMSTab) => {
    switch (tab) {
      case "dashboard": return "Dashboard Geral";
      case "map": return "Editor de Mapas";
      case "quest": return "Editor de Quests";
      case "sanity_fear": return "Sanidade & Medo";
      case "behavior": return "Árvore de Comportamento";
      case "dialogue": return "Editor de Diálogos";
      case "particle": return "Sistemas de Partículas";
      case "audio": return "Mixer de Áudio";
      case "skin": return "Skins & Texturas";
      case "event": return "Eventos Sazonais";
      case "publishing": return "Publicação & Versões";
    }
  };

  return (
    <div className="space-y-6">
      {/* CMS BANNER HEADER */}
      <div className="p-4 bg-gradient-to-r from-red-950/20 to-black border border-[#ff3333]/20 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-red-500 font-mono text-[10px] uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Painel Administrativo CMS — PROJECT ABYSS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Abyss CMS Engine</h1>
          <p className="text-xs text-gray-400">
            Gerencie todo o ecossistema do jogo em tempo real: altere colisões, configure a inteligência artificial dos monstros, controle mixers de som e eventos sazonais sem alterar uma única linha de código.
          </p>
        </div>

        <div className="p-2 bg-black rounded border border-white/5 flex items-center space-x-2 font-mono text-[11px] text-gray-500">
          <span>Versão da Engine:</span>
          <span className="text-red-400 font-bold">v2.5.0-Production</span>
        </div>
      </div>

      {/* HORIZONTAL CONTROL BAR */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {/* Row 1 */}
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "dashboard"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Geral</span>
        </button>

        <button
          onClick={() => setActiveSubTab("map")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "map"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Editor de Mapas</span>
        </button>

        <button
          onClick={() => setActiveSubTab("quest")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "quest"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Quest Editor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sanity_fear")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "sanity_fear"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Sanity & Fear</span>
        </button>

        <button
          onClick={() => setActiveSubTab("behavior")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "behavior"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Behavior Editor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("dialogue")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "dialogue"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Dialogue Editor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("particle")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "particle"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Particle Editor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("audio")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "audio"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Mixer de Áudio</span>
        </button>

        <button
          onClick={() => setActiveSubTab("skin")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "skin"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Skins & Texturas</span>
        </button>

        <button
          onClick={() => setActiveSubTab("event")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "event"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Campanhas & Eventos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("publishing")}
          className={`px-3 py-2 rounded font-mono text-xs transition-all border flex items-center space-x-2 ${
            activeSubTab === "publishing"
              ? "bg-[#ff3333]/10 border-[#ff3333] text-white font-bold"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Publishing & Versões</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="bg-black/40 border border-white/5 p-6 rounded-lg min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeSubTab === "dashboard" && <CMSDashboard />}
            {activeSubTab === "map" && <CMSMapEditor />}
            {activeSubTab === "quest" && <CMSQuestEditor />}
            {activeSubTab === "sanity_fear" && <CMSSanityFearEditor />}
            {activeSubTab === "behavior" && <CMSBehaviorEditor />}
            {activeSubTab === "dialogue" && <CMSDialogueEditor />}
            {activeSubTab === "particle" && <CMSParticleEditor />}
            {activeSubTab === "audio" && <CMSAudioEditor />}
            {activeSubTab === "skin" && <CMSSkinEditor />}
            {activeSubTab === "event" && <CMSEventEditor />}
            {activeSubTab === "publishing" && <CMSPublishingEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
