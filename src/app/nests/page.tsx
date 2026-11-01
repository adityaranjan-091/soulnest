import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { getNests } from "@/actions/nests";

export const metadata = {
  title: "Sanctuary Nests — SoulNest",
  description: "Browse thematic nests where slow stories and mindful reflections gather.",
};

export default async function NestsPage() {
  const nests = await getNests();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] shadow-xs mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          Thematic Nests
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Sanctuaries within the sanctuary. Explore curated spaces where stories of quiet solitude, slow ambition, and evergreen gardens find their kinship.
        </p>
      </div>

      {/* Grid of Nests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nests.map((nest) => (
          <Link
            key={nest.slug}
            href={`/nests/${nest.slug}`}
            className="group block p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] shadow-xs hover:shadow-md hover:border-[var(--accent-sage)]/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-2xl shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  {nest.iconUrl || "🌿"}
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors">
                    {nest.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{nest._count?.posts || 0} stories published</span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-sage)] group-hover:border-[var(--accent-sage)] transition-all">
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {nest.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
