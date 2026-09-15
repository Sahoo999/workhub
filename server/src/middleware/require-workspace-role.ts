import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/app-error.js";

export const requireWorkspaceRole = (
  ...allowedRoles: string[]
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
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

    if (!allowedRoles.includes(req.workspace.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "INSUFFICIENT_PERMISSIONS",
        ),
      );
      return;
    }

    next();
  };
};