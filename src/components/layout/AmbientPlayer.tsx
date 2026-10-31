"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CloudRain,
  Flame,
  Trees,
  ChevronDown,
} from "lucide-react";
import { useAudio, AmbientTrack, AMBIENT_TRACKS } from "@/context/AudioContext";

export function AmbientPlayer() {
  const {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    togglePlay,
    selectTrack,
    setVolume,
    toggleMute,
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTrackIcon = (id: AmbientTrack) => {
    switch (id) {
      case "rain":
        return <CloudRain className="w-3.5 h-3.5" />;
      case "fireplace":
        return <Flame className="w-3.5 h-3.5 text-[var(--accent-terracotta)]" />;
      case "forest":
        return <Trees className="w-3.5 h-3.5 text-[var(--accent-sage)]" />;
    }
  };

  const currentTrackMeta = AMBIENT_TRACKS.find((t) => t.id === currentTrack);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact zen trigger pill */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xs transition-all hover:border-[var(--border-hover)]">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
          className={`
            relative flex items-center justify-center w-7 h-7 rounded-full cursor-pointer transition-all duration-300
            ${
              isPlaying
                ? "bg-[var(--accent-sage)] text-white shadow-xs scale-102"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.25" />
          )}
        </button>

        {/* Current sound indicator + dropdown toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select ambient sound track and volume"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer select-none"
        >
          <span className="flex items-center gap-1">
            {getTrackIcon(currentTrack)}
            <span className="hidden md:inline font-sans">
              {currentTrackMeta?.name || "Ambient"}
            </span>
          </span>

          {/* Animated sound wave bars when active */}
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-3 px-0.5" aria-hidden="true">
              <span className="w-0.5 bg-[var(--accent-sage)] rounded-full animate-[soundWave_0.8s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-[var(--accent-sage)] rounded-full animate-[soundWave_1.1s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 bg-[var(--accent-sage)] rounded-full animate-[soundWave_0.9s_ease-in-out_infinite_0.4s]" />
            </span>
          )}

          <ChevronDown
            className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Zen Audio Control Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Ambient sound controls"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-4 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Zen Ambient Audio
              </h4>
              <p className="text-xs text-[var(--text-secondary)] font-serif italic mt-0.5">
                Stories read deeper with soft sound
              </p>
            </div>
            <button
              type="button"
              onClick={togglePlay}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all
                ${
                  isPlaying
                    ? "bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border border-[var(--accent-sage)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }
              `}
            >
              {isPlaying ? "Playing" : "Start"}
            </button>
          </div>

          {/* Track selector options */}
          <div className="py-3 space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
              Soundscapes
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {AMBIENT_TRACKS.map((t) => {
                const isSelected = currentTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTrack(t.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs cursor-pointer transition-all
                      ${
                        isSelected
                          ? "bg-[var(--bg-secondary)] border border-[var(--accent-sage)] text-[var(--text-primary)] font-medium shadow-2xs"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? "bg-[var(--bg-card)] shadow-xs"
                            : "bg-[var(--bg-secondary)]"
                        }`}
                      >
                        {getTrackIcon(t.id)}
                      </div>
                      <div>
                        <div className="font-sans font-medium">{t.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-serif">
                          {t.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume slider control */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Volume
              </span>
              <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[var(--accent-terracotta)]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Ambient volume"
                className="w-full h-1.5 rounded-full appearance-none bg-[var(--border-strong)] accent-[var(--accent-sage)] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
