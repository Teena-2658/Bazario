import express from "express";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// GET Vendor Profile
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Vendor Profile
router.put("/:id", async (req, res) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedVendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;