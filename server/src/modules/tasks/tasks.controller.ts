import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as tasksService from "./tasks.service.js";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.project || !req.user) {
      next(
        new AppError(
          "Project context missing",
          403,
          "PROJECT_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const task = await tasksService.createTask(
      req.body,
      req.project.id,
      req.project.workspaceId,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = req.params.taskId;

    if (!taskId || typeof taskId !== "string") {
      next(
        new AppError(
          "Task ID is required",
          400,
          "TASK_ID_REQUIRED",
        ),
      );
      return;
    }

    const task = await tasksService.getTask(taskId);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.project) {
      next(
        new AppError(
          "Project context missing",
          403,
          "PROJECT_CONTEXT_MISSING",
        ),
      );
      return;
    }

    const result = await tasksService.getTasks(
      req.project.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = req.params.taskId;

    if (!taskId || typeof taskId !== "string") {
      next(
        new AppError(
          "Task ID is required",
          400,
          "TASK_ID_REQUIRED",
        ),
      );
      return;
    }

    if (!req.user || !req.task) {
  next(
    new AppError(
      "Task context missing",
      403,
      "TASK_CONTEXT_MISSING",
    ),
  );
  return;
}

    const task = await tasksService.updateTask(
      taskId,
      req.body,
      req.task.workspaceId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};