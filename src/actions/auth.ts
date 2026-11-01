"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const syncUserSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  email: z.string().email("A valid email address is required"),
  displayName: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional()
    .nullable(),
});

export type SyncUserInput = z.infer<typeof syncUserSchema>;

/**
 * Ensures a unique username handle in the database.
 */
async function generateUniqueUsername(preferred: string, email: string): Promise<string> {
  const base = preferred.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || "soul";
  
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await db.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}${counter}`;
    counter++;
  }
}

/**
 * Synchronizes a Firebase Authenticated user into the Supabase PostgreSQL database via Prisma.
 */
export async function syncUserWithDb(input: SyncUserInput) {
  const result = syncUserSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid input data",
    };
  }

  const { uid, email, displayName, avatarUrl, username } = result.data;

  try {
    // Check if user already exists by email or id
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ id: uid }, { email }],
      },
    });

    if (existingUser) {
      const updated = await db.user.update({
        where: { id: existingUser.id },
        data: {
          displayName: displayName || existingUser.displayName,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
        },
      });
      return { success: true, user: updated };
    }

    // New user: ensure unique username and create profile in Supabase
    const finalUsername = await generateUniqueUsername(username || "", email);
    const fallbackDisplayName = displayName?.trim() || finalUsername;

    const created = await db.user.create({
      data: {
        id: uid,
        email,
        username: finalUsername,
        displayName: fallbackDisplayName,
        avatarUrl: avatarUrl || null,
      },
    });

    return { success: true, user: created };
  } catch (error) {
    console.error("[syncUserWithDb] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync user with database",
    };
  }
}

/**
 * Check if a username is available in the Supabase PostgreSQL database.
 */
export async function checkUsernameAvailability(username: string) {
  const usernameSchema = z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/);

  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { available: false, message: "Username must be 3-30 letters, numbers, or underscores." };
  }

  try {
    const existing = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    return { available: !existing };
  } catch (err) {
    console.error("[checkUsernameAvailability] Error:", err);
    // Graceful fallback to avoid blocking signup if DB is momentarily reconnecting
    return { available: true };
  }
}

/**
 * Fetch the Prisma user profile corresponding to a Firebase UID.
 */
export async function getDbUserProfile(uid: string) {
  if (!uid) return null;
  try {
    return await db.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
      },
    });
  } catch (error) {
    console.error("[getDbUserProfile] Error:", error);
    return null;
  }
}

