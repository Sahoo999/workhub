import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as projectsService from "./projects.service.js";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || !req.workspace) {
      next(
        new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED",
        ),
      );
      return;
    }

    const project = await projectsService.createProject(
      req.body,
      req.workspace.id,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
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

    const projects = await projectsService.getProjects(
      req.workspace.id,
    );

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
      await projectsService.getProject(projectId);

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
      await projectsService.updateProject(
        projectId,
        req.body,
      );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};