"use client";

import React, { useState, useEffect } from "react";
import { Highlighter, Check, Loader2 } from "lucide-react";
import { saveHighlightAction } from "@/actions/highlights";
import { useAuth } from "@/context/AuthContext";

interface HighlightPopoverProps {
  postId: string;
}

export function HighlightPopover({ postId }: HighlightPopoverProps) {
  const { user, dbUser } = useAuth();

  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    function handleSelection() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!isSaving) setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 5) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPosition({
          top: rect.top + window.scrollY - 45,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      } else {
        if (!isSaving) setPosition(null);
      }
    }

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [isSaving]);

  const handleSaveHighlight = async () => {
    if (!user || !dbUser) {
      alert("Please sign in to save highlights to your Soulbook.");
      return;
    }

    if (!selectedText) return;

    setIsSaving(true);
    const res = await saveHighlightAction({
      postId,
      userId: dbUser.id,
      text: selectedText,
      note: null,
      startOffset: 0,
      endOffset: selectedText.length,
    });
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setPosition(null);
        window.getSelection()?.removeAllRanges();
      }, 1500);
    }
  };

  if (!position) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onClick={handleSaveHighlight}
        disabled={isSaving || savedSuccess}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : savedSuccess ? (
          <Check className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
        ) : (
          <Highlighter className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
        )}
        <span>{savedSuccess ? "Saved to Soulbook" : "Save Highlight"}</span>
      </button>
    </div>
  );
}
