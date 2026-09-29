"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bell,
  FolderKanban,
  RefreshCw,
  Users,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";

import { useAuth } from "@/components/AuthProvider";

import { ApiError } from "@/lib/api";

import {
  getWorkspaces,
} from "@/features/workspaces/workspaces.api";

import {
  getProjects,
} from "@/features/projects/projects.api";

import {
  getNotifications,
} from "@/features/notifications/notifications.api";

import type {
  Workspace,
} from "@/features/workspaces/workspace.types";

import type {
  Project,
} from "@/features/projects/project.types";

import type {
  Notification,
} from "@/features/notifications/notification.types";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardProject extends Project {
  workspaceName: string;
}

export default function DashboardPage() {
  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [projects, setProjects] =
    useState<DashboardProject[]>([]);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = async (
    token: string,
  ) => {
    try {
      setError(null);

      const [
        workspaceData,
        notificationData,
      ] = await Promise.all([
        getWorkspaces(token),
        getNotifications(token),
      ]);

      const projectResults =
        await Promise.all(
          workspaceData.map(
            async (workspace) => {
              const workspaceProjects =
                await getProjects(
                  token,
                  workspace.id,
                );

              return workspaceProjects.map(
                (project) => ({
                  ...project,
                  workspaceName:
                    workspace.name,
                }),
              );
            },
          ),
        );

      const allProjects =
        projectResults.flat();

      setWorkspaces(workspaceData);
      setProjects(allProjects);
      setNotifications(
        notificationData,
      );
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Unable to load your dashboard.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      authLoading ||
      !accessToken
    ) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await loadDashboard(
          accessToken,
        );
      } finally {
        if (cancelled) {
          return;
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    authLoading,
  ]);

  if (authLoading) {
    return (
      <ProtectedRoute>
        <DashboardSkeleton />
      </ProtectedRoute>
    );
  }

  if (!accessToken) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardSkeleton />
      </ProtectedRoute>
    );
  }

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.read_at === null,
    ).length;

  const recentProjects =
    [...projects]
      .sort(
        (a, b) =>
          new Date(
            b.created_at,
          ).getTime() -
          new Date(
            a.created_at,
          ).getTime(),
      )
      .slice(0, 6);

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Welcome back
              {user?.name
                ? `, ${user.name.split(" ")[0]}`
                : ""}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Your workspaces, projects, and important
              activity in one place.
            </p>
          </div>

          <Link
            href="/workspaces"
            className="inline-flex"
          >
            <Button>
              View workspaces
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);

                if (accessToken) {
                  void loadDashboard(
                    accessToken,
                  );
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Overview */}
        <section className="grid gap-4 md:grid-cols-3">
          <OverviewCard
            icon={<Users />}
            label="Workspaces"
            value={workspaces.length}
            href="/workspaces"
          />

          <OverviewCard
            icon={<FolderKanban />}
            label="Projects"
            value={projects.length}
          />

          <OverviewCard
            icon={<Bell />}
            label="Unread notifications"
            value={unreadNotifications}
            href="/notifications"
          />
        </section>

        {/* Main content */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Recent projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Recent projects
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Projects across your workspaces.
                  </p>
                </div>

                <Link
                  href="/workspaces"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {recentProjects.length ===
              0 ? (
                <EmptyState
                  icon={<FolderKanban />}
                  title="No projects yet"
                  description="Create a workspace project to start organizing work."
                  actionHref="/workspaces"
                  actionLabel="Go to workspaces"
                />
              ) : (
                <div className="space-y-2">
                  {recentProjects.map(
                    (project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group block rounded-xl border p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {project.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {project.workspaceName}
                            </p>

                            {project.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                {
                                  project.description
                                }
                              </p>
                            )}
                          </div>

                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Notifications
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your latest updates.
                  </p>
                </div>

                <Link
                  href="/notifications"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {notifications.length ===
              0 ? (
                <EmptyState
                  icon={<Bell />}
                  title="You're all caught up"
                  description="Important updates will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {notifications
                    .slice(0, 5)
                    .map(
                      (notification) => {
                        const unread =
                          notification.read_at ===
                          null;

                        return (
                          <div
                            key={
                              notification.id
                            }
                            className={`rounded-xl border p-4 ${
                              unread
                                ? "bg-muted/40"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                  unread
                                    ? "bg-blue-500"
                                    : "bg-muted-foreground/30"
                                }`}
                              />

                              <div className="min-w-0">
                                <p
                                  className={`text-sm ${
                                    unread
                                      ? "font-medium"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                  {
                                    notification.message
                                  }
                                </p>

                                <time
                                  dateTime={
                                    notification.created_at
                                  }
                                  className="mt-2 block text-[11px] text-muted-foreground"
                                >
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Workspace section */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Your workspaces
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Jump into the workspace you need.
                  </p>
                </div>

                <Badge variant="secondary">
                  {workspaces.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {workspaces.length ===
              0 ? (
                <EmptyState
                  icon={<Users />}
                  title="Create your first workspace"
                  description="A workspace is the home for your team, projects, and tasks."
                  actionHref="/workspaces"
                  actionLabel="Create workspace"
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaces.map(
                    (workspace) => (
                      <Link
                        key={workspace.id}
                        href={`/workspaces/${workspace.id}`}
                        className="group rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted font-semibold">
                            {workspace.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {workspace.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Open workspace
                            </p>
                          </div>

                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </ProtectedRoute>
  );
}

interface OverviewCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
}

function OverviewCard({
  icon,
  label,
  value,
  href,
}: OverviewCardProps) {
  const content = (
    <Card
      className={
        href
          ? "transition-all hover:-translate-y-0.5 hover:shadow-md"
          : ""
      }
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="text-sm text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {actionHref &&
        actionLabel && (
          <Link
            href={actionHref}
            className="mt-4"
          >
            <Button
              variant="outline"
              size="sm"
            >
              {actionLabel}
            </Button>
          </Link>
        )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-8">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-72 animate-pulse rounded bg-muted" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />

              <div className="space-y-2">
                <div className="h-7 w-12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardContent className="space-y-3 p-6">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}