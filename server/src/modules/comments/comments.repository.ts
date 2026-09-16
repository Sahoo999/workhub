import { pool } from "../../db/client.js";

export interface CommentRecord {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export const createComment = async (
  taskId: string,
  userId: string,
  content: string,
): Promise<CommentRecord | null> => {
  const { rows } = await pool.query<CommentRecord>(
    `
      INSERT INTO comments (
        task_id,
        user_id,
        content
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [taskId, userId, content],
  );

  return rows[0] ?? null;
};

export const listComments = async (
  taskId: string,
): Promise<CommentRecord[]> => {
  const { rows } = await pool.query<CommentRecord>(
    `
      SELECT *
      FROM comments
      WHERE task_id = $1
      ORDER BY created_at ASC
    `,
    [taskId],
  );

  return rows;
};