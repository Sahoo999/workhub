"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  getWorkspaces,
} from "./workspaces.api";

import type { Workspace } from "./workspace.types";

export default function WorkspaceList() {
  const {
    accessToken,
  } = useAuth();

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadWorkspaces = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getWorkspaces(
            accessToken,
          );

        setWorkspaces(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load workspaces.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspaces();
  }, [accessToken]);

  if (loading) {
    return <p>Loading workspaces...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div>
        <h2>No workspaces yet</h2>

        <p>
          Create your first workspace to get
          started.
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2>Your workspaces</h2>

      <div>
        {workspaces.map((workspace) => (
          <article key={workspace.id}>
            <h3>{workspace.name}</h3>

            <p>
              Role: {workspace.role}
            </p>

            <p>
              ID: {workspace.id}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}