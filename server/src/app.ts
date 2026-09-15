import express from "express";
import cookieParser from "cookie-parser";

import usersRouter from "./modules/users/users.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

import authRouter from "./modules/auth/auth.routes.js";
import workspacesRouter from "./modules/workspaces/workspaces.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());


app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkHub API is healthy",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);

app.use("/api/v1/workspaces", workspacesRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;