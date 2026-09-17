import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../../utils/app-error.js";

import * as notificationsService
  from "./notifications.service.js";

export const getNotifications = async (
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

    const notifications =
      await notificationsService.getNotifications(
        req.user.id,
      );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
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

    const notificationId =
      req.params.notificationId;

    if (!notificationId || typeof notificationId !=="string") {
      next(
        new AppError(
          "Notification ID is required",
          400,
          "NOTIFICATION_ID_REQUIRED",
        ),
      );
      return;
    }

    await notificationsService.markAsRead(
      notificationId,
      req.user.id,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};