import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();


// SAVE CHAT MESSAGE
router.post("/save", async (req, res) => {
  try {
    const { userId, message, role } = req.body;

    const chat = new Chat({
      userId,
      message,
      role,
    });

    await chat.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET USER CHAT HISTORY
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
