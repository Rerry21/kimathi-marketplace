import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadImage, uploadImages } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", requireAuth, uploadLimiter, upload.single("image"), uploadImage);
router.post(
  "/multiple",
  requireAuth,
  uploadLimiter,
  upload.array("images", 6),
  uploadImages
);

export default router;