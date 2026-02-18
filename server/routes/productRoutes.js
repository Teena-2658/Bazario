import express from "express";
import Product from "../models/Product.js";

const router = express.Router();


// ===============================
// ✅ ADD PRODUCT
// POST /api/products/add
// ===============================
router.post("/add", async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      image,
      category,
      section,
      vendorId,
    } = req.body;

    // 🔐 Required Field Validation
    if (
      !title ||
      !price ||
      !description ||
      !image ||
      !category ||
      !section ||
      !vendorId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔐 Price validation
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // 🔐 Image URL validation
    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    if (!urlRegex.test(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL",
      });
    }

    // 🔐 Allowed sections validation
    const allowedSections = ["spotlight", "trending", "new"];
    if (!allowedSections.includes(section.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid section",
      });
    }

    // 🔐 Basic category validation (optional predefined list)
    const allowedCategories = [
      "electronics",
      "fashion",
      "home",
      "beauty",
      "sports",
    ];

    if (!allowedCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const product = new Product({
      title: title.trim(),
      price: Number(price),
      description: description.trim(),
      image: image.trim(),
      category: category.toLowerCase().trim(),
      section: section.toLowerCase().trim(),
      vendorId,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ===============================
// ✅ GET ALL PRODUCTS
// GET /api/products
// ===============================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ GET PRODUCTS BY SECTION
// GET /api/products/section/:section
// ===============================
router.get("/section/:section", async (req, res) => {
  try {
    const section = req.params.section.toLowerCase();

    const products = await Product.find({ section });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ GET PRODUCTS BY CATEGORY
// GET /api/products/category/:category
// ===============================
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();

    const products = await Product.find({ category });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ GET PRODUCTS BY VENDOR
// GET /api/products/vendor/:vendorId
// ===============================
router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({
      vendorId: req.params.vendorId,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ GET PRODUCT BY ID
// ⚠ ALWAYS LAST GET ROUTE
// GET /api/products/:id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ UPDATE PRODUCT
// PUT /api/products/:id
// ===============================
router.put("/:id", async (req, res) => {
  try {

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ DELETE PRODUCT
// DELETE /api/products/:id
// ===============================
router.delete("/:id", async (req, res) => {
  try {

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
