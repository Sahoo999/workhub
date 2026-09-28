"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Building2,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { ApiError } from "@/lib/api";

import { useAuth } from "@/components/AuthProvider";

import AppShell from "@/components/AppShell";

import {
  createWorkspace,
  getWorkspaces,
} from "@/features/workspaces/workspaces.api";

import type {
  Workspace,
} from "@/features/workspaces/workspace.types";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

export default function WorkspacesPage() {
  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !accessToken) {
      return;
    }

    let cancelled = false;

    getWorkspaces(accessToken)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setWorkspaces(data);
        setError(null);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load your workspaces. Please try again.",
          );
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    authLoading,
    retryCount,
  ]);

  const filteredWorkspaces = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return workspaces;
    }

    return workspaces.filter((workspace) =>
      workspace.name
        .toLowerCase()
        .includes(query),
    );
  }, [search, workspaces]);

  const handleCreateWorkspace = async () => {
    const trimmedName =
      workspaceName.trim();

    if (trimmedName.length < 2) {
      setCreateError(
        "Workspace name must be at least 2 characters.",
      );

      return;
    }

    if (trimmedName.length > 100) {
      setCreateError(
        "Workspace name must be 100 characters or fewer.",
      );

      return;
    }

    if (!accessToken) {
      setCreateError(
        "Your session has expired. Please sign in again.",
      );

      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const newWorkspace =
        await createWorkspace(
          accessToken,
          {
            name: trimmedName,
          },
        );

      setWorkspaces((current) => {
        const alreadyExists =
          current.some(
            (workspace) =>
              workspace.id ===
              newWorkspace.id,
          );

        if (alreadyExists) {
          return current;
        }

        return [
          newWorkspace,
          ...current,
        ];
      });

      setWorkspaceName("");
      setCreateOpen(false);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setCreateError(error.message);
      } else {
        setCreateError(
          "Unable to create the workspace. Please try again.",
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDialogChange = (
    open: boolean,
  ) => {
    setCreateOpen(open);

    if (!open) {
      setWorkspaceName("");
      setCreateError(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryCount(
      (current) => current + 1,
    );
  };

  if (authLoading) {
    return (
      <AppShell>
        <WorkspacesSkeleton />
      </AppShell>
    );
  }

  if (!accessToken) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
        {/* Page header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">
              Your workspaces
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight">
              Workspaces
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Organize projects, tasks, and people
              into focused workspaces.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() =>
              setCreateOpen(true)
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New workspace
          </Button>
        </section>

        {/* Search */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search workspaces..."
              className="h-10 pl-9"
              aria-label="Search workspaces"
            />
          </div>

          {!loading && (
            <p className="text-sm text-muted-foreground">
              {search.trim()
                ? `${filteredWorkspaces.length} result${
                    filteredWorkspaces.length ===
                    1
                      ? ""
                      : "s"
                  }`
                : `${workspaces.length} workspace${
                    workspaces.length ===
                    1
                      ? ""
                      : "s"
                  }`}
            </p>
          )}
        </section>

        {/* Error */}
        {error && !loading && (
          <Card className="border-destructive/20">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Something went wrong
                </p>

                <p
                  role="alert"
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {error}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <WorkspacesSkeleton />
        ) : filteredWorkspaces.length ===
          0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                {search.trim() ? (
                  <Search className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {search.trim() ? (
                <>
                  <h2 className="mt-5 text-lg font-semibold">
                    No workspaces found
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No workspace matches{" "}
                    <span className="font-medium text-foreground">
                      &quot;{search}&quot;
                    </span>
                    .
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="mt-5 text-lg font-semibold">
                    Create your first workspace
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    A workspace is the shared home
                    for your projects, tasks, and
                    team.
                  </p>

                  <Button
                    type="button"
                    className="mt-6"
                    onClick={() =>
                      setCreateOpen(true)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create workspace
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredWorkspaces.map(
              (workspace) => {
                const initial =
                  workspace.name
                    .trim()
                    .charAt(0)
                    .toUpperCase() ||
                  "W";

                return (
                  <Link
                    key={workspace.id}
                    href={`/workspaces/${workspace.id}`}
                    className="group block outline-none"
                  >
                    <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
                            {initial}
                          </div>

                          <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>

                        <CardTitle className="mt-4 line-clamp-1 text-lg">
                          {workspace.name}
                        </CardTitle>

                        <CardDescription className="line-clamp-2">
                          Your shared workspace for
                          projects, tasks, and team
                          collaboration.
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-5 border-t pt-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <FolderKanban className="h-3.5 w-3.5" />
                            Projects
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            Team
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              },
            )}
          </section>
        )}

        {/* Create workspace dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={handleDialogChange}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Create workspace
              </DialogTitle>

              <DialogDescription>
                Give your workspace a clear name
                for your team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="workspace-name"
                  className="text-sm font-medium"
                >
                  Workspace name
                </label>

                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(event) => {
                    setWorkspaceName(
                      event.target.value,
                    );
                    setCreateError(null);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !creating
                    ) {
                      event.preventDefault();

                      void handleCreateWorkspace();
                    }
                  }}
                  placeholder="e.g. Engineering"
                  disabled={creating}
                  autoFocus
                  maxLength={100}
                />

                <p className="text-xs text-muted-foreground">
                  {workspaceName.length}/100
                </p>
              </div>

              {createError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                >
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={creating}
                  onClick={() =>
                    handleDialogChange(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={
                    creating ||
                    workspaceName.trim()
                      .length < 2
                  }
                  onClick={() => {
                    void handleCreateWorkspace();
                  }}
                >
                  {creating
                    ? "Creating..."
                    : "Create workspace"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

function WorkspacesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
      <div className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />

        <div className="h-9 w-52 animate-pulse rounded bg-muted" />

        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      </div>

      <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(
          (item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-xl border bg-muted/40"
            />
          ),
        )}
      </div>
    </div>
  );
}