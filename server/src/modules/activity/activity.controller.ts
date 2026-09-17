import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as activityRepository
  from "./activity.repository.js";

export const getTaskActivity = async (
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

    const activity =
      await activityRepository.listEntityActivity(
        "TASK",
        req.task.id,
      );

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};