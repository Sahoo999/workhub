import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as commentsService from "./comments.service.js";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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

    const comment = await commentsService.createComment(
      req.body,
      req.task.id,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
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

    const comments =
      await commentsService.getComments(taskId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};