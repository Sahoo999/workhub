import { api } from "@/lib/api";

import type { Comment } from "./comment.types";

export interface CreateCommentInput {
  content: string;
}

export const getComments = async (
  taskId: string,
  accessToken: string,
): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(
    `/tasks/${taskId}/comments`,
    accessToken,
  );

  return response.data;
};

export const createComment = async (
  taskId: string,
  input: CreateCommentInput,
  accessToken: string,
): Promise<Comment> => {
  const response = await api.post<Comment>(
    `/tasks/${taskId}/comments`,
    input,
    accessToken,
  );

  return response.data;
};