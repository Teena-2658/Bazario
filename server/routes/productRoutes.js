import express from "express";
import Product from "../models/Product.js";

const router = express.Router();


// ✅ ADD PRODUCT
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

    const titleWordCount = title?.trim().split(/\s+/).length;
    if (!title || titleWordCount < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must contain at least 3 words",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

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
      category: category?.toLowerCase(),
      section: section?.toLowerCase(),
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
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET PRODUCTS BY SECTION
router.get("/section/:section", async (req, res) => {
  try {
    const section = req.params.section.toLowerCase();
    const products = await Product.find({ section });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET PRODUCTS BY VENDOR
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


// ✅ GET PRODUCTS BY CATEGORY
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ SEARCH PRODUCTS  🔥 (IMPORTANT: id se upar hona chahiye)
router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) return res.json([]);

    const products = await Product.find({
      title: { $regex: keyword, $options: "i" },
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Search Error" });
  }
});


// ✅ GET PRODUCT BY ID  ⚠️ ALWAYS LAST
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
router.put("/:id", async (req, res) => {
  try {
    const { title, price, description } = req.body;

    const titleWordCount = title?.trim().split(/\s+/).length;
    if (!title || titleWordCount < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must contain at least 3 words",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

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

export default router;
