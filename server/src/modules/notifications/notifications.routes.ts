import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
  getNotifications,
  markAsRead,
} from "./notifications.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  getNotifications,
);

router.patch(
  "/:notificationId/read",
  requireAuth,
  markAsRead,
);

export default router;