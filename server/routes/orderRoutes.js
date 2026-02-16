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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const { productId, qty } = req.body;

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

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
          quantity: qty,
        },
      ],

      // IMPORTANT
      metadata: {
        productId,
        qty,
        userId: req.user.id,
      },

      success_url:
        "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/payment-cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log("Stripe Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================
// SAVE ORDER AFTER STRIPE PAYMENT
// ============================
router.get("/success", authMiddleware, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    const { productId, qty } = session.metadata;

    const order = new Order({
      user: req.user.id,
      product: productId,
      qty,
      paymentMethod: "Stripe",
      status: "Paid",
    });

    await order.save();

    // remove item from cart
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    res.json({ message: "Order saved successfully" });
  } catch (err) {
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
