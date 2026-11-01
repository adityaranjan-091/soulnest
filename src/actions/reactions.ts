"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { ReactionType } from "@prisma/client";

const toggleReactionSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  userId: z.string().min(1, "User ID is required"),
  type: z.nativeEnum(ReactionType),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

/**
 * Toggles a soulful reaction on a story.
 */
export async function toggleReactionAction(input: ToggleReactionInput) {
  const parsed = toggleReactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid reaction input" };
  }

  const { postId, userId, type } = parsed.data;

  try {
    const existing = await db.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type,
        },
      },
    });

    if (existing) {
      await db.reaction.delete({
        where: { id: existing.id },
      });
      return { success: true, active: false, type };
    } else {
      await db.reaction.create({
        data: {
          userId,
          postId,
          type,
        },
      });
      return { success: true, active: true, type };
    }
  } catch (error) {
    console.error("[toggleReactionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record reaction",
    };
  }
}

/**
 * Fetches all stories bookmarked as RAINY_DAY_BOOKMARK by a specific reader.
 */
export async function getUserBookmarks(userId: string) {
  try {
    const reactions = await db.reaction.findMany({
      where: {
        userId,
        type: ReactionType.RAINY_DAY_BOOKMARK,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
            nest: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reactions.map((r) => r.post);
  } catch (error) {
    console.error("[getUserBookmarks] Error:", error);
    return [];
  }
}
