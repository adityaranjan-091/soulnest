"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Reply, Loader2 } from "lucide-react";
import { createCommentAction } from "@/actions/comments";
import { useAuth } from "@/context/AuthContext";

interface Author {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
}

interface CommentReply {
  id: string;
  body: string;
  createdAt: Date;
  author: Author;
}

interface CommentItem {
  id: string;
  body: string;
  createdAt: Date;
  author: Author;
  replies?: CommentReply[];
}

interface CommentsSectionProps {
  postId: string;
  initialComments: CommentItem[];
}

export function CommentsSection({
  postId,
  initialComments,
}: CommentsSectionProps) {
  const { user, dbUser } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (parentId?: string) => {
    if (!user || !dbUser) {
      alert("Please sign in to share your reflection.");
      return;
    }

    const body = parentId ? replyBody.trim() : newComment.trim();
    if (!body) return;

    setIsSubmitting(true);
    const res = await createCommentAction({
      postId,
      authorId: dbUser.id,
      body,
      parentId: parentId || null,
    });
    setIsSubmitting(false);

    if (res.success && res.comment) {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: [...(c.replies || []), res.comment as CommentReply],
                }
              : c
          )
        );
        setReplyingTo(null);
        setReplyBody("");
      } else {
        setComments((prev) => [
          { ...(res.comment as CommentItem), replies: [] },
          ...prev,
        ]);
        setNewComment("");
      }
    }
  };

  return (
    <section className="mt-14 pt-10 border-t border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-[var(--accent-sage)]" />
        <h2 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
          Reflections ({comments.length})
        </h2>
      </div>

      {/* New comment input */}
      {user ? (
        <div className="mb-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/70 p-4 shadow-xs">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Offer a kind thought, a resonance, or a gentle question..."
            className="w-full text-sm bg-transparent border-none placeholder-[var(--text-muted)] focus:outline-none text-[var(--text-primary)] resize-none"
          />
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-muted)] font-serif italic">
              Speak with care and presence.
            </span>
            <button
              type="button"
              disabled={isSubmitting || !newComment.trim()}
              onClick={() => handleSubmit()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Share Reflection</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 text-center text-xs text-[var(--text-secondary)]">
          <Link href="/login" className="font-semibold text-[var(--accent-sage)] hover:underline">
            Sign In
          </Link>{" "}
          to share a reflection with the author.
        </div>
      )}

      {/* List of comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center text-xs font-semibold">
                  {comment.author.displayName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {comment.author.displayName}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    @{comment.author.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-sage)] transition-colors cursor-pointer"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap pl-9">
              {comment.body}
            </p>

            {/* Nested reply input */}
            {replyingTo === comment.id && (
              <div className="ml-9 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={2}
                  placeholder={`Reply to ${comment.author.displayName}...`}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !replyBody.trim()}
                    onClick={() => handleSubmit(comment.id)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-sage)] text-white"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-9 mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                      <span>{reply.author.displayName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">
                        @{reply.author.username}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {reply.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

