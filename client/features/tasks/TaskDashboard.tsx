"use client";

import {
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  getTasks,
} from "./tasks.api";

import CreateTaskForm from "./CreateTaskForm";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "./task.types";

interface TaskDashboardProps {
  projectId: string;
}

export default function TaskDashboard({
  projectId,
}: TaskDashboardProps) {
  const { accessToken } = useAuth();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus | "">("");

  const [priority, setPriority] =
    useState<TaskPriority | "">("");

  const [sortBy, setSortBy] =
    useState<
      "created_at" |
      "due_date" |
      "priority"
    >("created_at");

  const [order, setOrder] =
    useState<
      "asc" | "desc"
    >("desc");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await getTasks(
            accessToken,
            projectId,
            {
              page,
              limit: 10,
              status:
                status || undefined,
              priority:
                priority || undefined,
              search:
                search.trim() ||
                undefined,
              sortBy,
              order,
            },
          );

        setTasks(
          result.items,
        );

        setTotalPages(
          result.pagination.totalPages,
        );
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Unable to load tasks.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void loadTasks();
  }, [
    accessToken,
    projectId,
    page,
    status,
    priority,
    search,
    sortBy,
    order,
  ]);

  const handleTaskCreated = (
    task: Task,
  ) => {
    setTasks((current) => [
      task,
      ...current,
    ]);
  };

  const handleStatusChange = (
    value: TaskStatus | "",
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handlePriorityChange = (
    value: TaskPriority | "",
  ) => {
    setPriority(value);
    setPage(1);
  };

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <section>
      <CreateTaskForm
        projectId={projectId}
        onCreated={
          handleTaskCreated
        }
      />

      <TaskFilters
        search={search}
        status={status}
        priority={priority}
        sortBy={sortBy}
        order={order}
        onSearchChange={
          handleSearchChange
        }
        onStatusChange={
          handleStatusChange
        }
        onPriorityChange={
          handlePriorityChange
        }
        onSortChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onOrderChange={(value) => {
          setOrder(value);
          setPage(1);
        }}
      />

      {loading && (
        <p>Loading tasks...</p>
      )}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <TaskList tasks={tasks} />
      )}

      {!loading &&
        !error &&
        totalPages > 1 && (
          <div>
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1,
                )
              }
            >
              Previous
            </button>

            <span>
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
            >
              Next
            </button>
          </div>
        )}
    </section>
  );
}