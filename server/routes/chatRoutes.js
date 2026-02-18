import express from "express";
import Chat from "../models/Chat.js";
import Product from "../models/Product.js";
import { askAI } from "../utils/ai.js";

const router = express.Router();

/* GET CHAT HISTORY */
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId })
      .sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Chat load error" });
  }
});

/* SEND MESSAGE */
router.post("/send", async (req, res) => {
  const { userId, message } = req.body;

  try {

    // broad product search
    const products = await Product.find({
      $or: [
        { title: { $regex: message, $options: "i" } },
        { category: { $regex: message, $options: "i" } },
      ],
    }).limit(5);

    // AI decides response
    const reply = await askAI(message, products);

    if (userId) {
      await Chat.create({ userId, role: "user", message });
      await Chat.create({ userId, role: "bot", message: reply });
    }

    res.json({ reply, products });

  } catch (error) {
    console.log(error);
    res.json({
      reply: "Something went wrong.",
      products: [],
    });
  }
});


export default router;
