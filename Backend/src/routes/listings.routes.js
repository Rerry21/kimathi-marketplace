import express from "express";
import {
  getListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createListingLimiter, accountWriteLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/", getListings);
router.post("/", requireAuth, createListingLimiter, createListing);
router.get("/:id", getListingById);
router.put("/:id", requireAuth, accountWriteLimiter, updateListing);
router.delete("/:id", requireAuth, accountWriteLimiter, deleteListing);

export default router;