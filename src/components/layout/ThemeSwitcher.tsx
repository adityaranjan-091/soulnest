"use client";

import React from "react";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; label: string; icon: React.ReactNode; colorPreview: string }[] = [
    {
      id: "light",
      label: "Light",
      icon: <Sun className="w-3.5 h-3.5" />,
      colorPreview: "#FAF8F5",
    },
    {
      id: "sepia",
      label: "Sepia",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      colorPreview: "#F4ECD8",
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon className="w-3.5 h-3.5" />,
      colorPreview: "#1C1917",
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className="inline-flex items-center p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xs transition-colors"
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            onClick={() => setTheme(t.id)}
            className={`
              relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 select-none
              ${
                isActive
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--border-hover)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }
            `}
          >
            <span
              className={`transition-transform duration-200 ${
                isActive ? "scale-110 text-[var(--accent-sage)]" : ""
              }`}
            >
              {t.icon}
            </span>
            <span className="hidden sm:inline capitalize">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
