import { pool } from "../../db/client.js";

export interface LabelRecord {
  id: string;
  workspace_id: string;
  name: string;
  color: string | null;
  created_at: Date;
}

export const createLabel = async (
  workspaceId: string,
  name: string,
  color: string | null,
): Promise<LabelRecord | null> => {
  const { rows } = await pool.query<LabelRecord>(
    `
      INSERT INTO labels (
        workspace_id,
        name,
        color
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [workspaceId, name, color],
  );

  return rows[0] ?? null;
};


export const findLabelById = async (
  labelId: string,
): Promise<LabelRecord | null> => {
  const { rows } = await pool.query<LabelRecord>(
    `
      SELECT *
      FROM labels
      WHERE id = $1
    `,
    [labelId],
  );

  return rows[0] ?? null;
};

export const listLabelsByWorkspace = async (
  workspaceId: string,
): Promise<LabelRecord[]> => {
  const { rows } = await pool.query<LabelRecord>(
    `
      SELECT *
      FROM labels
      WHERE workspace_id = $1
      ORDER BY name ASC
    `,
    [workspaceId],
  );

  return rows;
};

export const addLabelToTask = async (
  taskId: string,
  labelId: string,
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO task_labels (task_id, label_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `,
    [taskId, labelId],
  );
};

export const removeLabelFromTask = async (
  taskId: string,
  labelId: string,
): Promise<void> => {
  await pool.query(
    `
      DELETE FROM task_labels
      WHERE task_id = $1
        AND label_id = $2
    `,
    [taskId, labelId],
  );
};

export const listTaskLabels = async (
  taskId: string,
): Promise<LabelRecord[]> => {
  const { rows } = await pool.query<LabelRecord>(
    `
      SELECT l.*
      FROM labels l
      INNER JOIN task_labels tl
        ON tl.label_id = l.id
      WHERE tl.task_id = $1
      ORDER BY l.name ASC
    `,
    [taskId],
  );

  return rows;
};