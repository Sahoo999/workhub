import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/app-error.js";
import * as projectsRepository from "../modules/projects/projects.repository.js";
import * as workspaceRepository from "../modules/workspaces/workspaces.repository.js";

export const requireProjectAccess = async (
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

    const projectId = req.params.projectId;

    if (!projectId || typeof projectId !== "string") {
      next(
        new AppError(
          "Project ID is required",
          400,
          "PROJECT_ID_REQUIRED",
        ),
      );
      return;
    }

    const project =
      await projectsRepository.findProjectById(projectId);

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
          "You do not have access to this project",
          403,
          "PROJECT_ACCESS_DENIED",
        ),
      );
      return;
    }

    req.project = {
      id: project.id,
      workspaceId: project.workspace_id,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};