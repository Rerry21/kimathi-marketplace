import express from "express";
import {
  getMyAppealStatus,
  submitAppeal,
  getAllAppeals,
  decideAppeal,
} from "../controllers/appeals.controller.js";
import { requireAuth, requireAuthAllowBanned } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/status", requireAuthAllowBanned, getMyAppealStatus);
router.post("/", requireAuthAllowBanned, submitAppeal);
router.get("/admin", requireAuth, requireAdmin, getAllAppeals);
router.patch("/:id/decision", requireAuth, requireAdmin, decideAppeal);

export default router;