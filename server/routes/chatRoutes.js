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
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.json({
        reply: "Please type something.",
        products: [],
      });
    }

    const text = message.toLowerCase().trim();

    let reply = "";
    let products = [];

    /* ===============================
       1️⃣ SECTION SEARCH
    =============================== */

    const sections = ["spotlight", "trending", "indemand", "everyday"];

    for (let sec of sections) {
      if (text.includes(sec)) {
        products = await Product.find({
          section: { $regex: sec, $options: "i" },
        }).limit(6);

        if (products.length > 0) {
          reply = `Showing ${sec} products 👇`;
        }
      }
    }

    /* ===============================
       2️⃣ CATEGORY SEARCH
    =============================== */

    if (products.length === 0 && text.includes("category")) {
      const cleaned = text
        .replace("show", "")
        .replace("category", "")
        .trim();

      products = await Product.find({
        category: { $regex: cleaned, $options: "i" },
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are products from ${cleaned} category 👇`;
      }
    }

    /* ===============================
       3️⃣ PRICE QUERY
    =============================== */

    if (products.length === 0 && text.includes("price")) {
      const cleaned = text
        .replace("price of", "")
        .replace("price", "")
        .trim();

      products = await Product.find({
        title: { $regex: cleaned, $options: "i" },
      }).limit(6);

      if (products.length > 0) {
        reply = `Here is the price information 👇`;
      }
    }

    /* ===============================
       4️⃣ GENERAL SEARCH (SMART)
    =============================== */

    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { title: { $regex: text, $options: "i" } },
          { category: { $regex: text, $options: "i" } },
        ],
      }).limit(6);

      if (products.length > 0) {
        reply = `Here are matching products 👇`;
      }
    }

    /* ===============================
       5️⃣ NOT FOUND
    =============================== */

    if (products.length === 0) {
      reply =
        "I couldn't find exact match 😔 Try product name, category or section like trending, spotlight, everyday.";
    }

    /* ===============================
       SAVE CHAT
    =============================== */

    if (userId) {
      await Chat.create({ userId, role: "user", message });
      await Chat.create({ userId, role: "bot", message: reply });
    }

    res.json({ reply, products });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      reply: "Server error",
      products: [],
    });
  }
});


export default router;
