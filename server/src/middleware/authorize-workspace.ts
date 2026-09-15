import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/app-error.js";
import * as workspaceRepository from "../modules/workspaces/workspaces.repository.js";

export const requireWorkspaceMember = async (
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

    const workspaceId = req.params.workspaceId;

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

    const membership =
      await workspaceRepository.findMembership(
        workspaceId,
        req.user.id,
      );

    if (!membership) {
      next(
        new AppError(
          "You do not have access to this workspace",
          403,
          "WORKSPACE_ACCESS_DENIED",
        ),
      );
      return;
    }

    req.workspace = {
      id: membership.workspace_id,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};