import { api } from "@/lib/api";
import type { Label } from "./label.types";

export const createLabel = async (
  accessToken: string,
  workspaceId: string,
  data: {
    name: string;
    color?: string;
  },
): Promise<Label> => {
  const response = await api.post<Label>(
    `/workspaces/${workspaceId}/labels`,
    data,
    accessToken,
  );

  return response.data;
};

export const getWorkspaceLabels = async (
  accessToken: string,
  workspaceId: string,
): Promise<Label[]> => {
  const response =
    await api.get<Label[]>(
      `/workspaces/${workspaceId}/labels`,
      accessToken,
    );

  return response.data;
};

export const addLabelToTask = async (
  accessToken: string,
  taskId: string,
  labelId: string,
): Promise<void> => {
  await api.post<undefined>(
    `/tasks/${taskId}/labels/${labelId}`,
    {},
    accessToken,
  );
};

export const removeLabelFromTask = async (
  accessToken: string,
  taskId: string,
  labelId: string,
): Promise<void> => {
  await api.delete<undefined>(
    `/tasks/${taskId}/labels/${labelId}`,
    accessToken,
  );
};

export const getTaskLabels = async (
  accessToken: string,
  taskId: string,
): Promise<Label[]> => {
  const response =
    await api.get<Label[]>(
      `/tasks/${taskId}/labels`,
      accessToken,
    );

  return response.data;
};