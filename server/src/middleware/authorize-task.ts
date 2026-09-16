import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/app-error.js";
import * as tasksRepository from "../modules/tasks/tasks.repository.js";
import * as projectsRepository from "../modules/projects/projects.repository.js";
import * as workspaceRepository from "../modules/workspaces/workspaces.repository.js";

export const requireTaskAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(
        new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED",
        ),
      );
      return;
    }

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

    const task =
      await tasksRepository.findTaskById(taskId);

    if (!task) {
      next(
        new AppError(
          "Task not found",
          404,
          "TASK_NOT_FOUND",
        ),
      );
      return;
    }

    const project =
      await projectsRepository.findProjectById(
        task.project_id,
      );

    if (!project) {
      next(
        new AppError(
          "Project not found",
          404,
          "PROJECT_NOT_FOUND",
        ),
      );
      return;
    }

    const membership =
      await workspaceRepository.findMembership(
        project.workspace_id,
        req.user.id,
      );

    if (!membership) {
      next(
        new AppError(
          "You do not have access to this task",
          403,
          "TASK_ACCESS_DENIED",
        ),
      );
      return;
    }

    req.task = {
      id: task.id,
      projectId: task.project_id,
      workspaceId: project.workspace_id,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};