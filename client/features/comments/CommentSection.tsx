"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { FormEvent } from "react";

import { ApiError } from "@/lib/api";

import {
  createComment,
  getComments,
} from "./comments.api";

import type { Comment } from "./comment.types";

interface CommentSectionProps {
  taskId: string;
  accessToken: string;
}

export default function CommentSection({
  taskId,
  accessToken,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async (): Promise<Comment[]> => {
    return getComments(taskId, accessToken);
  }, [taskId, accessToken]);

  useEffect(() => {
    let cancelled = false;

    loadComments()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setComments(data);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to load comments.");
        }
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadComments]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const newComment = await createComment(
        taskId,
        {
          content: trimmedContent,
        },
        accessToken,
      );

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setContent("");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create comment.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Comments
        </h2>

        <p className="text-sm text-gray-500">
          Discuss this task with your team.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Write a comment..."
          rows={4}
          className="w-full rounded-lg border p-3 outline-none"
        />

        <button
          type="submit"
          disabled={
            submitting || !content.trim()
          }
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting
            ? "Posting..."
            : "Add comment"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-lg border p-4"
            >
              <p className="whitespace-pre-wrap text-sm">
                {comment.content}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                User {comment.user_id}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(
                  comment.created_at,
                ).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}