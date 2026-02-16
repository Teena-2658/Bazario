import dotenv from "dotenv";
dotenv.config();   // MUST be first

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();


// ✅ CORS FIX (IMPORTANT)
app.use(
  cors({
    origin: [
      "http://localhost:5173",   // local frontend
      "https://bazario-ruddy.vercel.app" // deployed frontend
    ],
    credentials: true,
  })
);

// middleware
app.use(express.json());


// routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));


// test route (optional but useful)
app.get("/", (req, res) => {
  res.send("Bazario API Running 🚀");
});


// server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
