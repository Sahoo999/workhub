import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  AppError,
} from "../../utils/app-error.js";

import {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from "./members.service.js";

const getParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export const listMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId =
      getParam(req.params.workspaceId);

    const actorUserId =
      req.user?.id;

    if (!workspaceId) {
      throw new AppError(
        "Workspace ID is required.",
        400,
        "INVALID_WORKSPACE_ID",
      );
    }

    if (!actorUserId) {
      throw new AppError(
        "Authentication is required.",
        401,
        "UNAUTHORIZED",
      );
    }

    const members =
      await getMembers(
        workspaceId,
        actorUserId,
      );

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId =
      getParam(req.params.workspaceId);

    const actorUserId =
      req.user?.id;

    if (!workspaceId) {
      throw new AppError(
        "Workspace ID is required.",
        400,
        "INVALID_WORKSPACE_ID",
      );
    }

    if (!actorUserId) {
      throw new AppError(
        "Authentication is required.",
        401,
        "UNAUTHORIZED",
      );
    }

    const member =
      await addMember(
        workspaceId,
        actorUserId,
        req.body,
      );

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const changeMemberRole =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const workspaceId =
        getParam(req.params.workspaceId);

      const targetUserId =
        getParam(req.params.userId);

      const actorUserId =
        req.user?.id;

      if (
        !workspaceId ||
        !targetUserId
      ) {
        throw new AppError(
          "Workspace ID and user ID are required.",
          400,
          "INVALID_REQUEST",
        );
      }

      if (!actorUserId) {
        throw new AppError(
          "Authentication is required.",
          401,
          "UNAUTHORIZED",
        );
      }

      const member =
        await updateMemberRole(
          workspaceId,
          actorUserId,
          targetUserId,
          req.body,
        );

      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId =
      getParam(req.params.workspaceId);

    const targetUserId =
      getParam(req.params.userId);

    const actorUserId =
      req.user?.id;

    if (
      !workspaceId ||
      !targetUserId
    ) {
      throw new AppError(
        "Workspace ID and user ID are required.",
        400,
        "INVALID_REQUEST",
      );
    }

    if (!actorUserId) {
      throw new AppError(
        "Authentication is required.",
        401,
        "UNAUTHORIZED",
      );
    }

    await removeMember(
      workspaceId,
      actorUserId,
      targetUserId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};