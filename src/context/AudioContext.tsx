"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type AmbientTrack = "rain" | "fireplace" | "forest";

export interface TrackInfo {
  id: AmbientTrack;
  name: string;
  icon: string;
  description: string;
}

export const AMBIENT_TRACKS: TrackInfo[] = [
  { id: "rain", name: "Gentle Rain", icon: "CloudRain", description: "Soft rainfall on a cozy windowpane" },
  { id: "fireplace", name: "Warm Hearth", icon: "Flame", description: "Crackling embers and gentle flame pops" },
  { id: "forest", name: "Zen Forest", icon: "Trees", description: "Breeze whispering through pine needles" },
];

interface AudioContextType {
  isPlaying: boolean;
  currentTrack: AmbientTrack;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  selectTrack: (track: AmbientTrack) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AmbientTrack>("rain");
  const [volume, setVolumeState] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{ stop: () => void } | null>(null);

  // Initialize or resume AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, master: masterGainRef.current! };
  };

  // Sound Synthesizers (Web Audio API)
  const startRain = (ctx: AudioContext, destination: GainNode) => {
    // Pink noise buffer (soft, warm rainfall hiss)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Gentle lowpass filter for distant rain warmth
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1100, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(destination);
    whiteNoise.start();

    // Subtle droplet impulses
    let dropletTimer: NodeJS.Timeout | null = null;
    const triggerDroplet = () => {
      if (!audioCtxRef.current) return;
      try {
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const freq = 1200 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);

        dropGain.gain.setValueAtTime(0.04 * (0.5 + Math.random() * 0.5), ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

        osc.connect(dropGain);
        dropGain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } catch {}

      const nextDelay = 80 + Math.random() * 260;
      dropletTimer = setTimeout(triggerDroplet, nextDelay);
    };
    triggerDroplet();

    return {
      stop: () => {
        try {
          if (dropletTimer) clearTimeout(dropletTimer);
          whiteNoise.stop();
          whiteNoise.disconnect();
          lowpass.disconnect();
          rainGain.disconnect();
        } catch {}
      },
    };
  };

  const startFireplace = (ctx: AudioContext, destination: GainNode) => {
    // Low warm rumble (brownian filtered noise)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(260, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.9, ctx.currentTime);

    rumble.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(destination);
    rumble.start();

    // Crackle & pop generator
    let crackleTimer: NodeJS.Timeout | null = null;
    const triggerCrackle = () => {
      if (!audioCtxRef.current) return;
      try {
        const isPop = Math.random() > 0.7;
        const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * (isPop ? 0.03 : 0.008)), ctx.sampleRate);
        const data = clickBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
        }

        const clickSource = ctx.createBufferSource();
        clickSource.buffer = clickBuffer;

        const crackleFilter = ctx.createBiquadFilter();
        crackleFilter.type = isPop ? "bandpass" : "highpass";
        crackleFilter.frequency.setValueAtTime(isPop ? 450 : 2500 + Math.random() * 2000, ctx.currentTime);

        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime((isPop ? 0.35 : 0.22) * (0.6 + Math.random() * 0.4), ctx.currentTime);

        clickSource.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(destination);

        clickSource.start();
      } catch {}

      const nextDelay = 40 + Math.random() * 320;
      crackleTimer = setTimeout(triggerCrackle, nextDelay);
    };
    triggerCrackle();

    return {
      stop: () => {
        try {
          if (crackleTimer) clearTimeout(crackleTimer);
          rumble.stop();
          rumble.disconnect();
          lowpass.disconnect();
          rumbleGain.disconnect();
        } catch {}
      },
    };
  };

  const startForest = (ctx: AudioContext, destination: GainNode) => {
    // Gentle rustling wind buffer
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      output[i] = (b0 + b1) * 0.3;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    // Resonant bandpass filter modulated by slow LFO (swaying canopy)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(420, ctx.currentTime);
    bandpass.Q.setValueAtTime(2.2, ctx.currentTime);

    // LFO for breeze swelling
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5s gentle swell period
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.85, ctx.currentTime);

    windSource.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(destination);

    windSource.start();
    lfo.start();

    return {
      stop: () => {
        try {
          windSource.stop();
          lfo.stop();
          windSource.disconnect();
          bandpass.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          windGain.disconnect();
        } catch {}
      },
    };
  };

  // Playback control
  const startTrack = (track: AmbientTrack) => {
    if (activeNodesRef.current) {
      activeNodesRef.current.stop();
      activeNodesRef.current = null;
    }

    const { ctx, master } = getAudioContext();

    if (track === "rain") {
      activeNodesRef.current = startRain(ctx, master);
    } else if (track === "fireplace") {
      activeNodesRef.current = startFireplace(ctx, master);
    } else if (track === "forest") {
      activeNodesRef.current = startForest(ctx, master);
    }
  };

  const stopAudio = () => {
    if (activeNodesRef.current) {
      activeNodesRef.current.stop();
      activeNodesRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startTrack(currentTrack);
      setIsPlaying(true);
    }
  };

  const selectTrack = (track: AmbientTrack) => {
    setCurrentTrack(track);
    if (isPlaying) {
      startTrack(track);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : clamped,
        audioCtxRef.current.currentTime
      );
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        nextMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        volume,
        isMuted,
        togglePlay,
        selectTrack,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
