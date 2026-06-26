import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Radio,
  Terminal,
  Users,
  Skull,
  FileText,
  Sliders,
  Award,
  Activity,
  Eye,
  EyeOff,
  Heart,
  ShieldAlert,
  Brain,
  Compass,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  Cpu,
  Layers,
  Server,
  Database,
  Network
} from "lucide-react";
import CMSPanel from "./components/cms/CMSPanel";

// --- TIPAGENS ---
interface TimelineEvent {
  year: string;
  title: string;
  category: "Construção" | "Científico" | "Anomalia" | "Incidente" | "Presente";
  description: string;
  status: string;
}

interface Creature {
  id: string;
  name: string;
  codename: string;
  threatLevel: "CRÍTICO" | "EXTREMO" | "ALTA" | "COGNITIVO";
  mechanic: string;
  description: string;
  sightIndex: number; // 0-100
  soundIndex: number; // 0-100
  stressIndex: number; // 0-100
  weakness: string;
}

interface Faction {
  name: string;
  role: string;
  ethos: string;
  danger: string;
  description: string;
}

interface DecryptedDocument {
  id: string;
  title: string;
  source: string;
  date: string;
  content: string;
  classification: string;
}

export default function App() {
  // --- ESTADOS DO SISTEMA ---
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "factions_creatures" | "documents" | "simulation" | "achievements" | "architecture" | "database" | "cms">("overview");
  const [selectedArchTab, setSelectedArchTab] = useState<"overview" | "folders" | "pipeline" | "subsystems" | "scalability" | "monitoring">("overview");
  const [selectedDbTab, setSelectedDbTab] = useState<"erd" | "prisma" | "indexes" | "partitioning" | "cache" | "backup">("erd");
  const [ambientAudioActive, setAmbientAudioActive] = useState<boolean>(false);
  const [selectedCreature, setSelectedCreature] = useState<string>("surgeon");
  const [selectedDocument, setSelectedDocument] = useState<string>("quarentena");
  const [scanlineEnabled, setScanlineEnabled] = useState<boolean>(true);
  
  // Parâmetros do Simulador de Finais
  const [stressLevel, setStressLevel] = useState<number>(65);
  const [evidenceCollected, setEvidenceCollected] = useState<number>(40);
  const [intercomDecision, setIntercomDecision] = useState<"destroy" | "sync">("destroy");

  // Relógio do Sistema (Sincronizado e dinâmico)
  const [systemTime, setSystemTime] = useState<string>("");
  const [isBlinking, setIsBlinking] = useState<boolean>(true);

  // Áudio - Web Audio API Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const heartbeatIntervalRef = useRef<any>(null);

  // --- RELÓGIO E STATUS ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, "0");
      const mins = String(now.getUTCMinutes()).padStart(2, "0");
      const secs = String(now.getUTCSeconds()).padStart(2, "0");
      setSystemTime(`${hrs}:${mins}:${secs}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    const blinkInterval = setInterval(() => setIsBlinking(b => !b), 500);

    return () => {
      clearInterval(interval);
      clearInterval(blinkInterval);
    };
  }, []);

  // --- GERADOR DE ÁUDIO ANALÓGICO SINTETIZADO (WEB AUDIO API) ---
  const startAmbientAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 1. Drone de fundo (Frequência Abissal 43.65 Hz - Ressonância)
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(43.65, ctx.currentTime); // Sub-bass drone

      // Adiciona harmônico metálico assustador
      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(87.3, ctx.currentTime); // Oitava acima do drone
      gainNode2.gain.setValueAtTime(0.005, ctx.currentTime); // Muito sutil

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc2.start();

      droneOscRef.current = osc;
      droneGainRef.current = gainNode;

      // 2. Pulsação do Coração Dinâmica (Simula a pulsação afetada pelo stress)
      const playHeartbeat = () => {
        const beatGain = ctx.createGain();
        const beatOsc = ctx.createOscillator();
        const beatFilter = ctx.createBiquadFilter();

        beatOsc.type = "triangle";
        beatOsc.frequency.setValueAtTime(55, ctx.currentTime); // Batimento grave

        beatFilter.type = "lowpass";
        beatFilter.frequency.setValueAtTime(80, ctx.currentTime);

        // Curva de volume do "lub-dub"
        beatGain.gain.setValueAtTime(0.001, ctx.currentTime);
        beatGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
        beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        beatGain.gain.setValueAtTime(0.001, ctx.currentTime + 0.22);
        beatGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.27);
        beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

        beatOsc.connect(beatFilter);
        beatFilter.connect(beatGain);
        beatGain.connect(ctx.destination);

        beatOsc.start();
        beatOsc.stop(ctx.currentTime + 0.5);
      };

      // Frequência do batimento cardíaco com base no Stress
      // Estresse: 0% -> 50 BPM, 100% -> 140 BPM
      const calculateIntervalMs = (stress: number) => {
        const bpm = 50 + (stress / 100) * 90;
        return (60 / bpm) * 1000;
      };

      const runHeartbeatLoop = () => {
        playHeartbeat();
        const nextInterval = calculateIntervalMs(stressLevel);
        heartbeatIntervalRef.current = setTimeout(runHeartbeatLoop, nextInterval);
      };

      runHeartbeatLoop();
      setAmbientAudioActive(true);
    } catch (e) {
      console.error("Falha ao inicializar áudio sintetizado:", e);
    }
  };

  const stopAmbientAudio = () => {
    try {
      if (droneOscRef.current) {
        droneOscRef.current.stop();
        droneOscRef.current.disconnect();
        droneOscRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearTimeout(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setAmbientAudioActive(false);
    } catch (e) {
      console.error("Falha ao pausar áudio:", e);
    }
  };

  // Atualizar a pulsação quando o stress mudar em tempo de execução
  useEffect(() => {
    if (ambientAudioActive && audioCtxRef.current) {
      // Reinicia o loop do coração com a nova frequência instantaneamente
      if (heartbeatIntervalRef.current) {
        clearTimeout(heartbeatIntervalRef.current);
      }
      
      const playHeartbeat = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const beatGain = ctx.createGain();
        const beatOsc = ctx.createOscillator();
        const beatFilter = ctx.createBiquadFilter();

        beatOsc.type = "triangle";
        beatOsc.frequency.setValueAtTime(55, ctx.currentTime);

        beatFilter.type = "lowpass";
        beatFilter.frequency.setValueAtTime(80, ctx.currentTime);

        beatGain.gain.setValueAtTime(0.001, ctx.currentTime);
        beatGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
        beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        beatGain.gain.setValueAtTime(0.001, ctx.currentTime + 0.22);
        beatGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.27);
        beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

        beatOsc.connect(beatFilter);
        beatFilter.connect(beatGain);
        beatGain.connect(ctx.destination);

        beatOsc.start();
        beatOsc.stop(ctx.currentTime + 0.5);
      };

      const calculateIntervalMs = (stress: number) => {
        const bpm = 50 + (stress / 100) * 90;
        return (60 / bpm) * 1000;
      };

      const runHeartbeatLoop = () => {
        playHeartbeat();
        const nextInterval = calculateIntervalMs(stressLevel);
        heartbeatIntervalRef.current = setTimeout(runHeartbeatLoop, nextInterval);
      };

      runHeartbeatLoop();
    }
  }, [stressLevel]);

  // Limpeza de áudio ao desmontar
  useEffect(() => {
    return () => {
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); } catch (e) {}
      }
      if (heartbeatIntervalRef.current) {
        clearTimeout(heartbeatIntervalRef.current);
      }
    };
  }, []);

  // --- DATASETS DO GDD ---
  
  const timelineEvents: TimelineEvent[] = [
    {
      year: "1982",
      title: "Construção da Estação Sete (ES7)",
      category: "Construção",
      description: "Sob a fachada de pesquisa mineral e geofísica, a Aetheris Neurological Group inicia escavações profundas na região vulcânica e gelada de Mount Kestrel. Túneis fortificados de concreto ciclópico são erguidos a 800 metros de profundidade.",
      status: "DECRIPTOU_LOG_82"
    },
    {
      year: "1998",
      title: "Ascensão de Dr. Thorne",
      category: "Científico",
      description: "O neurocientista de elite Alistair Thorne assume a direção científica da ES7. Redireciona todos os orçamentos e inteligência corporativa para o estudo de 'Mapeamento Trans-Consciente' e ressonância eletromagnética de alta frequência.",
      status: "CONFIDENCIAL_LEVEL_2"
    },
    {
      year: "2012",
      title: "Ruptura da Frequência",
      category: "Científico",
      description: "Ocorrência da primeira ressonância sintonizável do 'Eco Sub-Límico'. A fresta psíquica inicial é documentada: cobaias expostas exibem atividade cerebral síncrona mesmo após sedação profunda.",
      status: "APROVADO_DIR"
    },
    {
      year: "Jan 2024",
      title: "Ativação da Synapse-Grid",
      category: "Científico",
      description: "Início dos testes ativos na grade neuronal sintética. Trinta sujeitos ('Doadores' involuntários de asilos e prisões) são conectados permanentemente em rede. Registros apontam sintomas de pesadelos compartilhados.",
      status: "EXPERIMENTO_X"
    },
    {
      year: "Ago 2024",
      title: "Manifestação do Lodo Escuro",
      category: "Anomalia",
      description: "Surgimento de resíduos pretos viscosos nas paredes dos laboratórios. Equipamentos eletrônicos sofrem estática pesada sem causa física. Pesquisadores relatam audição de passos duplicados nos corredores de contenção.",
      status: "PERIGO_NIVEL_IV"
    },
    {
      year: "14 Nov 2025",
      title: "O Incidente Synapse (Ruptura)",
      category: "Incidente",
      description: "Ruptura catastrófica às 03:14 AM. O Eco Sub-Límico domina os sistemas neurais de toda a equipe técnica. Protocolo de Quarentena 'Gelo Negro' é ativado por controle externo, enterrando vivos 142 funcionários da Aetheris.",
      status: "PROTOCOLO_GELO_NEGRO"
    },
    {
      year: "Jan 2026",
      title: "Transmissões Fantasma",
      category: "Anomalia",
      description: "Sinais de rádio ultra-criptografados passam a vazar de Mount Kestrel. Leituras biométricas fantasmagóricas indicam batimentos de corações que deveriam ter cessado há meses.",
      status: "RASTREADO"
    },
    {
      year: "Jun 2026",
      title: "Infiltração de Thomas",
      category: "Presente",
      description: "Thomas Cole invade as instalações da Estação Sete por um duto de ventilação danificado. A busca desesperada por sua irmã Elena começa nas profundezas claustrofóbicas do concreto abandonado.",
      status: "ATIVO_OPERACAO"
    }
  ];

  const creatures: Creature[] = [
    {
      id: "surgeon",
      name: "O Cirurgião Cego",
      codename: "ANOMALIA-01 / DR. ALISTAIR THORNE",
      threatLevel: "EXTREMO",
      mechanic: "Ecolocalização sônica. Cego por calor neural. Segure a respiração para passar furtivo.",
      description: "Fusão tétrica do diretor científico com o aparato robotizado de neurocirurgia experimental. Suas pernas mecânicas hidráulicas rangem terrivelmente no silêncio do hospital, tateando o concreto à procura de furos cranianos.",
      sightIndex: 5,
      soundIndex: 98,
      stressIndex: 90,
      weakness: "Sedação acústica & Paralisação do jogador (Prender Respiração)"
    },
    {
      id: "collector",
      name: "O Coletor de Olhares",
      codename: "ANOMALIA-02 / GAZE COLLECTOR",
      threatLevel: "CRÍTICO",
      mechanic: "Visão fotossensível. Drena sanidade ao toque da luz de sua lanterna. Apague tudo.",
      description: "Massa flutuante de cabeças de pacientes deformadas pela dor, envoltas por filamentos nervosos flutuantes e fumaça eletromagnética que distorce as lentes digitais. Ela busca contato visual direto.",
      sightIndex: 95,
      soundIndex: 30,
      stressIndex: 95,
      weakness: "Navegação térmica passiva & Escuridão absoluta"
    },
    {
      id: "phantom",
      name: "O Phantom de Kestrel",
      codename: "ANOMALIA-03 / ECO ALUCINATÓRIO",
      threatLevel: "COGNITIVO",
      mechanic: "Estática de áudio e ruído visual. Sussurros binaurais enganosos que aumentam a taxa cardíaca.",
      description: "Projeção neuro-espectral de memórias de Thomas moldadas pelo Eco Sub-Límico. Ela assume o aspecto de sua irmã Elena de forma distorcida e estática para forçá-lo ao colapso psíquico de pânico.",
      sightIndex: 40,
      soundIndex: 70,
      stressIndex: 85,
      weakness: "Bloqueadores de beta-receptores (Químicos)"
    }
  ];

  const factions: Faction[] = [
    {
      name: "Os Transcendidos (The Synced)",
      role: "Sectários do Abismo Cósmico",
      ethos: "O sofrimento físico é o portal da evolução da consciência.",
      danger: "NÃO-HOSTIS (A menos que perturbados ou ao tocar o Synapse-Grid)",
      description: "Cientistas seniores e doadores biológicos sobreviventes cujo córtex pré-frontal foi totalmente reconfigurado pela Frequência Abissal. Vagam sussurrando equações e entoando canções de ninar no escuro das salas de cirurgia."
    },
    {
      name: "Os Esquecidos (The Stranded)",
      role: "Sobreviventes de Segurança Corporativa",
      ethos: "Purgar qualquer vestígio de infecção neurológica com fogo.",
      danger: "EXTREMAMENTE HOSTIS (Ataque letal imediato em patrulhas)",
      description: "Membros da segurança de alto escalão da Aetheris que usam equipamentos de contenção química fechados. Enlouquecidos pelo isolamento absoluto e a falta de oxigênio, tratam qualquer pessoa viva como um inimigo a ser exterminado."
    }
  ];

  const documents: DecryptedDocument[] = [
    {
      id: "quarentena",
      title: "Memorando de Quarentena: Protocolo Gelo Negro",
      source: "Direção Geral de Segurança - Aetheris Group",
      date: "14 de Novembro de 2025",
      content: "Este memorando serve como notificação oficial de que o perímetro externo da Estação Sete foi selado hidraulicamente de forma permanente. As cargas de demolição das rotas de fuga primárias foram detonadas para evitar a propagação do patógeno psíquico além do maciço rochoso do Mount Kestrel.\n\nNenhum pedido de evacuação externa será processado pelas forças terrestres. O sacrifício de vocês pela integridade e blindagem da corporação é altamente valorizado.",
      classification: "CONFIDENCIAL // NIVEL V"
    },
    {
      id: "gravacao_thorne",
      title: "Registro de Áudio Módulo Transcrito 09",
      source: "Gravador de Mesa de Dr. Alistair Thorne",
      date: "14 de Novembro de 2025 (03:10 AM)",
      content: "[Estática pesada acompanhada de cliques metálicos rítmicos]\n\n\"Não estamos sozinhos no lobo frontal. A frequência... ela é linda. Ela não cria demônios; ela remove a pele gasta de nossa individualidade física. Eu vi as paredes respirarem... elas respiram o mesmo ar que minha irmã falecida em 1994. Não é infecção, Cole... É fusão. Se você ouvir isto lá fora... não nos salve. Venha deitar-se conosco. O Abismo é quente...\"\n\n[Sons de metal raspando em osso acompanhados de uma risada estridente]",
      classification: "GRAVADO NA QUEBRA DO SISTEMA"
    },
    {
      id: "email_elena",
      title: "Última Mensagem Recebida",
      source: "Dra. Elena Cole",
      date: "13 de Novembro de 2025 (23:45 PM)",
      content: "Thomas, por favor, se você receber este sinal... não acredite nos relatórios da Aetheris sobre Mount Kestrel. Nós não estamos curando mentes aqui. Estamos escavando algo que existia antes da linguagem humana. Eu criei um vetor de purga e o enterrei no núcleo biológico da máquina. But they are tuning me in... Minha mente dói tanto. Por favor... desculpe-me por te deixar no escuro.",
      classification: "RASTRADO NO SATÉLITE MILITAR"
    }
  ];

  // --- LÓGICA DO SIMULADOR DE FINAIS ---
  const calculateEnding = () => {
    if (intercomDecision === "sync") {
      return {
        title: "Final C: \"ASCENSÃO ABISSAL\"",
        subtitle: "A Fusão Mental Cósmica",
        styleClass: "border-purple-600 bg-purple-950/10 text-purple-400",
        description: "Thomas abdica de sua individualidade corpórea e se conecta à cadeira central da Synapse-Grid na esperança desesperada de reencontrar Elena no mar infinito do Eco Sub-Límico. Sua carne morre, mas sua mente torna-se o novo arquétipo mestre do Abismo, convidando outros a descerem.",
        icon: Brain
      };
    }

    if (evidenceCollected >= 80 && stressLevel < 40) {
      return {
        title: "Final B: \"O RETORNO\"",
        subtitle: "Redenção Científica",
        styleClass: "border-emerald-600 bg-emerald-950/10 text-emerald-400",
        description: "Com provas absolutas coletadas dos laboratórios subterrâneos e sanidade preservada pelo uso de bloqueadores, Thomas destrói a Synapse-Grid com um pulso eletromagnético limpo. Ele salva o espectro de Elena e escapa em um helicóptero de resgate da inteligência militar militar enquanto o complexo racha sob o gelo.",
        icon: Compass
      };
    }

    return {
      title: "Final A: \"A QUARENTENA\"",
      subtitle: "Sobrevivência Trágica / Portador da Frequência",
      styleClass: "border-red-600 bg-red-950/10 text-red-400",
      description: "Thomas destrói os reatores físicos, colapsando o laboratório. He crawls successfully into the ice of Mount Kestrel in a blizzard. Porém, sem evidências suficientes e com o coração destruído pelo stress extremo, ele percebe que os sussurros de sua irmã Elena continuam a tocar ritmicamente em seu próprio lobo temporal. Ele escapou do túmulo físico, mas o Abismo agora caminha com ele rumo às cidades.",
      icon: Skull
    };
  };

  const currentEnding = calculateEnding();

  return (
    <div className="min-h-screen bg-[#050505] text-[#d1d1d1] font-sans relative overflow-x-hidden selection:bg-[#b30000] selection:text-white">
      {/* Overlay de Scanlines CRT opcional */}
      {scanlineEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50 scanline-overlay opacity-35" />
      )}

      {/* Grid de background sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* CONTEÚDO PRINCIPAL DA INTERFACE AAA */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col min-h-screen relative z-10 space-y-6">
        
        {/* CABEÇALHO DO SISTEMA MILITAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 space-y-4 md:space-y-0">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#b30000] animate-pulse"></span>
              <span className="font-mono text-xs tracking-[0.25em] text-[#b30000] font-bold">CLASSIFIED // LEVEL 5 ACCESS ONLY</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-white mt-1 uppercase select-none font-cinzel glow-text-red">
              PROJECT <span className="text-[#b30000]">ABYSS</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">ESTAÇÃO SUBTERRÂNEA SETE (ES7) // DOSSIÊ DE DESENVOLVIMENTO AAA</p>
          </div>

          <div className="flex flex-col md:items-end font-mono text-xs space-y-1 bg-white/5 p-3 rounded border border-white/5">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">HORA UTC:</span>
              <span className="text-white font-bold tracking-wider">{systemTime || "03:14:00"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">SINAL NEURAL:</span>
              <span className="text-emerald-500 font-bold tracking-wider animate-pulse">CONECTADO</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">REVISÃO DOC:</span>
              <span className="text-[#00ffff] font-semibold glow-text-cyan">0x889A_ABYSS_CORE</span>
            </div>
          </div>
        </header>

        {/* TELA CENTRAL / MENUS E SEÇÕES */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* MENU LATERAL - TERMINAL DE CONTROLE */}
          <nav className="col-span-12 lg:col-span-3 flex flex-col space-y-2">
            <div className="p-3 bg-[#0c0c0c] border border-white/5 border-l-2 border-[#b30000] rounded-r">
              <span className="font-mono text-[10px] text-gray-500 tracking-wider block uppercase">Sistema Operacional</span>
              <h3 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#b30000]" />
                <span>Navegação do Dossier</span>
              </h3>
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "overview"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Compass className="w-4 h-4" />
                <span>01. Visão Geral</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "timeline"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4" />
                <span>02. Cronologia Histórica</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("factions_creatures")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "factions_creatures"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Skull className="w-4 h-4" />
                <span>03. Facções & Ameaças</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "documents"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>04. Arquivos Decriptados</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("simulation")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "simulation"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4" />
                <span>05. Simulador de Finais</span>
              </div>
              <span className="text-[9px] bg-[#00ffff]/20 text-[#00ffff] px-1.5 py-0.5 rounded border border-[#00ffff]/30 animate-pulse font-bold">INTERATIVO</span>
            </button>

            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "achievements"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Award className="w-4 h-4" />
                <span>06. Troféus & Roadmap</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "architecture"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4" />
                <span>07. Arquitetura do Sistema</span>
              </div>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold font-mono">ETAPA 2</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "database"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4" />
                <span>08. Design de Banco de Dados</span>
              </div>
              <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 font-bold font-mono">ETAPA 3</span>
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              className={`flex items-center justify-between px-4 py-3 rounded text-left font-mono transition-all text-sm border ${
                activeTab === "cms"
                  ? "bg-[#b30000]/10 border-[#b30000] text-white font-bold glow-red"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4" />
                <span>09. CMS & Painel Administrativo</span>
              </div>
              <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse font-bold font-mono">ETAPA 4</span>
            </button>

            {/* CONTROLE INTEGRADO DE AMBIENTE - ÁUDIO E FILTRO CRT */}
            <div className="bg-[#0c0c0c] p-4 rounded border border-white/5 space-y-4 mt-4">
              <span className="font-mono text-[9px] text-[#b30000] tracking-wider block uppercase border-b border-white/5 pb-1">Controles Ambientais do Leitor</span>
              
              {/* Interruptor de Áudio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono">Drone Analógico:</span>
                  <span className={`text-[10px] font-mono px-1.5 rounded ${ambientAudioActive ? "bg-red-950 text-[#ff1a1a]" : "bg-gray-900 text-gray-500"}`}>
                    {ambientAudioActive ? "ATIVO" : "DESATIVADO"}
                  </span>
                </div>
                <button
                  onClick={ambientAudioActive ? stopAmbientAudio : startAmbientAudio}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded text-xs font-mono font-bold transition-all border ${
                    ambientAudioActive
                      ? "bg-red-900/30 border-red-500 text-red-200 hover:bg-red-900/50"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-white"
                  }`}
                >
                  {ambientAudioActive ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                      <span>Desligar Som Profundo</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>Ativar Drone & Batimento</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 font-mono leading-normal">
                  *Gera um drone subgrave de 43Hz e pulsação cardíaca dinâmica via Web Audio API. O ritmo cardíaco reage ao simulador de estresse!
                </p>
              </div>

              {/* Filtro Scanline */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-gray-400 font-mono">Efeito CRT Estática:</span>
                <button
                  onClick={() => setScanlineEnabled(!scanlineEnabled)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border ${
                    scanlineEnabled
                      ? "bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff] glow-cyan"
                      : "bg-white/5 border-white/10 text-gray-500"
                  }`}
                >
                  {scanlineEnabled ? "ATIVADO" : "DESATIVADO"}
                </button>
              </div>
            </div>

            {/* STATUS DO COMPUTADOR LOCAL */}
            <div className="p-3 bg-red-950/10 border border-red-900/30 rounded text-xs space-y-1 font-mono">
              <div className="flex items-center space-x-2 text-red-500 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>ALERTA COGNITIVO</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Oscilações eletromagnéticas de 43.65 Hz detectadas no Setor G-12. Risco iminente de colapso sináptico compartilhado.
              </p>
            </div>
          </nav>

          {/* ÁREA DE CONTEÚDO PRINCIPAL EXIBIDO COMO MONITOR HOLOGRÁFICO */}
          <main className="col-span-12 lg:col-span-9 flex flex-col space-y-6">
            
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* HERO BANNER CONCEITO */}
                  <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/5 border-l-4 border-[#b30000] p-6 rounded space-y-4">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Compass className="w-32 h-32 text-white" />
                    </div>
                    
                    <span className="text-[10px] bg-red-950/50 text-[#ff1a1a] px-2.5 py-0.5 rounded border border-red-900/40 uppercase font-mono tracking-wider">
                      Dossiê Executivo de Terror Psicológico
                    </span>
                    
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white font-cinzel tracking-wider">
                      UMA INSTALAÇÃO CONGELADA NA INSANIDADE
                    </h2>
                    
                    <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                      Sob as geleiras impiedosas da cordilheira de Kestrel, repousa a Estação Subterrânea Sete (ES7). Abandonada após o infame <span className="text-white font-bold">Incidente Synapse</span>, o local tornou-se uma caixa preta de concreto onde a consciência humana se liquefez em contato com frequências dimensionais insondáveis.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-mono block">PERSPECTIVA</span>
                        <p className="text-sm font-bold text-white uppercase font-mono">Primeira Pessoa Tátil</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-mono block">MÉTODO DE DEFESA</span>
                        <p className="text-sm font-bold text-[#b30000] uppercase font-mono">Sem Armas / Fuga Ativa</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-mono block">DURAÇÃO DO INCIDENTE</span>
                        <p className="text-sm font-bold text-[#00ffff] uppercase font-mono">228 DIAS EM SILÊNCIO</p>
                      </div>
                    </div>
                  </div>

                  {/* TRÊS PILARES DO DESIGN AAA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl group-hover:bg-red-600/10 transition-all" />
                      <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center border border-red-900/40">
                        <Brain className="w-5 h-5 text-[#b30000]" />
                      </div>
                      <h3 className="text-base font-bold text-white tracking-wide">Vulnerabilidade Absoluta</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        O jogador é fisicamente ordinário. Ele treme diante do medo extremo, possui fôlego finito, e reage fisiologicamente. Não há barras de vida tradicionais: seu estado é comunicado pelo batimento cardíaco audível e distorção óptica.
                      </p>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl group-hover:bg-cyan-600/10 transition-all" />
                      <div className="w-10 h-10 rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-900/40">
                        <Activity className="w-5 h-5 text-[#00ffff]" />
                      </div>
                      <h3 className="text-base font-bold text-white tracking-wide">Interações Hápticas</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Abrir portas exige que o mouse puxe ou empurre de forma gradual para evitar barulho. Gavetas são revistadas individualmente e baterias de lanterna ou injetores de bloqueador cardíaco requerem sequências físicas de uso.
                      </p>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-xl group-hover:bg-amber-600/10 transition-all" />
                      <div className="w-10 h-10 rounded-full bg-amber-950/50 flex items-center justify-center border border-amber-900/40">
                        <Radio className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-base font-bold text-white tracking-wide">Neuro-Investigação</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Colete documentos rasgados, intercepte áudios degradados de terminais obsoletos e decifre frequências com o relógio receptor biométrico para encontrar passagens alternativas e desvendar a verdade corporativa.
                      </p>
                    </div>
                  </div>

                  {/* PROTAGONISTA CARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                      <span className="font-mono text-[9px] text-[#b30000] tracking-wider block uppercase">Investigador de Entrada</span>
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <span>Thomas Cole</span>
                        <span className="text-xs text-gray-500 font-mono font-normal">// Ex-Analista de Sinais</span>
                      </h3>
                      <div className="text-xs text-gray-400 space-y-2 leading-relaxed">
                        <p>
                          Investigador tático e ex-inteligência militar. Ele viaja para a remota ES7 não para expor a corporação, mas motivado pelo último e-mail secreto enviado por sua irmã, a brilhante neurocientista Elena Cole.
                        </p>
                        <p className="border-l border-red-900/50 pl-3 italic text-gray-500">
                          \"Ela me pediu para não vir, mas descreveu a falha. Eu conheço o silêncio deles. Eles a deixaram para trás.\"
                        </p>
                      </div>
                      
                      <div className="bg-white/5 p-3 rounded border border-white/5 space-y-2 text-xs">
                        <span className="font-mono text-[9px] text-gray-500 uppercase block">Monitor Biométrico Ativo (Relógio Cole)</span>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Batimento Base:</span>
                          <span className="text-white font-mono font-bold">55 BPM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bloqueadores em Estoque:</span>
                          <span className="text-red-500 font-mono font-bold">03 Ampolas</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="font-mono text-[9px] text-amber-500 tracking-wider block uppercase">Diretrizes do Horror Psicológico</span>
                        <h3 className="text-lg font-bold text-white">Atmosfera de Jogo</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Utilizando o potencial de iluminação estática e volumétrica no WebGL, o título recria a claustrofobia brutalista de Outlast e SOMA. Fiapos de poeira flutuam sob frestas de portas, poças refletem lâmpadas fluorescentes trêmulas e cada duto de ar vibra com o som sutil das anomalias passando por cima da sua cabeça.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-500">RENDER ENGINE:</span>
                        <span className="text-white bg-white/5 px-2 py-1 rounded">WEBGL 2.0 / CUSTOM SHADERS</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: TIMELINE */}
              {activeTab === "timeline" && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded">
                    <span className="font-mono text-[10px] text-amber-500 uppercase block">Historiografia Detalhada</span>
                    <h2 className="text-xl font-bold text-white">A Cronologia da Ruptura de Mount Kestrel</h2>
                    <p className="text-xs text-gray-400 mt-1">Clique nos marcos históricos para extrair as investigações de inteligência de Thomas.</p>
                  </div>

                  {/* TIMELINE INTERATIVA */}
                  <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8 py-4">
                    {timelineEvents.map((evt, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        key={evt.year} 
                        className="relative group"
                      >
                        {/* Ponto indicador na linha de tempo */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#050505] border-2 border-[#b30000] flex items-center justify-center group-hover:scale-125 transition-transform">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#b30000] animate-ping" />
                        </div>

                        <div className="bg-[#0c0c0c] border border-white/5 rounded p-4 space-y-2 hover:border-white/15 transition-all">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="text-lg font-extrabold text-[#b30000] font-mono tracking-wider">{evt.year}</span>
                            <span className="text-[9px] font-mono bg-white/5 px-2.5 py-0.5 rounded text-gray-400 border border-white/5 uppercase">
                              {evt.category}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{evt.title}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">{evt.description}</p>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-gray-500">
                            <span>SITU: {evt.status}</span>
                            <span className="text-[#00ffff] opacity-40">ARQUIVO DECRIPTADO</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: FACTIONS AND CREATURES */}
              {activeTab === "factions_creatures" && (
                <motion.div
                  key="factions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded">
                    <span className="font-mono text-[10px] text-red-500 uppercase block">Análise de Campo Corporativa</span>
                    <h2 className="text-xl font-bold text-white">Anomalias Psíquicas e Facções de Sobreviventes</h2>
                    <p className="text-xs text-gray-400 mt-1">Conhecer a ameaça é o único meio de estender sua vida por mais alguns minutos.</p>
                  </div>

                  {/* SEÇÃO INTERATIVA DE CRIATURAS */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Lista Vertical de Seleção de Ameaças */}
                    <div className="lg:col-span-4 flex flex-col space-y-3">
                      <span className="font-mono text-[10px] text-gray-500 block uppercase px-1">Selecione uma Anomalia</span>
                      {creatures.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCreature(c.id)}
                          className={`p-4 rounded text-left border transition-all flex flex-col space-y-2 relative overflow-hidden ${
                            selectedCreature === c.id
                              ? "bg-red-950/20 border-[#b30000] text-white"
                              : "bg-[#0c0c0c] border-white/5 hover:border-white/10 text-gray-400"
                          }`}
                        >
                          {selectedCreature === c.id && (
                            <div className="absolute top-0 right-0 bg-[#b30000] text-white font-mono text-[8px] px-2 py-0.5 uppercase tracking-wider">
                              INSPECIONANDO
                            </div>
                          )}
                          <span className="font-mono text-[9px] text-gray-500">{c.codename}</span>
                          <span className="text-base font-bold tracking-wide text-white">{c.name}</span>
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-gray-400">GRAV:</span>
                            <span className={c.threatLevel === "CRÍTICO" || c.threatLevel === "EXTREMO" ? "text-red-500 font-bold" : "text-amber-500"}>
                              {c.threatLevel}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Exibição Holográfica de Detalhes da Criatura */}
                    <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded p-6 flex flex-col justify-between space-y-6 relative">
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-[#00ffff] bg-[#00ffff]/5 border border-[#00ffff]/10 px-2.5 py-1 rounded animate-pulse">
                        SISTEMA DE ECO-ANÁLISE ATIVO
                      </div>

                      {(() => {
                        const crit = creatures.find(c => c.id === selectedCreature)!;
                        return (
                          <div className="space-y-6">
                            <div>
                              <span className="font-mono text-xs text-[#b30000] tracking-wider block uppercase">{crit.codename}</span>
                              <h3 className="text-2xl font-black text-white uppercase tracking-wide mt-1">{crit.name}</h3>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-red-900 pl-4">
                              {crit.description}
                            </p>

                            {/* Índices Sensoriais */}
                            <div className="space-y-4">
                              <span className="font-mono text-[10px] text-gray-500 block uppercase">Comportamento de IA e Sensibilidade</span>
                              
                              {/* Barra 1: Sensibilidade Auditiva */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-gray-400">SENSIBILIDADE ACÚSTICA:</span>
                                  <span className="text-[#00ffff] font-bold">{crit.soundIndex}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500" style={{ width: `${crit.soundIndex}%` }} />
                                </div>
                              </div>

                              {/* Barra 2: Sensibilidade Visual */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-gray-400">DETECÇÃO VISUAL / LUZ:</span>
                                  <span className="text-amber-500 font-bold">{crit.sightIndex}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${crit.sightIndex}%` }} />
                                </div>
                              </div>

                              {/* Barra 3: Geração de Estresse no Jogador */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-gray-400">MULTIPLICADOR DE ESTRESSE:</span>
                                  <span className="text-red-500 font-bold">{crit.stressIndex}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600 animate-pulse" style={{ width: `${crit.stressIndex}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Mecânicas de Gameplay */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded border border-white/5">
                              <div>
                                <span className="font-mono text-[9px] text-gray-500 uppercase block">Instrução de Sobrevivência</span>
                                <p className="text-xs text-red-400 font-mono mt-1 leading-relaxed font-bold">{crit.mechanic}</p>
                              </div>
                              <div>
                                <span className="font-mono text-[9px] text-gray-500 uppercase block">Fraqueza Primária</span>
                                <p className="text-xs text-gray-300 font-mono mt-1 leading-relaxed">{crit.weakness}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* SEÇÃO DE FAÇÕES */}
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] text-gray-500 block uppercase">Sociedades do Concreto Subterrâneo</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {factions.map((f, i) => (
                        <div key={i} className="bg-[#0c0c0c] border border-white/5 p-5 rounded space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-bold text-white tracking-wide">{f.name}</h4>
                            <span className="text-[9px] font-mono bg-[#b30000]/15 text-[#ff1a1a] px-2 py-0.5 rounded border border-[#b30000]/20 uppercase">
                              {f.danger}
                            </span>
                          </div>
                          
                          <p className="text-xs text-amber-500 font-mono italic">"{f.ethos}"</p>
                          <p className="text-xs text-gray-400 leading-relaxed">{f.description}</p>
                          
                          <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-gray-500">
                            PAPEL: {f.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: DOCUMENTS */}
              {activeTab === "documents" && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded">
                    <span className="font-mono text-[10px] text-cyan-400 uppercase block">Navegador de Sistema de Arquivos</span>
                    <h2 className="text-xl font-bold text-white">Documentos e Transcrições Recuperadas</h2>
                    <p className="text-xs text-gray-400 mt-1">Fragmentos de dor e ciência recuperados das gavetas frias do complexo industrial.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Lista de Documentos Esquerda */}
                    <div className="lg:col-span-4 flex flex-col space-y-3">
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocument(doc.id)}
                          className={`p-4 rounded text-left border transition-all flex flex-col space-y-1 relative ${
                            selectedDocument === doc.id
                              ? "bg-cyan-950/20 border-cyan-500 text-white"
                              : "bg-[#0c0c0c] border-white/5 hover:border-white/10 text-gray-400"
                          }`}
                        >
                          <span className="font-mono text-[9px] text-cyan-400">{doc.classification}</span>
                          <span className="text-sm font-bold tracking-wide text-white block truncate">{doc.title}</span>
                          <span className="text-[10px] font-mono text-gray-500">{doc.date}</span>
                        </button>
                      ))}
                    </div>

                    {/* Exibição Completa do Conteúdo Direito */}
                    <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded p-6 flex flex-col justify-between space-y-6">
                      {(() => {
                        const activeDoc = documents.find(d => d.id === selectedDocument)!;
                        return (
                          <div className="space-y-6">
                            <div className="flex justify-between items-start border-b border-white/10 pb-4">
                              <div>
                                <span className="font-mono text-xs text-cyan-400 block tracking-wider uppercase">{activeDoc.classification}</span>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider mt-1">{activeDoc.title}</h3>
                              </div>
                              <div className="text-right font-mono text-[10px] text-gray-500">
                                <div>FONTE: {activeDoc.source}</div>
                                <div>REGISTRO: {activeDoc.date}</div>
                              </div>
                            </div>

                            {/* Papel Simulador de Documento Físico do Exército */}
                            <div className="bg-[#050505] p-5 rounded border border-white/5 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                              {activeDoc.content}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                              <span>CLASSIFICAÇÃO ADVERSA - PURGA EXIGIDA</span>
                              <span className="text-[#b30000] font-bold animate-pulse">CONFIDENCIAL MILITAR</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: SIMULATION */}
              {activeTab === "simulation" && (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-[#0c0c0c] border border-[#00ffff]/30 border-l-4 rounded">
                    <span className="font-mono text-[10px] text-[#00ffff] uppercase block tracking-widest animate-pulse">Engine de Destino Interativo</span>
                    <h2 className="text-xl font-bold text-white">Simulador Dinâmico de Finais Alternativos</h2>
                    <p className="text-xs text-gray-400 mt-1">Ajuste os fatores psicológicos e morais de Thomas Cole para prever qual dos três desfechos seria disparado no jogo.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Controles do Simulador */}
                    <div className="lg:col-span-6 bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6">
                      <span className="font-mono text-[11px] text-[#b30000] block uppercase tracking-wider border-b border-white/5 pb-2">Parâmetros de Campanha</span>
                      
                      {/* Controle 1: Stress de Thomas */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white font-bold flex items-center space-x-1.5">
                            <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span>ESTRESSE ACUMULADO DE THOMAS</span>
                          </span>
                          <span className="text-red-500 font-bold">{stressLevel}% BPM</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Determina a instabilidade cognitiva. Níveis altos causam tremores e barulho. Afeta o compasso do batimento cardíaco sintetizado de forma dinâmica!
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stressLevel}
                          onChange={(e) => setStressLevel(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#b30000]"
                        />
                        <div className="flex justify-between font-mono text-[9px] text-gray-500">
                          <span>0% (CALMO)</span>
                          <span>50% (PÂNICO)</span>
                          <span>100% (ATAQUE CARDÍACO)</span>
                        </div>
                      </div>

                      {/* Controle 2: Evidências Científicas */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white font-bold flex items-center space-x-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            <span>EVIDÊNCIAS DE INTELECTO DETECTADAS</span>
                          </span>
                          <span className="text-cyan-400 font-bold">{evidenceCollected}% DOSSIÊ</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Percentual de documentos sensíveis, disquetes de sistema e logs de Elena Cole recuperados e criptografados nos terminais corporativos.
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={evidenceCollected}
                          onChange={(e) => setEvidenceCollected(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between font-mono text-[9px] text-gray-500">
                          <span>0% (SABOTADO)</span>
                          <span>50% (PARCIAL)</span>
                          <span>100% (REVOLUCIONÁRIO)</span>
                        </div>
                      </div>

                      {/* Controle 3: Decisão no Synapse-Grid */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="text-white font-bold flex items-center space-x-1.5 text-xs font-mono">
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          <span>DECISÃO MORAL NO REATOR SYNAPSE</span>
                        </span>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setIntercomDecision("destroy")}
                            className={`p-3 rounded text-xs font-mono font-bold border transition-all ${
                              intercomDecision === "destroy"
                                ? "bg-red-950/20 border-[#b30000] text-[#ff1a1a]"
                                : "bg-[#050505] border-white/5 text-gray-500 hover:text-white"
                            }`}
                          >
                            Destruir a Máquina
                          </button>
                          <button
                            onClick={() => setIntercomDecision("sync")}
                            className={`p-3 rounded text-xs font-mono font-bold border transition-all ${
                              intercomDecision === "sync"
                                ? "bg-purple-950/20 border-purple-500 text-purple-400"
                                : "bg-[#050505] border-white/5 text-gray-500 hover:text-white"
                            }`}
                          >
                            Sincronizar à Frequência
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resultado Predito */}
                    <div className="lg:col-span-6 flex flex-col justify-between bg-[#0c0c0c] border border-white/5 rounded p-6 space-y-6 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl`} />
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-[#00ffff] block tracking-wider uppercase">Resultado Sináptico Gerado</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        
                        <div className={`p-4 rounded border ${currentEnding.styleClass} space-y-2`}>
                          <div className="flex items-center space-x-2">
                            <currentEnding.icon className="w-5 h-5" />
                            <h3 className="text-lg font-black tracking-wide uppercase">{currentEnding.title}</h3>
                          </div>
                          <span className="text-xs font-mono block opacity-80 uppercase">{currentEnding.subtitle}</span>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed">
                          {currentEnding.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 text-xs text-gray-500 font-mono space-y-2">
                        <span className="block font-bold text-gray-400">Recomendação de Game Design para este Final:</span>
                        <p className="leading-relaxed">
                          As cutscenes e a paleta cromática de cor para este final devem ser pautadas por tons frios e desaturação. A atmosfera musical deve incorporar mais estática conforme o nível de stress residual do jogador.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: ACHIEVEMENTS */}
              {activeTab === "achievements" && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded">
                    <span className="font-mono text-[10px] text-amber-500 uppercase block">Projeção de Recompensas</span>
                    <h2 className="text-xl font-bold text-white">Conquistas de Terror de Sobrevivência (Achievements)</h2>
                    <p className="text-xs text-gray-400 mt-1">Conquistas planejadas para recompensar jogadores por perícia furtiva extrema e exploração exaustiva.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex space-x-4 items-start hover:border-[#b30000]/30 transition-all">
                      <div className="p-3 bg-red-950/30 rounded border border-[#b30000]/40 text-[#ff1a1a]">
                        <EyeOff className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">"Não Olhe para Trás"</h4>
                        <p className="text-xs text-gray-400 leading-normal">
                          Conclua a sequência de perseguição do Setor Clínico sem olhar para o Cirurgião Cego uma única vez.
                        </p>
                        <span className="text-[10px] font-mono text-gray-500 block">Dificuldade: EXTREMA</span>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex space-x-4 items-start hover:border-[#b30000]/30 transition-all">
                      <div className="p-3 bg-red-950/30 rounded border border-[#b30000]/40 text-[#ff1a1a]">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">"Química Controlada"</h4>
                        <p className="text-xs text-gray-400 leading-normal">
                          Termine o jogo inteiro usando menos de 3 sedativos no total. Requer domínio perfeito do ritmo cardíaco de Thomas.
                        </p>
                        <span className="text-[10px] font-mono text-gray-500 block">Dificuldade: CRÍTICA</span>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex space-x-4 items-start hover:border-[#b30000]/30 transition-all">
                      <div className="p-3 bg-cyan-950/30 rounded border border-cyan-900/40 text-cyan-400">
                        <VolumeX className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">"Silêncio Absoluto"</h4>
                        <p className="text-xs text-gray-400 leading-normal">
                          Segure a respiração com sucesso por mais de 45 segundos cumulativos ao se esconder de anomalias cognitivas.
                        </p>
                        <span className="text-[10px] font-mono text-gray-500 block">Dificuldade: ALTA</span>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded flex space-x-4 items-start hover:border-[#b30000]/30 transition-all">
                      <div className="p-3 bg-cyan-950/30 rounded border border-cyan-900/40 text-cyan-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">"Verdades Enterradas"</h4>
                        <p className="text-xs text-gray-400 leading-normal">
                          Encontre e leia todos os 12 documentos confidenciais da Aetheris Group espalhados pela ES7.
                        </p>
                        <span className="text-[10px] font-mono text-gray-500 block">Dificuldade: EXPLORAÇÃO</span>
                      </div>
                    </div>
                  </div>

                  {/* ROADMAP NARRATIVO */}
                  <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                    <span className="font-mono text-[10px] text-amber-500 block uppercase tracking-wider">Roadmap de Produção de Narrativa</span>
                    
                    <div className="relative border-l-2 border-amber-500/20 ml-3 pl-6 space-y-4 py-1">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#050505]" />
                        <h5 className="text-xs font-bold text-white uppercase font-mono">Etapa 1: Conceito Narrativo & GDD (Concluído)</h5>
                        <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                          Estruturação total de lore, biometria das anomalias, arquivologia documental de vazamento e os três ramos dramáticos de conclusão de história.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-[#050505] animate-pulse" />
                        <h5 className="text-xs font-bold text-[#00ffff] uppercase font-mono">Etapa 2: Arquitetura & Engenharia do Sistema (Especificado)</h5>
                        <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                          Estruturação de pastas, diagramas cliente-servidor, asset pipeline, sistemas em tempo real (Socket.io/Redis) e modelagem de banco de dados PostgreSQL com Prisma.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-[#050505]" />
                        <h5 className="text-xs font-bold text-gray-500 uppercase font-mono">Etapa 3: Protótipo de Mecânicas Sinápticas (Planejado)</h5>
                        <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                          Desenvolvimento de código para renderizador de luz WebGL, inteligência de ecolocalização de Thorne e o script de batimento cardíaco binaural dinâmico.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: SYSTEM ARCHITECTURE */}
              {activeTab === "architecture" && (
                <motion.div
                  key="architecture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Cabeçalho da Seção */}
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="font-mono text-[10px] text-[#00ffff] uppercase block tracking-wider">ARQUITETURA DE SISTEMAS // LEAD ARCHITECT</span>
                      <h2 className="text-xl font-bold text-white">Engenharia do Project Abyss</h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Especificações técnicas completas para um jogo WebGL de grande escala com alta taxa de FPS, multiplayer robusto e modding nativo.
                      </p>
                    </div>
                    <a
                      href="/PROJECT_ABYSS_ARCHITECTURE_GDD.md"
                      target="_blank"
                      className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-[#00ffff] text-xs font-mono rounded flex items-center space-x-2 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Arquivo MD</span>
                    </a>
                  </div>

                  {/* SUB-NAVEGAÇÃO DA ARQUITETURA */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
                    <button
                      onClick={() => setSelectedArchTab("overview")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "overview"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Visão Geral
                    </button>
                    <button
                      onClick={() => setSelectedArchTab("folders")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "folders"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Estrutura de Pastas
                    </button>
                    <button
                      onClick={() => setSelectedArchTab("pipeline")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "pipeline"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Asset Pipeline
                    </button>
                    <button
                      onClick={() => setSelectedArchTab("subsystems")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "subsystems"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Subsistemas Principais
                    </button>
                    <button
                      onClick={() => setSelectedArchTab("scalability")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "scalability"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Escalabilidade & BD
                    </button>
                    <button
                      onClick={() => setSelectedArchTab("monitoring")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedArchTab === "monitoring"
                          ? "bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      CMS & Telemetria
                    </button>
                  </div>

                  {/* CONTEÚDO DAS SUB-TABELAS DE ARQUITETURA */}
                  <AnimatePresence mode="wait">
                    {selectedArchTab === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Network className="w-5 h-5 text-cyan-400" />
                            <span>A Arquitetura de Fluxo de Dados Unificada</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            A arquitetura combina renderização WebGL nativa no lado do cliente com microsserviços NestJS assíncronos e orquestrados para lidar com autenticação, sincronização de estado e salvamentos de alta concorrência.
                          </p>
                          <div className="p-4 bg-black rounded border border-white/5 font-mono text-xs text-[#00ffff]/80 overflow-x-auto leading-relaxed">
                            <pre>{`┌────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE & CDN                           │
│     (WAF, DDoS Protection, DNS Routing & Asset Delivery via HTTP/3)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────┐                               ┌──────────────────┐
│  ASSET CDN       │                               │   WEB CLIENT     │
│  (S3 / Edge)     │                               │ (React, Tailwind │
│  .gltf, .bin,    │                               │  BabylonJS, ECS) │
│  Basis Textures  │                               └─────────┬────────┘
└────────┬─────────┘                                         │
         │                                                   │ HTTPS / WSS
         │ Get Assets (Draco Mesh, KTX2)                     │ (JWT Authentication)
         │                                                   ▼
         │                                         ┌──────────────────┐
         │                                         │ CLOUDFLARE WARP  │
         │                                         │ (Reverse Proxy)  │
         │                                         └─────────┬────────┘
         │                                                   │
         │                                                   ▼
         │                                         ┌──────────────────┐
         │                                         │  API GATEWAY /   │
         │                                         │ TRAEFIK BALANCER │
         │                                         └─────────┬────────┘
         │                                                   │
         │         ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
         │         ▼ (HTTP)                                  ▼ (WSS)                                   ▼ (HTTP)
         │  ┌──────────────┐                          ┌──────────────┐                          ┌──────────────┐
         │  │ AUTH SERVICE │                          │ GATEWAY &    │                          │ ANALYTICS &  │
         │  │  (NestJS)    │                          │ MULTIPLAYER  │                          │ LOG SERVICE  │
         │  │   JWT Auth   │                          │ (NestJS/WS)  │                          │  (NestJS)    │
         │  └──────┬───────┘                          └──────┬───────┘                          └──────┬───────┘
         │         │                                         │                                         │
         └─────────┼─────────────────────┐                   │                                         │
                   │                     │                   │                                         │
                   ▼                     ▼                   ▼                                         ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                      ┌──────────────────┐
         │    POSTGRESQL    │  │   REDIS CACHE    │  │  REDIS PUB/SUB   │                      │  ELASTICSEARCH / │
         │   (Prisma ORM)   │  │ (Session, State) │  │  (Message Bus)   │                      │    PROMETHEUS    │
         │ Persistent Data  │  │ Fast Key-Value   │  │ Scale WebSockets │                      │ Telemetry & Logs │
         └──────────────────┘  └──────────────────┘  └──────────────────┘                      └──────────────────┘`}</pre>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-2">
                            <span className="text-[10px] text-cyan-400 font-mono block uppercase">CLIENT RENDER</span>
                            <h4 className="text-sm font-bold text-white">BabylonJS + ECS</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Lógica desacoplada baseada no padrão Entity Component System (ECS). O React cuida unicamente de UIs bidimensionais, enquanto o canvas roda em 60 FPS estáveis livres de garbage collector.
                            </p>
                          </div>
                          <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-2">
                            <span className="text-[10px] text-cyan-400 font-mono block uppercase">REALTIME INTERACTION</span>
                            <h4 className="text-sm font-bold text-white">WebSockets / Socket.IO</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Conexões em tempo real persistentes para dados espaciais, eventos mundiais e sincronização de lobbies de jogo. Multi-region scale via Redis Pub/Sub Adapter.
                            </p>
                          </div>
                          <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-2">
                            <span className="text-[10px] text-cyan-400 font-mono block uppercase">PERSISTÊNCIA RELACIONAL</span>
                            <h4 className="text-sm font-bold text-white">Postgres + Prisma</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Modelagem estrita do banco com o Prisma. Controle transacional absoluto de inventário contra trapaças e compressão LZW automática dos dados de salvamento.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedArchTab === "folders" && (
                      <motion.div
                        key="folders"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <span>Modularidade e Estrutura de Diretórios</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            A divisão estruturada por módulos facilita a delegação de tarefas de desenvolvimento, permitindo que a equipe de Front-end (UI/Graphics) e de Back-end (Server) trabalhem de forma desacoplada no monorepo.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                              <span className="text-xs font-mono font-bold text-[#00ffff] block">💻 CLIENT (WebGL & UI)</span>
                              <div className="p-3 bg-black rounded border border-white/5 text-xs font-mono text-gray-300 max-h-96 overflow-y-auto">
                                <pre>{`/apps/client
├── public/                     # Assets estáticos
├── src/
│   ├── main.tsx                # Entrada React
│   ├── App.tsx                 # Layout mestre & UI Overlay
│   ├── core/                   # Núcleo WebGL
│   │   ├── Engine.ts           # Inicialização BabylonJS
│   │   ├── SceneManager.ts     # Carregamento de fases
│   │   ├── EventBus.ts         # Eventos locais
│   │   └── SaveSystem.ts       # Serializador de Save
│   ├── ecs/                    # Arquitetura ECS
│   │   ├── Entity.ts
│   │   ├── Component.ts
│   │   ├── System.ts
│   │   ├── components/         # Transform, Sound, AI, etc.
│   │   └── systems/            # Lógica pura por ciclo
│   ├── pipeline/               # Custom Shaders (GLSL)
│   │   ├── RenderPipeline.ts
│   │   └── shaders/            # aberration.frag, volumetric.vert
│   └── subsystems/             # Audio, Input, Inventory, AI`}</pre>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-xs font-mono font-bold text-red-400 block">⚙️ BACKEND (NestJS & DB)</span>
                              <div className="p-3 bg-black rounded border border-white/5 text-xs font-mono text-gray-300 max-h-96 overflow-y-auto">
                                <pre>{`/apps/server
├── prisma/
│   └── schema.prisma           # Schema relacional de dados
├── src/
│   ├── main.ts                 # Bootstrap NestJS
│   ├── app.module.ts           # Módulo raiz
│   └── modules/                # Módulos desacoplados
│       ├── auth/               # Controle JWT e segurança
│       ├── gateway/            # WebSocket Server (Socket.IO)
│       │   ├── game.gateway.ts
│       │   └── game.session.ts # Cache do Redis de sessão
│       ├── save/               # Sincronização LZW
│       ├── inventory/          # Validador de slots seguro
│       ├── cms/                # Assets & Patches
│       └── analytics/          # logs & telemetria
└── docker-compose.yml          # Postgres, Redis, Host`}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedArchTab === "pipeline" && (
                      <motion.div
                        key="pipeline"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Sliders className="w-5 h-5 text-cyan-400" />
                            <span>Asset Pipeline Automatizado</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            No WebGL, tempos de download e gargalos de decodificação de imagem na CPU são fatais. Desenvolvemos um pipeline automatizado com Draco Compression para malhas 3D e Basis Universal (KTX2) para texturas, economizando até 85% de rede e VRAM.
                          </p>

                          <div className="p-4 bg-black rounded border border-white/5 font-mono text-xs text-[#00ffff]/80 overflow-x-auto">
                            <pre>{`[Ativos Brutos (Maya, Blender, Substance)]
  - .fbx, .obj (Modelos 3D de alta contagem de polígonos)
  - .png, .tga (Texturas raw em 4K)
        │
        ▼ (Processo de Build Automatizado via Node.js + Gulp + Draco Compressor)
[Pipeline de Otimização e Conversão]
  - Redução de Polígonos (Decimação de malhas com preservação de silhueta)
  - Compressão Geométrica Draco (gLTF / GLB com compressão de vetores)
  - Conversão de Texturas para Basis Universal / KTX2 (Suporte nativo a GPU ASTC/ETC2)
  - Geração de LODs automática (Level of Detail: High, Medium, Low)
        │
        ▼ (Deployment automatizado para CDN)
[Armazenamento e Cache]
  - Repositório S3 de Assets Gráficos
  - Cloudflare CDN (Edge Caching geolocalizado com compressão Brotli)
        │
        ▼ (Carregamento Dinâmico em Tempo de Execução no Navegador)
[Streaming no Cliente]
  - BabylonJS AssetsManager (Carregamento progressivo e assíncrono por proximidade)
  - Liberação ativa de memória (Dispose de meshes ocultas da VRAM)`}</pre>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
                              <span className="font-bold text-white">Compressão de Malha (Draco):</span>
                              <p className="text-gray-400 leading-relaxed">
                                Comprime os vetores de vértice de forma altamente eficiente, gerando arquivos .gltf minúsculos que carregam quase que instantaneamente pelo navegador.
                              </p>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1">
                              <span className="font-bold text-white">Texturas Basis Universal:</span>
                              <p className="text-gray-400 leading-relaxed">
                                Diferente do PNG/JPG que estoura a memória RAM do navegador ao descompactar em bitmap raw, o formato .ktx2 permanece compactado diretamente na VRAM da GPU.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedArchTab === "subsystems" && (
                      <motion.div
                        key="subsystems"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Cpu className="w-5 h-5 text-cyan-400" />
                            <span>Subsistemas do Cliente de Alto Impacto</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold">
                                <Volume2 className="w-4 h-4" />
                                <span>Audio System (Web Audio API 3D)</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Criação de áudio 3D posicional nativo usando PannerNode da Web Audio API. O sistema projeta raios físicos dinâmicos para detectar paredes de concreto. Se Thomas estiver atrás de uma parede, o motor aplica filtros passa-baixas em tempo real para abafar o ruído da criatura.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold">
                                <Brain className="w-4 h-4" />
                                <span>AI Behavior System (HFSM & NavMesh)</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Comportamento imprevisível por Máquinas de Estado Finitas Hierárquicas (HFSM) combinadas com Steering Behaviors para suavização de trajetórias. A IA navega em malhas 3D (Navigation Meshes) calculadas por Recast/Detour.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold">
                                <Sliders className="w-4 h-4" />
                                <span>Graphics Pipeline (Passes de Render)</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Passe de Geometria básico (Depth Map + Motion Vectors) seguido pelo passe de Shaders customizados em GLSL. O efeito de estática de Stress cria uma distorção óptica de aberração cromática baseada no batimento cardíaco da CPU.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold">
                                <Sliders className="w-4 h-4" />
                                <span>Save & Event System (Seguro & Async)</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Central de eventos local estendendo TypeScript EventEmitter. Ao salvar o progresso do jogador, o estado é comprimido com LZW, encriptado localmente com hash HMAC e enviado de forma assíncrona ao PostgreSQL.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedArchTab === "scalability" && (
                      <motion.div
                        key="scalability"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Database className="w-5 h-5 text-cyan-400" />
                            <span>Segurança, Banco de Dados e Escalabilidade do Servidor</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            O ecossistema é desenhado para não-interrupção e tolerância a falhas. Em caso de sobrecarga de jogadores, o balancer do Cloudflare distribui as requisições para novas instâncias do Docker, mantendo o barramento via Redis.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <span className="font-bold text-white uppercase block tracking-wider font-mono text-[#00ffff]">JWT & AUTENTICAÇÃO STATELESS</span>
                              <p className="text-gray-400 leading-relaxed">
                                Nenhum estado de sessão do usuário é retido de forma síncrona no NestJS. O Token JWT gerado no login é assinado digitalmente e validado nas requisições HTTP e conexões WS, provendo velocidade extrema.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <span className="font-bold text-white uppercase block tracking-wider font-mono text-[#00ffff]">REDIS PUB/SUB ADAPTER</span>
                              <p className="text-gray-400 leading-relaxed">
                                Para evitar que conexões WebSockets fiquem restritas a um único contêiner físico do Docker, o Redis gerencia o barramento de mensagens. Uma mensagem enviada para o canal de rede é publicada em todos os nós instantaneamente.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <span className="font-bold text-white uppercase block tracking-wider font-mono text-[#00ffff]">POSTGRESQL + PRISMA ORM</span>
                              <p className="text-gray-400 leading-relaxed">
                                Modelagem estrita do banco com o Prisma. Gerencia saves do jogo, autenticações corporativas, itens comprados no CMS e configuração de permissões de mods de comunidade de forma isolada.
                              </p>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <span className="font-bold text-white uppercase block tracking-wider font-mono text-[#00ffff]">DOCKER CONTAINERIZATION</span>
                              <p className="text-gray-400 leading-relaxed">
                                Orquestração simples e rápida do ambiente operacional local e de produção. Configurado para auto-healing caso um dos microsserviços do Gateway de rede apresente anomalias críticas de travamento.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedArchTab === "monitoring" && (
                      <motion.div
                        key="monitoring"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-cyan-400" />
                            <span>CMS, Telemetria do Cliente e Logs de Produção</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Um jogo WebGL de produção de alta qualidade requer telemetria passiva no navegador para registrar a performance e identificar falhas gráficas em tempo real de acordo com o hardware do cliente.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5">
                              <span className="text-xs font-bold text-white block uppercase font-mono text-[#00ffff]">MÉTRICAS DO CLIENTE (Navegador)</span>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Caso a taxa de FPS do jogador caia abaixo de 30 por mais de 5 segundos seguidos, ou se ocorra um erro de perda de contexto do WebGL (GPU Crash), o cliente envia um payload de diagnóstico em lote para o servidor:
                              </p>
                              <div className="p-3 bg-black rounded border border-white/5 text-[10px] font-mono text-cyan-400/80 leading-normal max-h-48 overflow-y-auto">
                                <pre>{`{
  "userId": "9b1deb4d-3b7d-4bad-9bdd",
  "clientPerformance": {
    "averageFps": 24.3,
    "allocatedMeshes": 342,
    "activeDrawCalls": 182,
    "vramUsageMb": 412.5
  },
  "hardwareInfo": {
    "gpuRenderer": "WebGL 2.0 (RTX 3060)",
    "systemMemoryGb": 16,
    "logicalProcessors": 12
  },
  "gameplayContext": {
    "activeZone": "Hospital_Wing_G12",
    "activeQuest": "Elena_Signal"
  }
}`}</pre>
                              </div>
                            </div>

                            <div className="space-y-3 bg-black/40 p-4 rounded border border-white/5 flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-white block uppercase font-mono text-[#00ffff]">MONITORAMENTO DO BACKEND</span>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  Coleta de métricas via Prometheus e plotagem de painel de controle operacional centralizado com o Grafana. Monitora:
                                </p>
                                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                                  <li>Latência e perdas de pacotes Socket.IO</li>
                                  <li>Uso de CPU/Memória por pod do Docker</li>
                                  <li>Conexões e tempo de resposta de query Prisma</li>
                                  <li>Alertas automatizados de integridade no Discord</li>
                                </ul>
                              </div>

                              <div className="bg-cyan-950/20 border border-cyan-500/30 p-3 rounded text-xs font-mono text-cyan-400">
                                <strong>Status de Observabilidade:</strong> Operacional e integrado ao pipeline de build e deploy.
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* TAB 8: DATABASE DESIGN */}
              {activeTab === "database" && (
                <motion.div
                  key="database"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Cabeçalho da Seção */}
                  <div className="p-4 bg-[#0c0c0c] border border-white/5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="font-mono text-[10px] text-red-500 uppercase block tracking-wider">ARQUITETURA DE DADOS // LEAD DATABASE ARCHITECT</span>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <Database className="w-5 h-5 text-red-500" />
                        <span>Banco de Dados do Project Abyss</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Modelagem PostgreSQL + Prisma robusta e resiliente, projetada para alta concorrência, versionamento de ativos, mods, telemetria e multiplayer futuro.
                      </p>
                    </div>
                    <a
                      href="/PROJECT_ABYSS_DATABASE_DESIGN.md"
                      target="_blank"
                      className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 hover:border-red-400 text-red-400 text-xs font-mono rounded flex items-center space-x-2 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Arquivo MD</span>
                    </a>
                  </div>

                  {/* SUB-NAVEGAÇÃO DO BANCO DE DADOS */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
                    <button
                      onClick={() => setSelectedDbTab("erd")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "erd"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Modelagem Lógica (ERD)
                    </button>
                    <button
                      onClick={() => setSelectedDbTab("prisma")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "prisma"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Schema Prisma
                    </button>
                    <button
                      onClick={() => setSelectedDbTab("indexes")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "indexes"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Índices & Planner
                    </button>
                    <button
                      onClick={() => setSelectedDbTab("partitioning")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "partitioning"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Particionamento Físico
                    </button>
                    <button
                      onClick={() => setSelectedDbTab("cache")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "cache"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Camada de Cache Redis
                    </button>
                    <button
                      onClick={() => setSelectedDbTab("backup")}
                      className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
                        selectedDbTab === "backup"
                          ? "bg-red-950/30 border-red-500 text-red-400 font-bold"
                          : "bg-transparent border-transparent text-gray-500 hover:text-white"
                      }`}
                    >
                      Backup & Replicação
                    </button>
                  </div>

                  {/* CONTEÚDO DAS SUB-TABELAS DE BANCO DE DADOS */}
                  <AnimatePresence mode="wait">
                    {/* SUB-TAB 1: MODELAGEM ERD (INTERATIVO) */}
                    {selectedDbTab === "erd" && (
                      <motion.div
                        key="erd"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-sm font-mono text-[#ff3333] uppercase tracking-wider flex items-center space-x-2">
                            <Network className="w-4 h-4" />
                            <span>Mapeamento Lógico por Domínios de Serviço</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            O banco do Project Abyss está estruturado em 4 grandes domínios funcionais interconectados por chaves UUID seguras e restrições de integridade referencial. Navegue pelos cards abaixo para inspecionar os campos de cada tabela.
                          </p>

                          {/* GRID DE DOMÍNIOS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                            {/* DOMÍNIO 1: SEGURANÇA */}
                            <div className="bg-black/60 border border-white/5 p-4 rounded space-y-3 hover:border-red-500/20 transition-all">
                              <span className="font-mono text-[9px] text-red-400 block uppercase tracking-wider">01. SEGURANÇA & USUÁRIOS</span>
                              <div className="space-y-1.5">
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">users</strong>
                                  <span className="text-[10px] text-gray-400">ID, email, pwdHash, isActive</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">profiles</strong>
                                  <span className="text-[10px] text-gray-400">ID, userId, username, level, xp</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">roles / permissions</strong>
                                  <span className="text-[10px] text-gray-400">Tabelas de RBAC corporativo</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">sessions / bans</strong>
                                  <span className="text-[10px] text-gray-400">Tokens JWT, log de banimentos</span>
                                </div>
                              </div>
                            </div>

                            {/* DOMÍNIO 2: CMS & ATIVOS */}
                            <div className="bg-black/60 border border-white/5 p-4 rounded space-y-3 hover:border-red-500/20 transition-all">
                              <span className="font-mono text-[9px] text-red-400 block uppercase tracking-wider">02. CMS, ATIVOS & MODDING</span>
                              <div className="space-y-1.5">
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">maps</strong>
                                  <span className="text-[10px] text-gray-400">ID, name, data (JSONB de nós), ver</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">assets</strong>
                                  <span className="text-[10px] text-gray-400">ID, name, type (mesh, sfx, tex)</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">textures / sfx / anims</strong>
                                  <span className="text-[10px] text-gray-400">Especificação de KTX2, OGG, etc.</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">mods / uploads / media</strong>
                                  <span className="text-[10px] text-gray-400">Mapeamento S3, mods aprovados</span>
                                </div>
                              </div>
                            </div>

                            {/* DOMÍNIO 3: GAMEPLAY */}
                            <div className="bg-black/60 border border-white/5 p-4 rounded space-y-3 hover:border-red-500/20 transition-all">
                              <span className="font-mono text-[9px] text-red-400 block uppercase tracking-wider">03. JOGABILIDADE & SALVAMENTO</span>
                              <div className="space-y-1.5">
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">save_games</strong>
                                  <span className="text-[10px] text-gray-400">ID, userId, checksum, compressedState</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">inventories / items</strong>
                                  <span className="text-[10px] text-gray-400">Slots, durabilidade, staticData JSON</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">lore_items / documents</strong>
                                  <span className="text-[10px] text-gray-400">Chaves de descriptografia, logs</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">achievements / events</strong>
                                  <span className="text-[10px] text-gray-400">Troféus destravados, temporadas</span>
                                </div>
                              </div>
                            </div>

                            {/* DOMÍNIO 4: TELEMETRIA */}
                            <div className="bg-black/60 border border-white/5 p-4 rounded space-y-3 hover:border-red-500/20 transition-all">
                              <span className="font-mono text-[9px] text-red-400 block uppercase tracking-wider">04. TELEMETRIA & SISTEMA</span>
                              <div className="space-y-1.5">
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">settings</strong>
                                  <span className="text-[10px] text-gray-400">Volume, FOV, keybindings (JSON)</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">analytics</strong>
                                  <span className="text-[10px] text-gray-400">EventType, payload (JSONB), timestamp</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">logs</strong>
                                  <span className="text-[10px] text-gray-400">Server logs, stack traces, level</span>
                                </div>
                                <div className="p-2 bg-white/5 rounded border border-white/5 text-xs">
                                  <strong className="text-white font-mono block">reports / notifications</strong>
                                  <span className="text-[10px] text-gray-400">Denúncias pendentes, inbox</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* LEGENDA DE DESIGN RELACIONAL */}
                          <div className="p-4 bg-black border border-white/5 rounded flex flex-col md:flex-row gap-4 justify-between text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-white block">UUID v4 Nativos</span>
                              <p className="text-gray-400">Todos os IDs de tabelas usam UUIDv4 gerados pelo PostgreSQL para mitigar ataques de enumeração direta.</p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-white block">Integridade de Deleção (OnDelete Cascade)</span>
                              <p className="text-gray-400">Chaves estrangeiras contam com políticas estritas. Deletar uma conta de usuário remove recursivamente perfis e sessões.</p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-white block">Campos Temporalizados com Timezone</span>
                              <p className="text-gray-400">Timestamps utilizam o tipo <code>TIMESTAMPTZ(6)</code> para preservar de forma idônea o fuso horário global UTC.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 2: PRISMA SCHEMA CONSOLE (INTERATIVO) */}
                    {selectedDbTab === "prisma" && (
                      <motion.div
                        key="prisma"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#050505] border border-white/10 rounded-lg overflow-hidden flex flex-col md:flex-row h-[550px]">
                          {/* File Sidebar */}
                          <div className="w-full md:w-56 bg-[#0c0c0c] border-r border-white/5 p-4 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono pb-2 border-b border-white/5">
                                <Database className="w-4 h-4 text-red-500" />
                                <span>EXPLORER</span>
                              </div>
                              <div className="space-y-2 font-mono text-xs">
                                <div className="flex items-center space-x-2 text-red-400 font-bold p-1 bg-white/5 rounded border border-white/5 cursor-pointer">
                                  <span>📄 schema.prisma</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500 pl-4 hover:text-white cursor-pointer transition-all">
                                  <span>⚙️ prisma-client-js</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500 pl-4 hover:text-white cursor-pointer transition-all">
                                  <span>📂 migrations/</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-red-950/20 border border-red-500/10 rounded text-[10px] font-mono text-gray-400 leading-normal">
                              <strong>Engine:</strong> Prisma Client Node Native. Conecta à porta segura 5432.
                            </div>
                          </div>

                          {/* Code Editor Body */}
                          <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
                            <div className="bg-[#0a0a0a] border-b border-white/5 px-4 py-2 flex justify-between items-center text-xs font-mono">
                              <span className="text-gray-400">schema.prisma — Read Only Console</span>
                              <span className="text-[10px] text-green-500 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span>PRISMA CLIENT SYNCED</span>
                              </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-300 leading-relaxed max-h-[500px]">
                              <pre className="space-y-0 text-left">
                                {`// ==========================================
// CONFIGURAÇÃO DA FONTE DE DADOS
// ==========================================
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// DOMÍNIO 1: SEGURANÇA E USUÁRIO
// ==========================================

model User {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email        String        @unique @db.VarChar(255)
  passwordHash String        @db.VarChar(255)
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now()) @db.Timestamptz(6)
  updatedAt    DateTime      @updatedAt @db.Timestamptz(6)
  deletedAt    DateTime?     @db.Timestamptz(6)

  profile      Profile?
  sessions     Session[]
  bansReceived Ban[]         @relation("BannedUser")
  roles        UserRole[]
  saveGames    SaveGame[]
  inventory    Inventory?
  mods         Mod[]
  reportsFiled Report[]      @relation("Reporter")
  statistics   Statistic?
  analytics    Analytics[]
  achievements UserAchievement[]

  @@index([email])
  @@map("users")
}

model Profile {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @unique @db.Uuid
  username  String   @unique @db.VarChar(50)
  level     Int      @default(1) @db.Integer
  xp        Int      @default(0) @db.Integer
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([username])
  @@map("profiles")
}

model Session {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  token     String   @unique @db.VarChar(500)
  expiresAt DateTime @db.Timestamptz(6)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("sessions")
}

// ==========================================
// DOMÍNIO 2: CMS E ATIVOS 3D
// ==========================================

model Asset {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @unique @db.VarChar(150)
  type      String   @db.VarChar(50) // "TEXTURE", "SFX", "MESH", "ANIM"
  fileId    String   @db.Uuid
  metadata  Json     @default("{}") @db.JsonB
  version   Int      @default(1) @db.Integer

  file       Upload      @relation(fields: [fileId], references: [id])
  textures   Texture[]
  audioFiles AudioFile[]
  animations Animation[]

  @@index([type])
  @@map("assets")
}

model Upload {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fileName  String   @db.VarChar(255)
  sizeBytes Int      @db.Integer
  s3Key     String   @unique @db.VarChar(500)
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  assets    Asset[]
  @@map("uploads")
}

// ==========================================
// DOMÍNIO 3: GAMEPLAY E SALVAMENTOS (SAVES)
// ==========================================

model SaveGame {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @db.Uuid
  checksum        String   @db.VarChar(64) // HMAC-SHA256
  compressedState Bytes    @db.ByteA // Estado LZW comprimido de dados do jogo
  createdAt       DateTime @default(now()) @db.Timestamptz(6)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("save_games")
}

model Inventory {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @unique @db.Uuid
  capacity  Int      @default(16) @db.Integer

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     InventoryItem[]
  @@map("inventories")
}

model InventoryItem {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventoryId String @db.Uuid
  itemId      String @db.Uuid
  slotIndex   Int    @db.Integer
  quantity    Int    @default(1) @db.Integer

  inventory   Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  @@unique([inventoryId, slotIndex])
  @@map("inventory_items")
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 3: ÍNDICES & PLANNER (INTERATIVO) */}
                    {selectedDbTab === "indexes" && (
                      <motion.div
                        key="indexes"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Teoria e Índices Criados */}
                          <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                            <h3 className="text-sm font-mono text-[#ff3333] uppercase tracking-wider flex items-center space-x-2">
                              <Sliders className="w-4 h-4" />
                              <span>Estratégia de Indexes de Alta Performance</span>
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              O PostgreSQL degrada a busca se submetido a escaneamentos de tabela cheia (<code>Seq Scan</code>) em milhões de linhas. Implementamos chaves indexadas B-Tree, compostas e GIN para indexar os nós do banco.
                            </p>

                            <div className="space-y-3 pt-2">
                              <div className="p-3 bg-black/40 border border-white/5 rounded space-y-1">
                                <span className="font-mono text-xs text-white block font-bold">Índice GIN em JSONB (maps.data / items.staticData)</span>
                                <p className="text-[11px] text-gray-400 leading-normal">
                                  Permite consultar campos de atributos internos dinâmicos sem precisar ler o JSON completo de cada registro do banco.
                                </p>
                              </div>
                              <div className="p-3 bg-black/40 border border-white/5 rounded space-y-1">
                                <span className="font-mono text-xs text-white block font-bold">Índices Compostos Multi-Coluna (notifications)</span>
                                <p className="text-[11px] text-gray-400 leading-normal">
                                  Indexa <code>userId</code> e <code>isRead</code> em conjunto, agilizando em 900% o carregamento do feed de mensagens no painel.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Simulador Interativo de Query Planner */}
                          <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded flex flex-col justify-between space-y-4">
                            <div>
                              <span className="font-mono text-[9px] text-red-500 block uppercase tracking-wider">SIMULADOR INTERATIVO</span>
                              <h4 className="text-sm font-bold text-white mt-1">Simulador de EXPLAIN ANALYZE (Query Planner)</h4>
                              <p className="text-xs text-gray-400 mt-1">
                                Selecione uma transação ou consulta de jogo para simular a saída do planejador do PostgreSQL e analisar o tipo de índice disparado.
                              </p>

                              {/* Seleção de Queries */}
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("planner_terminal");
                                    if (element) {
                                      element.innerHTML = `EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM inventory_items 
WHERE "inventoryId" = '4b8d80f0-c53c-4b53-96b0-fa5f05df54ba' 
AND "slotIndex" = 4;

->  Index Scan using inventory_items_inventoryId_slotIndex_key on inventory_items  (cost=0.28..8.30 rows=1 width=32) (actual time=0.034..0.035 rows=1 loops=1)
      Index Cond: (("inventoryId" = '4b8d80f0-c53c-4b53'::uuid) AND ("slotIndex" = 4))
      Buffers: shared hit=3
Planning Time: 0.112 ms
Execution Time: 0.052 ms`;
                                    }
                                  }}
                                  className="p-2.5 bg-black hover:bg-white/5 border border-white/5 hover:border-white/10 text-left rounded text-xs transition-all text-gray-300 font-mono"
                                >
                                  ⚡ Carregar Slot de Inventário
                                </button>
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("planner_terminal");
                                    if (element) {
                                      element.innerHTML = `EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM sessions 
WHERE token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

->  Index Scan using sessions_token_key on sessions  (cost=0.42..8.44 rows=1 width=180) (actual time=0.021..0.022 rows=1 loops=1)
      Index Cond: (token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'::text)
      Buffers: shared hit=4
Planning Time: 0.098 ms
Execution Time: 0.040 ms`;
                                    }
                                  }}
                                  className="p-2.5 bg-black hover:bg-white/5 border border-white/5 hover:border-white/10 text-left rounded text-xs transition-all text-gray-300 font-mono"
                                >
                                  ⚡ Validar Token de Sessão (JWT)
                                </button>
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("planner_terminal");
                                    if (element) {
                                      element.innerHTML = `EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM notifications 
WHERE "userId" = '7d2e0b51-9bf5-4bf6-b4bc-d8a4e320d361' 
AND "isRead" = false;

->  Bitmap Heap Scan on notifications  (cost=4.25..12.30 rows=3 width=412) (actual time=0.088..0.095 rows=3 loops=1)
      Recheck Cond: (("userId" = '7d2e0b51-9bf5-4bf6'::uuid) AND ("isRead" = false))
      Buffers: shared hit=2
      ->  Bitmap Index Scan on notifications_userId_isRead_idx  (cost=0.00..4.25 rows=3 loops=1)
            Index Cond: (("userId" = '7d2e0b51-9bf5-4bf6'::uuid) AND ("isRead" = false))
Planning Time: 0.155 ms
Execution Time: 0.124 ms`;
                                    }
                                  }}
                                  className="p-2.5 bg-black hover:bg-white/5 border border-white/5 hover:border-white/10 text-left rounded text-xs transition-all text-gray-300 font-mono"
                                >
                                  ⚡ Buscar Notificações Não Lidas
                                </button>
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("planner_terminal");
                                    if (element) {
                                      element.innerHTML = `EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM analytics 
WHERE "eventType" = 'FPS_DROP' 
ORDER BY timestamp DESC LIMIT 10;

->  Limit  (cost=8.40..8.42 rows=10 width=480) (actual time=0.245..0.252 rows=10 loops=1)
      ->  Sort  (cost=8.40..12.50 rows=1640 width=480) (actual time=0.243..0.248 rows=10 loops=1)
            Sort Key: timestamp DESC
            Sort Method: top-N heapsort  Memory: 30kB
            ->  Index Scan using analytics_eventType_idx on analytics  (cost=0.15..5.40 rows=1640 loops=1)
                  Index Cond: ("eventType" = 'FPS_DROP'::text)
Planning Time: 0.210 ms
Execution Time: 0.298 ms`;
                                    }
                                  }}
                                  className="p-2.5 bg-black hover:bg-white/5 border border-white/5 hover:border-white/10 text-left rounded text-xs transition-all text-gray-300 font-mono"
                                >
                                  ⚡ Filtrar Telemetria por FPS
                                </button>
                              </div>
                            </div>

                            {/* Terminal Console Output */}
                            <div className="p-4 bg-black rounded border border-[#ff3333]/20 font-mono text-[11px] text-[#ff3333]/90 leading-relaxed overflow-x-auto min-h-[160px]">
                              <pre id="planner_terminal">Clique em uma das consultas de depuração acima para rodar a simulação do planejador do PostgreSQL...</pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 4: PARTICIONAMENTO FÍSICO */}
                    {selectedDbTab === "partitioning" && (
                      <motion.div
                        key="partitioning"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-sm font-mono text-[#ff3333] uppercase tracking-wider flex items-center space-x-2">
                            <Layers className="w-4 h-4" />
                            <span>Particionamento Declarativo por Faixa de Datas (Range Partitioning)</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            No PostgreSQL, se a tabela de telemetria <code>analytics</code> alcançar 200 milhões de registros, os índices perdem a eficiência por transbordamento de memória. Para contornar essa falha de escala, particionamos a tabela fisicamente por mês.
                          </p>

                          {/* Gráfico de Partições */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div className="p-4 bg-black rounded border border-red-500/20 text-center space-y-2">
                              <span className="font-mono text-[10px] text-red-400 block font-bold">analytics_y2026m01</span>
                              <div className="h-2 bg-red-950/40 border border-red-500/30 rounded overflow-hidden">
                                <div className="h-full bg-red-500 w-full" />
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block">Volume: 42M linhas</span>
                              <span className="text-[9px] bg-red-900/40 text-red-300 px-1 py-0.5 rounded border border-red-500/20 font-mono block uppercase">Histórico (S3 Copy)</span>
                            </div>
                            <div className="p-4 bg-black rounded border border-red-500/20 text-center space-y-2">
                              <span className="font-mono text-[10px] text-red-400 block font-bold">analytics_y2026m02</span>
                              <div className="h-2 bg-red-950/40 border border-red-500/30 rounded overflow-hidden">
                                <div className="h-full bg-red-500 w-11/12" />
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block">Volume: 38M linhas</span>
                              <span className="text-[9px] bg-red-900/40 text-red-300 px-1 py-0.5 rounded border border-red-500/20 font-mono block uppercase">Histórico (S3 Copy)</span>
                            </div>
                            <div className="p-4 bg-black rounded border border-red-500/20 text-center space-y-2">
                              <span className="font-mono text-[10px] text-red-400 block font-bold">analytics_y2026m03</span>
                              <div className="h-2 bg-red-950/40 border border-red-500/30 rounded overflow-hidden">
                                <div className="h-full bg-red-500 w-3/4" />
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block">Volume: 29M linhas</span>
                              <span className="text-[9px] bg-red-900/40 text-red-300 px-1 py-0.5 rounded border border-red-500/20 font-mono block uppercase">Histórico (S3 Copy)</span>
                            </div>
                            <div className="p-4 bg-black rounded border border-green-500/20 text-center space-y-2">
                              <span className="font-mono text-[10px] text-green-400 block font-bold">analytics_y2026m04 (Atual)</span>
                              <div className="h-2 bg-green-950/40 border border-green-500/30 rounded overflow-hidden">
                                <div className="h-full bg-green-500 w-1/4 animate-pulse" />
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block">Volume: 12M linhas</span>
                              <span className="text-[9px] bg-green-900/40 text-green-300 px-1 py-0.5 rounded border border-green-500/20 font-mono block uppercase">Escritas Ativas</span>
                            </div>
                          </div>

                          <div className="p-4 bg-black rounded border border-white/5 font-mono text-xs text-gray-400 space-y-2">
                            <span className="text-white font-bold block">Como Funciona a Invalidação e Limpeza Física</span>
                            <p className="leading-relaxed">
                              Mensalmente, uma cronjob executa no banco PostgreSQL o processo de backup frio da partição de 4 meses atrás, encriptando-a e enviando para o S3. Logo após, executa o drop físico instantâneo da partição:
                            </p>
                            <pre className="p-3 bg-[#050505] rounded text-red-400/80 overflow-x-auto text-[11px] border border-white/5 mt-2">
{`-- Desconecta e remove partição antiga de forma instantânea sem lockar tabelas de escrita ativas
ALTER TABLE analytics DETACH PARTITION analytics_y2026m01;
DROP TABLE analytics_y2026m01; -- Executado em 0.04ms`}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 5: CAMADA DE CACHE REDIS (INTERATIVO) */}
                    {selectedDbTab === "cache" && (
                      <motion.div
                        key="cache"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6">
                          <div>
                            <h3 className="text-sm font-mono text-[#ff3333] uppercase tracking-wider flex items-center space-x-2">
                              <Cpu className="w-4 h-4" />
                              <span>Camada de Caching In-Memory (Redis)</span>
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed mt-1">
                              Para poupar conexões com o PostgreSQL e entregar latências estáveis abaixo de 1ms nas rotas mais requisitadas, a API atua como um coordenador que valida dados de cache antes de bater no banco transacional.
                            </p>
                          </div>

                          {/* Simulador Interativo de Cache */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-4 bg-black rounded border border-white/5 space-y-4 flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="font-mono text-[9px] text-red-400 block uppercase tracking-wider">MECÂNICA INTERATIVA</span>
                                <h4 className="text-sm font-bold text-white">Simulador de Ciclo de Requisições</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  Simule como o fluxo de requisições se comporta ao buscar a autenticação e estado de sessão de um jogador de acordo com a presença do token no cache em memória.
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("cache_logs");
                                    if (element) {
                                      element.innerHTML = `[09:42:01.002] CLI -> GET /api/user/profile (Auth Token JWT)
[09:42:01.003] API -> Redis Query: session:9b1deb4d-3b7d
[09:42:01.004] REDIS -> HGETALL session:9b1deb4d-3b7d -> MATCH FOUND!
[09:42:01.004] API -> Return data to Client
[09:42:01.005] LATENCY RESULT: 0.3ms (CACHE HIT 🟢)`;
                                    }
                                  }}
                                  className="flex-1 py-2 px-3 bg-green-950/30 border border-green-500/30 hover:bg-green-950/50 text-green-300 font-mono text-xs rounded transition-all text-center"
                                >
                                  🟢 Simular Cache HIT (Redis)
                                </button>
                                <button
                                  onClick={() => {
                                    const element = document.getElementById("cache_logs");
                                    if (element) {
                                      element.innerHTML = `[09:42:05.150] CLI -> GET /api/user/profile (Auth Token JWT)
[09:42:05.151] API -> Redis Query: session:4a2d82bb-2c3c
[09:42:05.153] REDIS -> HGETALL session:4a2d82bb-2c3c -> KEY NOT FOUND (CACHE MISS 🔴)
[09:42:05.154] API -> Querying PostgreSQL (users JOIN profiles)
[09:42:05.185] POSTGRES -> Row retrieved successfully (31ms)
[09:42:05.186] API -> Caching session in Redis: HMSET session:4a2d82bb-2c3c (TTL: 86400s)
[09:42:05.187] API -> Return data to Client
[09:42:05.188] LATENCY RESULT: 38ms (FALLBACK TO DB)`;
                                    }
                                  }}
                                  className="flex-1 py-2 px-3 bg-red-950/30 border border-red-500/30 hover:bg-red-950/50 text-red-300 font-mono text-xs rounded transition-all text-center"
                                >
                                  🔴 Simular Cache MISS (Postgres Fallback)
                                </button>
                              </div>
                            </div>

                            <div className="p-4 bg-black rounded border border-[#ff3333]/20 font-mono text-xs text-gray-400 min-h-[160px] flex flex-col justify-between">
                              <span className="text-[10px] text-gray-500 block uppercase border-b border-white/5 pb-1 mb-2">Logs de Monitoramento de Rede</span>
                              <pre id="cache_logs" className="text-[11px] text-gray-300 leading-relaxed overflow-x-auto flex-1">
Aguardando disparo de simulação de rede...
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 6: BACKUP & REPLICAÇÃO */}
                    {selectedDbTab === "backup" && (
                      <motion.div
                        key="backup"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-4">
                          <h3 className="text-sm font-mono text-[#ff3333] uppercase tracking-wider flex items-center space-x-2">
                            <Server className="w-4 h-4" />
                            <span>Segurança contra Perda de Dados: Alta Disponibilidade & Backups</span>
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            No PROJECT ABYSS, a confiabilidade de salvamento das transações do jogador é nossa maior diretiva técnica. Construímos uma rede de redundância contra falhas mecânicas ou de infraestrutura de nuvem.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="p-4 bg-black/40 rounded border border-white/5 space-y-2">
                              <span className="font-bold text-white block text-xs uppercase font-mono text-red-400">Point-In-Time Recovery (PITR)</span>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Gravamos continuamente todos os Write-Ahead Logs (WAL) do PostgreSQL de forma incremental direto para um bucket isolado do Amazon S3 ou Google Cloud Storage. Permite "rebobinar" o banco para qualquer milissegundo em caso de corrupção ou falhas humanas críticas.
                              </p>
                            </div>

                            <div className="p-4 bg-black/40 rounded border border-white/5 space-y-2">
                              <span className="font-bold text-white block text-xs uppercase font-mono text-red-400">Arquitetura Primária & Réplica (Multi-AZ HA)</span>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                Em produção, o nó principal processa todas as escritas e sincroniza os dados continuamente (Streaming Replication) para um nó secundário em outra zona de disponibilidade geográfica. O balanceador ativa o failover sem perdas em até 30s.
                              </p>
                            </div>
                          </div>

                          <div className="bg-red-950/10 border border-red-500/20 p-4 rounded text-xs text-gray-400 space-y-1">
                            <strong>Frequência de Backup Transacional:</strong>
                            <ul className="list-disc pl-4 space-y-1 mt-1">
                              <li>WAL incremental contínuo (Retenção: 14 dias para PITR)</li>
                              <li>Full database dump compactado diariamente às 03:00 UTC (Retenção: 90 dias)</li>
                              <li>Sanity check de integridade automatizado a cada backup completo</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === "cms" && (
                <motion.div
                  key="cms"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <CMSPanel />
                </motion.div>
              )}
            </AnimatePresence>


          </main>

        </div>

        {/* RODAPÉ E STATUS DE TRANSMISSÃO */}
        <footer className="flex flex-col md:flex-row justify-between items-center bg-[#0c0c0c] p-4 border border-white/5 rounded space-y-4 md:space-y-0 text-xs font-mono">
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center text-gray-500 text-[10px]">
            <span>ESTÚDIO DE FRANCHISE: <strong className="text-white">ABYSS STUDIO AAA</strong></span>
            <span>PROJETO: <strong className="text-white">PROJECT ABYSS</strong></span>
            <span>MOTOR DE JOGO: <strong className="text-white">WEBGL DIRECT RENDERING</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-gray-500 text-[10px]">
            <span className="uppercase tracking-wider">REVISÃO DOCUMENTAL 1.0.4</span>
            <div className="w-3.5 h-3.5 bg-red-900 animate-pulse rounded-sm" />
          </div>
        </footer>

      </div>
    </div>
  );
}
