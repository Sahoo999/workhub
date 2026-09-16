import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireProjectAccess } from "../../middleware/authorize-project.js";
import { requireTaskAccess } from "../../middleware/authorize-task.js";

import {
  createTask,
  getTask,
  getTasks,
  updateTask,
} from "./tasks.controller.js";

const router = Router();

router.post(
  "/projects/:projectId/tasks",
  requireAuth,
  requireProjectAccess,
  createTask,
);

router.get(
  "/projects/:projectId/tasks",
  requireAuth,
  requireProjectAccess,
  getTasks,
);

router.get(
  "/tasks/:taskId",
  requireAuth,
  requireTaskAccess,
  getTask,
);

router.patch(
  "/tasks/:taskId",
  requireAuth,
  requireTaskAccess,
  updateTask,
);

export default router;