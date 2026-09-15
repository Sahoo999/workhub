import { Router } from "express";

import { createUser, getCurrentUser } from "./users.controller.js";
import {requireAuth} from "../../middleware/auth.js";

const router = Router();

router.post("/", createUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;