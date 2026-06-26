import React, { useState } from "react";
import { 
  Volume2, Disc, Play, Square, Music, Activity, Save, 
  Settings, Sliders, AudioLines, RefreshCw, VolumeX 
} from "lucide-react";

interface AudioTrack {
  id: string;
  name: string;
  category: "MUSIC" | "AMBIENT" | "SFX" | "FOOTSTEPS";
  duration: string;
  fileSize: string;
}

export default function CMSAudioEditor() {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { id: "t-1", name: "Abyss Deep Echoes.mp3", category: "AMBIENT", duration: "03:45", fileSize: "8.4 MB" },
    { id: "t-2", name: "Thorne Pursuit Chase.ogg", category: "MUSIC", duration: "02:12", fileSize: "5.1 MB" },
    { id: "t-3", name: "Hospital Iron Door Creak.wav", category: "SFX", duration: "00:04", fileSize: "250 KB" },
    { id: "t-4", name: "Heartbeat Slow Loop.wav", category: "AMBIENT", duration: "01:00", fileSize: "1.2 MB" },
    { id: "t-5", name: "Concrete Running Footsteps.wav", category: "FOOTSTEPS", duration: "00:15", fileSize: "310 KB" }
  ]);

  const [masterVol, setMasterVol] = useState<number>(80);
  const [musicVol, setMusicVol] = useState<number>(65);
  const [sfxVol, setSfxVol] = useState<number>(90);
  const [ambientVol, setAmbientVol] = useState<number>(75);

  const [bass, setBass] = useState<number>(4);
  const [mid, setMid] = useState<number>(-1);
  const [treble, setTreble] = useState<number>(6);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const handlePlayTrack = (trackId: string) => {
    setActiveTrackId(trackId);
  };

  const handleStopTrack = () => {
    setActiveTrackId(null);
  };

  const handleSaveMixer = () => {
    alert("Configurações do mixer de áudio salvas e sincronizadas para todas as instâncias de jogo!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Coluna 1: Banco de Áudios */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-gray-400">Banco de Ativos Sonoros</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {tracks.map(t => (
              <div
                key={t.id}
                className={`p-2.5 rounded border text-xs font-mono flex flex-col gap-1.5 transition-all ${
                  activeTrackId === t.id
                    ? "bg-red-950/10 border-red-500 text-white"
                    : "bg-black/40 border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold truncate max-w-[140px]">{t.name}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                    {t.category}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Duração: {t.duration}</span>
                  <div className="flex space-x-1.5">
                    {activeTrackId === t.id ? (
                      <button 
                        onClick={handleStopTrack}
                        className="p-1 bg-red-950/40 border border-red-500/30 text-red-400 rounded hover:bg-red-900/40 transition-all"
                      >
                        <Square className="w-3 h-3" fill="currentColor" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePlayTrack(t.id)}
                        className="p-1 bg-green-950/40 border border-green-500/30 text-green-400 rounded hover:bg-green-900/40 transition-all"
                      >
                        <Play className="w-3 h-3" fill="currentColor" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-red-950/10 border border-red-500/10 rounded text-[10px] text-gray-400 leading-normal">
          Todos os arquivos de áudio são comprimidos em codec OGG Vorbis para máxima performance de streaming WebGL.
        </div>
      </div>

      {/* Coluna 2 e 3: Console Virtual Mixer & Equalizador */}
      <div className="xl:col-span-2 space-y-4">
        {/* Mesa de Som / Mixer Virtual */}
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AudioLines className="w-4 h-4 text-red-500" />
              <span>Console Virtual de Canais (Mixer)</span>
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold">
              MIXER ACTIVE
            </span>
          </div>

          {/* Faders de Canais */}
          <div className="grid grid-cols-4 gap-4 h-48 py-2">
            {/* MASTER */}
            <div className="flex flex-col items-center justify-between font-mono">
              <span className="text-[10px] text-red-400 font-bold">MASTER</span>
              <div className="relative h-28 w-4 bg-black border border-white/10 rounded-full flex items-end justify-center">
                <div 
                  className="w-full bg-red-500 rounded-full transition-all"
                  style={{ height: `${masterVol}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVol}
                  onChange={(e) => setMasterVol(Number(e.target.value))}
                  className="absolute inset-0 cursor-pointer opacity-0 -rotate-90 origin-center"
                />
              </div>
              <span className="text-[10px] text-gray-400">{masterVol}%</span>
            </div>

            {/* MUSIC */}
            <div className="flex flex-col items-center justify-between font-mono">
              <span className="text-[10px] text-gray-500">MUSIC</span>
              <div className="relative h-28 w-4 bg-black border border-white/10 rounded-full flex items-end justify-center">
                <div 
                  className="w-full bg-cyan-500 rounded-full transition-all"
                  style={{ height: `${musicVol}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={(e) => setMusicVol(Number(e.target.value))}
                  className="absolute inset-0 cursor-pointer opacity-0 -rotate-90 origin-center"
                />
              </div>
              <span className="text-[10px] text-gray-400">{musicVol}%</span>
            </div>

            {/* SFX */}
            <div className="flex flex-col items-center justify-between font-mono">
              <span className="text-[10px] text-gray-500">SFX</span>
              <div className="relative h-28 w-4 bg-black border border-white/10 rounded-full flex items-end justify-center">
                <div 
                  className="w-full bg-cyan-500 rounded-full transition-all"
                  style={{ height: `${sfxVol}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={(e) => setSfxVol(Number(e.target.value))}
                  className="absolute inset-0 cursor-pointer opacity-0 -rotate-90 origin-center"
                />
              </div>
              <span className="text-[10px] text-gray-400">{sfxVol}%</span>
            </div>

            {/* AMBIENT */}
            <div className="flex flex-col items-center justify-between font-mono">
              <span className="text-[10px] text-gray-500">AMBIENT</span>
              <div className="relative h-28 w-4 bg-black border border-white/10 rounded-full flex items-end justify-center">
                <div 
                  className="w-full bg-cyan-500 rounded-full transition-all"
                  style={{ height: `${ambientVol}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientVol}
                  onChange={(e) => setAmbientVol(Number(e.target.value))}
                  className="absolute inset-0 cursor-pointer opacity-0 -rotate-90 origin-center"
                />
              </div>
              <span className="text-[10px] text-gray-400">{ambientVol}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Spectrum Waveform Visualization */}
        <div className="bg-black border border-white/5 rounded p-4 h-36 flex items-center justify-center relative overflow-hidden">
          {activeTrackId ? (
            <div className="flex items-end justify-center space-x-1 h-20 w-full px-6">
              {Array.from({ length: 24 }).map((_, i) => {
                const height = Math.floor(Math.random() * 60) + 10;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className="w-1.5 bg-red-500/80 rounded-t transition-all duration-150 animate-pulse"
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center space-y-1 font-mono text-xs text-gray-500">
              <VolumeX className="w-5 h-5 mx-auto" />
              <span>Nenhuma trilha ativa em monitoramento...</span>
            </div>
          )}
          <div className="absolute top-2 left-3 text-[9px] font-mono text-gray-600 uppercase">Análise de Espectro</div>
        </div>
      </div>

      {/* Coluna 4: Equalizador (Bands) */}
      <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded space-y-4 h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider font-bold">Equalizador Paramétrico</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Low Band (Bass) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Low (Graves)</span>
                <span className="text-cyan-400 font-bold">{bass > 0 ? `+${bass}` : bass} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={bass}
                onChange={(e) => setBass(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Mid Band */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Mid (Médios)</span>
                <span className="text-cyan-400 font-bold">{mid > 0 ? `+${mid}` : mid} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={mid}
                onChange={(e) => setMid(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* High Band (Treble) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">High (Agudos)</span>
                <span className="text-cyan-400 font-bold">{treble > 0 ? `+${treble}` : treble} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={treble}
                onChange={(e) => setTreble(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            <div className="p-3 bg-black rounded border border-white/5 space-y-1 text-[10px] leading-normal">
              <span className="text-white font-bold block">Frequências de Crossover</span>
              <p className="text-gray-500">Low pass: 120Hz | High pass: 8.5kHz. Ideal para reforçar a imersão de passos de Thorne.</p>
            </div>
          </div>
        </div>

        {/* Salvar Mixer */}
        <button
          onClick={handleSaveMixer}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-400 text-red-400 text-xs font-mono font-bold rounded flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Sincronizar Mixer</span>
        </button>
      </div>
    </div>
  );
}
