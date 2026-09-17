import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as labelsService from "./labels.service.js";

export const createLabel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.workspace) {
      next(
        new AppError(
          "Workspace context missing",
          403,
          "WORKSPACE_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const label = await labelsService.createLabel(
      req.body,
      req.workspace.id,
    );

    res.status(201).json({
      success: true,
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.workspace) {
      next(
        new AppError(
          "Workspace context missing",
          403,
          "WORKSPACE_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const labels =
      await labelsService.getWorkspaceLabels(
        req.workspace.id,
      );

    res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error) {
    next(error);
  }
};

export const addLabelToTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.task) {
      next(
        new AppError(
          "Task context missing",
          403,
          "TASK_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const labelId = req.params.labelId;

    if (!labelId || typeof labelId !=="string") {
      next(
        new AppError(
          "Label ID is required",
          400,
          "LABEL_ID_REQUIRED",
        ),
      );
      return;
    }

    await labelsService.addLabelToTask(
      req.task.id,
      labelId,
      req.task.workspaceId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const removeLabelFromTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.task) {
      next(
        new AppError(
          "Task context missing",
          403,
          "TASK_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const labelId = req.params.labelId;

    if (!labelId || typeof labelId !=="string") {
      next(
        new AppError(
          "Label ID is required",
          400,
          "LABEL_ID_REQUIRED",
        ),
      );
      return;
    }

    await labelsService.removeLabelFromTask(
      req.task.id,
      labelId,
      req.task.workspaceId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getTaskLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.task) {
      next(
        new AppError(
          "Task context missing",
          403,
          "TASK_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const labels =
      await labelsService.getTaskLabels(
        req.task.id,
      );

    res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error) {
    next(error);
  }
};