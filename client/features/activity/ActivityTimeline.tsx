"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Check,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  ApiError,
} from "@/lib/api";

import {
  getTaskActivity,
} from "./activity.api";

import type {
  ActivityLog,
} from "./activity.types";

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

interface ActivityTimelineProps {
  taskId: string;
  accessToken: string;
}

const actionLabel = (
  action: string,
): string => {
  const labels: Record<
    string,
    string
  > = {
    CREATED: "created this task",
    UPDATED: "updated this task",
    STATUS_CHANGED:
      "changed the task status",
    PRIORITY_CHANGED:
      "changed the task priority",
    ASSIGNED: "assigned this task",
    UNASSIGNED:
      "removed the task assignment",
  };

  return (
    labels[action] ??
    action
      .replaceAll("_", " ")
      .toLowerCase()
  );
};

export default function ActivityTimeline({
  taskId,
  accessToken,
}: ActivityTimelineProps) {
  const [activities, setActivities] =
    useState<ActivityLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryKey, setRetryKey] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      try {
        const data =
          await getTaskActivity(
            accessToken,
            taskId,
          );

        if (cancelled) {
          return;
        }

        setActivities(data);
        setError(null);
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load activity.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    taskId,
    retryKey,
  ]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    setRetryKey(
      (current) => current + 1,
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4" />
              Activity
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              A history of changes made to this task.
            </p>
          </div>

          <Badge variant="secondary">
            {activities.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading activity...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
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
              className="mt-4"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : activities.length ===
          0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-4 font-medium">
              No activity yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Changes to this task will appear here.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border" />

            <div className="space-y-6">
              {activities.map(
                (activity) => (
                  <div
                    key={activity.id}
                    className="relative flex gap-4"
                  >
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                          <span className="font-medium">
                            {activity.actor_id ??
                              "System"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {actionLabel(
                              activity.action,
                            )}
                          </span>
                        </p>

                        <time
                          dateTime={
                            activity.created_at
                          }
                          className="text-xs text-muted-foreground"
                        >
                          {new Date(
                            activity.created_at,
                          ).toLocaleString()}
                        </time>
                      </div>

                      {Object.keys(
                        activity.metadata,
                      ).length > 0 && (
                        <div className="mt-2 rounded-lg bg-muted/40 p-3">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Details
                          </p>

                          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                            {JSON.stringify(
                              activity.metadata,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}