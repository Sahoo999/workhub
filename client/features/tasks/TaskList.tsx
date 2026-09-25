"use client";

import Link from "next/link";

import type {
  Task,
} from "./task.types";

interface TaskListProps {
  tasks: Task[];
}

const statusLabel: Record<
  Task["status"],
  string
> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityLabel: Record<
  Task["priority"],
  string
> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export default function TaskList({
  tasks,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section>
        <h2>No tasks</h2>
        <p>
          Create your first task.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Tasks</h2>

      {tasks.map((task) => (
        <article key={task.id}>
          <Link
            href={`/tasks/${task.id}`}
          >
            <h3>{task.title}</h3>
          </Link>

          <p>
            Status:{" "}
            {statusLabel[task.status]}
          </p>

          <p>
            Priority:{" "}
            {priorityLabel[task.priority]}
          </p>

          {task.description && (
            <p>
              {task.description}
            </p>
          )}

          {task.due_date && (
            <p>
              Due:{" "}
              {new Date(
                task.due_date,
              ).toLocaleString()}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}