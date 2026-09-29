import {
  Router,
} from "express";

import {
  requireAuth,
} from "../../middleware/auth.js";

import {
  listMembers,
  createMember,
  changeMemberRole,
  deleteMember,
} from "./members.controller.js";

const router = Router({
  mergeParams: true,
});

router.get(
  "/",
  requireAuth,
  listMembers,
);

router.post(
  "/",
  requireAuth,
  createMember,
);

router.patch(
  "/:userId",
  requireAuth,
  changeMemberRole,
);

router.delete(
  "/:userId",
  requireAuth,
  deleteMember,
);

export default router;