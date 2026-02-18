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

    // ✅ Basic Required Validation
    if (!title || !price || !description || !image || !category || !section) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Vendor Check
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor not logged in",
      });
    }

    // ✅ Price Validation
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // ✅ Image URL Validation
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))$/i;
    if (!urlPattern.test(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Image URL",
      });
    }

    const product = new Product({
      title: title.trim(),
      price,
      description: description.trim(),
      image,
      category: category.toLowerCase(),
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
    const { title, price, description, image, category, section } = req.body;

    if (!title || !price || !description || !image || !category || !section) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        price,
        description: description.trim(),
        image,
        category: category.toLowerCase(),
        section: section.toLowerCase(),
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
