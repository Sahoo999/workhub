import type { PoolClient } from "pg";
import { pool } from "../../db/client.js";

export interface WorkspaceRecord {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export const createWorkspace = async (
  client: PoolClient,
  name: string,
  userId: string,
): Promise<WorkspaceRecord | null> => {
  const { rows } = await client.query<WorkspaceRecord>(
    `
      INSERT INTO workspaces (name, created_by)
      VALUES ($1, $2)
      RETURNING id, name, created_by, created_at, updated_at
    `,
    [name, userId],
  );

  return rows[0] ?? null;
};

export const addMember = async (
  client: PoolClient,
  workspaceId: string,
  userId: string,
  role: string,
): Promise<void> => {
  await client.query(
    `
      INSERT INTO workspace_members
        (workspace_id, user_id, role)
      VALUES
        ($1, $2, $3)
    `,
    [workspaceId, userId, role],
  );
};


export interface WorkspaceMembership {
  workspace_id: string;
  user_id: string;
  role: string;
}

export const findMembership = async (
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMembership | null> => {
  const { rows } = await pool.query<WorkspaceMembership>(
    `
      SELECT workspace_id, user_id, role
      FROM workspace_members
      WHERE workspace_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [workspaceId, userId],
  );

  return rows[0] ?? null;
};