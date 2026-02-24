// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token है या नहीं चेक
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] No Bearer token found in header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Received token (first 20 chars):", token.substring(0, 20));

    // Token verify करो
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[AUTH] Token decoded successfully:", decoded);

    // User ढूंढो (अगर तुम सिर्फ id चाहते हो तो ये optional है)
    const user = await User.findById(decoded.id || decoded._id).select("-password");
    if (!user) {
      console.log("[AUTH] User not found for ID:", decoded.id || decoded._id);
      return res.status(401).json({ message: "User not found" });
    }

    // req.user में पूरा user या सिर्फ _id डालो
    req.user = user;                     // पूरा user object (recommended)
    // या req.user = { _id: user._id };  // सिर्फ id

    console.log("[AUTH] User attached to req.user:", req.user._id);

    next();
  } catch (err) {
    console.error("[AUTH ERROR]", err.name, err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export default authMiddleware;