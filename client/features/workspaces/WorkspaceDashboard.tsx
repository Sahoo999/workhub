"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  createWorkspace,
  getWorkspaces,
} from "./workspaces.api";

import CreateWorkspaceForm from "./CreateWorkspaceForm";

import type { Workspace } from "./workspace.types";

export default function WorkspaceDashboard() {
  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      authLoading ||
      !accessToken
    ) {
      return;
    }

    const load = async () => {
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

    void load();
  }, [
    accessToken,
    authLoading,
  ]);

  const handleWorkspaceCreated = (
    workspace: Workspace,
  ) => {
    setWorkspaces((current) => [
      workspace,
      ...current,
    ]);
  };

  if (authLoading) {
    return <p>Loading session...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <main>
      <h1>
        Welcome, {user.name}
      </h1>

      <CreateWorkspaceForm
        onCreated={
          handleWorkspaceCreated
        }
      />

      {loading && (
        <p>
          Loading workspaces...
        </p>
      )}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        workspaces.length === 0 && (
          <section>
            <h2>
              No workspaces yet
            </h2>

            <p>
              Create one above to get
              started.
            </p>
          </section>
        )}

      {!loading &&
        workspaces.length > 0 && (
          <section>
            <h2>
              Your workspaces
            </h2>

            {workspaces.map(
              (workspace) => (
                <Link
  key={workspace.id}
  href={`/workspaces/${workspace.id}`}
>
  <article>
    <h3>{workspace.name}</h3>
    <p>Role: {workspace.role}</p>
  </article>
</Link>
              ),
            )}
          </section>
        )}
    </main>
  );
}