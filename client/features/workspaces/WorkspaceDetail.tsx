"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  getWorkspace,
} from "./workspaces.api";

import type {
  WorkspaceDetail as WorkspaceDetailType,
} from "./workspace.types";

interface WorkspaceDetailProps {
  workspaceId: string;
}

export default function WorkspaceDetail({
  workspaceId,
}: WorkspaceDetailProps) {
  const { accessToken } = useAuth();

  const [workspace, setWorkspace] =
    useState<WorkspaceDetailType | null>(null);

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

        const data =
          await getWorkspace(
            accessToken,
            workspaceId,
          );

        setWorkspace(data);
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
      <h1>{workspace.name}</h1>

      <p>
        Workspace ID: {workspace.id}
      </p>

      <p>
        Created:{" "}
        {new Date(
          workspace.created_at,
        ).toLocaleString()}
      </p>
    </main>
  );
}