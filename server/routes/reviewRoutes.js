import express from 'express';
const router = express.Router();

import {
  addOrUpdateReview,
  getProductReviews,
  getVendorReviews,
} from '../controllers/reviewController.js';

import authMiddleware from '../middleware/authMiddleware.js';

// ────────────────────────────────────────────────
// Customer: Add or update their review for a product
// POST /api/reviews
router.post("/", authMiddleware, addOrUpdateReview);

// ────────────────────────────────────────────────
// Public: Get all reviews for a specific product
// GET /api/reviews/:productId
router.get("/:productId", getProductReviews);

// ────────────────────────────────────────────────
// Vendor only: Get all reviews for products belonging to this vendor
// GET /api/reviews/vendor/all
router.get("/vendor/all", authMiddleware, getVendorReviews);

export default router;