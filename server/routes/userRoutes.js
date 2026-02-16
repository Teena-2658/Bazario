import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ===============================
// ✅ ADD TO CART
// ===============================
router.post("/cart", authMiddleware, async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const user = await User.findById(req.user.id);

    // check if product already in cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty || 1;
    } else {
      user.cart.push({
        product: productId,
        qty: qty || 1,
      });
    }

    await user.save();

    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ GET FULL CART (POPULATED)
// ===============================
router.get("/cart", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("cart.product");

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ REMOVE FROM CART
// ===============================
router.delete("/cart/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (item) => item._id.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: "Removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ ADD TO WISHLIST
// ===============================
router.post("/wishlist", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }

    await user.save();

    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ GET FULL WISHLIST (POPULATED)
// ===============================
router.get("/wishlist", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist");

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
