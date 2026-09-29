import { api } from "@/lib/api";

import type {
  ActivityLog,
} from "./activity.types";

export const getTaskActivity = async (
  accessToken: string,
  taskId: string,
): Promise<ActivityLog[]> => {
  const response =
    await api.get<ActivityLog[]>(
      `/tasks/${taskId}/activity`,
      accessToken,
    );

  return response.data;
};