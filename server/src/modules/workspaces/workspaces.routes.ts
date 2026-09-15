import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { createWorkspace } from "./workspaces.controller.js";

const router = Router();

router.post("/", requireAuth, createWorkspace);

export default router;