import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

     // Interface for the authenticated user object
export interface AuthenticatedUser {
  id: string;
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {


  const header = req.headers.authorization;

    //Checks if that header is missing, or if it fails to start with the standard prefix "Bearer ".
    if (!header?.startsWith("Bearer ")) {
      
    next(
      new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED",
      ),
    );
    return;
  }

    //  Cuts off the first 7 characters ("Bearer ") to extract just the raw, long crypto token string.
  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string" ||
      payload.type !== "access"
    ) {
      throw new Error("Invalid token payload");
    }

        //It creates a brand new temporary property 
    // named '.user' right inside Express's active request object, loading it with the decrypted database ID.
    req.user = {
      id: payload.userId,
    };

    next();
  } catch {
    next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }
};