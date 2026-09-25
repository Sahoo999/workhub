"use client";

import {
  FormEvent,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  createTaskFormSchema,
} from "./task.schema";

import {
  createTask,
} from "./tasks.api";

import type { Task } from "./task.types";

interface CreateTaskFormProps {
  projectId: string;
  onCreated: (task: Task) => void;
}

export default function CreateTaskForm({
  projectId,
  onCreated,
}: CreateTaskFormProps) {
  const { accessToken } = useAuth();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<
      "TODO" |
      "IN_PROGRESS" |
      "IN_REVIEW" |
      "DONE"
    >("TODO");

  const [priority, setPriority] =
    useState<
      "LOW" |
      "MEDIUM" |
      "HIGH" |
      "URGENT"
    >("MEDIUM");

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!accessToken) {
      setError(
        "You must be logged in.",
      );
      return;
    }

    const result =
      createTaskFormSchema.safeParse({
        title,
        description,
        status,
        priority,
        dueDate,
      });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid task data",
      );

      return;
    }

    try {
      setLoading(true);

      const task =
        await createTask(
          accessToken,
          projectId,
          {
            title: result.data.title,
            description:
              result.data.description ||
              undefined,
            status: result.data.status,
            priority: result.data.priority,
            dueDate:
              result.data.dueDate ||
              undefined,
          },
        );

      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");

      onCreated(task);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Unable to create task.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create task</h2>

      <div>
        <label htmlFor="task-title">
          Title
        </label>

        <input
          id="task-title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          disabled={loading}
          placeholder="Build login API"
        />
      </div>

      <div>
        <label htmlFor="task-description">
          Description
        </label>

        <textarea
          id="task-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="task-status">
          Status
        </label>

        <select
          id="task-status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as typeof status,
            )
          }
          disabled={loading}
        >
          <option value="TODO">
            Todo
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="IN_REVIEW">
            In Review
          </option>

          <option value="DONE">
            Done
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="task-priority">
          Priority
        </label>

        <select
          id="task-priority"
          value={priority}
          onChange={(event) =>
            setPriority(
              event.target.value as typeof priority,
            )
          }
          disabled={loading}
        >
          <option value="LOW">
            Low
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="URGENT">
            Urgent
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="task-due-date">
          Due date
        </label>

        <input
          id="task-due-date"
          type="datetime-local"
          value={dueDate}
          onChange={(event) =>
            setDueDate(
              event.target.value,
            )
          }
          disabled={loading}
        />
      </div>

      {error && (
        <p role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={
          loading || !title.trim()
        }
      >
        {loading
          ? "Creating..."
          : "Create task"}
      </button>
    </form>
  );
}