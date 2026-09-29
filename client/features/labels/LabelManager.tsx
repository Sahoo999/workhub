"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import {
  addLabelToTask,
  createLabel,
  getTaskLabels,
  getWorkspaceLabels,
  removeLabelFromTask,
} from "./labels.api";

import type { Label } from "./label.types";

interface LabelManagerProps {
  workspaceId: string;
  taskId: string;
}

export default function LabelManager({
  workspaceId,
  taskId,
}: LabelManagerProps) {
  const { accessToken } = useAuth();

  const [workspaceLabels, setWorkspaceLabels] =
    useState<Label[]>([]);

  const [taskLabels, setTaskLabels] =
    useState<Label[]>([]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingLabelId, setUpdatingLabelId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
  if (!accessToken) {
    return;
  }

  let cancelled = false;

  const loadLabels = async () => {
    try {
      const [workspaceData, taskData] =
        await Promise.all([
          getWorkspaceLabels(
            accessToken,
            workspaceId,
          ),
          getTaskLabels(
            accessToken,
            taskId,
          ),
        ]);

      if (cancelled) {
        return;
      }

      setWorkspaceLabels(workspaceData);
      setTaskLabels(taskData);
      setError("");
      setLoading(false);
    } catch (error) {
      if (cancelled) {
        return;
      }

      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to load labels");
      }

      setLoading(false);
    }
  };

  void loadLabels();

  return () => {
    cancelled = true;
  };
}, [
  accessToken,
  workspaceId,
  taskId,
]);
    
  const handleCreateLabel = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Label name is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const label =
        await createLabel(
          accessToken,
          workspaceId,
          {
            name: trimmedName,
            ...(color.trim()
              ? { color: color.trim() }
              : {}),
          },
        );

      setWorkspaceLabels(
        (current) => [
          ...current,
          label,
        ].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setName("");
      setColor("");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create label");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleAddLabel = async (
    labelId: string,
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      setUpdatingLabelId(labelId);
      setError("");

      await addLabelToTask(
        accessToken,
        taskId,
        labelId,
      );

      const label =
        workspaceLabels.find(
          (item) => item.id === labelId,
        );

      if (label) {
        setTaskLabels((current) => {
          if (
            current.some(
              (item) => item.id === label.id,
            )
          ) {
            return current;
          }

          return [...current, label].sort(
            (a, b) =>
              a.name.localeCompare(b.name),
          );
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to add label");
      }
    } finally {
      setUpdatingLabelId(null);
    }
  };

  const handleRemoveLabel = async (
    labelId: string,
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      setUpdatingLabelId(labelId);
      setError("");

      await removeLabelFromTask(
        accessToken,
        taskId,
        labelId,
      );

      setTaskLabels((current) =>
        current.filter(
          (label) => label.id !== labelId,
        ),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to remove label");
      }
    } finally {
      setUpdatingLabelId(null);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Labels</h2>
        <p>Loading labels...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Labels</h2>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <div>
        <h3>Assigned labels</h3>

        {taskLabels.length === 0 ? (
          <p>No labels assigned.</p>
        ) : (
          <div>
            {taskLabels.map((label) => (
              <span key={label.id}>
                {label.color && (
                  <span
                    aria-hidden="true"
                    style={{
                      display:
                        "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius:
                        "50%",
                      backgroundColor:
                        label.color,
                      marginRight: 6,
                    }}
                  />
                )}

                {label.name}

                <button
                  type="button"
                  onClick={() =>
                    void handleRemoveLabel(
                      label.id,
                    )
                  }
                  disabled={
                    updatingLabelId ===
                    label.id
                  }
                  style={{
                    marginLeft: 6,
                  }}
                >
                  Remove
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>Add label</h3>

        {workspaceLabels.length === 0 ? (
          <p>
            No workspace labels exist yet.
          </p>
        ) : (
          <div>
            {workspaceLabels
              .filter(
                (workspaceLabel) =>
                  !taskLabels.some(
                    (taskLabel) =>
                      taskLabel.id ===
                      workspaceLabel.id,
                  ),
              )
              .map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    void handleAddLabel(
                      label.id,
                    )
                  }
                  disabled={
                    updatingLabelId ===
                    label.id
                  }
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  {label.name}
                </button>
              ))}
          </div>
        )}
      </div>

      <form onSubmit={handleCreateLabel}>
        <h3>Create label</h3>

        <div>
          <label htmlFor="label-name">
            Name
          </label>

          <input
            id="label-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={50}
            placeholder="e.g. Bug"
          />
        </div>

        <div>
          <label htmlFor="label-color">
            Color
          </label>

          <input
            id="label-color"
            value={color}
            onChange={(event) =>
              setColor(event.target.value)
            }
            maxLength={20}
            placeholder="e.g. #ef4444"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
        >
          {creating
            ? "Creating..."
            : "Create label"}
        </button>
      </form>
    </section>
  );
}