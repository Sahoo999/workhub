import type { Request, Response, NextFunction } from "express";

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