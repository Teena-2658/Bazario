// routes/customerRoute.js
import express from "express";
import Customer from "../models/Customer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get customer profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      // Optional: auto-create if not exists
      const newCustomer = new Customer({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      });
      await newCustomer.save();
      return res.json(newCustomer);
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update customer profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;