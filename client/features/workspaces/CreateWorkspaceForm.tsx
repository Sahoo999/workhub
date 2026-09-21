"use client";

import {
  FormEvent,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  createWorkspace,
} from "./workspaces.api";

interface CreateWorkspaceFormProps {
  onCreated: (
    workspace: Awaited<
      ReturnType<typeof createWorkspace>
    >,
  ) => void;
}

export default function CreateWorkspaceForm({
  onCreated,
}: CreateWorkspaceFormProps) {
  const {
    accessToken,
  } = useAuth();

  const [name, setName] =
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

    if (name.trim().length < 2) {
      setError(
        "Workspace name must be at least 2 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const workspace =
        await createWorkspace(
          accessToken,
          {
            name: name.trim(),
          },
        );

      setName("");

      onCreated(workspace);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Unable to create workspace.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create workspace</h2>

      <input
        type="text"
        value={name}
        onChange={(event) =>
          setName(event.target.value)
        }
        placeholder="Workspace name"
        disabled={loading}
      />

      {error && (
        <p role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          !name.trim()
        }
      >
        {loading
          ? "Creating..."
          : "Create workspace"}
      </button>
    </form>
  );
}