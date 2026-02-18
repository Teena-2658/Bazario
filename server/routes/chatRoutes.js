import express from "express";
import Chat from "../models/Chat.js";
import Product from "../models/Product.js";

const router = express.Router();

/* =========================================
   GET USER CHAT HISTORY
========================================= */
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: 1 });

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

  const text = message.toLowerCase().trim();

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
        reply = product.description;
        products = [product];
      }
    }

    /* =========================================
       SECTION BASED (spotlight / trending / indemand / everybody)
    ========================================= */
    else if (
      text.includes("spotlight") ||
      text.includes("trending") ||
      text.includes("indemand") ||
      text.includes("everybody")
    ) {
      let sectionName = "";

      if (text.includes("spotlight")) sectionName = "spotlight";
      if (text.includes("trending")) sectionName = "trending";
      if (text.includes("indemand")) sectionName = "indemand";
      if (text.includes("everybody")) sectionName = "everybody";

      products = await Product.find({
        section: sectionName,
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are ${sectionName} products.`;
      }
    }

    /* =========================================
       GENERAL SEARCH (TITLE + CATEGORY + SECTION)
    ========================================= */
    else {
      products = await Product.find({
        $or: [
          { title: { $regex: text, $options: "i" } },
          { category: { $regex: text, $options: "i" } },
          { section: { $regex: text, $options: "i" } },
        ],
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are products related to "${message}"`;
      }
    }

    /* =========================================
       SAVE CHAT HISTORY
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
