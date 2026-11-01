"use client";

import React, { useState } from "react";
import { Sparkles, Brain, Bookmark, Loader2 } from "lucide-react";
import { ReactionType } from "@prisma/client";
import { toggleReactionAction } from "@/actions/reactions";
import { useAuth } from "@/context/AuthContext";

interface ReactionsBarProps {
  postId: string;
  initialCounts: {
    touched: number;
    think: number;
    bookmark: number;
  };
  initialUserReactions: {
    touched: boolean;
    think: boolean;
    bookmark: boolean;
  };
}

export function ReactionsBar({
  postId,
  initialCounts,
  initialUserReactions,
}: ReactionsBarProps) {
  const { user, dbUser } = useAuth();

  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState(initialUserReactions);
  const [loadingType, setLoadingType] = useState<ReactionType | null>(null);

  const handleToggle = async (type: ReactionType) => {
    if (!user || !dbUser) {
      alert("Please sign in to share a soulful reaction.");
      return;
    }

    setLoadingType(type);

    const res = await toggleReactionAction({
      postId,
      userId: dbUser.id,
      type,
    });

    setLoadingType(null);

    if (res.success) {
      const isNowActive = res.active ?? false;

      if (type === ReactionType.TOUCHED_SOUL) {
        setUserReactions((prev) => ({ ...prev, touched: isNowActive }));
        setCounts((prev) => ({
          ...prev,
          touched: prev.touched + (isNowActive ? 1 : -1),
        }));
      } else if (type === ReactionType.MADE_ME_THINK) {
        setUserReactions((prev) => ({ ...prev, think: isNowActive }));
        setCounts((prev) => ({
          ...prev,
          think: prev.think + (isNowActive ? 1 : -1),
        }));
      } else if (type === ReactionType.RAINY_DAY_BOOKMARK) {
        setUserReactions((prev) => ({ ...prev, bookmark: isNowActive }));
        setCounts((prev) => ({
          ...prev,
          bookmark: prev.bookmark + (isNowActive ? 1 : -1),
        }));
      }
    }
  };

  const reactionButtons = [
    {
      type: ReactionType.TOUCHED_SOUL,
      label: "Touched my soul",
      icon: Sparkles,
      count: counts.touched,
      active: userReactions.touched,
      color: "var(--accent-sage)",
      activeClass: "bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage)]/40 shadow-xs",
    },
    {
      type: ReactionType.MADE_ME_THINK,
      label: "Made me think",
      icon: Brain,
      count: counts.think,
      active: userReactions.think,
      color: "var(--accent-amber)",
      activeClass: "bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/40 shadow-xs",
    },
    {
      type: ReactionType.RAINY_DAY_BOOKMARK,
      label: "Rainy day bookmark",
      icon: Bookmark,
      count: counts.bookmark,
      active: userReactions.bookmark,
      color: "var(--accent-terracotta)",
      activeClass: "bg-[var(--accent-terracotta-subtle)] text-[var(--accent-terracotta)] border-[var(--accent-terracotta)]/40 shadow-xs",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-6 my-10 border-y border-[var(--border-subtle)]">
      {reactionButtons.map((btn) => {
        const Icon = btn.icon;
        const isLoading = loadingType === btn.type;

        return (
          <button
            key={btn.type}
            type="button"
            onClick={() => handleToggle(btn.type)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer ${
              btn.active
                ? btn.activeClass
                : "border-[var(--border-subtle)] bg-[var(--bg-card)]/70 hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span>{btn.label}</span>
            <span className="font-semibold ml-0.5 opacity-80">{btn.count}</span>
          </button>
        );
      })}
    </div>
  );
}

