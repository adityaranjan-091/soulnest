import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Sparkles } from "lucide-react";
import { getPostBySlug } from "@/actions/posts";
import { ReactionsBar } from "@/components/story/ReactionsBar";
import { HighlightPopover } from "@/components/story/HighlightPopover";
import { CommentsSection } from "@/components/story/CommentsSection";
import { ReactionType } from "@prisma/client";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Story Not Found — SoulNest" };
  return {
    title: `${post.title} — SoulNest`,
    description: post.excerpt || `Read "${post.title}" by ${post.author.displayName} on SoulNest.`,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Calculate reaction counts
  const reactionCounts = {
    touched: post.reactions.filter((r) => r.type === ReactionType.TOUCHED_SOUL).length,
    think: post.reactions.filter((r) => r.type === ReactionType.MADE_ME_THINK).length,
    bookmark: post.reactions.filter((r) => r.type === ReactionType.RAINY_DAY_BOOKMARK).length,
  };

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unpublished draft";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Floating Highlight Popover for text selection */}
      <HighlightPopover postId={post.id} />

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Garden</span>
      </Link>

      {/* Story Header */}
      <header className="mb-10 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
          {post.nest && (
            <Link
              href={`/nests/${post.nest.slug}`}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors flex items-center gap-1.5"
            >
              <span>{post.nest.iconUrl || "🌿"}</span>
              <span>{post.nest.name}</span>
            </Link>
          )}
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]">
            {post.moodTag}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
          {post.title}
        </h1>

        {/* Author meta row */}
        <div className="flex items-center justify-center sm:justify-start gap-3.5 mt-6 pt-6 border-t border-[var(--border-subtle)]">
          {post.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center text-sm font-semibold">
              {post.author.displayName.charAt(0)}
            </div>
          )}
          <div className="text-left text-xs">
            <p className="font-semibold text-[var(--text-primary)]">
              {post.author.displayName}
            </p>
            <div className="flex items-center gap-2 text-[var(--text-muted)] mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image (if present) */}
      {post.coverImageUrl && (
        <div className="mb-10 rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      {/* Story Body */}
      <article className="prose max-w-none text-[var(--text-primary)] font-serif text-lg sm:text-xl leading-[1.8] sm:leading-[1.9] select-text">
        <div className="whitespace-pre-wrap">{post.contentHtml}</div>
      </article>

      {/* Soulful Reaction Bar */}
      <ReactionsBar
        postId={post.id}
        initialCounts={reactionCounts}
        initialUserReactions={{ touched: false, think: false, bookmark: false }}
      />

      {/* Author Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-14 h-14 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center text-xl font-serif font-bold shrink-0">
          {post.author.displayName.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-serif text-lg font-semibold text-[var(--text-primary)]">
            Written by {post.author.displayName}
          </p>
          <p className="text-xs text-[var(--text-muted)]">@{post.author.username}</p>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {post.author.bio ||
              "A quiet observer and fellow traveler tending words in the SoulNest digital garden."}
          </p>
        </div>
      </div>

      {/* Mindful Comments / Reflections */}
      <CommentsSection postId={post.id} initialComments={post.comments} />
    </main>
  );
}
