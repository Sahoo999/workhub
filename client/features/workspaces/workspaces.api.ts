import { api } from "@/lib/api";

import type { Workspace, WorkspaceDetail } from "./workspace.types";

export const getWorkspaces = async (
  accessToken: string,
): Promise<Workspace[]> => {
  const response =
    await api.get<Workspace[]>(
      "/workspaces",
      accessToken,
    );

  return response.data;
};

export const createWorkspace = async (
  accessToken: string,
  data: {
    name: string;
  },
): Promise<Workspace> => {
  const response =
    await api.post<Workspace>(
      "/workspaces",
      data,
      accessToken,
    );

  return response.data;
};

export const getWorkspace = async (
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceDetail> => {
  const response =
    await api.get<WorkspaceDetail>(
      `/workspaces/${workspaceId}`,
      accessToken,
    );

  return response.data;
};