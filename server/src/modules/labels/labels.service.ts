import { AppError } from "../../utils/app-error.js";
import {
  createLabelSchema,
} from "./labels.schema.js";
import * as labelsRepository from "./labels.repository.js";

export const createLabel = async (
  input: unknown,
  workspaceId: string,
) => {
  const data = createLabelSchema.parse(input);

  try {
    return await labelsRepository.createLabel(
      workspaceId,
      data.name,
      data.color ?? null,
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError(
        "A label with this name already exists",
        409,
        "LABEL_ALREADY_EXISTS",
      );
    }

    throw error;
  }
};

export const getWorkspaceLabels = async (
  workspaceId: string,
) => {
  return labelsRepository.listLabelsByWorkspace(
    workspaceId,
  );
};

export const addLabelToTask = async (
  taskId: string,
  labelId: string,
  workspaceId: string,
) => {
  const label =
    await labelsRepository.findLabelById(labelId);

  if (!label) {
    throw new AppError(
      "Label not found",
      404,
      "LABEL_NOT_FOUND",
    );
  }

  // Critical multi-tenant check.
  if (label.workspace_id !== workspaceId) {
    throw new AppError(
      "Label does not belong to this workspace",
      403,
      "LABEL_WORKSPACE_MISMATCH",
    );
  }

  await labelsRepository.addLabelToTask(
    taskId,
    labelId,
  );
};

export const removeLabelFromTask = async (
  taskId: string,
  labelId: string,
  workspaceId: string,
) => {
  const label =
    await labelsRepository.findLabelById(labelId);

  if (!label) {
    throw new AppError(
      "Label not found",
      404,
      "LABEL_NOT_FOUND",
    );
  }

  if (label.workspace_id !== workspaceId) {
    throw new AppError(
      "Label does not belong to this workspace",
      403,
      "LABEL_WORKSPACE_MISMATCH",
    );
  }

  await labelsRepository.removeLabelFromTask(
    taskId,
    labelId,
  );
};

export const getTaskLabels = async (
  taskId: string,
) => {
  return labelsRepository.listTaskLabels(taskId);
};