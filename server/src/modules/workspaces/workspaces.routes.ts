import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { requireWorkspaceMember } from "../../middleware/authorize-workspace.js";

import { createWorkspace, getWorkspaces, getWorkspace } from "./workspaces.controller.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);
router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceMember,
  getWorkspace,
);
router.post("/", requireAuth, createWorkspace);

export default router;