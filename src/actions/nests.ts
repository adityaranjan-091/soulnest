"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const DEFAULT_NESTS = [
  {
    name: "Mindful Solitude",
    slug: "mindful-solitude",
    description: "Reflections on being comfortable in stillness, gentle silence, and finding home within oneself.",
    iconUrl: "🌱",
  },
  {
    name: "Quiet Ambition",
    slug: "quiet-ambition",
    description: "Cultivating purpose and deep work without the frantic noise of modern hustle culture.",
    iconUrl: "🕯️",
  },
  {
    name: "Digital Gardens",
    slug: "digital-gardens",
    description: "Evergreen thinking, interlinked notes, and slow ideas tended with patience over years.",
    iconUrl: "🌿",
  },
  {
    name: "Vulnerable Truths",
    slug: "vulnerable-truths",
    description: "Unfiltered human narratives, raw grief, gentle healing, and the courage to remain tender.",
    iconUrl: "🍂",
  },
];

/**
 * Ensures default nests exist in the Supabase PostgreSQL database.
 */
export async function ensureDefaultNests() {
  try {
    for (const nest of DEFAULT_NESTS) {
      await db.nest.upsert({
        where: { slug: nest.slug },
        update: {
          name: nest.name,
          description: nest.description,
          iconUrl: nest.iconUrl,
        },
        create: nest,
      });
    }
  } catch (error) {
    console.error("[ensureDefaultNests] Error seeding nests:", error);
  }
}

/**
 * Returns all active nests with their story counts.
 */
export async function getNests() {
  try {
    let nests = await db.nest.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
            members: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (nests.length === 0) {
      await ensureDefaultNests();
      nests = await db.nest.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: { status: "PUBLISHED" },
              },
              members: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    return nests;
  } catch (error) {
    console.error("[getNests] Error:", error);
    // Return default static structure if DB is unreachable
    return DEFAULT_NESTS.map((n, i) => ({
      id: `fallback-${i}`,
      name: n.name,
      slug: n.slug,
      description: n.description,
      iconUrl: n.iconUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { posts: 0, members: 0 },
    }));
  }
}

const slugSchema = z.string().min(1);

/**
 * Fetches a single nest by its slug with its published posts.
 */
export async function getNestBySlug(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;

  try {
    const nest = await db.nest.findUnique({
      where: { slug: parsed.data },
      include: {
        posts: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                reactions: true,
                comments: true,
                highlights: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return nest;
  } catch (error) {
    console.error("[getNestBySlug] Error:", error);
    return null;
  }
}
