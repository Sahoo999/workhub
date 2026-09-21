import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";
import * as workspaceService from "./workspaces.service.js";

export const createWorkspace = async (
  req: Request,
  res: Response,
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

    const workspace =
      await workspaceService.createWorkspace(
        req.body,
        req.user.id,
      );

    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (
  req: Request,
  res: Response,
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

    const workspaces =
      await workspaceService.getWorkspaces(
        req.user.id,
      );

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const workspaceId =
      req.params.workspaceId;

    if (!workspaceId || typeof workspaceId !== "string") {
      next(
        new AppError(
          "Workspace ID is required",
          400,
          "WORKSPACE_ID_REQUIRED",
        ),
      );
      return;
    }

    const workspace =
      await workspaceService.getWorkspace(
        workspaceId,
      );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};