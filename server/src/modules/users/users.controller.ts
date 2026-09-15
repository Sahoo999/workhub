import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/app-error.js";

import * as usersService from "./users.service.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
    try {

    const user = await usersService.createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(
        new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED",
        ),
      );
      return;
    }

    const user = await usersService.findById(req.user.id);

    // Safety Check 2. Checks if the user was deleted from the database 
    // while their token was still active. If no user is found, it throws a 404 error.
    if (!user) {
      next(
        new AppError(
          "User not found",
          404,
          "USER_NOT_FOUND",
        ),
      );
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};