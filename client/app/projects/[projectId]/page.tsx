"use client";

import { useEffect, useState } from "react";

import {
  useParams,
} from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";

import { ApiError } from "@/lib/api";

import {
  getProject,
} from "@/features/projects/projects.api";

import type {
  Project,
} from "@/features/projects/project.types";

export default function ProjectPage() {
  const params = useParams<{
    projectId: string;
  }>();

  const projectId =
    params.projectId;

  const { accessToken } = useAuth();

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProject(
            accessToken,
            projectId,
          );

        setProject(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load project.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [
    accessToken,
    projectId,
  ]);

  if (loading) {
    return (
      <ProtectedRoute>
        <p>Loading project...</p>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <p role="alert">
          {error}
        </p>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <ProtectedRoute>
      <main>
        <h1>{project.name}</h1>

        {project.description && (
          <p>
            {project.description}
          </p>
        )}

        <p>
          Project ID: {project.id}
        </p>

        <p>
          Workspace ID:{" "}
          {project.workspace_id}
        </p>
      </main>
    </ProtectedRoute>
  );
}