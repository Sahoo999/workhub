import { pool } from "../../db/client.js";

export type WorkspaceMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface WorkspaceMemberRecord {
  user_id: string;
  name: string;
  email: string;
  role: WorkspaceMemberRole;
  joined_at: Date;
}

export interface UserLookupRecord {
  id: string;
  name: string;
  email: string;
}

export const listMembers = async (
  workspaceId: string,
): Promise<WorkspaceMemberRecord[]> => {
  const result = await pool.query<WorkspaceMemberRecord>(
    `
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        wm.role,
        wm.created_at AS joined_at
      FROM workspace_members wm
      INNER JOIN users u
        ON u.id = wm.user_id
      WHERE wm.workspace_id = $1
      ORDER BY
        CASE wm.role
          WHEN 'OWNER' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'MEMBER' THEN 3
          WHEN 'VIEWER' THEN 4
          ELSE 5
        END,
        u.name ASC
    `,
    [workspaceId],
  );

  return result.rows;
};

export const findUserByEmail = async (
  email: string,
): Promise<UserLookupRecord | null> => {
  const result = await pool.query<UserLookupRecord>(
    `
      SELECT
        id,
        name,
        email
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
};

export const findMember = async (
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMemberRecord | null> => {
  const result = await pool.query<WorkspaceMemberRecord>(
    `
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        wm.role,
        wm.created_at AS joined_at
      FROM workspace_members wm
      INNER JOIN users u
        ON u.id = wm.user_id
      WHERE wm.workspace_id = $1
        AND wm.user_id = $2
      LIMIT 1
    `,
    [workspaceId, userId],
  );

  return result.rows[0] ?? null;
};

export const addMember = async (
  workspaceId: string,
  userId: string,
  role: Exclude<WorkspaceMemberRole, "OWNER">,
): Promise<WorkspaceMemberRecord> => {
  const result =
    await pool.query<WorkspaceMemberRecord>(
      `
        INSERT INTO workspace_members (
          workspace_id,
          user_id,
          role
        )
        VALUES ($1, $2, $3)
        RETURNING
          user_id,
          role,
          created_at AS joined_at
      `,
      [
        workspaceId,
        userId,
        role,
      ],
    );

  const inserted = result.rows[0];

  if (!inserted) {
    throw new Error(
      "Member was not created.",
    );
  }

  const member = await findMember(
    workspaceId,
    userId,
  );

  if (!member) {
    throw new Error(
      "Created member could not be loaded.",
    );
  }

  return member;
};

export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  role: Exclude<WorkspaceMemberRole, "OWNER">,
): Promise<WorkspaceMemberRecord | null> => {
  const result = await pool.query(
    `
      UPDATE workspace_members
      SET role = $1
      WHERE workspace_id = $2
        AND user_id = $3
        AND role <> 'OWNER'
    `,
    [
      role,
      workspaceId,
      userId,
    ],
  );

  if (result.rowCount !== 1) {
    return null;
  }

  return findMember(
    workspaceId,
    userId,
  );
};

export const removeMember = async (
  workspaceId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM workspace_members
      WHERE workspace_id = $1
        AND user_id = $2
        AND role <> 'OWNER'
    `,
    [
      workspaceId,
      userId,
    ],
  );

  return result.rowCount === 1;
};