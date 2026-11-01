"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Feather,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/** Prevents open-redirect vulnerabilities from untrusted ?next= params */
function getSafeRedirectUrl(rawNext: string | null): string {
  if (!rawNext) return "/";
  if (rawNext.startsWith("/") && !rawNext.startsWith("//")) {
    return rawNext;
  }
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = useMemo(
    () => getSafeRedirectUrl(searchParams.get("next")),
    [searchParams]
  );

  const {
    user,
    loginWithEmail,
    loginWithGoogle,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = isSubmitting || isGoogleSubmitting;

  // Redirect smoothly if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.replace(nextUrl);
    }
  }, [user, authLoading, router, nextUrl]);

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setErrorMessage(null);

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMessage("Please share both your email and password to enter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithEmail(cleanEmail, password);

      if (!result.success) {
        setErrorMessage(
          result.error || "Unable to sign in. Please check your credentials."
        );
      } else {
        router.replace(nextUrl);
      }
    } catch {
      setErrorMessage(
        "A quiet hiccup occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      setErrorMessage(
        "Unable to connect with Google right now. Please try again."
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const inputBaseClasses =
    "w-full py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-sage)]/30 focus:border-[var(--accent-sage)] focus:bg-[var(--bg-card)] transition-all duration-200 disabled:opacity-60";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Sanctuary Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--border-subtle)] text-[var(--accent-sage)] shadow-xs mb-4 transition-transform duration-300 hover:scale-105">
          <Feather className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
          Step back into your quiet sanctuary for slow reading &amp; mindful
          thoughts.
        </p>
      </div>

      {/* Main Card */}
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

        {/* Google One-Click CTA */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] active:scale-[0.99] text-xs sm:text-sm font-medium text-[var(--text-primary)] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          {isGoogleSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-sage)]" />
          ) : (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-[var(--border-subtle)]" />
          </div>
          <span className="relative bg-[var(--bg-card)] px-3 text-[11px] font-sans uppercase tracking-wider text-[var(--text-muted)]">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                className={`${inputBaseClasses} pl-10 pr-4`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Password
              </label>
              <Link
                href={
                  email.trim()
                    ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
                    : "/forgot-password"
                }
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-sage)] transition-colors font-serif italic"
              >
                Forgot your key?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isBusy}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyUp={handleKeyEvent}
                onKeyDown={handleKeyEvent}
                onBlur={() => setCapsLockOn(false)}
                placeholder="••••••••••••"
                className={`${inputBaseClasses} pl-10 pr-10`}
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

            {/* Subtle Caps Lock Indicator */}
            {capsLockOn && (
              <p
                aria-live="polite"
                className="mt-1.5 text-[11px] text-[var(--accent-terracotta)] flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Caps Lock is on</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] active:scale-[0.99] text-sm font-semibold shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening your nest...</span>
              </>
            ) : (
              <>
                <span>Enter Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            New to this gentle space?{" "}
            <Link
              href={
                nextUrl !== "/"
                  ? `/register?next=${encodeURIComponent(nextUrl)}`
                  : "/register"
              }
              className="font-medium text-[var(--accent-sage)] hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              <span>Plant your seeds</span>
              <Sparkles className="w-3 h-3 text-[var(--accent-amber)]" />
            </Link>
          </p>
        </div>
      </div>

      {/* Gentle Poetic Footer Note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] font-serif italic text-center">
        <BookOpen className="w-3.5 h-3.5 text-[var(--accent-terracotta)] shrink-0" />
        <span>
          &ldquo;Words are the quiet chambers of the human spirit.&rdquo;
        </span>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] mb-4" />
        <div className="h-7 w-40 rounded-lg bg-[var(--bg-secondary)] mb-2" />
        <div className="h-4 w-64 rounded-lg bg-[var(--bg-secondary)]" />
      </div>
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 p-6 sm:p-8 space-y-5">
        <div className="h-10 w-full rounded-xl bg-[var(--bg-secondary)]" />
        <div className="h-4 w-full rounded bg-[var(--bg-secondary)]" />
        <div className="space-y-4">
          <div className="h-14 w-full rounded-xl bg-[var(--bg-secondary)]" />
          <div className="h-14 w-full rounded-xl bg-[var(--bg-secondary)]" />
        </div>
        <div className="h-11 w-full rounded-xl bg-[var(--bg-secondary)]" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial from-[var(--bg-secondary)]/50 via-[var(--bg-primary)] to-[var(--bg-primary)]">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}