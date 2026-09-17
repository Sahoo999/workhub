import bcrypt from "bcryptjs";

import { AppError } from "../../utils/app-error.js";
import {
  signAccessToken,
} from "../../utils/jwt.js";

import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../../utils/refresh-token.js";

import { pool } from "../../db/client.js";

import * as usersRepository from "../users/users.repository.js";
import * as authRepository from "./auth.repository.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.schema.js";

/* =========================
   REFRESH TOKEN
========================= */

export const refresh = async (
  refreshToken: string,
) => {
  const tokenHash =
    hashRefreshToken(refreshToken);

  const storedToken =
    await authRepository.findValidRefreshToken(
      tokenHash,
    );

  if (!storedToken) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const newRefreshToken =
      generateRefreshToken();

    // Revoke old refresh token
    await authRepository.revokeRefreshToken(
      client,
      storedToken.id,
    );

    // Store new refresh token
    await authRepository.createRefreshTokenTx(
      client,
      storedToken.user_id,
      hashRefreshToken(newRefreshToken),
      getRefreshTokenExpiry(),
    );

    await client.query("COMMIT");

    return {
      accessToken: signAccessToken(
        storedToken.user_id,
      ),
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================
   REGISTER
========================= */

export const register = async (
  input: unknown,
) => {
  const data =
    registerSchema.parse(input);

  const existingUser =
    await authRepository.findUserByEmail(
      data.email,
    );

  if (existingUser) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash =
    await bcrypt.hash(data.password, 12);

  const user =
    await usersRepository.createUser(
      data.name,
      data.email,
      passwordHash,
    );

  const accessToken =
    signAccessToken(user.id);

  const refreshToken =
    generateRefreshToken();

  await authRepository.createRefreshToken(
    user.id,
    hashRefreshToken(refreshToken),
    getRefreshTokenExpiry(),
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },

    accessToken,
    refreshToken,
  };
};

/* =========================
   LOGIN
========================= */

export const login = async (
  input: unknown,
) => {
  const data =
    loginSchema.parse(input);

  const user =
    await authRepository.findUserByEmail(
      data.email,
    );

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      data.password,
      user.password_hash,
    );

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const accessToken =
    signAccessToken(user.id);

  const refreshToken =
    generateRefreshToken();

  await authRepository.createRefreshToken(
    user.id,
    hashRefreshToken(refreshToken),
    getRefreshTokenExpiry(),
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },

    accessToken,
    refreshToken,
  };
};

/* =========================
   LOGOUT
========================= */

export const logout = async (
  refreshToken: string,
): Promise<void> => {
  const tokenHash =
    hashRefreshToken(refreshToken);

  const storedToken =
    await authRepository.findValidRefreshToken(
      tokenHash,
    );

  if (!storedToken) {
    return;
  }

  await pool.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
    `,
    [storedToken.id],
  );
};