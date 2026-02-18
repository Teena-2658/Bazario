import express from "express";
import Chat from "../models/Chat.js";   
import Product from "../models/Product.js";

const router = express.Router();

/* =========================================
   GET USER CHAT HISTORY
========================================= */
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({
      createdAt: 1,
    });

    res.json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Chat load error" });
  }
});

/* =========================================
   SEND MESSAGE
========================================= */
router.post("/send", async (req, res) => {
  const { userId, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message required" });
  }

  const text = message.toLowerCase();

  let reply = "Sorry, I couldn't find anything related to that.";
  let products = [];

  try {
    /* =========================================
       PRICE QUERY
    ========================================= */
    if (text.includes("price")) {
      const cleanedText = text.replace("price", "").trim();

      const product = await Product.findOne({
        title: { $regex: cleanedText, $options: "i" },
      });

      if (product) {
        reply = `${product.title} price is ₹${product.price}`;
        products = [product];
      }
    }

    /* =========================================
       DESCRIPTION QUERY
    ========================================= */
    else if (text.includes("description")) {
      const cleanedText = text.replace("description", "").trim();

      const product = await Product.findOne({
        title: { $regex: cleanedText, $options: "i" },
      });

      if (product) {
        reply = product.description || "No description available.";
        products = [product];
      }
    }

    /* =========================================
       CATEGORY QUERY
    ========================================= */
    else if (text.includes("category")) {
      const categoryName = text.replace("category", "").trim();

      products = await Product.find({
        category: { $regex: categoryName, $options: "i" },
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are some products from ${categoryName} category.`;
      }
    }

    /* =========================================
       TRENDING PRODUCTS
    ========================================= */
    else if (text.includes("trending")) {
      products = await Product.find({
        isTrending: true,
      }).limit(6);

      if (products.length > 0) {
        reply = "Here are our trending products 🔥";
      }
    }

    /* =========================================
       SPOTLIGHT PRODUCTS
    ========================================= */
    else if (text.includes("spotlight")) {
      products = await Product.find({
        isSpotlight: true,
      }).limit(6);

      if (products.length > 0) {
        reply = "These products are currently in spotlight ✨";
      }
    }

    /* =========================================
       GENERAL PRODUCT SEARCH
    ========================================= */
    else {
      products = await Product.find({
        title: { $regex: text, $options: "i" },
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are results related to "${message}"`;
      }
    }

    /* =========================================
       SAVE USER MESSAGE
    ========================================= */
    if (userId) {
      await Chat.create({
        userId,
        role: "user",
        message,
      });

      await Chat.create({
        userId,
        role: "bot",
        message: reply,
      });
    }

    res.json({
      reply,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
