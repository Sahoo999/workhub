"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import { ApiError } from "@/lib/api";

import { useAuth } from "@/components/AuthProvider";

import AppShell from "@/components/AppShell";

import {
  getWorkspace,
} from "./workspaces.api";

import {
  getProjects,
} from "@/features/projects/projects.api";

import CreateProjectForm from "@/features/projects/CreateProjectForm";

import type {
  WorkspaceDetail as WorkspaceDetailType,
} from "./workspace.types";

import type {
  Project,
} from "@/features/projects/project.types";

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
  Separator,
} from "@/components/ui/separator";

interface WorkspaceDetailProps {
  workspaceId: string;
}

export default function WorkspaceDetail({
  workspaceId,
}: WorkspaceDetailProps) {
  const router = useRouter();

  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [workspace, setWorkspace] =
    useState<WorkspaceDetailType | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [createProjectOpen, setCreateProjectOpen] =
    useState(false);

  const [retryCount, setRetryCount] =
    useState(0);

  useEffect(() => {
    if (
      authLoading ||
      !accessToken ||
      !workspaceId
    ) {
      return;
    }

    let cancelled = false;

    const loadWorkspaceData = async () => {
      try {
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

        if (cancelled) {
          return;
        }

        setWorkspace(workspaceData);
        setProjects(projectData);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load this workspace. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    authLoading,
    workspaceId,
    retryCount,
  ]);

  const handleProjectCreated = (
    project: Project,
  ) => {
    setProjects((currentProjects) => {
      const alreadyExists =
        currentProjects.some(
          (currentProject) =>
            currentProject.id === project.id,
        );

      if (alreadyExists) {
        return currentProjects;
      }

      return [
        project,
        ...currentProjects,
      ];
    });

    setCreateProjectOpen(false);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);

    setRetryCount((current) => current + 1);
  };

  const openCreateProjectDialog = () => {
    setCreateProjectOpen(true);
  };

  if (authLoading) {
    return (
      <ProtectedWorkspacePage>
        <WorkspaceSkeleton />
      </ProtectedWorkspacePage>
    );
  }

  if (!accessToken) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedWorkspacePage>
        <WorkspaceSkeleton />
      </ProtectedWorkspacePage>
    );
  }

  if (error) {
    return (
      <ProtectedWorkspacePage>
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <Card className="border-destructive/20">
            <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <FolderKanban className="h-5 w-5 text-destructive" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  Unable to load workspace
                </h2>

                <p
                  role="alert"
                  className="max-w-md text-sm leading-6 text-muted-foreground"
                >
                  {error}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleRetry}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push("/workspaces")
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to workspaces
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedWorkspacePage>
    );
  }

  if (!workspace) {
    return (
      <ProtectedWorkspacePage>
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <Card>
            <CardContent className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <h2 className="font-semibold">
                  Workspace not found
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  This workspace may have been removed
                  or you may no longer have access.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={() =>
                    router.push("/workspaces")
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to workspaces
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedWorkspacePage>
    );
  }

  const workspaceInitial =
    workspace.name.trim().charAt(0).toUpperCase() ||
    "W";

  return (
    <ProtectedWorkspacePage>
      <div className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href="/workspaces"
            className="transition-colors hover:text-foreground"
          >
            Workspaces
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <span className="max-w-[240px] truncate font-medium text-foreground">
            {workspace.name}
          </span>
        </nav>

        {/* Workspace header */}
        <section className="rounded-2xl border bg-background shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                    {workspaceInitial}
                  </div>

                  <div className="min-w-0">
                    <Badge
                      variant="secondary"
                      className="mb-2"
                    >
                      Workspace
                    </Badge>

                    <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                      {workspace.name}
                    </h1>
                  </div>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Organize your team&apos;s projects,
                  tasks, and collaboration in one place.
                </p>
              </div>

              <Button
                type="button"
                size="lg"
                className="shrink-0"
                onClick={
                  openCreateProjectDialog
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Workspace stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                    <FolderKanban className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold leading-none">
                      {projects.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {projects.length === 1
                        ? "Project"
                        : "Projects"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                    <Users className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Team
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Workspace members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Create project dialog */}
        <Dialog
          open={createProjectOpen}
          onOpenChange={
            setCreateProjectOpen
          }
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Create a new project
              </DialogTitle>

              <DialogDescription>
                Give your project a name and an
                optional description.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2">
              <CreateProjectForm
                workspaceId={workspaceId}
                onCreated={
                  handleProjectCreated
                }
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Projects */}
        <section
          id="projects"
          className="scroll-mt-20 space-y-5"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Projects
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Projects inside this workspace.
              </p>
            </div>

            {projects.length > 0 && (
              <Badge variant="outline">
                {projects.length} total
              </Badge>
            )}
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <FolderKanban className="h-6 w-6 text-muted-foreground" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No projects yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Create your first project to start
                  organizing work in this workspace.
                </p>

                <Button
                  type="button"
                  className="mt-6"
                  onClick={
                    openCreateProjectDialog
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block"
                >
                  <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <FolderKanban className="h-4 w-4" />
                        </div>

                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                      </div>

                      <CardTitle className="line-clamp-1 text-lg">
                        {project.name}
                      </CardTitle>

                      <CardDescription className="line-clamp-2 min-h-10 leading-5">
                        {project.description?.trim()
                          ? project.description
                          : "No project description provided."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                        <span>
                          Open project
                        </span>

                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedWorkspacePage>
  );
}

interface ProtectedWorkspacePageProps {
  children: React.ReactNode;
}

function ProtectedWorkspacePage({
  children,
}: ProtectedWorkspacePageProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />

      <div className="rounded-2xl border bg-background p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />

            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-56 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />

          <div className="h-px w-full bg-border" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-xl border bg-muted/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}