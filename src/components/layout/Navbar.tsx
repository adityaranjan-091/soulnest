"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Feather,
  Compass,
  Sparkles,
  BookMarked,
  PenLine,
  Menu,
  X,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { AmbientPlayer } from "./AmbientPlayer";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Nests", href: "/nests", icon: Sparkles },
    { label: "Soulbook", href: "/soulbook", icon: BookMarked },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-decoration-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Feather className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-terracotta)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)] transition-colors">
                  SoulNest
                </span>
                <span className="hidden sm:block text-[10px] tracking-widest uppercase font-sans text-[var(--text-muted)] -mt-1">
                  Digital Sanctuary
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Ambient Player + Theme Switcher + CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Zen Ambient Sound Player */}
            <AmbientPlayer />

            {/* 3-Way Theme Switcher */}
            <ThemeSwitcher />

            {/* Write Story CTA Button */}
            <Link
              href="/write"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-all duration-200 hover:shadow-sm hover:scale-102 cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <Icon className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-serif italic">
              Where deep stories find a home
            </span>
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write Story</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
