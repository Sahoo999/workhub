import { createHash, randomBytes } from "node:crypto";

export const generateRefreshToken = (): string => {
  return randomBytes(48).toString("hex");
};

export const hashRefreshToken = (
  token: string,
): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getRefreshTokenExpiry = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};