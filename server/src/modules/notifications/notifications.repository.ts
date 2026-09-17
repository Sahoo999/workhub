import { pool } from "../../db/client.js";

export interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: Date | null;
  created_at: Date;
}

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  entityType: string | null,
  entityId: string | null,
): Promise<NotificationRecord> => {
  const { rows } = await pool.query<NotificationRecord>(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        read_at,
        created_at
    `,
    [
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
    ],
  );

  const notification = rows[0];

  if (!notification) {
    throw new Error("Notification was not created");
  }

  return notification;
};

export const listNotifications = async (
  userId: string,
): Promise<NotificationRecord[]> => {
  const { rows } =
    await pool.query<NotificationRecord>(
      `
        SELECT
          id,
          user_id,
          type,
          title,
          message,
          entity_type,
          entity_id,
          read_at,
          created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [userId],
    );

  return rows;
};

export const markAsRead = async (
  notificationId: string,
  userId: string,
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1
        AND user_id = $2
        AND read_at IS NULL
    `,
    [notificationId, userId],
  );

  return rowCount === 1;
};