import { pool } from "../../db/client.js";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const createUser = async (
  name: string,
  email: string,
  passwordHash: string,
): Promise<UserRecord> => {
  const { rows } = await pool.query<UserRecord>(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, password_hash, created_at, updated_at
    `,
    [name, email, passwordHash],
  );

  //  Check if the row exists before returning it
  if (!rows[0]) {
    throw new Error("Failed to create user record in database");
  }

  return rows[0];
};