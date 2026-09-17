import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireWorkspaceMember } from "../../middleware/authorize-workspace.js";
import { requireTaskAccess } from "../../middleware/authorize-task.js";

import {
  createLabel,
  getWorkspaceLabels,
  addLabelToTask,
  removeLabelFromTask,
  getTaskLabels,
} from "./labels.controller.js";

const router = Router();

router.post(
  "/workspaces/:workspaceId/labels",
  requireAuth,
  requireWorkspaceMember,
  createLabel,
);

router.get(
  "/workspaces/:workspaceId/labels",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceLabels,
);

router.post(
  "/tasks/:taskId/labels/:labelId",
  requireAuth,
  requireTaskAccess,
  addLabelToTask,
);

router.delete(
  "/tasks/:taskId/labels/:labelId",
  requireAuth,
  requireTaskAccess,
  removeLabelFromTask,
);

router.get(
  "/tasks/:taskId/labels",
  requireAuth,
  requireTaskAccess,
  getTaskLabels,
);

export default router;