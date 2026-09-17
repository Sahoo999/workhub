import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireTaskAccess } from "../../middleware/authorize-task.js";
import { getTaskActivity } from "./activity.controller.js";

const router = Router();

router.get(
  "/tasks/:taskId/activity",
  requireAuth,
  requireTaskAccess,
  getTaskActivity,
);

export default router;