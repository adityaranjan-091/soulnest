"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { MoodTag, PostStatus } from "@prisma/client";

const createPostSchema = z.object({
  authorId: z.string().min(1, "Author ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(180, "Title is too long"),
  content: z.string().min(10, "Story content is too brief"),
  excerpt: z.string().max(400).optional(),
  moodTag: z.nativeEnum(MoodTag).default(MoodTag.REFLECTIVE),
  nestId: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: z.nativeEnum(PostStatus).default(PostStatus.PUBLISHED),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || "story"}-${suffix}`;
}

function calculateReadingTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractExcerpt(html: string): string {
  const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plainText.length > 200 ? `${plainText.substring(0, 197)}...` : plainText;
}

/**
 * Creates or publishes a story in the Supabase PostgreSQL database.
 */
export async function createPostAction(input: CreatePostInput) {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid story parameters",
    };
  }

  const data = parsed.data;

  try {
    const slug = slugify(data.title);
    const readingTime = calculateReadingTime(data.content);
    const excerpt = data.excerpt?.trim() || extractExcerpt(data.content);

    const post = await db.post.create({
      data: {
        title: data.title.trim(),
        slug,
        content: { text: data.content }, // Structured Json representation
        contentHtml: data.content,
        excerpt,
        coverImageUrl: data.coverImageUrl || null,
        readingTime,
        status: data.status,
        moodTag: data.moodTag,
        nestId: data.nestId || null,
        authorId: data.authorId,
        publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: {
          select: {
            displayName: true,
            username: true,
          },
        },
        nest: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("[createPostAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save story to sanctuary",
    };
  }
}

/**
 * Fetches a single post by slug with author, nest, reactions, highlights, and comments.
 */
export async function getPostBySlug(slug: string) {
  try {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        nest: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
        highlights: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            text: true,
            note: true,
            userId: true,
            startOffset: true,
            endOffset: true,
          },
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("[getPostBySlug] Error:", error);
    return null;
  }
}

/**
 * Fetches stories for the explore page or feed with optional mood filter.
 */
export async function getFeedPosts(mood?: MoodTag) {
  try {
    const posts = await db.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        ...(mood ? { moodTag: mood } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        nest: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    });

    return posts;
  } catch (error) {
    console.error("[getFeedPosts] Error:", error);
    return [];
  }
}

/**
 * Fetches stories created by a specific user.
 */
export async function getUserStories(userId: string) {
  try {
    return await db.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        nest: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { reactions: true, comments: true, highlights: true },
        },
      },
    });
  } catch (error) {
    console.error("[getUserStories] Error:", error);
    return [];
  }
}

