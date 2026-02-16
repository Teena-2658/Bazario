import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// CREATE STRIPE CHECKOUT SESSION
// ===============================
router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, qty, shippingAddress } = req.body;

      console.log("CLIENT_URL:", process.env.CLIENT_URL); // debug

      const baseUrl = process.env.CLIENT_URL;

      if (!baseUrl) {
        return res.status(500).json({
          message: "CLIENT_URL not set in Render environment variables",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
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
          images: [product.image],
        },
        unit_amount: product.price * 100,
      },
      quantity: qty,
    },
  ],
  success_url:
    "https://bazario-ruddy.vercel.app/payment-success",
  cancel_url:
    "https://bazario-ruddy.vercel.app/customer-dashboard",
  metadata: {
    productId: product._id.toString(),
    userId: req.user.id,
  },
});


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

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
);


// ===============================
// GET MY ORDERS
// ===============================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
