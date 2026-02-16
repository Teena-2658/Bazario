import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    qty: Number,
    address: Object,
    paymentMethod: String,
    status: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
