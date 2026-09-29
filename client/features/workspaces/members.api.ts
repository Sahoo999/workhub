import { api } from "@/lib/api";

import type {
  WorkspaceMember,
  WorkspaceMemberRole,
} from "./member.types";

export const getMembers = async (
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceMember[]> => {
  const response =
    await api.get<WorkspaceMember[]>(
      `/workspaces/${workspaceId}/members`,
      accessToken,
    );

  return response.data;
};

export const addMember = async (
  accessToken: string,
  workspaceId: string,
  data: {
    email: string;
    role: Exclude<
      WorkspaceMemberRole,
      "OWNER"
    >;
  },
): Promise<WorkspaceMember> => {
  const response =
    await api.post<WorkspaceMember>(
      `/workspaces/${workspaceId}/members`,
      data,
      accessToken,
    );

  return response.data;
};

export const updateMemberRole = async (
  accessToken: string,
  workspaceId: string,
  userId: string,
  role: Exclude<
    WorkspaceMemberRole,
    "OWNER"
  >,
): Promise<WorkspaceMember> => {
  const response =
    await api.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}`,
      {
        role,
      },
      accessToken,
    );

  return response.data;
};

export const removeMember = async (
  accessToken: string,
  workspaceId: string,
  userId: string,
): Promise<void> => {
  await api.delete(
    `/workspaces/${workspaceId}/members/${userId}`,
    accessToken,
  );
};