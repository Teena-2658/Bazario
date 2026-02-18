import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();


// ✅ GET USER CHAT HISTORY
router.get("/:userId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId });
    res.json(chat ? chat.messages : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ SEND MESSAGE
router.post("/send", async (req, res) => {
  try {
    const { userId, message } = req.body;

    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // user message save
    chat.messages.push({
      sender: "user",
      text: message,
    });

    // ✅ SIMPLE SMART RESPONSE
    let botReply = "Sorry, I didn't understand.";

    if (message.toLowerCase().includes("website")) {
      botReply =
        "This is an ecommerce website where you can explore products, categories, add to cart and order items.";
    }

    if (message.toLowerCase().includes("category")) {
      botReply =
        "We have categories like Fashion, Electronics, Shoes and more.";
    }

    if (message.toLowerCase().includes("hello")) {
      botReply = "Hello 👋 How can I help you today?";
    }

    chat.messages.push({
      sender: "bot",
      text: botReply,
    });

    await chat.save();

    res.json(botReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
