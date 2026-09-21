import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { createWorkspace, getWorkspaces } from "./workspaces.controller.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);
router.post("/", requireAuth, createWorkspace);

export default router;