import express from "express";
import {
  sendMessage,
  getConversations,
  getThread,
  getUnreadCount,
} from "../controllers/messages.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendMessageLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", requireAuth, sendMessageLimiter, sendMessage);
router.get("/conversations", requireAuth, getConversations);
router.get("/thread/:listingId/:otherUserId", requireAuth, getThread);
router.get("/unread-count", requireAuth, getUnreadCount);

export default router;