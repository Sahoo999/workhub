"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Bell,
  Check,
  Circle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { ApiError } from "@/lib/api";

import {
  useAuth,
} from "@/components/AuthProvider";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getNotifications,
  markNotificationAsRead,
} from "@/features/notifications/notifications.api";

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

import { getTask } from "@/features/tasks/tasks.api";

export default function NotificationsPage() {
  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [taskHrefs, setTaskHrefs] =
  useState<Record<string, string>>({});

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.read_at === null,
      ).length,
    [notifications],
  );

  useEffect(() => {
    if (
      authLoading ||
      !accessToken
    ) {
      return;
    }

    let cancelled = false;

    const loadNotifications =
      async () => {
        try {
          const data =
            await getNotifications(
              accessToken,
            );

          if (cancelled) {
            return;
          }

          setNotifications(data);
          setError(null);
        } catch (
          error: unknown
        ) {
          if (cancelled) {
            return;
          }

          if (
            error instanceof ApiError
          ) {
            setError(error.message);
          } else {
            setError(
              "Unable to load your notifications.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    authLoading,
  ]);

  useEffect(() => {
  if (
    authLoading ||
    !accessToken ||
    notifications.length === 0
  ) {
    return;
  }

  let cancelled = false;

  const loadTaskHrefs = async () => {
    const taskNotifications =
      notifications.filter(
        (notification) =>
          notification.entity_type === "TASK" &&
          notification.entity_id,
      );

    if (taskNotifications.length === 0) {
      return;
    }

    const entries =
      await Promise.all(
        taskNotifications.map(
          async (notification) => {
            try {
              const task =
                await getTask(
                  accessToken,
                  notification.entity_id!,
                );

              return [
                notification.id,
                `/projects/${task.project_id}/tasks/${task.id}`,
              ] as const;
            } catch {
              return null;
            }
          },
        ),
      );

    if (cancelled) {
      return;
    }

    const nextHrefs: Record<string, string> = {};

    for (const entry of entries) {
      if (entry) {
        const [notificationId, href] =
          entry;

        nextHrefs[notificationId] = href;
      }
    }

    setTaskHrefs(nextHrefs);
  };

  void loadTaskHrefs();

  return () => {
    cancelled = true;
  };
}, [
  authLoading,
  accessToken,
  notifications,
]);

  const handleMarkAsRead =
    async (
      notification: Notification,
    ) => {
      if (
        !accessToken ||
        notification.read_at !== null
      ) {
        return;
      }

      try {
        setProcessingId(
          notification.id,
        );

        await markNotificationAsRead(
          accessToken,
          notification.id,
        );

        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      read_at:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        );
      } catch (
        error: unknown
      ) {
        if (
          error instanceof ApiError
        ) {
          setError(error.message);
        } else {
          setError(
            "Unable to mark the notification as read.",
          );
        }
      } finally {
        setProcessingId(null);
      }
    };

  const getNotificationHref = (
  notification: Notification,
): string | null => {
  if (!notification.entity_id) {
    return null;
  }

  if (
    notification.entity_type === "TASK"
  ) {
    return (
      taskHrefs[notification.id] ??
      null
    );
  }

  if (
    notification.entity_type === "PROJECT"
  ) {
    return `/projects/${notification.entity_id}`;
  }

  return null;
};

  if (
    authLoading ||
    loading
  ) {
    return (
      <ProtectedRoute>
        <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notifications...
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!accessToken) {
    return null;
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl space-y-6 p-6 lg:p-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Notifications
                  </h1>

                  {unreadCount >
                    0 && (
                    <Badge>
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Stay updated on activity that
                  matters to you.
                </p>
              </div>
            </div>
          </div>
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
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Recent activity
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length ===
            0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="mt-5 font-semibold">
                  You&apos;re all caught up
                </h2>

                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                  New task assignments, updates,
                  and other important activity will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(
                  (notification) => {
                    const unread =
                      notification.read_at ===
                      null;

                    const href =
                      getNotificationHref(
                        notification,
                      );

                    const busy =
                      processingId ===
                      notification.id;

                    const content = (
                      <div
                        className={`flex gap-4 p-5 transition-colors ${
                          unread
                            ? "bg-muted/30"
                            : "bg-background"
                        } ${
                          href
                            ? "cursor-pointer hover:bg-muted/50"
                            : ""
                        }`}
                      >
                        <div className="pt-1">
                          {unread ? (
                            <Circle className="h-2.5 w-2.5 fill-current text-blue-500" />
                          ) : (
                            <Check className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p
                                className={`font-medium ${
                                  unread
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </p>

                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {
                                  notification.message
                                }
                              </p>
                            </div>

                            <time
                              dateTime={
                                notification.created_at
                              }
                              className="shrink-0 text-xs text-muted-foreground"
                            >
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </time>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            {unread && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                  busy
                                }
                                onClick={(
                                  event,
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();

                                  void handleMarkAsRead(
                                    notification,
                                  );
                                }}
                              >
                                {busy ? (
                                  <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-3.5 w-3.5" />
                                    Mark as read
                                  </>
                                )}
                              </Button>
                            )}

                            {href && (
                              <Badge variant="secondary">
                                Open
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    if (!href) {
                      return (
                        <div
                          key={
                            notification.id
                          }
                        >
                          {content}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={
                          notification.id
                        }
                        href={href}
                        onClick={() => {
                          if (unread) {
                            void handleMarkAsRead(
                              notification,
                            );
                          }
                        }}
                      >
                        {content}
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}