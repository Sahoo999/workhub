import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireTaskAccess } from "../../middleware/authorize-task.js";

import {
  createComment,
  getComments,
} from "./comments.controller.js";

const router = Router();

router.post(
  "/tasks/:taskId/comments",
  requireAuth,
  requireTaskAccess,
  createComment,
);

router.get(
  "/tasks/:taskId/comments",
  requireAuth,
  requireTaskAccess,
  getComments,
);

export default router;