import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;