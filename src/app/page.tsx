import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Bookmark,
  Feather,
  Clock,
  Compass,
  ArrowRight,
  Highlighter,
} from "lucide-react";
import { getFeedPosts } from "@/actions/posts";
import { getNests } from "@/actions/nests";

const SAMPLE_STORIES = [
  {
    id: "sample-1",
    title: "The Architecture of Quiet Evenings",
    slug: "the-architecture-of-quiet-evenings",
    excerpt:
      "We spend our daylight chasing certainty, but it is in the amber hush of dusk that our truest thoughts dare to step into the clearing.",
    author: {
      displayName: "Elena Rostova",
      username: "elena",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    nest: {
      name: "Mindful Solitude",
      slug: "mindful-solitude",
    },
    moodTag: "REFLECTIVE",
    readingTime: 5,
    highlightSnippet:
      "Solitude is not the absence of people, but the presence of oneself.",
    _count: {
      reactions: 42,
      comments: 18,
      highlights: 25,
    },
  },
  {
    id: "sample-2",
    title: "Learning to Forgive My Former Ambitions",
    slug: "learning-to-forgive-former-ambitions",
    excerpt:
      "In my twenties, success was a skyscraper of accomplishments. At thirty-four, I discovered that peace is a garden that refuses to be rushed.",
    author: {
      displayName: "Marcus Vance",
      username: "marcus",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    nest: {
      name: "Quiet Ambition",
      slug: "quiet-ambition",
    },
    moodTag: "VULNERABLE",
    readingTime: 7,
    highlightSnippet:
      "The hardest race is the one against a version of yourself you no longer wish to be.",
    _count: {
      reactions: 84,
      comments: 32,
      highlights: 47,
    },
  },
  {
    id: "sample-3",
    title: "Notes on Cultivating a Digital Garden",
    slug: "notes-on-digital-gardening",
    excerpt:
      "Why write ephemeral streams when we can cultivate slow, evergreen ideas that cross-pollinate across years of mindful curiosity?",
    author: {
      displayName: "Aria Chen",
      username: "aria",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    },
    nest: {
      name: "Digital Gardens",
      slug: "digital-gardens",
    },
    moodTag: "DEEP_DIVE",
    readingTime: 9,
    highlightSnippet:
      "A garden is never finished; it is simply tended with patience.",
    _count: {
      reactions: 65,
      comments: 29,
      highlights: 52,
    },
  },
];

export default async function Home() {
  const [dbPosts, dbNests] = await Promise.all([
    getFeedPosts(),
    getNests(),
  ]);

  const stories = dbPosts.length > 0 ? dbPosts : SAMPLE_STORIES;

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
          <Link
            href="/nests"
            className="text-xs text-[var(--accent-sage)] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Nests</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dbNests.map((nest) => (
            <Link
              key={nest.slug}
              href={`/nests/${nest.slug}`}
              className="group p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-sage)]/30 hover:shadow-xs transition-all block"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{nest.iconUrl || "🌿"}</span>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors">
                    {nest.name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    {nest._count?.posts || 0} stories
                  </p>
                </div>
              </div>
            </Link>
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
          {stories.map((story) => (
            <article
              key={story.id}
              className="group relative p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-sage)]/30 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <Link href={`/story/${story.slug}`} className="block">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] mb-4">
                  <div className="flex items-center gap-2.5">
                    {story.author.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={story.author.avatarUrl}
                        alt={story.author.displayName}
                        className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center text-xs font-semibold">
                        {story.author.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-[var(--text-secondary)]">
                      {story.author.displayName}
                    </span>
                    {story.nest && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[11px]">
                          {story.nest.name}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]">
                      {story.moodTag.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 font-sans text-[11px]">
                      <Clock className="w-3 h-3" />
                      {story.readingTime} min read
                    </span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors mb-3 leading-snug">
                  {story.title}
                </h3>

                {story.excerpt && (
                  <p className="font-serif text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed mb-5">
                    {story.excerpt}
                  </p>
                )}

                {/* Soulbook Highlight Snippet Callout (if available) */}
                {"highlightSnippet" in story && (
                  <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-secondary)]/70 border-l-3 border-[var(--accent-terracotta)] text-xs font-serif italic text-[var(--text-primary)] flex items-start gap-3">
                    <Highlighter className="w-4 h-4 text-[var(--accent-terracotta)] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold not-italic font-sans text-[10px] uppercase tracking-wider text-[var(--accent-terracotta)] mb-0.5">
                        Resonant Highlight
                      </span>
                      &ldquo;{(story as typeof SAMPLE_STORIES[0]).highlightSnippet}&rdquo;
                    </div>
                  </div>
                )}

                {/* Soulful Reactions Bar & Read link */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-[var(--accent-terracotta)]" />
                      {story._count.reactions} reactions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                      {story._count.highlights} highlights
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-sage)] group-hover:translate-x-0.5 transition-transform">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
