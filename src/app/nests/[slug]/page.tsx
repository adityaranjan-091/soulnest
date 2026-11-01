import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Feather, Heart, PenLine } from "lucide-react";
import { getNestBySlug } from "@/actions/nests";

interface NestPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NestPageProps) {
  const { slug } = await params;
  const nest = await getNestBySlug(slug);
  if (!nest) return { title: "Nest Not Found — SoulNest" };
  return {
    title: `${nest.name} — SoulNest`,
    description: nest.description || `Read stories in the ${nest.name} nest.`,
  };
}

export default async function NestDetailPage({ params }: NestPageProps) {
  const { slug } = await params;
  const nest = await getNestBySlug(slug);

  if (!nest) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/nests"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Nests</span>
      </Link>

      {/* Nest Header Banner */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 p-6 sm:p-10 mb-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-3xl shadow-xs">
              {nest.iconUrl || "🌿"}
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                {nest.name}
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {nest.posts.length} {nest.posts.length === 1 ? "story" : "stories"} gathered in this nest
              </p>
            </div>
          </div>

          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs transition-transform hover:scale-102 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write in this Nest</span>
          </Link>
        </div>

        {nest.description && (
          <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
            {nest.description}
          </p>
        )}
      </div>

      {/* Stories list */}
      <section className="space-y-6">
        <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
          Stories in this sanctuary
        </h2>

        {nest.posts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-secondary)]/30">
            <Feather className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              The nest is quiet for now
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
              Be the first to plant words and share a slow reflection in this corner of the garden.
            </p>
            <Link
              href="/write"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Plant the first story</span>
            </Link>
          </div>
        ) : (
          nest.posts.map((post) => (
            <article
              key={post.id}
              className="group p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] shadow-xs hover:shadow-md transition-all duration-200"
            >
              <Link href={`/story/${post.slug}`} className="block">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-secondary)]">
                      {post.author.displayName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min read
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]">
                    {post.moodTag}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-[var(--accent-terracotta)]" />
                    {post._count.reactions} reactions
                  </span>
                  <span>{post._count.comments} reflections</span>
                </div>
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

