import { api } from "@/lib/api";

import type { Project } from "./project.types";

export const getProjects = async (
  accessToken: string,
  workspaceId: string,
): Promise<Project[]> => {
  const response = await api.get<Project[]>(
    `/workspaces/${workspaceId}/projects`,
    accessToken,
  );

  return response.data;
};

export const createProject = async (
  accessToken: string,
  workspaceId: string,
  data: {
    name: string;
    description?: string;
  },
): Promise<Project> => {
  const response = await api.post<Project>(
    `/workspaces/${workspaceId}/projects`,
    data,
    accessToken,
  );

  return response.data;
};

export const getProject = async (
  accessToken: string,
  projectId: string,
): Promise<Project> => {
  const response = await api.get<Project>(
    `/projects/${projectId}`,
    accessToken,
  );

  return response.data;
};