"use client";

import {
  FormEvent,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  createProject,
} from "./projects.api";

import type { Project } from "./project.types";

interface CreateProjectFormProps {
  workspaceId: string;
  onCreated: (project: Project) => void;
}

export default function CreateProjectForm({
  workspaceId,
  onCreated,
}: CreateProjectFormProps) {
  const { accessToken } = useAuth();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
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
      setError("You must be logged in.");
      return;
    }

    if (name.trim().length < 2) {
      setError(
        "Project name must be at least 2 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const project =
        await createProject(
          accessToken,
          workspaceId,
          {
            name: name.trim(),
            description:
              description.trim() || undefined,
          },
        );

      setName("");
      setDescription("");

      onCreated(project);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Unable to create project.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create project</h2>

      <div>
        <label htmlFor="project-name">
          Project name
        </label>

        <input
          id="project-name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Website Redesign"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="project-description">
          Description
        </label>

        <textarea
          id="project-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          placeholder="Project description"
          disabled={loading}
        />
      </div>

      {error && (
        <p role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={
          loading || !name.trim()
        }
      >
        {loading
          ? "Creating..."
          : "Create project"}
      </button>
    </form>
  );
}