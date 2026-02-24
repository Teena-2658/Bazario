import express from "express";
import Visit from "../models/Visit.js";

const router = express.Router();

// 🔹 Track Visit
router.post("/track", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let visit = await Visit.findOne({ date: today });

    if (visit) {
      visit.count += 1;
      await visit.save();
    } else {
      await Visit.create({ date: today, count: 1 });
    }

    res.json({ message: "Visit tracked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get All Visit Data
router.get("/all", async (req, res) => {
  try {
    const visits = await Visit.find().sort({ date: 1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;