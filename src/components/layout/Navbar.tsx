"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Feather,
  Compass,
  Sparkles,
  BookMarked,
  PenLine,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { AmbientPlayer } from "./AmbientPlayer";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, dbUser, loading, logout } = useAuth();

  const navLinks = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Nests", href: "/nests", icon: Sparkles },
    { label: "Soulbook", href: "/soulbook", icon: BookMarked },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = dbUser?.displayName || user?.displayName || "Kind Soul";
  const userInitial = displayName.charAt(0).toUpperCase();

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

          {/* Right Controls: Ambient Player + Theme Switcher + Auth / Write */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Zen Ambient Sound Player */}
            <AmbientPlayer />

            {/* 3-Way Theme Switcher */}
            <ThemeSwitcher />

            {/* Auth State & Write Button */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative flex items-center gap-2" ref={dropdownRef}>
                    {/* Write Story CTA Button */}
                    <Link
                      href="/write"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-all duration-200 hover:shadow-sm hover:scale-102 cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Write</span>
                    </Link>

                    {/* User Profile Pill / Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all cursor-pointer"
                      aria-expanded={userDropdownOpen}
                    >
                      {dbUser?.avatarUrl || user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dbUser?.avatarUrl || user.photoURL || ""}
                          alt={displayName}
                          className="w-6 h-6 rounded-full object-cover border border-[var(--border-subtle)]"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center text-xs font-semibold">
                          {userInitial}
                        </div>
                      )}
                      <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <ChevronDown className="hidden sm:block w-3 h-3 text-[var(--text-muted)]" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {dbUser?.username ? `@${dbUser.username}` : user.email}
                          </p>
                        </div>

                        <Link
                          href="/soulbook"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                          <span>My Soulbook</span>
                        </Link>

                        <Link
                          href="/write"
                          onClick={() => setUserDropdownOpen(false)}
                          className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          <PenLine className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                          <span>Write Story</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta-subtle)] transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-all duration-200 hover:scale-102 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </Link>
                  </div>
                )}
              </>
            )}

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
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-serif italic text-[var(--text-muted)] truncate max-w-[150px]">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta-subtle)]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full justify-end">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Join Sanctuary</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
