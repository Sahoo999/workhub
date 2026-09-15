import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import { AppError } from "../../utils/app-error.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../../utils/jwt.js";
import * as usersRepository from "../users/users.repository.js";
import * as authRepository from "./auth.repository.js";
import {
  loginSchema,
  registerSchema,
} from "./auth.schema.js";

const hashRefreshToken = (token: string): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

const createRefreshTokenValue = (): string => {
  return randomBytes(48).toString("hex");
};

const getRefreshTokenExpiry = (): Date => {
  const date = new Date();

  date.setDate(date.getDate() + 7);

  return date;
};

export const register = async (input: unknown) => {
  const data = registerSchema.parse(input);

  const existingUser = await authRepository.findUserByEmail(
    data.email,
  );

  if (existingUser) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await usersRepository.createUser(
    data.name,
    data.email,
    passwordHash,
  );

  const accessToken = signAccessToken(user.id);

  const refreshToken = createRefreshTokenValue();

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

export const login = async (input: unknown) => {
  const data = loginSchema.parse(input);

  const user = await authRepository.findUserByEmail(
    data.email,
  );

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const passwordMatches = await bcrypt.compare(
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

  const accessToken = signAccessToken(user.id);

  const refreshToken = createRefreshTokenValue();

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