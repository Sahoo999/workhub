import { api } from "@/lib/api";

import type {
  Notification,
} from "./notification.types";

export const getNotifications = async (
  accessToken: string,
): Promise<Notification[]> => {
  const response =
    await api.get<Notification[]>(
      "/notifications",
      accessToken,
    );

  return response.data;
};

export const markNotificationAsRead =
  async (
    accessToken: string,
    notificationId: string,
  ): Promise<void> => {
    await api.patch(
      `/notifications/${notificationId}/read`,
      {},
      accessToken,
    );
  };