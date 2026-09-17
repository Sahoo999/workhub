import { AppError } from "../../utils/app-error.js";
import {
  createNotificationSchema,
} from "./notifications.schema.js";

import * as notificationsRepository
  from "./notifications.repository.js";

export const createNotification = async (
  userId: string,
  input: unknown,
) => {
  const data =
    createNotificationSchema.parse(input);

  return notificationsRepository.createNotification(
    userId,
    data.type,
    data.title,
    data.message,
    data.entityType ?? null,
    data.entityId ?? null,
  );
};

export const getNotifications = async (
  userId: string,
) => {
  return notificationsRepository.listNotifications(
    userId,
  );
};

export const markAsRead = async (
  notificationId: string,
  userId: string,
): Promise<void> => {
  const updated =
    await notificationsRepository.markAsRead(
      notificationId,
      userId,
    );

  if (!updated) {
    throw new AppError(
      "Notification not found",
      404,
      "NOTIFICATION_NOT_FOUND",
    );
  }
};