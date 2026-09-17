import { pool } from "../../db/client.js";

export type ActivityInput = {
  workspaceId: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

export const createActivity = async (
  data: ActivityInput,
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO activity_logs (
        workspace_id,
        actor_id,
        entity_type,
        entity_id,
        action,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      data.workspaceId,
      data.actorId,
      data.entityType,
      data.entityId,
      data.action,
      JSON.stringify(data.metadata ?? {}),
    ],
  );
};

export const listEntityActivity = async (
  entityType: string,
  entityId: string,
) => {
  const { rows } = await pool.query(
    `
      SELECT
        al.id,
        al.entity_type,
        al.entity_id,
        al.action,
        al.metadata,
        al.created_at,
        u.id AS actor_id,
        u.name AS actor_name
      FROM activity_logs al
      LEFT JOIN users u
        ON u.id = al.actor_id
      WHERE al.entity_type = $1
        AND al.entity_id = $2
      ORDER BY al.created_at DESC
    `,
    [entityType, entityId],
  );

  return rows;
};