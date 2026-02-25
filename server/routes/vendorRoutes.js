import express from "express";
import Vendor from "../models/Vendor.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();


// ==========================================
// GET Vendor Profile
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// UPDATE Vendor Profile
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(updatedVendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// GET Customers Who Bought Vendor Products
// ==========================================
router.get("/:vendorId/customers", async (req, res) => {
  try {
    const { vendorId } = req.params;

    // 1️⃣ Get products of this vendor
    const products = await Product.find({ vendorId: vendorId }).select("_id");

    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Get orders containing those products
    const orders = await Order.find({
      "items.product": { $in: productIds }
    }).populate("user", "name email");

    // 3️⃣ Extract unique customers
    const uniqueCustomers = {};

    orders.forEach(order => {
      if (order.user) {
        uniqueCustomers[order.user._id] = order.user;
      }
    });

    const customers = Object.values(uniqueCustomers);

    res.json(customers);

  } catch (err) {
    console.error("Vendor Customers Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
