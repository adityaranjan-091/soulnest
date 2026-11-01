"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Feather,
  Clock,
  Send,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createPostAction } from "@/actions/posts";
import { getNests } from "@/actions/nests";
import { MoodTag, PostStatus } from "@prisma/client";

interface NestOption {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export default function WritePage() {
  const router = useRouter();
  const { user, dbUser, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [moodTag, setMoodTag] = useState<MoodTag>(MoodTag.REFLECTIVE);
  const [nestId, setNestId] = useState<string>("");
  const [nests, setNests] = useState<NestOption[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch available nests
  useEffect(() => {
    async function loadNests() {
      try {
        const fetched = await getNests();
        setNests(fetched);
        if (fetched.length > 0) {
          setNestId(fetched[0].id);
        }
      } catch (err) {
        console.error("Failed to load nests:", err);
      }
    }
    loadNests();
  }, []);

  // Calculate live word count & reading time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async (status: PostStatus) => {
    if (!user || !dbUser) {
      setErrorMessage("Please sign in to publish your story.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Every deep thought deserves a title. Please provide one.");
      return;
    }

    if (content.trim().length < 20) {
      setErrorMessage("Please share a bit more of your reflection (at least a few sentences).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await createPostAction({
      authorId: dbUser.id,
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      moodTag,
      nestId: nestId || undefined,
      status,
    });

    setIsSubmitting(false);

    if (!result.success || !result.post) {
      setErrorMessage(result.error || "Failed to preserve your story.");
    } else {
      if (status === PostStatus.PUBLISHED) {
        router.push(`/story/${result.post.slug}`);
      } else {
        router.push("/soulbook");
      }
    }
  };

  // Auth gate notice
  if (!loading && !user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] mx-auto flex items-center justify-center mb-5">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
          Enter the Sanctuary to Write
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          SoulNest is a quiet home for slow narratives and digital gardening. Sign in to cultivate your personal essays and plant your stories.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login?next=/write"
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-transform hover:scale-102"
          >
            Sign In
          </Link>
          <Link
            href="/register?next=/write"
            className="px-5 py-2.5 rounded-full text-xs font-semibold border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            Create an Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editor Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
            <Feather className="w-4 h-4 text-[var(--accent-sage)]" />
            Writing Sanctuary
          </span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            {previewMode ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{previewMode ? "Edit" : "Preview"}</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(PostStatus.DRAFT)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>

          {/* Publish Story CTA */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(PostStatus.PUBLISHED)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-[var(--accent-terracotta-subtle)] p-4 text-xs text-[var(--text-primary)] border border-[var(--accent-terracotta)]/25">
          <AlertCircle className="w-4 h-4 text-[var(--accent-terracotta)] shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Editor Body */}
      {previewMode ? (
        <article className="prose max-w-none pt-4 animate-in fade-in-50">
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]">
              {moodTag}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
            {title || "Untitled Story"}
          </h1>
          <div className="font-serif text-lg leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
            {content || "Nothing written yet. Switch back to Edit to begin planting words."}
          </div>
        </article>
      ) : (
        <div className="space-y-6">
          {/* Story Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your story..."
            className="w-full font-serif text-3xl sm:text-4xl font-semibold bg-transparent border-none placeholder-[var(--text-muted)] focus:outline-none text-[var(--text-primary)]"
          />

          {/* Metadata selectors: Mood & Nest */}
          <div className="flex flex-wrap items-center gap-4 py-3 border-y border-[var(--border-subtle)] text-xs">
            {/* Mood Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[var(--text-muted)] font-medium mr-1">Mood:</span>
              {[
                { tag: MoodTag.REFLECTIVE, label: "Reflective" },
                { tag: MoodTag.UPLIFTING, label: "Uplifting" },
                { tag: MoodTag.VULNERABLE, label: "Vulnerable" },
                { tag: MoodTag.DEEP_DIVE, label: "Deep Dive" },
              ].map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMoodTag(tag)}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    moodTag === tag
                      ? "bg-[var(--accent-sage)] text-white shadow-xs"
                      : "bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Nest Selector */}
            {nests.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[var(--text-muted)] font-medium">Nest:</span>
                <select
                  value={nestId}
                  onChange={(e) => setNestId(e.target.value)}
                  className="px-3 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  {nests.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.iconUrl} {n.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cover image & excerpt optional helpers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Cover image URL (optional)"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt or hook (optional)"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>

          {/* Story Body Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="Step into the clearing. Begin typing your truth, your notes on quiet living, or the lessons you uncovered slowly..."
            className="w-full font-serif text-lg leading-relaxed bg-transparent border-none placeholder-[var(--text-muted)] focus:outline-none text-[var(--text-primary)] resize-y min-h-[300px]"
          />
        </div>
      )}

      {/* Zen writing footnote */}
      <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-serif italic">
        <span>Write without rushing. Stories take the time they need.</span>
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
      </div>
    </main>
  );
}

