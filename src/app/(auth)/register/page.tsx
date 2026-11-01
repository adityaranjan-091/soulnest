"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Feather,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { checkUsernameAvailability } from "@/actions/auth";

type UsernameStatus =
  | "idle"
  | "too_short"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/** Prevents open-redirect vulnerabilities from untrusted ?next= params */
function getSafeRedirectUrl(rawNext: string | null): string {
  if (!rawNext) return "/";
  if (rawNext.startsWith("/") && !rawNext.startsWith("//")) {
    return rawNext;
  }
  return "/";
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = useMemo(
    () => getSafeRedirectUrl(searchParams.get("next")),
    [searchParams]
  );

  const {
    user,
    registerWithEmail,
    loginWithGoogle,
    loading: authLoading,
  } = useAuth();

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & submission states
  const [availabilityCheck, setAvailabilityCheck] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed username validation status
  const usernameStatus: UsernameStatus = useMemo(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return "idle";
    if (!USERNAME_REGEX.test(trimmed)) return "invalid";
    if (trimmed.length < 3) return "too_short";
    return availabilityCheck;
  }, [username, availabilityCheck]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.replace(nextUrl);
    }
  }, [user, authLoading, router, nextUrl]);

  // Debounced, race-condition-safe username availability check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed || trimmed.length < 3 || !USERNAME_REGEX.test(trimmed)) {
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(async () => {
      setAvailabilityCheck("checking");
      try {
        const res = await checkUsernameAvailability(trimmed);
        if (!isCancelled) {
          setAvailabilityCheck(res.available ? "available" : "taken");
        }
      } catch {
        if (!isCancelled) {
          setAvailabilityCheck("error");
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  // Subtle password strength calculation (0 to 3)
  const passwordMetrics = useMemo(() => {
    if (!password) return { score: 0, label: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9!@#$%^&*]/.test(password)) score += 1;

    const labels = ["Too brief", "Gentle", "Grounded", "Resilient"];
    return { score, label: labels[score] };
  }, [password]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const isBusy = isSubmitting || isGoogleSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setErrorMessage(null);

    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim();

    if (!cleanDisplayName) {
      setErrorMessage("Please enter your pen name or display name.");
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMessage("Please choose a sanctuary handle of at least 3 characters.");
      return;
    }

    if (!USERNAME_REGEX.test(cleanUsername)) {
      setErrorMessage("Handles may only contain letters, numbers, and underscores.");
      return;
    }

    if (usernameStatus === "checking") {
      setErrorMessage("Please wait a moment while we check your handle.");
      return;
    }

    if (usernameStatus === "taken") {
      setErrorMessage(
        "This handle is already claimed. Please choose another quiet identifier."
      );
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Please share your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter them carefully.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerWithEmail({
        email: cleanEmail,
        password,
        displayName: cleanDisplayName,
        username: cleanUsername,
      });

      if (!result.success) {
        setErrorMessage(
          result.error || "Unable to create your nest right now. Please try again."
        );
      } else {
        router.replace(nextUrl);
      }
    } catch {
      setErrorMessage("A quiet hiccup occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isBusy) return;
    setErrorMessage(null);
    setIsGoogleSubmitting(true);

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setErrorMessage(result.error || "Google authentication was cancelled.");
      } else {
        router.replace(nextUrl);
      }
    } catch {
      setErrorMessage("Unable to connect with Google right now. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const inputBaseClasses =
    "w-full py-2.5 rounded-xl border bg-[var(--bg-secondary)]/40 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:bg-[var(--bg-card)] transition-all duration-200 disabled:opacity-60";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Sanctuary Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] shadow-xs mb-4 transition-transform duration-300 hover:scale-105">
          <Feather className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Join the Sanctuary
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
          Where slow stories, digital gardens, and mindful readers cross paths.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 flex items-start gap-3 rounded-2xl bg-[var(--accent-terracotta-subtle)] p-3.5 text-xs text-[var(--text-primary)] border border-[var(--accent-terracotta)]/25 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="w-4 h-4 text-[var(--accent-terracotta)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Google Quick Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] active:scale-[0.99] text-xs sm:text-sm font-medium text-[var(--text-primary)] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          {isGoogleSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-sage)]" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[var(--border-subtle)]" />
          </div>
          <span className="relative bg-[var(--bg-card)] px-3 text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
            or craft your sanctuary profile
          </span>
        </div>

        {/* Detailed Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
            >
              Pen Name / Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                required
                disabled={isBusy}
                maxLength={50}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. Elena Rostova"
                className={`${inputBaseClasses} pl-10 pr-4 border-[var(--border-subtle)] focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]`}
              />
            </div>
          </div>

          {/* Username Handle */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Sanctuary Handle
              </label>

              {/* Live Handle Status Pill */}
              <div aria-live="polite" className="text-[11px] flex items-center">
                {usernameStatus === "checking" && (
                  <span className="text-[var(--text-muted)] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> checking...
                  </span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[var(--accent-sage)] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> available
                  </span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-[var(--accent-terracotta)] font-medium flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> already taken
                  </span>
                )}
                {usernameStatus === "invalid" && (
                  <span className="text-[var(--accent-terracotta)] flex items-center gap-1">
                    letters, numbers, _ only
                  </span>
                )}
                {usernameStatus === "too_short" && (
                  <span className="text-[var(--text-muted)]">min 3 chars</span>
                )}
              </div>
            </div>

            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={isBusy}
                maxLength={24}
                value={username}
                onChange={(e) => {
                  // Automatically strip spaces and lowercase for smoother UX
                  const normalized = e.target.value.replace(/\s+/g, "").toLowerCase();
                  setUsername(normalized);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="quiet_thinker"
                className={`${inputBaseClasses} pl-10 pr-4 ${usernameStatus === "taken" || usernameStatus === "invalid"
                    ? "border-[var(--accent-terracotta)]/60 focus:ring-[var(--accent-terracotta)]/25 focus:border-[var(--accent-terracotta)]"
                    : usernameStatus === "available"
                      ? "border-[var(--accent-sage)]/60 focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]"
                      : "border-[var(--border-subtle)] focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]"
                  }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={isBusy}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="your.story@soulnest.com"
                className={`${inputBaseClasses} pl-10 pr-4 border-[var(--border-subtle)] focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Password
              </label>
              {password.length > 0 && (
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--accent-sage)]" />
                  {passwordMetrics.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isBusy}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="At least 6 characters"
                className={`${inputBaseClasses} pl-10 pr-10 border-[var(--border-subtle)] focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-sage)]/30 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Subtle 3-bar strength meter */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passwordMetrics.score >= level
                        ? "bg-[var(--accent-sage)]"
                        : "bg-[var(--border-subtle)]"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Confirm Password
              </label>
              {passwordsMatch && (
                <span className="text-[11px] text-[var(--accent-sage)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> matches
                </span>
              )}
              {passwordsMismatch && (
                <span className="text-[11px] text-[var(--accent-terracotta)]">
                  does not match
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isBusy}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Repeat your password"
                className={`${inputBaseClasses} pl-10 pr-4 ${passwordsMismatch
                    ? "border-[var(--accent-terracotta)]/60 focus:ring-[var(--accent-terracotta)]/25 focus:border-[var(--accent-terracotta)]"
                    : "border-[var(--border-subtle)] focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)]"
                  }`}
              />
            </div>
          </div>

          {/* Gentle Sanctuary Pledge */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
            <HeartHandshake className="w-4 h-4 text-[var(--accent-terracotta)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By joining, you embrace slow contemplation, gentle feedback, and
              respect for vulnerable storytelling.
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isBusy || usernameStatus === "checking"}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] active:scale-[0.99] text-sm font-semibold shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your sanctuary...</span>
              </>
            ) : (
              <>
                <span>Create Your Nest</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            Already have a space here?{" "}
            <Link
              href={
                nextUrl !== "/"
                  ? `/login?next=${encodeURIComponent(nextUrl)}`
                  : "/login"
              }
              className="font-medium text-[var(--accent-sage)] hover:underline underline-offset-4"
            >
              Return to your nest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] mb-4" />
        <div className="h-7 w-48 rounded-lg bg-[var(--bg-secondary)] mb-2" />
        <div className="h-4 w-64 rounded-lg bg-[var(--bg-secondary)]" />
      </div>
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 p-6 sm:p-8 space-y-5">
        <div className="h-10 w-full rounded-xl bg-[var(--bg-secondary)]" />
        <div className="h-4 w-full rounded bg-[var(--bg-secondary)]" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 w-full rounded-xl bg-[var(--bg-secondary)]" />
          ))}
        </div>
        <div className="h-11 w-full rounded-xl bg-[var(--bg-secondary)]" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial from-[var(--bg-secondary)]/50 via-[var(--bg-primary)] to-[var(--bg-primary)]">
      <Suspense fallback={<RegisterSkeleton />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}