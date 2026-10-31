"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Brain,
  Bookmark,
  Feather,
  Clock,
  Compass,
  ArrowRight,
  Highlighter,
} from "lucide-react";

export default function Home() {
  // Demo interaction state for reactions
  const [reactions, setReactions] = useState<{ [key: string]: boolean }>({});

  const toggleReaction = (id: string) => {
    setReactions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleStories = [
    {
      id: "1",
      title: "The Architecture of Quiet Evenings",
      slug: "architecture-of-quiet-evenings",
      excerpt:
        "We spend our daylight chasing certainty, but it is in the amber hush of dusk that our truest thoughts dare to step into the clearing.",
      author: {
        name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      },
      nest: "Mindful Solitude",
      mood: "REFLECTIVE",
      moodColor: "var(--accent-sage)",
      readingTime: "5 min read",
      highlightSnippet:
        "Solitude is not the absence of people, but the presence of oneself.",
      stats: {
        touched: 42,
        think: 28,
        bookmarks: 19,
      },
    },
    {
      id: "2",
      title: "Learning to Forgive My Former Ambitions",
      slug: "learning-to-forgive-former-ambitions",
      excerpt:
        "In my twenties, success was a skyscraper of accomplishments. At thirty-four, I discovered that peace is a garden that refuses to be rushed.",
      author: {
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      nest: "Quiet Ambition",
      mood: "VULNERABLE",
      moodColor: "var(--accent-terracotta)",
      readingTime: "7 min read",
      highlightSnippet:
        "The hardest race is the one against a version of yourself you no longer wish to be.",
      stats: {
        touched: 84,
        think: 56,
        bookmarks: 37,
      },
    },
    {
      id: "3",
      title: "Notes on Cultivating a Digital Garden",
      slug: "notes-on-digital-gardening",
      excerpt:
        "Why write ephemeral streams when we can cultivate slow, evergreen ideas that cross-pollinate across years of mindful curiosity?",
      author: {
        name: "Aria Chen",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      },
      nest: "Digital Gardens",
      mood: "DEEP_DIVE",
      moodColor: "var(--accent-amber)",
      readingTime: "9 min read",
      highlightSnippet:
        "A garden is never finished; it is simply tended with patience.",
      stats: {
        touched: 65,
        think: 91,
        bookmarks: 48,
      },
    },
  ];

  const nests = [
    { name: "Mindful Solitude", count: "128 stories", icon: "🌱" },
    { name: "Quiet Ambition", count: "94 stories", icon: "🕯️" },
    { name: "Digital Gardens", count: "210 notes", icon: "🌿" },
    { name: "Vulnerable Truths", count: "86 essays", icon: "🍂" },
  ];

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Sanctuary Intro */}
      <section className="text-center space-y-6 pt-4 pb-8 border-b border-[var(--border-subtle)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Sanctuary for Mindful Writing</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl mx-auto leading-tight">
          Where deep stories find a quiet home.
        </h1>

        <p className="font-serif text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto italic leading-relaxed">
          Escape the noise of social feeds. Read slow, intimate essays, listen to ambient soundscapes, and save resonant snippets to your personal Soulbook.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-sm hover:scale-102 transition-all cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>Begin Writing</span>
          </Link>
          <a
            href="#featured"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Explore Stories</span>
          </a>
        </div>
      </section>

      {/* Topic Nests Chips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)] font-sans">
            Explore Topic Nests
          </h3>
          <span className="text-xs text-[var(--accent-sage)] hover:underline cursor-pointer">
            View All Nests →
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {nests.map((nest) => (
            <div
              key={nest.name}
              className="group p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{nest.icon}</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors">
                    {nest.name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    {nest.count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Stories Stream */}
      <section id="featured" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Freshly Tended Stories
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-serif italic">
            Curated with human care
          </span>
        </div>

        <div className="space-y-8">
          {sampleStories.map((story) => {
            const touchedKey = `${story.id}-touched`;
            const thinkKey = `${story.id}-think`;
            const bookKey = `${story.id}-book`;

            return (
              <article
                key={story.id}
                className="group relative p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] mb-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={story.author.avatar}
                      alt={story.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)]"
                    />
                    <span className="font-medium text-[var(--text-secondary)]">
                      {story.author.name}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[11px]">
                      {story.nest}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: story.moodColor,
                      }}
                    >
                      {story.mood.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 font-sans text-[11px]">
                      <Clock className="w-3 h-3" />
                      {story.readingTime}
                    </span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors mb-3 leading-snug">
                  {story.title}
                </h3>

                <p className="font-serif text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed mb-5">
                  {story.excerpt}
                </p>

                {/* Soulbook Highlight Snippet Callout */}
                <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-secondary)]/70 border-l-3 border-[var(--accent-terracotta)] text-xs font-serif italic text-[var(--text-primary)] flex items-start gap-3">
                  <Highlighter className="w-4 h-4 text-[var(--accent-terracotta)] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold not-italic font-sans text-[10px] uppercase tracking-wider text-[var(--accent-terracotta)] mb-0.5">
                      Resonant Highlight
                    </span>
                    &ldquo;{story.highlightSnippet}&rdquo;
                  </div>
                </div>

                {/* Soulful Reactions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    {/* Touched Soul */}
                    <button
                      type="button"
                      onClick={() => toggleReaction(touchedKey)}
                      aria-label="Touched my soul"
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all
                        ${
                          reactions[touchedKey]
                            ? "bg-[var(--accent-terracotta-subtle)] text-[var(--accent-terracotta)] border border-[var(--accent-terracotta)] font-semibold"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        }
                      `}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          reactions[touchedKey] ? "fill-current" : ""
                        }`}
                      />
                      <span>Touched Soul</span>
                      <span className="font-mono text-[11px] opacity-80">
                        {story.stats.touched + (reactions[touchedKey] ? 1 : 0)}
                      </span>
                    </button>

                    {/* Made Me Think */}
                    <button
                      type="button"
                      onClick={() => toggleReaction(thinkKey)}
                      aria-label="Made me think"
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all
                        ${
                          reactions[thinkKey]
                            ? "bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border border-[var(--accent-sage)] font-semibold"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        }
                      `}
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Made Me Think</span>
                      <span className="font-mono text-[11px] opacity-80">
                        {story.stats.think + (reactions[thinkKey] ? 1 : 0)}
                      </span>
                    </button>

                    {/* Rainy Day Bookmark */}
                    <button
                      type="button"
                      onClick={() => toggleReaction(bookKey)}
                      aria-label="Rainy day bookmark"
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all
                        ${
                          reactions[bookKey]
                            ? "bg-amber-500/15 text-[var(--accent-amber)] border border-[var(--accent-amber)] font-semibold"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        }
                      `}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          reactions[bookKey] ? "fill-current" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">Rainy Day</span>
                      <span className="font-mono text-[11px] opacity-80">
                        {story.stats.bookmarks + (reactions[bookKey] ? 1 : 0)}
                      </span>
                    </button>
                  </div>

                  {/* Read story link */}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-sage)] group-hover:translate-x-0.5 transition-transform">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
