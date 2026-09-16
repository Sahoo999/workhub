import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import {
  requireWorkspaceMember,
} from "../../middleware/authorize-workspace.js";

import {
  createProject,
  getProject,
  getProjects,
  updateProject,
} from "./projects.controller.js";

import { requireProjectAccess } from "../../middleware/authorize-project.js";

const router = Router();

router.post(
  "/workspaces/:workspaceId/projects",
  requireAuth,
  requireWorkspaceMember,
  createProject,
);

router.get(
  "/workspaces/:workspaceId/projects",
  requireAuth,
  requireWorkspaceMember,
  getProjects,
);

router.get(
  "/projects/:projectId",
  requireAuth,
  requireProjectAccess,
  getProject,
);

router.patch(
  "/projects/:projectId",
  requireAuth,
  requireProjectAccess,
  updateProject,
);

export default router;