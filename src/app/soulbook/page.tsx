"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookMarked,
  Highlighter,
  Feather,
  Clock,
  Trash2,
  Lock,
  ArrowRight,
  Sparkles,
  PenLine,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserBookmarks } from "@/actions/reactions";
import { getUserHighlights, deleteHighlightAction } from "@/actions/highlights";
import { getUserStories } from "@/actions/posts";

type SoulbookTab = "bookmarks" | "highlights" | "my-stories";

interface SavedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  readingTime: number;
  moodTag: string;
  author: {
    displayName: string;
    username: string;
  };
  nest?: {
    name: string;
    slug: string;
  } | null;
}

interface SavedHighlight {
  id: string;
  text: string;
  note?: string | null;
  createdAt: Date;
  post: {
    id: string;
    title: string;
    slug: string;
    author: {
      displayName: string;
      username: string;
    };
  };
}

interface MyStory {
  id: string;
  title: string;
  slug: string;
  status: string;
  readingTime: number;
  moodTag: string;
  createdAt: Date;
  nest?: {
    name: string;
  } | null;
}

export default function SoulbookPage() {
  const { user, dbUser, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<SoulbookTab>("bookmarks");
  const [bookmarks, setBookmarks] = useState<SavedPost[]>([]);
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);
  const [myStories, setMyStories] = useState<MyStory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!dbUser) return;
      setIsLoadingData(true);
      try {
        const [savedB, savedH, stories] = await Promise.all([
          getUserBookmarks(dbUser.id),
          getUserHighlights(dbUser.id),
          getUserStories(dbUser.id),
        ]);
        setBookmarks(savedB as SavedPost[]);
        setHighlights(savedH as SavedHighlight[]);
        setMyStories(stories as MyStory[]);
      } catch (err) {
        console.error("Failed to load soulbook data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (dbUser) {
      loadData();
    }
  }, [dbUser]);

  const handleDeleteHighlight = async (highlightId: string) => {
    if (!dbUser) return;
    const res = await deleteHighlightAction(highlightId, dbUser.id);
    if (res.success) {
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    }
  };

  // Auth gate
  if (!loading && !user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] mx-auto flex items-center justify-center mb-5">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
          Open Your Personal Soulbook
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          Your Soulbook is your private treasury of saved highlights, rainy day bookmarks, and essays you have written. Sign in to turn the pages.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login?next=/soulbook"
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-transform hover:scale-102"
          >
            Sign In
          </Link>
          <Link
            href="/register?next=/soulbook"
            className="px-5 py-2.5 rounded-full text-xs font-semibold border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            Create an Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Soulbook Header */}
      <div className="text-center sm:text-left mb-10">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[var(--accent-sage)] uppercase tracking-wider mb-2">
          <BookMarked className="w-4 h-4" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          {dbUser?.displayName || "My"} Soulbook
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          Where your bookmarked narratives, saved quotes, and personal stories rest.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 mb-8 overflow-x-auto">
        {[
          { id: "bookmarks", label: "Saved Stories", count: bookmarks.length, icon: BookMarked },
          { id: "highlights", label: "Highlights", count: highlights.length, icon: Highlighter },
          { id: "my-stories", label: "My Stories", count: myStories.length, icon: Feather },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SoulbookTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--accent-sage)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20" : "bg-[var(--border-subtle)]"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Saved Stories */}
      {activeTab === "bookmarks" && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-secondary)]/30">
              <BookMarked className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                No saved stories yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
                Whenever you read an essay you want to return to on a quiet evening, click the Rainy Day Bookmark button.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white"
              >
                <span>Explore Stories</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            bookmarks.map((story) => (
              <div
                key={story.id}
                className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                  <span>{story.author.displayName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {story.readingTime} min
                  </span>
                </div>
                <Link
                  href={`/story/${story.slug}`}
                  className="font-serif text-xl font-semibold text-[var(--text-primary)] hover:text-[var(--accent-sage)] transition-colors block"
                >
                  {story.title}
                </Link>
                {story.excerpt && (
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2">
                    {story.excerpt}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Cherished Highlights */}
      {activeTab === "highlights" && (
        <div className="space-y-4">
          {highlights.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-secondary)]/30">
              <Highlighter className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                No passages highlighted yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
                Select any text while reading an essay to save quotes and personal annotations directly into your Soulbook.
              </p>
            </div>
          ) : (
            highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 relative group"
              >
                <blockquote className="font-serif text-base sm:text-lg italic text-[var(--text-primary)] border-l-2 border-[var(--accent-amber)] pl-4 leading-relaxed">
                  &ldquo;{highlight.text}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
                  <Link
                    href={`/story/${highlight.post.slug}`}
                    className="hover:text-[var(--accent-sage)] transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>From {highlight.post.title}</span>
                    <span>by {highlight.post.author.displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-terracotta)] transition-colors cursor-pointer"
                    aria-label="Remove highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: My Stories */}
      {activeTab === "my-stories" && (
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <Link
              href="/write"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-transform hover:scale-102"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write New Story</span>
            </Link>
          </div>

          {myStories.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-secondary)]/30">
              <Feather className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                You haven&apos;t planted a story yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
                Begin your narrative journey. Write an essay, note a breakthrough, or share a quiet thought.
              </p>
            </div>
          ) : (
            myStories.map((story) => (
              <div
                key={story.id}
                className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        story.status === "PUBLISHED"
                          ? "bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {story.status}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {story.readingTime} min read
                    </span>
                  </div>
                  <Link
                    href={`/story/${story.slug}`}
                    className="font-serif text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-sage)]"
                  >
                    {story.title}
                  </Link>
                </div>
                <Link
                  href={`/story/${story.slug}`}
                  className="p-2 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
