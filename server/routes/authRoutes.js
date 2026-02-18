import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();


// =========================
// 🔐 SIGNUP
// =========================
router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[a-z][^\s@]*@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email must start with lowercase letter and be valid",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
      });
    }

    if (role !== "customer" && role !== "vendor") {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Signup successful",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});



// =========================
// 🔐 LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // ✅ Trim & Normalize
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // 1️⃣ Empty validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Email format validation (same as signup)
    const emailRegex = /^[a-z][^\s@]*@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 3️⃣ Find user (lowercase email already ensured)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret missing",
      });
    }

    // 5️⃣ Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
