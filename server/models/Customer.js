// models/Customer.js   (ya Profile.js agar shared banana ho)
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // same ID as User
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    image: { type: String }, // profile photo URL
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;