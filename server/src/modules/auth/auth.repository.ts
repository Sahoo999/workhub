import { pool } from "../../db/client.js";
import type { UserRecord } from "../users/users.repository.js";
import type { PoolClient } from "pg";

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

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

export const createRefreshTokenTx = async (
  client: PoolClient,
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> => {
  await client.query(
    `
      INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
      VALUES
        ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );
};

export const revokeRefreshToken = async (
  client: PoolClient,
  tokenId: string,
): Promise<void> => {
  await client.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
        AND revoked_at IS NULL
    `,
    [tokenId],
  );
};
export const findValidRefreshToken = async (
  tokenHash: string,
): Promise<RefreshTokenRecord | null> => {
  const { rows } =
    await pool.query<RefreshTokenRecord>(
      `
        SELECT
          id,
          user_id,
          token_hash,
          expires_at,
          revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
      `,
      [tokenHash],
    );

  return rows[0] ?? null;
};
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