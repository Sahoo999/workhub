import express from "express";
import cookieParser from "cookie-parser";

import usersRouter from "./modules/users/users.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

import authRouter from "./modules/auth/auth.routes.js";
import workspacesRouter from "./modules/workspaces/workspaces.routes.js";
import projectsRouter from "./modules/projects/projects.routes.js";
import tasksRouter from "./modules/tasks/tasks.routes.js";

import commentsRouter from "./modules/comments/comments.routes.js";

import labelsRouter from "./modules/labels/labels.routes.js";

import activityRouter from "./modules/activity/activity.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";

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
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/workspaces", workspacesRouter);
app.use("/api/v1", tasksRouter);
app.use("/api/v1", commentsRouter);
app.use("/api/v1", labelsRouter);
app.use("/api/v1", activityRouter);
app.use(
  "/api/v1/notifications",
  notificationsRouter,
);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;