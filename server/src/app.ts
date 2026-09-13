import express from "express";

import usersRouter from "./modules/users/users.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkHub API is healthy",
  });
});

app.use("/api/v1/users", usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;