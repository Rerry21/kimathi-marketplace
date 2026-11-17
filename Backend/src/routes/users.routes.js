import express from "express";
import {
  updateProfile,
  getUserById,
  banUser,
  unbanUser,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { accountWriteLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.put("/me", requireAuth, accountWriteLimiter, updateProfile);
router.get("/:id", getUserById);
router.patch("/:id/ban", requireAuth, requireAdmin, banUser);
router.patch("/:id/unban", requireAuth, requireAdmin, unbanUser);

export default router;