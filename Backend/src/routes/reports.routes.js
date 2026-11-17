import express from "express";
import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} from "../controllers/reports.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { reportLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", requireAuth, reportLimiter, createReport);
router.get("/mine", requireAuth, getMyReports);
router.get("/admin", requireAuth, requireAdmin, getAllReports);
router.patch("/:id/status", requireAuth, requireAdmin, updateReportStatus);

export default router;