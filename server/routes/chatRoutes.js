import express from "express";
import Chat from "../models/Chat.js";
import Product from "../models/Product.js";
import { askAI } from "../utils/ai.js";

const router = express.Router();

/* ===============================
   GET CHAT HISTORY
================================ */
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Chat load error" });
  }
});

/* ===============================
   SEND MESSAGE
================================ */
router.post("/send", async (req, res) => {
  const { userId, message } = req.body;

  if (!message)
    return res.status(400).json({ message: "Message required" });

  let reply = "Sorry, I couldn't understand that.";
  let products = [];

  try {
    /* ===== AI INTENT ===== */
    const intentData = await askAI(message);

    if (!intentData) {
      return res.json({
        reply: "Please try again.",
        products: [],
      });
    }

    /* ===== PRICE QUERY ===== */
    if (intentData.intent === "price_query") {
      const product = await Product.findOne({
        title: { $regex: intentData.productName, $options: "i" },
      });

      if (product) {
        reply = `${product.title} price is ₹${product.price}`;
        products = [product];
      }
    }

    /* ===== DESCRIPTION ===== */
    else if (intentData.intent === "description_query") {
      const product = await Product.findOne({
        title: { $regex: intentData.productName, $options: "i" },
      });

      if (product) {
        reply = product.description;
        products = [product];
      }
    }

    /* ===== CATEGORY ===== */
    else if (intentData.intent === "category_search") {
      products = await Product.find({
        category: { $regex: intentData.category, $options: "i" },
      }).limit(6);

      reply = `Here are ${intentData.category} products`;
    }

    /* ===== SECTION ===== */
    else if (intentData.intent === "section_search") {
      products = await Product.find({
        section: intentData.section.toLowerCase(),
      }).limit(6);

      reply = `Showing ${intentData.section} products`;
    }

    /* ===== GENERAL SEARCH ===== */
    else {
      products = await Product.find({
        title: { $regex: message, $options: "i" },
      }).limit(6);

      if (products.length > 0)
        reply = "Here are some products you may like.";
    }

    /* ===== SAVE CHAT ===== */
    if (userId) {
      await Chat.create({ userId, role: "user", message });
      await Chat.create({ userId, role: "bot", message: reply });
    }

    res.json({ reply, products });
  } catch (error) {
    console.log("CHAT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
