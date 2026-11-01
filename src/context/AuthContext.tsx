"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import {
  syncUserWithDb,
  getDbUserProfile,
  checkUsernameAvailability,
} from "@/actions/auth";

export interface DbUserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: DbUserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (params: RegisterParams) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or fetch DB profile for the active Firebase user
  const syncProfile = useCallback(async (fbUser: FirebaseUser) => {
    try {
      let profile = await getDbUserProfile(fbUser.uid);
      if (!profile) {
        // Sync profile into Supabase PostgreSQL via Prisma
        const syncRes = await syncUserWithDb({
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || null,
          avatarUrl: fbUser.photoURL || null,
        });
        if (syncRes.success && syncRes.user) {
          profile = {
            id: syncRes.user.id,
            username: syncRes.user.username,
            displayName: syncRes.user.displayName,
            email: syncRes.user.email,
            bio: syncRes.user.bio,
            avatarUrl: syncRes.user.avatarUrl,
          };
        }
      }
      setDbUser(profile);
    } catch (err) {
      console.error("[AuthProvider] Profile sync error:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncProfile(user);
    }
  }, [user, syncProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncProfile]);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await syncProfile(res.user);
      return { success: true };
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err);
      return { success: false, error: message };
    }
  };

  const registerWithEmail = async ({
    email,
    password,
    displayName,
    username,
  }: RegisterParams) => {
    try {
      // Validate handle availability in Supabase DB first
      const check = await checkUsernameAvailability(username);
      if (!check.available) {
        return {
          success: false,
          error: check.message || "That username handle is already claimed in our sanctuary.",
        };
      }

      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase Auth
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });

      // Synchronize immediately to Supabase DB via Prisma
      const syncResult = await syncUserWithDb({
        uid: credential.user.uid,
        email,
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
      });

      if (!syncResult.success) {
        console.warn("[Register] DB sync warning:", syncResult.error);
      }

      if (syncResult.user) {
        setDbUser({
          id: syncResult.user.id,
          username: syncResult.user.username,
          displayName: syncResult.user.displayName,
          email: syncResult.user.email,
          bio: syncResult.user.bio,
          avatarUrl: syncResult.user.avatarUrl,
        });
      }

      return { success: true };
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncProfile(result.user);
      return { success: true };
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
    } catch (err) {
      console.error("[AuthProvider] Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Translates Firebase cryptic auth errors into calming, soulful human messages.
 */
function getFriendlyErrorMessage(err: unknown): string {
  if (typeof err !== "object" || err === null || !("code" in err)) {
    return "An unexpected quiet error occurred. Please try again.";
  }

  const code = (err as { code: string }).code;

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "We could not find an account matching those credentials. Please check your email and password.";
    case "auth/email-already-in-use":
      return "An account with this email address already finds its home here. Please sign in instead.";
    case "auth/weak-password":
      return "Your password is too short. Please choose a password with at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid, peaceful email address.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before completion.";
    case "auth/too-many-requests":
      return "Too many attempts from this sanctuary. Please pause for a moment and try again.";
    case "auth/network-request-failed":
      return "Unable to reach the sanctuary servers. Please check your connection.";
    default:
      return (err as { message?: string }).message || "Unable to complete request. Please try again.";
  }
}

