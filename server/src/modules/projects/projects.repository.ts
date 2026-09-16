import { pool } from "../../db/client.js";

export interface ProjectRecord {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export const createProject = async (
  workspaceId: string,
  userId: string,
  name: string,
  description: string | null,
): Promise<ProjectRecord | null> => {
  const { rows } = await pool.query<ProjectRecord>(
    `
      INSERT INTO projects (
        workspace_id,
        name,
        description,
        created_by
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        workspace_id,
        name,
        description,
        created_by,
        created_at,
        updated_at
    `,
    [workspaceId, name, description, userId],
  );

  return rows[0] ?? null;
};

export const findProjectsByWorkspaceId = async (
  workspaceId: string,
): Promise<ProjectRecord[]> => {
  const { rows } = await pool.query<ProjectRecord>(
    `
      SELECT
        id,
        workspace_id,
        name,
        description,
        created_by,
        created_at,
        updated_at
      FROM projects
      WHERE workspace_id = $1
      ORDER BY created_at DESC
    `,
    [workspaceId],
  );

  return rows;
};

export const findProjectById = async (
  projectId: string,
): Promise<ProjectRecord | null> => {
  const { rows } = await pool.query<ProjectRecord>(
    `
      SELECT
        id,
        workspace_id,
        name,
        description,
        created_by,
        created_at,
        updated_at
      FROM projects
      WHERE id = $1
      LIMIT 1
    `,
    [projectId],
  );

  return rows[0] ?? null;
};

export const updateProject = async (
  projectId: string,
  name: string,
  description: string | null,
): Promise<ProjectRecord | null> => {
  const { rows } = await pool.query<ProjectRecord>(
    `
      UPDATE projects
      SET
        name = $1,
        description = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        workspace_id,
        name,
        description,
        created_by,
        created_at,
        updated_at
    `,
    [name, description, projectId],
  );

  return rows[0] ?? null;
};