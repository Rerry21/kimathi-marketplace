import express from "express";
import { getStats, getUsers } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, getStats);
router.get("/users", requireAuth, requireAdmin, getUsers);

export default router;