"use client";

import type {
  TaskPriority,
  TaskStatus,
} from "./task.types";

interface TaskFiltersProps {
  search: string;
  status: TaskStatus | "";
  priority: TaskPriority | "";
  sortBy:
    | "created_at"
    | "due_date"
    | "priority";
  order: "asc" | "desc";

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: TaskStatus | "",
  ) => void;

  onPriorityChange: (
    value: TaskPriority | "",
  ) => void;

  onSortChange: (
    value:
      | "created_at"
      | "due_date"
      | "priority",
  ) => void;

  onOrderChange: (
    value: "asc" | "desc",
  ) => void;
}

export default function TaskFilters({
  search,
  status,
  priority,
  sortBy,
  order,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onOrderChange,
}: TaskFiltersProps) {
  return (
    <section>
      <input
        value={search}
        onChange={(event) =>
          onSearchChange(
            event.target.value,
          )
        }
        placeholder="Search tasks..."
      />

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value as
              | TaskStatus
              | "",
          )
        }
      >
        <option value="">
          All statuses
        </option>

        <option value="TODO">
          Todo
        </option>

        <option value="IN_PROGRESS">
          In Progress
        </option>

        <option value="IN_REVIEW">
          In Review
        </option>

        <option value="DONE">
          Done
        </option>
      </select>

      <select
        value={priority}
        onChange={(event) =>
          onPriorityChange(
            event.target.value as
              | TaskPriority
              | "",
          )
        }
      >
        <option value="">
          All priorities
        </option>

        <option value="LOW">
          Low
        </option>

        <option value="MEDIUM">
          Medium
        </option>

        <option value="HIGH">
          High
        </option>

        <option value="URGENT">
          Urgent
        </option>
      </select>

      <select
        value={sortBy}
        onChange={(event) =>
          onSortChange(
            event.target.value as
              | "created_at"
              | "due_date"
              | "priority",
          )
        }
      >
        <option value="created_at">
          Created
        </option>

        <option value="due_date">
          Due date
        </option>

        <option value="priority">
          Priority
        </option>
      </select>

      <select
        value={order}
        onChange={(event) =>
          onOrderChange(
            event.target.value as
              | "asc"
              | "desc",
          )
        }
      >
        <option value="desc">
          Descending
        </option>

        <option value="asc">
          Ascending
        </option>
      </select>
    </section>
  );
}