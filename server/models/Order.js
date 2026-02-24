import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  qty: Number,
  address: String,
  paymentMethod: String,
  status: String,

  // 👇 ADD THIS
  stripeSessionId: {
    type: String,
  },
});

export default mongoose.model("Order", orderSchema);
