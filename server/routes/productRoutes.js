import express from "express";
import Product from "../models/Product.js";

const router = express.Router();


// ✅ ADD PRODUCT
// POST /api/products/add
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

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor not logged in",
      });
    }

    // ✅ Title must be at least 3 words
    const titleWordCount = title?.trim().split(/\s+/).length;
    if (!title || titleWordCount < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must contain at least 3 words",
      });
    }

    // ✅ Price must be greater than 0
    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // ✅ Description must be at least 10 words
    const descriptionWordCount = description?.trim().split(/\s+/).length;
    if (!description || descriptionWordCount < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must contain at least 10 words",
      });
    }

    const product = new Product({
      title: title.trim(),
      price: Number(price),
      description: description.trim(),
      image,
      category,
      section: section.toLowerCase(),
      vendorId,
    });

    await product.save();

    res.json({
      success: true,
      message: "Product added",
      product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// ✅ GET ALL PRODUCTS
// GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET PRODUCTS BY SECTION
// GET /api/products/section/spotlight
router.get("/section/:section", async (req, res) => {
  try {
    const section = req.params.section.toLowerCase();

    const products = await Product.find({ section });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET PRODUCTS BY VENDOR (Dashboard Fix)
// GET /api/products/vendor/:vendorId
router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({
      vendorId: req.params.vendorId,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET PRODUCT BY ID (Product Details)
// GET /api/products/:id
// ⚠️ ALWAYS LAST GET ROUTE
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ UPDATE PRODUCT
// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { title, price, description } = req.body;

    // ✅ Title validation
    const titleWordCount = title?.trim().split(/\s+/).length;
    if (!title || titleWordCount < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must contain at least 3 words",
      });
    }

    // ✅ Price validation
    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // ✅ Description validation
    const descriptionWordCount = description?.trim().split(/\s+/).length;
    if (!description || descriptionWordCount < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must contain at least 10 words",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
      },
      { new: true }
    );

    res.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// ✅ DELETE PRODUCT
// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET PRODUCTS BY CATEGORY
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category: category.toLowerCase(),
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
