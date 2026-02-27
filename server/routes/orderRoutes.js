import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import Review from "../models/Review.js";

// ================================================
// CREATE CHECKOUT SESSION
// ================================================
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    console.log("[CREATE-ORDER] User ID from middleware:", req.user._id);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const { productId, qty, shippingAddress } = req.body;

    // Your existing validations (keep all of them)
    if (!productId || !qty || !shippingAddress) return res.status(400).json({ message: "Missing required fields" });
    if (!shippingAddress.name || shippingAddress.name.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ message: "Name must have at least 2 words" });
    }
    if (!/^[0-9]{10}$/.test(shippingAddress.phone)) return res.status(400).json({ message: "Phone must be 10 digits" });
    if (!shippingAddress.address || shippingAddress.address.trim().length < 5) {
      return res.status(400).json({ message: "Address too short" });
    }
    if (!shippingAddress.city?.trim()) return res.status(400).json({ message: "City required" });
    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) return res.status(400).json({ message: "Pincode must be 6 digits" });
    if (!Number.isInteger(Number(qty)) || Number(qty) < 1) {
      return res.status(400).json({ message: "Quantity must be positive integer" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalPrice = product.price * Number(qty);

    // ───── Strong guard for URLs ─────
    let clientUrl = (process.env.CLIENT_URL || '').trim();

    if (!clientUrl) {
      console.error("[URL-ERROR] CLIENT_URL is missing or empty in environment variables");
      return res.status(500).json({
        message: "Server misconfiguration: CLIENT_URL not set. Please contact support.",
        debug: "Check Render.com Environment variables"
      });
    }

    if (!clientUrl.startsWith('http://') && !clientUrl.startsWith('https://')) {
      console.error("[URL-ERROR] CLIENT_URL missing protocol:", clientUrl);
      return res.status(500).json({
        message: "Server misconfiguration: CLIENT_URL must start with https:// or http://",
        debug: "Current value: " + clientUrl
      });
    }

    // Optional: remove trailing slash if present
    if (clientUrl.endsWith('/')) clientUrl = clientUrl.slice(0, -1);

    const successUrl = `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${clientUrl}/customer-dashboard`;

    console.log("[URL-CHECK] success_url:", successUrl);
    console.log("[URL-CHECK] cancel_url :", cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: product.title },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: Number(qty),
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId: product._id.toString(),
        userId: req.user._id.toString(),
        qty: qty.toString(),
      },
    });

    // Create & save order
    const order = new Order({
      user: req.user._id,
      product: product._id,
      qty: Number(qty),
      price: totalPrice,
      paymentMethod: "Stripe",
      status: "Pending",
      shippingAddress,
      stripeSessionId: session.id,
    });

    await order.save();
    console.log("[CREATE-ORDER] Order created successfully:", order._id.toString());

    res.json({ url: session.url });
  } catch (error) {
    console.error("[CREATE-ORDER] Full error:", error);
    console.error("[CREATE-ORDER] Error message:", error.message);
    res.status(500).json({
      message: "Failed to create Stripe session",
      error: error.message || "Unknown error"
    });
  }
});

// ================================================
// PAYMENT SUCCESS
// ================================================
router.get("/success", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: "Session ID required" });

    console.log("[SUCCESS] Verifying session:", session_id);

    const order = await Order.findOne({
      stripeSessionId: session_id,
      user: req.user._id,               // अब user भी चेक करो
    });

    if (!order) {
      console.log("[SUCCESS] Order not found or unauthorized");
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (order.status === "Paid") {
      return res.json({ message: "Order already processed" });
    }

    order.status = "Paid";
    await order.save();
    console.log("[SUCCESS] Order marked as Paid:", order._id);

    // Cart & wishlist से remove (optional)
    await User.updateOne(
      { _id: req.user._id },
      {
        $pull: {
          cart: { product: order.product },
          wishlist: order.product,
        },
      }
    );

    res.json({ message: "Payment successful, order confirmed" });
  } catch (error) {
    console.error("[SUCCESS] Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================================
// CUSTOMER: MY ORDERS
// ================================================
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("[MY-ORDERS] Fetching for user:", userId);

    const orders = await Order.find({ user: userId })
      .populate("product", "title price image")
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 Attach review info to each order
    for (let order of orders) {
      const review = await Review.findOne({
        user: userId,
        product: order.product?._id,
      }).lean();

      order.review = review || null;
    }

    res.json(orders);
  } catch (err) {
    console.error("[MY-ORDERS] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================================
// VENDOR: UPDATE ORDER STATUS
// ================================================
router.put("/orders/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = await Product.findById(order.product);
    if (!product || product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order updated to ${status}`, order });
  } catch (err) {
    console.error("[STATUS-UPDATE] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================================
// VENDOR: GET ORDERS FOR HIS PRODUCTS
// ================================================
// ... all other routes ...

router.get("/vendor-orders", authMiddleware, async (req, res) => {
  try {
    const vendorProducts = await Product.find({
      vendorId: req.user._id.toString(),
    }).select("_id");

    const productIds = vendorProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({
      product: { $in: productIds },
    })
      .populate("user", "name email phone")
      .populate("product", "title price image")
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error("[VENDOR-ORDERS] Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

