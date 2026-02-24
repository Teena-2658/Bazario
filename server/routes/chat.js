import dotenv from "dotenv";
dotenv.config();   // MUST be first
import express from "express";
import Groq from "groq-sdk";
import Product from "../models/Product.js";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // ===== 1️⃣ INTENT EXTRACTION =====
    const aiResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Extract structured data from user query.

Return JSON only:

{
  "intent": "product_info | category_list | section_list",
  "product_name": "",
  "category": "",
  "section": "",
  "fields": []
}

Fields can include: price, description
Return ONLY JSON.
`
        },
        { role: "user", content: message }
      ]
    });

    let data;

    try {
      data = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      return res.json({ reply: "Sorry, I couldn't understand that." });
    }

    console.log("AI DATA:", data);

    // ===== 2️⃣ PRODUCT INFO SEARCH (SMART WORD MATCH) =====
    if (data.intent === "product_info" && data.product_name) {

      const words = data.product_name
        .toLowerCase()
        .split(" ")
        .filter(w => w.length > 1);

      const product = await Product.findOne({
        $and: words.map(word => ({
          title: { $regex: word, $options: "i" }
        }))
      });

      if (!product) {
        return res.json({ reply: "No product found." });
      }

      let reply = `Product: ${product.title}\n`;

      if (data.fields.includes("price")) {
        reply += `Price: ₹${product.price}\n`;
      }

      if (data.fields.includes("description")) {
        reply += `Description: ${product.description}\n`;
      }

      // If user didn’t specify fields
      if (data.fields.length === 0) {
        reply += `Price: ₹${product.price}\n`;
      }

      return res.json({ reply });
    }

    // ===== 3️⃣ CATEGORY LIST =====
    if (data.intent === "category_list" && data.category) {

      const products = await Product.find({
        category: { $regex: data.category, $options: "i" }
      });

      if (!products.length) {
        return res.json({ reply: "No products found in this category." });
      }

      let reply = `Products in ${data.category}:\n`;

      products.slice(0, 5).forEach(p => {
        reply += `• ${p.title} - ₹${p.price}\n`;
      });

      return res.json({ reply });
    }

    // ===== 4️⃣ SECTION LIST =====
    if (data.intent === "section_list" && data.section) {

      const products = await Product.find({
        section: { $regex: data.section, $options: "i" }
      });

      if (!products.length) {
        return res.json({ reply: "No products found in this section." });
      }

      let reply = `Products in ${data.section} section:\n`;

      products.slice(0, 5).forEach(p => {
        reply += `• ${p.title} - ₹${p.price}\n`;
      });

      return res.json({ reply });
    }

    // ===== 5️⃣ FALLBACK SEARCH =====
    const fallback = await Product.find({
      $or: [
        { title: { $regex: message, $options: "i" } },
        { category: { $regex: message, $options: "i" } },
        { description: { $regex: message, $options: "i" } }
      ]
    });

    if (fallback.length) {
      let reply = "Here are some matching products:\n";
      fallback.slice(0, 5).forEach(p => {
        reply += `• ${p.title} - ₹${p.price}\n`;
      });
      return res.json({ reply });
    }

    return res.json({ reply: "Sorry, no products found." });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
