import { pool } from "../../db/client.js";
import type { UserRecord } from "../users/users.repository.js";

export const findUserByEmail = async (
  email: string,
): Promise<UserRecord | null> => {
  const { rows } = await pool.query<UserRecord>(
    `
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
};

export const createRefreshToken = async (
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
      VALUES
        ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );
};