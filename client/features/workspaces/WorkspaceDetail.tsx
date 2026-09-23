"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  getWorkspace,
} from "./workspaces.api";

import {
  getProjects,
} from "@/features/projects/projects.api";

import CreateProjectForm from "@/features/projects/CreateProjectForm";
import ProjectList from "@/features/projects/ProjectList";

import type {
  WorkspaceDetail as WorkspaceDetailType,
} from "./workspace.types";

import type {
  Project,
} from "@/features/projects/project.types";

interface WorkspaceDetailProps {
  workspaceId: string;
}

export default function WorkspaceDetail({
  workspaceId,
}: WorkspaceDetailProps) {
  const { accessToken } = useAuth();

  const [workspace, setWorkspace] =
    useState<WorkspaceDetailType | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          workspaceData,
          projectData,
        ] = await Promise.all([
          getWorkspace(
            accessToken,
            workspaceId,
          ),
          getProjects(
            accessToken,
            workspaceId,
          ),
        ]);

        setWorkspace(workspaceData);
        setProjects(projectData);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load workspace.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspace();
  }, [accessToken, workspaceId]);

  const handleProjectCreated = (
    project: Project,
  ) => {
    setProjects((current) => [
      project,
      ...current,
    ]);
  };

  if (loading) {
    return <p>Loading workspace...</p>;
  }

  if (error) {
    return (
      <p role="alert">
        {error}
      </p>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <main>
      <section>
        <h1>{workspace.name}</h1>

        <p>
          Workspace ID: {workspace.id}
        </p>
      </section>

      <section>
        <CreateProjectForm
          workspaceId={workspaceId}
          onCreated={
            handleProjectCreated
          }
        />
      </section>

      <ProjectList
        projects={projects}
      />
    </main>
  );
}