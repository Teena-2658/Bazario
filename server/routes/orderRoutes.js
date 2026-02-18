import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// CREATE CHECKOUT SESSION
// ===============================
router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, qty, shippingAddress } = req.body;

      // ===== VALIDATION =====
      if (!productId || !qty || !shippingAddress) {
        return res.status(400).json({ message: "Missing fields" });
      }

      if (!shippingAddress.name || shippingAddress.name.trim().length < 3) {
        return res.status(400).json({ message: "Invalid name" });
      }

      if (!/^[0-9]{10}$/.test(shippingAddress.phone)) {
        return res.status(400).json({ message: "Invalid phone" });
      }

      if (!shippingAddress.address || shippingAddress.address.length < 5) {
        return res.status(400).json({ message: "Invalid address" });
      }

      if (!shippingAddress.city) {
        return res.status(400).json({ message: "City required" });
      }

      if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
        return res.status(400).json({ message: "Invalid pincode" });
      }

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      // ===== STRIPE SESSION =====
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: product.title },
              unit_amount: product.price * 100,
            },
            quantity: qty,
          },
        ],
        success_url:
          "https://yourfrontendurl.com/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://yourfrontendurl.com/customer-dashboard",
        metadata: {
          productId: product._id.toString(),
          userId: req.user.id,
        },
      });

      // ===== SAVE ORDER =====
      const order = new Order({
        user: req.user.id,
        product: product._id,
        qty,
        price: product.price,
        paymentMethod: "Stripe",
        status: "Pending",
        shippingAddress,
        stripeSessionId: session.id,
      });

      await order.save();

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// PAYMENT SUCCESS (IMPORTANT)
// ===============================
router.get("/success", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.query;

    const order = await Order.findOne({
      stripeSessionId: session_id,
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // ✅ update status
    order.status = "Paid";
    await order.save();

    // ✅ remove item from cart
    await User.updateOne(
      { _id: order.user },
      {
        $pull: {
          cart: { product: order.product },
          wishlist: order.product,
        },
      }
    );

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// GET MY ORDERS
// ===============================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
