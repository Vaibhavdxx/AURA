"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Volume1,
  Heart, 
  AlignLeft, 
  Sliders, 
  Search, 
  Compass, 
  Music, 
  Disc, 
  Maximize2, 
  Minimize2, 
  Activity, 
  Sparkles,
  SearchCode,
  Waveform,
  SlidersHorizontal,
  Flame,
  Volume
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackList, Track, LyricLine } from "./songs-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisualizerCanvas } from "@/components/VisualizerCanvas";
import { SynthBeatGenerator } from "@/lib/synth";

export default function MusicPlayerPage() {
  // --- Core States ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<"all" | "one" | "none">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [visualizerMode, setVisualizerMode] = useState<"bars" | "circle" | "waveform" | "particles">("bars");
  
  // Advanced Features State
  const [synthMode, setSynthMode] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lyricsExpanded, setLyricsExpanded] = useState<boolean>(false);
  const [lyricsCollapsed, setLyricsCollapsed] = useState<boolean>(false);
  
  // Equalizer
  const [isEqOpen, setIsEqOpen] = useState<boolean>(false);
  const [eqPreset, setEqPreset] = useState<string>("normal");
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0]);

  // Audio Pipeline References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const synthRef = useRef<SynthBeatGenerator | null>(null);
  
  // Track reference values
  const currentTrack = trackList[currentTrackIndex];
  
  // Procedural Log details for Synth Mode
  const [synthLogs, setSynthLogs] = useState<string[]>([]);
  const [activeLogIdx, setActiveLogIdx] = useState<number>(0);
  const logIntervalRef = useRef<any>(null);

  // Lyrics scrolling container ref
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Initializers ---
  useEffect(() => {
    // Generate static logs for Synth Mode
    setSynthLogs([
      "🎛️ Initializing Web Audio API pipeline...",
      "🥁 Kick Drum synthesis active: [C1, frequency sweep 150Hz -> 0Hz]",
      "⚡ Snare synthesis running: [White Noise + Bandpass Filter]",
      "🎸 Bass pattern looping: [C2, Eb2, G2, Bb2 rolling 16th scale]",
      "🎹 Retro Lead Synthesizer active: [Detuned Sawtooth supersaw]",
      "🌀 Feed visualizer input: AnalyserNode buffer size 512 active",
      "🎚️ Live parameters updated: lowpass cutoff freq 800Hz",
      "🚀 Procedural synth loop running smoothly offline"
    ]);

    // Handle initial volume setting
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Update background styling and CSS theme variables dynamically
  useEffect(() => {
    if (!currentTrack) return;
    const accent = synthMode ? "#ec4899" : currentTrack.color;
    const accentSec = synthMode ? "#06b6d4" : currentTrack.colorSec;

    document.documentElement.style.setProperty("--accent-color", accent);
    document.documentElement.style.setProperty("--accent-glow", convertHexToRgb(accent, 0.4));
    document.documentElement.style.setProperty("--accent-secondary", accentSec);
    document.documentElement.style.setProperty("--accent-sec-glow", convertHexToRgb(accentSec, 0.25));
  }, [currentTrackIndex, synthMode]);

  // Audio lifecycle hook
  useEffect(() => {
    if (isPlaying) {
      if (synthMode) {
        if (synthRef.current) synthRef.current.start();
      } else {
        audioRef.current?.play().catch(() => setIsPlaying(false));
      }
    } else {
      if (synthMode) {
        if (synthRef.current) synthRef.current.stop();
      } else {
        audioRef.current?.pause();
      }
    }
  }, [isPlaying, synthMode, currentTrackIndex]);

  // Synth log interval hook
  useEffect(() => {
    if (synthMode && isPlaying) {
      logIntervalRef.current = setInterval(() => {
        setActiveLogIdx(prev => (prev + 1) % 8);
      }, 2800);
    } else {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    }
    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, [synthMode, isPlaying]);

  // Synchronized Lyrics vertical scrolling effect
  useEffect(() => {
    if (synthMode) {
      const activeLogElement = document.getElementById(`synth-log-${activeLogIdx}`);
      if (activeLogElement && lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const offset = activeLogElement.offsetTop;
        const height = activeLogElement.clientHeight;
        container.scrollTop = offset - container.clientHeight / 2 + height / 2;
      }
    } else if (currentTrack?.lyrics) {
      const activeLineIdx = findActiveLyricLineIndex();
      const activeLineElement = document.getElementById(`lyric-line-${activeLineIdx}`);
      if (activeLineElement && lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const offset = activeLineElement.offsetTop;
        const height = activeLineElement.clientHeight;
        container.scrollTop = offset - container.clientHeight / 2 + height / 2;
      }
    }
  }, [currentTime, activeLogIdx, synthMode, currentTrackIndex]);

  // --- Audio Pipeline Setup ---
  const initAudioPipeline = () => {
    if (audioCtxRef.current) return; // Setup completed already

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyserRef.current = analyser;

    if (audioRef.current) {
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // 5-Band Equalizer Setup
      const frequencies = [60, 230, 910, 4000, 14000];
      const filters = frequencies.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        if (idx === 0) {
          filter.type = "lowshelf";
        } else if (idx === frequencies.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
        }
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = eqGains[idx];
        return filter;
      });
      eqFiltersRef.current = filters;

      // Cascading connections: Source -> Filter0 -> Filter1 -> ... -> Analyser -> Output
      let connector: AudioNode = source;
      filters.forEach(filter => {
        connector.connect(filter);
        connector = filter;
      });
      connector.connect(analyser);
      analyser.connect(ctx.destination);
    }

    // Connect procedural synthesizers directly to analyser
    synthRef.current = new SynthBeatGenerator(ctx, analyser);
  };

  const handlePlayPause = () => {
    initAudioPipeline();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    setIsPlaying(prev => !prev);
  };

  // --- Playlist Navigation ---
  const handleSongChange = (index: number, autoPlay: boolean = true) => {
    if (index < 0 || index >= trackList.length) return;
    setCurrentTime(0);
    setCurrentTrackIndex(index);
    if (synthMode) {
      setSynthMode(false);
    }
    setIsPlaying(autoPlay);
  };

  const handleNext = () => {
    if (shuffle) {
      const rand = Math.floor(Math.random() * trackList.length);
      handleSongChange(rand, isPlaying);
    } else {
      let nextIdx = currentTrackIndex + 1;
      if (nextIdx >= trackList.length) {
        nextIdx = repeat === "all" ? 0 : trackList.length - 1;
      }
      handleSongChange(nextIdx, isPlaying);
    }
  };

  const handlePrev = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      let prevIdx = currentTrackIndex - 1;
      if (prevIdx < 0) {
        prevIdx = repeat === "all" ? trackList.length - 1 : 0;
      }
      handleSongChange(prevIdx, isPlaying);
    }
  };

  // --- Utility Controllers ---
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleTimelineScrub = (val: number) => {
    if (synthMode) return;
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleFavorite = () => {
    const nextFavs = new Set(favorites);
    if (nextFavs.has(currentTrack.id)) {
      nextFavs.delete(currentTrack.id);
    } else {
      nextFavs.add(currentTrack.id);
    }
    setFavorites(nextFavs);
  };

  const handleSynthToggle = () => {
    initAudioPipeline();
    const nextState = !synthMode;
    setSynthMode(nextState);
    if (nextState) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      handleSongChange(currentTrackIndex, isPlaying);
    }
  };

  // --- Equalizer Tuning ---
  const applyEqPreset = (preset: string) => {
    const presets: Record<string, number[]> = {
      normal: [0, 0, 0, 0, 0],
      bass: [7, 4, 1, -1, -3],
      vocal: [-3, -1, 4, 5, 2],
      electronic: [5, 2, -2, 3, 5]
    };

    const gains = presets[preset] || presets.normal;
    setEqPreset(preset);
    setEqGains(gains);

    // Apply directly to filter nodes
    eqFiltersRef.current.forEach((filter, idx) => {
      filter.gain.setValueAtTime(gains[idx], audioCtxRef.current?.currentTime || 0);
    });
  };

  const handleEqGainChange = (idx: number, val: number) => {
    setEqPreset("custom");
    const nextGains = [...eqGains];
    nextGains[idx] = val;
    setEqGains(nextGains);

    if (eqFiltersRef.current[idx]) {
      eqFiltersRef.current[idx].gain.setValueAtTime(val, audioCtxRef.current?.currentTime || 0);
    }
  };

  // --- Data Selectors ---
  const filteredQueue = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return trackList.filter(track => {
      const matchFilter = filter === "all" || track.genre.toLowerCase() === filter;
      const matchQuery = track.title.toLowerCase().includes(query) || 
                         track.artist.toLowerCase().includes(query) ||
                         track.genre.toLowerCase().includes(query);
      return matchFilter && matchQuery;
    });
  }, [searchQuery, filter]);

  const findActiveLyricLineIndex = (): number => {
    if (!currentTrack?.lyrics) return 0;
    let idx = 0;
    for (let i = 0; i < currentTrack.lyrics.length; i++) {
      if (currentTime >= currentTrack.lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  };

  // --- Helpers ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const convertHexToRgb = (hex: string, alpha: number) => {
    const cleaned = hex.replace("#", "");
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-[#080810]/95">
      {/* Ambient backgrounds */}
      <div 
        className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vh] rounded-full ambient-glow pointer-events-none opacity-85"
        style={{
          background: `radial-gradient(circle, var(--accent-glow, rgba(168,85,247,0.4)) 0%, rgba(8,8,16,0) 70%)`
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full ambient-glow pointer-events-none opacity-70"
        style={{
          background: `radial-gradient(circle, var(--accent-sec-glow, rgba(6,182,212,0.3)) 0%, rgba(8,8,16,0) 70%)`
        }}
      />

      <div className="flex flex-col h-full z-10 backdrop-blur-[6px] border border-white/5">
        
        {/* Header */}
        <header className="h-[70px] flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a12]/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Disc className="h-7 w-7 text-[var(--accent-color,#a855f7)] animate-[spin_8s_linear_infinite] drop-shadow-[0_0_8px_var(--accent-glow)]" />
            <h1 className="font-display font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              AURA
            </h1>
            <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-[var(--accent-color)] to-purple-600 shadow-[0_0_8px_var(--accent-glow)] text-white">
              PRO
            </span>
          </div>

          <div className="flex items-center bg-white/5 border border-white/5 rounded-full px-4 py-1.5 w-80 group focus-within:border-[var(--accent-color)] transition-all">
            <Search className="h-4 w-4 text-slate-400 mr-2.5 group-focus-within:text-[var(--accent-color)]" />
            <input 
              type="text" 
              placeholder="Search tracks, artists, genres..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-xs text-slate-400 font-medium">Guest Listener</span>
            </div>
            <Button 
              variant="synth" 
              onClick={handleSynthToggle}
              className={cn(synthMode && "bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-secondary)] text-white border-transparent shadow-[0_0_12px_var(--accent-glow)]")}
            >
              <Activity className="h-3.5 w-3.5 mr-2" />
              Synth Beat
            </Button>
          </div>
        </header>

        {/* Dashboard Frame */}
        <main className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Sidebar */}
          <aside className="w-[280px] border-r border-white/5 bg-[#08080e]/20 flex flex-col p-6 gap-6 overflow-hidden">
            <div>
              <h3 className="font-display text-[10px] font-bold tracking-widest text-slate-500 mb-3 px-2">DISCOVER</h3>
              <ul className="flex flex-col gap-1">
                {[
                  { id: "all", label: "Home", icon: Compass },
                  { id: "synthwave", label: "Synthwave", icon: Sparkles },
                  { id: "chill", label: "Chill / Lo-Fi", icon: Music },
                  { id: "classical", label: "Acoustic", icon: Disc }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = filter === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setFilter(item.id);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all",
                          isActive && "text-white bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-[var(--accent-color)] rounded-r-xl rounded-l-none"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive && "text-[var(--accent-color)] drop-shadow-[0_0_4px_var(--accent-glow)]")} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="font-display text-[10px] font-bold tracking-widest text-slate-500">YOUR QUEUE</h3>
                <span className="text-[10px] text-slate-600 font-semibold">{filteredQueue.length} tracks</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
                {filteredQueue.map((track) => {
                  const globalIdx = trackList.findIndex(t => t.id === track.id);
                  const isCurrent = globalIdx === currentTrackIndex && !synthMode;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSongChange(globalIdx, true)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/[0.04] border border-transparent transition-all group",
                        isCurrent && "bg-purple-500/5 border-purple-500/20"
                      )}
                    >
                      <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-lg object-cover shadow-md" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-slate-200 truncate group-hover:text-[var(--accent-color)] transition-colors">
                          {track.title}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                          {track.artist}
                        </span>
                      </div>
                      <div className="flex items-center pr-1.5">
                        <span className="text-[10px] text-slate-600 group-hover:hidden">3:00</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={cn(
                            "h-6 w-6 rounded-full bg-white/5 hover:bg-[var(--accent-color)] hover:text-white transition-all hidden group-hover:flex",
                            isCurrent && "flex bg-[var(--accent-color)] text-white"
                          )}
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Center Pane: Platter turntable & visualizer */}
          <section className="flex-1 flex flex-col justify-between p-8 overflow-y-auto">
            <div className="flex-1 flex justify-center items-center">
              
              {/* Vinyl Turntable Base */}
              <div className="relative w-80 h-80 rounded-3xl bg-gradient-to-b from-[#22222e] to-[#111116] border border-white/5 shadow-2xl p-5 flex items-center justify-center">
                {/* Platter spinner ring */}
                <div className="w-[270px] h-[270px] rounded-full bg-[#0d0d12] border-2 border-[#1a1a24] flex items-center justify-center relative shadow-inner">
                  
                  {/* Vinyl Record */}
                  <div
                    onClick={handlePlayPause}
                    className={cn(
                      "w-[250px] h-[250px] rounded-full relative cursor-pointer shadow-2xl flex items-center justify-center transition-transform duration-500",
                      isPlaying && "vinyl-spin"
                    )}
                    style={{
                      animationPlayState: isPlaying ? "running" : "paused",
                      background: "radial-gradient(circle, #08080c 0%, #14141d 20%, #0c0c12 40%, #181822 60%, #0a0a0f 80%, #020205 100%)"
                    }}
                  >
                    {/* Concentric ridges */}
                    <div className="absolute inset-0 rounded-full pointer-events-none opacity-85"
                      style={{
                        background: "repeating-radial-gradient(circle, rgba(0,0,0,0) 0px, rgba(0,0,0,0.8) 1px, rgba(255,255,255,0.02) 2px, rgba(0,0,0,0.85) 3px, rgba(0,0,0,0) 4px)"
                      }}
                    />
                    
                    {/* Inner Label */}
                    <div className="w-[90px] h-[90px] rounded-full bg-white border-4 border-black relative overflow-hidden flex items-center justify-center shadow-inner">
                      <img 
                        src={synthMode ? "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300" : currentTrack.cover} 
                        alt="Art" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute w-3 h-3 bg-[#22222e] border-2 border-black rounded-full shadow-inner" />
                    </div>
                  </div>
                </div>

                {/* Tonearm Assembly */}
                <div 
                  className={cn(
                    "absolute top-5 right-5 w-[90px] h-[180px] pointer-events-none z-20 origin-[45px_35px] transition-transform duration-1000 ease-out",
                    isPlaying ? "rotate-[22deg]" : "rotate-0"
                  )}
                >
                  <div className="absolute top-[20px] right-[30px] w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-400 border border-slate-700 flex items-center justify-center shadow-md">
                    <div className="w-3 h-3 bg-slate-600 rounded-full" />
                  </div>
                  <div className="absolute top-0 right-9 w-5 h-6 bg-gradient-to-r from-slate-500 to-slate-700 rounded shadow-md" />
                  <div className="absolute top-8 right-[43px] w-1 h-[110px] bg-gradient-to-r from-slate-200 to-slate-400 shadow-md" />
                  <div className="absolute bottom-[20px] left-0 w-1 h-5 bg-slate-400 rotate-[-15deg] origin-top" />
                  <div className="absolute bottom-[5px] left-[-4px] w-3 h-[18px] bg-slate-800 rounded shadow-md rotate-[-15deg]" />
                  <div className="absolute bottom-0 left-[1px] w-0.5 h-1.5 bg-slate-300" />
                </div>

                {/* Reflection glare shines */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                  style={{
                    background: "conic-gradient(from 40deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.03) 40deg, rgba(255,255,255,0) 80deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,0.03) 220deg, rgba(255,255,255,0) 260deg, rgba(255,255,255,0) 360deg)"
                  }}
                />
              </div>

            </div>

            {/* Song Meta Descriptions */}
            <div className="text-center my-6">
              <h2 className="font-display font-extrabold text-2xl text-white tracking-tight drop-shadow-md truncate max-w-xl mx-auto px-4">
                {synthMode ? "SYNTH GENERATOR" : currentTrack.title}
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {synthMode ? "Procedural Web Audio Engine" : currentTrack.artist}
              </p>
              
              <div className="flex gap-2 justify-center items-center mt-3">
                <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400">
                  {synthMode ? "LIVE SYNTH" : currentTrack.genre.toUpperCase()}
                </span>
                {synthMode && (
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 animate-pulse">
                    SYNTH WAVE
                  </span>
                )}
              </div>
            </div>

            {/* Audio visualizer container */}
            <div className="w-full h-[95px] relative rounded-2xl border border-white/5 bg-[#0a0a14]/10 overflow-hidden group/canvas">
              <VisualizerCanvas 
                analyser={analyserRef.current} 
                mode={visualizerMode} 
                color={synthMode ? "#ec4899" : currentTrack.color} 
                colorSec={synthMode ? "#06b6d4" : currentTrack.colorSec} 
              />
              
              <div className="absolute bottom-2.5 right-2.5 flex gap-1 p-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5 opacity-0 group-hover/canvas:opacity-100 transition-all duration-300">
                {[
                  { mode: "bars", icon: Activity, label: "Bars" },
                  { mode: "circle", icon: Disc, label: "Circle" },
                  { mode: "waveform", icon: SlidersHorizontal, label: "Waveform" },
                  { mode: "particles", icon: Sparkles, label: "Stars" }
                ].map(opt => {
                  const Icon = opt.icon;
                  const isAct = visualizerMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      onClick={() => setVisualizerMode(opt.mode as any)}
                      className={cn(
                        "p-1.5 rounded-md text-slate-400 hover:text-white transition-all hover:bg-white/5",
                        isAct && "bg-[var(--accent-color)] text-white shadow-[var(--accent-glow)]"
                      )}
                      title={opt.label}
                    >
                      <Icon className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          {/* Right Pane: Synced scrolling lyrics */}
          <section className={cn(
            "border-l border-white/5 bg-[#08080e]/15 flex flex-col transition-all duration-500 overflow-hidden",
            lyricsCollapsed ? "w-0 border-l-0" : lyricsExpanded ? "w-[480px]" : "w-[340px]"
          )}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-display text-[10px] font-bold tracking-widest text-slate-400 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-[var(--accent-color)] drop-shadow-[0_0_4px_var(--accent-glow)]" />
                SYNCHRONIZED LYRICS
              </h3>
              <button 
                onClick={() => setLyricsExpanded(prev => !prev)}
                className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto py-24 px-6 flex flex-col gap-5 scroll-behavior-smooth mask-lyrics relative"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)"
              }}
            >
              {synthMode ? (
                // Show mock running procedural logs
                synthLogs.map((log, idx) => {
                  const isActive = idx === activeLogIdx;
                  return (
                    <div
                      key={idx}
                      id={`synth-log-${idx}`}
                      className={cn(
                        "text-xs font-mono py-2.5 px-3.5 rounded-xl border border-transparent transition-all duration-300 select-text",
                        isActive ? "text-pink-400 border-pink-500/10 bg-pink-500/5 font-semibold text-sm scale-102 shadow-[0_0_8px_rgba(236,72,153,0.1)]" : "text-slate-600 opacity-60"
                      )}
                    >
                      {log}
                    </div>
                  );
                })
              ) : currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                currentTrack.lyrics.map((line, idx) => {
                  const activeIdx = findActiveLyricLineIndex();
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={idx}
                      id={`lyric-line-${idx}`}
                      onClick={() => handleTimelineScrub(line.time)}
                      className={cn(
                        "text-sm font-semibold text-slate-400 opacity-35 py-2.5 px-3 rounded-xl cursor-pointer hover:opacity-75 hover:bg-white/[0.01] transition-all origin-left duration-300",
                        isActive && "text-white opacity-100 text-base scale-103 font-bold border-l-2 border-[var(--accent-color)] pl-4 bg-gradient-to-r from-purple-500/10 to-transparent shadow-[0_0_15px_var(--accent-glow)]"
                      )}
                    >
                      {line.text}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center gap-3">
                  <Music className="h-8 w-8 opacity-40 animate-bounce" />
                  <p className="text-xs">Instrumental Track<br />No lyrics found</p>
                </div>
              )}
            </div>
          </section>

        </main>

        {/* Playback Control Bar */}
        <footer className="h-[90px] border-t border-white/5 bg-[#0a0a14]/60 backdrop-blur-xl grid grid-cols-[280px_1fr_280px] items-center px-6">
          
          {/* Mini Info Panel */}
          <div className="flex items-center gap-3.5 min-w-0">
            <img 
              src={synthMode ? "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100" : currentTrack.cover} 
              alt="Art" 
              className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/5 hover:scale-105 transition-transform" 
            />
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-slate-200 truncate">
                {synthMode ? "Procedural Synth Loop" : currentTrack.title}
              </span>
              <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                {synthMode ? "Audio Synthesis API" : currentTrack.artist}
              </span>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={toggleFavorite}
              className={cn("h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-white/5", favorites.has(currentTrack.id) && "text-red-500 fill-current")}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col items-center gap-1.5 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-6">
              <Button 
                size="control" 
                variant="control" 
                onClick={() => setShuffle(prev => !prev)}
                className={cn(shuffle && "text-[var(--accent-color)]")}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button size="control" variant="control" onClick={handlePrev}>
                <SkipBack className="h-4.5 w-4.5 fill-current" />
              </Button>
              <Button 
                size="play" 
                variant="play" 
                onClick={handlePlayPause}
                className="bg-white hover:bg-slate-200 shadow-xl border border-white"
              >
                {isPlaying ? <Pause className="h-5 w-5 text-black fill-current" /> : <Play className="h-5 w-5 text-black fill-current ml-0.5" />}
              </Button>
              <Button size="control" variant="control" onClick={handleNext}>
                <SkipForward className="h-4.5 w-4.5 fill-current" />
              </Button>
              <Button 
                size="control" 
                variant="control" 
                onClick={() => {
                  setRepeat(prev => prev === "all" ? "one" : prev === "one" ? "none" : "all");
                }}
                className={cn(repeat !== "none" && "text-[var(--accent-color)]")}
                title={`Repeat: ${repeat}`}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            {/* Time progress bar */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] text-slate-500 w-8 text-right font-medium">{formatTime(currentTime)}</span>
              <Slider 
                value={currentTime} 
                min={0} 
                max={duration || 180} 
                onChange={handleTimelineScrub} 
                disabled={synthMode}
                className="flex-1"
              />
              <span className="text-[10px] text-slate-500 w-8 font-medium">
                {synthMode ? "∞" : formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Utilities Controls */}
          <div className="flex items-center justify-end gap-3">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setLyricsCollapsed(prev => !prev)}
              className={cn("h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5", !lyricsCollapsed && "text-[var(--accent-color)] bg-purple-500/5")}
              title="Lyrics panel"
            >
              <AlignLeft className="h-4.5 w-4.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsEqOpen(true)}
              className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5"
              title="Equalizer presets"
            >
              <Sliders className="h-4.5 w-4.5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleMute}
                className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5"
              >
                {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : volume < 0.35 ? <Volume1 className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
              </Button>
              <Slider 
                value={isMuted ? 0 : volume} 
                min={0} 
                max={1} 
                step={0.01}
                onChange={handleVolumeChange} 
                className="w-20"
              />
            </div>
          </div>

        </footer>
      </div>

      {/* Hidden Audio Node */}
      <audio 
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
        crossOrigin="anonymous"
      />

      {/* Equalizer Modal dialog overlay */}
      <Dialog open={isEqOpen} onOpenChange={setIsEqOpen}>
        <DialogContent onClose={() => setIsEqOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-500" />
              Audio Equalizer
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 mt-4 mb-6">
            {[
              { id: "normal", label: "Normal" },
              { id: "bass", label: "Bass Boost" },
              { id: "vocal", label: "Vocal Boost" },
              { id: "electronic", label: "Electronic" }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => applyEqPreset(preset.id)}
                className={cn(
                  "py-2 px-1 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-all text-center",
                  eqPreset === preset.id && "bg-[var(--accent-color)] text-white shadow-[var(--accent-glow)] border-transparent"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center px-4 py-2 bg-white/[0.01] rounded-2xl border border-white/5">
            {[
              { label: "60Hz", index: 0 },
              { label: "230Hz", index: 1 },
              { label: "910Hz", index: 2 },
              { label: "4kHz", index: 3 },
              { label: "14kHz", index: 4 }
            ].map(band => (
              <div key={band.label} className="flex flex-col items-center gap-3">
                <span className="text-[9px] font-bold text-slate-500">{band.label}</span>
                <div className="h-32 flex items-center">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={eqGains[band.index]}
                    onChange={(e) => handleEqGainChange(band.index, parseInt(e.target.value))}
                    className="h-full cursor-pointer appearance-none rounded-lg bg-white/10 outline-none w-1 accent-purple-500"
                    style={{
                      writingMode: "vertical-lr",
                      direction: "rtl"
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 w-8 text-center">
                  {eqGains[band.index] > 0 ? `+${eqGains[band.index]}` : eqGains[band.index]}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
