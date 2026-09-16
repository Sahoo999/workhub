import { AppError } from "../../utils/app-error.js";
import {
  createCommentSchema,
} from "./comments.schema.js";
import * as commentsRepository from "./comments.repository.js";

export const createComment = async (
  input: unknown,
  taskId: string,
  userId: string,
) => {
  const data = createCommentSchema.parse(input);

  return commentsRepository.createComment(
    taskId,
    userId,
    data.content,
  );
};

export const getComments = async (
  taskId: string,
) => {
  return commentsRepository.listComments(taskId);
};