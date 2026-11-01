"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const commentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  authorId: z.string().min(1, "Author ID is required"),
  body: z.string().min(2, "Comment is too short").max(2000, "Comment cannot exceed 2000 characters"),
  parentId: z.string().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof commentSchema>;

/**
 * Adds a thoughtful comment or nested reply to a story.
 */
export async function createCommentAction(input: CreateCommentInput) {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid comment" };
  }

  const { postId, authorId, body, parentId } = parsed.data;

  try {
    const comment = await db.comment.create({
      data: {
        postId,
        authorId,
        body: body.trim(),
        parentId: parentId || null,
      },
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
    });

    return { success: true, comment };
  } catch (error) {
    console.error("[createCommentAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to post reflection",
    };
  }
}

/**
 * Deletes a comment written by the author.
 */
export async function deleteCommentAction(commentId: string, authorId: string) {
  try {
    await db.comment.deleteMany({
      where: {
        id: commentId,
        authorId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[deleteCommentAction] Error:", error);
    return { success: false, error: "Failed to remove reflection" };
  }
}

