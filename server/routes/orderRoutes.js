import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

// ============================
// CREATE STRIPE SESSION
// ============================
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { productId, qty } = req.body;

    // ✅ Safety checks
    if (!productId || !qty) {
      return res.status(400).json({
        message: "ProductId and quantity are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.title,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: Number(qty),
        },
      ],

      metadata: {
        productId,
        qty: String(qty),
        userId: req.user.id,
      },

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.log("STRIPE SESSION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================
// SAVE ORDER AFTER STRIPE PAYMENT
// ============================
router.get("/success", authMiddleware, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID missing" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { productId, qty, userId } = session.metadata;

    // ✅ Prevent duplicate order
    const existingOrder = await Order.findOne({
      stripeSessionId: session_id,
    });

    if (existingOrder) {
      return res.json({ message: "Order already saved" });
    }

    const order = new Order({
      user: userId,
      product: productId,
      qty: Number(qty),
      paymentMethod: "Stripe",
      status: "Paid",
      stripeSessionId: session_id, // 👈 important
    });

    await order.save();

    res.json({ message: "Order saved successfully" });

  } catch (err) {
    console.log("STRIPE SUCCESS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================
// SAVE ORDER (COD)
// ============================
router.post("/cod", authMiddleware, async (req, res) => {
  try {
    const { productId, qty, address } = req.body;

    const order = new Order({
      user: req.user.id,
      product: productId,
      qty,
      address,
      paymentMethod: "COD",
      status: "Pending",
    });

    await order.save();

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    res.json({ message: "Order placed successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================
// GET MY ORDERS
// ============================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate("product");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
