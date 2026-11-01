"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const createHighlightSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  userId: z.string().min(1, "User ID is required"),
  text: z.string().min(3, "Highlighted text must be at least 3 characters").max(2000),
  note: z.string().max(1000).optional().nullable(),
  startOffset: z.number().int().nonnegative().default(0),
  endOffset: z.number().int().nonnegative().default(0),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;

/**
 * Saves a passage highlight and personal reflection into the reader's Soulbook.
 */
export async function saveHighlightAction(input: CreateHighlightInput) {
  const parsed = createHighlightSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid highlight" };
  }

  const { postId, userId, text, note, startOffset, endOffset } = parsed.data;

  try {
    const highlight = await db.highlight.create({
      data: {
        postId,
        userId,
        text,
        note: note?.trim() || null,
        startOffset,
        endOffset,
      },
    });

    return { success: true, highlight };
  } catch (error) {
    console.error("[saveHighlightAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to preserve highlight",
    };
  }
}

/**
 * Removes a highlight from the reader's Soulbook.
 */
export async function deleteHighlightAction(highlightId: string, userId: string) {
  try {
    await db.highlight.deleteMany({
      where: {
        id: highlightId,
        userId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[deleteHighlightAction] Error:", error);
    return { success: false, error: "Failed to remove highlight" };
  }
}

/**
 * Fetches all highlights saved by a user with post titles and authors.
 */
export async function getUserHighlights(userId: string) {
  try {
    return await db.highlight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            moodTag: true,
            author: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("[getUserHighlights] Error:", error);
    return [];
  }
}

