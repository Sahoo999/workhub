"use client";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { ApiError } from "@/lib/api";

import {
  getTask,
  updateTask,
} from "@/features/tasks/tasks.api";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/task.types";

import CommentSection from "@/features/comments/CommentSection";

const STATUS_OPTIONS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

const PRIORITY_OPTIONS: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function TaskDetailPage() {
  const params = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const projectId = params.projectId;
  const taskId = params.taskId;

  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [task, setTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !accessToken) {
      return;
    }

    let cancelled = false;

    getTask(accessToken, taskId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setTask(data);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to load task.");
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
  }, [authLoading, accessToken, taskId]);

  const handleStatusChange = async (
    status: TaskStatus,
  ) => {
    if (!accessToken || !task) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedTask = await updateTask(
        accessToken,
        task.id,
        {
          status,
        },
      );

      setTask(updatedTask);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to update task status.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (
    priority: TaskPriority,
  ) => {
    if (!accessToken || !task) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedTask = await updateTask(
        accessToken,
        task.id,
        {
          priority,
        },
      );

      setTask(updatedTask);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to update task priority.");
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Authentication is still being initialized.
   */
  if (authLoading) {
    return (
      <ProtectedRoute>
        <main className="p-6">
          <p>Loading task...</p>
        </main>
      </ProtectedRoute>
    );
  }

  /*
   * Authentication finished but there is no logged-in user.
   * ProtectedRoute handles the redirect.
   */
  if (!user || !accessToken) {
    return null;
  }

  /*
   * Authentication is ready and we're waiting for the task API.
   */
  if (loading) {
    return (
      <ProtectedRoute>
        <main className="p-6">
          <p>Loading task...</p>
        </main>
      </ProtectedRoute>
    );
  }

  /*
   * API finished but no task was loaded.
   */
  if (!task) {
    return (
      <ProtectedRoute>
        <main className="p-6">
          <p className="text-red-600">
            {error ?? "Task not found."}
          </p>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl space-y-8 p-6">
        <section className="space-y-2">
          <p className="text-sm text-gray-500">
            Project {projectId}
          </p>

          <h1 className="text-3xl font-bold">
            {task.title}
          </h1>

          {task.description && (
            <p className="whitespace-pre-wrap text-gray-700">
              {task.description}
            </p>
          )}
        </section>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={task.status}
              disabled={saving}
              onChange={(event) =>
                void handleStatusChange(
                  event.target.value as TaskStatus,
                )
              }
              className="w-full rounded-lg border p-2"
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border p-4">
            <label className="mb-2 block text-sm font-medium">
              Priority
            </label>

            <select
              value={task.priority}
              disabled={saving}
              onChange={(event) =>
                void handlePriorityChange(
                  event.target.value as TaskPriority,
                )
              }
              className="w-full rounded-lg border p-2"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">
              Created by
            </p>

            <p className="mt-1 font-medium">
              {task.created_by}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">
              Assigned to
            </p>

            <p className="mt-1 font-medium">
              {task.assigned_to ?? "Unassigned"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">
              Due date
            </p>

            <p className="mt-1 font-medium">
              {task.due_date
                ? new Date(
                    task.due_date,
                  ).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">
              Last updated
            </p>

            <p className="mt-1 font-medium">
              {new Date(
                task.updated_at,
              ).toLocaleString()}
            </p>
          </div>
        </section>

        <CommentSection
          taskId={task.id}
          accessToken={accessToken}
        />
      </main>
    </ProtectedRoute>
  );
}