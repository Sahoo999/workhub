import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

export const signAccessToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any, // Type assertion to satisfy TypeScript
    },
  );
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
      type: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any, // Type assertion to satisfy TypeScript
    },
  );
};